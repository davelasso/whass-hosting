/**
 * Servicio para gestionar contenedores Docker de servidores Minecraft
 */

const Docker = require('dockerode');
const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Inicializar cliente Docker
const docker = new Docker({
  socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
});

/**
 * Aprovisiona un nuevo servidor Minecraft en Docker
 * @param {Object} server - Objeto servidor de MongoDB
 * @returns {Promise<Object>} - Información sobre el contenedor creado
 */
exports.provisionServer = async (server) => {
  try {
    const serverId = server._id.toString();
    const serverPath = path.join(process.env.SERVER_DATA_PATH, serverId);
    
    // Asegurar que el directorio existe
    await fs.mkdir(serverPath, { recursive: true });
    
    // Determinar la imagen Docker a usar
    let image;
    if (server.type === 'java') {
      switch (server.template) {
        case 'paper':
          image = 'itzg/minecraft-server:java8-papermc';
          break;
        case 'spigot':
          image = 'itzg/minecraft-server:java8-multiarch';
          break;
        case 'forge':
          image = 'itzg/minecraft-server:java8-openj9';
          break;
        case 'fabric':
          image = 'itzg/minecraft-server:java17';
          break;
        default:
          image = 'itzg/minecraft-server:latest';
      }
    } else {
      // Servidor Bedrock
      image = 'itzg/minecraft-bedrock-server:latest';
    }
    
    // Configuración de límites de recursos
    const cpuLimit = server.resources.cpu;
    const memLimit = `${server.resources.ram}m`;
    
    // Determinar puerto según tipo de servidor
    const port = server.network.port || (server.type === 'java' ? 25565 : 19132);
    const protocol = server.type === 'java' ? 'tcp' : 'udp';
    
    // Configurar variables de entorno según tipo
    let envVars = {};
    
    if (server.type === 'java') {
      envVars = {
        EULA: 'TRUE',
        TYPE: server.template.toUpperCase(),
        VERSION: server.version,
        MEMORY: `${server.resources.ram}M`,
        JAVA_OPTS: server.settings?.javaArgs || `-Xms${server.resources.ram / 2}M -Xmx${server.resources.ram}M -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200`,
        SERVER_NAME: server.name,
        DIFFICULTY: 'normal',
        SPAWN_PROTECTION: '0',
        OPS: '',
        ONLINE_MODE: 'TRUE'
      };
    } else {
      // Bedrock
      envVars = {
        EULA: 'TRUE',
        GAMEMODE: 'survival',
        DIFFICULTY: 'normal',
        SERVER_NAME: server.name,
        LEVEL_NAME: 'Bedrock Level',
        SERVER_PORT: port.toString(),
        MEMORY: `${server.resources.ram}M`
      };
    }
    
    // Configurar puertos
    const portBindings = {};
    portBindings[`${port}/${protocol}`] = [{ HostPort: port.toString() }];
    
    // Crear el contenedor
    const container = await docker.createContainer({
      Image: image,
      name: `mc_${serverId}`,
      Env: Object.keys(envVars).map(key => `${key}=${envVars[key]}`),
      HostConfig: {
        Binds: [`${serverPath}:/data`],
        PortBindings: portBindings,
        Memory: parseInt(server.resources.ram) * 1024 * 1024, // Convertir MB a bytes
        MemorySwap: parseInt(server.resources.ram) * 1024 * 1024 * 2, // El doble para swap
        CpuShares: parseInt(server.resources.cpu) * 1024, // Proporción de CPU
        RestartPolicy: {
          Name: 'unless-stopped'
        }
      }
    });
    
    logger.info(`Contenedor creado para servidor ${serverId}: ${container.id}`);
    
    return {
      containerId: container.id,
      ip: process.env.SERVER_HOST || '127.0.0.1',
      port: port
    };
  } catch (error) {
    logger.error(`Error al provisionar servidor ${server._id}: ${error.message}`);
    throw error;
  }
};

/**
 * Inicia un servidor Minecraft
 * @param {Object} server - Objeto servidor de MongoDB
 * @returns {Promise<void>}
 */
