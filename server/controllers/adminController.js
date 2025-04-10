/**
 * Controlador para la gestión de funciones administrativas
 */
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Server = require('../models/Server');
const SystemLog = require('../models/SystemLog');
const Backup = require('../models/Backup');
const SubscriptionPlan = require('../models/SubscriptionPlan');

/**
 * @desc    Obtener todos los usuarios
 * @route   GET /api/admin/users
 * @access  Admin
 */
exports.getUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
});

/**
 * @desc    Obtener usuario por ID
 * @route   GET /api/admin/users/:id
 * @access  Admin
 */
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
    return next(new ErrorResponse(`Usuario no encontrado con id ${req.params.id}`, 404));
  }
    
    res.status(200).json({
      success: true,
    data: user
  });
});

/**
 * @desc    Actualizar usuario
 * @route   PUT /api/admin/users/:id
 * @access  Admin
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
    let user = await User.findById(req.params.id);
    
    if (!user) {
    return next(new ErrorResponse(`Usuario no encontrado con id ${req.params.id}`, 404));
  }

  // Prevenir actualización de contraseña por esta ruta
  if (req.body.password) {
    delete req.body.password;
  }

  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).select('-password');
    
    res.status(200).json({
      success: true,
      data: user
    });
});

/**
 * @desc    Eliminar usuario
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`Usuario no encontrado con id ${req.params.id}`, 404));
  }

  // Verificar si el usuario tiene servidores
  const servers = await Server.find({ user: req.params.id });

  if (servers.length > 0) {
    return next(new ErrorResponse('No se puede eliminar el usuario porque tiene servidores activos', 400));
  }

  await user.remove();
    
    res.status(200).json({
      success: true,
    data: {}
  });
});

/**
 * @desc    Obtener estadísticas del sistema
 * @route   GET /api/admin/stats
 * @access  Admin
 */
exports.getSystemStats = asyncHandler(async (req, res, next) => {
  // Obtener estadísticas de usuarios
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const premiumUsers = await User.countDocuments({ plan: { $in: ['premium', 'enterprise'] } });

  // Obtener estadísticas de servidores
  const totalServers = await Server.countDocuments();
  const runningServers = await Server.countDocuments({ status: 'running' });
  const javaServers = await Server.countDocuments({ type: 'java' });
  const bedrockServers = await Server.countDocuments({ type: 'bedrock' });

  // Obtener estadísticas de backups
  const totalBackups = await Backup.countDocuments();
  const backupSize = await Backup.aggregate([
    { $group: { _id: null, total: { $sum: '$size' } } }
  ]);

  const stats = {
    users: {
      total: totalUsers,
      active: activeUsers,
      premium: premiumUsers
    },
    servers: {
      total: totalServers,
      running: runningServers,
      java: javaServers,
      bedrock: bedrockServers
    },
    backups: {
      total: totalBackups,
      totalSize: backupSize.length > 0 ? backupSize[0].total : 0
    },
    system: {
      timestamp: new Date()
    }
  };
    
    res.status(200).json({
      success: true,
    data: stats
  });
});

/**
 * @desc    Obtener logs del sistema
 * @route   GET /api/admin/logs
 * @access  Admin
 */
exports.getSystemLogs = asyncHandler(async (req, res, next) => {
  // Opciones de filtrado
  const { level, source, startDate, endDate, limit } = req.query;
  const filter = {};

  if (level) {
    filter.level = level;
  }

  if (source) {
    filter.source = source;
  }

  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) {
      filter.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.timestamp.$lte = new Date(endDate);
    }
  }

  // Obtener logs con filtros
  const logs = await SystemLog.find(filter)
    .sort('-timestamp')
    .limit(parseInt(limit) || 100);
    
    res.status(200).json({
      success: true,
    count: logs.length,
    data: logs
  });
});

/**
 * @desc    Obtener planes de suscripción
 * @route   GET /api/admin/plans
 * @access  Admin
 */
exports.getSubscriptionPlans = asyncHandler(async (req, res, next) => {
    // Obtener todos los planes de suscripción
    const plans = await SubscriptionPlan.find().sort({ price: 1 });
    
    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
});

/**
 * @desc    Configurar planes de suscripción
 * @route   PUT /api/admin/plans
 * @access  Admin
 */
