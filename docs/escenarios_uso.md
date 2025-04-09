# 5. Escenarios de Uso y Casos de Prueba

Este documento describe los principales escenarios de uso y casos de prueba para la plataforma DDSBedrocl, abarcando las perspectivas del cliente final, administradores/staff y el sistema de soporte y resolución de problemas.

## 5.1 Escenarios de Uso para Cliente Final

### 5.1.1 Registro y Autenticación

#### Escenario: Registro de nuevo usuario
**Flujo principal:**
1. Usuario accede a la página principal de DDSBedrocl
2. Selecciona la opción "Registrarse"
3. Completa el formulario con datos válidos:
   - Nombre de usuario
   - Correo electrónico
   - Contraseña
   - Confirmación de contraseña
4. Acepta términos y condiciones
5. Hace clic en "Crear cuenta"
6. Recibe correo de verificación
7. Confirma la cuenta a través del enlace recibido
8. Es redirigido al dashboard con mensaje de bienvenida

**Variantes:**
- Datos inválidos: sistema muestra mensajes de error específicos
- Cuenta ya existente: notificación correspondiente
- Correo de verificación no recibido: opción para reenvío

#### Escenario: Inicio de sesión
**Flujo principal:**
1. Usuario accede a la página de inicio de sesión
2. Introduce credenciales válidas
3. Accede al dashboard personal

**Variantes:**
- Credenciales incorrectas: mensaje de error apropiado
- Cuenta no verificada: notificación para completar verificación
- Olvidó contraseña: proceso de recuperación

### 5.1.2 Selección de Plan y Despliegue de Servidor

#### Escenario: Contratación de un nuevo plan
**Flujo principal:**
1. Usuario inicia sesión en su cuenta
2. Navega a la sección "Planes"
3. Compara diferentes opciones de planes
4. Selecciona plan adecuado a sus necesidades
5. Revisa detalles del plan (recursos, precio, términos)
6. Confirma selección y procede al pago
7. Completa información de pago
8. Recibe confirmación de suscripción
9. Es redirigido a su dashboard con plan activado

**Variantes:**
- Error en procesamiento de pago: notificación y alternativas
- Cambio de plan: comparativa y ajuste proporcional
- Cancelación durante el proceso: estado guardado para continuar después

#### Escenario: Despliegue de nuevo servidor
**Flujo principal:**
1. Usuario accede a su dashboard
2. Selecciona "Crear nuevo servidor"
3. Configura parámetros del servidor:
   - Nombre del servidor
   - Versión de Minecraft (Java/Bedrock)
   - Plantilla (Vanilla, Spigot, PaperMC, etc.)
   - Recursos asignados (dentro de límites del plan)
4. Revisa configuración
5. Confirma creación
6. Visualiza progreso de despliegue
7. Recibe notificación cuando el servidor está listo
8. Accede al panel de control del servidor

**Variantes:**
- Recursos insuficientes en el plan: notificación para actualizar
- Problemas durante despliegue: mensaje de error y opciones
- Despliegue desde plantilla personalizada o backup existente

### 5.1.3 Gestión de Servidor

#### Escenario: Configuración básica de servidor
**Flujo principal:**
1. Usuario accede al panel de control de su servidor
2. Navega a la sección "Configuración"
3. Modifica parámetros básicos:
   - MOTD (mensaje del día)
   - Modo de juego (supervivencia, creativo, etc.)
   - Dificultad
   - Máximo de jugadores
4. Guarda cambios
5. Reinicia el servidor para aplicar cambios
6. Verifica que los cambios se han aplicado correctamente

**Variantes:**
- Configuración avanzada mediante edición de archivos
- Restauración a configuración predeterminada
- Programación de cambios para aplicación posterior

