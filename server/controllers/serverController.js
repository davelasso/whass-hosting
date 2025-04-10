const Server = require('../models/Server');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const dockerService = require('../services/dockerService');
const fs = require('fs').promises;
const path = require('path');

/**
 * Controlador de servidores
 */

// Lista de versiones disponibles de Minecraft
const minecraftVersions = [
  // Versiones Java
  { id: 'java-1.16.5', name: 'Java 1.16.5', type: 'java' },
  { id: 'java-1.17.1', name: 'Java 1.17.1', type: 'java' },
  { id: 'java-1.18.2', name: 'Java 1.18.2', type: 'java' },
  { id: 'java-1.19.4', name: 'Java 1.19.4', type: 'java' },
  { id: 'java-1.20.1', name: 'Java 1.20.1', type: 'java' },
  { id: 'java-1.20.2', name: 'Java 1.20.2', type: 'java' },
  { id: 'java-1.20.4', name: 'Java 1.20.4', type: 'java' },
  { id: 'java-1.21.0', name: 'Java 1.21.0', type: 'java' },
  
  // Versiones Bedrock
  { id: 'bedrock-1.16.220', name: 'Bedrock 1.16.220', type: 'bedrock' },
  { id: 'bedrock-1.17.41', name: 'Bedrock 1.17.41', type: 'bedrock' },
  { id: 'bedrock-1.18.31', name: 'Bedrock 1.18.31', type: 'bedrock' },
  { id: 'bedrock-1.19.51', name: 'Bedrock 1.19.51', type: 'bedrock' },
  { id: 'bedrock-1.20.0', name: 'Bedrock 1.20.0', type: 'bedrock' },
  { id: 'bedrock-1.20.10', name: 'Bedrock 1.20.10', type: 'bedrock' },
  { id: 'bedrock-1.20.30', name: 'Bedrock 1.20.30', type: 'bedrock' },
  { id: 'bedrock-1.20.40', name: 'Bedrock 1.20.40', type: 'bedrock' },
  { id: 'bedrock-1.20.50', name: 'Bedrock 1.20.50', type: 'bedrock' },
  { id: 'bedrock-1.20.60', name: 'Bedrock 1.20.60', type: 'bedrock' },
  { id: 'bedrock-1.20.70', name: 'Bedrock 1.20.70', type: 'bedrock' },
  { id: 'bedrock-1.21.0', name: 'Bedrock 1.21.0', type: 'bedrock' }
];

