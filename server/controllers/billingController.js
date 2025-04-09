/**
 * Controlador para la gestión de facturación y suscripciones
 */

const User = require('../models/User');
const Subscription = require('../models/Subscription');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * @desc    Obtener planes disponibles
 * @route   GET /api/billing/plans
 * @access  Private
 */
exports.getPlans = async (req, res) => {
  try {
    // Definir planes disponibles
    const plans = [
      {
        id: 'free',
        name: 'Plan Gratuito',
        price: 0,
        currency: 'USD',
        description: 'Ideal para probar la plataforma',
        features: [
          '1 servidor',
          '1GB de RAM',
          '1 núcleo de CPU',
          '5GB de almacenamiento',
          'Sin soporte prioritario'
        ],
        resourceLimits: {
          servers: 1,
          ram: 1024,
          cpu: 1,
          storage: 5
        }
      },
      {
        id: 'basic',
        name: 'Plan Básico',
        price: 9.99,
        currency: 'USD',
        description: 'Perfecto para servidores pequeños',
        features: [
          '2 servidores',
          '2GB de RAM',
          '2 núcleos de CPU',
          '10GB de almacenamiento',
          'Soporte por email'
        ],
        resourceLimits: {
          servers: 2,
          ram: 2048,
          cpu: 2,
          storage: 10
        }
      },
      {
        id: 'premium',
        name: 'Plan Premium',
        price: 19.99,
        currency: 'USD',
        description: 'Para servidores con más jugadores',
        features: [
          '3 servidores',
          '4GB de RAM',
          '3 núcleos de CPU',
          '20GB de almacenamiento',
          'Soporte prioritario'
        ],
        resourceLimits: {
          servers: 3,
          ram: 4096,
          cpu: 3,
          storage: 20
        }
      },
      {
        id: 'ultimate',
        name: 'Plan Ultimate',
        price: 39.99,
        currency: 'USD',
        description: 'Máximo rendimiento para grandes comunidades',
        features: [
          '5 servidores',
          '8GB de RAM',
          '4 núcleos de CPU',
          '50GB de almacenamiento',
          'Soporte 24/7'
        ],
        resourceLimits: {
          servers: 5,
          ram: 8192,
          cpu: 4,
          storage: 50
        }
      }
    ];
    
    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error al obtener planes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener planes disponibles',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener detalles de un plan específico
 * @route   GET /api/billing/plans/:id
 * @access  Private
 */
exports.getPlanDetails = async (req, res) => {
  try {
    const planId = req.params.id;
    
    // Obtener todos los planes
    const plans = await this.getPlansData();
    
    // Encontrar el plan solicitado
    const plan = plans.find(p => p.id === planId);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error al obtener detalles del plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles del plan',
      error: error.message
    });
  }
};

/**
 * @desc    Suscribirse a un plan
 * @route   POST /api/billing/subscribe
 * @access  Private
 */
