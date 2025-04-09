/**
 * Modelo para los logs del sistema
 */

const mongoose = require('mongoose');

const SystemLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  level: {
    type: String,
    enum: ['info', 'warning', 'error', 'debug'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  server: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    default: null
  },
  ip: {
    type: String,
    default: null
  }
});

// Índices para mejorar el rendimiento de las consultas
SystemLogSchema.index({ timestamp: -1 });
SystemLogSchema.index({ level: 1 });
SystemLogSchema.index({ source: 1 });

// Método estático para registrar un nuevo log
SystemLogSchema.statics.logEvent = async function(logData) {
  try {
    return await this.create(logData);
  } catch (error) {
    console.error('Error al registrar log:', error);
    // En caso de error, no queremos que falle la aplicación
    // simplemente registramos el error en la consola
  }
};

module.exports = mongoose.model('SystemLog', SystemLogSchema);