const express = require('express');
const router = express.Router();
const ClienteController = require('./cliente.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const joi = require('joi');

/**
 * Schemas
 */
const schemaCliente = joi.object({
  nombre: joi.string().min(2).required(),
  apellido: joi.string().optional(),
  email: joi.string().email().optional(),
  telefono: joi.string().optional(),
  whatsapp: joi.string().optional(),
  direccion: joi.string().optional(),
  ciudad: joi.string().optional(),
  tipo_cliente: joi.string().valid('minorista', 'mayorista', 'corporativo').default('minorista'),
});

/**
 * RUTAS
 */

// GET /api/clientes
router.get('/', ClienteController.obtenerTodos);

// GET /api/clientes/:id
router.get('/:id', ClienteController.obtenerPorId);

// POST /api/clientes
router.post('/', validateMiddleware(schemaCliente), ClienteController.crear);

// PUT /api/clientes/:id
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('vendedor', 'admin'),
  validateMiddleware(schemaCliente),
  ClienteController.actualizar
);

// DELETE /api/clientes/:id (soft delete)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), ClienteController.eliminar);

module.exports = router;
