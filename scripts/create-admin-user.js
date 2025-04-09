/**
 * Script para crear un usuario administrador
 * Este script registra un nuevo usuario y lo actualiza a rol de administrador
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../server/models/User');

// Datos del usuario administrador
const adminData = {
  username: 'davdlasso',
  email: 'davdlasso@gamil.com',
  password: 'ddslasso14',
  role: 'admin'
};

// Conectar a la base de datos
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Función para crear usuario administrador
const createAdminUser = async () => {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: adminData.email });
    
    if (existingUser) {
      console.log('El usuario ya existe. Actualizando a rol de administrador...');
      
      // Actualizar a rol de administrador
      existingUser.role = 'admin';
      await existingUser.save();
      
      console.log(`Usuario actualizado: ${existingUser.email} ahora es administrador`);
    } else {
      // Crear nuevo usuario
      const user = await User.create({
        username: adminData.username,
        email: adminData.email,
        password: adminData.password,
        role: 'admin',
        isEmailVerified: true, // Marcar como verificado para evitar el proceso de verificación
        isActive: true
      });
      
      console.log(`Usuario administrador creado: ${user.email}`);
    }
    
    console.log('Proceso completado. Ya puedes iniciar sesión con las credenciales de administrador.');
  } catch (error) {
    console.error(`Error al crear usuario administrador: ${error.message}`);
  } finally {
    // Cerrar conexión a la base de datos
    mongoose.connection.close();
  }
};

// Ejecutar el script
connectDB().then(() => {
  createAdminUser();
});