const { Venta, DetalleVenta, Producto, InventarioMovimiento, sequelize } = require('../../models');
const logger = require('../../config/logger');

class VentaService {
  /**
   * Obtener todas las ventas
   */
  static async obtenerTodas(pagina = 1, limite = 10) {
    try {
      const offset = (pagina - 1) * limite;

      const { rows, count } = await Venta.findAndCountAll({
        include: [
          { association: 'cliente', attributes: ['nombre', 'email'] },
          { association: 'usuario', attributes: ['nombre'] },
          { association: 'detalles', include: { association: 'producto' } },
        ],
        limit: limite,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return {
        ventas: rows,
        total: count,
        pagina,
        limite,
      };
    } catch (error) {
      logger.error('Error en obtenerTodas:', error);
      throw error;
    }
  }

  /**
   * Obtener venta por ID
   */
  static async obtenerPorId(id) {
    try {
      const venta = await Venta.findByPk(id, {
        include: [
          { association: 'cliente', attributes: ['nombre', 'email'] },
          { association: 'usuario', attributes: ['nombre'] },
          { association: 'detalles', include: { association: 'producto' } },
        ],
      });

      if (!venta) {
        throw new Error('Venta no encontrada');
      }

      return venta;
    } catch (error) {
      logger.error('Error en obtenerPorId:', error);
      throw error;
    }
  }

  /**
   * Crear venta CON TRANSACCIÓN (crítico para descuento de stock)
   */
  static async crear(datosVenta) {
    const t = await sequelize.transaction();

    try {
      const { id_cliente, id_usuario, detalles, metodo_pago } = datosVenta;

      // Generar número de venta único
      const numeroVenta = `VT-${Date.now()}`;

      let subtotal = 0;
      const detallesGuardar = [];

      // Validar y preparar detalles
      for (const detalle of detalles) {
        const producto = await Producto.findByPk(detalle.id_producto, { transaction: t });

        if (!producto) {
          throw new Error(`Producto ${detalle.id_producto} no encontrado`);
        }

        if (producto.stock < detalle.cantidad) {
          throw new Error(
            `Stock insuficiente de ${producto.nombre}. Disponibles: ${producto.stock}`
          );
        }

        const subtotalDetalle = detalle.cantidad * detalle.precio_unitario;
        subtotal += subtotalDetalle;

        detallesGuardar.push({
          id_producto: detalle.id_producto,
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario,
          subtotal: subtotalDetalle,
        });

        // DESCONTAR STOCK
        await producto.decrement('stock', {
          by: detalle.cantidad,
          transaction: t,
        });

        // Registrar movimiento de inventario
        await InventarioMovimiento.create(
          {
            id_producto: detalle.id_producto,
            tipo: 'salida',
            cantidad: detalle.cantidad,
            referencia: numeroVenta,
            motivo: 'Venta de producto',
            stock_anterior: producto.stock,
            stock_actual: producto.stock - detalle.cantidad,
            id_usuario,
          },
          { transaction: t }
        );
      }

      const descuento = datosVenta.descuento || 0;
      const impuesto = datosVenta.impuesto || 0;
      const total = subtotal - descuento + impuesto;

      // Crear venta
      const venta = await Venta.create(
        {
          numero_venta: numeroVenta,
          id_cliente,
          id_usuario,
          subtotal,
          descuento,
          impuesto,
          total,
          metodo_pago,
          estado: 'pagada',
        },
        { transaction: t }
      );

      // Crear detalles de venta
      const detallesVenta = await Promise.all(
        detallesGuardar.map((detalle) =>
          DetalleVenta.create({ id_venta: venta.id, ...detalle }, { transaction: t })
        )
      );

      await t.commit();

      return {
        venta,
        detalles: detallesVenta,
      };
    } catch (error) {
      await t.rollback();
      logger.error('Error en crear venta:', error);
      throw error;
    }
  }

  /**
   * Cambiar estado de venta
   */
  static async cambiarEstado(id, nuevoEstado) {
    try {
      const venta = await Venta.findByPk(id);

      if (!venta) {
        throw new Error('Venta no encontrada');
      }

      await venta.update({ estado: nuevoEstado });

      return venta;
    } catch (error) {
      logger.error('Error en cambiarEstado:', error);
      throw error;
    }
  }

  /**
   * Obtener ventas del día
   */
  static async ventasDelDia() {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const mañana = new Date(hoy);
      mañana.setDate(mañana.getDate() + 1);

      const ventas = await Venta.findAll({
        where: {
          fecha_venta: {
            [require('sequelize').Op.between]: [hoy, mañana],
          },
        },
      });

      const totalVentas = ventas.reduce((sum, v) => sum + parseFloat(v.total), 0);
      const cantidadVentas = ventas.length;

      return {
        totalVentas,
        cantidadVentas,
        ventas,
      };
    } catch (error) {
      logger.error('Error en ventasDelDia:', error);
      throw error;
    }
  }
}

module.exports = VentaService;