exports.startServer = async (server) => {
  try {
    if (!server.containerId) {
      throw new Error('El servidor no tiene un contenedor asignado');
    }
    
    const container = docker.getContainer(server.containerId);
    
    // Verificar si el contenedor existe
    try {
      await container.inspect();
  } catch (error) {
      if (error.statusCode === 404) {
        // El contenedor no existe, hay que recrearlo
        const result = await this.provisionServer(server);
        server.containerId = result.containerId;
        container = docker.getContainer(server.containerId);
      } else {
        throw error;
      }
    }
    
    // Comprobar estado actual
    const info = await container.inspect();
    
    if (!info.State.Running) {
      await container.start();
      logger.info(`Servidor ${server._id} iniciado, contenedor: ${server.containerId}`);
    } else {
      logger.info(`El contenedor ${server.containerId} ya está en ejecución`);
    }
  } catch (error) {
    logger.error(`Error al iniciar servidor ${server._id}: ${error.message}`);
    throw error;
  }
};

/**
 * Detiene un servidor Minecraft
 * @param {Object} server - Objeto servidor de MongoDB
 * @returns {Promise<void>}
 */
exports.stopServer = async (server) => {
  try {
    if (!server.containerId) {
      throw new Error('El servidor no tiene un contenedor asignado');
    }
    
    const container = docker.getContainer(server.containerId);
    
    // Comprobar estado actual
    try {
      const info = await container.inspect();
      
      if (info.State.Running) {
        // Dar tiempo para que se guarde todo (30 segundos)
        await container.stop({ t: 30 });
        logger.info(`Servidor ${server._id} detenido, contenedor: ${server.containerId}`);
      } else {
        logger.info(`El contenedor ${server.containerId} ya está detenido`);
      }
  } catch (error) {
      if (error.statusCode === 404) {
        logger.warn(`El contenedor ${server.containerId} no existe`);
      } else {
        throw error;
      }
    }
  } catch (error) {
    logger.error(`Error al detener servidor ${server._id}: ${error.message}`);
    throw error;
  }
};

/**
 * Reinicia un servidor Minecraft
 * @param {Object} server - Objeto servidor de MongoDB
 * @returns {Promise<void>}
 */
exports.restartServer = async (server) => {
  try {
    if (!server.containerId) {
      throw new Error('El servidor no tiene un contenedor asignado');
    }
    
    const container = docker.getContainer(server.containerId);
    
    // Comprobar estado actual
    try {
      const info = await container.inspect();
      
      if (info.State.Running) {
        // Reiniciar con tiempo de gracia de 30 segundos
        await container.restart({ t: 30 });
        logger.info(`Servidor ${server._id} reiniciado, contenedor: ${server.containerId}`);
      } else {
        // Si está detenido, solo iniciarlo
        await container.start();
        logger.info(`Servidor ${server._id} iniciado, contenedor: ${server.containerId}`);
      }
    } catch (error) {
      if (error.statusCode === 404) {
        // El contenedor no existe, hay que recrearlo
        const result = await this.provisionServer(server);
        server.containerId = result.containerId;
        await this.startServer(server);
      } else {
        throw error;
      }
    }
  } catch (error) {
    logger.error(`Error al reiniciar servidor ${server._id}: ${error.message}`);
    throw error;
  }
};

/**
 * Elimina un servidor Minecraft (detiene y elimina el contenedor)
 * @param {Object} server - Objeto servidor de MongoDB
 * @returns {Promise<void>}
 */
exports.removeServer = async (server) => {
  try {
    if (!server.containerId) {
      logger.warn(`El servidor ${server._id} no tiene un contenedor asignado`);
      return;
    }
    
    const container = docker.getContainer(server.containerId);
    
    try {
      // Inspeccionar contenedor
      const info = await container.inspect();
      
      // Detener si está corriendo
      if (info.State.Running) {
        await container.stop({ t: 10 });
      }
      
      // Eliminar contenedor
      await container.remove({ force: true });
      logger.info(`Contenedor ${server.containerId} eliminado para servidor ${server._id}`);
    } catch (error) {
      if (error.statusCode === 404) {
        logger.warn(`El contenedor ${server.containerId} no existe`);
      } else {
        throw error;
      }
    }
  } catch (error) {
    logger.error(`Error al eliminar servidor ${server._id}: ${error.message}`);
    throw error;
  }
};