#### Escenario: Administración de plugins/mods
**Flujo principal:**
1. Usuario accede a la sección "Plugins/Mods"
2. Explora catálogo de plugins disponibles
3. Selecciona plugin deseado
4. Revisa compatibilidad y descripción
5. Instala el plugin
6. Configura parámetros específicos del plugin
7. Reinicia el servidor
8. Verifica funcionamiento del plugin

**Variantes:**
- Carga manual de plugins personalizados
- Actualización de plugins existentes
- Desactivación temporal de plugins
- Resolución de conflictos entre plugins

#### Escenario: Gestión de jugadores
**Flujo principal:**
1. Usuario accede a la sección "Jugadores"
2. Visualiza lista de jugadores conectados
3. Selecciona un jugador específico
4. Aplica acciones:
   - Otorgar permisos
   - Expulsar (kick)
   - Banear
5. Configura lista blanca (whitelist)
6. Añade/elimina jugadores de la lista
7. Aplica y guarda cambios

**Variantes:**
- Gestión de grupos de permisos
- Establecimiento de reglas automáticas
- Revisión de logs de actividad de jugadores

### 5.1.4 Manejo de Backups

#### Escenario: Creación de backup manual
**Flujo principal:**
1. Usuario accede a la sección "Backups"
2. Selecciona "Crear nuevo backup"
3. Añade descripción (opcional)
4. Inicia proceso de backup
5. Visualiza progreso
6. Recibe notificación de finalización
7. Verifica el backup en la lista

**Variantes:**
- Backup programado para horas específicas
- Backup antes de actualización o modificación mayor
- Backup selectivo de componentes específicos

#### Escenario: Restauración desde backup
**Flujo principal:**
1. Usuario accede a la lista de backups
2. Selecciona backup específico para restaurar
3. Confirma la acción (con advertencia)
4. Visualiza progreso de restauración
5. Recibe notificación de finalización
6. Verifica el estado del servidor restaurado

**Variantes:**
- Restauración parcial (solo ciertos elementos)
- Restauración a un nuevo servidor
- Restauración con modificaciones

### 5.1.5 Soporte Técnico

#### Escenario: Creación de ticket de soporte
**Flujo principal:**
1. Usuario encuentra un problema técnico
2. Accede a la sección "Soporte"
3. Selecciona "Nuevo ticket"
4. Selecciona categoría del problema
5. Describe el problema detalladamente
6. Adjunta capturas o logs (opcional)
7. Envía el ticket
8. Recibe confirmación con número de seguimiento
9. Espera respuesta del equipo de soporte

**Variantes:**
- Consulta de base de conocimientos antes de crear ticket
- Solicitud de asistencia en vivo (chat)
- Escalamiento de ticket existente

## 5.2 Escenarios para Administradores/Staff

### 5.2.1 Monitoreo de Servidores y Recursos

#### Escenario: Supervisión general del sistema
**Flujo principal:**
1. Administrador accede al panel de administración
2. Visualiza dashboard general con:
   - Número total de servidores activos/inactivos
   - Uso global de recursos (CPU, RAM, almacenamiento)
   - Tendencias de uso
   - Alertas activas
3. Filtra servidores por estado, tipo o recursos
4. Identifica servidores con problemas potenciales
5. Accede a detalles específicos de servidores prioritarios

**Variantes:**
- Vista consolidada por cliente
- Análisis de tendencias históricas
- Configuración de umbrales de alerta personalizados

#### Escenario: Diagnóstico de servidor problemático
**Flujo principal:**
1. Administrador recibe alerta sobre servidor con problemas
2. Accede al panel del servidor específico
3. Revisa métricas en tiempo real:
   - Uso de CPU/RAM
   - TPS (ticks por segundo)
   - Errores en logs
4. Analiza logs para identificar causa
5. Ejecuta diagnósticos automáticos
6. Determina acciones correctivas
7. Aplica solución o escala según sea necesario

**Variantes:**
- Reinicio automático por bajo TPS
- Migración a otro nodo físico
- Comunicación con el cliente sobre el problema

