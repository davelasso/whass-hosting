/**
 * Configuración para el sistema de backups de servidores Minecraft
 */
const path = require('path');
const os = require('os');

// Rutas principales
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../../backups');
const SERVER_DATA_DIR = process.env.SERVER_DATA_DIR || path.join(__dirname, '../../data/servers');
const TEMP_DIR = path.join(BACKUP_DIR, 'temp');

// Políticas de retención predeterminadas por plan
const RETENTION_POLICIES = {
  free: {
    maxBackups: 3,
    maxDays: 7
  },
  basic: {
    maxBackups: 5,
    maxDays: 14
  },
  premium: {
    maxBackups: 10,
    maxDays: 30
  },
  enterprise: {
    maxBackups: 20,
    maxDays: 90
  }
};

// Configuración de compresión
const COMPRESSION_LEVEL = 5; // Nivel 1-9 (más alto = mejor compresión pero más lento)

// Configuración de backups automáticos
const AUTO_BACKUP_CONFIG = {
  enabled: true,
  intervalHours: 24, // Frecuencia de backups automáticos en horas
  maxParallelBackups: Math.max(1, Math.floor(os.cpus().length / 2)), // Usar la mitad de los núcleos disponibles
  runAtHour: 3, // Hora del día para ejecutar backups (3 AM)
  excludeDirs: ['cache', 'logs', 'tmp']
};

// Extensiones de archivo a incluir/excluir
const FILE_FILTERS = {
  include: ['.json', '.properties', '.yml', '.yaml', '.conf', '.jar', '.dat', '.txt'],
  exclude: ['.log', '.tmp', '.bak', '.old']
};

module.exports = {
  BACKUP_DIR,
  SERVER_DATA_DIR,
  TEMP_DIR,
  RETENTION_POLICIES,
  COMPRESSION_LEVEL,
  AUTO_BACKUP_CONFIG,
  FILE_FILTERS,
  
  /**
   * Genera la ruta para el directorio de backups de un servidor específico
   * @param {string} serverId - ID del servidor
   * @returns {string} - Ruta al directorio de backups
   */
  getServerBackupDir: (serverId) => {
    return path.join(BACKUP_DIR, serverId.toString());
  },
  
  /**
   * Genera la ruta para el directorio de datos de un servidor específico
   * @param {string} serverId - ID del servidor
   * @returns {string} - Ruta al directorio de datos
   */
  getServerDataDir: (serverId) => {
    return path.join(SERVER_DATA_DIR, serverId.toString());
  },
  
  /**
   * Obtiene la política de retención para un plan específico
   * @param {string} plan - Plan del usuario
   * @returns {Object} - Política de retención
   */
  getRetentionPolicy: (plan) => {
    return RETENTION_POLICIES[plan] || RETENTION_POLICIES.free;
  }
}; 