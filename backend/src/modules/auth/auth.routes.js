const express = require('express');
const router = express.Router();
const AuthController = require('./auth.controller');
const validateMiddleware = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const joi = require('joi');

/**
 * Schemas de validación
 */
const schemaLogin = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
});

const schemaRegister = joi.object({
  nombre: joi.string().min(3).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  telefono: joi.string().optional(),
  id_rol: joi.number().integer().optional(),
});

/**
 * RUTAS
 */

// POST /api/auth/login
router.post('/login', validateMiddleware(schemaLogin), AuthController.login);

// POST /api/auth/register (solo admin)
router.post(
  '/register',
  authMiddleware,
  roleMiddleware('admin'),
  validateMiddleware(schemaRegister),
  AuthController.register
);

module.exports = router;
