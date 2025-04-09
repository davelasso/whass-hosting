/**
 * Utilidad para iniciar MongoDB en memoria para desarrollo y pruebas
 */
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const winston = require('winston');

// Configuración de logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

let mongoServer;

/**
 * Inicia una instancia de MongoDB en memoria
 * @returns {Promise<string>} URI de conexión a la base de datos
 */
async function startMemoryDb() {
  try {
    logger.info('Iniciando MongoDB Memory Server...');
    // Configuración para MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '6.0.5',
        downloadDir: './.cache/mongodb-binaries',
        // Añadir opciones de descarga para mejorar la estabilidad
        downloadOptions: {
          retries: 5,
          timeout: 60000
        }
      },
      instance: {
        // Aumentar el tiempo de espera de 10 segundos a 120 segundos
        startupTimeoutMs: 120000,
        // Agregar opciones adicionales para mejorar la estabilidad
        args: ['--setParameter', 'enableTestCommands=1']
      }
    });
    const mongoUri = mongoServer.getUri();
    logger.info(`MongoDB Memory Server iniciado en ${mongoUri}`);
    return mongoUri;
  } catch (error) {
    logger.error(`Error al iniciar MongoDB Memory Server: ${error.message}`);
    logger.debug('Detalles del error:', error);
    throw error;
  }
}

/**
 * Detiene la instancia de MongoDB en memoria
 */
async function stopMemoryDb() {
  if (mongoServer) {
    await mongoose.disconnect();
    await mongoServer.stop();
    logger.info('MongoDB Memory Server detenido');
  }
}

/**
 * Conecta a la base de datos en memoria
 * @returns {Promise<void>}
 */
async function connectToMemoryDb() {
  const maxRetries = 5; // Aumentado de 3 a 5 intentos
  let retryCount = 0;
  let lastError;

  while (retryCount < maxRetries) {
    try {
      if (retryCount > 0) {
        logger.info(`Reintentando conexión a MongoDB Memory Server (intento ${retryCount + 1}/${maxRetries})`);
      }

      const mongoUri = await startMemoryDb();
      
      // Actualizar URI en variables de entorno
      process.env.MONGO_URI = mongoUri;
      
      // Conectar con mongoose con opciones mejoradas
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 45000, // Aumentado de 30000 a 45000
        socketTimeoutMS: 60000, // Aumentado de 45000 a 60000
        connectTimeoutMS: 45000, // Aumentado de 30000 a 45000
        heartbeatFrequencyMS: 10000, // Añadido para mejorar la estabilidad de la conexión
        retryWrites: true, // Añadido para reintentar operaciones de escritura
        retryReads: true // Añadido para reintentar operaciones de lectura
      });
      
      logger.info('Conexión establecida con MongoDB Memory Server');
      
      // Agregar hooks para limpiar al salir
      process.on('SIGINT', async () => {
        await stopMemoryDb();
        process.exit(0);
      });
      
      process.on('SIGTERM', async () => {
        await stopMemoryDb();
        process.exit(0);
      });
      
      // Manejar reconexiones si se pierde la conexión
      mongoose.connection.on('disconnected', () => {
        logger.warn('Conexión a MongoDB perdida. Intentando reconectar...');
      });
      
      return mongoUri;
    } catch (error) {
      lastError = error;
      logger.error(`Error al conectar a MongoDB Memory Server (intento ${retryCount + 1}/${maxRetries}): ${error.message}`);
      logger.debug('Detalles del error:', error);
      
      // Manejo específico según el tipo de error
      if (error.message.includes('download') || error.message.includes('start')) {
        const waitTime = (retryCount + 1) * 3000; // Espera progresiva aumentada
        logger.info(`Esperando ${waitTime}ms antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else if (error.code === 'EADDRINUSE') {
        // Error específico de puerto en uso
        logger.warn('Puerto en uso detectado. Intentando con otro puerto...');
        // No es necesario hacer nada especial aquí, MongoDB Memory Server
        // intentará con otro puerto automáticamente en el siguiente intento
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        // Para otros errores, esperar un tiempo antes de reintentar
        const waitTime = 2000 + (retryCount * 1000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      retryCount++;
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  logger.error(`Todos los intentos de conexión a MongoDB Memory Server fallaron. Último error: ${lastError.message}`);
  throw lastError;
}

module.exports = {
  startMemoryDb,
  stopMemoryDb,
  connectToMemoryDb
};