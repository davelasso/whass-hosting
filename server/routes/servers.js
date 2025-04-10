/**
 * Rutas para la gestión de servidores Minecraft
 */

const express = require('express');
const router = express.Router();
const serverController = require('../controllers/serverController');
const { protect } = require('../middleware/auth');

// Importar rutas de backups
const backupRoutes = require('./backups');

/**
 * @swagger
 * /api/servers/plans:
 *   get:
 *     summary: Obtener planes de hosting disponibles
 *     tags: [Servers]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [java, bedrock]
 *         description: Filtrar planes por tipo de servidor
 *     responses:
 *       200:
 *         description: Planes de hosting obtenidos correctamente
 */
router.get('/plans', serverController.getHostingPlans);

/**
 * @swagger
 * /api/servers/types:
 *   get:
 *     summary: Obtener tipos de servidores disponibles
 *     tags: [Servers]
 *     responses:
 *       200:
 *         description: Tipos de servidores obtenidos correctamente
 */
router.get('/types', serverController.getServerTypes);

/**
 * @swagger
 * /api/servers/versions:
 *   get:
 *     summary: Obtener versiones disponibles de Minecraft
 *     tags: [Servers]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [java, bedrock]
 *         description: Filtrar versiones por tipo
 *     responses:
 *       200:
 *         description: Versiones obtenidas correctamente
 */
router.get('/versions', serverController.getMinecraftVersions);

// Middleware de autenticación para todas las rutas
router.use(protect);

// Usar rutas de backups para /api/servers/:serverId/backups
router.use('/:serverId/backups', backupRoutes);

/**
 * @swagger
 * /api/servers:
 *   get:
 *     summary: Obtener todos los servidores del usuario
 *     tags: [Servers]
 *     responses:
 *       200:
 *         description: Lista de servidores obtenida correctamente
 */
router.get('/', serverController.getServers);

/**
 * @swagger
 * /api/servers/{id}:
 *   get:
 *     summary: Obtener un servidor específico
 *     tags: [Servers]
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
 *               version:
 *                 type: string
 *     responses:
 *       201:
 *         description: Servidor creado correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', serverController.createServer);

/**
 * @swagger
 * /api/servers/{id}:
 *   put:
 *     summary: Actualizar un servidor
 *     tags: [Servers]
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
 *     responses:
 *       200:
 *         description: Servidor actualizado correctamente
 *       400:
 *         description: Datos inválidos
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
 *       404:
 *         description: Servidor no encontrado
 */
router.post('/:id/restart', serverController.restartServer);

/**
 * @swagger
 * /api/servers/{id}/console:
 *   get:
 *     summary: Obtener logs de la consola del servidor
 *     tags: [Servers]
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
 *       404:
 *         description: Servidor no encontrado
 */
router.get('/:id/console', serverController.getConsoleLogs);

/**
 * @swagger
 * /api/servers/{id}/command:
 *   post:
 *     summary: Enviar un comando al servidor
 *     tags: [Servers]
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
 *                 description: Comando a ejecutar
 *     responses:
 *       200:
 *         description: Comando ejecutado correctamente
 *       404:
 *         description: Servidor no encontrado
 */
router.post('/:id/command', serverController.executeCommandTemp);

module.exports = router;