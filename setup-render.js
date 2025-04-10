/**
 * Script de configuración para despliegue en Render.com
 * Este script genera un arhivo render.yaml para desplegar el backend y frontend
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Función para generar el JWT Secret
function generateJWTSecret() {
  let result = 'whass_';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 48; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Función para generar el render.yaml
function generateRenderConfig(jwtSecret, dbUsername, dbPassword) {
  return `services:
  # Backend API service
  - type: web
    name: whass-backend
    env: node
    rootDir: server
    plan: free
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: JWT_EXPIRE
        value: 30d
      - key: JWT_COOKIE_EXPIRE
        value: 30
      - key: JWT_SECRET
        value: ${jwtSecret}
      - key: MONGO_URI
        value: mongodb://${dbUsername}:${dbPassword}@whass-mongodb:27017/whass?authSource=admin
    autoDeploy: true

  # MongoDB database
  - type: pserv
    name: whass-mongodb
    env: docker
    repo: https://github.com/render-examples/mongodb.git
    envVars:
      - key: MONGO_INITDB_ROOT_USERNAME
        value: ${dbUsername}
      - key: MONGO_INITDB_ROOT_PASSWORD
        value: ${dbPassword}
    disk:
      name: data
      mountPath: /data/db
      sizeGB: 1
      
  # Frontend service
  - type: web
    name: whass-frontend
    env: static
    rootDir: client
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    envVars:
      - key: VITE_API_URL
        value: https://whass-backend.onrender.com/api
    routes:
      - type: rewrite
        source: /*
        destination: /index.html`;
}

console.log(`${colors.cyan}${colors.bright}===== Configuración para despliegue en Render.com =====\n${colors.reset}`);
console.log(`${colors.yellow}Este script te ayudará a generar la configuración necesaria para\ndesplegar tu aplicación WhassHosting en Render.com${colors.reset}\n`);

// Generar credenciales seguras
const jwtSecret = generateJWTSecret();
const dbUsername = 'whass_admin';
const dbPassword = `Whass_MongoDB_${Math.floor(Math.random() * 9000) + 1000}!`;

console.log(`${colors.green}He generado las siguientes credenciales seguras:\n${colors.reset}`);
console.log(`${colors.cyan}JWT Secret:${colors.reset} ${jwtSecret}`);
console.log(`${colors.cyan}Usuario MongoDB:${colors.reset} ${dbUsername}`);
console.log(`${colors.cyan}Contraseña MongoDB:${colors.reset} ${dbPassword}\n`);

rl.question(`${colors.yellow}¿Deseas continuar con la generación del archivo render.yaml? (s/n):${colors.reset} `, (answer) => {
  if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'si') {
    const renderConfig = generateRenderConfig(jwtSecret, dbUsername, dbPassword);
    
    // Guardar el archivo render.yaml en la raíz del proyecto
    fs.writeFileSync(path.join(__dirname, 'render.yaml'), renderConfig);
    
    console.log(`\n${colors.green}Archivo render.yaml generado correctamente en la raíz del proyecto.${colors.reset}`);
    console.log(`\n${colors.magenta}${colors.bright}Pasos para desplegar en Render.com:${colors.reset}`);
    console.log(`${colors.cyan}1. Sube los cambios a GitHub:${colors.reset}`);
    console.log(`   git add .`);
    console.log(`   git commit -m "Configuración para despliegue en Render.com"`);
    console.log(`   git push`);
    console.log(`\n${colors.cyan}2. Ve a Render.com y crea un nuevo Blueprint:${colors.reset}`);
    console.log(`   - Inicia sesión en tu cuenta de Render.com`);
    console.log(`   - Ve al Dashboard y haz clic en "New" > "Blueprint"`);
    console.log(`   - Conecta tu repositorio de GitHub`);
    console.log(`   - Selecciona el repositorio whass-hosting`);
    console.log(`   - Render detectará automáticamente el archivo render.yaml`);
    console.log(`   - Haz clic en "Apply" para iniciar el despliegue`);
    console.log(`\n${colors.cyan}3. Una vez completado el despliegue:${colors.reset}`);
    console.log(`   - Backend: https://whass-backend.onrender.com`);
    console.log(`   - Frontend: https://whass-frontend.onrender.com`);
    console.log(`\n${colors.green}${colors.bright}¡Listo! Tu aplicación estará desplegada en unos minutos.${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}Configuración cancelada. No se generó ningún archivo.${colors.reset}`);
  }
  
  rl.close();
}); 