const express = require('express');
const router = express.Router();
const joi = require('joi');
const CategoriaController = require('./categoria.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');

const schemaCategoria = joi.object({
  nombre: joi.string().min(2).max(100).required(),
  descripcion: joi.string().optional().allow('', null),
});

const schemaActualizar = joi.object({
  nombre: joi.string().min(2).max(100).optional(),
  descripcion: joi.string().optional().allow('', null),
});

router.get('/', CategoriaController.obtenerTodos);
router.get('/:id', CategoriaController.obtenerPorId);
router.post('/', authMiddleware, roleMiddleware('admin'), validateMiddleware(schemaCategoria), CategoriaController.crear);
router.put('/:id', authMiddleware, roleMiddleware('admin'), validateMiddleware(schemaActualizar), CategoriaController.actualizar);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), CategoriaController.eliminar);

module.exports = router;
