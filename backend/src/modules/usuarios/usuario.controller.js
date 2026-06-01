const UsuarioService = require('./usuario.service');
const { success, error, paginate } = require('../../utils/response.helper');
const logger = require('../../config/logger');

class UsuarioController {
  static async obtenerTodos(req, res, next) {
    try {
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 10;
      const resultado = await UsuarioService.obtenerTodos(pagina, limite);
      return paginate(res, resultado.usuarios, resultado.total, pagina, limite, 'Usuarios obtenidos exitosamente');
    } catch (err) {
      logger.error('Error en obtenerTodos usuarios:', err);
      next(err);
    }
  }

  static async obtenerPorId(req, res, next) {
    try {
      const usuario = await UsuarioService.obtenerPorId(req.params.id);
      return success(res, usuario, 'Usuario obtenido exitosamente');
    } catch (err) {
      logger.error('Error en obtenerPorId usuario:', err);
      if (err.message.includes('no encontrado')) return error(res, err.message, 404);
      next(err);
    }
  }

  static async crear(req, res, next) {
    try {
      const usuario = await UsuarioService.crear(req.body);
      return success(res, usuario, 'Usuario creado exitosamente', 201);
    } catch (err) {
      logger.error('Error en crear usuario:', err);
      if (err.message.includes('ya está registrado')) return error(res, err.message, 409);
      next(err);
    }
  }

  static async actualizar(req, res, next) {
    try {
      const usuario = await UsuarioService.actualizar(req.params.id, req.body);
      return success(res, usuario, 'Usuario actualizado exitosamente');
    } catch (err) {
      logger.error('Error en actualizar usuario:', err);
      if (err.message.includes('no encontrado')) return error(res, err.message, 404);
      next(err);
    }
  }

  static async eliminar(req, res, next) {
    try {
      const resultado = await UsuarioService.eliminar(req.params.id);
      return success(res, resultado, 'Usuario eliminado exitosamente');
    } catch (err) {
      logger.error('Error en eliminar usuario:', err);
      if (err.message.includes('no encontrado')) return error(res, err.message, 404);
      next(err);
    }
  }
}

module.exports = UsuarioController;
