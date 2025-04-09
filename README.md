# Whass Hosting - Plataforma de Hosting para Servidores Minecraft Bedrock

## 🌐 Descripción

Whass Hosting es una plataforma de hosting para servidores Minecraft Bedrock, similar a Aternos pero con planes personalizados y opciones gratuitas y premium.

## 💡 Características

- **Registro y Autenticación de Usuarios**
- **Planes de Hosting Personalizados**
  - Plan Gratuito
  - Planes Premium con recursos adicionales
- **Panel de Control de Servidores**
  - Inicio/Parada/Reinicio de servidores
  - Monitoreo de recursos
  - Configuración de servidor
- **Soporte para Minecraft Bedrock**
  - IP y puerto dedicados
  - Baja latencia
  - Backups automáticos

## 🛠️ Tecnologías Utilizadas

### Frontend
- React + Vite
- Material-UI
- React Router
- Context API

### Backend
- Node.js + Express
- MongoDB
- JWT para autenticación
- Socket.IO para tiempo real

### Infraestructura
- Vercel (Frontend)
- Railway (Backend)
- MongoDB Atlas (Base de datos)

## 🚀 Instalación

### Requisitos Previos
- Node.js (v14 o superior)
- npm o yarn
- MongoDB

### Frontend
```bash
cd client
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
npm start
```

## 📝 Variables de Entorno

### Frontend (.env)
```
VITE_API_URL=http://localhost:5002
VITE_APP_NAME=Whass Hosting
```

### Backend (.env)
```
PORT=5002
MONGODB_URI=mongodb://localhost:27017/whass
JWT_SECRET=your-secret-key
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 👥 Contribución

Las contribuciones son bienvenidas. Por favor, lee [CONTRIBUTING.md](CONTRIBUTING.md) para más detalles.