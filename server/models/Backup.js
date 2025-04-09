const mongoose = require('mongoose');

/**
 * Esquema para los backups de servidores Minecraft
 */
const BackupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del backup es obligatorio'],
    trim: true
  },
  server: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    required: [true, 'El backup debe estar asociado a un servidor']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El backup debe estar asociado a un usuario']
  },
  path: {
    type: String,
    required: [true, 'La ruta del archivo de backup es obligatoria']
  },
  size: {
    type: Number, // Tamaño en bytes
    required: [true, 'El tamaño del backup es obligatorio']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['manual', 'automático', 'pre-actualización', 'programado'],
    default: 'manual'
  },
  status: {
    type: String,
    enum: ['completado', 'en_progreso', 'fallido'],
    default: 'completado'
  },
  description: {
    type: String,
    trim: true
  },
  metadata: {
    serverVersion: String,
    worldSize: Number,
    plugins: [String],
    compressionLevel: Number
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Por defecto, los backups expiran en 30 días
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    }
  }
}, {
  timestamps: true
});

// Índices para mejorar las consultas
BackupSchema.index({ server: 1, createdAt: -1 });
BackupSchema.index({ user: 1 });
BackupSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index para borrado automático

module.exports = mongoose.model('Backup', BackupSchema); 