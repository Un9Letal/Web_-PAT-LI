const ProductoService = require('./producto.service');
const { success, error, paginate } = require('../../utils/response.helper');
const logger = require('../../config/logger');

class ProductoController {
  /**
   * GET /api/productos
   */
  static async obtenerTodos(req, res, next) {
    try {
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 10;
      const id_categoria = req.query.id_categoria;

      const resultado = await ProductoService.obtenerTodos(pagina, limite, id_categoria);

      return paginate(
        res,
        resultado.productos,
        resultado.total,
        pagina,
        limite,
        'Productos obtenidos exitosamente',
        200
      );
    } catch (err) {
      logger.error('Error en obtenerTodos:', err);
      next(err);
    }
  }

  /**
   * GET /api/productos/:id
   */
  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;

      const producto = await ProductoService.obtenerPorId(id);

      return success(res, producto, 'Producto obtenido exitosamente', 200);
    } catch (err) {
      logger.error('Error en obtenerPorId:', err);
      if (err.message.includes('no encontrado')) {
        return error(res, err.message, 404);
      }
      next(err);
    }
  }

  /**
   * POST /api/productos
   */
  static async crear(req, res, next) {
    try {
      const producto = await ProductoService.crear(req.body);

      return success(res, producto, 'Producto creado exitosamente', 201);
    } catch (err) {
      logger.error('Error en crear:', err);
      if (err.message.includes('ya existe')) {
        return error(res, err.message, 409);
      }
      next(err);
    }
  }

  /**
   * PUT /api/productos/:id
   */
  static async actualizar(req, res, next) {
    try {
      const { id } = req.params;

      const producto = await ProductoService.actualizar(id, req.body);

      return success(res, producto, 'Producto actualizado exitosamente', 200);
    } catch (err) {
      logger.error('Error en actualizar:', err);
      next(err);
    }
  }

  /**
   * DELETE /api/productos/:id
   */
  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;

      const resultado = await ProductoService.eliminar(id);

      return success(res, resultado, 'Producto eliminado exitosamente', 200);
    } catch (err) {
      logger.error('Error en eliminar:', err);
      next(err);
    }
  }
}

module.exports = ProductoController;
