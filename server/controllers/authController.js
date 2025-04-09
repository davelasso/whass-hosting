const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
const { 
  generateToken, 
  generateRandomToken, 
  hashToken 
} = require('../utils/tokenManager');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

/**
 * @desc    Registrar usuario
 * @route   POST /api/auth/register
 * @access  Público
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validar campos requeridos
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Por favor proporciona todos los campos requeridos'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          error: 'El email ya está registrado'
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({
          success: false,
          error: 'El nombre de usuario ya está en uso'
        });
      }
    }

    // Crear nuevo usuario
    const user = await User.create({
      username,
      email,
      password
    });

    // Generar token de verificación
    const verificationToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Enviar email de verificación
    try {
      const verificationUrl = `${process.env.CLIENT_URL}/auth/verify-email?token=${verificationToken}`;
      await sendEmail(
        user.email,
        'Verifica tu email - Whass Hosting',
        `Hola ${user.username},\n\nPor favor verifica tu email haciendo clic en el siguiente enlace:\n${verificationUrl}\n\nEste enlace expirará en 24 horas.\n\nSaludos,\nEl equipo de Whass Hosting`
      );
    } catch (emailError) {
      logger.error('Error al enviar email de verificación:', emailError);
      // No interrumpimos el registro si falla el email
    }

    // Generar token JWT
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    logger.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      error: 'Error al registrar usuario. Por favor intenta más tarde.'
    });
  }
};

/**
 * @desc    Verificar email
 * @route   GET /api/auth/verify-email/:token
 * @access  Público
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar el usuario
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar que el token coincida
    if (user.emailVerificationToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Token de verificación inválido'
      });
    }

    // Actualizar el estado de verificación
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verificado exitosamente'
    });
  } catch (error) {
    console.error('Error al verificar email:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar el email'
    });
  }
};

/**
 * @desc    Iniciar sesión
 * @route   POST /api/auth/login
 * @access  Público
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validar email y password
  if (!email || !password) {
    return next(new ErrorResponse('Por favor proporciona email y contraseña', 400));
  }

  // Verificar si el usuario existe
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Credenciales inválidas', 401));
  }

  // Verificar si la contraseña coincide
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Credenciales inválidas', 401));
  }

  // Verificar si el usuario está activo
  if (!user.isActive) {
    return next(new ErrorResponse('Tu cuenta está desactivada. Contacta con soporte.', 403));
  }

  // Verificar si el email está verificado
  if (!user.isVerified) {
    return next(new ErrorResponse('Por favor verifica tu email antes de iniciar sesión', 401));
  }

  sendTokenResponse(user, 200, res, 'Inicio de sesión exitoso');
});

/**
 * @desc    Cerrar sesión / Limpiar cookie
 * @route   GET /api/auth/logout
 * @access  Privado
 */
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Sesión cerrada correctamente'
  });
});

