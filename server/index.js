/**
 * Servidor principal para la plataforma Whass
 * Gestiona la API REST para hosting de servidores Minecraft
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Configuración de variables de entorno
const PORT = process.env.PORT || 5000;

// Importar rutas
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');
const serverRoutes = require('./routes/servers');

// Inicializar la aplicación Express
const app = express();

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
  origin: '*', // Permitir todas las solicitudes desde cualquier origen (en producción restringe esto)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/api/', apiLimiter); // Aplicar rate limiting a todas las rutas de la API

// Configurar límites de solicitudes más generosos
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // limitar a 500 solicitudes por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    success: false, 
    message: 'Demasiadas solicitudes, por favor intenta de nuevo en 15 minutos.' 
  }
}));

// Health check endpoint directo - MUY IMPORTANTE PARA RENDER
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/servers', serverRoutes);

// API de planes de hosting
app.get('/api/plans', (req, res) => {
  res.status(200).json({
    success: true,
    data: [
      {
        id: 'sandstone',
        name: 'Plan Sandstone',
        price: 1.50,
        specs: {
          cpu: '1 vCore',
          ram: '1GB',
          storage: '10GB SSD',
          processor: 'Ryzen 5 5600X',
          backups: 3,
          location: 'Miami, Florida'
        },
        features: [
          'Panel de control',
          'Backups automáticos',
          'Instalación con 1 click',
          'Protección DDoS',
          'Soporte 24/7'
        ],
        recommended: false
      },
      {
        id: 'stone',
        name: 'Plan Stone',
        price: 3.00,
        specs: {
          cpu: '1 vCore',
          ram: '2GB',
          storage: '10GB SSD',
          processor: 'Ryzen 5 5600X',
          backups: 3,
          location: 'Miami, Florida'
        },
        features: [
          'Panel de control',
          'Backups automáticos',
          'Instalación con 1 click',
          'Protección DDoS',
          'Soporte 24/7'
        ],
        recommended: false
      },
      {
        id: 'lapislazuli',
        name: 'Plan Lapislázuli',
        price: 4.50,
        specs: {
          cpu: '2 vCore',
          ram: '3GB',
          storage: '20GB SSD',
          processor: 'Ryzen 5 5600X',
          backups: 3,
          location: 'Miami, Florida'
        },
        features: [
          'Panel de control',
          'Backups automáticos',
          'Instalación con 1 click',
          'Protección DDoS',
          'Soporte 24/7',
          'Dominio gratuito'
        ],
        recommended: false
      },
      {
        id: 'hierro',
        name: 'Plan Hierro',
        price: 6.00,
        specs: {
          cpu: '2 vCore',
          ram: '4GB',
          storage: '20GB SSD',
          processor: 'Ryzen 5 5600X',
          backups: 3,
          location: 'Miami, Florida'
        },
        features: [
          'Panel de control',
          'Backups automáticos',
          'Instalación con 1 click',
          'Protección DDoS',
          'Soporte 24/7',
          'Dominio gratuito',
          'Plugins premium'
        ],
        recommended: true
      }
    ]
  });
});

// Middleware de manejo de errores para rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Recurso no encontrado'
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  
  res.status(statusCode).json({
    status: status,
    message: err.message || 'Error interno del servidor'
  });
});

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`API disponible en http://localhost:${PORT}/api/health`);
  console.log(`Health check disponible en http://localhost:${PORT}/health`);
});