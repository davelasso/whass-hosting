#!/bin/bash

# Colores para hacer más legible la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Mensaje de inicio
echo -e "${YELLOW}=== Iniciando despliegue en Render.com ===${NC}"

# Verificar si estamos en la carpeta correcta
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: No se encuentra el archivo package.json. Asegúrate de estar en el directorio del servidor.${NC}"
  exit 1
fi

# Verificar si render-cli está instalado
if ! command -v render &> /dev/null; then
  echo -e "${YELLOW}Instalando Render CLI...${NC}"
  npm install -g @render/cli
fi

# Iniciar sesión en Render (si es necesario)
echo -e "${YELLOW}Iniciando sesión en Render...${NC}"
render login

# Validar el archivo render.yaml
echo -e "${YELLOW}Validando configuración...${NC}"
if [ ! -f "render.yaml" ]; then
  echo -e "${RED}Error: No se encuentra el archivo render.yaml${NC}"
  exit 1
fi

# Crear el blueprint en Render
echo -e "${YELLOW}Creando Blueprint en Render...${NC}"
render blueprint create

# Mensaje de éxito
echo -e "${GREEN}¡Blueprint creado correctamente!${NC}"
echo -e "${YELLOW}Visita tu dashboard de Render para completar el despliegue: https://dashboard.render.com${NC}"
echo -e "${YELLOW}Recuerda configurar las variables de entorno:${NC}"
echo -e "  - JWT_SECRET: Una cadena aleatoria segura"
echo -e "  - MONGO_URI: La URL de conexión a MongoDB"

exit 0 