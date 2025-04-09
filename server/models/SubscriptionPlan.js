/**
 * Modelo para los planes de suscripción
 */

const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'annual'],
    default: 'monthly'
  },
  features: {
    type: [String],
    default: []
  },
  limits: {
    servers: {
      type: Number,
      required: true
    },
    ram: {
      type: Number,
      required: true
    },
    storage: {
      type: Number,
      required: true
    },
    plugins: {
      type: Number,
      default: -1 // -1 significa ilimitado
    },
    backups: {
      type: Number,
      default: 3
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Actualizar la fecha de modificación antes de guardar
SubscriptionPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para obtener planes activos
SubscriptionPlanSchema.statics.getActivePlans = function() {
  return this.find({ isActive: true }).sort({ price: 1 });
};

// Método para obtener un plan por su ID
SubscriptionPlanSchema.statics.getPlanById = function(planId) {
  return this.findOne({ id: planId, isActive: true });
};

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);