// Planes de hosting disponibles
const hostingPlans = [
  // Planes de hosting Java
  {
    id: 'sandstone-java',
    name: 'Plan Sandstone',
    type: 'java',
    price: 1.50,
    currency: 'USD',
    interval: 'monthly',
    featured: false,
    resources: {
      cpu: 1,
      ram: 1024,
      storage: 10,
      bandwidth: 'Ilimitado',
      backups: 3,
      processor: 'Ryzen 5 5600X'
    },
    features: [
      'Panel de control intuitivo',
      'SSD NVMe',
      'Instalación en 1 click',
      'Protección DDoS',
      'Soporte técnico 24/7',
      'Baja latencia'
    ],
    location: 'Miami, Florida'
  },
  {
    id: 'stone-java',
    name: 'Plan Stone',
    type: 'java',
    price: 3.00,
    currency: 'USD',
    interval: 'monthly',
    featured: false,
    resources: {
      cpu: 1,
      ram: 2048,
      storage: 10,
      bandwidth: 'Ilimitado',
      backups: 3,
      processor: 'Ryzen 5 5600X'
    },
    features: [
      'Panel de control intuitivo',
      'SSD NVMe',
      'Instalación en 1 click',
      'Protección DDoS',
      'Soporte técnico 24/7',
      'Baja latencia'
    ],
    location: 'Miami, Florida'
  },
  {
    id: 'lapis-java',
    name: 'Plan Lapislázuli',
    type: 'java',
    price: 4.50,
    currency: 'USD',
    interval: 'monthly',
    featured: false,
    resources: {
      cpu: 2,
      ram: 3072,
      storage: 20,
      bandwidth: 'Ilimitado',
      backups: 3,
      processor: 'Ryzen 5 5600X'
    },
    features: [
      'Panel de control intuitivo',
      'SSD NVMe',
      'Instalación en 1 click',
      'Protección DDoS',
      'Soporte técnico 24/7',
      'Baja latencia'
    ],
    location: 'Miami, Florida'
  },
  {
    id: 'iron-java',
    name: 'Plan Hierro',
    type: 'java',
    price: 6.00,
    currency: 'USD',
    interval: 'monthly',
    featured: true,
    resources: {
      cpu: 2,
      ram: 4096,
      storage: 20,
      bandwidth: 'Ilimitado',
      backups: 3,
      processor: 'Ryzen 5 5600X'
    },
    features: [
      'Panel de control intuitivo',
      'SSD NVMe',
      'Instalación en 1 click',
      'Protección DDoS',
      'Soporte técnico 24/7',
      'Baja latencia'
    ],
    location: 'Miami, Florida'
  },
  // Planes de hosting Bedrock
  {
    id: 'sandstone-bedrock',
    name: 'Plan Sandstone',
    type: 'bedrock',
    price: 2.00,
    currency: 'USD',
    interval: 'monthly',
    featured: false,
    resources: {
      cpu: 1,
      ram: 1024,
      storage: 10,
      bandwidth: 'Ilimitado',
      backups: 3,
      processor: 'Ryzen 5 5600X'
    },
    features: [
      'Panel de control intuitivo',
      'SSD NVMe',
      'Cross-play multiplataforma',
      'Instalación en 1 click',
      'Protección DDoS',
      'Soporte técnico 24/7',
      'Baja latencia'
    ],
    location: 'Miami, Florida'
  },
  {
    id: 'stone-bedrock',
    name: 'Plan Stone',
    type: 'bedrock',
    price: 3.50,
    currency: 'USD',
    interval: 'monthly',
    featured: false,
    resources: {
      cpu: 1,
      ram: 2048,
      storage: 10,
      bandwidth: 'Ilimitado',
      backups: 3,
      processor: 'Ryzen 5 5600X'
    },
    features: [
      'Panel de control intuitivo',
      'SSD NVMe',
      'Cross-play multiplataforma',
      'Instalación en 1 click',
      'Protección DDoS',
      'Soporte técnico 24/7',
      'Baja latencia'
    ],
    location: 'Miami, Florida'
  },
  {
    id: 'lapis-bedrock',
    name: 'Plan Lapislázuli',
    type: 'bedrock',
    price: 5.00,
    currency: 'USD',
    interval: 'monthly',
    featured: false,
    resources: {
      cpu: 2,
      ram: 3072,
      storage: 20,
      bandwidth: 'Ilimitado',
      backups: 3,
      processor: 'Ryzen 5 5600X'
    },
    features: [
      'Panel de control intuitivo',
      'SSD NVMe',
      'Cross-play multiplataforma',
      'Red personalizada',
      'Instalación en 1 click',
      'Protección DDoS',
      'Soporte técnico 24/7',
      'Baja latencia'
    ],
    location: 'Miami, Florida'
  },
  {
    id: 'iron-bedrock',
    name: 'Plan Hierro',
    type: 'bedrock',
    price: 6.50,
    currency: 'USD',
    interval: 'monthly',
    featured: true,
    resources: {
      cpu: 2,
      ram: 4096,
      storage: 20,
      bandwidth: 'Ilimitado',
      backups: 3,
      processor: 'Ryzen 5 5600X'
    },
    features: [
      'Panel de control intuitivo',
      'SSD NVMe',
      'Cross-play multiplataforma',
      'Red personalizada',
      'Instalación en 1 click',
      'Protección DDoS',
      'Soporte técnico 24/7',
      'Baja latencia'
    ],
    location: 'Miami, Florida'
  }
];

// Servidor de ejemplo
const demoServers = [
  {
    id: 'server-123',
    name: 'Mi Servidor Java Demo',
    status: 'running',
    type: 'minecraft',
    serverType: 'java',
    version: 'java-1.20.4',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    cpu: 2,
    memory: 4096,
    storage: 20,
    port: 25565,
    ipAddress: '123.45.67.89',
    players: {
      online: 3,
      max: 20
    },
    properties: {
      difficulty: 'normal',
      gamemode: 'survival',
      pvp: true,
      seed: '12345678',
      viewDistance: 10
    }
  },
  {
    id: 'server-456',
    name: 'Mi Servidor Bedrock Demo',
    status: 'running',
    type: 'minecraft',
    serverType: 'bedrock',
    version: 'bedrock-1.21.0',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    cpu: 2,
    memory: 3072,
    storage: 15,
    port: 19132,
    ipAddress: '123.45.67.90',
    players: {
      online: 2,
      max: 10
    },
    properties: {
      difficulty: 'easy',
      gamemode: 'survival',
      pvp: true,
      seed: '87654321',
      viewDistance: 8
    }
  }
];

