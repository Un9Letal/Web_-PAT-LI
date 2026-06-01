const VentaService = require('./venta.service');
const { success, error, paginate } = require('../../utils/response.helper');
const logger = require('../../config/logger');

class VentaController {
  /**
   * GET /api/ventas
   */
  static async obtenerTodas(req, res, next) {
    try {
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 10;

      const resultado = await VentaService.obtenerTodas(pagina, limite);

      return paginate(
        res,
        resultado.ventas,
        resultado.total,
        pagina,
        limite,
        'Ventas obtenidas exitosamente',
        200
      );
    } catch (err) {
      logger.error('Error en obtenerTodas:', err);
      next(err);
    }
  }

  /**
   * GET /api/ventas/:id
   */
  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;

      const venta = await VentaService.obtenerPorId(id);

      return success(res, venta, 'Venta obtenida exitosamente', 200);
    } catch (err) {
      logger.error('Error en obtenerPorId:', err);
      if (err.message.includes('no encontrada')) {
        return error(res, err.message, 404);
      }
      next(err);
    }
  }

  /**
   * POST /api/ventas
   */
  static async crear(req, res, next) {
    try {
      const resultado = await VentaService.crear(req.body);

      return success(res, resultado, 'Venta creada exitosamente', 201);
    } catch (err) {
      logger.error('Error en crear:', err);
      if (err.message.includes('Stock insuficiente') || err.message.includes('no encontrado')) {
        return error(res, err.message, 400);
      }
      next(err);
    }
  }

  /**
   * PUT /api/ventas/:id/estado
   */
  static async cambiarEstado(req, res, next) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!['pendiente', 'pagada', 'cancelada'].includes(estado)) {
        return error(res, 'Estado inválido', 400);
      }

      const venta = await VentaService.cambiarEstado(id, estado);

      return success(res, venta, 'Estado actualizado exitosamente', 200);
    } catch (err) {
      logger.error('Error en cambiarEstado:', err);
      next(err);
    }
  }

  /**
   * GET /api/ventas/dia/hoy
   */
  static async ventasDelDia(req, res, next) {
    try {
      const resultado = await VentaService.ventasDelDia();

      return success(res, resultado, 'Ventas del día obtenidas', 200);
    } catch (err) {
      logger.error('Error en ventasDelDia:', err);
      next(err);
    }
  }
}

module.exports = VentaController;
