/**
 * Script para inicializar un usuario administrador en MongoDB local
 * Este script crea o actualiza un usuario con rol de administrador
 */

// Importar dependencias
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../server/models/User');

// Datos del usuario administrador
const adminData = {
  username: 'davdlasso',
  email: 'davdlasso@gamil.com',
  password: 'ddslasso14',
  role: 'admin'
};

// Función principal
async function main() {
  try {
    // Conectar a MongoDB local
    console.log('Conectando a MongoDB local...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ddsbedrocl', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`Conexión a MongoDB establecida en ${process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ddsbedrocl'}`);

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: adminData.email });
    
    if (existingUser) {
      console.log('El usuario ya existe. Actualizando a rol de administrador...');
      
      // Actualizar a rol de administrador
      existingUser.role = 'admin';
      existingUser.isVerified = true;
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
    
    console.log('Proceso completado. Ya puedes iniciar sesión con las credenciales de administrador:');
    console.log(`- Usuario: ${adminData.email}`);
    console.log(`- Contraseña: ${adminData.password}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (error.name === 'ValidationError') {
      for (const field in error.errors) {
        console.error(`- Campo ${field}: ${error.errors[field].message}`);
      }
    }
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
  }
}

// Ejecutar script
main();