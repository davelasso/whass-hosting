# Frontend de Whass - Servicio de Hosting de Minecraft

Este es el frontend de la aplicación Whass, un servicio de hosting de servidores de Minecraft.

## Tecnologías

- React
- Material UI
- Axios
- React Router

## Requisitos

- Node.js >= 18.0.0
- npm >= 8.0.0

## Instalación local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar la build
npm run preview
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```
VITE_API_URL=http://localhost:5000/api
```

## Despliegue en Netlify

### Opción 1: Despliegue automático desde GitHub

1. Sube tu código a GitHub
2. Inicia sesión en [Netlify](https://www.netlify.com/)
3. Haz clic en "New site from Git"
4. Selecciona GitHub y el repositorio
5. Configura:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Variables de entorno:
     - `VITE_API_URL`: https://whass-backend.onrender.com/api

### Opción 2: Despliegue manual

1. Construye el proyecto: `npm run build`
2. Instala Netlify CLI: `npm install -g netlify-cli`
3. Inicia sesión: `netlify login`
4. Inicializa el sitio: `netlify init`
5. Despliega: `netlify deploy --prod`

## Estructura del proyecto

- `src/components`: Componentes reutilizables
- `src/pages`: Páginas de la aplicación
- `src/contexts`: Contextos de React (AuthContext, etc.)
- `src/config`: Configuración (rutas API, temas, etc.)
- `src/hooks`: Custom hooks
- `src/utils`: Funciones de utilidad 