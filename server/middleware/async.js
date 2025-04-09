/**
 * Middleware para manejo de errores en funciones asíncronas
 * Envuelve las funciones de controlador para evitar try-catch repetitivos
 * @param {Function} fn Función asíncrona a envolver
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler; 