// Tipos de servidores disponibles
const serverTypes = [
  { id: 'java', name: 'Minecraft Java Edition', description: 'Versión original para PC con mayor flexibilidad para mods y plugins.' },
  { id: 'bedrock', name: 'Minecraft Bedrock Edition', description: 'Versión multiplataforma que permite jugar desde PC, móviles y consolas.' }
];

// Obtener tipos de servidores disponibles
exports.getServerTypes = (req, res) => {
    res.status(200).json({
      success: true,
    count: serverTypes.length,
    data: serverTypes
  });
};

// Obtener versiones disponibles
exports.getMinecraftVersions = (req, res) => {
  const { type } = req.query;
  
  let versions = [...minecraftVersions];
  
  // Filtrar por tipo si se proporciona
  if (type === 'java' || type === 'bedrock') {
    versions = versions.filter(version => version.type === type);
  }
  
  res.status(200).json({
    success: true,
    count: versions.length,
    data: versions
  });
};

// Obtener planes de hosting
exports.getHostingPlans = (req, res) => {
  const { type } = req.query;
  
  let plans = [...hostingPlans];
  
  // Filtrar por tipo si se proporciona
  if (type === 'java' || type === 'bedrock') {
    plans = plans.filter(plan => plan.type === type);
  }
  
  res.status(200).json({
    success: true,
    count: plans.length,
    data: plans
  });
};

// Obtener todos los servidores
exports.getServers = (req, res) => {
  res.status(200).json({
      success: true,
    count: demoServers.length,
    data: demoServers
  });
};

// Obtener un servidor
exports.getServer = (req, res) => {
  const { id } = req.params;
  
  const server = demoServers.find(s => s.id === id) || {
    id,
    name: 'Servidor ' + id,
    status: 'stopped',
    type: 'minecraft',
    serverType: 'java',
    version: 'java-1.20.4',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    cpu: 2,
    memory: 4096,
    storage: 20,
    port: 25565,
    ipAddress: '123.45.67.89',
    players: {
      online: 0,
      max: 20
    },
    properties: {
      difficulty: 'normal',
      gamemode: 'survival',
      pvp: true,
      seed: '98765432',
      viewDistance: 10
    }
  };
  
  res.status(200).json({
    success: true,
    data: server
  });
};

// Crear un servidor
exports.createServer = (req, res) => {
  const { name, version, memory, storage, type, plan, customIp } = req.body;
  
  // Determinar tipo de servidor basado en la versión
  const serverType = type || (version && version.includes('bedrock') ? 'bedrock' : 'java');
  
  // Determinar la versión por defecto según el tipo
  let defaultVersion = serverType === 'bedrock' ? 'bedrock-1.21.0' : 'java-1.20.4';
  
  // Determinar puerto según el tipo de servidor
  let defaultPort = serverType === 'bedrock' ? 19132 : 25565;
  
  // Generar IP y puerto aleatorios para servidores gratuitos o estándar
  // Para planes premium, se puede usar una IP personalizada
  const isPremiumPlan = plan === 'premium' || plan === 'business';
  
  // Generar un rango de IP aleatorio para servidores no premium
  const randomIPSegment = Math.floor(Math.random() * 200) + 10;
  const baseIp = isPremiumPlan && customIp ? customIp : `123.45.67.${randomIPSegment}`;
  
  // Generar puerto aleatorio para servidores no premium
  const randomPortOffset = Math.floor(Math.random() * 1000);
  const serverPort = isPremiumPlan && req.body.customPort ? 
    req.body.customPort : 
    defaultPort + randomPortOffset;
  
  const newServer = {
    id: 'server-' + Date.now().toString().slice(-6),
    name: name || 'Nuevo Servidor',
    status: 'creating',
    type: 'minecraft',
    serverType: serverType,
    version: version || defaultVersion,
    plan: plan || 'free',
    createdAt: new Date(),
    updatedAt: new Date(),
    cpu: req.body.cpu || 2,
    memory: memory || 4096,
    storage: storage || 20,
    port: serverPort,
    ipAddress: baseIp,
    hasCustomIp: isPremiumPlan && customIp ? true : false,
    domain: isPremiumPlan && req.body.domain ? req.body.domain : null,
    players: {
      online: 0,
      max: req.body.maxPlayers || 20
    },
    properties: req.body.properties || {
      difficulty: 'normal',
      gamemode: 'survival',
      pvp: true,
      seed: Math.floor(Math.random() * 100000000).toString(),
      viewDistance: 10
    }
  };
  
  demoServers.push(newServer);
  
  res.status(201).json({
      success: true,
    message: 'Servidor creado exitosamente',
    data: newServer
  });
};

