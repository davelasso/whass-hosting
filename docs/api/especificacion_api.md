# Especificación de API para DDSBedrocl

Este documento detalla los endpoints disponibles en la API RESTful de DDSBedrocl para la gestión de servidores Minecraft.

## Base URL

```
https://api.ddsbedrocl.com/v1
```

## Autenticación

Todas las peticiones a la API (excepto las de registro e inicio de sesión) deben incluir un token JWT en el encabezado de autorización:

```
Authorization: Bearer <token_jwt>
```

## Formatos de respuesta

Todas las respuestas de la API siguen el siguiente formato:

**Éxito:**
```json
{
  "status": "success",
  "data": { ... }
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Descripción del error"
}
```

## Endpoints

### Autenticación

#### Registro de usuario

```
POST /auth/register
```

**Parámetros de solicitud:**
```json
{
  "username": "usuario123",
  "email": "usuario@example.com",
  "password": "Contraseña123"
}
```

**Respuesta exitosa (201 Created):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "username": "usuario123",
      "email": "usuario@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Inicio de sesión

```
POST /auth/login
```

**Parámetros de solicitud:**
```json
{
  "email": "usuario@example.com",
  "password": "Contraseña123"
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "username": "usuario123",
      "email": "usuario@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Obtener perfil de usuario

```
GET /auth/me
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "username": "usuario123",
      "email": "usuario@example.com",
      "createdAt": "2023-01-15T14:22:31.000Z"
    }
  }
}
```

### Servidores

#### Listar servidores del usuario

```
GET /servers
```

**Parámetros de consulta opcionales:**
- `page`: Número de página
- `limit`: Elementos por página
- `status`: Filtrar por estado (running, stopped, error)

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "results": 2,
  "data": {
    "servers": [
      {
        "id": "61f3d94c5b63a22e1d72f235",
        "name": "mi-servidor-survival",
        "type": "java",
        "version": "1.19.2",
        "status": "running",
        "ip": "mc1.ddsbedrocl.com",
        "port": 25565,
        "ram": 2048,
        "cpu": 1,
        "createdAt": "2023-02-10T18:44:12.000Z"
      },
      {
        "id": "61f3e02c5b63a22e1d72f236",
        "name": "mi-servidor-creativo",
        "type": "bedrock",
        "version": "1.19.50",
        "status": "stopped",
        "ip": "mc2.ddsbedrocl.com",
        "port": 19132,
        "ram": 1024,
        "cpu": 1,
        "createdAt": "2023-02-15T12:22:04.000Z"
      }
    ]
  }
}
```

#### Crear nuevo servidor

```
POST /servers
```

**Parámetros de solicitud:**
```json
{
  "name": "mi-nuevo-servidor",
  "type": "java",
  "version": "1.19.2",
  "ram": 2048,
  "template": "vanilla"
}
```

**Respuesta exitosa (201 Created):**
```json
{
  "status": "success",
  "data": {
    "server": {
      "id": "61f3e78c5b63a22e1d72f237",
      "name": "mi-nuevo-servidor",
      "type": "java",
      "version": "1.19.2",
      "status": "creating",
      "ip": "mc3.ddsbedrocl.com",
      "port": 25567,
      "ram": 2048,
      "cpu": 1,
      "createdAt": "2023-03-05T08:15:40.000Z"
    }
  }
}
```

#### Obtener información de un servidor

```
GET /servers/:id
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "data": {
    "server": {
      "id": "61f3d94c5b63a22e1d72f235",
      "name": "mi-servidor-survival",
      "type": "java",
      "version": "1.19.2",
      "status": "running",
      "ip": "mc1.ddsbedrocl.com",
      "port": 25565,
      "ram": 2048,
      "cpu": 1,
      "storage": {
        "used": 256,
        "total": 5120
      },
      "players": {
        "online": 3,
        "max": 20
      },
      "stats": {
        "uptime": 324567,
        "cpu_usage": 15.4,
        "ram_usage": 1256
      },
      "createdAt": "2023-02-10T18:44:12.000Z",
      "owner": "60d21b4667d0d8992e610c85"
    }
  }
}
```

#### Actualizar servidor

```
PUT /servers/:id
```

**Parámetros de solicitud:**
```json
{
  "name": "servidor-survival-actualizado",
  "ram": 4096
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "data": {
    "server": {
      "id": "61f3d94c5b63a22e1d72f235",
      "name": "servidor-survival-actualizado",
      "ram": 4096
    }
  }
}
```

#### Eliminar servidor

```
DELETE /servers/:id
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "message": "Servidor eliminado correctamente"
}
```

#### Iniciar servidor

```
POST /servers/:id/start
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "message": "Servidor iniciado correctamente",
  "data": {
    "status": "starting"
  }
}
```

#### Detener servidor

```
POST /servers/:id/stop
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "message": "Servidor detenido correctamente",
  "data": {
    "status": "stopping"
  }
}
```

#### Reiniciar servidor

