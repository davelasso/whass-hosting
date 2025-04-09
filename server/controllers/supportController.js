/**
 * Controlador para el sistema de soporte técnico
 */

const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Server = require('../models/Server');
const fs = require('fs').promises;
const path = require('path');

/**
 * @desc    Crear un nuevo ticket de soporte
 * @route   POST /api/support/tickets
 * @access  Private
 */
exports.createTicket = async (req, res) => {
  try {
    const { title, description, category, serverId, priority } = req.body;
    
    // Validar campos requeridos
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporcione título, descripción y categoría'
      });
    }
    
    // Verificar si el servidor existe (si se proporciona)
    let server = null;
    if (serverId) {
      server = await Server.findOne({ _id: serverId, owner: req.user.id });
      
      if (!server) {
        return res.status(404).json({
          success: false,
          message: 'Servidor no encontrado o no tienes permisos para acceder a él'
        });
      }
    }
    
    // Crear nuevo ticket
    const ticket = new Ticket({
      title,
      description,
      user: req.user.id,
      server: serverId || null,
      category,
      priority: priority || 'medium',
      messages: [
        {
          sender: req.user.id,
          content: description,
          isStaff: false
        }
      ]
    });
    
    await ticket.save();
    
    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error al crear ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear ticket',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener todos los tickets del usuario
 * @route   GET /api/support/tickets
 * @access  Private
 */
exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .populate('server', 'name type');
    
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tickets',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener un ticket específico
 * @route   GET /api/support/tickets/:id
 * @access  Private
 */
exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'username email')
      .populate('assignedTo', 'username email')
      .populate('server', 'name type status');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }
    
    // Verificar que el ticket pertenece al usuario o es staff
    if (ticket.user._id.toString() !== req.user.id && !['admin', 'support'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este ticket'
      });
    }
    
    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error al obtener ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ticket',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar un ticket
 * @route   PUT /api/support/tickets/:id
 * @access  Private
 */
exports.updateTicket = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    
    let ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }
    
    // Verificar que el ticket pertenece al usuario o es staff
    if (ticket.user.toString() !== req.user.id && !['admin', 'support'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar este ticket'
      });
    }
    
    // Solo el usuario puede actualizar estos campos
    if (ticket.user.toString() === req.user.id) {
      if (title) ticket.title = title;
      if (description) ticket.description = description;
      if (category) ticket.category = category;
    }
    
    // Solo el staff puede actualizar la prioridad
    if (['admin', 'support'].includes(req.user.role)) {
      if (priority) ticket.priority = priority;
    }
    
    await ticket.save();
    
    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error al actualizar ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar ticket',
      error: error.message
    });
  }
};

/**
 * @desc    Cerrar un ticket
 * @route   PUT /api/support/tickets/:id/close
 * @access  Private
 */
exports.closeTicket = async (req, res) => {
  try {
    let ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }
    
    // Verificar que el ticket pertenece al usuario o es staff
    if (ticket.user.toString() !== req.user.id && !['admin', 'support'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para cerrar este ticket'
      });
    }
    
    ticket.status = 'closed';
    await ticket.save();
    
    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error al cerrar ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar ticket',
      error: error.message
    });
  }
};

/**
 * @desc    Reabrir un ticket
 * @route   PUT /api/support/tickets/:id/reopen
 * @access  Private
 */
exports.reopenTicket = async (req, res) => {
  try {
    let ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }
    
    // Verificar que el ticket pertenece al usuario o es staff
    if (ticket.user.toString() !== req.user.id && !['admin', 'support'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para reabrir este ticket'
      });
    }
    
    if (ticket.status !== 'closed') {
      return res.status(400).json({
        success: false,
        message: 'El ticket no está cerrado'
      });
    }
    
    ticket.status = 'open';
    await ticket.save();
    
    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error al reabrir ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reabrir ticket',
      error: error.message
    });
  }
};

/**
 * @desc    Agregar un mensaje a un ticket
 * @route   POST /api/support/tickets/:id/messages
 * @access  Private
 */
