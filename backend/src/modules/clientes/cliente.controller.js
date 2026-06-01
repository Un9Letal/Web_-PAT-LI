const ClienteService = require('./cliente.service');
const { success, error, paginate } = require('../../utils/response.helper');
const logger = require('../../config/logger');

class ClienteController {
  /**
   * GET /api/clientes
   */
  static async obtenerTodos(req, res, next) {
    try {
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 10;

      const resultado = await ClienteService.obtenerTodos(pagina, limite);

      return paginate(
        res,
        resultado.clientes,
        resultado.total,
        pagina,
        limite,
        'Clientes obtenidos exitosamente',
        200
      );
    } catch (err) {
      logger.error('Error en obtenerTodos:', err);
      next(err);
    }
  }

  /**
   * GET /api/clientes/:id
   */
  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;

      const cliente = await ClienteService.obtenerPorId(id);

      return success(res, cliente, 'Cliente obtenido exitosamente', 200);
    } catch (err) {
      logger.error('Error en obtenerPorId:', err);
      if (err.message.includes('no encontrado')) {
        return error(res, err.message, 404);
      }
      next(err);
    }
  }

  /**
   * POST /api/clientes
   */
  static async crear(req, res, next) {
    try {
      const cliente = await ClienteService.crear(req.body);

      return success(res, cliente, 'Cliente creado exitosamente', 201);
    } catch (err) {
      logger.error('Error en crear:', err);
      if (err.message.includes('ya está registrado')) {
        return error(res, err.message, 409);
      }
      next(err);
    }
  }

  /**
   * PUT /api/clientes/:id
   */
  static async actualizar(req, res, next) {
    try {
      const { id } = req.params;

      const cliente = await ClienteService.actualizar(id, req.body);

      return success(res, cliente, 'Cliente actualizado exitosamente', 200);
    } catch (err) {
      logger.error('Error en actualizar:', err);
      next(err);
    }
  }

  /**
   * DELETE /api/clientes/:id
   */
  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;

      const resultado = await ClienteService.eliminar(id);

      return success(res, resultado, 'Cliente eliminado exitosamente', 200);
    } catch (err) {
      logger.error('Error en eliminar:', err);
      next(err);
    }
  }
}

module.exports = ClienteController;
