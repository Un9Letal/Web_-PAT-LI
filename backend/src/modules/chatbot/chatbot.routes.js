const express = require('express');
const router = express.Router();
const ChatbotController = require('./chatbot.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const joi = require('joi');

/**
 * Schema de validación para mensaje
 */
const schemaMensaje = joi.object({
  mensaje: joi.string().min(1).max(1000).required(),
  id_cliente: joi.number().integer().optional().allow(null),
  id_conversacion: joi.number().integer().optional().allow(null),
});

/**
 * RUTAS
 */

// POST /api/chatbot/mensaje (SIN autenticación - para widget público)
router.post(
  '/mensaje',
  validateMiddleware(schemaMensaje),
  ChatbotController.enviarMensaje
);

// GET /api/chatbot/conversacion/:id (SIN autenticación - historial público)
router.get('/conversacion/:id', ChatbotController.obtenerHistorial);

// GET /api/chatbot/conversaciones (CON autenticación - solo vendedores+)
router.get(
  '/conversaciones',
  authMiddleware,
  roleMiddleware('vendedor', 'admin'),
  ChatbotController.listarConversaciones
);

// POST /api/chatbot/conversacion/:id/cerrar (CON autenticación)
router.post(
  '/conversacion/:id/cerrar',
  authMiddleware,
  roleMiddleware('vendedor', 'admin'),
  ChatbotController.cerrarConversacion
);

// GET /api/chatbot/metricas (CON autenticación - solo admin)
router.get(
  '/metricas',
  authMiddleware,
  roleMiddleware('admin'),
  ChatbotController.obtenerMetricas
);

module.exports = router;
