const ChatbotService = require('./chatbot.service');
const { success, error } = require('../../utils/response.helper');
const logger = require('../../config/logger');

class ChatbotController {
  /**
   * POST /api/chatbot/mensaje
   * Enviar mensaje y obtener respuesta del bot
   */
  static async enviarMensaje(req, res, next) {
    try {
      const { mensaje, id_cliente, id_conversacion } = req.body;

      if (!mensaje || mensaje.trim().length === 0) {
        return error(res, 'El mensaje no puede estar vacío', 400);
      }

      const resultado = await ChatbotService.procesarMensaje({
        mensaje: mensaje.trim(),
        id_cliente,
        id_conversacion,
      });

      return success(
        res,
        resultado,
        'Respuesta del chatbot generada exitosamente',
        200
      );
    } catch (err) {
      logger.error('Error en enviarMensaje:', err);
      next(err);
    }
  }

  /**
   * GET /api/chatbot/conversacion/:id
   * Obtener historial de una conversación
   */
  static async obtenerHistorial(req, res, next) {
    try {
      const { id } = req.params;

      const historial = await ChatbotService.obtenerHistorial(id);

      return success(res, historial, 'Historial obtenido exitosamente', 200);
    } catch (err) {
      logger.error('Error en obtenerHistorial:', err);
      next(err);
    }
  }

  /**
   * GET /api/chatbot/conversaciones
   * Listar conversaciones (requiere autenticación)
   */
  static async listarConversaciones(req, res, next) {
    try {
      const id_cliente = req.query.id_cliente;

      const conversaciones = await ChatbotService.listarConversaciones(id_cliente);

      return success(res, conversaciones, 'Conversaciones obtenidas exitosamente', 200);
    } catch (err) {
      logger.error('Error en listarConversaciones:', err);
      next(err);
    }
  }

  /**
   * POST /api/chatbot/conversacion/:id/cerrar
   * Cerrar una conversación
   */
  static async cerrarConversacion(req, res, next) {
    try {
      const { id } = req.params;

      const resultado = await ChatbotService.cerrarConversacion(id);

      return success(res, resultado, 'Conversación cerrada exitosamente', 200);
    } catch (err) {
      logger.error('Error en cerrarConversacion:', err);
      next(err);
    }
  }

  /**
   * GET /api/chatbot/metricas
   * Obtener métricas del chatbot
   */
  static async obtenerMetricas(req, res, next) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;

      const metricas = await ChatbotService.obtenerMetricas(fecha_inicio, fecha_fin);

      return success(res, metricas, 'Métricas obtenidas exitosamente', 200);
    } catch (err) {
      logger.error('Error en obtenerMetricas:', err);
      next(err);
    }
  }
}

module.exports = ChatbotController;