exports.subscribe = async (req, res) => {
  try {
    const { planId, paymentMethodId } = req.body;
    
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID del plan'
      });
    }
    
    // Obtener usuario
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar si ya tiene una suscripción activa
    const existingSubscription = await Subscription.findOne({
      user: user._id,
      status: { $in: ['active', 'trial'] }
    });
    
    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes una suscripción activa. Cancela la actual antes de suscribirte a un nuevo plan.'
      });
    }
    
    // Obtener detalles del plan
    const plans = await this.getPlansData();
    const plan = plans.find(p => p.id === planId);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan no encontrado'
      });
    }
    
    // Si es un plan gratuito, crear suscripción sin procesar pago
    if (plan.price === 0) {
      const subscription = new Subscription({
        user: user._id,
        plan: planId,
        status: 'active',
        startDate: Date.now(),
        price: 0,
        currency: 'USD',
        billingCycle: 'monthly'
      });
      
      await subscription.save();
      
      // Actualizar plan del usuario y límites de recursos
      user.plan = planId;
      user.resourceLimits = plan.resourceLimits;
      await user.save();
      
      return res.status(201).json({
        success: true,
        message: 'Suscripción al plan gratuito activada correctamente',
        data: subscription
      });
    }
    
    // Para planes de pago, procesar con Stripe
    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un método de pago para suscribirse a este plan'
      });
    }
    
    // Crear o recuperar cliente en Stripe
    let stripeCustomer;
    
    if (user.stripeCustomerId) {
      stripeCustomer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: user.username,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });
      
      // Guardar ID de cliente de Stripe en el usuario
      user.stripeCustomerId = stripeCustomer.id;
      await user.save();
    }
    
    // Crear suscripción en Stripe
    // Nota: En una implementación real, deberías tener productos y precios configurados en Stripe
    // Este es un ejemplo simplificado
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomer.id,
      items: [
        { price: `price_${planId}` } // ID del precio en Stripe
      ],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });
    
    // Crear suscripción en la base de datos
    const subscription = new Subscription({
      user: user._id,
      plan: planId,
      status: 'active',
      stripeSubscriptionId: stripeSubscription.id,
      stripeCustomerId: stripeCustomer.id,
      startDate: Date.now(),
      price: plan.price,
      currency: plan.currency,
      billingCycle: 'monthly',
      paymentMethod: paymentMethodId
    });
    
    await subscription.save();
    
    // Actualizar plan del usuario y límites de recursos
    user.plan = planId;
    user.resourceLimits = plan.resourceLimits;
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Suscripción creada correctamente',
      data: {
        subscription,
        clientSecret: stripeSubscription.latest_invoice.payment_intent.client_secret
      }
    });
  } catch (error) {
    console.error('Error al suscribirse al plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la suscripción',
      error: error.message
    });
  }
};

/**
 * @desc    Cambiar de plan
 * @route   PUT /api/billing/change-plan
 * @access  Private
 */
exports.changePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID del nuevo plan'
      });
    }
    
    // Obtener usuario
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar si tiene una suscripción activa
    const subscription = await Subscription.findOne({
      user: user._id,
      status: { $in: ['active', 'trial'] }
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una suscripción activa'
      });
    }
    
    // Obtener detalles del nuevo plan
    const plans = await this.getPlansData();
    const newPlan = plans.find(p => p.id === planId);
    
    if (!newPlan) {
      return res.status(404).json({
        success: false,
        message: 'Plan no encontrado'
      });
    }
    
    // Si tiene una suscripción en Stripe, actualizarla
    if (subscription.stripeSubscriptionId) {
      // Actualizar suscripción en Stripe
      // Nota: En una implementación real, deberías tener productos y precios configurados en Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        items: [
          {
            id: subscription.stripeSubscriptionId,
            price: `price_${planId}` // ID del precio en Stripe
          }
        ],
        proration_behavior: 'create_prorations'
      });
    }
    
    // Actualizar suscripción en la base de datos
    subscription.plan = planId;
    subscription.price = newPlan.price;
    await subscription.save();
    
    // Actualizar plan del usuario y límites de recursos
    user.plan = planId;
    user.resourceLimits = newPlan.resourceLimits;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Plan actualizado correctamente',
      data: subscription
    });
  } catch (error) {
    console.error('Error al cambiar de plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar de plan',
      error: error.message
    });
  }
};

/**
 * @desc    Cancelar suscripción
 * @route   POST /api/billing/cancel
 * @access  Private
 */
exports.cancelSubscription = async (req, res) => {
  try {
    // Obtener usuario
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar si tiene una suscripción activa
    const subscription = await Subscription.findOne({
      user: user._id,
      status: { $in: ['active', 'trial'] }
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una suscripción activa'
      });
    }
    
    // Si tiene una suscripción en Stripe, cancelarla
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.del(subscription.stripeSubscriptionId);
    }
    
    // Actualizar suscripción en la base de datos
    subscription.status = 'canceled';
    subscription.canceledAt = Date.now();
    await subscription.save();
    
    // Cambiar al plan gratuito
    user.plan = 'free';
    user.resourceLimits = {
      servers: 1,
      ram: 1024,
      cpu: 1,
      storage: 5
    };
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Suscripción cancelada correctamente'
    });
  } catch (error) {
    console.error('Error al cancelar suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar suscripción',
      error: error.message
    });
  }
};

