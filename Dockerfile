FROM node:16-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Instalar dependencias del sistema para dockerode
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de archivos
COPY . .

# Crear directorios necesarios
RUN mkdir -p minecraft-servers backups logs

# Exponer puerto
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["npm", "start"] 