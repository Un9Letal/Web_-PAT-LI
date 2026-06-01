const SatisfaccionService = require('./satisfaccion.service');
const { success, error } = require('../../utils/response.helper');
const logger = require('../../config/logger');

class SatisfaccionController {
  static async crear(req, res, next) {
    try {
      const satisfaccion = await SatisfaccionService.crear(req.body);
      return success(res, satisfaccion, 'Calificación registrada exitosamente', 201);
    } catch (err) {
      logger.error('Error en crear satisfaccion:', err);
      if (err.message.includes('no encontrada')) return error(res, err.message, 404);
      if (err.message.includes('Ya existe')) return error(res, err.message, 409);
      if (err.message.includes('calificación debe')) return error(res, err.message, 400);
      next(err);
    }
  }

  static async obtenerPorVenta(req, res, next) {
    try {
      const satisfaccion = await SatisfaccionService.obtenerPorVenta(req.params.id);
      return success(res, satisfaccion, 'Calificación obtenida exitosamente');
    } catch (err) {
      logger.error('Error en obtenerPorVenta satisfaccion:', err);
      if (err.message.includes('No se encontró')) return error(res, err.message, 404);
      next(err);
    }
  }
}

module.exports = SatisfaccionController;
