/**
 * Rutas para la gestión de facturación y suscripciones
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const billingController = require('../controllers/billingController');

// Middleware de autenticación para todas las rutas
router.use(protect);

/**
 * @desc    Obtener planes disponibles
 * @route   GET /api/billing/plans
 * @access  Private
 */
router.get('/plans', billingController.getPlans);

/**
 * @desc    Obtener detalles de un plan específico
 * @route   GET /api/billing/plans/:id
 * @access  Private
 */
router.get('/plans/:id', billingController.getPlanDetails);

/**
 * @desc    Suscribirse a un plan
 * @route   POST /api/billing/subscribe
 * @access  Private
 */
router.post('/subscribe', billingController.subscribe);

/**
 * @desc    Cambiar de plan
 * @route   PUT /api/billing/change-plan
 * @access  Private
 */
router.put('/change-plan', billingController.changePlan);

/**
 * @desc    Cancelar suscripción
 * @route   POST /api/billing/cancel
 * @access  Private
 */
router.post('/cancel', billingController.cancelSubscription);

/**
 * @desc    Reactivar suscripción cancelada
 * @route   POST /api/billing/reactivate
 * @access  Private
 */
router.post('/reactivate', billingController.reactivateSubscription);

/**
 * @desc    Obtener suscripción actual
 * @route   GET /api/billing/subscription
 * @access  Private
 */
router.get('/subscription', billingController.getCurrentSubscription);

/**
 * @desc    Obtener historial de facturas
 * @route   GET /api/billing/invoices
 * @access  Private
 */
router.get('/invoices', billingController.getInvoices);

/**
 * @desc    Obtener detalles de una factura específica
 * @route   GET /api/billing/invoices/:id
 * @access  Private
 */
router.get('/invoices/:id', billingController.getInvoiceDetails);

/**
 * @desc    Descargar factura en PDF
 * @route   GET /api/billing/invoices/:id/pdf
 * @access  Private
 */
router.get('/invoices/:id/pdf', billingController.downloadInvoicePdf);

/**
 * @desc    Obtener métodos de pago
 * @route   GET /api/billing/payment-methods
 * @access  Private
 */
router.get('/payment-methods', billingController.getPaymentMethods);

/**
 * @desc    Agregar método de pago
 * @route   POST /api/billing/payment-methods
 * @access  Private
 */
router.post('/payment-methods', billingController.addPaymentMethod);

/**
 * @desc    Eliminar método de pago
 * @route   DELETE /api/billing/payment-methods/:id
 * @access  Private
 */
router.delete('/payment-methods/:id', billingController.deletePaymentMethod);

/**
 * @desc    Establecer método de pago predeterminado
 * @route   PUT /api/billing/payment-methods/:id/default
 * @access  Private
 */
router.put('/payment-methods/:id/default', billingController.setDefaultPaymentMethod);

/**
 * @desc    Crear sesión de pago para Stripe
 * @route   POST /api/billing/create-checkout-session
 * @access  Private
 */
router.post('/create-checkout-session', billingController.createCheckoutSession);

/**
 * @desc    Webhook para eventos de Stripe
 * @route   POST /api/billing/webhook
 * @access  Public
 */
router.post('/webhook', billingController.handleStripeWebhook);

/**
 * @desc    Obtener recursos disponibles para actualización
 * @route   GET /api/billing/resources
 * @access  Private
 */
router.get('/resources', billingController.getAvailableResources);

/**
 * @desc    Comprar recursos adicionales
 * @route   POST /api/billing/resources
 * @access  Private
 */
router.post('/resources', billingController.purchaseAdditionalResources);

module.exports = router;