/**
 * @desc    Reactivar suscripción cancelada
 * @route   POST /api/billing/reactivate
 * @access  Private
 */
exports.reactivateSubscription = async (req, res) => {
  try {
    // Obtener usuario
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar si tiene una suscripción cancelada recientemente
    const subscription = await Subscription.findOne({
      user: user._id,
      status: 'canceled',
      canceledAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Cancelada en los últimos 30 días
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una suscripción cancelada recientemente que pueda ser reactivada'
      });
    }
    
    // Si tenía una suscripción en Stripe, reactivarla
    if (subscription.stripeSubscriptionId) {
      // Crear nueva suscripción en Stripe con los mismos parámetros
      const stripeSubscription = await stripe.subscriptions.create({
        customer: subscription.stripeCustomerId,
        items: [
          { price: `price_${subscription.plan}` } // ID del precio en Stripe
        ],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent']
      });
      
      subscription.stripeSubscriptionId = stripeSubscription.id;
    }
    
    // Actualizar suscripción en la base de datos
    subscription.status = 'active';
    subscription.canceledAt = null;
    await subscription.save();
    
    // Restaurar plan y límites de recursos
    user.plan = subscription.plan;
    
    // Obtener límites de recursos del plan
    const plans = await this.getPlansData();
    const plan = plans.find(p => p.id === subscription.plan);
    
    if (plan) {
      user.resourceLimits = plan.resourceLimits;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Suscripción reactivada correctamente',
      data: subscription
    });
  } catch (error) {
    console.error('Error al reactivar suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reactivar suscripción',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener suscripción actual
 * @route   GET /api/billing/subscription
 * @access  Private
 */
exports.getCurrentSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: { $in: ['active', 'trial'] }
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No tienes una suscripción activa'
      });
    }
    
    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error al obtener suscripción actual:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información de la suscripción',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener historial de facturas
 * @route   GET /api/billing/invoices
 * @access  Private
 */
exports.getInvoices = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id });
    
    if (!subscriptions || subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron suscripciones para este usuario'
      });
    }
    
    // Extraer todas las facturas de todas las suscripciones
    const invoices = subscriptions.reduce((allInvoices, subscription) => {
      return allInvoices.concat(
        subscription.invoices.map(invoice => ({
          ...invoice.toObject(),
          plan: subscription.plan,
          subscriptionId: subscription._id
        }))
      );
    }, []);
    
    // Ordenar por fecha, más reciente primero
    invoices.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de facturas',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener detalles de una factura específica
 * @route   GET /api/billing/invoices/:id
 * @access  Private
 */
exports.getInvoiceDetails = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    
    // Buscar la factura en todas las suscripciones del usuario
    const subscription = await Subscription.findOne({
      user: req.user.id,
      'invoices.invoiceId': invoiceId
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }
    
    // Encontrar la factura específica
    const invoice = subscription.invoices.find(inv => inv.invoiceId === invoiceId);
    
    res.status(200).json({
      success: true,
      data: {
        ...invoice.toObject(),
        plan: subscription.plan,
        subscriptionId: subscription._id
      }
    });
  } catch (error) {
    console.error('Error al obtener detalles de factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles de factura',
      error: error.message
    });
  }
};

/**
 * @desc    Descargar factura en PDF
 * @route   GET /api/billing/invoices/:id/pdf
 * @access  Private
 */
