const { Categoria } = require('../../models');
const logger = require('../../config/logger');

class CategoriaService {
  static async obtenerTodos() {
    try {
      const categorias = await Categoria.findAll({
        where: { estado: 1 },
        order: [['nombre', 'ASC']],
      });
      return categorias;
    } catch (error) {
      logger.error('Error en obtenerTodos categorias:', error);
      throw error;
    }
  }

  static async obtenerPorId(id) {
    try {
      const categoria = await Categoria.findByPk(id);
      if (!categoria || categoria.estado === 0) {
        throw new Error('Categoría no encontrada');
      }
      return categoria;
    } catch (error) {
      logger.error('Error en obtenerPorId categoria:', error);
      throw error;
    }
  }

  static async crear(datos) {
    try {
      const existente = await Categoria.findOne({ where: { nombre: datos.nombre } });
      if (existente) {
        throw new Error('Ya existe una categoría con ese nombre');
      }
      const categoria = await Categoria.create(datos);
      return categoria;
    } catch (error) {
      logger.error('Error en crear categoria:', error);
      throw error;
    }
  }

  static async actualizar(id, datos) {
    try {
      const categoria = await Categoria.findByPk(id);
      if (!categoria || categoria.estado === 0) {
        throw new Error('Categoría no encontrada');
      }
      await categoria.update(datos);
      return categoria;
    } catch (error) {
      logger.error('Error en actualizar categoria:', error);
      throw error;
    }
  }

  static async eliminar(id) {
    try {
      const categoria = await Categoria.findByPk(id);
      if (!categoria || categoria.estado === 0) {
        throw new Error('Categoría no encontrada');
      }
      await categoria.update({ estado: 0 });
      return { mensaje: 'Categoría eliminada correctamente' };
    } catch (error) {
      logger.error('Error en eliminar categoria:', error);
      throw error;
    }
  }
}

module.exports = CategoriaService;