/**
 * @desc    Obtener información del usuario actual
 * @route   GET /api/auth/me
 * @access  Privado
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Actualizar datos de usuario
 * @route   PUT /api/auth/updatedetails
 * @access  Privado
 */
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    username: req.body.username,
    email: req.body.email
  };

  // Filtrar campos undefined
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  // Verificar que haya campos para actualizar
  if (Object.keys(fieldsToUpdate).length === 0) {
    return next(new ErrorResponse('No se proporcionaron campos para actualizar', 400));
  }

  // Si cambia el email, validar dominio y requerir verificación de nuevo
  if (fieldsToUpdate.email && fieldsToUpdate.email !== req.user.email) {
    // Validar dominio de correo electrónico
    const emailDomain = fieldsToUpdate.email.split('@')[1];
    
    // Verificar si el dominio es válido (gmail.com, hotmail.com o gamil.com)
    if (!['gmail.com', 'hotmail.com', 'gamil.com'].includes(emailDomain)) {
      return next(new ErrorResponse('Solo se permiten correos con dominios gmail.com, hotmail.com o gamil.com', 400));
    }
    
    // Verificar si el dominio gamil.com está siendo usado por un no-admin
    if (emailDomain === 'gamil.com' && req.user.role !== 'admin') {
      return next(new ErrorResponse('Los correos con dominio gamil.com están reservados para administradores', 403));
    }

    const verificationToken = generateRandomToken();
    
    fieldsToUpdate.isVerified = false;
    fieldsToUpdate.emailVerificationToken = hashToken(verificationToken);
    fieldsToUpdate.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;

    // Crear URL de verificación
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;

    const message = `Has solicitado cambiar tu dirección de email en DDSBedrocl. Por favor verifica tu nuevo email haciendo clic en el siguiente enlace: \n\n ${verificationUrl}`;

    try {
      await sendEmail({
        email: fieldsToUpdate.email,
        subject: 'Verificación de cambio de email DDSBedrocl',
        message,
        html: `<p>Has solicitado cambiar tu dirección de email en DDSBedrocl.</p><p>Por favor verifica tu nuevo email haciendo clic en el siguiente enlace:</p><p><a href="${verificationUrl}">Verificar mi email</a></p><p>Este enlace expirará en 24 horas.</p>`
      });

    } catch (err) {
      console.error('Error al enviar email de verificación:', err);
      return next(new ErrorResponse('Error al enviar el email de verificación', 500));
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user,
    message: fieldsToUpdate.email && fieldsToUpdate.email !== req.user.email 
      ? 'Datos actualizados. Por favor verifica tu nuevo email.' 
      : 'Datos actualizados correctamente'
  });
});

/**
 * @desc    Actualizar contraseña
 * @route   PUT /api/auth/updatepassword
 * @access  Privado
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ErrorResponse('Por favor proporciona la contraseña actual y la nueva', 400));
  }

  const user = await User.findById(req.user.id).select('+password');

  // Verificar contraseña actual
  if (!(await user.matchPassword(currentPassword))) {
    return next(new ErrorResponse('La contraseña actual es incorrecta', 401));
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Contraseña actualizada correctamente');
});

/**
 * @desc    Solicitar restablecimiento de contraseña
 * @route   POST /api/auth/forgotpassword
 * @access  Público
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse('Por favor proporciona tu dirección de email', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse('No se encontró un usuario con ese email', 404));
  }

  // Generar token de restablecimiento
  const resetToken = generateRandomToken();

  // Guardar versión hasheada del token
  user.resetPasswordToken = hashToken(resetToken);
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hora

  await user.save();

  // Crear URL de restablecimiento
  const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

  const message = `Has solicitado restablecer tu contraseña en DDSBedrocl. Por favor sigue este enlace para establecer una nueva contraseña: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Restablecimiento de contraseña DDSBedrocl',
      message,
      html: `<p>Has solicitado restablecer tu contraseña en DDSBedrocl.</p><p>Por favor haz clic en el siguiente enlace para establecer una nueva contraseña:</p><p><a href="${resetUrl}">Restablecer mi contraseña</a></p><p>Este enlace expirará en 1 hora.</p><p>Si no solicitaste este cambio, por favor ignora este mensaje.</p>`
    });

    res.status(200).json({
      success: true,
      message: 'Email de restablecimiento enviado'
    });
  } catch (err) {
    console.error('Error al enviar email de restablecimiento:', err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return next(new ErrorResponse('Error al enviar el email de restablecimiento', 500));
  }
});

/**
 * @desc    Restablecer contraseña
 * @route   PUT /api/auth/resetpassword/:token
 * @access  Público
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Obtener token hasheado
  const resetPasswordToken = hashToken(req.params.token);

  // Buscar usuario con el token no expirado
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Token inválido o expirado', 400));
  }

  // Validar nueva contraseña
  if (!req.body.password) {
    return next(new ErrorResponse('Por favor proporciona una nueva contraseña', 400));
  }

  // Establecer nueva contraseña
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Contraseña restablecida correctamente');
});

/**
 * Función para generar token JWT y enviar respuesta
 */
const sendTokenResponse = (user, statusCode, res, message) => {
  // Crear token
  const token = generateToken(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  // Configurar cookie segura en producción
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      token
    });
};