exports.downloadInvoicePdf = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    
    // Buscar la factura en todas las suscripciones del usuario
    const subscription = await Subscription.findOne({
      user: req.user.id,
      'invoices.invoiceId': invoiceId
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }
    
    // Encontrar la factura específica
    const invoice = subscription.invoices.find(inv => inv.invoiceId === invoiceId);
    
    if (!invoice.pdfUrl) {
      return res.status(404).json({
        success: false,
        message: 'PDF de factura no disponible'
      });
    }
    
    // En una implementación real, aquí se generaría o recuperaría el PDF
    // y se enviaría como respuesta
    
    res.status(200).json({
      success: true,
      data: {
        pdfUrl: invoice.pdfUrl
      }
    });
  } catch (error) {
    console.error('Error al descargar factura PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar factura PDF',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener métodos de pago
 * @route   GET /api/billing/payment-methods
 * @access  Private
 */
exports.getPaymentMethods = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    if (!user.stripeCustomerId) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    // Obtener métodos de pago desde Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card'
    });
    
    res.status(200).json({
      success: true,
      count: paymentMethods.data.length,
      data: paymentMethods.data
    });
  } catch (error) {
    console.error('Error al obtener métodos de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener métodos de pago',
      error: error.message
    });
  }
};

/**
 * @desc    Agregar método de pago
 * @route   POST /api/billing/payment-methods
 * @access  Private
 */
exports.addPaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    
    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID del método de pago'
      });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Si el usuario no tiene un ID de cliente en Stripe, crear uno
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });
      
      user.stripeCustomerId = customer.id;
      await user.save();
    } else {
      // Asociar método de pago al cliente existente
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: user.stripeCustomerId
      });
      
      // Establecer como método de pago predeterminado
      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });
    }
    
    // Obtener el método de pago actualizado
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    
    res.status(201).json({
      success: true,
      message: 'Método de pago agregado correctamente',
      data: paymentMethod
    });
  } catch (error) {
    console.error('Error al agregar método de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar método de pago',
      error: error.message
    });
  }
};

/**
 * @desc    Eliminar método de pago
 * @route   DELETE /api/billing/payment-methods/:id
 * @access  Private
 */
exports.deletePaymentMethod = async (req, res) => {
  try {
    const paymentMethodId = req.params.id;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    if (!user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'No tienes métodos de pago registrados'
      });
    }
    
    // Verificar si es el método de pago predeterminado
    const customer = await stripe.customers.retrieve(user.stripeCustomerId);
    
    if (customer.invoice_settings.default_payment_method === paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu método de pago predeterminado. Establece otro método como predeterminado primero.'
      });
    }
    
    // Desvincular método de pago
    await stripe.paymentMethods.detach(paymentMethodId);
    
    res.status(200).json({
      success: true,
      message: 'Método de pago eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar método de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar método de pago',
      error: error.message
    });
  }
};

/**
 * @desc    Establecer método de pago predeterminado
 * @route   PUT /api/billing/payment-methods/:id/default
 * @access  Private
 */
exports.setDefaultPaymentMethod = async (req, res) => {
  try {
    const paymentMethodId = req.params.id;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    if (!user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'No tienes métodos de pago registrados'
      });
    }
    
    // Verificar que el método de pago existe y pertenece al usuario
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card'
    });
    
    const paymentMethodExists = paymentMethods.data.some(pm => pm.id === paymentMethodId);
    
    if (!paymentMethodExists) {
      return res.status(404).json({
        success: false,
        message: 'Método de pago no encontrado'
      });
    }
    
    // Establecer como método de pago predeterminado
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Método de pago predeterminado actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al establecer método de pago predeterminado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al establecer método de pago predeterminado',
      error: error.message
    });
  }
};

/**
 * @desc    Crear sesión de pago para Stripe
 * @route   POST /api/billing/create-checkout-session
 * @access  Private
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    const { planId } = req.body;
    
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID del plan'
      });
    }
    
    // Obtener usuario
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Obtener detalles del plan
    const plans = await this.getPlansData();
    const plan = plans.find(p => p.id === planId);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan no encontrado'
      });
    }
    
    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.email,
      client_reference_id: user._id.toString(),
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: plan.name,
              description: plan.description
            },
            unit_amount: Math.round(plan.price * 100), // Convertir a centavos
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/billing/cancel`
    });
    
    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Error al crear sesión de checkout:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear sesión de checkout',
      error: error.message
    });
  }
};

/**
 * @desc    Webhook para eventos de Stripe
 * @route   POST /api/billing/webhook
 * @access  Public
 */
