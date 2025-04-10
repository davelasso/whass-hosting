const express = require('express');
const router = express.Router();

// Controlador simple para health check
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API funcionando correctamente',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router; 