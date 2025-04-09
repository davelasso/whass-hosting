const express = require('express');
const backupController = require('../controllers/backupController');

const router = express.Router({ mergeParams: true });

const { protect } = require('../middleware/auth');

// Proteger todas las rutas
router.use(protect);

// Rutas para backups asociados a un servidor específico
router.route('/')
  .get(backupController.getBackups)
  .post(backupController.createBackup);

// Rutas para operaciones en backups específicos por ID
router.route('/:id')
  .get(backupController.getBackup)
  .delete(backupController.deleteBackup);

// Ruta para restaurar un backup específico
router.route('/:id/restore')
  .post(backupController.restoreBackup);

// Ruta para limpiar backups antiguos
router.route('/cleanup')
  .delete(backupController.cleanupBackups);

// Exportar para usar desde otros archivos
module.exports = router; 