/**
 * Rutas para la gestión de servidores Minecraft
 */

const express = require('express');
const router = express.Router();
const serverController = require('../controllers/serverController');
const { protect } = require('../middleware/auth');

// Importar rutas de backups
const backupRoutes = require('./backups');

// Middleware de autenticación para todas las rutas
router.use(protect);

// Usar rutas de backups para /api/servers/:serverId/backups
router.use('/:serverId/backups', backupRoutes);

/**
 * @swagger
 * /api/servers/versions:
 *   get:
 *     summary: Obtener versiones disponibles de Minecraft
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Versiones obtenidas correctamente
 *       401:
 *         description: No autorizado
 */
router.get('/versions', serverController.getMinecraftVersions);

/**
 * @swagger
 * /api/servers:
 *   get:
 *     summary: Obtener todos los servidores del usuario
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de servidores obtenida correctamente
 *       401:
 *         description: No autorizado
 */
router.get('/', serverController.getServers);

/**
 * @swagger
 * /api/servers/{id}:
 *   get:
 *     summary: Obtener un servidor específico
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del servidor
 *     responses:
 *       200:
 *         description: Servidor obtenido correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Servidor no encontrado
 */
router.get('/:id', serverController.getServer);

/**
 * @swagger
 * /api/servers:
 *   post:
 *     summary: Crear un nuevo servidor
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - version
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [java, bedrock]
 *               version:
 *                 type: string
 *               ram:
 *                 type: number
 *     responses:
 *       201:
 *         description: Servidor creado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', serverController.createServer);

/**
 * @swagger
 * /api/servers/{id}:
 *   put:
 *     summary: Actualizar un servidor
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del servidor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               ram:
 *                 type: number
 *     responses:
 *       200:
 *         description: Servidor actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Servidor no encontrado
 */
router.put('/:id', serverController.updateServer);

/**
 * @swagger
 * /api/servers/{id}:
 *   delete:
 *     summary: Eliminar un servidor
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del servidor
 *     responses:
 *       200:
 *         description: Servidor eliminado correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Servidor no encontrado
 */
router.delete('/:id', serverController.deleteServer);

/**
 * @swagger
 * /api/servers/{id}/start:
 *   post:
 *     summary: Iniciar un servidor
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del servidor
 *     responses:
 *       200:
 *         description: Servidor iniciado correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Servidor no encontrado
 */
router.post('/:id/start', serverController.startServer);

/**
 * @swagger
 * /api/servers/{id}/stop:
 *   post:
 *     summary: Detener un servidor
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del servidor
 *     responses:
 *       200:
 *         description: Servidor detenido correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Servidor no encontrado
 */
router.post('/:id/stop', serverController.stopServer);

/**
 * @swagger
 * /api/servers/{id}/restart:
 *   post:
 *     summary: Reiniciar un servidor
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del servidor
 *     responses:
 *       200:
 *         description: Servidor reiniciado correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Servidor no encontrado
 */
router.post('/:id/restart', serverController.restartServer);

/**
 * @swagger
 * /api/servers/{id}/logs:
 *   get:
 *     summary: Obtener logs de un servidor
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del servidor
 *     responses:
 *       200:
 *         description: Logs obtenidos correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Servidor no encontrado
 */
router.get('/:id/logs', serverController.getServerLogs);

/**
 * @swagger
 * /api/servers/{id}/command:
 *   post:
 *     summary: Ejecutar comando en un servidor
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del servidor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - command
 *             properties:
 *               command:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comando ejecutado correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Servidor no encontrado
 */
router.post('/:id/command', serverController.executeCommand);

/**
 * @swagger
 * /api/servers/{id}/stats:
 *   get:
 *     summary: Obtener estadísticas de un servidor
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del servidor
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Servidor no encontrado
 */
router.get('/:id/stats', serverController.getServerStats);

module.exports = router;