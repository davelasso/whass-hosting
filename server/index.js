/**
 * Servidor principal para la plataforma ddsbedrocl
 * Gestiona la API REST y la comunicación con los servidores de Minecraft
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
// Nuevos imports para seguridad y mejoras
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const winston = require('winston');

// Configuración para usar MongoDB local en lugar de MongoDB Memory Server
const isDev = process.env.NODE_ENV === 'development';
// Ya no usamos MongoDB Memory Server, ahora usamos MongoDB local
let memoryDb = null;

// Configuración de logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Importar rutas
const authRoutes = require('./routes/auth');
const serverRoutes = require('./routes/servers');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const billingRoutes = require('./routes/billing');
const supportRoutes = require('./routes/support');
const backupRoutes = require('./routes/backup');

// Configuración de variables de entorno
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ddsbedrocl';

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DDSBedrocl API',
      version: '1.0.0',
      description: 'API para plataforma de hosting de servidores Minecraft',
      contact: {
        name: 'Soporte DDSBedrocl',
        email: 'support@ddsbedrocl.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desarrollo'
      }
    ]
  },
  apis: ['./server/routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Inicializar la aplicación Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Configuración de proxy
app.set('trust proxy', 1);

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limitar a 100 peticiones por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Demasiadas peticiones, por favor intente más tarde'
  }
});

// Middleware
app.use(helmet()); // Seguridad
app.use(morgan('combined')); // Logging de peticiones HTTP
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use('/api/', apiLimiter); // Aplicar rate limiting a todas las rutas de la API

// Documentación API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Conexión a MongoDB
async function connectToDatabase() {
  // Conexión directa a MongoDB local
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info(`Conexión a MongoDB establecida en ${process.env.MONGO_URI}`);
  } catch (err) {
    logger.error(`Error al conectar a MongoDB: ${err.message}`);
    // En desarrollo, no cerramos el proceso para permitir otras funcionalidades
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/backups', backupRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date()
  });
});

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Configuración de Socket.IO para comunicación en tiempo real
io.on('connection', (socket) => {
  logger.info(`Nuevo cliente conectado: ${socket.id}`);
  
  // Manejar eventos de monitoreo de servidores
  socket.on('join-server-room', (serverId) => {
    socket.join(`server-${serverId}`);
    logger.debug(`Cliente ${socket.id} se unió a la sala del servidor ${serverId}`);
  });
  
  socket.on('leave-server-room', (serverId) => {
    socket.leave(`server-${serverId}`);
    logger.debug(`Cliente ${socket.id} abandonó la sala del servidor ${serverId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Cliente desconectado: ${socket.id}`);
  });
});

// Middleware de manejo de errores
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Recurso no encontrado'
  });
});

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  logger.debug(err.stack);
  
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  
  res.status(statusCode).json({
    status: status,
    message: err.message || 'Error interno del servidor'
  });
});

// Iniciar el servidor
async function startServer() {
  await connectToDatabase();
  
  // Verificar si el puerto está en uso antes de iniciar el servidor
  const tryListen = (port) => {
    return new Promise((resolve, reject) => {
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          logger.warn(`Puerto ${port} en uso, intentando con puerto alternativo...`);
          server.close();
          resolve(false);
        } else {
          reject(err);
        }
      });
      
      server.once('listening', () => {
        logger.info(`Servidor ejecutándose en el puerto ${port}`);
        logger.info(`Documentación API disponible en http://localhost:${port}/api-docs`);
        resolve(true);
      });
      
      server.listen(port);
    });
  };
  
  // Intentar con el puerto configurado, si falla, probar con puertos alternativos
  let currentPort = PORT;
  let maxPortAttempts = 5;
  let portAttempt = 0;
  let success = false;
  
  while (!success && portAttempt < maxPortAttempts) {
    try {
      success = await tryListen(currentPort);
      if (!success) {
        // Incrementar el puerto y reintentar
        currentPort++;
        portAttempt++;
      }
    } catch (err) {
      logger.error(`Error al iniciar el servidor en el puerto ${currentPort}: ${err.message}`);
      throw err;
    }
  }
  
  if (!success) {
    throw new Error(`No se pudo iniciar el servidor después de ${maxPortAttempts} intentos`);
  }
}

startServer();

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  logger.error('ERROR NO MANEJADO: RECHAZO DE PROMESA');
  logger.error(err);
  
  // Proporcionar información más detallada sobre el error
  if (err.code === 'EADDRINUSE') {
    logger.error(`El puerto ${PORT} ya está en uso. Intente cambiar el puerto en el archivo .env o detener el proceso que está usando este puerto.`);
  }
  
  // En desarrollo, no cerramos el proceso para permitir correcciones
  if (process.env.NODE_ENV === 'production') {
    // Cerrar servidor y terminar proceso
    server.close(() => {
      process.exit(1);
    });
  } else {
    logger.info('El servidor continuará ejecutándose en modo desarrollo para permitir correcciones.');
  }
});

process.on('uncaughtException', (err) => {
  logger.error('ERROR NO MANEJADO: EXCEPCIÓN NO CAPTURADA');
  logger.error(err);
  
  // Proporcionar información más detallada sobre el error
  if (err.code === 'EADDRINUSE') {
    logger.error(`El puerto ${PORT} ya está en uso. Intente cambiar el puerto en el archivo .env o detener el proceso que está usando este puerto.`);
  }
  
  // En desarrollo, no cerramos el proceso para permitir correcciones
  if (process.env.NODE_ENV === 'production') {
    // Cerrar servidor y terminar proceso
    server.close(() => {
      process.exit(1);
    });
  } else {
    logger.info('El servidor continuará ejecutándose en modo desarrollo para permitir correcciones.');
  }
});

// Exportar para pruebas
module.exports = { app, server, io };