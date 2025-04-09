/**
 * Rutas para la gestión de backups de servidores Minecraft
 */
const express = require('express');
const router = express.Router({ mergeParams: true }); // Para acceder a los parámetros de las rutas padre
const { protect } = require('../middleware/auth');
const backupController = require('../controllers/backupController');

/**
 * @swagger
 * /api/servers/{serverId}/backups:
 *   get:
 *     summary: Obtener la lista de backups de un servidor
 *     tags: [Backups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del servidor
 *     responses:
 *       200:
 *         description: Lista de backups obtenida correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Servidor no encontrado
 */
router.get('/', protect, backupController.getBackups);

/**
 * @swagger
 * /api/servers/{serverId}/backups:
 *   post:
 *     summary: Crear un backup de un servidor
 *     tags: [Backups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del servidor
 *     responses:
 *       200:
 *         description: Backup creado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Servidor no encontrado
 */
router.post('/', protect, backupController.createBackup);

/**
 * @swagger
 * /api/servers/{serverId}/backups/{backupFileName}/restore:
 *   post:
 *     summary: Restaurar un backup a un servidor
 *     tags: [Backups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del servidor
 *       - in: path
 *         name: backupFileName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del archivo de backup
 *     responses:
 *       200:
 *         description: Backup restaurado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Servidor o backup no encontrado
 */
router.post('/:backupFileName/restore', protect, backupController.restoreBackup);

/**
 * @swagger
 * /api/servers/{serverId}/backups/{backupFileName}:
 *   delete:
 *     summary: Eliminar un backup
 *     tags: [Backups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del servidor
 *       - in: path
 *         name: backupFileName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del archivo de backup
 *     responses:
 *       200:
 *         description: Backup eliminado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Servidor o backup no encontrado
 */
router.delete('/:backupFileName', protect, backupController.deleteBackup);

module.exports = router; 