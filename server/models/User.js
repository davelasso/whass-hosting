const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Por favor ingresa un nombre de usuario'],
    unique: true,
    trim: true,
    minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'],
    maxlength: [20, 'El nombre de usuario no puede tener más de 20 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Por favor ingresa un email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingresa un email válido'
    ],
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Por favor ingresa una contraseña'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'support'],
    default: 'user'
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'standard', 'premium', 'custom'],
    default: 'free'
  },
  resources: {
    ram: {
      type: Number, // RAM en MB
      default: 1024
    },
    cpu: {
      type: Number, // Límite de CPU (1 = 1 core)
      default: 1
    },
    storage: {
      type: Number, // Almacenamiento en GB
      default: 5
    },
    maxServers: {
      type: Number,
      default: 1
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  subscription: {
    id: String,
    status: String,
    currentPeriodEnd: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Encriptar contraseña antes de guardar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseñas
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método para generar token JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Método para generar token de verificación
UserSchema.methods.getVerificationToken = function() {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
  
  this.verificationToken = token;
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 horas
  
  return token;
};

// Método para generar token de reset de contraseña
UserSchema.methods.getResetPasswordToken = function() {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
  
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hora
  
  return token;
};

// Método para actualizar los límites de recursos según el plan
UserSchema.methods.updateResourceLimits = function() {
  switch (this.plan) {
    case 'free':
      this.resources = {
        ram: 1024,
        cpu: 1,
        storage: 5,
        maxServers: 1
      };
      break;
    case 'basic':
      this.resources = {
        ram: 2048,
        cpu: 2,
        storage: 10,
        maxServers: 2
      };
      break;
    case 'standard':
      this.resources = {
        ram: 4096,
        cpu: 4,
        storage: 20,
        maxServers: 3
      };
      break;
    case 'premium':
      this.resources = {
        ram: 8192,
        cpu: 8,
        storage: 50,
        maxServers: 5
      };
      break;
    case 'custom':
      // Implementar lógica para actualizar recursos personalizados
      break;
    default:
      break;
  }
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);