exports.addMessage = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'El contenido del mensaje es requerido'
      });
    }
    
    let ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }
    
    // Verificar que el ticket pertenece al usuario o es staff
    if (ticket.user.toString() !== req.user.id && !['admin', 'support'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para responder a este ticket'
      });
    }
    
    // Agregar mensaje
    ticket.messages.push({
      sender: req.user.id,
      content,
      isStaff: ['admin', 'support'].includes(req.user.role)
    });
    
    // Actualizar estado del ticket si está cerrado
    if (ticket.status === 'closed') {
      ticket.status = 'open';
    }
    
    // Si es staff respondiendo a un ticket abierto, cambiarlo a en progreso
    if (['admin', 'support'].includes(req.user.role) && ticket.status === 'open') {
      ticket.status = 'in-progress';
    }
    
    await ticket.save();
    
    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error al agregar mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar mensaje',
      error: error.message
    });
  }
};

/**
 * @desc    Subir un archivo adjunto a un ticket
 * @route   POST /api/support/tickets/:id/attachments
 * @access  Private
 */
exports.uploadAttachment = async (req, res) => {
  try {
    // Verificar si se subió un archivo
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se ha subido ningún archivo'
      });
    }
    
    const file = req.files.file;
    
    // Verificar tamaño del archivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'El archivo no puede superar los 5MB'
      });
    }
    
    let ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }
    
    // Verificar que el ticket pertenece al usuario o es staff
    if (ticket.user.toString() !== req.user.id && !['admin', 'support'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para adjuntar archivos a este ticket'
      });
    }
    
    // Crear directorio para archivos adjuntos si no existe
    const uploadDir = path.join(process.env.UPLOAD_PATH || './uploads', 'tickets', ticket._id.toString());
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Generar nombre de archivo único
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Mover archivo al directorio de uploads
    await file.mv(filePath);
    
    // Agregar archivo adjunto al ticket
    ticket.attachments.push({
      name: file.name,
      path: `/uploads/tickets/${ticket._id}/${fileName}`,
      size: file.size
    });
    
    await ticket.save();
    
    res.status(201).json({
      success: true,
      data: {
        name: file.name,
        path: `/uploads/tickets/${ticket._id}/${fileName}`,
        size: file.size
      }
    });
  } catch (error) {
    console.error('Error al subir archivo adjunto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir archivo adjunto',
      error: error.message
    });
  }
};

/**
 * @desc    Descargar un archivo adjunto
 * @route   GET /api/support/attachments/:id
 * @access  Private
 */
