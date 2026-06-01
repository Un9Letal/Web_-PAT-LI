const express = require('express');
const router = express.Router();
const joi = require('joi');
const UsuarioController = require('./usuario.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');

const schemaUsuario = joi.object({
  nombre: joi.string().min(2).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).when('$isCreating', { is: true, then: joi.required(), otherwise: joi.optional() }),
  telefono: joi.string().optional().allow('', null),
  id_rol: joi.number().integer().required(),
});

const schemaActualizar = joi.object({
  nombre: joi.string().min(2).optional(),
  email: joi.string().email().optional(),
  telefono: joi.string().optional().allow('', null),
  id_rol: joi.number().integer().optional(),
});

router.get('/', authMiddleware, roleMiddleware('admin'), UsuarioController.obtenerTodos);
router.get('/:id', authMiddleware, roleMiddleware('admin'), UsuarioController.obtenerPorId);
router.post('/', authMiddleware, roleMiddleware('admin'), validateMiddleware(schemaUsuario), UsuarioController.crear);
router.put('/:id', authMiddleware, roleMiddleware('admin'), validateMiddleware(schemaActualizar), UsuarioController.actualizar);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), UsuarioController.eliminar);

module.exports = router;
