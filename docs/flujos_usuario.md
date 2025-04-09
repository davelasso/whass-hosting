# Flujos de Usuario en DDSBedrocl

Este documento describe los principales flujos de usuario dentro de la plataforma DDSBedrocl, abarcando desde el registro hasta la gestión de servidores Minecraft.

## 1. Registro e Inicio de Sesión

### 1.1 Registro de Nuevo Usuario

1. El usuario accede a la página principal de DDSBedrocl
2. Hace clic en el botón "Registrarse"
3. Completa el formulario con:
   - Nombre de usuario
   - Correo electrónico
   - Contraseña (con requisitos de seguridad)
   - Confirmación de contraseña
4. Acepta los términos de servicio y política de privacidad
5. Hace clic en "Crear cuenta"
6. Recibe un correo electrónico de verificación
7. Confirma su correo haciendo clic en el enlace de verificación
8. Es redirigido a la plataforma y recibe una notificación de bienvenida

### 1.2 Inicio de Sesión

1. El usuario accede a la página principal
2. Hace clic en "Iniciar sesión"
3. Ingresa su correo electrónico y contraseña
4. Opcionalmente marca "Recordarme"
5. Hace clic en "Iniciar sesión"
6. Es redirigido al dashboard principal

### 1.3 Recuperación de Contraseña

1. El usuario hace clic en "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión
2. Ingresa su correo electrónico registrado
3. Recibe un correo con un enlace de restablecimiento
4. Accede al enlace y establece una nueva contraseña
5. Es redirigido a la página de inicio de sesión con un mensaje de éxito

## 2. Gestión de Servidores

### 2.1 Creación de un Nuevo Servidor

1. Desde el dashboard, el usuario hace clic en "Crear servidor"
2. Selecciona el tipo de servidor:
   - Java Edition
   - Bedrock Edition
3. Configura las especificaciones:
   - Nombre del servidor
   - Versión de Minecraft
   - Plantilla (Vanilla, Spigot, Paper, etc.)
   - Recursos (RAM, CPU)
   - Ubicación del servidor (opcional)
4. Revisa el costo mensual según la configuración
5. Hace clic en "Crear servidor"
6. Se muestra una pantalla de progreso durante la creación
7. Una vez creado, es redirigido a la página de gestión del servidor

### 2.2 Panel de Control del Servidor

1. El usuario selecciona un servidor de su lista
2. Accede al panel de control del servidor que muestra:
   - Estado actual (iniciado/detenido)
   - Gráficos de uso de recursos
   - Jugadores conectados
   - Dirección IP y puerto
   - Tiempo de actividad
3. Dispone de botones de acción:
   - Iniciar
   - Detener
   - Reiniciar
   - Acceder a la consola
   - Configuración
   - Backups
   - Plugins/Mods

### 2.3 Consola del Servidor

1. El usuario hace clic en "Consola" desde el panel de control
2. Visualiza los logs en tiempo real del servidor
3. Puede escribir comandos en la entrada de texto inferior
4. Ve las respuestas del servidor inmediatamente
5. Puede filtrar mensajes por tipo o buscar texto específico
6. Puede descargar logs completos para análisis

### 2.4 Gestión de Jugadores

1. El usuario accede a la sección "Jugadores" del panel
2. Visualiza la lista de jugadores conectados con:
   - Nombre de usuario
   - Tiempo de conexión
   - Última actividad
3. Puede realizar acciones por jugador:
   - Expulsar (kick)
   - Banear
   - Dar permisos/op
   - Ver inventario
4. Puede gestionar la lista blanca (whitelist)
5. Configura mensajes de bienvenida personalizados

## 3. Gestión de Backups

### 3.1 Creación de Backup Manual

1. El usuario accede a la sección "Backups" del panel
2. Hace clic en "Crear backup"
3. Opcionalmente añade una descripción
4. Confirma la creación
5. Visualiza el progreso del backup
6. Recibe notificación cuando se completa

### 3.2 Programación de Backups Automáticos

1. El usuario accede a "Configuración de backups"
2. Activa los backups automáticos
3. Configura:
   - Frecuencia (diaria, semanal, personalizada)
   - Hora de ejecución
   - Número de backups a conservar
4. Guarda la configuración

### 3.3 Restauración de Backup

1. El usuario visualiza la lista de backups disponibles
2. Selecciona el backup que desea restaurar
3. Hace clic en "Restaurar"
4. Confirma la acción (con advertencia de que se sobrescribirán los datos actuales)
5. Visualiza el progreso de la restauración
6. Recibe notificación cuando finaliza

## 4. Gestión de Archivos

### 4.1 Explorador de Archivos

1. El usuario accede a la sección "Archivos" del panel
2. Navega por la estructura de directorios del servidor
3. Puede realizar acciones:
   - Ver contenido de archivos
   - Editar archivos (con editor integrado)
   - Crear nuevos archivos o carpetas
   - Eliminar archivos o carpetas
   - Renombrar elementos
   - Cambiar permisos

### 4.2 Carga de Archivos

1. El usuario hace clic en "Subir archivo"
2. Selecciona archivos de su dispositivo o arrastra y suelta
3. Visualiza el progreso de la carga
4. Confirma la ubicación de los archivos cargados

### 4.3 Instalación de Plugins/Mods

1. El usuario accede a la sección "Plugins/Mods"
2. Explora el catálogo integrado de plugins/mods disponibles
3. Selecciona un plugin y lee su descripción
4. Hace clic en "Instalar"
5. Configura opciones específicas del plugin (si aplica)
6. Confirma la instalación
7. El sistema instala el plugin y sus dependencias
8. Se requiere reinicio del servidor para aplicar cambios

