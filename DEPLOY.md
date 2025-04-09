# Instrucciones de Despliegue

## Frontend (Vercel)

1. Crear una cuenta en [Vercel](https://vercel.com)
2. Instalar Vercel CLI:
   ```bash
   npm i -g vercel
   ```
3. Navegar al directorio del cliente:
   ```bash
   cd client
   ```
4. Iniciar sesión en Vercel:
   ```bash
   vercel login
   ```
5. Desplegar:
   ```bash
   vercel
   ```
6. Configurar variables de entorno en el dashboard de Vercel:
   - `REACT_APP_API_URL`: URL de la API (ej: https://api.whass.net)

## Backend (Railway)

1. Crear una cuenta en [Railway](https://railway.app)
2. Instalar Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```
3. Navegar al directorio del servidor:
   ```bash
   cd server
   ```
4. Iniciar sesión en Railway:
   ```bash
   railway login
   ```
5. Inicializar el proyecto:
   ```bash
   railway init
   ```
6. Configurar variables de entorno en Railway:
   - `MONGODB_URI`: URL de conexión a MongoDB
   - `JWT_SECRET`: Clave secreta para JWT
   - `JWT_EXPIRE`: Tiempo de expiración del token (ej: 30d)
   - `SMTP_HOST`: Servidor SMTP
   - `SMTP_PORT`: Puerto SMTP
   - `SMTP_USER`: Usuario SMTP
   - `SMTP_PASS`: Contraseña SMTP
   - `STRIPE_SECRET_KEY`: Clave secreta de Stripe
   - `STRIPE_WEBHOOK_SECRET`: Clave secreta del webhook de Stripe
   - `CLIENT_URL`: URL del frontend (ej: https://whass.net)

7. Desplegar:
   ```bash
   railway up
   ```

## Base de Datos (MongoDB Atlas)

1. Crear una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear un nuevo cluster (plan gratuito)
3. Configurar acceso de red (IP 0.0.0.0/0 para desarrollo)
4. Crear usuario de base de datos
5. Obtener URL de conexión
6. Agregar URL de conexión a las variables de entorno de Railway

## Correo Electrónico (SendGrid)

1. Crear una cuenta en [SendGrid](https://sendgrid.com)
2. Verificar dominio de envío
3. Crear API Key
4. Configurar variables SMTP en Railway

## Pagos (Stripe)

1. Crear una cuenta en [Stripe](https://stripe.com)
2. Obtener claves de API (test y producción)
3. Configurar webhook
4. Agregar claves a las variables de entorno de Railway

## Monitoreo y Logs

1. Configurar [Sentry](https://sentry.io) para monitoreo de errores
2. Configurar [Logtail](https://logtail.com) para logs
3. Agregar variables de entorno correspondientes

## SSL y Dominio

1. Comprar dominio (ej: whass.net)
2. Configurar DNS:
   - Frontend: A -> Vercel
   - API: CNAME -> Railway
3. Configurar SSL automático en Vercel y Railway

## Pruebas

1. Ejecutar pruebas locales:
   ```bash
   # Frontend
   cd client
   npm test

   # Backend
   cd server
   npm test
   ```

2. Verificar despliegue:
   - Frontend: https://whass.net
   - API: https://api.whass.net
   - Health check: https://api.whass.net/health

## Mantenimiento

1. Actualizaciones:
   ```bash
   # Frontend
   cd client
   npm update
   vercel

   # Backend
   cd server
   npm update
   railway up
   ```

2. Backups:
   - Configurar backups automáticos en MongoDB Atlas
   - Configurar backups de archivos en Railway

3. Monitoreo:
   - Revisar logs en Railway
   - Monitorear métricas en Vercel
   - Verificar alertas en Sentry 