/**
 * Crea un backup del servidor
 * @param {Object} server - Objeto servidor de MongoDB
 * @param {string} description - Descripción opcional del backup
 * @returns {Promise<Object>} - Información sobre el backup creado
 */
exports.createBackup = async (server) => {
  try {
    const serverId = server._id.toString();
    const serverPath = path.join(process.env.SERVER_DATA_PATH, serverId);
    const backupDir = path.join(process.env.BACKUP_PATH, serverId);
    
    // Crear directorio de backups si no existe
    await fs.mkdir(backupDir, { recursive: true });
    
    // Nombre del archivo de backup
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupId = uuidv4().substring(0, 8);
    const backupFilename = `backup_${timestamp}_${backupId}.tar`;
    const backupPath = path.join(backupDir, backupFilename);
    
    // Si el servidor está en ejecución, enviar comando para guardar el mundo
    if (server.status === 'running' && server.containerId) {
      try {
        const container = docker.getContainer(server.containerId);
        
        if (server.type === 'java') {
          // Para servidores Java, usar comando save-all
          await this.executeCommand(server, 'save-all');
          // Esperar un poco para que termine de guardar
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          // Para Bedrock, usar save hold
          await this.executeCommand(server, 'save hold');
          await new Promise(resolve => setTimeout(resolve, 3000));
          await this.executeCommand(server, 'save resume');
        }
      } catch (commandError) {
        logger.warn(`Error al ejecutar comando de guardado: ${commandError.message}`);
        // Continuar con el backup incluso si falla el comando
      }
    }
    
    // Crear archivo tar de backup
    const { spawn } = require('child_process');
    const tar = spawn('tar', ['-cf', backupPath, '-C', path.dirname(serverPath), path.basename(serverPath)]);
    
    return new Promise((resolve, reject) => {
      tar.on('close', async (code) => {
        if (code !== 0) {
          return reject(new Error(`El proceso de tar falló con código ${code}`));
        }
        
        try {
          // Obtener tamaño del archivo
          const stats = await fs.stat(backupPath);
          
          resolve({
            path: backupPath,
            size: stats.size,
            timestamp: new Date()
          });
        } catch (error) {
          reject(error);
        }
      });
      
      tar.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    logger.error(`Error al crear backup para servidor ${server._id}: ${error.message}`);
    throw error;
  }
};

/**
 * Restaura un backup del servidor
 * @param {Object} server - Objeto servidor de MongoDB
 * @param {string} backupPath - Ruta al archivo de backup
 * @returns {Promise<void>}
 */
exports.restoreBackup = async (server, backupPath) => {
  try {
    // Detener el servidor si está en ejecución
    if (server.status === 'running') {
      await this.stopServer(server);
    }
    
    const serverId = server._id.toString();
    const serverPath = path.join(process.env.SERVER_DATA_PATH, serverId);
    
    // Verificar que el backup existe
    try {
      await fs.access(backupPath);
    } catch (error) {
      throw new Error(`Archivo de backup no encontrado: ${backupPath}`);
    }
    
    // Eliminar contenido actual
    await fs.rm(serverPath, { recursive: true, force: true });
    await fs.mkdir(serverPath, { recursive: true });
    
    // Extraer backup
    const { spawn } = require('child_process');
    const tar = spawn('tar', ['-xf', backupPath, '-C', path.dirname(serverPath)]);
    
    return new Promise((resolve, reject) => {
      tar.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`El proceso de extracción falló con código ${code}`));
        }
        
        logger.info(`Backup restaurado para servidor ${server._id}`);
        resolve();
      });
      
      tar.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    logger.error(`Error al restaurar backup para servidor ${server._id}: ${error.message}`);
    throw error;
  }
};

/**
 * Ejecuta un comando en la consola del servidor
 * @param {Object} server - Objeto servidor de MongoDB
 * @param {string} command - Comando a ejecutar
 * @returns {Promise<void>}
 */
