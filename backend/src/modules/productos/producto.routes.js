const express = require('express');
const router = express.Router();
const ProductoController = require('./producto.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const joi = require('joi');

/**
 * Schemas
 */
const schemaProducto = joi.object({
  nombre: joi.string().min(3).required(),
  descripcion: joi.string().optional(),
  sku: joi.string().required(),
  precio_compra: joi.number().positive().required(),
  precio_venta: joi.number().positive().required(),
  stock: joi.number().integer().default(0),
  stock_minimo: joi.number().integer().default(5),
  id_categoria: joi.number().integer().required(),
  imagen_url: joi.string().optional(),
});

/**
 * RUTAS
 */

// GET /api/productos (PÚBLICO)
router.get('/', ProductoController.obtenerTodos);

// GET /api/productos/:id (PÚBLICO)
router.get('/:id', ProductoController.obtenerPorId);

// POST /api/productos (ADMIN)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  validateMiddleware(schemaProducto),
  ProductoController.crear
);

// PUT /api/productos/:id (ADMIN)
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  validateMiddleware(schemaProducto),
  ProductoController.actualizar
);

// DELETE /api/productos/:id (ADMIN)
router.delete('/:id', authMiddleware, roleMiddleware('admin'), ProductoController.eliminar);

module.exports = router;
