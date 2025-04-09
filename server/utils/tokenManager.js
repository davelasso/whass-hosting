/**
 * Utilidad para la gestión de tokens JWT
 * Proporciona funciones para generar, verificar y decodificar tokens
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Genera un token JWT
 * @param {Object} payload - Datos a incluir en el token
 * @param {string} secret - Clave secreta para firmar el token
 * @param {Object} options - Opciones de configuración del token (expiración, etc.)
 * @returns {string} Token JWT generado
 */
const generateToken = (payload, secret, options = {}) => {
  return jwt.sign(payload, secret, options);
};

/**
 * Verifica un token JWT
 * @param {string} token - Token JWT a verificar
 * @param {string} secret - Clave secreta para verificar el token
 * @returns {Object|null} Payload decodificado o null si es inválido
 */
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

/**
 * Decodifica un token JWT sin verificar su firma
 * @param {string} token - Token JWT a decodificar
 * @returns {Object|null} Payload decodificado o null si es inválido
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Extrae el token de los headers o cookies de una petición
 * @param {Object} req - Objeto de petición Express
 * @returns {string|null} Token encontrado o null si no existe
 */
const extractTokenFromRequest = (req) => {
  let token = null;

  // Verificar si el token existe en los headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extraer token del header Bearer
    token = req.headers.authorization.split(' ')[1];
  } 
  // Verificar si el token existe en las cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  return token;
};

/**
 * Genera un token aleatorio (para restablecimiento de contraseña, verificación, etc.)
 * @param {number} size - Tamaño del token en bytes (por defecto 20)
 * @returns {string} Token aleatorio en formato hexadecimal
 */
const generateRandomToken = (size = 20) => {
  return crypto.randomBytes(size).toString('hex');
};

/**
 * Hashea un token utilizando SHA-256
 * @param {string} token - Token a hashear
 * @returns {string} Token hasheado
 */
const hashToken = (token) => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  extractTokenFromRequest,
  generateRandomToken,
  hashToken
}; 