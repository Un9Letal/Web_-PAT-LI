const SeguimientoService = require('./seguimiento.service');
const { success, error, paginate } = require('../../utils/response.helper');
const logger = require('../../config/logger');

class SeguimientoController {
  static async obtenerPorCliente(req, res, next) {
    try {
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 20;
      const resultado = await SeguimientoService.obtenerPorCliente(req.params.id, pagina, limite);
      return paginate(res, resultado.seguimientos, resultado.total, pagina, limite, 'Seguimientos obtenidos exitosamente');
    } catch (err) {
      logger.error('Error en obtenerPorCliente seguimiento:', err);
      next(err);
    }
  }

  static async crear(req, res, next) {
    try {
      const seguimiento = await SeguimientoService.crear(req.body);
      return success(res, seguimiento, 'Seguimiento registrado exitosamente', 201);
    } catch (err) {
      logger.error('Error en crear seguimiento:', err);
      if (err.message.includes('no encontrado')) return error(res, err.message, 404);
      next(err);
    }
  }
}

module.exports = SeguimientoController;
