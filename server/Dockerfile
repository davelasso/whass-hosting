FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

# Configurar variables de entorno para producción
ENV NODE_ENV=production
ENV PORT=5000
ENV MONGO_URI=mongodb://mongo:27017/whass-hosting
ENV JWT_SECRET=your-secret-jwt-key
ENV JWT_EXPIRE=30d
ENV JWT_COOKIE_EXPIRE=30

EXPOSE 5000

CMD ["npm", "start"]