// Actualizar un servidor
exports.updateServer = (req, res) => {
  const { id } = req.params;
  const { name, memory, properties, version, serverType } = req.body;
  
  // Buscar si el servidor existe en nuestra lista
  const existingServer = demoServers.find(s => s.id === id);
  
  const server = {
    id,
    name: name || (existingServer ? existingServer.name : 'Servidor Actualizado'),
    status: 'running',
    type: 'minecraft',
    serverType: serverType || (existingServer ? existingServer.serverType : 'java'),
    version: version || (existingServer ? existingServer.version : 'java-1.20.4'),
    updatedAt: new Date(),
    cpu: 2,
    memory: memory || 4096,
    storage: 20,
    port: existingServer ? (existingServer.serverType === 'bedrock' ? 19132 : 25565) : 25565,
    ipAddress: existingServer ? existingServer.ipAddress : '123.45.67.89',
    players: {
      online: 3,
      max: 20
    },
    properties: properties || {
      difficulty: 'normal',
      gamemode: 'survival',
      pvp: true,
      seed: '12345678',
      viewDistance: 10
    }
  };
  
  // Actualizar en nuestra lista de demoServers si existe
  if (existingServer) {
    const index = demoServers.indexOf(existingServer);
    demoServers[index] = { ...existingServer, ...server };
  }
  
  res.status(200).json({
    success: true,
    message: 'Servidor actualizado exitosamente',
    data: server
  });
};

// Eliminar un servidor
exports.deleteServer = (req, res) => {
  const { id } = req.params;

    res.status(200).json({
      success: true,
    message: 'Servidor eliminado exitosamente',
      data: {}
    });
};

// Iniciar un servidor
exports.startServer = (req, res) => {
  const { id } = req.params;
  
  res.status(200).json({
    success: true,
    message: 'Servidor iniciado exitosamente',
    data: {
      id,
      status: 'starting',
      updatedAt: new Date()
    }
  });
};

// Detener un servidor
exports.stopServer = (req, res) => {
  const { id } = req.params;
  
  res.status(200).json({
    success: true,
    message: 'Servidor detenido exitosamente',
    data: {
      id,
      status: 'stopping',
      updatedAt: new Date()
    }
  });
};

// Reiniciar un servidor
exports.restartServer = (req, res) => {
  const { id } = req.params;
  
  res.status(200).json({
    success: true,
    message: 'Servidor reiniciado exitosamente',
    data: {
      id,
      status: 'restarting',
      updatedAt: new Date()
    }
  });
};

// Obtener logs de la consola
exports.getConsoleLogs = (req, res) => {
  const { id } = req.params;
  
  const logs = [
    { timestamp: new Date(Date.now() - 300000), level: 'INFO', message: 'Servidor iniciado correctamente' },
    { timestamp: new Date(Date.now() - 240000), level: 'INFO', message: 'Cargando mundo...' },
    { timestamp: new Date(Date.now() - 180000), level: 'INFO', message: 'Mundo cargado en 3.5s' },
    { timestamp: new Date(Date.now() - 120000), level: 'INFO', message: 'Usuario1 se ha conectado' },
    { timestamp: new Date(Date.now() - 60000), level: 'INFO', message: 'Usuario2 se ha conectado' },
    { timestamp: new Date(Date.now() - 30000), level: 'INFO', message: 'Usuario3 se ha conectado' },
    { timestamp: new Date(), level: 'INFO', message: 'Servidor funcionando correctamente' }
  ];

      res.status(200).json({
        success: true,
    count: logs.length,
    data: logs
  });
};

// Ejecutar comando en la consola (versión temporal)
exports.executeCommandTemp = (req, res) => {
  const { id } = req.params;
  const { command } = req.body;
  
  let response = 'Comando ejecutado exitosamente';
  
  if (command.includes('list')) {
    response = 'Hay 3 de 20 jugadores conectados: Usuario1, Usuario2, Usuario3';
  } else if (command.includes('time')) {
    response = 'Se ha establecido la hora a 1000 ticks';
  } else if (command.includes('weather')) {
    response = 'Se ha cambiado el clima a soleado';
  } else if (command.includes('tp')) {
    response = 'Teletransportado exitosamente';
  } else if (command.includes('give')) {
    response = 'Items entregados al jugador';
  }
  
  res.status(200).json({
    success: true,
    data: {
      id,
      command,
      response,
      timestamp: new Date()
    }
  });
};

