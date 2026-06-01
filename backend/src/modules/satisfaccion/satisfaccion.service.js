const { SatisfaccionCliente, Venta, Cliente } = require('../../models');
const logger = require('../../config/logger');

class SatisfaccionService {
  static async crear(datos) {
    try {
      const venta = await Venta.findByPk(datos.id_venta);
      if (!venta) throw new Error('Venta no encontrada');

      const yaExiste = await SatisfaccionCliente.findOne({ where: { id_venta: datos.id_venta } });
      if (yaExiste) throw new Error('Ya existe una calificación para esta venta');

      if (datos.calificacion < 1 || datos.calificacion > 5) {
        throw new Error('La calificación debe estar entre 1 y 5');
      }

      const satisfaccion = await SatisfaccionCliente.create(datos);
      return satisfaccion;
    } catch (error) {
      logger.error('Error en crear satisfaccion:', error);
      throw error;
    }
  }

  static async obtenerPorVenta(id_venta) {
    try {
      const satisfaccion = await SatisfaccionCliente.findOne({
        where: { id_venta },
        include: [
          {
            association: 'venta',
            attributes: ['id', 'numero_venta', 'total', 'fecha_venta'],
            include: [{ association: 'cliente', attributes: ['id', 'nombre', 'apellido'] }],
          },
        ],
      });
      if (!satisfaccion) throw new Error('No se encontró calificación para esta venta');
      return satisfaccion;
    } catch (error) {
      logger.error('Error en obtenerPorVenta satisfaccion:', error);
      throw error;
    }
  }
}

module.exports = SatisfaccionService;
