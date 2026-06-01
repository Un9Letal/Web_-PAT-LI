const openai = require('../../config/openai');
const logger = require('../../config/logger');
const {
  ChatbotConversacion,
  ChatbotMensaje,
  Producto,
  Cliente,
} = require('../../models');
const NodeCache = require('node-cache');

// Cache de productos (10 minutos)
const cache = new NodeCache({ stdTTL: 600 });

/**
 * Servicio de Chatbot con IA
 */
class ChatbotService {
  /**
   * Obtener contexto de productos para el system prompt
   */
  static async obtenerContextoProductos() {
    let productos = cache.get('productos_contexto');

    if (!productos) {
      try {
        productos = await Producto.findAll({
          where: { estado: 1 },
          include: { association: 'categoria', attributes: ['nombre'] },
          limit: 10,
          order: [['createdAt', 'DESC']],
        });

        const productosTexto = productos
          .map(
            (p) =>
              `${p.nombre} - S/${p.precio_venta} - Stock: ${p.stock} unidades`
          )
          .join('\n');

        cache.set('productos_contexto', productosTexto);
      } catch (error) {
        logger.error('Error al obtener contexto de productos:', error);
        return '';
      }
    }

    return productos;
  }

  /**
   * Enviar mensaje y obtener respuesta de OpenAI
   * @param {Object} params - { mensaje, id_cliente, id_conversacion }
   * @returns {Object} - { respuesta, id_conversacion, tiempo_respuesta_ms }
   */
  static async procesarMensaje(params) {
    const { mensaje, id_cliente, id_conversacion } = params;

    try {
      let conversacion = null;

      // Crear o recuperar conversación
      if (id_conversacion) {
        conversacion = await ChatbotConversacion.findByPk(id_conversacion);
        if (!conversacion) {
          throw new Error('Conversación no encontrada');
        }
      } else {
        conversacion = await ChatbotConversacion.create({
          id_cliente: id_cliente || null,
        });
      }

      // Guardar mensaje del cliente
      await ChatbotMensaje.create({
        id_conversacion: conversacion.id,
        emisor: 'cliente',
        mensaje,
      });

      // Obtener historial
      const historial = await ChatbotMensaje.findAll({
        where: { id_conversacion: conversacion.id },
        order: [['createdAt', 'ASC']],
        limit: 10,
      });

      // Construir mensajes para OpenAI
      const mensajesIA = historial.map((m) => ({
        role: m.emisor === 'cliente' ? 'user' : 'assistant',
        content: m.mensaje,
      }));

      // Obtener contexto de productos
      const contextoProductos = await this.obtenerContextoProductos();

      // System prompt
      const systemPrompt = `${process.env.SYSTEM_PROMPT}

PRODUCTOS DISPONIBLES:
${contextoProductos}

Responde siempre en español, de manera amable y profesional. 
Si el cliente pregunta sobre productos, usa la información disponible.
Si pregunta algo fuera de tu conocimiento sobre PAT-LI, sugiere que se comunique directamente.`;

      // Llamar a OpenAI
      const startTime = Date.now();
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...mensajesIA],
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || 500),
        temperature: 0.7,
      });

      const tiempoRespuesta = Date.now() - startTime;

      // Extraer respuesta
      const respuestaBot = response.choices[0].message.content;

      // Guardar respuesta del bot
      await ChatbotMensaje.create({
        id_conversacion: conversacion.id,
        emisor: 'bot',
        mensaje: respuestaBot,
        tiempo_respuesta_ms: tiempoRespuesta,
        tokens_usado: response.usage?.completion_tokens || 0,
      });

      // Actualizar estadísticas de la conversación
      const totalMensajes = await ChatbotMensaje.count({
        where: { id_conversacion: conversacion.id },
      });

      const mensajesBot = await ChatbotMensaje.findAll({
        where: {
          id_conversacion: conversacion.id,
          emisor: 'bot',
        },
      });

      const tiempoPromedio =
        mensajesBot.length > 0
          ? mensajesBot.reduce((sum, m) => sum + (m.tiempo_respuesta_ms || 0), 0) /
            mensajesBot.length
          : 0;

      await conversacion.update({
        cantidad_mensajes: totalMensajes,
        tiempo_respuesta_promedio: tiempoPromedio,
      });

      return {
        respuesta: respuestaBot,
        id_conversacion: conversacion.id,
        tiempo_respuesta_ms: tiempoRespuesta,
      };
    } catch (error) {
      logger.error('Error en procesarMensaje:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de conversación
   */
  static async obtenerHistorial(id_conversacion) {
    try {
      const mensajes = await ChatbotMensaje.findAll({
        where: { id_conversacion },
        order: [['createdAt', 'ASC']],
      });

      return mensajes;
    } catch (error) {
      logger.error('Error al obtener historial:', error);
      throw error;
    }
  }

  /**
   * Listar conversaciones del usuario
   */
  static async listarConversaciones(id_cliente = null) {
    try {
      const where = id_cliente ? { id_cliente } : {};

      const conversaciones = await ChatbotConversacion.findAll({
        where,
        include: {
          association: 'cliente',
          attributes: ['nombre', 'email'],
        },
        order: [['createdAt', 'DESC']],
      });

      return conversaciones;
    } catch (error) {
      logger.error('Error al listar conversaciones:', error);
      throw error;
    }
  }

  /**
   * Cerrar conversación
   */
  static async cerrarConversacion(id_conversacion) {
    try {
      const conversacion = await ChatbotConversacion.findByPk(id_conversacion);

      if (!conversacion) {
        throw new Error('Conversación no encontrada');
      }

      await conversacion.update({
        estado: 'cerrada',
        fecha_cierre: new Date(),
      });

      return conversacion;
    } catch (error) {
      logger.error('Error al cerrar conversación:', error);
      throw error;
    }
  }

  /**
   * Obtener métricas del chatbot
   */
  static async obtenerMetricas(fecha_inicio = null, fecha_fin = null) {
    try {
      const where = {};

      if (fecha_inicio && fecha_fin) {
        where.createdAt = {
          [require('sequelize').Op.between]: [fecha_inicio, fecha_fin],
        };
      }

      const conversaciones = await ChatbotConversacion.findAll({ where });
      const mensajes = await ChatbotMensaje.findAll({ where });

      const tiempoPromedio =
        mensajes.filter((m) => m.tiempo_respuesta_ms).length > 0
          ? mensajes
              .filter((m) => m.tiempo_respuesta_ms)
              .reduce((sum, m) => sum + m.tiempo_respuesta_ms, 0) /
            mensajes.filter((m) => m.tiempo_respuesta_ms).length
          : 0;

      return {
        total_conversaciones: conversaciones.length,
        total_mensajes: mensajes.length,
        tiempo_respuesta_promedio_ms: tiempoPromedio,
        conversaciones_activas: conversaciones.filter((c) => c.estado === 'activa')
          .length,
        conversaciones_cerradas: conversaciones.filter((c) => c.estado === 'cerrada')
          .length,
        satisfaccion_promedio:
          conversaciones.filter((c) => c.satisfaccion).length > 0
            ? conversaciones
                .filter((c) => c.satisfaccion)
                .reduce((sum, c) => sum + c.satisfaccion, 0) /
              conversaciones.filter((c) => c.satisfaccion).length
            : 0,
      };
    } catch (error) {
      logger.error('Error al obtener métricas:', error);
      throw error;
    }
  }
}

module.exports = ChatbotService;