exports.handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;
    
    // Verificar firma del webhook
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Error de firma de webhook:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Manejar eventos específicos
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Evento no manejado: ${event.type}`);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error en webhook de Stripe:', error);
    res.status(500).json({
      success: false,
      message: 'Error en webhook de Stripe',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener recursos disponibles para actualización
 * @route   GET /api/billing/resources
 * @access  Private
 */
exports.getAvailableResources = async (req, res) => {
  try {
    // Definir recursos adicionales disponibles para compra
    const resources = [
      {
        id: 'ram_1gb',
        name: '1GB RAM adicional',
        description: 'Aumenta la memoria RAM de tus servidores',
        price: 5.99,
        currency: 'USD',
        resource: 'ram',
        amount: 1024 // MB
      },
      {
        id: 'ram_2gb',
        name: '2GB RAM adicional',
        description: 'Aumenta la memoria RAM de tus servidores',
        price: 9.99,
        currency: 'USD',
        resource: 'ram',
        amount: 2048 // MB
      },
      {
        id: 'cpu_1core',
        name: '1 núcleo CPU adicional',
        description: 'Aumenta la potencia de procesamiento de tus servidores',
        price: 7.99,
        currency: 'USD',
        resource: 'cpu',
        amount: 1 // Cores
      },
      {
        id: 'storage_5gb',
        name: '5GB almacenamiento adicional',
        description: 'Aumenta el espacio de almacenamiento de tus servidores',
        price: 3.99,
        currency: 'USD',
        resource: 'storage',
        amount: 5 // GB
      },
      {
        id: 'storage_10gb',
        name: '10GB almacenamiento adicional',
        description: 'Aumenta el espacio de almacenamiento de tus servidores',
        price: 6.99,
        currency: 'USD',
        resource: 'storage',
        amount: 10 // GB
      },
      {
        id: 'server_slot',
        name: 'Slot de servidor adicional',
        description: 'Permite crear un servidor adicional',
        price: 12.99,
        currency: 'USD',
        resource: 'servers',
        amount: 1 // Servidor
      }
    ];
    
    res.status(200).json({
      success: true,
      data: resources
    });
  } catch (error) {
    console.error('Error al obtener recursos disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recursos disponibles',
      error: error.message
    });
  }
};

/**
 * @desc    Comprar recursos adicionales
 * @route   POST /api/billing/resources
 * @access  Private
 */
exports.purchaseAdditionalResources = async (req, res) => {
  try {
    const { resourceId, paymentMethodId } = req.body;
    
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID del recurso'
      });
    }
    
    // Obtener usuario
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Obtener detalles del recurso
    const resources = await this.getAvailableResources();
    const resource = resources.data.find(r => r.id === resourceId);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado'
      });
    }
    
    // Verificar método de pago
    if (!paymentMethodId && !user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un método de pago'
      });
    }
    
    // Procesar pago con Stripe
    let paymentIntent;
    
    if (user.stripeCustomerId) {
      // Usar cliente existente
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(resource.price * 100), // Convertir a centavos
        currency: resource.currency,
        customer: user.stripeCustomerId,
        payment_method: paymentMethodId || undefined,
        confirm: true,
        description: `Compra de recurso adicional: ${resource.name}`
      });
    } else {
      // Crear nuevo cliente
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
        payment_method: paymentMethodId
      });
      
      user.stripeCustomerId = customer.id;
      await user.save();
      
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(resource.price * 100), // Convertir a centavos
        currency: resource.currency,
        customer: customer.id,
        payment_method: paymentMethodId,
        confirm: true,
        description: `Compra de recurso adicional: ${resource.name}`
      });
    }
    
    // Actualizar límites de recursos del usuario
    user.resourceLimits[resource.resource] += resource.amount;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `Recurso ${resource.name} adquirido correctamente`,
      data: {
        resource,
        newLimits: user.resourceLimits
      }
    });
  } catch (error) {
    console.error('Error al comprar recursos adicionales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la compra de recursos adicionales',
      error: error.message
    });
  }
};

// Funciones auxiliares para manejar eventos de webhook

async function handleCheckoutSessionCompleted(session) {
  try {
    const userId = session.client_reference_id;
    const user = await User.findById(userId);
    
    if (!user) {
      console.error('Usuario no encontrado para la sesión de checkout:', session.id);
      return;
    }
    
    // Obtener detalles de la suscripción
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // Determinar el plan basado en el precio
    const priceId = subscription.items.data[0].price.id;
    const planId = priceId.replace('price_', ''); // Extraer ID del plan del ID del precio
    
    // Crear suscripción en la base de datos
    const newSubscription = new Subscription({
      user: userId,
      plan: planId,
      status: 'active',
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: session.customer,
      startDate: new Date(subscription.current_period_start * 1000),
      endDate: new Date(subscription.current_period_end * 1000),
      price: subscription.items.data[0].price.unit_amount / 100, // Convertir de centavos
      currency: subscription.currency,
      billingCycle: 'monthly',
      autoRenew: true
    });
    
    await newSubscription.save();
    
    // Actualizar plan del usuario y límites de recursos
    const plans = await exports.getPlansData();
    const plan = plans.find(p => p.id === planId);
    
    if (plan) {
      user.plan = planId;
      user.resourceLimits = plan.resourceLimits;
      await user.save();
    }
  } catch (error) {
    console.error('Error al procesar checkout.session.completed:', error);
  }
}

async function handleInvoicePaid(invoice) {
  try {
    // Buscar suscripción por ID de Stripe
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: invoice.subscription
    });
    
    if (!subscription) {
      console.error('Suscripción no encontrada para la factura:', invoice.id);
      return;
    }
    
    // Agregar factura a la suscripción
    subscription.invoices.push({
      invoiceId: invoice.id,
      amount: invoice.amount_paid / 100, // Convertir de centavos
      status: 'paid',
      date: new Date(invoice.created * 1000),
      pdfUrl: invoice.invoice_pdf
    });
    
    // Actualizar fecha de fin de suscripción
    const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription);
    subscription.endDate = new Date(stripeSubscription.current_period_end * 1000);
    
    await subscription.save();
  } catch (error) {
    console.error('Error al procesar invoice.paid:', error);
  }
}

async function handleInvoicePaymentFailed(invoice) {
  try {
    // Buscar suscripción por ID de Stripe
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: invoice.subscription
    });
    
    if (!subscription) {
      console.error('Suscripción no encontrada para la factura fallida:', invoice.id);
      return;
    }
    
    // Agregar factura fallida a la suscripción
    subscription.invoices.push({
      invoiceId: invoice.id,
      amount: invoice.amount_due / 100, // Convertir de centavos
      status: 'failed',
      date: new Date(invoice.created * 1000)
    });
    
    await subscription.save();
    
    // Si hay demasiados intentos fallidos, la suscripción podría cancelarse automáticamente
    // Esto sería manejado por el evento customer.subscription.deleted
  } catch (error) {
    console.error('Error al procesar invoice.payment_failed:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    // Buscar suscripción por ID de Stripe
    const dbSubscription = await Subscription.findOne({
      stripeSubscriptionId: subscription.id
    });
    
    if (!dbSubscription) {
      console.error('Suscripción no encontrada para la cancelación:', subscription.id);
      return;
    }
    
    // Actualizar estado de la suscripción
    dbSubscription.status = 'canceled';
    dbSubscription.canceledAt = new Date();
    await dbSubscription.save();
    
    // Cambiar al plan gratuito
    const user = await User.findById(dbSubscription.user);
    if (user) {
      user.plan = 'free';
      user.resourceLimits = {
        servers: 1,
        ram: 1024,
        cpu: 1,
        storage: 5
      };
      await user.save();
    }
  } catch (error) {
    console.error('Error al procesar customer.subscription.deleted:', error);
  }
}