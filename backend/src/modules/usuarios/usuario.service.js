const { Usuario, Rol } = require('../../models');
const logger = require('../../config/logger');

class UsuarioService {
  static async obtenerTodos(pagina = 1, limite = 10) {
    try {
      const offset = (pagina - 1) * limite;
      const { rows, count } = await Usuario.findAndCountAll({
        where: { estado: 1 },
        include: [{ association: 'rol', attributes: ['id', 'nombre'] }],
        attributes: { exclude: ['password'] },
        limit: limite,
        offset,
        order: [['createdAt', 'DESC']],
      });
      return { usuarios: rows, total: count, pagina, limite };
    } catch (error) {
      logger.error('Error en obtenerTodos usuarios:', error);
      throw error;
    }
  }

  static async obtenerPorId(id) {
    try {
      const usuario = await Usuario.findByPk(id, {
        include: [{ association: 'rol', attributes: ['id', 'nombre'] }],
        attributes: { exclude: ['password'] },
      });
      if (!usuario || usuario.estado === 0) {
        throw new Error('Usuario no encontrado');
      }
      return usuario;
    } catch (error) {
      logger.error('Error en obtenerPorId usuario:', error);
      throw error;
    }
  }

  static async crear(datos) {
    try {
      const existente = await Usuario.findOne({ where: { email: datos.email } });
      if (existente) {
        throw new Error('El email ya está registrado');
      }
      const usuario = await Usuario.create(datos);
      const resultado = usuario.toJSON();
      return resultado;
    } catch (error) {
      logger.error('Error en crear usuario:', error);
      throw error;
    }
  }

  static async actualizar(id, datos) {
    try {
      const usuario = await Usuario.findByPk(id);
      if (!usuario || usuario.estado === 0) {
        throw new Error('Usuario no encontrado');
      }
      // No permitir cambiar password por esta ruta
      delete datos.password;
      await usuario.update(datos);
      return usuario.toJSON();
    } catch (error) {
      logger.error('Error en actualizar usuario:', error);
      throw error;
    }
  }

  static async eliminar(id) {
    try {
      const usuario = await Usuario.findByPk(id);
      if (!usuario || usuario.estado === 0) {
        throw new Error('Usuario no encontrado');
      }
      await usuario.update({ estado: 0 });
      return { mensaje: 'Usuario eliminado correctamente' };
    } catch (error) {
      logger.error('Error en eliminar usuario:', error);
      throw error;
    }
  }
}

module.exports = UsuarioService;
