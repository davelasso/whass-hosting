const mongoose = require('mongoose');

const ServerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, proporcione un nombre para el servidor'],
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['java', 'bedrock'],
    required: [true, 'Por favor, especifique el tipo de servidor (java/bedrock)']
  },
  version: {
    type: String,
    required: [true, 'Por favor, especifique la versión de Minecraft']
  },
  template: {
    type: String,
    enum: ['vanilla', 'spigot', 'paper', 'forge', 'fabric', 'bukkit', 'custom'],
    default: 'vanilla'
  },
  status: {
    type: String,
    enum: ['starting', 'running', 'stopping', 'stopped', 'error', 'suspended', 'pending'],
    default: 'pending'
  },
  resources: {
    ram: {
      type: Number, // RAM en MB
      required: true,
      default: 1024
    },
    cpu: {
      type: Number, // Límite de CPU (1 = 1 core)
      required: true,
      default: 1
    },
    storage: {
      type: Number, // Almacenamiento en GB
      required: true,
      default: 5
    }
  },
  network: {
    ip: {
      type: String,
      default: null
    },
    port: {
      type: Number,
      default: null
    },
    domain: {
      type: String,
      default: null
    }
  },
  containerId: {
    type: String,
    default: null
  },
  properties: {
    type: Map,
    of: String,
    default: {}
  },
  plugins: [{
    name: String,
    version: String,
    enabled: {
      type: Boolean,
      default: true
    },
    installedAt: {
      type: Date,
      default: Date.now
    }
  }],
  backups: [{
    name: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    size: Number, // Tamaño en bytes
    path: String,
    automatic: {
      type: Boolean,
      default: false
    },
    description: String
  }],
  metrics: {
    lastTPS: Number,
    averageTPS: Number,
    peakPlayers: Number,
    uptime: Number, // En segundos
    lastUpdated: Date
  },
  settings: {
    autoRestart: {
      type: Boolean,
      default: true
    },
    backupSchedule: {
      enabled: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'custom'],
        default: 'daily'
      },
      cronExpression: {
        type: String,
        default: '0 0 * * *' // Diariamente a medianoche
      },
      retention: {
        type: Number,
        default: 7 // Número de backups a mantener
      }
    },
    javaArgs: {
      type: String,
      default: '-Xms512M -Xmx1024M -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastStarted: Date,
  lastStopped: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar el rendimiento de las consultas
ServerSchema.index({ user: 1 });
ServerSchema.index({ status: 1 });
ServerSchema.index({ 'network.ip': 1, 'network.port': 1 }, { unique: true, sparse: true });

// Virtual para la URL de conexión
ServerSchema.virtual('connectionUrl').get(function() {
  if (this.network.domain) {
    return this.network.domain;
  } else if (this.network.ip && this.network.port) {
    return `${this.network.ip}:${this.network.port}`;
  }
  return null;
});

// Métodos estáticos
ServerSchema.statics.getServersByUser = function(userId) {
  return this.find({ user: userId });
};

// Middleware pre-save
ServerSchema.pre('save', async function(next) {
  // Generar puerto aleatorio si no está definido y está en estado pendiente
  if (!this.network.port && this.status === 'pending') {
    // Puertos Minecraft típicos entre 25565-25575 para Java, 19132-19142 para Bedrock
    const minPort = this.type === 'java' ? 25565 : 19132;
    const maxPort = this.type === 'java' ? 25575 : 19142;
    let port;
    let isUnique = false;
    
    // Intentar encontrar un puerto único
    while (!isUnique) {
      port = Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort;
      
      // Verificar si el puerto ya está en uso
      const existingServer = await this.constructor.findOne({
        'network.port': port,
        _id: { $ne: this._id } // Excluir el servidor actual
      });
      
      if (!existingServer) {
        isUnique = true;
      }
    }
    
    this.network.port = port;
  }
  
  next();
});

module.exports = mongoose.model('Server', ServerSchema);