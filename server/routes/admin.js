/**
 * Rutas para el panel de administración
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Controladores
const adminController = require('../controllers/adminController');

// Middleware de autenticación y verificación de rol de administrador
router.use(protect);
router.use(authorize('admin'));

/**
 * @desc    Obtener estadísticas generales del sistema
 * @route   GET /api/admin/stats
 * @access  Admin
 */
router.get('/stats', adminController.getSystemStats);

/**
 * @desc    Obtener todos los usuarios
 * @route   GET /api/admin/users
 * @access  Admin
 */
router.get('/users', adminController.getUsers);

/**
 * @desc    Obtener un usuario específico
 * @route   GET /api/admin/users/:id
 * @access  Admin
 */
router.get('/users/:id', adminController.getUser);

/**
 * @desc    Actualizar un usuario
 * @route   PUT /api/admin/users/:id
 * @access  Admin
 */
router.put('/users/:id', adminController.updateUser);

/**
 * @desc    Eliminar un usuario
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
router.delete('/users/:id', adminController.deleteUser);

/**
 * @desc    Cambiar rol de usuario
 * @route   PUT /api/admin/users/:id/role
 * @access  Admin
 */
router.put('/users/:id/role', adminController.changeUserRole);

/**
 * @desc    Obtener todos los servidores
 * @route   GET /api/admin/servers
 * @access  Admin
 */
router.get('/servers', adminController.getAllServers);

/**
 * @desc    Obtener un servidor específico
 * @route   GET /api/admin/servers/:id
 * @access  Admin
 */
router.get('/servers/:id', adminController.getServerDetails);

/**
 * @desc    Actualizar un servidor
 * @route   PUT /api/admin/servers/:id
 * @access  Admin
 */
router.put('/servers/:id', adminController.updateServer);

/**
 * @desc    Eliminar un servidor
 * @route   DELETE /api/admin/servers/:id
 * @access  Admin
 */
router.delete('/servers/:id', adminController.deleteServer);

/**
 * @desc    Suspender un servidor
 * @route   POST /api/admin/servers/:id/suspend
 * @access  Admin
 */
router.post('/servers/:id/suspend', adminController.suspendServer);

/**
 * @desc    Reactivar un servidor
 * @route   POST /api/admin/servers/:id/unsuspend
 * @access  Admin
 */
router.post('/servers/:id/unsuspend', adminController.unsuspendServer);

/**
 * @desc    Obtener todas las suscripciones
 * @route   GET /api/admin/subscriptions
 * @access  Admin
 */
router.get('/subscriptions', adminController.getAllSubscriptions);

/**
 * @desc    Obtener una suscripción específica
 * @route   GET /api/admin/subscriptions/:id
 * @access  Admin
 */
router.get('/subscriptions/:id', adminController.getSubscription);

/**
 * @desc    Actualizar una suscripción
 * @route   PUT /api/admin/subscriptions/:id
 * @access  Admin
 */
router.put('/subscriptions/:id', adminController.updateSubscription);

/**
 * @desc    Obtener todos los tickets de soporte
 * @route   GET /api/admin/tickets
 * @access  Admin
 */
router.get('/tickets', adminController.getAllTickets);

/**
 * @desc    Obtener un ticket específico
 * @route   GET /api/admin/tickets/:id
 * @access  Admin
 */
router.get('/tickets/:id', adminController.getTicket);

/**
 * @desc    Actualizar un ticket
 * @route   PUT /api/admin/tickets/:id
 * @access  Admin
 */
router.put('/tickets/:id', adminController.updateTicket);

/**
 * @desc    Asignar un ticket a un miembro del staff
 * @route   PUT /api/admin/tickets/:id/assign
 * @access  Admin
 */
router.put('/tickets/:id/assign', adminController.assignTicket);

/**
 * @desc    Responder a un ticket
 * @route   POST /api/admin/tickets/:id/reply
 * @access  Admin
 */
router.post('/tickets/:id/reply', adminController.replyToTicket);

/**
 * @desc    Cerrar un ticket
 * @route   PUT /api/admin/tickets/:id/close
 * @access  Admin
 */
router.put('/tickets/:id/close', adminController.closeTicket);

/**
 * @desc    Obtener logs del sistema
 * @route   GET /api/admin/logs
 * @access  Admin
 */
router.get('/logs', adminController.getSystemLogs);

/**
 * @desc    Configurar planes de suscripción
 * @route   PUT /api/admin/plans
 * @access  Admin
 */
router.put('/plans', adminController.updateSubscriptionPlans);

/**
 * @desc    Obtener planes de suscripción
 * @route   GET /api/admin/plans
 * @access  Admin
 */
router.get('/plans', adminController.getSubscriptionPlans);

module.exports = router;