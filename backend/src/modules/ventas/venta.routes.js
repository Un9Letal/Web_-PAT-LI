const express = require('express');
const router = express.Router();
const VentaController = require('./venta.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const joi = require('joi');

/**
 * Schemas
 */
const schemaDetalle = joi.object({
  id_producto: joi.number().integer().required(),
  cantidad: joi.number().integer().positive().required(),
  precio_unitario: joi.number().positive().required(),
});

const schemaVenta = joi.object({
  id_cliente: joi.number().integer().required(),
  id_usuario: joi.number().integer().optional(),
  metodo_pago: joi.string().valid('efectivo', 'tarjeta', 'transferencia', 'cheque').required(),
  descuento: joi.number().default(0),
  impuesto: joi.number().default(0),
  detalles: joi.array().items(schemaDetalle).min(1).required(),
});

const schemaCambioEstado = joi.object({
  estado: joi.string().valid('pendiente', 'pagada', 'cancelada').required(),
});

/**
 * RUTAS
 */

// GET /api/ventas
router.get('/', authMiddleware, VentaController.obtenerTodas);

// GET /api/ventas/dia/hoy (KPI)
router.get('/dia/hoy', authMiddleware, VentaController.ventasDelDia);

// GET /api/ventas/:id
router.get('/:id', authMiddleware, VentaController.obtenerPorId);

// POST /api/ventas (crear venta - con transacción)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('vendedor', 'admin'),
  validateMiddleware(schemaVenta),
  VentaController.crear
);

// PUT /api/ventas/:id/estado
router.put(
  '/:id/estado',
  authMiddleware,
  roleMiddleware('vendedor', 'admin'),
  validateMiddleware(schemaCambioEstado),
  VentaController.cambiarEstado
);

module.exports = router;
