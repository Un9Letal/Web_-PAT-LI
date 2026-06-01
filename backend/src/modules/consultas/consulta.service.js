const { Consulta, Cliente, Usuario } = require('../../models');
const logger = require('../../config/logger');

class ConsultaService {
  static async obtenerTodos(pagina = 1, limite = 10, filtros = {}) {
    try {
      const offset = (pagina - 1) * limite;
      const where = {};
      if (filtros.estado) where.estado = filtros.estado;
      if (filtros.tipo) where.tipo = filtros.tipo;
      if (filtros.canal) where.canal = filtros.canal;

      const { rows, count } = await Consulta.findAndCountAll({
        where,
        include: [
          { association: 'cliente', attributes: ['id', 'nombre', 'apellido', 'email'] },
          { association: 'usuario_asignado', attributes: ['id', 'nombre'] },
        ],
        limit: limite,
        offset,
        order: [['createdAt', 'DESC']],
      });
      return { consultas: rows, total: count, pagina, limite };
    } catch (error) {
      logger.error('Error en obtenerTodos consultas:', error);
      throw error;
    }
  }

  static async obtenerPorId(id) {
    try {
      const consulta = await Consulta.findByPk(id, {
        include: [
          { association: 'cliente', attributes: ['id', 'nombre', 'apellido', 'email', 'telefono'] },
          { association: 'usuario_asignado', attributes: ['id', 'nombre'] },
        ],
      });
      if (!consulta) throw new Error('Consulta no encontrada');
      return consulta;
    } catch (error) {
      logger.error('Error en obtenerPorId consulta:', error);
      throw error;
    }
  }

  static async crear(datos) {
    try {
      const consulta = await Consulta.create(datos);
      return consulta;
    } catch (error) {
      logger.error('Error en crear consulta:', error);
      throw error;
    }
  }

  static async cambiarEstado(id, estado, id_usuario_asignado = null) {
    try {
      const consulta = await Consulta.findByPk(id);
      if (!consulta) throw new Error('Consulta no encontrada');

      const actualizacion = { estado };
      if (id_usuario_asignado) actualizacion.id_usuario_asignado = id_usuario_asignado;
      if (estado === 'resuelta' || estado === 'cerrada') {
        actualizacion.fecha_resolucion = new Date();
      }

      await consulta.update(actualizacion);
      return consulta;
    } catch (error) {
      logger.error('Error en cambiarEstado consulta:', error);
      throw error;
    }
  }
}

module.exports = ConsultaService;
