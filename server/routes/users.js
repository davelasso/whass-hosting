/**
 * Rutas para la gestión de usuarios y perfiles
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Middleware de autenticación para todas las rutas
router.use(protect);

/**
 * @desc    Obtener perfil del usuario actual
 * @route   GET /api/users/profile
 * @access  Private
 */
router.get('/profile', userController.getUserProfile);

/**
 * @desc    Actualizar perfil del usuario
 * @route   PUT /api/users/profile
 * @access  Private
 */
router.put('/profile', userController.updateUserProfile);

/**
 * @desc    Cambiar contraseña del usuario
 * @route   PUT /api/users/password
 * @access  Private
 */
router.put('/password', userController.changePassword);

/**
 * @desc    Obtener suscripción actual del usuario
 * @route   GET /api/users/subscription
 * @access  Private
 */
router.get('/subscription', userController.getUserSubscription);

/**
 * @desc    Obtener historial de facturas del usuario
 * @route   GET /api/users/invoices
 * @access  Private
 */
router.get('/invoices', userController.getUserInvoices);

/**
 * @desc    Obtener métodos de pago del usuario
 * @route   GET /api/users/payment-methods
 * @access  Private
 */
router.get('/payment-methods', userController.getPaymentMethods);

/**
 * @desc    Agregar método de pago
 * @route   POST /api/users/payment-methods
 * @access  Private
 */
router.post('/payment-methods', userController.addPaymentMethod);

/**
 * @desc    Eliminar método de pago
 * @route   DELETE /api/users/payment-methods/:id
 * @access  Private
 */
router.delete('/payment-methods/:id', userController.deletePaymentMethod);

/**
 * @desc    Establecer método de pago predeterminado
 * @route   PUT /api/users/payment-methods/:id/default
 * @access  Private
 */
router.put('/payment-methods/:id/default', userController.setDefaultPaymentMethod);

/**
 * @desc    Obtener notificaciones del usuario
 * @route   GET /api/users/notifications
 * @access  Private
 */
router.get('/notifications', userController.getUserNotifications);

/**
 * @desc    Marcar notificación como leída
 * @route   PUT /api/users/notifications/:id/read
 * @access  Private
 */
router.put('/notifications/:id/read', userController.markNotificationAsRead);

/**
 * @desc    Actualizar preferencias de notificaciones
 * @route   PUT /api/users/notification-preferences
 * @access  Private
 */
router.put('/notification-preferences', userController.updateNotificationPreferences);

/**
 * @desc    Obtener actividad reciente del usuario
 * @route   GET /api/users/activity
 * @access  Private
 */
router.get('/activity', userController.getUserActivity);

module.exports = router;