/**
 * Planificador de backups automáticos para servidores Minecraft
 */
const cron = require('node-cron');
const backupService = require('../services/backupService');
const serverService = require('../services/serverService');
const logger = require('./logger');
const backupConfig = require('../config/backupConfig');
const mongoose = require('mongoose');
const Server = require('../models/Server');
const User = require('../models/User');

// Colección para llevar un registro de backups programados actualmente
const activeBackupJobs = new Map();

/**
 * Inicia el planificador de backups automáticos
 */
const initBackupScheduler = () => {
  if (!backupConfig.AUTO_BACKUP_CONFIG.enabled) {
    logger.info('Backup automático desactivado en la configuración');
    return;
  }

  // Programar la tarea de backup diaria a la hora configurada
  const cronExpression = `0 ${backupConfig.AUTO_BACKUP_CONFIG.runAtHour} * * *`;
  
  logger.info(`Iniciando planificador de backups automáticos: ${cronExpression}`);
  
  cron.schedule(cronExpression, async () => {
    try {
      logger.info('Iniciando el proceso de backup automático programado');
      await executeScheduledBackups();
    } catch (error) {
      logger.error('Error durante la ejecución de backups programados:', error);
    }
  });

  // También programar la tarea de limpieza de backups antiguos
  cron.schedule('0 5 * * *', async () => { // 5 AM todos los días
    try {
      logger.info('Iniciando limpieza programada de backups antiguos');
      await cleanupAllOldBackups();
    } catch (error) {
      logger.error('Error durante la limpieza de backups antiguos:', error);
    }
  });
};

/**
 * Ejecuta backups automáticos para todos los servidores activos
 */
const executeScheduledBackups = async () => {
  try {
    // Obtener todos los servidores activos
    const servers = await Server.find({ status: { $ne: 'deleted' } }).populate('user');
    
    if (!servers || servers.length === 0) {
      logger.info('No hay servidores disponibles para backup automático');
      return;
    }
    
    logger.info(`Procesando backup automático para ${servers.length} servidores`);
    
    // Dividir servidores en lotes según la configuración de backups paralelos
    const batchSize = backupConfig.AUTO_BACKUP_CONFIG.maxParallelBackups;
    for (let i = 0; i < servers.length; i += batchSize) {
      const batch = servers.slice(i, i + batchSize);
      
      // Ejecutar backups en paralelo para este lote
      await Promise.all(batch.map(async (server) => {
        try {
          // Verificar si el servidor está en línea (solo hacer backup si está en línea)
          const isRunning = await serverService.isServerRunning(server._id);
          
          if (!isRunning) {
            logger.info(`Saltando backup automático para servidor ${server._id} - no está en ejecución`);
            return;
          }
          
          logger.info(`Iniciando backup automático para servidor ${server._id}`);
          
          // Ejecutar backup con bandera automática
          const backupResult = await backupService.createServerBackup(
            server._id,
            server.user._id,
            `Backup automático - ${new Date().toISOString().split('T')[0]}`,
            true
          );
          
          logger.info(`Backup automático completado para servidor ${server._id}: ${backupResult.backupId}`);
        } catch (error) {
          logger.error(`Error en backup automático para servidor ${server._id}:`, error);
        }
      }));
    }
    
    logger.info('Proceso de backup automático completado');
  } catch (error) {
    logger.error('Error general durante la ejecución de backups programados:', error);
    throw error;
  }
};

/**
 * Limpia backups antiguos para todos los servidores
 */
const cleanupAllOldBackups = async () => {
  try {
    // Obtener todos los usuarios con sus planes
    const users = await User.find({});
    
    // Crear un mapa para fácil consulta
    const userPlans = new Map();
    users.forEach(user => userPlans.set(user._id.toString(), user.plan));
    
    // Obtener todos los servidores
    const servers = await Server.find({ status: { $ne: 'deleted' } });
    
    // Procesar servidores en lotes
    const batchSize = 5; // Procesar de 5 en 5 para no sobrecargar el sistema
    for (let i = 0; i < servers.length; i += batchSize) {
      const batch = servers.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (server) => {
        try {
          const userId = server.user.toString();
          const userPlan = userPlans.get(userId) || 'free';
          
          // Obtener política de retención según el plan
          const retentionPolicy = backupConfig.getRetentionPolicy(userPlan);
          
          logger.info(`Limpiando backups antiguos para servidor ${server._id} (Plan: ${userPlan})`);
          
          // Ejecutar limpieza
          const result = await backupService.cleanupOldBackups(
            server._id,
            retentionPolicy.maxBackups,
            retentionPolicy.maxDays
          );
          
          logger.info(`Limpieza completada para servidor ${server._id}: ${result.deletedCount} backups eliminados`);
        } catch (error) {
          logger.error(`Error limpiando backups para servidor ${server._id}:`, error);
        }
      }));
    }
    
    logger.info('Proceso de limpieza de backups antiguos completado');
  } catch (error) {
    logger.error('Error general durante la limpieza de backups antiguos:', error);
    throw error;
  }
};

/**
 * Programa un backup inmediato para un servidor específico
 * @param {string} serverId - ID del servidor
 * @param {string} userId - ID del usuario
 * @param {string} description - Descripción del backup
 * @returns {Promise<Object>} Resultado del backup
 */
const scheduleImmediateBackup = async (serverId, userId, description) => {
  try {
    logger.info(`Programando backup inmediato para servidor ${serverId}`);
    
    // Verificar si hay un backup en progreso para este servidor
    if (activeBackupJobs.has(serverId)) {
      logger.warn(`Ya hay un backup en progreso para el servidor ${serverId}`);
      return { success: false, message: 'Ya hay un backup en progreso para este servidor' };
    }
    
    // Marcar como en progreso
    activeBackupJobs.set(serverId, Date.now());
    
    try {
      // Ejecutar backup
      const result = await backupService.createServerBackup(
        serverId,
        userId,
        description || `Backup manual - ${new Date().toISOString()}`
      );
      
      logger.info(`Backup inmediato completado para servidor ${serverId}`);
      return { success: true, backupId: result.backupId };
    } finally {
      // Limpiar el estado al finalizar
      activeBackupJobs.delete(serverId);
    }
  } catch (error) {
    logger.error(`Error en backup inmediato para servidor ${serverId}:`, error);
    // Limpiar el estado en caso de error
    activeBackupJobs.delete(serverId);
    throw error;
  }
};

module.exports = {
  initBackupScheduler,
  executeScheduledBackups,
  cleanupAllOldBackups,
  scheduleImmediateBackup
}; 