// Obtener propiedades del servidor
exports.getServerProperties = (req, res) => {
  const { id } = req.params;
  
  const properties = {
    'server-port': 25565,
    'gamemode': 'survival',
    'difficulty': 'normal',
    'max-players': 20,
    'view-distance': 10,
    'enable-command-block': false,
    'allow-nether': true,
    'allow-flight': false,
    'white-list': false,
    'spawn-animals': true,
    'spawn-monsters': true,
    'spawn-npcs': true,
    'pvp': true,
    'level-seed': '12345678',
    'online-mode': true,
    'motd': 'Servidor Minecraft Demo'
  };
  
  res.status(200).json({
    success: true,
    data: properties
  });
};

// Actualizar propiedades del servidor
exports.updateServerProperties = (req, res) => {
  const { id } = req.params;
  const properties = req.body;
  
  res.status(200).json({
    success: true,
    message: 'Propiedades actualizadas exitosamente',
    data: {
      ...properties,
      updated: new Date()
    }
  });
};

// Obtener mods/plugins del servidor
exports.getServerPlugins = (req, res) => {
  const { id } = req.params;
  
  const plugins = [
    { id: 'essentials', name: 'EssentialsX', version: '2.19.0', enabled: true },
    { id: 'worldedit', name: 'WorldEdit', version: '7.2.10', enabled: true },
    { id: 'luckperms', name: 'LuckPerms', version: '5.4.0', enabled: true },
    { id: 'coreprotect', name: 'CoreProtect', version: '21.2', enabled: true },
    { id: 'dynmap', name: 'Dynmap', version: '3.4', enabled: false }
  ];

      res.status(200).json({
        success: true,
    count: plugins.length,
    data: plugins
  });
};

// Instalar plugin en el servidor
exports.installPlugin = (req, res) => {
  const { id } = req.params;
  const { pluginId, version } = req.body;
  
  res.status(200).json({
          success: true,
    message: 'Plugin instalado exitosamente',
    data: {
      id: pluginId,
      name: pluginId.charAt(0).toUpperCase() + pluginId.slice(1),
      version: version || '1.0.0',
      enabled: true,
      installed: new Date()
    }
  });
};

// Eliminar plugin del servidor
exports.removePlugin = (req, res) => {
  const { id, pluginId } = req.params;
  
  res.status(200).json({
    success: true,
    message: 'Plugin eliminado exitosamente',
    data: {}
  });
};

// Habilitar/deshabilitar plugin
exports.togglePlugin = (req, res) => {
  const { id, pluginId } = req.params;
  const { enabled } = req.body;
  
  res.status(200).json({
    success: true,
    message: `Plugin ${enabled ? 'habilitado' : 'deshabilitado'} exitosamente`,
    data: {
      id: pluginId,
      enabled
    }
  });
};

// Obtener backups del servidor
exports.getServerBackups = (req, res) => {
  const { id } = req.params;
  
  const backups = [
    { id: 'backup-1', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), size: '120MB', type: 'auto' },
    { id: 'backup-2', createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), size: '125MB', type: 'auto' },
    { id: 'backup-3', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), size: '130MB', type: 'auto' },
    { id: 'backup-4', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), size: '135MB', type: 'auto' },
    { id: 'backup-5', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), size: '140MB', type: 'auto' },
    { id: 'backup-6', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), size: '145MB', type: 'manual' },
    { id: 'backup-7', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), size: '150MB', type: 'auto' }
  ];

      res.status(200).json({
        success: true,
    count: backups.length,
    data: backups
  });
};

// Crear backup del servidor
exports.createBackup = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  const backup = {
    id: 'backup-' + Date.now().toString().slice(-6),
    name: name || 'Backup Manual',
    createdAt: new Date(),
    size: Math.floor(100 + Math.random() * 100) + 'MB',
    type: 'manual'
  };
  
  res.status(201).json({
    success: true,
    message: 'Backup creado exitosamente',
    data: backup
  });
};

// Restaurar backup del servidor
exports.restoreBackup = (req, res) => {
  const { id, backupId } = req.params;
  
  res.status(200).json({
    success: true,
    message: 'Backup restaurado exitosamente',
    data: {
      id: backupId,
      restoredAt: new Date(),
      status: 'restored'
    }
  });
};

// Eliminar backup del servidor
exports.deleteBackup = (req, res) => {
  const { id, backupId } = req.params;

      res.status(200).json({
        success: true,
    message: 'Backup eliminado exitosamente',
    data: {}
  });
};

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