## 5. Gestión de Configuración

### 5.1 Configuración del Servidor

1. El usuario accede a "Configuración" del panel
2. Modifica parámetros como:
   - MOTD (mensaje del día)
   - Modo de juego (supervivencia, creativo, etc.)
   - Dificultad
   - PVP (activado/desactivado)
   - Máximo de jugadores
   - Vista de distancia
3. Guarda los cambios
4. Reinicia el servidor para aplicarlos

### 5.2 Ajuste de Recursos

1. El usuario accede a "Recursos" del panel
2. Visualiza el uso actual y límites:
   - RAM asignada
   - Núcleos de CPU
   - Almacenamiento
3. Ajusta los recursos según sus necesidades
4. Visualiza el cambio en el costo mensual
5. Confirma los cambios
6. El sistema aplica los nuevos recursos (puede requerir reinicio)

## 6. Facturación y Pagos

### 6.1 Selección de Plan

1. El usuario accede a la sección "Planes" desde el dashboard
2. Explora los diferentes planes disponibles con sus características
3. Compara planes lado a lado
4. Selecciona el plan que mejor se adapte a sus necesidades
5. Elige ciclo de facturación (mensual, trimestral, anual)
6. Hace clic en "Suscribirse"

### 6.2 Proceso de Pago

1. El usuario introduce o selecciona el método de pago:
   - Tarjeta de crédito/débito
   - PayPal
   - Otros métodos disponibles
2. Ingresa información de facturación
3. Revisa el resumen de la compra
4. Confirma el pago
5. Recibe confirmación y factura por correo electrónico

### 6.3 Gestión de Suscripción

1. El usuario accede a "Mi suscripción" desde el dashboard
2. Visualiza:
   - Plan actual
   - Fecha de próximo pago
   - Historial de pagos
3. Puede realizar acciones:
   - Cambiar de plan
   - Actualizar método de pago
   - Cancelar suscripción
   - Descargar facturas

## 7. Soporte Técnico

### 7.1 Creación de Ticket de Soporte

1. El usuario accede a "Soporte" desde el dashboard
2. Hace clic en "Nuevo ticket"
3. Selecciona categoría del problema
4. Relaciona el ticket con un servidor específico (opcional)
5. Describe el problema detalladamente
6. Adjunta capturas de pantalla o archivos relevantes
7. Envía el ticket
8. Recibe confirmación con número de seguimiento

### 7.2 Seguimiento de Tickets

1. El usuario accede a "Mis tickets"
2. Visualiza lista de tickets actuales e históricos con:
   - ID del ticket
   - Asunto
   - Estado
   - Última actualización
3. Selecciona un ticket para ver detalles
4. Puede añadir comentarios adicionales
5. Recibe notificaciones cuando hay respuestas del soporte
6. Puede cerrar el ticket cuando el problema está resuelto

### 7.3 Base de Conocimientos

1. El usuario accede a la sección "Ayuda"
2. Navega por categorías de artículos
3. Busca por palabras clave
4. Lee artículos con instrucciones paso a paso
5. Ve tutoriales en video integrados
6. Puede calificar si el artículo fue útil

## 8. Comunidad y Colaboración

### 8.1 Gestión de Operadores

1. El usuario accede a "Permisos" del panel
2. Visualiza la lista actual de operadores/administradores
3. Añade nuevos operadores por nombre de usuario
4. Establece niveles de permiso:
   - Administrador completo
   - Moderador
   - Ayudante
5. Especifica permisos individuales
6. Guarda los cambios

### 8.2 Compartir Servidor

1. El usuario accede a "Compartir" desde el panel
2. Genera un enlace de invitación
3. Configura opciones:
   - Expiración del enlace
   - Máximo de usos
   - Permisos otorgados
4. Comparte el enlace por correo o redes sociales
5. Visualiza quién ha aceptado las invitaciones

## 9. Monitoreo y Estadísticas

### 9.1 Dashboard de Rendimiento

1. El usuario accede a "Estadísticas" del panel
2. Visualiza gráficos históricos de:
   - Uso de CPU
   - Uso de RAM
   - Jugadores conectados
   - TPS (ticks por segundo)
3. Selecciona intervalos de tiempo (día, semana, mes)
4. Configura alertas por umbrales

### 9.2 Logs y Auditoría

1. El usuario accede a "Logs del sistema"
2. Filtra por tipo de evento:
   - Inicios/detenciones
   - Conexiones de jugadores
   - Comandos ejecutados
   - Cambios de configuración
3. Exporta logs para análisis externo

## 10. Cierre de Cuenta

### 10.1 Cancelación de Servicios

1. El usuario accede a "Configuración de cuenta"
2. Selecciona "Cancelar servicios"
3. Elige si desea:
   - Cancelar servidores individuales
   - Cancelar toda la cuenta
4. Especifica motivo de cancelación
5. Recibe información sobre datos pendientes
6. Confirma la cancelación

### 10.2 Exportación de Datos

1. El usuario solicita exportación de datos
2. Selecciona qué datos exportar:
   - Mundos de servidores
   - Configuraciones
   - Backups
3. Confirma la solicitud
4. Recibe un enlace para descargar los datos
5. Descarga los datos dentro del plazo especificado

Este documento presenta los flujos principales que un usuario experimentará en la plataforma DDSBedrocl. Estos flujos están diseñados para ser intuitivos, eficientes y proporcionar una experiencia de usuario óptima en la gestión de servidores Minecraft. 