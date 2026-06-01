const { Producto, Categoria } = require('../../models');
const logger = require('../../config/logger');

class ProductoService {
  /**
   * Obtener todos los productos (con caché para chatbot)
   */
  static async obtenerTodos(pagina = 1, limite = 10, id_categoria = null) {
    try {
      const offset = (pagina - 1) * limite;
      const where = { estado: 1 };

      if (id_categoria) {
        where.id_categoria = id_categoria;
      }

      const { rows, count } = await Producto.findAndCountAll({
        where,
        include: { association: 'categoria', attributes: ['nombre'] },
        limit: limite,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return {
        productos: rows,
        total: count,
        pagina,
        limite,
      };
    } catch (error) {
      logger.error('Error en obtenerTodos productos:', error);
      throw error;
    }
  }

  /**
   * Obtener producto por ID
   */
  static async obtenerPorId(id) {
    try {
      const producto = await Producto.findByPk(id, {
        include: { association: 'categoria', attributes: ['nombre'] },
      });

      if (!producto || producto.estado === 0) {
        throw new Error('Producto no encontrado');
      }

      return producto;
    } catch (error) {
      logger.error('Error en obtenerPorId:', error);
      throw error;
    }
  }

  /**
   * Crear producto
   */
  static async crear(datosProducto) {
    try {
      const { nombre, sku, precio_compra, precio_venta, stock, id_categoria } =
        datosProducto;

      // Verificar SKU único
      const productoExistente = await Producto.findOne({ where: { sku } });
      if (productoExistente) {
        throw new Error('El SKU ya existe');
      }

      const producto = await Producto.create({
        nombre,
        sku,
        precio_compra,
        precio_venta,
        stock,
        id_categoria,
        ...datosProducto,
      });

      return producto;
    } catch (error) {
      logger.error('Error en crear producto:', error);
      throw error;
    }
  }

  /**
   * Actualizar producto
   */
  static async actualizar(id, datosProducto) {
    try {
      const producto = await Producto.findByPk(id);

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      await producto.update(datosProducto);

      return producto;
    } catch (error) {
      logger.error('Error en actualizar producto:', error);
      throw error;
    }
  }

  /**
   * Eliminar (soft delete)
   */
  static async eliminar(id) {
    try {
      const producto = await Producto.findByPk(id);

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      await producto.update({ estado: 0 });

      return { message: 'Producto eliminado' };
    } catch (error) {
      logger.error('Error en eliminar producto:', error);
      throw error;
    }
  }
}

module.exports = ProductoService;
