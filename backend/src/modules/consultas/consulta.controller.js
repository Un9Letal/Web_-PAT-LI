const ConsultaService = require('./consulta.service');
const { success, error, paginate } = require('../../utils/response.helper');
const logger = require('../../config/logger');

class ConsultaController {
  static async obtenerTodos(req, res, next) {
    try {
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 10;
      const filtros = {
        estado: req.query.estado || null,
        tipo: req.query.tipo || null,
        canal: req.query.canal || null,
      };
      const resultado = await ConsultaService.obtenerTodos(pagina, limite, filtros);
      return paginate(res, resultado.consultas, resultado.total, pagina, limite, 'Consultas obtenidas exitosamente');
    } catch (err) {
      logger.error('Error en obtenerTodos consultas:', err);
      next(err);
    }
  }

  static async obtenerPorId(req, res, next) {
    try {
      const consulta = await ConsultaService.obtenerPorId(req.params.id);
      return success(res, consulta, 'Consulta obtenida exitosamente');
    } catch (err) {
      logger.error('Error en obtenerPorId consulta:', err);
      if (err.message.includes('no encontrada')) return error(res, err.message, 404);
      next(err);
    }
  }

  static async crear(req, res, next) {
    try {
      const consulta = await ConsultaService.crear(req.body);
      return success(res, consulta, 'Consulta creada exitosamente', 201);
    } catch (err) {
      logger.error('Error en crear consulta:', err);
      next(err);
    }
  }

  static async cambiarEstado(req, res, next) {
    try {
      const { estado, id_usuario_asignado } = req.body;
      const consulta = await ConsultaService.cambiarEstado(req.params.id, estado, id_usuario_asignado);
      return success(res, consulta, 'Estado de consulta actualizado exitosamente');
    } catch (err) {
      logger.error('Error en cambiarEstado consulta:', err);
      if (err.message.includes('no encontrada')) return error(res, err.message, 404);
      next(err);
    }
  }
}

module.exports = ConsultaController;