exports.updateSubscriptionPlans = asyncHandler(async (req, res, next) => {
    const { plans } = req.body;
    
    if (!plans || !Array.isArray(plans)) {
    return next(new ErrorResponse('Se requiere un array de planes', 400));
    }
    
    const results = [];
    
    // Procesar cada plan
    for (const planData of plans) {
      // Validar datos mínimos requeridos
      if (!planData.id || !planData.name || planData.price === undefined) {
        results.push({
          id: planData.id || 'unknown',
          success: false,
          message: 'Datos incompletos para el plan'
        });
        continue;
      }
      
      try {
        // Buscar si el plan ya existe
        let plan = await SubscriptionPlan.findOne({ id: planData.id });
        
        if (plan) {
          // Actualizar plan existente
          Object.keys(planData).forEach(key => {
            if (key !== '_id') { // No permitir cambiar el _id
              plan[key] = planData[key];
            }
          });
          
          await plan.save();
          results.push({
            id: plan.id,
            success: true,
            message: 'Plan actualizado correctamente',
            plan
          });
        } else {
          // Crear nuevo plan
          const newPlan = new SubscriptionPlan(planData);
          await newPlan.save();
          results.push({
            id: newPlan.id,
            success: true,
            message: 'Plan creado correctamente',
            plan: newPlan
          });
        }
      } catch (planError) {
        results.push({
          id: planData.id,
          success: false,
          message: 'Error al procesar el plan',
          error: planError.message
        });
      }
    }
  
  // Registrar la acción en los logs del sistema
  await SystemLog.create({
    level: 'info',
    message: 'Planes de suscripción actualizados',
    source: 'subscription-management',
    user: req.user.id,
    details: { plansUpdated: results.length }
  });
    
    res.status(200).json({
      success: true,
      results
    });
});

/**
 * @desc    Cambiar rol de usuario
 * @route   PUT /api/admin/users/:id/role
 * @access  Admin
 */
