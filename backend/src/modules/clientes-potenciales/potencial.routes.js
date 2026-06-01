const express = require('express');
const router = express.Router();
const joi = require('joi');
const PotencialController = require('./potencial.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');

const schemaPotencial = joi.object({
  nombre: joi.string().min(2).required(),
  email: joi.string().email().optional().allow('', null),
  telefono: joi.string().optional().allow('', null),
  empresa: joi.string().optional().allow('', null),
  nivel_interes: joi.string().valid('frio', 'tibio', 'caliente').default('frio'),
  estado: joi.string().valid('prospecto', 'contactado', 'en_negociacion', 'convertido', 'perdido').optional(),
  fuente: joi.string().optional().allow('', null),
  observaciones: joi.string().optional().allow('', null),
  id_usuario_asignado: joi.number().integer().optional().allow(null),
});

const schemaActualizar = joi.object({
  nombre: joi.string().min(2).optional(),
  email: joi.string().email().optional().allow('', null),
  telefono: joi.string().optional().allow('', null),
  empresa: joi.string().optional().allow('', null),
  nivel_interes: joi.string().valid('frio', 'tibio', 'caliente').optional(),
  estado: joi.string().valid('prospecto', 'contactado', 'en_negociacion', 'convertido', 'perdido').optional(),
  fuente: joi.string().optional().allow('', null),
  observaciones: joi.string().optional().allow('', null),
  id_usuario_asignado: joi.number().integer().optional().allow(null),
});

router.get('/', authMiddleware, roleMiddleware('vendedor', 'admin'), PotencialController.obtenerTodos);
router.get('/:id', authMiddleware, roleMiddleware('vendedor', 'admin'), PotencialController.obtenerPorId);
router.post('/', authMiddleware, roleMiddleware('vendedor', 'admin'), validateMiddleware(schemaPotencial), PotencialController.crear);
router.put('/:id', authMiddleware, roleMiddleware('vendedor', 'admin'), validateMiddleware(schemaActualizar), PotencialController.actualizar);
router.post('/:id/convertir', authMiddleware, roleMiddleware('vendedor', 'admin'), PotencialController.convertirACliente);

module.exports = router;
