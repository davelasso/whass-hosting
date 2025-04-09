/**
 * Controlador para la gestión de usuarios y perfiles
 */

const User = require('../models/User');
const Subscription = require('../models/Subscription');
const bcrypt = require('bcryptjs');

/**
 * @desc    Obtener perfil del usuario actual
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil de usuario',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar perfil del usuario
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Verificar si el usuario existe
    let user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar si el email ya está en uso por otro usuario
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico ya está en uso'
        });
      }
    }
    
    // Verificar si el username ya está en uso por otro usuario
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuario ya está en uso'
        });
      }
    }
    
    // Actualizar campos
    if (username) user.username = username;
    if (email) user.email = email;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al actualizar perfil de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil de usuario',
      error: error.message
    });
  }
};

/**
 * @desc    Cambiar contraseña del usuario
 * @route   PUT /api/users/password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren la contraseña actual y la nueva contraseña'
      });
    }
    
    // Verificar si el usuario existe
    let user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar si la contraseña actual es correcta
    const isMatch = await user.matchPassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }
    
    // Validar nueva contraseña
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }
    
    // Actualizar contraseña
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener suscripción actual del usuario
 * @route   GET /api/users/subscription
 * @access  Private
 */
exports.getUserSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: { $in: ['active', 'trial'] }
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró una suscripción activa'
      });
    }
    
    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error al obtener suscripción del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información de la suscripción',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener historial de facturas del usuario
 * @route   GET /api/users/invoices
 * @access  Private
 */
exports.getUserInvoices = async (req, res) => {
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
    console.error('Error al obtener facturas del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de facturas',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener métodos de pago del usuario
 * @route   GET /api/users/payment-methods
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
    
    // Implementar lógica para obtener métodos de pago desde Stripe u otro proveedor
    // Ejemplo básico:
    const paymentMethods = []; // Aquí se obtendrían los métodos de pago reales
    
    res.status(200).json({
      success: true,
      count: paymentMethods.length,
      data: paymentMethods
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
 * @route   POST /api/users/payment-methods
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
    
    // Implementar lógica para agregar método de pago en Stripe u otro proveedor
    // Ejemplo básico:
    const paymentMethod = { id: paymentMethodId }; // Aquí se agregaría el método de pago real
    
    res.status(201).json({
      success: true,
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
 * @route   DELETE /api/users/payment-methods/:id
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
    
    // Implementar lógica para eliminar método de pago en Stripe u otro proveedor
    // Ejemplo básico:
    // const deleted = await stripe.paymentMethods.detach(paymentMethodId);
    
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
 * @route   PUT /api/users/payment-methods/:id/default
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
    
    // Implementar lógica para establecer método de pago predeterminado en Stripe u otro proveedor
    // Ejemplo básico:
    // const customer = await stripe.customers.update(user.stripeCustomerId, {
    //   invoice_settings: {
    //     default_payment_method: paymentMethodId
    //   }
    // });
    
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
 * @desc    Obtener notificaciones del usuario
 * @route   GET /api/users/notifications
 * @access  Private
 */
exports.getUserNotifications = async (req, res) => {
  try {
    // Implementar lógica para obtener notificaciones del usuario
    // Ejemplo básico:
    const notifications = []; // Aquí se obtendrían las notificaciones reales
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones',
      error: error.message
    });
  }
};

/**
 * @desc    Marcar notificación como leída
 * @route   PUT /api/users/notifications/:id/read
 * @access  Private
 */
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    // Implementar lógica para marcar notificación como leída
    // Ejemplo básico:
    // const notification = await Notification.findOneAndUpdate(
    //   { _id: notificationId, user: req.user.id },
    //   { read: true },
    //   { new: true }
    // );
    
    res.status(200).json({
      success: true,
      message: 'Notificación marcada como leída'
    });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificación como leída',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar preferencias de notificaciones
 * @route   PUT /api/users/notification-preferences
 * @access  Private
 */
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    
    if (!preferences) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren las preferencias de notificación'
      });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Implementar lógica para actualizar preferencias de notificaciones
    // Ejemplo básico:
    // user.notificationPreferences = preferences;
    // await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Preferencias de notificación actualizadas correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar preferencias de notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar preferencias de notificación',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener actividad reciente del usuario
 * @route   GET /api/users/activity
 * @access  Private
 */
exports.getUserActivity = async (req, res) => {
  try {
    // Implementar lógica para obtener actividad reciente del usuario
    // Ejemplo básico:
    const activity = []; // Aquí se obtendría la actividad real
    
    res.status(200).json({
      success: true,
      count: activity.length,
      data: activity
    });
  } catch (error) {
    console.error('Error al obtener actividad del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividad del usuario',
      error: error.message
    });
  }
};