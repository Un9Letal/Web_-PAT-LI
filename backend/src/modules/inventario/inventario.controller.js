const InventarioService = require('./inventario.service');
const { success, error, paginate } = require('../../utils/response.helper');
const logger = require('../../config/logger');

class InventarioController {
  static async obtenerMovimientos(req, res, next) {
    try {
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 20;
      const filtros = {
        id_producto: req.query.id_producto || null,
        tipo: req.query.tipo || null,
      };
      const resultado = await InventarioService.obtenerMovimientos(pagina, limite, filtros);
      return paginate(res, resultado.movimientos, resultado.total, pagina, limite, 'Movimientos obtenidos exitosamente');
    } catch (err) {
      logger.error('Error en obtenerMovimientos:', err);
      next(err);
    }
  }

  static async crearMovimiento(req, res, next) {
    try {
      const movimiento = await InventarioService.crearMovimiento(req.body);
      return success(res, movimiento, 'Movimiento de inventario registrado exitosamente', 201);
    } catch (err) {
      logger.error('Error en crearMovimiento:', err);
      if (err.message.includes('no encontrado')) return error(res, err.message, 404);
      if (err.message.includes('Stock insuficiente')) return error(res, err.message, 400);
      next(err);
    }
  }
}

module.exports = InventarioController;
