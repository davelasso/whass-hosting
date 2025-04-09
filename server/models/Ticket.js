const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Por favor proporcione un título para el ticket'],
    trim: true,
    maxlength: [100, 'El título no puede tener más de 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Por favor proporcione una descripción del problema'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  server: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    default: null
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['technical', 'billing', 'performance', 'security', 'other'],
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isStaff: {
      type: Boolean,
      default: false
    }
  }],
  attachments: [{
    name: String,
    path: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date,
    default: null
  }
});

// Actualizar la fecha de modificación antes de guardar
TicketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para añadir un mensaje al ticket
TicketSchema.methods.addMessage = function(userId, content, isStaff = false) {
  this.messages.push({
    sender: userId,
    content,
    isStaff
  });
  this.updatedAt = Date.now();
  return this.save();
};

// Método para cambiar el estado del ticket
TicketSchema.methods.changeStatus = function(newStatus, userId = null) {
  this.status = newStatus;
  
  if (newStatus === 'resolved') {
    this.resolvedAt = Date.now();
  }
  
  if (newStatus === 'in-progress' && userId) {
    this.assignedTo = userId;
  }
  
  return this.save();
};

module.exports = mongoose.model('Ticket', TicketSchema);