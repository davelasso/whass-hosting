# Guía de Despliegue Rápido en Render.com

Esta guía te ayudará a desplegar el backend en Render.com en pocos minutos.

## Pasos para el Despliegue

### 1. Preparación

1. Sube tu código a GitHub o GitLab
2. Crea una cuenta en [Render.com](https://render.com) (puedes usar tu cuenta de GitHub)

### 2. Configuración en Render

1. En el dashboard de Render, haz clic en **"New +"**
2. Selecciona **"Web Service"**
3. Conecta tu repositorio de GitHub/GitLab
4. Configura el servicio:
   - **Name**: whass-backend (o el nombre que prefieras)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 3. Variables de Entorno

Agrega las siguientes variables en la sección "Environment":

- `NODE_ENV`: production
- `PORT`: 10000 (Render asignará automáticamente el puerto correcto)
- `JWT_SECRET`: [genera una cadena aleatoria segura]
- `JWT_EXPIRE`: 30d
- `JWT_COOKIE_EXPIRE`: 30

### 4. Base de Datos MongoDB

Puedes usar MongoDB Atlas gratis:

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un nuevo cluster (el plan gratuito es suficiente)
3. Configura el acceso a la base de datos (usuario y contraseña)
4. Copia la cadena de conexión
5. Agrega la variable `MONGO_URI` en Render con la cadena de conexión

### 5. Finaliza el Despliegue

1. Haz clic en **"Create Web Service"**
2. Espera a que se complete el despliegue (5-10 minutos)

## Verificación

Una vez completado el despliegue, tu API estará disponible en:
```
https://tu-servicio.onrender.com/health
```

Los endpoints públicos estarán disponibles en:
```
https://tu-servicio.onrender.com/api/servers/types
https://tu-servicio.onrender.com/api/servers/versions
https://tu-servicio.onrender.com/api/servers/plans
```

## Ventajas de Render.com (Plan Gratuito)

- Certificado SSL gratuito
- CI/CD automático (cada push a la rama principal)
- 750 horas/mes gratis (suficiente para mantener el servicio siempre activo)
- Sin tarjeta de crédito para empezar
- Dominio personalizado gratuito
- Soporte para WebSockets
- Escalable cuando necesites más recursos 