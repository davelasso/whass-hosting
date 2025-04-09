/**
 * Script para crear un usuario administrador
 * Este script crea un usuario con rol de administrador
 */

// Importar dependencias
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../server/models/User');

// Datos del usuario administrador
const adminData = {
  username: 'davdlasso',
  email: 'davdlasso@gmail.com',
  password: 'ddslasso14',
  role: 'admin'
};

// Función principal
async function main() {
  try {
    // Conectar a MongoDB
    console.log('Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ddsbedrocl', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Conexión a MongoDB establecida');

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: adminData.email });
    
    if (existingUser) {
      console.log('El usuario ya existe. Actualizando a rol de administrador...');
      
      // Actualizar a rol de administrador y correo electrónico
      existingUser.role = 'admin';
      existingUser.email = adminData.email; // Actualizar el correo electrónico
      existingUser.isVerified = true; // Usar isVerified en lugar de isEmailVerified para coincidir con el modelo
      existingUser.isActive = true;
      await existingUser.save();
      
      console.log(`Usuario actualizado: ${existingUser.email} ahora es administrador`);
    } else {
      // Crear nuevo usuario
      const user = await User.create({
        username: adminData.username,
        email: adminData.email,
        password: adminData.password,
        role: 'admin',
        isVerified: true, // Marcar como verificado para evitar el proceso de verificación
        isActive: true
      });
      
      console.log(`Usuario administrador creado: ${user.email}`);
    }
    
    console.log('Proceso completado. Ya puedes iniciar sesión con las credenciales de administrador.');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
  }
}

// Ejecutar script
main();