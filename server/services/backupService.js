/**
 * Servicio para gestión de backups de servidores Minecraft
 */
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const { createWriteStream, createReadStream, promises: fsPromises } = require('fs');
const mongoose = require('mongoose');
const Backup = require('../models/Backup');
const Server = require('../models/Server');
const backupConfig = require('../config/backupConfig');
const logger = require('../utils/logger');
const dockerService = require('./dockerService');

/**
 * Crea un backup de un servidor de Minecraft
 * @param {string} serverId - ID del servidor
 * @param {string} userId - ID del usuario propietario
 * @param {string} description - Descripción del backup
 * @param {boolean} isAutomatic - Indica si es un backup automático
 * @returns {Promise<Object>} - Información del backup creado
 */
const createServerBackup = async (serverId, userId, description, isAutomatic = false) => {
  logger.info(`Iniciando backup para servidor ${serverId}`);
  
  try {
    // Verificar que el servidor existe y pertenece al usuario
    const server = await Server.findOne({ _id: serverId, user: userId });
    
    if (!server) {
      throw new Error('Servidor no encontrado o no autorizado');
    }

    // Crear directorio de backup si no existe
    const backupDir = backupConfig.getServerBackupDir(serverId);
    await createDirectoryIfNotExists(backupDir);
    
    // Generar nombre único para el archivo de backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `backup-${timestamp}.zip`;
    const backupPath = path.join(backupDir, backupFilename);
    
    // Obtener la ruta del directorio de datos del servidor
    const serverDataDir = backupConfig.getServerDataDir(serverId);
    
    // Verificar si el directorio de datos existe
    await fsPromises.access(serverDataDir).catch(() => {
      throw new Error(`Directorio de datos del servidor no encontrado: ${serverDataDir}`);
    });
    
    // Crear entrada en la base de datos
    const backup = new Backup({
      server: serverId,
      user: userId,
      filename: backupFilename,
      path: backupPath,
      description: description || `Backup - ${new Date().toLocaleDateString()}`,
      size: 0, // Actualizar después de crear el archivo
      isAutomatic
    });
    
    await backup.save();
    
    // Comprimir los archivos del servidor
    const fileSize = await compressDirectory(serverDataDir, backupPath);
    
    // Actualizar el tamaño del backup
    backup.size = fileSize;
    await backup.save();
    
    logger.info(`Backup completado para servidor ${serverId}: ${backupPath} (${formatBytes(fileSize)})`);
    
    return {
      success: true,
      backupId: backup._id,
      filename: backupFilename,
      size: fileSize,
      path: backupPath
    };
  } catch (error) {
    logger.error(`Error al crear backup para servidor ${serverId}:`, error);
    throw error;
  }
};

/**
 * Obtiene todos los backups de un servidor
 * @param {string} serverId - ID del servidor
 * @param {string} userId - ID del usuario propietario
 * @returns {Promise<Array>} - Lista de backups
 */
const getServerBackups = async (serverId, userId) => {
  // Verificar que el servidor existe y pertenece al usuario
  const server = await Server.findOne({ _id: serverId, user: userId });
  
  if (!server) {
    throw new Error('Servidor no encontrado o no autorizado');
  }
  
  // Obtener backups ordenados por fecha de creación (más recientes primero)
  const backups = await Backup.find({ server: serverId })
    .sort({ createdAt: -1 })
    .lean();
  
  return backups.map(backup => ({
    ...backup,
    sizeFormatted: formatBytes(backup.size)
  }));
};

/**
 * Restaura un backup a un servidor
 * @param {string} backupId - ID del backup a restaurar
 * @param {string} serverId - ID del servidor
 * @param {string} userId - ID del usuario propietario
 * @returns {Promise<Object>} - Resultado de la restauración
 */