### 5.2.2 Gestión de Incidencias

#### Escenario: Resolución de ticket de soporte
**Flujo principal:**
1. Administrador accede al sistema de tickets
2. Visualiza lista de tickets pendientes
3. Prioriza según severidad y tiempo de espera
4. Selecciona ticket para atender
5. Analiza la información proporcionada
6. Diagnóstica el problema
7. Aplica solución si está dentro de su alcance
8. Documenta los pasos realizados
9. Responde al cliente con la solución
10. Cierra el ticket o lo mantiene abierto para seguimiento

**Variantes:**
- Escalamiento a nivel técnico superior
- Solicitud de información adicional al cliente
- Creación de artículo en base de conocimientos

#### Escenario: Manejo de incidente mayor
**Flujo principal:**
1. Sistema detecta problema que afecta a múltiples servidores
2. Genera alerta crítica para el equipo de administración
3. Administrador activa protocolo de incidentes:
   - Evaluación inicial de impacto
   - Comunicación interna al equipo técnico
   - Notificación a usuarios afectados
4. Coordina acciones correctivas
5. Monitorea progreso de la resolución
6. Actualiza a usuarios sobre el estado
7. Documenta incidente y resolución
8. Coordina análisis post-mortem

**Variantes:**
- Activación de servidores redundantes
- Implementación de soluciones temporales
- Compensación a clientes afectados

### 5.2.3 Mantenimiento y Actualizaciones

#### Escenario: Actualización programada de plataforma
**Flujo principal:**
1. Administrador planifica ventana de mantenimiento
2. Notifica a usuarios con anticipación
3. Prepara entorno de staging para pruebas
4. Realiza backup completo pre-actualización
5. Implementa actualización en entorno de staging
6. Ejecuta pruebas completas
7. Programa la actualización en producción
8. Supervisa el proceso de actualización
9. Verifica funcionamiento post-actualización
10. Comunica finalización a usuarios

**Variantes:**
- Rollback en caso de problemas
- Actualización gradual (por grupos de servidores)
- Posponer actualización por problemas detectados

#### Escenario: Optimización de recursos
**Flujo principal:**
1. Administrador identifica ineficiencias en uso de recursos
2. Analiza patrones de uso y carga
3. Diseña plan de optimización
4. Implementa cambios en configuraciones generales
5. Monitorea impacto de cambios
6. Ajusta según resultados
7. Documenta mejoras y configuraciones optimizadas

**Variantes:**
- Recomendaciones personalizadas para servidores específicos
- Migración de servidores entre nodos para equilibrar carga
- Implementación de políticas de auto-scaling

## 5.3 Soporte y Resolución de Problemas

### 5.3.1 Herramientas de Logs y Análisis

#### Escenario: Análisis de problemas de rendimiento
**Flujo principal:**
1. Soporte recibe reporte de bajo rendimiento
2. Accede al sistema de monitorización
3. Visualiza gráficos de rendimiento histórico
4. Identifica patrones o momentos específicos de deterioro
5. Accede a logs del servidor en períodos clave
6. Analiza eventos y errores correlacionados
7. Identifica causa raíz (plugins problemáticos, configuración, etc.)
8. Desarrolla solución específica
9. Implementa y verifica mejoría

**Variantes:**
- Análisis comparativo con servidores similares
- Identificación de patrones recurrentes
- Correlación con actualizaciones o cambios recientes

#### Escenario: Investigación de crash de servidor
**Flujo principal:**
1. Sistema detecta cierre inesperado de servidor
2. Genera alerta automática
3. Técnico de soporte accede a los crash logs
4. Analiza stacktrace y mensajes de error
5. Identifica componente causante (plugin, mod, configuración)
6. Reproduce el problema en entorno controlado (si es posible)
7. Desarrolla solución o workaround
8. Implementa la solución
9. Monitorea para confirmar resolución
10. Actualiza base de conocimientos