```
POST /servers/:id/restart
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "message": "Servidor reiniciado correctamente",
  "data": {
    "status": "restarting"
  }
}
```

#### Obtener logs del servidor

```
GET /servers/:id/logs
```

**Parámetros de consulta opcionales:**
- `lines`: Número de líneas a devolver (default: 100)
- `since`: Timestamp desde el cual obtener logs

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "data": {
    "logs": [
      {
        "timestamp": "2023-03-10T14:22:31.000Z",
        "level": "INFO",
        "message": "Server started on port 25565"
      },
      {
        "timestamp": "2023-03-10T14:22:35.000Z",
        "level": "INFO",
        "message": "Player user123 joined the game"
      }
    ]
  }
}
```

#### Ejecutar comando en el servidor

```
POST /servers/:id/command
```

**Parámetros de solicitud:**
```json
{
  "command": "say Hola a todos los jugadores"
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "data": {
    "result": "Mensaje enviado: Hola a todos los jugadores"
  }
}
```

### Backups

#### Listar backups de un servidor

```
GET /servers/:serverId/backups
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "results": 2,
  "data": {
    "backups": [
      {
        "fileName": "mi-servidor-survival-2023-03-10T14-30-00.zip",
        "date": "2023-03-10T14:30:00.000Z",
        "size": 104857600,
        "sizeMB": "100.00"
      },
      {
        "fileName": "mi-servidor-survival-2023-03-09T14-30-00.zip",
        "date": "2023-03-09T14:30:00.000Z",
        "size": 94371840,
        "sizeMB": "90.00"
      }
    ]
  }
}
```

#### Crear backup

```
POST /servers/:serverId/backups
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "data": {
    "backup": {
      "serverId": "61f3d94c5b63a22e1d72f235",
      "serverName": "mi-servidor-survival",
      "backupFile": "/backups/61f3d94c5b63a22e1d72f235/mi-servidor-survival-2023-03-11T10-15-00.zip",
      "timestamp": "2023-03-11T10:15:00.000Z",
      "size": 115343360,
      "sizeMB": "110.00"
    }
  },
  "message": "Backup creado correctamente"
}
```

#### Restaurar backup

```
POST /servers/:serverId/backups/:backupFileName/restore
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "message": "Backup restaurado correctamente"
}
```

#### Eliminar backup

```
DELETE /servers/:serverId/backups/:backupFileName
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "message": "Backup eliminado correctamente"
}
```

### Facturación

#### Obtener planes disponibles

```
GET /billing/plans
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "data": {
    "plans": [
      {
        "id": "plan_basic",
        "name": "Básico",
        "description": "Plan básico para servidores pequeños",
        "price": 5.99,
        "currency": "USD",
        "interval": "month",
        "features": {
          "ram": 2048,
          "cpu": 1,
          "storage": 5120,
          "backups": 5,
          "players": 20
        }
      },
      {
        "id": "plan_standard",
        "name": "Estándar",
        "description": "Plan estándar para servidores medianos",
        "price": 12.99,
        "currency": "USD",
        "interval": "month",
        "features": {
          "ram": 4096,
          "cpu": 2,
          "storage": 10240,
          "backups": 10,
          "players": 50
        }
      }
    ]
  }
}
```

#### Crear sesión de pago

```
POST /billing/checkout
```

**Parámetros de solicitud:**
```json
{
  "planId": "plan_standard",
  "interval": "month"
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "data": {
    "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0",
    "url": "https://checkout.stripe.com/pay/cs_test_a1b2c3d4e5f6g7h8i9j0"
  }
}
```

#### Obtener historial de facturación

```
GET /billing/invoices
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "data": {
    "invoices": [
      {
        "id": "in_1MkX6rGswQdI1h3x0YL2XZL7",
        "amount": 12.99,
        "currency": "USD",
        "status": "paid",
        "date": "2023-03-01T10:00:00.000Z",
        "planId": "plan_standard",
        "planName": "Estándar",
        "pdfUrl": "https://example.com/invoice-1234.pdf"
      }
    ]
  }
}
```

### Soporte

#### Crear ticket de soporte

```
POST /support/tickets
```

**Parámetros de solicitud:**
```json
{
  "subject": "Problema de conexión",
  "message": "No puedo conectarme a mi servidor desde mi cliente de Minecraft",
  "serverId": "61f3d94c5b63a22e1d72f235"
}
```

**Respuesta exitosa (201 Created):**
```json
{
  "status": "success",
  "data": {
    "ticket": {
      "id": "ticket_123456",
      "subject": "Problema de conexión",
      "status": "open",
      "createdAt": "2023-03-11T15:30:00.000Z"
    }
  }
}
```

#### Listar tickets de soporte

```
GET /support/tickets
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "results": 2,
  "data": {
    "tickets": [
      {
        "id": "ticket_123456",
        "subject": "Problema de conexión",
        "status": "open",
        "createdAt": "2023-03-11T15:30:00.000Z",
        "updatedAt": "2023-03-11T15:30:00.000Z"
      },
      {
        "id": "ticket_123457",
        "subject": "Backup fallido",
        "status": "closed",
        "createdAt": "2023-03-10T12:00:00.000Z",
        "updatedAt": "2023-03-10T14:30:00.000Z"
      }
    ]
  }
}
```

#### Obtener detalles de un ticket

```
GET /support/tickets/:id
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "data": {
    "ticket": {
      "id": "ticket_123456",
      "subject": "Problema de conexión",
      "status": "open",
      "serverId": "61f3d94c5b63a22e1d72f235",
      "serverName": "mi-servidor-survival",
      "createdAt": "2023-03-11T15:30:00.000Z",
      "updatedAt": "2023-03-11T15:30:00.000Z",
      "messages": [
        {
          "id": "msg_1",
          "text": "No puedo conectarme a mi servidor desde mi cliente de Minecraft",
          "sender": "user",
          "senderName": "usuario123",
          "timestamp": "2023-03-11T15:30:00.000Z"
        },
        {
          "id": "msg_2",
          "text": "Por favor verifica que estás utilizando la dirección IP y puerto correctos. ¿Podrías indicarnos qué error te aparece?",
          "sender": "support",
          "senderName": "Soporte DDSBedrocl",
          "timestamp": "2023-03-11T15:45:00.000Z"
        }
      ]
    }
  }
}
```

#### Responder a un ticket

```
POST /support/tickets/:id/messages
```

**Parámetros de solicitud:**
```json
{
  "message": "El error que me aparece es 'Cannot connect to server. Connection timed out.'"
}
```

**Respuesta exitosa (201 Created):**
```json
{
  "status": "success",
  "data": {
    "message": {
      "id": "msg_3",
      "text": "El error que me aparece es 'Cannot connect to server. Connection timed out.'",
      "sender": "user",
      "senderName": "usuario123",
      "timestamp": "2023-03-11T16:00:00.000Z"
    }
  }
}
```

#### Cerrar un ticket

```
PUT /support/tickets/:id
```

**Parámetros de solicitud:**
```json
{
  "status": "closed"
}
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "data": {
    "ticket": {
      "id": "ticket_123456",
      "status": "closed",
      "updatedAt": "2023-03-11T16:30:00.000Z"
    }
  },
  "message": "Ticket cerrado correctamente"
}
```

### Administración (Solo para administradores)

#### Listar todos los usuarios

```
GET /admin/users
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "results": 2,
  "data": {
    "users": [
      {
        "id": "60d21b4667d0d8992e610c85",
        "username": "usuario123",
        "email": "usuario@example.com",
        "isAdmin": false,
        "status": "active",
        "createdAt": "2023-01-15T14:22:31.000Z"
      },
      {
        "id": "60d21c3567d0d8992e610c86",
        "username": "usuario456",
        "email": "usuario2@example.com",
        "isAdmin": false,
        "status": "active",
        "createdAt": "2023-01-16T10:15:00.000Z"
      }
    ]
  }
}
```

#### Obtener estadísticas del sistema

```
GET /admin/stats
```

**Respuesta exitosa (200 OK):**
```json
{
  "status": "success",
  "data": {
    "stats": {
      "users": {
        "total": 150,
        "activeToday": 45
      },
      "servers": {
        "total": 200,
        "running": 120,
        "stopped": 80
      },
      "resources": {
        "cpuUsage": 65.4,
        "ramUsage": 75.2,
        "diskUsage": 42.8
      },
      "revenue": {
        "lastMonth": 1250.50,
        "currentMonth": 980.25,
        "currency": "USD"
      }
    }
  }
}
```

## Códigos de estado HTTP

- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado correctamente
- `400 Bad Request`: Error en la solicitud (datos incorrectos o incompletos)
- `401 Unauthorized`: Autenticación requerida o fallida
- `403 Forbidden`: No tiene permisos para acceder al recurso
- `404 Not Found`: Recurso no encontrado
- `429 Too Many Requests`: Demasiadas solicitudes (rate limiting)
- `500 Internal Server Error`: Error interno del servidor

## Versionado de API

La API está versionada en la URL para garantizar la compatibilidad hacia atrás. La versión actual es `v1`.

## Límites de tasa (Rate Limiting)

Para proteger la API contra abusos, se aplican los siguientes límites:

- 100 solicitudes por dirección IP por 15 minutos
- Los límites pueden ser mayores para usuarios autenticados

Cuando se alcanza el límite, la API devuelve un código de estado HTTP 429 con un mensaje de error indicando cuándo se puede volver a intentar.

## Webhooks

La API proporciona webhooks para notificar eventos importantes:

- `server.created`: Cuando se crea un nuevo servidor
- `server.started`: Cuando un servidor se inicia
- `server.stopped`: Cuando un servidor se detiene
- `server.error`: Cuando un servidor entra en estado de error
- `payment.succeeded`: Cuando se procesa un pago correctamente
- `payment.failed`: Cuando falla un pago

Para configurar los webhooks, contacte con el soporte técnico. 