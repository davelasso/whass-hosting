/**
 * Controlador para la gestión de backups de servidores
 */
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Backup = require('../models/Backup');
const Server = require('../models/Server');
const backupService = require('../services/backupService');
const path = require('path');
const fs = require('fs');
const winston = require('winston');

// Logger para este controlador
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'backup-controller' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

/**
 * @desc    Obtener todos los backups de un servidor
 * @route   GET /api/servers/:serverId/backups
 * @access  Private
 */
exports.getBackups = asyncHandler(async (req, res, next) => {
  const { serverId } = req.params;

  // Verificar que el servidor existe y pertenece al usuario
  const server = await Server.findOne({
    _id: serverId,
    user: req.user.id
  });

  if (!server) {
    return next(
      new ErrorResponse(`Servidor no encontrado con id ${serverId}`, 404)
    );
  }

  // Obtener backups de la base de datos
  const backups = await Backup.find({ server: serverId }).sort('-createdAt');

  res.status(200).json({
    success: true,
    count: backups.length,
    data: backups
  });
});

/**
 * @desc    Obtener un backup específico
 * @route   GET /api/backups/:id
 * @access  Private
 */
exports.getBackup = asyncHandler(async (req, res, next) => {
  const backup = await Backup.findById(req.params.id).populate({
    path: 'server',
    select: 'name user'
  });

  if (!backup) {
    return next(
      new ErrorResponse(`Backup no encontrado con id ${req.params.id}`, 404)
    );
  }

  // Asegurar que el backup pertenece a un servidor del usuario
  if (backup.server.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`No autorizado para acceder a este backup`, 403)
    );
  }

  res.status(200).json({
    success: true,
    data: backup
  });
});

/**
 * @desc    Crear un nuevo backup
 * @route   POST /api/servers/:serverId/backups
 * @access  Private
 */
exports.createBackup = asyncHandler(async (req, res, next) => {
  const { serverId } = req.params;
  const { description } = req.body;

  // Verificar que el servidor existe y pertenece al usuario
  const server = await Server.findOne({
    _id: serverId,
    user: req.user.id
  });

  if (!server) {
    return next(
      new ErrorResponse(`Servidor no encontrado con id ${serverId}`, 404)
    );
  }

  // Verificar límites de backups según el plan del usuario
  const backupCount = await Backup.countDocuments({ server: serverId });
  const userPlan = req.user.plan || 'free';
  const backupLimits = {
    free: 3,
    basic: 5,
    premium: 10,
    enterprise: 20
  };

  if (backupCount >= backupLimits[userPlan]) {
    return next(
      new ErrorResponse(
        `Límite de backups alcanzado para tu plan (${userPlan}). Máximo: ${backupLimits[userPlan]}`,
        400
      )
    );
  }

  try {
    // Crear backup usando el servicio
    const backupDetails = await backupService.createServerBackup(
      server,
      description,
      'manual'
    );

    // Crear entrada en la base de datos
    const backup = await Backup.create({
      name: backupDetails.name,
      path: backupDetails.path,
      size: backupDetails.size,
      worldSize: backupDetails.worldSize,
      description,
      type: 'manual',
      server: serverId,
      status: 'completed'
    });

    res.status(201).json({
      success: true,
      data: backup
    });
  } catch (error) {
    return next(
      new ErrorResponse(`Error al crear backup: ${error.message}`, 500)
    );
  }
});

/**
 * @desc    Restaurar un backup
 * @route   POST /api/backups/:id/restore
 * @access  Private
 */
exports.restoreBackup = asyncHandler(async (req, res, next) => {
  const backup = await Backup.findById(req.params.id).populate({
    path: 'server',
    select: 'name user _id'
  });

  if (!backup) {
    return next(
      new ErrorResponse(`Backup no encontrado con id ${req.params.id}`, 404)
    );
  }

  // Asegurar que el backup pertenece a un servidor del usuario
  if (backup.server.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`No autorizado para restaurar este backup`, 403)
    );
  }

  try {
    // Verificar que el archivo existe
    if (!fs.existsSync(backup.path)) {
      backup.status = 'error';
      await backup.save();
      return next(
        new ErrorResponse(
          `El archivo de backup no se encuentra en el sistema`,
          404
        )
      );
    }

    // Actualizar estado del backup
    backup.status = 'restoring';
    await backup.save();

    // Restaurar backup usando el servicio
    await backupService.restoreServerBackup(backup.server, backup.path);

    // Actualizar estado del backup
    backup.status = 'completed';
    backup.lastRestored = Date.now();
    await backup.save();

    res.status(200).json({
      success: true,
      data: backup
    });
  } catch (error) {
    // Marcar como error en caso de falla
    backup.status = 'error';
    await backup.save();

    return next(
      new ErrorResponse(`Error al restaurar backup: ${error.message}`, 500)
    );
  }
});

/**
 * @desc    Eliminar un backup
 * @route   DELETE /api/backups/:id
 * @access  Private
 */
exports.deleteBackup = asyncHandler(async (req, res, next) => {
  const backup = await Backup.findById(req.params.id).populate({
    path: 'server',
    select: 'user'
  });

  if (!backup) {
    return next(
      new ErrorResponse(`Backup no encontrado con id ${req.params.id}`, 404)
    );
  }

  // Asegurar que el backup pertenece a un servidor del usuario
  if (backup.server.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`No autorizado para eliminar este backup`, 403)
    );
  }

  try {
    // Eliminar archivo físico si existe
    if (fs.existsSync(backup.path)) {
      fs.unlinkSync(backup.path);
    }

    // Eliminar registro de la base de datos
    await backup.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    return next(
      new ErrorResponse(`Error al eliminar backup: ${error.message}`, 500)
    );
  }
});

/**
 * @desc    Limpiar backups antiguos según política de retención
 * @route   DELETE /api/servers/:serverId/backups/cleanup
 * @access  Private
 */
exports.cleanupBackups = asyncHandler(async (req, res, next) => {
  const { serverId } = req.params;
  const { maxBackups, maxDays } = req.query;

  // Verificar que el servidor existe y pertenece al usuario
  const server = await Server.findOne({
    _id: serverId,
    user: req.user.id
  });

  if (!server) {
    return next(
      new ErrorResponse(`Servidor no encontrado con id ${serverId}`, 404)
    );
  }

  try {
    // Configurar política de retención
    const retentionPolicy = {
      maxBackups: parseInt(maxBackups) || 10,
      maxDays: parseInt(maxDays) || 30
    };

    // Eliminar backups antiguos
    const deletedCount = await backupService.cleanupOldBackups(
      serverId,
      retentionPolicy
    );

    // Actualizar la base de datos para reflejar los cambios
    const backupFiles = backupService.listServerBackups(serverId);
    const backupFilePaths = backupFiles.map(file => file.path);

    // Encontrar backups en la base de datos que ya no existen como archivos
    const outdatedBackups = await Backup.find({
      server: serverId,
      path: { $nin: backupFilePaths }
    });

    // Eliminar registros obsoletos
    if (outdatedBackups.length > 0) {
      await Backup.deleteMany({
        _id: { $in: outdatedBackups.map(b => b._id) }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        deletedCount,
        outdatedRecords: outdatedBackups.length
      }
    });
  } catch (error) {
    return next(
      new ErrorResponse(`Error al limpiar backups: ${error.message}`, 500)
    );
  }
});

module.exports = {
  getBackups: exports.getBackups,
  getBackup: exports.getBackup,
  createBackup: exports.createBackup,
  restoreBackup: exports.restoreBackup,
  deleteBackup: exports.deleteBackup,
  cleanupBackups: exports.cleanupBackups
}; 