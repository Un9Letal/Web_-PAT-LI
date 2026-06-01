const { SeguimientoCliente, Cliente, Usuario } = require('../../models');
const logger = require('../../config/logger');

class SeguimientoService {
  static async obtenerPorCliente(id_cliente, pagina = 1, limite = 20) {
    try {
      const offset = (pagina - 1) * limite;
      const { rows, count } = await SeguimientoCliente.findAndCountAll({
        where: { id_cliente },
        include: [
          { association: 'cliente', attributes: ['id', 'nombre', 'apellido'] },
          { association: 'usuario', attributes: ['id', 'nombre'] },
        ],
        limit: limite,
        offset,
        order: [['createdAt', 'DESC']],
      });
      return { seguimientos: rows, total: count, pagina, limite };
    } catch (error) {
      logger.error('Error en obtenerPorCliente seguimiento:', error);
      throw error;
    }
  }

  static async crear(datos) {
    try {
      const cliente = await Cliente.findByPk(datos.id_cliente);
      if (!cliente || cliente.estado === 0) throw new Error('Cliente no encontrado');

      const seguimiento = await SeguimientoCliente.create(datos);
      return seguimiento;
    } catch (error) {
      logger.error('Error en crear seguimiento:', error);
      throw error;
    }
  }
}

module.exports = SeguimientoService;