exports.downloadAttachment = async (req, res) => {
  try {
    const attachmentId = req.params.id;
    
    // Buscar el ticket que contiene el archivo adjunto
    const ticket = await Ticket.findOne({ 'attachments._id': attachmentId });
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Archivo adjunto no encontrado'
      });
    }
    
    // Verificar que el ticket pertenece al usuario o es staff
    if (ticket.user.toString() !== req.user.id && !['admin', 'support'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para descargar este archivo'
      });
    }
    
    // Encontrar el archivo adjunto
    const attachment = ticket.attachments.find(att => att._id.toString() === attachmentId);
    
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Archivo adjunto no encontrado'
      });
    }
    
    // Ruta completa del archivo
    const filePath = path.join(process.env.UPLOAD_PATH || './uploads', attachment.path);
    
    // Verificar si el archivo existe
    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado en el servidor'
      });
    }
    
    // Enviar archivo
    res.download(filePath, attachment.name);
  } catch (error) {
    console.error('Error al descargar archivo adjunto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar archivo adjunto',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener artículos de la base de conocimientos
 * @route   GET /api/support/knowledge-base
 * @access  Private
 */
exports.getKnowledgeBaseArticles = async (req, res) => {
  try {
    // Implementar lógica para obtener artículos de la base de conocimientos
    // Ejemplo básico:
    const articles = [
      {
        id: '1',
        title: 'Cómo iniciar tu servidor de Minecraft',
        category: 'Primeros pasos',
        summary: 'Guía básica para iniciar tu servidor de Minecraft por primera vez',
        views: 1250,
        rating: 4.8
      },
      {
        id: '2',
        title: 'Solución a problemas comunes de conexión',
        category: 'Solución de problemas',
        summary: 'Aprende a resolver los problemas más comunes de conexión en servidores de Minecraft',
        views: 980,
        rating: 4.5
      },
      {
        id: '3',
        title: 'Cómo instalar plugins en tu servidor',
        category: 'Configuración',
        summary: 'Guía paso a paso para instalar y configurar plugins en tu servidor de Minecraft',
        views: 1500,
        rating: 4.9
      }
    ];
    
    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    console.error('Error al obtener artículos de la base de conocimientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener artículos de la base de conocimientos',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener un artículo específico de la base de conocimientos
 * @route   GET /api/support/knowledge-base/:id
 * @access  Private
 */
exports.getKnowledgeBaseArticle = async (req, res) => {
  try {
    const articleId = req.params.id;
    
    // Implementar lógica para obtener un artículo específico
    // Ejemplo básico:
    const article = {
      id: articleId,
      title: 'Cómo iniciar tu servidor de Minecraft',
      category: 'Primeros pasos',
      content: '# Cómo iniciar tu servidor de Minecraft\n\nEn esta guía aprenderás a iniciar tu servidor de Minecraft paso a paso...\n\n## Requisitos\n\n- Tener una cuenta activa\n- Haber seleccionado un plan\n\n## Pasos\n\n1. Inicia sesión en tu panel de control\n2. Haz clic en "Crear servidor"\n3. Selecciona la versión de Minecraft\n4. Configura los recursos\n5. Haz clic en "Crear"\n\nUna vez creado, podrás iniciar tu servidor desde el panel de control.',
      views: 1250,
      rating: 4.8,
      relatedArticles: ['2', '3']
    };
    
    res.status(200).json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error al obtener artículo de la base de conocimientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener artículo de la base de conocimientos',
      error: error.message
    });
  }
};

/**
 * @desc    Buscar en la base de conocimientos
 * @route   GET /api/support/knowledge-base/search
 * @access  Private
 */
exports.searchKnowledgeBase = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un término de búsqueda'
      });
    }
    
    // Implementar lógica para buscar artículos
    // Ejemplo básico:
    const articles = [
      {
        id: '1',
        title: 'Cómo iniciar tu servidor de Minecraft',
        category: 'Primeros pasos',
        summary: 'Guía básica para iniciar tu servidor de Minecraft por primera vez',
        views: 1250,
        rating: 4.8
      },
      {
        id: '3',
        title: 'Cómo instalar plugins en tu servidor',
        category: 'Configuración',
        summary: 'Guía paso a paso para instalar y configurar plugins en tu servidor de Minecraft',
        views: 1500,
        rating: 4.9
      }
    ];
    
    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    console.error('Error al buscar en la base de conocimientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar en la base de conocimientos',
      error: error.message
    });
  }
};

/**
 * @desc    Calificar la utilidad de un artículo
 * @route   POST /api/support/knowledge-base/:id/rate
 * @access  Private
 */
exports.rateArticle = async (req, res) => {
  try {
    const { rating } = req.body;
    const articleId = req.params.id;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere una calificación válida (1-5)'
      });
    }
    
    // Implementar lógica para calificar artículo
    // Ejemplo básico:
    const article = {
      id: articleId,
      title: 'Cómo iniciar tu servidor de Minecraft',
      rating: 4.8 // Valor actualizado después de la calificación
    };
    
    res.status(200).json({
      success: true,
      message: 'Artículo calificado correctamente',
      data: article
    });
  } catch (error) {
    console.error('Error al calificar artículo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calificar artículo',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener preguntas frecuentes
 * @route   GET /api/support/faq
 * @access  Private
 */
exports.getFaq = async (req, res) => {
  try {
    // Implementar lógica para obtener preguntas frecuentes
    // Ejemplo básico:
    const faqs = [
      {
        id: '1',
        question: '¿Cómo puedo cambiar la versión de mi servidor?',
        answer: 'Para cambiar la versión de tu servidor, ve al panel de control, selecciona tu servidor, haz clic en "Configuración" y luego en "Cambiar versión". Selecciona la versión deseada y guarda los cambios. Ten en cuenta que cambiar la versión puede requerir un reinicio del servidor.',
        category: 'Configuración'
      },
      {
        id: '2',
        question: '¿Cómo puedo hacer una copia de seguridad de mi servidor?',
        answer: 'Para hacer una copia de seguridad, ve al panel de control, selecciona tu servidor, haz clic en "Backups" y luego en "Crear backup". El sistema creará una copia de seguridad completa de tu servidor que podrás descargar o restaurar en cualquier momento.',
        category: 'Backups'
      },
      {
        id: '3',
        question: '¿Qué hago si mi servidor no responde?',
        answer: 'Si tu servidor no responde, primero intenta reiniciarlo desde el panel de control. Si el problema persiste, verifica los logs del servidor para identificar posibles errores. Si no puedes resolver el problema, crea un ticket de soporte con los detalles del problema.',
        category: 'Solución de problemas'
      }
    ];
    
    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs
    });
  } catch (error) {
    console.error('Error al obtener preguntas frecuentes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener preguntas frecuentes',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener estado del sistema
 * @route   GET /api/support/system-status
 * @access  Private
 */
exports.getSystemStatus = async (req, res) => {
  try {
    // Implementar lógica para obtener estado del sistema
    // Ejemplo básico:
    const systemStatus = {
      status: 'operational',
      components: [
        {
          name: 'Servidores Java',
          status: 'operational'
        },
        {
          name: 'Servidores Bedrock',
          status: 'operational'
        },
        {
          name: 'Panel de control',
          status: 'operational'
        },
        {
          name: 'Sistema de backups',
          status: 'operational'
        },
        {
          name: 'Sistema de pagos',
          status: 'operational'
        }
      ],
      incidents: [],
      lastUpdated: new Date()
    };
    
    res.status(200).json({
      success: true,
      data: systemStatus
    });
  } catch (error) {
    console.error('Error al obtener estado del sistema:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado del sistema',
      error: error.message
    });
  }
};

// Rutas para staff de soporte

/**
 * @desc    Obtener todos los tickets (para staff)
 * @route   GET /api/support/staff/tickets
 * @access  Admin/Support
 */
exports.getAllTickets = async (req, res) => {
  try {
    // Filtros opcionales
    const { status, priority, category } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    
    const tickets = await Ticket.find(filter)
      .sort({ updatedAt: -1 })
      .populate('user', 'username email')
      .populate('assignedTo', 'username email')
      .populate('server', 'name type status');
    
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tickets',
      error: error.message
    });
  }
};

