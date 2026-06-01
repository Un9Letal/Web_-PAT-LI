# 🤖 Backend PAT-LI - Sistema de Ventas con Chatbot de IA

Sistema backend Node.js + Express para gestión de ventas, clientes e inventario con integración de chatbot generativo basado en OpenAI.

## 📋 Requisitos

- **Node.js**: v20+
- **MySQL**: v8.0+
- **npm**: v10+
- **OpenAI API Key**: Para el chatbot de IA

## 🚀 Instalación

### 1. Clonar y instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Copiar `.env.example` a `.env` y completar:

```bash
cp .env.example .env
```

Editar `.env`:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=sistema_chatbot_ventas
DB_USER=root
DB_PASSWORD=

JWT_SECRET=tu_clave_secreta_muy_larga_aqui
JWT_EXPIRES_IN=8h

OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=500
```

### 3. Crear base de datos

```bash
mysql -u root -p < database/sistema.sql
```

### 4. Iniciar servidor

**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm run build
npm start
```

## 🐳 Docker Compose

```bash
# Iniciar servicios (DB + API)
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Detener
docker-compose down
```

## 📚 Endpoints Principales

### 🔐 Autenticación
- `POST /api/auth/login` - Login usuario
- `POST /api/auth/register` - Registrar usuario (solo admin)

### 🤖 Chatbot
- `POST /api/chatbot/mensaje` - Enviar mensaje (sin auth - público)
- `GET /api/chatbot/conversacion/:id` - Historial conversación
- `GET /api/chatbot/conversaciones` - Listar conversaciones (auth requerida)
- `GET /api/chatbot/metricas` - Métricas chatbot (admin)

### 📦 Productos
- `GET /api/productos` - Listar productos (público)
- `GET /api/productos/:id` - Obtener producto
- `POST /api/productos` - Crear (admin)
- `PUT /api/productos/:id` - Actualizar (admin)
- `DELETE /api/productos/:id` - Eliminar (admin)

### 👥 Clientes
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:id` - Obtener cliente
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/:id` - Actualizar (auth)
- `DELETE /api/clientes/:id` - Eliminar (admin)

### 💰 Ventas
- `GET /api/ventas` - Listar ventas (auth)
- `GET /api/ventas/:id` - Obtener venta
- `POST /api/ventas` - Crear venta (con descuento de stock - transacción)
- `PUT /api/ventas/:id/estado` - Cambiar estado

### 📊 Dashboard
- `GET /api/dashboard/kpis` - KPIs del día
- `GET /api/dashboard/ventas-semana` - Ventas última semana
- `GET /api/dashboard/chatbot-metricas` - Estadísticas chatbot
- `GET /api/dashboard/leads` - Conversiones leads
- `GET /api/dashboard/resumen` - Resumen ejecutivo

## 🏗️ Estructura del Proyecto

```
backend/
├── src/
│   ├── config/           # Configuración (DB, OpenAI, Logger)
│   ├── middlewares/      # Auth, validación, errores
│   ├── modules/          # Módulos por feature
│   │   ├── auth/
│   │   ├── chatbot/      # ⭐ Módulo crítico
│   │   ├── productos/
│   │   ├── clientes/
│   │   ├── ventas/       # Transacciones de stock
│   │   ├── dashboard/    # KPIs y métricas
│   │   └── ...
│   ├── models/           # Modelos Sequelize (15 modelos)
│   ├── utils/            # Helpers, respuestas
│   └── app.js            # Express setup
├── server.js             # Entry point
├── package.json
├── .env.example
├── Dockerfile
└── docker-compose.yml
```

## 🔑 Características Principales

✅ **Autenticación JWT** con roles (admin, vendedor)
✅ **Chatbot IA** integrado con OpenAI (GPT-4o-mini)
✅ **Gestión de Ventas** con transacciones de stock
✅ **Dashboard** con KPIs en tiempo real
✅ **Base de datos** relacional (Sequelize + MySQL)
✅ **Validación** con Joi
✅ **Logging** con Winston
✅ **Rate Limiting** 100 req/15min general, 20 req/min chatbot
✅ **Docker** + docker-compose listo para deploy

## 📈 Métricas Capturadas

- ⏱️ Tiempo promedio respuesta chatbot
- 📊 Ventas por día/semana
- 🎯 Tasa de conversión leads
- 😊 Satisfacción promedio clientes
- 💬 Total conversaciones y mensajes
- 🔄 Tasa de cierre conversaciones

## 🛠️ Desarrollo

### Scripts

```bash
npm run dev          # Iniciar en modo desarrollo
npm start            # Iniciar en producción
npm test             # Ejecutar tests
npm run lint         # Verificar código
npm run typecheck    # TypeScript check
```

### Crear un nuevo módulo

Estructura recomendada:
```
src/modules/mi-modulo/
├── mi-modulo.routes.js      # Rutas
├── mi-modulo.controller.js   # Controllers
├── mi-modulo.service.js      # Lógica negocio
└── mi-modulo.schema.js       # Schemas Joi (opcional)
```

## 🔗 Integración con Frontend

El endpoint `POST /api/chatbot/mensaje` es **público** (sin autenticación) para que el widget del frontend funcione libremente:

```javascript
// Ejemplo desde frontend
const response = await fetch('http://localhost:3000/api/chatbot/mensaje', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mensaje: '¿Tienen camisas disponibles?',
    id_cliente: null,  // null para anónimo
    id_conversacion: null  // null para nueva conversación
  })
});

const data = await response.json();
console.log(data.data.respuesta);  // Respuesta del bot
```

## 🚨 Manejo de Errores

Todas las respuestas siguen el formato:

```json
{
  "success": true/false,
  "message": "Descripción",
  "data": {...}
}
```

Códigos HTTP:
- `200` - OK
- `201` - Creado
- `400` - Bad Request
- `401` - No autenticado
- `403` - No autorizado
- `404` - No encontrado
- `409` - Conflicto (duplicado)
- `422` - Validación fallida
- `500` - Error servidor

## 📝 Notas Importantes

1. **Stock de productos**: Al crear una venta, se decuenta automáticamente del stock (transacción ACID)
2. **Soft delete**: Clientes y Productos usan `estado = 0`, no DELETE físico
3. **Chatbot**: Inyecta contexto de productos en sistema prompt para respuestas más relevantes
4. **Rate limiting**: Chatbot tiene límite especial de 20 req/min para evitar abuso
5. **JWT**: Token expira en 8 horas, se incluye en header `Authorization: Bearer <token>`

## 📧 Contacto / Soporte

Para dudas o problemas, contactar al equipo de desarrollo.

---

**Última actualización**: Abril 2026
**Ambiente**: Desarrollo