const restoreBackup = async (backupId, serverId, userId) => {
  logger.info(`Iniciando restauración de backup ${backupId} para servidor ${serverId}`);
  
  try {
    // Verificar que el backup existe y pertenece al servidor/usuario
    const backup = await Backup.findOne({ 
      _id: backupId, 
      server: serverId
    });
    
    if (!backup) {
      throw new Error('Backup no encontrado');
    }
    
    // Verificar que el servidor existe y pertenece al usuario
    const server = await Server.findOne({ _id: serverId, user: userId });
    
    if (!server) {
      throw new Error('Servidor no encontrado o no autorizado');
    }
    
    // Verificar si el backup existe físicamente
    await fsPromises.access(backup.path).catch(() => {
      throw new Error(`Archivo de backup no encontrado: ${backup.path}`);
    });
    
    // Verificar si el servidor está detenido
    const isRunning = await dockerService.isContainerRunning(serverId);
    if (isRunning) {
      // Detener el servidor
      logger.info(`Deteniendo servidor ${serverId} antes de restaurar backup`);
      await dockerService.stopContainer(serverId);
    }
    
    // Crear directorio temporal para descomprimir
    const tempDir = path.join(backupConfig.TEMP_DIR, `restore-${serverId}-${Date.now()}`);
    await createDirectoryIfNotExists(tempDir);
    
    try {
      // Descomprimir el backup en el directorio temporal
      await extractZip(backup.path, tempDir);
      
      // Obtener la ruta del directorio de datos del servidor
      const serverDataDir = backupConfig.getServerDataDir(serverId);
      
      // Eliminar los archivos existentes en el directorio del servidor
      await removeDirectoryContents(serverDataDir);
      
      // Copiar los archivos del backup al directorio del servidor
      await copyDirectoryContents(tempDir, serverDataDir);
      
      // Limpiar directorio temporal
      await removeDirectory(tempDir);
      
      // Si el servidor estaba en ejecución, volver a iniciarlo
      if (isRunning) {
        logger.info(`Reiniciando servidor ${serverId} después de restaurar backup`);
        await dockerService.startContainer(serverId);
      }
      
      logger.info(`Restauración de backup completada para servidor ${serverId}`);
      
      return {
        success: true,
        message: 'Backup restaurado correctamente'
      };
    } catch (error) {
      // Limpiar directorio temporal en caso de error
      await removeDirectory(tempDir).catch(err => 
        logger.error(`Error al limpiar directorio temporal: ${err.message}`)
      );
      throw error;
    }
  } catch (error) {
    logger.error(`Error al restaurar backup ${backupId} para servidor ${serverId}:`, error);
    throw error;
  }
};

/**
 * Elimina un backup
 * @param {string} backupId - ID del backup a eliminar
 * @param {string} serverId - ID del servidor
 * @param {string} userId - ID del usuario propietario
 * @returns {Promise<Object>} - Resultado de la eliminación
 */
const deleteBackup = async (backupId, serverId, userId) => {
  try {
    // Verificar que el backup existe y pertenece al servidor/usuario
    const backup = await Backup.findOne({ 
      _id: backupId, 
      server: serverId
    });
    
    if (!backup) {
      throw new Error('Backup no encontrado');
    }
    
    // Verificar que el servidor existe y pertenece al usuario
    const server = await Server.findOne({ _id: serverId, user: userId });
    
    if (!server) {
      throw new Error('Servidor no encontrado o no autorizado');
    }
    
    // Eliminar el archivo de backup del sistema de archivos
    await fsPromises.unlink(backup.path).catch(err => {
      logger.warn(`No se pudo eliminar el archivo de backup ${backup.path}: ${err.message}`);
    });
    
    // Eliminar la entrada de la base de datos
    await Backup.deleteOne({ _id: backupId });
    
    logger.info(`Backup ${backupId} eliminado para servidor ${serverId}`);
    
    return {
      success: true,
      message: 'Backup eliminado correctamente'
    };
  } catch (error) {
    logger.error(`Error al eliminar backup ${backupId} para servidor ${serverId}:`, error);
    throw error;
  }
};

/**
 * Limpia backups antiguos según la política de retención
 * @param {string} serverId - ID del servidor
 * @param {number} maxBackups - Número máximo de backups a mantener
 * @param {number} maxDays - Número máximo de días a mantener backups
 * @returns {Promise<Object>} - Resultado de la limpieza
 */
const cleanupOldBackups = async (serverId, maxBackups, maxDays) => {
  try {
    logger.info(`Iniciando limpieza de backups antiguos para servidor ${serverId}`);
    logger.info(`Política de retención: maxBackups=${maxBackups}, maxDays=${maxDays}`);
    
    // Calcular la fecha límite para backups antiguos
    const olderThan = new Date();
    olderThan.setDate(olderThan.getDate() - maxDays);
    
    // Encontrar todos los backups para el servidor
    const allBackups = await Backup.find({ server: serverId })
      .sort({ createdAt: -1 });
    
    // Separar backups manuales y automáticos
    const manualBackups = allBackups.filter(b => !b.isAutomatic);
    const automaticBackups = allBackups.filter(b => b.isAutomatic);
    
    // Backups a eliminar
    const toDelete = [];
    
    // Procesar backups automáticos (estos son los que principalmente se limpian)
    if (automaticBackups.length > maxBackups) {
      // Mantener solo los maxBackups más recientes
      toDelete.push(...automaticBackups.slice(maxBackups));
    }
    
    // También eliminar los backups automáticos que son más antiguos que maxDays
    automaticBackups.forEach(backup => {
      if (backup.createdAt < olderThan && !toDelete.includes(backup)) {
        toDelete.push(backup);
      }
    });
    
    // Para los backups manuales, ser más conservador, solo eliminar los muy antiguos
    // (el doble de la política estándar)
    const veryOldDate = new Date();
    veryOldDate.setDate(veryOldDate.getDate() - (maxDays * 2));
    
    manualBackups.forEach(backup => {
      if (backup.createdAt < veryOldDate) {
        toDelete.push(backup);
      }
    });
    
    // Eliminar los backups marcados para eliminación
    let deletedCount = 0;
    for (const backup of toDelete) {
      try {
        // Eliminar archivo físico
        await fsPromises.unlink(backup.path).catch(err => {
          logger.warn(`No se pudo eliminar el archivo de backup ${backup.path}: ${err.message}`);
        });
        
        // Eliminar entrada de la base de datos
        await Backup.deleteOne({ _id: backup._id });
        
        deletedCount++;
      } catch (error) {
        logger.error(`Error al eliminar backup ${backup._id}:`, error);
      }
    }
    
    logger.info(`Limpieza completada para servidor ${serverId}: ${deletedCount} backups eliminados`);
    
    return {
      success: true,
      totalBackups: allBackups.length,
      deletedCount,
      remainingCount: allBackups.length - deletedCount
    };
  } catch (error) {
    logger.error(`Error al limpiar backups para servidor ${serverId}:`, error);
    throw error;
  }
};