**Variantes:**
- Desactivación temporal de plugins sospechosos
- Restauración a versión anterior funcional
- Escalamiento a desarrolladores de plugin/mod

### 5.3.2 Acceso Remoto a Consola

#### Escenario: Resolución de problema via consola
**Flujo principal:**
1. Cliente reporta problema específico
2. Soporte solicita permiso para acceso administrativo
3. Cliente autoriza acceso
4. Técnico accede a la consola del servidor
5. Ejecuta comandos de diagnóstico
6. Identifica problema
7. Aplica comandos correctivos
8. Verifica resolución
9. Documenta proceso y comandos utilizados
10. Notifica al cliente con detalles de la solución

**Variantes:**
- Sesión compartida con cliente para formación
- Grabación de sesión para documentación
- Creación de script automatizado para futuros casos similares

#### Escenario: Aplicación de parches o correcciones
**Flujo principal:**
1. Soporte identifica bug conocido que afecta al servidor
2. Prepara parche o corrección
3. Notifica al cliente sobre el problema y solución
4. Programa ventana de mantenimiento
5. Accede a archivos del servidor
6. Aplica el parche necesario
7. Reinicia servicios afectados
8. Verifica correcto funcionamiento
9. Documenta la intervención
10. Actualiza base de conocimientos

**Variantes:**
- Parche automático sin intervención manual
- Rollback en caso de efectos secundarios
- Parche temporal mientras se espera solución definitiva

### 5.3.3 Sistema de Backups y Restauración

#### Escenario: Recuperación tras corrupción de datos
**Flujo principal:**
1. Cliente reporta problemas con mundo corrupto
2. Soporte verifica síntomas de corrupción
3. Analiza logs para determinar causa y extensión
4. Revisa backups disponibles
5. Identifica backup más reciente sin corrupción
6. Planifica restauración con el cliente
7. Realiza backup del estado actual (para análisis)
8. Ejecuta proceso de restauración
9. Verifica integridad post-restauración
10. Proporciona recomendaciones para evitar futuros problemas

**Variantes:**
- Restauración parcial (solo regiones afectadas)
- Reparación de datos sin restauración completa
- Recuperación de elementos específicos (inventarios, estructuras)

#### Escenario: Migración a nuevo servidor
**Flujo principal:**
1. Cliente solicita migración por cambio de plan o problemas
2. Soporte planifica proceso con el cliente
3. Crea backup completo del servidor actual
4. Despliega nuevo servidor con configuración actualizada
5. Restaura datos y configuraciones desde backup
6. Adapta configuraciones al nuevo entorno
7. Realiza pruebas completas
8. Programa ventana para cambio de DNS/IP
9. Ejecuta cambio final
10. Monitorea nuevo servidor durante período inicial

**Variantes:**
- Migración gradual (pruebas con grupo limitado)
- Período de coexistencia de ambos servidores
- Sincronización continua durante la transición

## 5.4 Casos de Prueba Específicos

Los siguientes casos de prueba deben ejecutarse regularmente para asegurar la calidad y confiabilidad de la plataforma:

### 5.4.1 Pruebas Funcionales

#### Caso de prueba: Ciclo completo de servidor
1. Crear nuevo servidor desde panel
2. Verificar provisión correcta
3. Iniciar servidor
4. Conectarse mediante cliente Minecraft
5. Realizar operaciones básicas en el juego
6. Detener servidor desde panel
7. Reiniciar servidor
8. Verificar persistencia de datos
9. Eliminar servidor

#### Caso de prueba: Gestión de backups
1. Crear backup manual
2. Verificar integridad del backup
3. Modificar mundo (construcciones, inventario)
4. Restaurar desde backup
5. Verificar que los cambios posteriores no están presentes
6. Comprobar que estado anterior se ha recuperado correctamente