exports.executeCommand = async (server, command) => {
  try {
    if (!server.containerId) {
      throw new Error('El servidor no tiene un contenedor asignado');
    }
    
    if (server.status !== 'running') {
      throw new Error('El servidor no está en ejecución');
    }
    
    const container = docker.getContainer(server.containerId);
    
    // Comando para enviar a través de attach
    let execCommand;
    
    if (server.type === 'java') {
      // Para servidores Java
      execCommand = {
        Cmd: ['rcon-cli', command],
        AttachStdout: true,
        AttachStderr: true
      };
    } else {
      // Para servidores Bedrock
      execCommand = {
        Cmd: ['bash', '-c', `cd /data && screen -S bedrock -X stuff "${command}\n"`],
        AttachStdout: true,
        AttachStderr: true
      };
    }
    
    const exec = await container.exec(execCommand);
    await exec.start({});
    
    logger.info(`Comando "${command}" ejecutado en servidor ${server._id}`);
  } catch (error) {
    logger.error(`Error al ejecutar comando en servidor ${server._id}: ${error.message}`);
    throw error;
  }
};

/**
 * Obtiene métricas de un servidor
 * @param {Object} server - Objeto servidor de MongoDB
 * @returns {Promise<Object>} - Métricas del servidor
 */
exports.getServerMetrics = async (server) => {
  try {
    if (!server.containerId) {
      throw new Error('El servidor no tiene un contenedor asignado');
    }
    
    if (server.status !== 'running') {
      return {
        cpuUsage: 0,
        ramUsage: 0,
        uptime: 0,
        players: 0
      };
    }
    
    const container = docker.getContainer(server.containerId);
    
    // Obtener estadísticas del contenedor
    const stats = await container.stats({ stream: false });
    
    // Calcular uso de CPU
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuCount = stats.cpu_stats.online_cpus;
    const cpuUsagePercent = (cpuDelta / systemDelta) * cpuCount * 100;
    
    // Calcular uso de RAM
    const ramUsageMB = stats.memory_stats.usage / (1024 * 1024);
    
    // Calcular uptime
    const uptime = Math.floor((Date.now() - new Date(stats.read).getTime()) / 1000);
    
    // Intentar obtener número de jugadores
    let players = 0;
    try {
      if (server.type === 'java') {
    const exec = await container.exec({
      Cmd: ['rcon-cli', 'list'],
      AttachStdout: true,
      AttachStderr: true
    });
    
        const stream = await exec.start({ Detach: false });
    let output = '';
    
      stream.on('data', (chunk) => {
          output += chunk.toString();
      });
      
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Extraer número de jugadores del output
        const match = output.match(/There are (\d+) of a max of \d+ players online/);
        if (match && match[1]) {
          players = parseInt(match[1]);
        }
      } else {
        // Para Bedrock, la extracción de jugadores es más compleja y puede requerir un enfoque diferente
        players = 0; // Valor por defecto
      }
    } catch (playerError) {
      logger.warn(`Error al obtener número de jugadores: ${playerError.message}`);
    }
    
    return {
      cpuUsage: cpuUsagePercent.toFixed(2),
      ramUsage: ramUsageMB.toFixed(2),
      uptime,
      players
    };
  } catch (error) {
    logger.error(`Error al obtener métricas para servidor ${server._id}: ${error.message}`);
    throw error;
  }
};

/**
 * Obtiene los logs del servidor
 * @param {Object} server - Objeto servidor de MongoDB
 * @param {number} lines - Número de líneas a obtener
 * @returns {Promise<string>} - Logs del servidor
 */
exports.getServerLogs = async (server, lines = 100) => {
  try {
    if (!server.containerId) {
      throw new Error('El servidor no tiene un contenedor asignado');
    }
    
    const container = docker.getContainer(server.containerId);
    
    const options = {
      stdout: true,
      stderr: true,
      tail: lines
    };
    
    const logs = await container.logs(options);
    return logs.toString();
  } catch (error) {
    logger.error(`Error al obtener logs para servidor ${server._id}: ${error.message}`);
    throw error;
  }
};