/**
 * Comprime un directorio en un archivo ZIP
 * @param {string} sourceDir - Directorio a comprimir
 * @param {string} outputPath - Ruta del archivo ZIP de salida
 * @returns {Promise<number>} - Tamaño del archivo en bytes
 */
const compressDirectory = (sourceDir, outputPath) => {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: backupConfig.COMPRESSION_LEVEL } 
    });
    
    output.on('close', () => {
      resolve(archive.pointer());
    });
    
    archive.on('error', (err) => {
      reject(err);
    });
    
    archive.pipe(output);
    
    // Filtrar archivos según la configuración
    const ignorePatterns = backupConfig.FILE_FILTERS.exclude || [];
    
    // Función para filtrar archivos
    const filterFunction = (entry) => {
      // No incluir archivos en la lista de exclusión
      for (const pattern of ignorePatterns) {
        if (entry.name.match(pattern)) {
          return false;
        }
      }
      return true;
    };
    
    // Añadir directorio al archivo
    archive.directory(sourceDir, false, filterFunction);
    
    // Finalizar
    archive.finalize();
  });
};

/**
 * Extrae un archivo ZIP a un directorio
 * @param {string} zipPath - Ruta del archivo ZIP
 * @param {string} destDir - Directorio de destino
 * @returns {Promise<void>}
 */
const extractZip = async (zipPath, destDir) => {
  const extract = require('extract-zip');
  await extract(zipPath, { dir: destDir });
};

/**
 * Crea un directorio si no existe
 * @param {string} dir - Ruta del directorio
 * @returns {Promise<void>}
 */
const createDirectoryIfNotExists = async (dir) => {
  try {
    await fsPromises.access(dir);
  } catch (error) {
    // El directorio no existe, crearlo
    await fsPromises.mkdir(dir, { recursive: true });
  }
};

/**
 * Elimina un directorio y su contenido
 * @param {string} dir - Ruta del directorio
 * @returns {Promise<void>}
 */
const removeDirectory = async (dir) => {
  await fsPromises.rm(dir, { recursive: true, force: true });
};

/**
 * Elimina el contenido de un directorio sin eliminar el directorio
 * @param {string} dir - Ruta del directorio
 * @returns {Promise<void>}
 */
const removeDirectoryContents = async (dir) => {
  const files = await fsPromises.readdir(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fsPromises.lstat(filePath);
    
    if (stat.isDirectory()) {
      await removeDirectory(filePath);
    } else {
      await fsPromises.unlink(filePath);
    }
  }
};

/**
 * Copia el contenido de un directorio a otro
 * @param {string} sourceDir - Directorio de origen
 * @param {string} destDir - Directorio de destino
 * @returns {Promise<void>}
 */
const copyDirectoryContents = async (sourceDir, destDir) => {
  // Asegurar que el directorio de destino existe
  await createDirectoryIfNotExists(destDir);
  
  const files = await fsPromises.readdir(sourceDir);
  
  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);
    
    const stat = await fsPromises.lstat(sourcePath);
    
    if (stat.isDirectory()) {
      // Crear subdirectorio y copiar su contenido
      await createDirectoryIfNotExists(destPath);
      await copyDirectoryContents(sourcePath, destPath);
    } else {
      // Copiar archivo
      await fsPromises.copyFile(sourcePath, destPath);
    }
  }
};

/**
 * Formatea un tamaño en bytes a una representación legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} - Tamaño formateado
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
  createServerBackup,
  getServerBackups,
  restoreBackup,
  deleteBackup,
  cleanupOldBackups
};