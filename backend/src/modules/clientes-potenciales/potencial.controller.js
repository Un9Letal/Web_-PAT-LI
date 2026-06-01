const PotencialService = require('./potencial.service');
const { success, error, paginate } = require('../../utils/response.helper');
const logger = require('../../config/logger');

class PotencialController {
  static async obtenerTodos(req, res, next) {
    try {
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 10;
      const filtros = {
        estado: req.query.estado || null,
        nivel_interes: req.query.nivel_interes || null,
      };
      const resultado = await PotencialService.obtenerTodos(pagina, limite, filtros);
      return paginate(res, resultado.potenciales, resultado.total, pagina, limite, 'Clientes potenciales obtenidos exitosamente');
    } catch (err) {
      logger.error('Error en obtenerTodos potenciales:', err);
      next(err);
    }
  }

  static async obtenerPorId(req, res, next) {
    try {
      const potencial = await PotencialService.obtenerPorId(req.params.id);
      return success(res, potencial, 'Cliente potencial obtenido exitosamente');
    } catch (err) {
      logger.error('Error en obtenerPorId potencial:', err);
      if (err.message.includes('no encontrado')) return error(res, err.message, 404);
      next(err);
    }
  }

  static async crear(req, res, next) {
    try {
      const potencial = await PotencialService.crear(req.body);
      return success(res, potencial, 'Cliente potencial creado exitosamente', 201);
    } catch (err) {
      logger.error('Error en crear potencial:', err);
      next(err);
    }
  }

  static async actualizar(req, res, next) {
    try {
      const potencial = await PotencialService.actualizar(req.params.id, req.body);
      return success(res, potencial, 'Cliente potencial actualizado exitosamente');
    } catch (err) {
      logger.error('Error en actualizar potencial:', err);
      if (err.message.includes('no encontrado')) return error(res, err.message, 404);
      next(err);
    }
  }

  static async convertirACliente(req, res, next) {
    try {
      const resultado = await PotencialService.convertirACliente(req.params.id);
      return success(res, resultado, 'Cliente potencial convertido exitosamente', 201);
    } catch (err) {
      logger.error('Error en convertirACliente:', err);
      if (err.message.includes('no encontrado')) return error(res, err.message, 404);
      if (err.message.includes('ya fue convertido')) return error(res, err.message, 409);
      next(err);
    }
  }
}

module.exports = PotencialController;
