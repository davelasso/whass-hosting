/**
 * Utilidades para validación de datos de entrada
 */
const { body, validationResult } = require('express-validator');

// Validador para manejo de errores en peticiones
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      status: 'error',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Validadores comunes para reutilizar en rutas
const validators = {
  // Validación de registro de usuario
  registerValidation: [
    body('username')
      .notEmpty().withMessage('El nombre de usuario es obligatorio')
      .isLength({ min: 3, max: 30 }).withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
      .matches(/^[a-zA-Z0-9_-]+$/).withMessage('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos'),
    body('email')
      .notEmpty().withMessage('El correo electrónico es obligatorio')
      .isEmail().withMessage('El correo electrónico no es válido'),
    body('password')
      .notEmpty().withMessage('La contraseña es obligatoria')
      .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una letra mayúscula, una minúscula y un número')
  ],
  
  // Validación de inicio de sesión
  loginValidation: [
    body('email')
      .notEmpty().withMessage('El correo electrónico es obligatorio')
      .isEmail().withMessage('El correo electrónico no es válido'),
    body('password')
      .notEmpty().withMessage('La contraseña es obligatoria')
  ],
  
  // Validación de creación de servidor
  serverCreateValidation: [
    body('name')
      .notEmpty().withMessage('El nombre del servidor es obligatorio')
      .isLength({ min: 3, max: 50 }).withMessage('El nombre del servidor debe tener entre 3 y 50 caracteres')
      .matches(/^[a-zA-Z0-9_-]+$/).withMessage('El nombre del servidor solo puede contener letras, números, guiones y guiones bajos'),
    body('type')
      .notEmpty().withMessage('El tipo de servidor es obligatorio')
      .isIn(['java', 'bedrock']).withMessage('El tipo de servidor debe ser java o bedrock'),
    body('version')
      .notEmpty().withMessage('La versión del servidor es obligatoria'),
    body('ram')
      .isInt({ min: 512 }).withMessage('La RAM debe ser al menos 512 MB')
  ]
};

module.exports = {
  validate,
  validators
}; 