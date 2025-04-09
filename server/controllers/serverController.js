const Server = require('../models/Server');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const dockerService = require('../services/dockerService');
const fs = require('fs').promises;
const path = require('path');

// @desc    Obtener todos los servidores del usuario
// @route   GET /api/servers
// @access  Private
exports.getServers = asyncHandler(async (req, res, next) => {
  const servers = await Server.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    count: servers.length,
    data: servers
  });
});

// @desc    Obtener un servidor por ID
// @route   GET /api/servers/:id
// @access  Private
exports.getServer = asyncHandler(async (req, res, next) => {
  const server = await Server.findById(req.params.id);

  if (!server) {
    return next(new ErrorResponse(`Servidor no encontrado con ID ${req.params.id}`, 404));
  }

  // Asegurarse de que el usuario es el propietario
  if (server.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('No autorizado para acceder a este servidor', 403));
  }

  res.status(200).json({
    success: true,
    data: server
  });
});

// @desc    Crear nuevo servidor
// @route   POST /api/servers
// @access  Private
exports.createServer = asyncHandler(async (req, res, next) => {
  // Añadir el usuario al body
  req.body.user = req.user.id;

  // Verificar límite de servidores del usuario
  const user = await User.findById(req.user.id);
  const userServers = await Server.find({ user: req.user.id });

  if (userServers.length >= user.resources.maxServers && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Has alcanzado el límite de servidores para tu plan`, 400));
  }

  // Validar y establecer recursos según el plan del usuario
  const { ram, cpu, storage } = req.body.resources || {};
  
  if (ram && ram > user.resources.ram && req.user.role !== 'admin') {
    return next(new ErrorResponse(`No puedes asignar más RAM de la disponible en tu plan (${user.resources.ram}MB)`, 400));
  }
  
  if (cpu && cpu > user.resources.cpu && req.user.role !== 'admin') {
    return next(new ErrorResponse(`No puedes asignar más CPU de la disponible en tu plan (${user.resources.cpu} cores)`, 400));
  }
  
  if (storage && storage > user.resources.storage && req.user.role !== 'admin') {
    return next(new ErrorResponse(`No puedes asignar más almacenamiento del disponible en tu plan (${user.resources.storage}GB)`, 400));
  }

  // Crear el servidor
  const server = await Server.create(req.body);

  // Crear directorio del servidor
  const serverPath = path.join(process.env.SERVER_DATA_PATH, server._id.toString());
  await fs.mkdir(serverPath, { recursive: true });

  // Preparar para provisionar el servidor
  try {
    // Iniciar la provisión del servidor en Docker (asíncrono)
    dockerService.provisionServer(server)
      .then(async (result) => {
        // Actualizar el servidor con la información del contenedor
        server.containerId = result.containerId;
        server.network.ip = result.ip;
        server.status = 'stopped';
        await server.save();
      })
      .catch(async (error) => {
        console.error('Error al provisionar el servidor:', error);
        server.status = 'error';
        await server.save();
      });

    res.status(201).json({
      success: true,
      data: server
    });
  } catch (err) {
    // En caso de error, manejar la limpieza
    await fs.rmdir(serverPath, { recursive: true });
    return next(new ErrorResponse('Error al crear el servidor', 500));
  }
});

// @desc    Actualizar servidor
// @route   PUT /api/servers/:id
// @access  Private
exports.updateServer = asyncHandler(async (req, res, next) => {
  let server = await Server.findById(req.params.id);

  if (!server) {
    return next(new ErrorResponse(`Servidor no encontrado con ID ${req.params.id}`, 404));
  }

  // Asegurarse de que el usuario es el propietario
  if (server.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('No autorizado para actualizar este servidor', 403));
  }

  // Validar cambios en recursos
  if (req.body.resources) {
    const user = await User.findById(req.user.id);
    
    if (req.body.resources.ram > user.resources.ram && req.user.role !== 'admin') {
      return next(new ErrorResponse(`No puedes asignar más RAM de la disponible en tu plan (${user.resources.ram}MB)`, 400));
    }
    
    if (req.body.resources.cpu > user.resources.cpu && req.user.role !== 'admin') {
      return next(new ErrorResponse(`No puedes asignar más CPU de la disponible en tu plan (${user.resources.cpu} cores)`, 400));
    }
    
    if (req.body.resources.storage > user.resources.storage && req.user.role !== 'admin') {
      return next(new ErrorResponse(`No puedes asignar más almacenamiento del disponible en tu plan (${user.resources.storage}GB)`, 400));
    }

    // Verificar si el servidor está en ejecución y requiere reinicio
    if (server.status === 'running') {
      // Marcar que el servidor necesita reinicio
      req.body.needsRestart = true;
    }
  }

  // Actualizar el servidor
  server = await Server.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Si se cambió la configuración y el servidor está en ejecución, aplicar los cambios
  if (req.body.needsRestart && server.status === 'running') {
    try {
      await dockerService.restartServer(server);
    } catch (error) {
      console.error('Error al reiniciar el servidor tras actualización:', error);
      // No fallamos la petición por esto, solo logueamos el error
    }
  }

  res.status(200).json({
    success: true,
    data: server
  });
});

// @desc    Eliminar servidor
// @route   DELETE /api/servers/:id
// @access  Private
exports.deleteServer = asyncHandler(async (req, res, next) => {
  const server = await Server.findById(req.params.id);

  if (!server) {
    return next(new ErrorResponse(`Servidor no encontrado con ID ${req.params.id}`, 404));
  }

  // Asegurarse de que el usuario es el propietario
  if (server.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('No autorizado para eliminar este servidor', 403));
  }

  // Detener y eliminar el contenedor si existe
  if (server.containerId) {
    try {
      await dockerService.removeServer(server);
    } catch (error) {
      console.error('Error al eliminar contenedor:', error);
      // Continuamos con la eliminación del servidor de la base de datos
    }
  }

  // Eliminar los archivos del servidor
  const serverPath = path.join(process.env.SERVER_DATA_PATH, server._id.toString());
  try {
    await fs.rmdir(serverPath, { recursive: true });
  } catch (error) {
    console.error('Error al eliminar directorio del servidor:', error);
    // Continuamos con la eliminación del servidor de la base de datos
  }

  // Eliminar el servidor de la base de datos
  await server.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Iniciar servidor
// @route   PUT /api/servers/:id/start
// @access  Private
exports.startServer = asyncHandler(async (req, res, next) => {
  const server = await Server.findById(req.params.id);

  if (!server) {
    return next(new ErrorResponse(`Servidor no encontrado con ID ${req.params.id}`, 404));
  }

  // Asegurarse de que el usuario es el propietario
  if (server.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('No autorizado para iniciar este servidor', 403));
  }

  // Verificar si el servidor ya está en ejecución
  if (server.status === 'running') {
    return next(new ErrorResponse('El servidor ya está en ejecución', 400));
  }

  // Verificar si el servidor está en un estado que permite iniciarlo
  if (server.status !== 'stopped') {
    return next(new ErrorResponse(`No se puede iniciar el servidor en estado "${server.status}"`, 400));
  }

  try {
    // Actualizar estado a 'starting'
    server.status = 'starting';
    await server.save();

    // Iniciar el servidor en Docker (asíncrono)
    dockerService.startServer(server)
      .then(async () => {
        server.status = 'running';
        server.lastStarted = Date.now();
        await server.save();
      })
      .catch(async (error) => {
        console.error('Error al iniciar el servidor:', error);
        server.status = 'error';
        await server.save();
      });

    res.status(200).json({
      success: true,
      data: server
    });
  } catch (err) {
    server.status = 'error';
    await server.save();
    return next(new ErrorResponse('Error al iniciar el servidor', 500));
  }
});

// @desc    Detener servidor
// @route   PUT /api/servers/:id/stop
// @access  Private
exports.stopServer = asyncHandler(async (req, res, next) => {
  const server = await Server.findById(req.params.id);

  if (!server) {
    return next(new ErrorResponse(`Servidor no encontrado con ID ${req.params.id}`, 404));
  }

  // Asegurarse de que el usuario es el propietario
  if (server.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('No autorizado para detener este servidor', 403));
  }

  // Verificar si el servidor ya está detenido
  if (server.status === 'stopped') {
    return next(new ErrorResponse('El servidor ya está detenido', 400));
  }

  // Verificar si el servidor está en un estado que permite detenerlo
  if (server.status !== 'running') {
    return next(new ErrorResponse(`No se puede detener el servidor en estado "${server.status}"`, 400));
  }

  try {
    // Actualizar estado a 'stopping'
    server.status = 'stopping';
    await server.save();

    // Detener el servidor en Docker (asíncrono)
    dockerService.stopServer(server)
      .then(async () => {
        server.status = 'stopped';
        server.lastStopped = Date.now();
        await server.save();
      })
      .catch(async (error) => {
        console.error('Error al detener el servidor:', error);
        server.status = 'error';
        await server.save();
      });

    res.status(200).json({
      success: true,
      data: server
    });
  } catch (err) {
    server.status = 'error';
    await server.save();
    return next(new ErrorResponse('Error al detener el servidor', 500));
  }
});

// @desc    Reiniciar servidor
// @route   PUT /api/servers/:id/restart
// @access  Private
exports.restartServer = asyncHandler(async (req, res, next) => {
  const server = await Server.findById(req.params.id);

  if (!server) {
    return next(new ErrorResponse(`Servidor no encontrado con ID ${req.params.id}`, 404));
  }

  // Asegurarse de que el usuario es el propietario
  if (server.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('No autorizado para reiniciar este servidor', 403));
  }

  // Verificar si el servidor está en ejecución
  if (server.status !== 'running') {
    return next(new ErrorResponse('El servidor debe estar en ejecución para reiniciarlo', 400));
  }

  try {
    // Actualizar estado a 'stopping' (temporalmente)
    server.status = 'stopping';
    await server.save();

    // Reiniciar el servidor en Docker (asíncrono)
    dockerService.restartServer(server)
      .then(async () => {
        server.status = 'running';
        server.lastStarted = Date.now();
        await server.save();
      })
      .catch(async (error) => {
        console.error('Error al reiniciar el servidor:', error);
        server.status = 'error';
        await server.save();
      });

    res.status(200).json({
      success: true,
      data: server
    });
  } catch (err) {
    server.status = 'error';
    await server.save();
    return next(new ErrorResponse('Error al reiniciar el servidor', 500));
  }
});

// @desc    Obtener versiones disponibles de Minecraft
// @route   GET /api/servers/versions
// @access  Private
exports.getMinecraftVersions = asyncHandler(async (req, res, next) => {
  // Lista de versiones disponibles
  // Esto podría venir de un archivo de configuración o una API externa
  const javaVersions = [
    { id: 'paper-1.20.1', name: 'Paper 1.20.1', type: 'java' },
    { id: 'paper-1.19.4', name: 'Paper 1.19.4', type: 'java' },
    { id: 'paper-1.18.2', name: 'Paper 1.18.2', type: 'java' },
    { id: 'paper-1.17.1', name: 'Paper 1.17.1', type: 'java' },
    { id: 'paper-1.16.5', name: 'Paper 1.16.5', type: 'java' }
  ];
  
  const bedrockVersions = [
    { id: 'bedrock-1.20.10', name: 'Bedrock 1.20.10', type: 'bedrock' },
    { id: 'bedrock-1.19.80', name: 'Bedrock 1.19.80', type: 'bedrock' },
    { id: 'bedrock-1.18.33', name: 'Bedrock 1.18.33', type: 'bedrock' },
    { id: 'bedrock-1.17.41', name: 'Bedrock 1.17.41', type: 'bedrock' }
  ];

  res.status(200).json({
    success: true,
    data: {
      java: javaVersions,
      bedrock: bedrockVersions,
      all: [...javaVersions, ...bedrockVersions]
    }
  });
});

// @desc    Obtener logs del servidor
// @route   GET /api/servers/:id/logs
// @access  Private
exports.getServerLogs = asyncHandler(async (req, res, next) => {
  const server = await Server.findById(req.params.id);

  if (!server) {
    return next(new ErrorResponse(`Servidor no encontrado con ID ${req.params.id}`, 404));
  }

  // Asegurarse de que el usuario es el propietario
  if (server.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('No autorizado para ver los logs de este servidor', 403));
  }

  try {
    const logs = await dockerService.getServerLogs(server);
    
    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (err) {
    return next(new ErrorResponse(`Error al obtener logs: ${err.message}`, 500));
  }
});

// @desc    Ejecutar comando en el servidor
// @route   POST /api/servers/:id/command
// @access  Private
exports.executeCommand = asyncHandler(async (req, res, next) => {
  const { command } = req.body;
  const server = await Server.findById(req.params.id);

  if (!server) {
    return next(new ErrorResponse(`Servidor no encontrado con ID ${req.params.id}`, 404));
  }

  // Asegurarse de que el usuario es el propietario
  if (server.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('No autorizado para ejecutar comandos en este servidor', 403));
  }

  // Verificar que el servidor está en ejecución
  if (server.status !== 'running') {
    return next(new ErrorResponse('El servidor debe estar en ejecución para ejecutar comandos', 400));
  }

  if (!command) {
    return next(new ErrorResponse('Por favor proporciona un comando para ejecutar', 400));
  }

  try {
    const result = await dockerService.executeCommand(server, command);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    return next(new ErrorResponse(`Error al ejecutar comando: ${err.message}`, 500));
  }
});

// @desc    Obtener estadísticas del servidor
// @route   GET /api/servers/:id/stats
// @access  Private
exports.getServerStats = asyncHandler(async (req, res, next) => {
  const server = await Server.findById(req.params.id);

  if (!server) {
    return next(new ErrorResponse(`Servidor no encontrado con ID ${req.params.id}`, 404));
  }

  // Asegurarse de que el usuario es el propietario
  if (server.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('No autorizado para ver estadísticas de este servidor', 403));
  }

  // Solo obtener stats si el servidor está en ejecución
  if (server.status !== 'running') {
    return res.status(200).json({
      success: true,
      data: {
        status: server.status,
        running: false
      }
    });
  }

  try {
    // Aquí obtendremos las estadísticas del contenedor
    // Simulamos algunas estadísticas básicas por ahora
    const stats = {
      status: server.status,
      running: true,
      uptime: Math.floor((Date.now() - server.lastStarted) / 1000),
      cpu: {
        usage: Math.floor(Math.random() * 100)
      },
      memory: {
        used: Math.floor(Math.random() * server.resources.ram),
        total: server.resources.ram
      },
      players: {
        online: Math.floor(Math.random() * 10),
        max: 20
      }
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    return next(new ErrorResponse(`Error al obtener estadísticas: ${err.message}`, 500));
  }
});