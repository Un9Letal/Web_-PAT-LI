const express = require('express');
const router = express.Router();
const joi = require('joi');
const SatisfaccionController = require('./satisfaccion.controller');
const validateMiddleware = require('../../middlewares/validate.middleware');

const schemaSatisfaccion = joi.object({
  id_venta: joi.number().integer().required(),
  calificacion: joi.number().integer().min(1).max(5).required(),
  comentario: joi.string().optional().allow('', null),
  factores: joi.object().optional().allow(null),
});

router.post('/', validateMiddleware(schemaSatisfaccion), SatisfaccionController.crear);
router.get('/venta/:id', SatisfaccionController.obtenerPorVenta);

module.exports = router;
