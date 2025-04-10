@echo off
setlocal EnableDelayedExpansion

:: Colores para la terminal
set RESET=[0m
set BOLD=[1m
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set MAGENTA=[95m
set CYAN=[96m

:: Banner
echo %CYAN%%BOLD%======================================================%RESET%
echo %CYAN%%BOLD%         DESPLIEGUE WHASS HOSTING EN RENDER          %RESET%
echo %CYAN%%BOLD%======================================================%RESET%
echo.

:: Verificar que estamos en el directorio correcto
if not exist "server\package.json" (
  echo %RED%%BOLD%ERROR: No estás en el directorio raíz del proyecto.%RESET%
  echo %YELLOW%Por favor, ejecuta este script desde el directorio raíz del proyecto.%RESET%
  exit /b 1
)

:: Generar credenciales seguras
:: Generar un JWT Secret aleatorio
set "chars=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
set "JWT_SECRET=whass_"
for /L %%i in (1,1,48) do (
  set /a rand=!random! %% 62
  for %%j in (!rand!) do set "JWT_SECRET=!JWT_SECRET!!chars:~%%j,1!"
)

set "DB_USERNAME=whass_admin"
set /a "rand_num=!random! %% 9000 + 1000"
set "DB_PASSWORD=Whass_MongoDB_!rand_num!!"

:: Mostrar credenciales
echo %GREEN%%BOLD%Credenciales generadas:%RESET%
echo %CYAN%JWT Secret:%RESET% %JWT_SECRET%
echo %CYAN%Usuario MongoDB:%RESET% %DB_USERNAME%
echo %CYAN%Contraseña MongoDB:%RESET% %DB_PASSWORD%
echo.

:: Preguntar si continuar
set /p CONTINUE="¿Continuar con el despliegue? (s/n): "
if /i "%CONTINUE%" neq "s" if /i "%CONTINUE%" neq "si" (
  echo %YELLOW%Despliegue cancelado.%RESET%
  exit /b 0
)

:: Crear el archivo render.yaml
echo %BLUE%Generando archivo render.yaml...%RESET%
(
echo services:
echo   # Backend API service
echo   - type: web
echo     name: whass-backend
echo     env: node
echo     rootDir: server
echo     plan: free
echo     buildCommand: npm install
echo     startCommand: npm start
echo     healthCheckPath: /health
echo     envVars:
echo       - key: NODE_ENV
echo         value: production
echo       - key: PORT
echo         value: 10000
echo       - key: JWT_EXPIRE
echo         value: 30d
echo       - key: JWT_COOKIE_EXPIRE
echo         value: 30
echo       - key: JWT_SECRET
echo         value: %JWT_SECRET%
echo       - key: MONGO_URI
echo         value: mongodb://%DB_USERNAME%:%DB_PASSWORD%@whass-mongodb:27017/whass?authSource=admin
echo     autoDeploy: true
echo.
echo   # MongoDB database
echo   - type: pserv
echo     name: whass-mongodb
echo     env: docker
echo     repo: https://github.com/render-examples/mongodb.git
echo     envVars:
echo       - key: MONGO_INITDB_ROOT_USERNAME
echo         value: %DB_USERNAME%
echo       - key: MONGO_INITDB_ROOT_PASSWORD
echo         value: %DB_PASSWORD%
echo     disk:
echo       name: data
echo       mountPath: /data/db
echo       sizeGB: 1
echo.      
echo   # Frontend service
echo   - type: web
echo     name: whass-frontend
echo     env: static
echo     rootDir: client
echo     buildCommand: npm install ^&^& npm run build
echo     staticPublishPath: ./dist
echo     envVars:
echo       - key: VITE_API_URL
echo         value: https://whass-backend.onrender.com/api
echo     routes:
echo       - type: rewrite
echo         source: /*
echo         destination: /index.html
) > render.yaml

echo %GREEN%%BOLD%render.yaml creado correctamente.%RESET%

:: Crear archivo .env.production para el cliente
echo VITE_API_URL=https://whass-backend.onrender.com/api > client\.env.production
echo %GREEN%.env.production creado para el cliente.%RESET%

:: Preparar para subir a GitHub
echo %BLUE%Añadiendo cambios al repositorio Git...%RESET%
git add render.yaml client\.env.production

echo %GREEN%Cambios preparados. Ahora ejecuta los siguientes comandos:%RESET%
echo %YELLOW%git commit -m "Configuración para despliegue en Render.com"%RESET%
echo %YELLOW%git push%RESET%
echo.

echo %MAGENTA%%BOLD%Pasos para completar el despliegue:%RESET%
echo %BLUE%1. Ve a Render.com y crea un nuevo Blueprint:%RESET%
echo    - Inicia sesión en tu cuenta de Render.com
echo    - Ve al Dashboard y haz clic en "New" ^> "Blueprint"
echo    - Conecta tu repositorio de GitHub
echo    - Selecciona el repositorio
echo    - Render detectará automáticamente el archivo render.yaml
echo    - Haz clic en "Apply" para iniciar el despliegue
echo.
echo %BLUE%2. Una vez completado el despliegue:%RESET%
echo    - Backend: https://whass-backend.onrender.com
echo    - Frontend: https://whass-frontend.onrender.com
echo.
echo %GREEN%%BOLD%¡Listo! Tu aplicación estará desplegada en unos minutos.%RESET%

:: Pausa para que el usuario pueda leer la información
echo.
pause 