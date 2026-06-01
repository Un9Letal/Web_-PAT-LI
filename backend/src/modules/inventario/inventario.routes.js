const express = require('express');
const router = express.Router();
const joi = require('joi');
const InventarioController = require('./inventario.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');

const schemaMovimiento = joi.object({
  id_producto: joi.number().integer().required(),
  tipo: joi.string().valid('entrada', 'salida', 'ajuste', 'devolucion').required(),
  cantidad: joi.number().integer().min(1).required(),
  motivo: joi.string().optional().allow('', null),
  referencia: joi.string().optional().allow('', null),
  id_usuario: joi.number().integer().optional().allow(null),
});

router.get('/movimientos', authMiddleware, roleMiddleware('vendedor', 'admin'), InventarioController.obtenerMovimientos);
router.post('/movimientos', authMiddleware, roleMiddleware('admin'), validateMiddleware(schemaMovimiento), InventarioController.crearMovimiento);

module.exports = router;
