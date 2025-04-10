# Backend de Whass Hosting

Backend para el servicio de hosting de servidores Minecraft.

## Requisitos

- Node.js (v14 o superior)
- MongoDB
- npm o yarn

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/whass-hosting.git
cd whass-hosting/server

# Instalar dependencias
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/whass-hosting
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
```

## Ejecución

### Modo desarrollo

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

## Despliegue

### Render.com (Recomendado)

Render ofrece un plan gratuito con características excelentes:

- 750 horas/mes gratis (servicio siempre activo)
- Certificados SSL gratuitos
- Dominio personalizado sin coste
- CI/CD automático desde GitHub
- Base de datos MongoDB gratis (512MB)
- Sin tiempo de inactividad

Pasos para desplegar:

1. Crea una cuenta en [Render](https://render.com)
2. Desde el dashboard, haz clic en "New +" y selecciona "Blueprint"
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio de tu proyecto
5. Render detectará automáticamente el archivo `render.yaml` y configurará los servicios
6. Establece las variables de entorno secretas:
   - `JWT_SECRET`: Una cadena aleatoria segura
   - `MONGO_URI`: Se generará automáticamente cuando se despliegue MongoDB
   - `MONGO_INITDB_ROOT_USERNAME`: Usuario para MongoDB
   - `MONGO_INITDB_ROOT_PASSWORD`: Contraseña para MongoDB
7. Haz clic en "Apply" para iniciar el despliegue

El despliegue tomará unos minutos. Una vez completado, tu API estará disponible en la URL proporcionada por Render.

### Heroku

```bash
# Instalar CLI de Heroku
npm install -g heroku

# Login
heroku login

# Crear app
heroku create whass-hosting-backend

# Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=tu_uri_mongodb
heroku config:set JWT_SECRET=tu_secreto_jwt
heroku config:set JWT_EXPIRE=30d
heroku config:set JWT_COOKIE_EXPIRE=30

# Desplegar
git push heroku main
```

### Vercel

1. Crea una cuenta en [Vercel](https://vercel.com)
2. Instala Vercel CLI: `npm install -g vercel`
3. Ejecuta `vercel login` y sigue las instrucciones
4. Configura las variables de entorno en Vercel Dashboard
5. Ejecuta `vercel --prod` para desplegar

### Docker

```bash
# Construir imagen
docker build -t whass-backend .

# Ejecutar contenedor
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGO_URI=tu_uri_mongodb \
  -e JWT_SECRET=tu_secreto_jwt \
  -e JWT_EXPIRE=30d \
  -e JWT_COOKIE_EXPIRE=30 \
  whass-backend
```

### Docker Compose

Ejecuta desde la raíz del proyecto:

```bash
docker compose up -d
```

## Documentación API

Una vez iniciado, puedes acceder a la documentación de la API en:

```
http://localhost:5000/api-docs
```

## Endpoints principales

- `GET /api/servers/types`: Obtener tipos de servidores disponibles
- `GET /api/servers/versions`: Obtener versiones de Minecraft
- `GET /api/servers/plans`: Obtener planes de hosting

## Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request 