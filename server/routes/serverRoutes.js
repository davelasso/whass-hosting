const express = require('express');
const serverController = require('../controllers/serverController');
const router = express.Router();

/**
 * Rutas para la gestión de servidores Minecraft
 */

// Rutas para la gestión general de servidores
router.get('/minecraft/versions', serverController.getMinecraftVersions);
router.get('/', serverController.getServers);
router.post('/', serverController.createServer);
router.get('/:id', serverController.getServer);
router.put('/:id', serverController.updateServer);
router.delete('/:id', serverController.deleteServer);

// Rutas para el control de estado del servidor
router.post('/:id/start', serverController.startServer);
router.post('/:id/stop', serverController.stopServer);
router.post('/:id/restart', serverController.restartServer);

// Rutas para la consola del servidor
router.get('/:id/console', serverController.getConsoleLogs);
router.post('/:id/console', serverController.executeCommand);

// Rutas para la gestión de propiedades del servidor
router.get('/:id/properties', serverController.getServerProperties);
router.put('/:id/properties', serverController.updateServerProperties);

// Rutas para la gestión de plugins/mods
router.get('/:id/plugins', serverController.getServerPlugins);
router.post('/:id/plugins', serverController.installPlugin);
router.delete('/:id/plugins/:pluginId', serverController.removePlugin);
router.put('/:id/plugins/:pluginId', serverController.togglePlugin);

// Rutas para la gestión de backups
router.get('/:id/backups', serverController.getServerBackups);
router.post('/:id/backups', serverController.createBackup);
router.post('/:id/backups/:backupId/restore', serverController.restoreBackup);
router.delete('/:id/backups/:backupId', serverController.deleteBackup);

module.exports = router; 