exports.changeUserRole = asyncHandler(async (req, res, next) => {
    const { role } = req.body;
    
  if (!role) {
    return next(new ErrorResponse('Por favor proporciona un rol', 400));
  }
  
  // Validar que el rol es válido
  const validRoles = ['user', 'admin', 'staff'];
  if (!validRoles.includes(role)) {
    return next(new ErrorResponse(`Rol inválido. Los roles válidos son: ${validRoles.join(', ')}`, 400));
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
    return next(new ErrorResponse(`Usuario no encontrado con id ${req.params.id}`, 404));
    }
    
  // Actualizar el rol
    user.role = role;
    await user.save();
    
    res.status(200).json({
      success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

/**
 * @desc    Obtener todos los servidores
 * @route   GET /api/admin/servers
 * @access  Admin
 */
exports.getAllServers = asyncHandler(async (req, res, next) => {
  const servers = await Server.find().populate('user', 'name email');
    
    res.status(200).json({
      success: true,
      count: servers.length,
      data: servers
    });
});

/**
 * @desc    Obtener detalles de un servidor
 * @route   GET /api/admin/servers/:id
 * @access  Admin
 */
exports.getServerDetails = asyncHandler(async (req, res, next) => {
  const server = await Server.findById(req.params.id).populate('user', 'name email');
    
    if (!server) {
    return next(new ErrorResponse(`Servidor no encontrado con id ${req.params.id}`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: server
    });
});

/**
 * @desc    Actualizar un servidor
 * @route   PUT /api/admin/servers/:id
 * @access  Admin
 */
exports.updateServer = asyncHandler(async (req, res, next) => {
  let server = await Server.findById(req.params.id);
    
    if (!server) {
    return next(new ErrorResponse(`Servidor no encontrado con id ${req.params.id}`, 404));
  }
  
  server = await Server.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
    
    res.status(200).json({
      success: true,
      data: server
    });
});

/**
 * @desc    Suspender un servidor
 * @route   POST /api/admin/servers/:id/suspend
 * @access  Admin
 */
exports.suspendServer = asyncHandler(async (req, res, next) => {
    const server = await Server.findById(req.params.id);
    
    if (!server) {
    return next(new ErrorResponse(`Servidor no encontrado con id ${req.params.id}`, 404));
  }
  
  // Suspender el servidor (implementación básica)
    server.status = 'suspended';
  server.isSuspended = true;
  server.suspendedAt = Date.now();
  server.suspendedReason = req.body.reason || 'Suspendido por administrador';
  
    await server.save();
    
    res.status(200).json({
      success: true,
      data: server
    });
});

/**
 * @desc    Reactivar un servidor
 * @route   POST /api/admin/servers/:id/unsuspend
 * @access  Admin
 */
exports.unsuspendServer = asyncHandler(async (req, res, next) => {
    const server = await Server.findById(req.params.id);
    
    if (!server) {
    return next(new ErrorResponse(`Servidor no encontrado con id ${req.params.id}`, 404));
  }
  
  // Reactivar el servidor (implementación básica)
    server.status = 'stopped';
  server.isSuspended = false;
  server.suspendedAt = undefined;
  server.suspendedReason = undefined;
  
    await server.save();
    
    res.status(200).json({
      success: true,
      data: server
    });
});

/**
 * @desc    Obtener todas las suscripciones
 * @route   GET /api/admin/subscriptions
 * @access  Admin
 */
exports.getAllSubscriptions = asyncHandler(async (req, res, next) => {
  // Implementación básica
    res.status(200).json({
      success: true,
    data: []
  });
});

/**
 * @desc    Obtener una suscripción específica
 * @route   GET /api/admin/subscriptions/:id
 * @access  Admin
 */
exports.getSubscription = asyncHandler(async (req, res, next) => {
  // Implementación básica
    res.status(200).json({
      success: true,
    data: {}
  });
});

/**
 * @desc    Actualizar una suscripción
 * @route   PUT /api/admin/subscriptions/:id
 * @access  Admin
 */
exports.updateSubscription = asyncHandler(async (req, res, next) => {
  // Implementación básica
    res.status(200).json({
      success: true,
    data: {}
  });
});

/**
 * @desc    Obtener todos los tickets de soporte
 * @route   GET /api/admin/tickets
 * @access  Admin
 */
exports.getAllTickets = asyncHandler(async (req, res, next) => {
  // Implementación básica
    res.status(200).json({
      success: true,
    data: []
  });
});

/**
 * @desc    Obtener un ticket específico
 * @route   GET /api/admin/tickets/:id
 * @access  Admin
 */
exports.getTicket = asyncHandler(async (req, res, next) => {
  // Implementación básica
    res.status(200).json({
      success: true,
    data: {}
  });
});

/**
 * @desc    Actualizar un ticket
 * @route   PUT /api/admin/tickets/:id
 * @access  Admin
 */
exports.updateTicket = asyncHandler(async (req, res, next) => {
  // Implementación básica
    res.status(200).json({
      success: true,
    data: {}
  });
});

/**
 * @desc    Asignar un ticket a un miembro del staff
 * @route   PUT /api/admin/tickets/:id/assign
 * @access  Admin
 */
exports.assignTicket = asyncHandler(async (req, res, next) => {
  // Implementación básica
    res.status(200).json({
      success: true,
    data: {}
  });
});

/**
 * @desc    Responder a un ticket
 * @route   POST /api/admin/tickets/:id/reply
 * @access  Admin
 */
exports.replyToTicket = asyncHandler(async (req, res, next) => {
  // Implementación básica
    res.status(200).json({
      success: true,
    data: {}
  });
});

/**
 * @desc    Cerrar un ticket
 * @route   PUT /api/admin/tickets/:id/close
 * @access  Admin
 */
exports.closeTicket = asyncHandler(async (req, res, next) => {
  // Implementación básica
    res.status(200).json({
      success: true,
    data: {}
  });
});

/**
 * @desc    Eliminar un servidor
 * @route   DELETE /api/admin/servers/:id
 * @access  Admin
 */
exports.deleteServer = asyncHandler(async (req, res, next) => {
  const server = await Server.findById(req.params.id);
  
  if (!server) {
    return next(new ErrorResponse(`Servidor no encontrado con id ${req.params.id}`, 404));
  }
  
  await server.remove();
    
    res.status(200).json({
      success: true,
    message: 'Servidor eliminado correctamente',
    data: {}
  });
});