# Configuración de MongoDB Atlas para WhassHosting

Esta guía te ayudará a configurar una base de datos MongoDB gratuita usando MongoDB Atlas para conectarla con tu aplicación WhassHosting en Render.com.

## 1. Crear una cuenta en MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) y haz clic en "Try Free"
2. Puedes registrarte con Google, GitHub o completar el formulario con tu correo electrónico
3. Completa el proceso de registro siguiendo las instrucciones

## 2. Crear un nuevo clúster gratuito

1. En la página de bienvenida, selecciona "Create a deployment"
2. Elige la opción gratuita (M0 Free Tier)
3. Selecciona un proveedor de nube (AWS, Google Cloud o Azure) y una región cercana a ti
4. Haz clic en "Create Cluster" (el proceso de creación puede tomar unos minutos)

## 3. Configurar el acceso a la base de datos

1. Una vez creado el clúster, ve a la sección "Security" > "Database Access"
2. Haz clic en "Add New Database User"
3. Configura un nuevo usuario:
   - Método de autenticación: Password
   - Username: `whass_admin` (o el que prefieras)
   - Password: Crea una contraseña segura (guárdala para usarla más tarde)
   - Database User Privileges: "Atlas admin" o "Read and write to any database"
4. Haz clic en "Add User"

## 4. Configurar acceso de red

1. Ve a la sección "Security" > "Network Access"
2. Haz clic en "Add IP Address"
3. Para desarrollo, puedes elegir "Allow Access from Anywhere" (0.0.0.0/0)
   - Nota: Para entornos de producción, es más seguro permitir solo IPs específicas
4. Haz clic en "Confirm"

## 5. Obtener la cadena de conexión

1. Regresa al dashboard principal haciendo clic en "Database" en el menú lateral
2. Haz clic en "Connect" junto a tu clúster
3. Selecciona "Connect your application"
4. Selecciona "Node.js" como driver y la versión adecuada
5. Copia la cadena de conexión. Tendrá este formato:
   ```
   mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority
   ```
6. Reemplaza:
   - `<username>` con el nombre de usuario que creaste (ej. `whass_admin`)
   - `<password>` con la contraseña que configuraste
   - `<database-name>` con `whass` (o el nombre que prefieras para tu base de datos)

## 6. Configurar en Render.com

1. Al desplegar tu aplicación en Render.com, te pedirá la variable de entorno `MONGO_URI`
2. Introduce la cadena de conexión completa con tus credenciales
3. Ejemplo:
   ```
   mongodb+srv://whass_admin:tuContraseñaSegura@cluster0.mongodb.net/whass?retryWrites=true&w=majority
   ```

## Ventajas de MongoDB Atlas Free Tier:

- 512 MB de almacenamiento gratuito
- Backups automáticos
- Monitoreo incluido
- Sin tarjeta de crédito requerida
- Soporte para conexiones SSL seguras
- Escalable a planes pagados si tu aplicación crece

## Limitaciones:

- Conexiones compartidas (puede ser un poco más lento que un servicio dedicado)
- Solo 3 regiones disponibles para despliegue
- Limitado a 100 conexiones máximas

---

Si necesitas más ayuda con la configuración de MongoDB Atlas, consulta la [documentación oficial](https://docs.atlas.mongodb.com/). 