#### Caso de prueba: Sistema de permisos
1. Crear usuario con distintos roles (admin, moderador, usuario)
2. Verificar acceso según permisos para cada rol
3. Modificar permisos durante sesión activa
4. Comprobar aplicación inmediata de cambios
5. Verificar registro de auditoría de acciones

### 5.4.2 Pruebas de Rendimiento

#### Caso de prueba: Carga máxima de jugadores
1. Configurar servidor para número específico de slots
2. Conectar jugadores (reales o simulados) hasta alcanzar capacidad
3. Monitorear métricas de rendimiento (TPS, RAM, CPU)
4. Verificar comportamiento al exceder capacidad
5. Comprobar mensajes de error apropiados

#### Caso de prueba: Respuesta ante picos de carga
1. Servidor en estado estable con carga normal
2. Generar actividad intensiva (explosiones, redstone, generación de chunks)
3. Monitorear respuesta del sistema de auto-scaling
4. Verificar alertas generadas
5. Comprobar recuperación tras finalizar el pico

### 5.4.3 Pruebas de Seguridad

#### Caso de prueba: Aislamiento de servidores
1. Crear múltiples servidores en mismo nodo
2. Intentar acceder desde un servidor a recursos de otro
3. Verificar que el aislamiento impide el acceso
4. Comprobar logs de seguridad

#### Caso de prueba: Protección contra ataques
1. Simular intento de conexiones excesivas (DoS)
2. Verificar activación de limitadores de tasa
3. Comprobar bloqueo de IPs maliciosas
4. Revisar alertas y notificaciones generadas
5. Verificar persistencia de protecciones tras reinicio

### 5.4.4 Pruebas de Recuperación

#### Caso de prueba: Fallo de energía/hardware
1. Simular apagado abrupto de nodo
2. Verificar detección de fallo
3. Comprobar activación de nodo redundante (si aplica)
4. Verificar restauración automática de servidores
5. Comprobar notificaciones a clientes afectados
6. Verificar integridad de datos post-recuperación

#### Caso de prueba: Corrupción de base de datos
1. Simular corrupción en base de datos
2. Verificar detección del problema
3. Comprobar activación de replica/backup
4. Verificar proceso de recuperación
5. Comprobar integridad de datos restaurados
6. Verificar impacto en disponibilidad del servicio

## 5.5 Matriz de Verificación de Calidad

La siguiente matriz debe utilizarse para validar las nuevas versiones de la plataforma antes de su despliegue:

| Categoría | Caso de Prueba | Prioridad | Frecuencia |
|-----------|---------------|-----------|------------|
| **Funcional** | Registro e inicio de sesión | Alta | Cada versión |
| | Ciclo completo de servidor | Alta | Cada versión |
| | Gestión de backups | Alta | Cada versión |
| | Panel de administración | Media | Cada versión |
| | Facturación y pagos | Alta | Cada versión |
| **Rendimiento** | Carga normal | Alta | Cada versión |
| | Carga máxima | Media | Trimestral |
| | Tiempos de respuesta | Alta | Cada versión |
| | Escalabilidad | Media | Trimestral |
| **Seguridad** | Autenticación y permisos | Alta | Cada versión |
| | Aislamiento de recursos | Alta | Cada versión |
| | Protección contra ataques | Media | Trimestral |
| | Encriptación de datos | Alta | Semestral |
| **Recuperación** | Backup y restauración | Alta | Cada versión |
| | Fallo de hardware | Alta | Trimestral |
| | Corrupción de datos | Media | Trimestral |
| | Caída de servicios externos | Media | Semestral |

Cada prueba debe resultar en un informe detallado documentando la configuración, pasos ejecutados, resultados obtenidos y cualquier incidencia encontrada durante el proceso.

Los escenarios de uso y casos de prueba detallados en este documento proporcionan una base sólida para garantizar la calidad, estabilidad y seguridad de la plataforma DDSBedrocl, asegurando tanto la satisfacción de los usuarios finales como la capacidad del equipo técnico para administrar eficientemente el sistema. 