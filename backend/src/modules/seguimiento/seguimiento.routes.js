const express = require('express');
const router = express.Router();
const joi = require('joi');
const SeguimientoController = require('./seguimiento.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');

const schemaSeguimiento = joi.object({
  id_cliente: joi.number().integer().required(),
  id_usuario: joi.number().integer().optional().allow(null),
  tipo: joi.string().valid('llamada', 'email', 'mensaje', 'visita', 'nota').required(),
  descripcion: joi.string().min(5).required(),
  proxima_fecha_contacto: joi.date().optional().allow(null),
  resultado: joi.string().valid('positivo', 'negativo', 'pendiente').optional().allow(null),
});

router.get('/cliente/:id', authMiddleware, roleMiddleware('vendedor', 'admin'), SeguimientoController.obtenerPorCliente);
router.post('/', authMiddleware, roleMiddleware('vendedor', 'admin'), validateMiddleware(schemaSeguimiento), SeguimientoController.crear);

module.exports = router;
