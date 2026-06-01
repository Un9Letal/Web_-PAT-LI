const { InventarioMovimiento, Producto, Usuario } = require('../../models');
const logger = require('../../config/logger');

class InventarioService {
  static async obtenerMovimientos(pagina = 1, limite = 20, filtros = {}) {
    try {
      const offset = (pagina - 1) * limite;
      const where = {};
      if (filtros.id_producto) where.id_producto = filtros.id_producto;
      if (filtros.tipo) where.tipo = filtros.tipo;

      const { rows, count } = await InventarioMovimiento.findAndCountAll({
        where,
        include: [
          { association: 'producto', attributes: ['id', 'nombre', 'sku', 'stock'] },
          { association: 'usuario', attributes: ['id', 'nombre'] },
        ],
        limit: limite,
        offset,
        order: [['createdAt', 'DESC']],
      });
      return { movimientos: rows, total: count, pagina, limite };
    } catch (error) {
      logger.error('Error en obtenerMovimientos:', error);
      throw error;
    }
  }

  static async crearMovimiento(datos) {
    try {
      const { id_producto, tipo, cantidad, motivo, referencia, id_usuario } = datos;

      const producto = await Producto.findByPk(id_producto);
      if (!producto || producto.estado === 0) throw new Error('Producto no encontrado');

      const stock_anterior = producto.stock;
      let stock_actual;

      if (tipo === 'entrada' || tipo === 'devolucion') {
        stock_actual = stock_anterior + cantidad;
      } else if (tipo === 'salida') {
        if (stock_anterior < cantidad) throw new Error('Stock insuficiente para realizar la salida');
        stock_actual = stock_anterior - cantidad;
      } else if (tipo === 'ajuste') {
        stock_actual = cantidad; // en ajuste, cantidad = nuevo stock absoluto
      }

      await producto.update({ stock: stock_actual });

      const movimiento = await InventarioMovimiento.create({
        id_producto,
        tipo,
        cantidad,
        motivo: motivo || null,
        referencia: referencia || null,
        id_usuario: id_usuario || null,
        stock_anterior,
        stock_actual,
      });

      return movimiento;
    } catch (error) {
      logger.error('Error en crearMovimiento:', error);
      throw error;
    }
  }
}

module.exports = InventarioService;
