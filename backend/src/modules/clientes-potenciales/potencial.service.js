const { ClientePotencial, Cliente, Usuario } = require('../../models');
const logger = require('../../config/logger');

class PotencialService {
  static async obtenerTodos(pagina = 1, limite = 10, filtros = {}) {
    try {
      const offset = (pagina - 1) * limite;
      const where = {};
      if (filtros.estado) where.estado = filtros.estado;
      if (filtros.nivel_interes) where.nivel_interes = filtros.nivel_interes;

      const { rows, count } = await ClientePotencial.findAndCountAll({
        where,
        include: [{ association: 'usuario_asignado', attributes: ['id', 'nombre', 'email'] }],
        limit: limite,
        offset,
        order: [['createdAt', 'DESC']],
      });
      return { potenciales: rows, total: count, pagina, limite };
    } catch (error) {
      logger.error('Error en obtenerTodos potenciales:', error);
      throw error;
    }
  }

  static async obtenerPorId(id) {
    try {
      const potencial = await ClientePotencial.findByPk(id, {
        include: [{ association: 'usuario_asignado', attributes: ['id', 'nombre', 'email'] }],
      });
      if (!potencial) throw new Error('Cliente potencial no encontrado');
      return potencial;
    } catch (error) {
      logger.error('Error en obtenerPorId potencial:', error);
      throw error;
    }
  }

  static async crear(datos) {
    try {
      const potencial = await ClientePotencial.create(datos);
      return potencial;
    } catch (error) {
      logger.error('Error en crear potencial:', error);
      throw error;
    }
  }

  static async actualizar(id, datos) {
    try {
      const potencial = await ClientePotencial.findByPk(id);
      if (!potencial) throw new Error('Cliente potencial no encontrado');
      await potencial.update(datos);
      return potencial;
    } catch (error) {
      logger.error('Error en actualizar potencial:', error);
      throw error;
    }
  }

  static async convertirACliente(id) {
    try {
      const potencial = await ClientePotencial.findByPk(id);
      if (!potencial) throw new Error('Cliente potencial no encontrado');
      if (potencial.estado === 'convertido') throw new Error('El cliente potencial ya fue convertido');

      const cliente = await Cliente.create({
        nombre: potencial.nombre,
        email: potencial.email || null,
        telefono: potencial.telefono || null,
        tipo_cliente: 'minorista',
        estado: 1,
      });

      await potencial.update({ estado: 'convertido' });

      return { cliente, potencial };
    } catch (error) {
      logger.error('Error en convertirACliente:', error);
      throw error;
    }
  }
}

module.exports = PotencialService;
