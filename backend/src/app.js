const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./config/logger');

// Importar middlewares
const errorMiddleware = require('./middlewares/error.middleware');

// Crear aplicación
const app = express();

/**
 * MIDDLEWARES GLOBALES
 */

// Seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Logging HTTP
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim()),
  },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

/**
 * RATE LIMITING
 */

// Límite general: 100 req/15 minutos
const limiterGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes desde esta IP, intenta más tarde',
});

// Límite chatbot: 20 req/minuto
const limiterChatbot = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: 'Límite de chatbot excedido, intenta en un momento',
});

app.use(limiterGeneral);

/**
 * RUTAS
 */

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/usuarios', require('./modules/usuarios/usuario.routes'));
app.use('/api/clientes', require('./modules/clientes/cliente.routes'));
app.use('/api/clientes-potenciales', require('./modules/clientes-potenciales/potencial.routes'));
app.use('/api/categorias', require('./modules/categorias/categoria.routes'));
app.use('/api/productos', require('./modules/productos/producto.routes'));
app.use('/api/ventas', require('./modules/ventas/venta.routes'));
app.use('/api/inventario', require('./modules/inventario/inventario.routes'));
app.use('/api/consultas', require('./modules/consultas/consulta.routes'));
app.use('/api/seguimiento', require('./modules/seguimiento/seguimiento.routes'));
app.use('/api/satisfaccion', require('./modules/satisfaccion/satisfaccion.routes'));

// Chatbot con rate limit específico
app.use('/api/chatbot', limiterChatbot, require('./modules/chatbot/chatbot.routes'));

app.use('/api/dashboard', require('./modules/dashboard/dashboard.routes'));

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

/**
 * Error Handler (debe ser el último)
 */
app.use(errorMiddleware);

module.exports = app;
