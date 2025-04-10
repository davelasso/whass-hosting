#!/bin/bash

# Colores para la terminal
RESET="\033[0m"
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
MAGENTA="\033[35m"
CYAN="\033[36m"

# Banner
echo -e "${CYAN}${BOLD}======================================================${RESET}"
echo -e "${CYAN}${BOLD}         DESPLIEGUE WHASS HOSTING EN RENDER         ${RESET}"
echo -e "${CYAN}${BOLD}======================================================${RESET}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "./server/package.json" ] || [ ! -f "./client/package.json" ]; then
  echo -e "${RED}${BOLD}ERROR: No estás en el directorio raíz del proyecto.${RESET}"
  echo -e "${YELLOW}Por favor, ejecuta este script desde el directorio raíz del proyecto.${RESET}"
  exit 1
fi

# Generar credenciales seguras
JWT_SECRET="whass_$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | fold -w 48 | head -n 1)"
DB_USERNAME="whass_admin"
DB_PASSWORD="Whass_MongoDB_$(shuf -i 1000-9999 -n 1)!"

# Mostrar credenciales
echo -e "${GREEN}${BOLD}Credenciales generadas:${RESET}"
echo -e "${CYAN}JWT Secret:${RESET} $JWT_SECRET"
echo -e "${CYAN}Usuario MongoDB:${RESET} $DB_USERNAME"
echo -e "${CYAN}Contraseña MongoDB:${RESET} $DB_PASSWORD"
echo ""

# Preguntar si continuar
read -p "¿Continuar con el despliegue? (s/n): " CONTINUE
if [[ $CONTINUE != "s" && $CONTINUE != "S" && $CONTINUE != "si" && $CONTINUE != "SI" ]]; then
  echo -e "${YELLOW}Despliegue cancelado.${RESET}"
  exit 0
fi

# Crear el archivo render.yaml
echo -e "${BLUE}Generando archivo render.yaml...${RESET}"
cat > render.yaml << EOL
services:
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
        value: $JWT_SECRET
      - key: MONGO_URI
        value: mongodb://$DB_USERNAME:$DB_PASSWORD@whass-mongodb:27017/whass?authSource=admin
    autoDeploy: true

  # MongoDB database
  - type: pserv
    name: whass-mongodb
    env: docker
    repo: https://github.com/render-examples/mongodb.git
    envVars:
      - key: MONGO_INITDB_ROOT_USERNAME
        value: $DB_USERNAME
      - key: MONGO_INITDB_ROOT_PASSWORD
        value: $DB_PASSWORD
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
        destination: /index.html
EOL

echo -e "${GREEN}${BOLD}render.yaml creado correctamente.${RESET}"

# Preparar para subir a GitHub
echo -e "${BLUE}Añadiendo cambios al repositorio Git...${RESET}"
git add render.yaml client/.env.production

echo -e "${GREEN}Cambios preparados. Ahora ejecuta los siguientes comandos:${RESET}"
echo -e "${YELLOW}git commit -m \"Configuración para despliegue en Render.com\"${RESET}"
echo -e "${YELLOW}git push${RESET}"
echo ""

echo -e "${MAGENTA}${BOLD}Pasos para completar el despliegue:${RESET}"
echo -e "${BLUE}1. Ve a Render.com y crea un nuevo Blueprint:${RESET}"
echo "   - Inicia sesión en tu cuenta de Render.com"
echo "   - Ve al Dashboard y haz clic en \"New\" > \"Blueprint\""
echo "   - Conecta tu repositorio de GitHub"
echo "   - Selecciona el repositorio"
echo "   - Render detectará automáticamente el archivo render.yaml"
echo "   - Haz clic en \"Apply\" para iniciar el despliegue"
echo ""
echo -e "${BLUE}2. Una vez completado el despliegue:${RESET}"
echo "   - Backend: https://whass-backend.onrender.com"
echo "   - Frontend: https://whass-frontend.onrender.com"
echo ""
echo -e "${GREEN}${BOLD}¡Listo! Tu aplicación estará desplegada en unos minutos.${RESET}" 