const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Asegurarse de que el directorio de logs exista
const logDir = path.join(__dirname, '..', 'logs');
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (error) {
  console.warn(`No se pudo crear directorio de logs: ${error.message}`);
}

// Configuración de transports basada en entorno
const transports = [
  // Logs en consola siempre presentes
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(info => {
        return `${info.timestamp} [${info.level.toUpperCase()}] ${info.message} ${info.stack || ''}`;
      })
    )
  })
];

// Solo agregar transports de archivo si no estamos en Render o si podemos escribir en logs
if (process.env.NODE_ENV !== 'production' || fs.existsSync(logDir) && fs.accessSync(logDir, fs.constants.W_OK)) {
  transports.push(
    // Archivo para todos los logs (nivel info y superior)
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Archivo separado para errores
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
}

// Formato personalizado para logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(info => {
    return `${info.timestamp} [${info.level.toUpperCase()}] ${info.message} ${info.stack || ''}`;
  })
);

// Crear logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: transports,
  // No fallar si no se puede escribir en archivos
  exitOnError: false
});

// Exportar logger
module.exports = logger; 