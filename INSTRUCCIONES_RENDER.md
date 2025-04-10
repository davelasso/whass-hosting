# Despliegue de WhassHosting en Render.com

Este documento proporciona instrucciones detalladas para desplegar la aplicación WhassHosting (frontend y backend) en Render.com de manera rápida y sencilla.

## 💻 Requisitos previos

- Una cuenta en [Render.com](https://render.com) (puedes crear una gratis)
- Tu código fuente subido a GitHub
- Git instalado en tu máquina

## 🚀 Guía de despliegue rápido

### Método 1: Usando el script automatizado (Windows)

1. Abre una terminal en el directorio raíz del proyecto
2. Ejecuta el script de despliegue:
   ```
   deploy-render.bat
   ```
3. Sigue las instrucciones en pantalla
4. Una vez que el script termine, ejecuta:
   ```
   git commit -m "Configuración para despliegue en Render.com"
   git push
   ```

### Método 2: Usando el script automatizado (Linux/Mac)

1. Abre una terminal en el directorio raíz del proyecto
2. Haz el script ejecutable y ejecútalo:
   ```
   chmod +x deploy-render.sh
   ./deploy-render.sh
   ```
3. Sigue las instrucciones en pantalla
4. Una vez que el script termine, ejecuta:
   ```
   git commit -m "Configuración para despliegue en Render.com"
   git push
   ```

### Método 3: Usando Node.js

1. Abre una terminal en el directorio raíz del proyecto
2. Ejecuta el script de Node.js:
   ```
   node setup-render.js
   ```
3. Sigue las instrucciones en pantalla
4. Una vez que el script termine, ejecuta:
   ```
   git commit -m "Configuración para despliegue en Render.com"
   git push
   ```

## 📋 Pasos para completar el despliegue en Render.com

1. Inicia sesión en tu cuenta de [Render.com](https://render.com)
2. Ve al Dashboard y haz clic en "New" > "Blueprint"
3. Conecta tu repositorio de GitHub (si aún no lo has hecho)
4. Selecciona el repositorio whass-hosting
5. Render detectará automáticamente el archivo render.yaml
6. (Opcional) Puedes revisar la configuración y las variables de entorno
7. Haz clic en "Apply" para iniciar el despliegue

## ⚙️ Servicios desplegados

Después de completar el despliegue, tendrás los siguientes servicios:

1. **Backend (API)**
   - URL: https://whass-backend.onrender.com
   - Endpoints principales:
     - `/api/auth/login` - Para iniciar sesión
     - `/api/auth/register` - Para registrar nuevos usuarios
     - `/api/servers` - Para gestionar servidores de Minecraft
     - `/health` - Para verificar el estado del servidor

2. **Frontend**
   - URL: https://whass-frontend.onrender.com
   - Interfaz de usuario completa para gestionar servidores de Minecraft

3. **Base de datos MongoDB**
   - Desplegada y configurada automáticamente
   - Conectada al backend mediante variables de entorno seguras

## 🔍 Verificación del despliegue

Para verificar que todo funciona correctamente:

1. Visita https://whass-backend.onrender.com/health
   - Deberías ver un mensaje de éxito indicando que el servidor está funcionando
   
2. Visita https://whass-frontend.onrender.com
   - Deberías ver la página de inicio de WhassHosting
   
3. Registra una cuenta e inicia sesión
   - Esto verificará que la API de autenticación funciona correctamente
   
4. Crea un servidor de Minecraft
   - Esto verificará que la funcionalidad principal de la aplicación funciona correctamente

## 🛠️ Solución de problemas

Si encuentras problemas durante el despliegue:

1. **Error en el backend**:
   - Verifica los logs en Render.com (Dashboard > whass-backend > Logs)
   - Asegúrate de que las variables de entorno estén configuradas correctamente
   
2. **Error en el frontend**:
   - Verifica que la variable `VITE_API_URL` apunte correctamente al backend
   - Revisa los logs de construcción en Render.com
   
3. **Error en la base de datos**:
   - Verifica la conexión entre el backend y MongoDB
   - Asegúrate de que las credenciales de MongoDB sean correctas

## 📞 Soporte

Si necesitas ayuda adicional, puedes:

- Abrir un issue en el repositorio de GitHub
- Contactar al equipo de soporte de WhassHosting

---

Creado con ❤️ por WhassHosting 