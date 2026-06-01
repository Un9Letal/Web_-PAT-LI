const CategoriaService = require('./categoria.service');
const { success, error } = require('../../utils/response.helper');
const logger = require('../../config/logger');

class CategoriaController {
  static async obtenerTodos(req, res, next) {
    try {
      const categorias = await CategoriaService.obtenerTodos();
      return success(res, categorias, 'Categorías obtenidas exitosamente');
    } catch (err) {
      logger.error('Error en obtenerTodos categorias:', err);
      next(err);
    }
  }

  static async obtenerPorId(req, res, next) {
    try {
      const categoria = await CategoriaService.obtenerPorId(req.params.id);
      return success(res, categoria, 'Categoría obtenida exitosamente');
    } catch (err) {
      logger.error('Error en obtenerPorId categoria:', err);
      if (err.message.includes('no encontrada')) return error(res, err.message, 404);
      next(err);
    }
  }

  static async crear(req, res, next) {
    try {
      const categoria = await CategoriaService.crear(req.body);
      return success(res, categoria, 'Categoría creada exitosamente', 201);
    } catch (err) {
      logger.error('Error en crear categoria:', err);
      if (err.message.includes('Ya existe')) return error(res, err.message, 409);
      next(err);
    }
  }

  static async actualizar(req, res, next) {
    try {
      const categoria = await CategoriaService.actualizar(req.params.id, req.body);
      return success(res, categoria, 'Categoría actualizada exitosamente');
    } catch (err) {
      logger.error('Error en actualizar categoria:', err);
      if (err.message.includes('no encontrada')) return error(res, err.message, 404);
      next(err);
    }
  }

  static async eliminar(req, res, next) {
    try {
      const resultado = await CategoriaService.eliminar(req.params.id);
      return success(res, resultado, 'Categoría eliminada exitosamente');
    } catch (err) {
      logger.error('Error en eliminar categoria:', err);
      if (err.message.includes('no encontrada')) return error(res, err.message, 404);
      next(err);
    }
  }
}

module.exports = CategoriaController;
