const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'ultimate'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'expired', 'trial'],
    default: 'active'
  },
  stripeSubscriptionId: {
    type: String,
    default: null
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  trialEndsAt: {
    type: Date,
    default: null
  },
  canceledAt: {
    type: Date,
    default: null
  },
  paymentMethod: {
    type: String,
    default: null
  },
  price: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'annual'],
    default: 'monthly'
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  invoices: [{
    invoiceId: String,
    amount: Number,
    status: {
      type: String,
      enum: ['paid', 'unpaid', 'failed'],
      default: 'unpaid'
    },
    date: {
      type: Date,
      default: Date.now
    },
    pdfUrl: String
  }],
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
SubscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para verificar si la suscripción está activa
SubscriptionSchema.methods.isActive = function() {
  if (this.status !== 'active' && this.status !== 'trial') {
    return false;
  }
  
  if (this.endDate && new Date() > this.endDate) {
    return false;
  }
  
  if (this.status === 'trial' && this.trialEndsAt && new Date() > this.trialEndsAt) {
    return false;
  }
  
  return true;
};

// Método para cancelar la suscripción
SubscriptionSchema.methods.cancel = function() {
  this.status = 'canceled';
  this.canceledAt = Date.now();
  this.autoRenew = false;
  return this.save();
};

// Método para renovar la suscripción
SubscriptionSchema.methods.renew = function(durationInDays) {
  const currentEndDate = this.endDate || new Date();
  const newEndDate = new Date(currentEndDate);
  newEndDate.setDate(newEndDate.getDate() + durationInDays);
  
  this.status = 'active';
  this.endDate = newEndDate;
  return this.save();
};

// Método para añadir una factura
SubscriptionSchema.methods.addInvoice = function(invoiceData) {
  this.invoices.push(invoiceData);
  return this.save();
};

module.exports = mongoose.model('Subscription', SubscriptionSchema);