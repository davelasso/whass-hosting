/**
 * Middleware de autenticación
 * Verifica el token JWT y establece el usuario en el objeto de solicitud
 */

const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const { extractTokenFromRequest, verifyToken } = require('../utils/tokenManager');

/**
 * Middleware para proteger rutas que requieren autenticación
 * Verifica la existencia y validez del token JWT
 */
exports.protect = asyncHandler(async (req, res, next) => {
  // Extraer token de la solicitud
  const token = extractTokenFromRequest(req);

  // Verificar si existe el token
  if (!token) {
    return next(new ErrorResponse('No estás autorizado para acceder a esta ruta', 401));
  }

  try {
    // Verificar token
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    
    if (!decoded) {
      return next(new ErrorResponse('Token inválido o expirado', 401));
    }

    // Obtener usuario del token
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse('No se encontró el usuario con este ID', 401));
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return next(new ErrorResponse('Tu cuenta está desactivada. Contacta con soporte.', 403));
    }

    // Añadir el usuario a la request
    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse('No estás autorizado para acceder a esta ruta', 401));
  }
});

/**
 * Middleware para restringir acceso por roles
 * @param {...string} roles - Roles que tienen permiso para acceder
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Se requiere autenticación primero', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `El rol ${req.user.role} no está autorizado para acceder a esta ruta`,
          403
        )
      );
    }
    next();
  };
};