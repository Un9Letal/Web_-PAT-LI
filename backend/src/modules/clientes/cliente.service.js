const { Cliente } = require('../../models');
const logger = require('../../config/logger');

class ClienteService {
  /**
   * Obtener todos los clientes activos
   */
  static async obtenerTodos(pagina = 1, limite = 10) {
    try {
      const offset = (pagina - 1) * limite;

      const { rows, count } = await Cliente.findAndCountAll({
        where: { estado: 1 },
        limit: limite,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return {
        clientes: rows,
        total: count,
        pagina,
        limite,
      };
    } catch (error) {
      logger.error('Error en obtenerTodos clientes:', error);
      throw error;
    }
  }

  /**
   * Obtener cliente por ID
   */
  static async obtenerPorId(id) {
    try {
      const cliente = await Cliente.findByPk(id);

      if (!cliente || cliente.estado === 0) {
        throw new Error('Cliente no encontrado');
      }

      return cliente;
    } catch (error) {
      logger.error('Error en obtenerPorId:', error);
      throw error;
    }
  }

  /**
   * Crear cliente
   */
  static async crear(datosCliente) {
    try {
      const { email } = datosCliente;

      // Verificar email único
      if (email) {
        const clienteExistente = await Cliente.findOne({ where: { email } });
        if (clienteExistente) {
          throw new Error('El email ya está registrado');
        }
      }

      const cliente = await Cliente.create(datosCliente);

      return cliente;
    } catch (error) {
      logger.error('Error en crear cliente:', error);
      throw error;
    }
  }

  /**
   * Actualizar cliente
   */
  static async actualizar(id, datosCliente) {
    try {
      const cliente = await Cliente.findByPk(id);

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      await cliente.update(datosCliente);

      return cliente;
    } catch (error) {
      logger.error('Error en actualizar cliente:', error);
      throw error;
    }
  }

  /**
   * Eliminar (soft delete)
   */
  static async eliminar(id) {
    try {
      const cliente = await Cliente.findByPk(id);

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      await cliente.update({ estado: 0 });

      return { message: 'Cliente eliminado' };
    } catch (error) {
      logger.error('Error en eliminar cliente:', error);
      throw error;
    }
  }

  /**
   * Obtener o crear cliente desde chatbot
   */
  static async obtenerOCrearDesdeChat(datosCliente) {
    try {
      const { email, telefono } = datosCliente;

      if (email) {
        const clienteExistente = await Cliente.findOne({ where: { email } });
        if (clienteExistente) {
          return clienteExistente;
        }
      }

      const cliente = await Cliente.create({
        ...datosCliente,
        creado_por_chatbot: 1,
      });

      return cliente;
    } catch (error) {
      logger.error('Error en obtenerOCrearDesdeChat:', error);
      throw error;
    }
  }
}

module.exports = ClienteService;
