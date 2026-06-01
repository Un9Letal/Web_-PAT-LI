const express = require('express');
const router = express.Router();
const joi = require('joi');
const ConsultaController = require('./consulta.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');

const schemaConsulta = joi.object({
  id_cliente: joi.number().integer().required(),
  tipo: joi.string().valid('producto', 'precio', 'disponibilidad', 'garantia', 'devolucion', 'otro').required(),
  canal: joi.string().valid('chatbot', 'whatsapp', 'email', 'telefono', 'presencial').required(),
  descripcion: joi.string().min(5).required(),
  id_usuario_asignado: joi.number().integer().optional().allow(null),
});

const schemaEstado = joi.object({
  estado: joi.string().valid('abierta', 'en_proceso', 'resuelta', 'cerrada').required(),
  id_usuario_asignado: joi.number().integer().optional().allow(null),
});

router.get('/', authMiddleware, roleMiddleware('vendedor', 'admin'), ConsultaController.obtenerTodos);
router.get('/:id', authMiddleware, roleMiddleware('vendedor', 'admin'), ConsultaController.obtenerPorId);
router.post('/', validateMiddleware(schemaConsulta), ConsultaController.crear);
router.put('/:id/estado', authMiddleware, roleMiddleware('vendedor', 'admin'), validateMiddleware(schemaEstado), ConsultaController.cambiarEstado);

module.exports = router;
