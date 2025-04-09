/**
 * Rutas para el sistema de soporte técnico
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const supportController = require('../controllers/supportController');

// Middleware de autenticación para todas las rutas
router.use(protect);

/**
 * @desc    Crear un nuevo ticket de soporte
 * @route   POST /api/support/tickets
 * @access  Private
 */
router.post('/tickets', supportController.createTicket);

/**
 * @desc    Obtener todos los tickets del usuario
 * @route   GET /api/support/tickets
 * @access  Private
 */
router.get('/tickets', supportController.getUserTickets);

/**
 * @desc    Obtener un ticket específico
 * @route   GET /api/support/tickets/:id
 * @access  Private
 */
router.get('/tickets/:id', supportController.getTicket);

/**
 * @desc    Actualizar un ticket
 * @route   PUT /api/support/tickets/:id
 * @access  Private
 */
router.put('/tickets/:id', supportController.updateTicket);

/**
 * @desc    Cerrar un ticket
 * @route   PUT /api/support/tickets/:id/close
 * @access  Private
 */
router.put('/tickets/:id/close', supportController.closeTicket);

/**
 * @desc    Reabrir un ticket
 * @route   PUT /api/support/tickets/:id/reopen
 * @access  Private
 */
router.put('/tickets/:id/reopen', supportController.reopenTicket);

/**
 * @desc    Agregar un mensaje a un ticket
 * @route   POST /api/support/tickets/:id/messages
 * @access  Private
 */
router.post('/tickets/:id/messages', supportController.addMessage);

/**
 * @desc    Subir un archivo adjunto a un ticket
 * @route   POST /api/support/tickets/:id/attachments
 * @access  Private
 */
router.post('/tickets/:id/attachments', supportController.uploadAttachment);

/**
 * @desc    Descargar un archivo adjunto
 * @route   GET /api/support/attachments/:id
 * @access  Private
 */
router.get('/attachments/:id', supportController.downloadAttachment);

/**
 * @desc    Obtener artículos de la base de conocimientos
 * @route   GET /api/support/knowledge-base
 * @access  Private
 */
router.get('/knowledge-base', supportController.getKnowledgeBaseArticles);

/**
 * @desc    Obtener un artículo específico de la base de conocimientos
 * @route   GET /api/support/knowledge-base/:id
 * @access  Private
 */
router.get('/knowledge-base/:id', supportController.getKnowledgeBaseArticle);

/**
 * @desc    Buscar en la base de conocimientos
 * @route   GET /api/support/knowledge-base/search
 * @access  Private
 */
router.get('/knowledge-base/search', supportController.searchKnowledgeBase);

/**
 * @desc    Calificar la utilidad de un artículo
 * @route   POST /api/support/knowledge-base/:id/rate
 * @access  Private
 */
router.post('/knowledge-base/:id/rate', supportController.rateArticle);

/**
 * @desc    Obtener preguntas frecuentes
 * @route   GET /api/support/faq
 * @access  Private
 */
router.get('/faq', supportController.getFaq);

/**
 * @desc    Obtener estado del sistema
 * @route   GET /api/support/system-status
 * @access  Private
 */
router.get('/system-status', supportController.getSystemStatus);

// Rutas para staff de soporte (requieren rol de soporte o admin)
router.use(authorize('admin', 'support'));

/**
 * @desc    Obtener todos los tickets (para staff)
 * @route   GET /api/support/staff/tickets
 * @access  Admin/Support
 */
router.get('/staff/tickets', supportController.getAllTickets);

/**
 * @desc    Asignar un ticket a un miembro del staff
 * @route   PUT /api/support/staff/tickets/:id/assign
 * @access  Admin/Support
 */
router.put('/staff/tickets/:id/assign', supportController.assignTicket);

/**
 * @desc    Cambiar la prioridad de un ticket
 * @route   PUT /api/support/staff/tickets/:id/priority
 * @access  Admin/Support
 */
router.put('/staff/tickets/:id/priority', supportController.changeTicketPriority);

/**
 * @desc    Cambiar la categoría de un ticket
 * @route   PUT /api/support/staff/tickets/:id/category
 * @access  Admin/Support
 */
router.put('/staff/tickets/:id/category', supportController.changeTicketCategory);

/**
 * @desc    Agregar nota interna a un ticket (solo visible para staff)
 * @route   POST /api/support/staff/tickets/:id/notes
 * @access  Admin/Support
 */
router.post('/staff/tickets/:id/notes', supportController.addInternalNote);

module.exports = router;