/**
 * @desc    Asignar un ticket a un miembro del staff
 * @route   PUT /api/support/staff/tickets/:id/assign
 * @access  Admin/Support
 */
exports.assignTicket = async (req, res) => {
  try {
    const { staffId } = req.body;
    
    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID del miembro del staff'
      });
    }
    
    // Verificar que el staff existe y tiene rol adecuado
    const staff = await User.findById(staffId);
    
    if (!staff || !['admin', 'support'].includes(staff.role)) {
      return res.status(400).json({
        success: false,
        message: 'Miembro del staff no válido'
      });
    }
    
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }
    
    ticket.assignedTo = staffId;
    
    // Si el ticket está abierto, cambiarlo a en progreso
    if (ticket.status === 'open') {
      ticket.status = 'in-progress';
    }
    
    await ticket.save();
    
    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error al asignar ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar ticket',
      error: error.message
    });
  }
};

/**
 * @desc    Cambiar la prioridad de un ticket
 * @route   PUT /api/support/staff/tickets/:id/priority
 * @access  Admin/Support
 */
exports.changeTicketPriority = async (req, res) => {
  try {
    const { priority } = req.body;
    
    if (!priority || !['low', 'medium', 'high', 'critical'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere una prioridad válida (low, medium, high, critical)'
      });
    }
    
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }
    
    ticket.priority = priority;
    await ticket.save();
    
    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error al cambiar prioridad del ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar prioridad del ticket',
      error: error.message
    });
  }
};

/**
 * @desc    Cambiar la categoría de un ticket
 * @route   PUT /api/support/staff/tickets/:id/category
 * @access  Admin/Support
 */
exports.changeTicketCategory = async (req, res) => {
  try {
    const { category } = req.body;
    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere una categoría válida'
      });
    }
    
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }
    
    ticket.category = category;
    await ticket.save();
    
    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error al cambiar categoría del ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar categoría del ticket',
      error: error.message
    });
  }
};

/**
 * @desc    Agregar nota interna a un ticket (solo visible para staff)
 * @route   POST /api/support/staff/tickets/:id/notes
 * @access  Admin/Support
 */
exports.addInternalNote = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'El contenido de la nota es requerido'
      });
    }
    
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado'
      });
    }
    
    // Agregar nota interna
    if (!ticket.internalNotes) {
      ticket.internalNotes = [];
    }
    
    ticket.internalNotes.push({
      author: req.user.id,
      content,
      createdAt: Date.now()
    });
    
    await ticket.save();
    
    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error al agregar nota interna:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar nota interna',
      error: error.message
    });
  }
};