const {
  Venta,
  Consulta,
  ChatbotConversacion,
  ChatbotMensaje,
  SatisfaccionCliente,
  EvaluacionSistema,
  ClientePotencial,
  sequelize,
} = require('../../models');
const logger = require('../../config/logger');

class DashboardService {
  /**
   * Obtener KPIs del día
   */
  static async obtenerKPIsDia() {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const mañana = new Date(hoy);
      mañana.setDate(mañana.getDate() + 1);

      const whereHoy = {
        createdAt: {
          [require('sequelize').Op.between]: [hoy, mañana],
        },
      };

      // Ventas del día
      const ventasDia = await Venta.findAll({ where: whereHoy });
      const totalVentas = ventasDia.reduce((sum, v) => sum + parseFloat(v.total), 0);

      // Consultas atendidas
      const consultasAtendidas = await Consulta.count({
        where: {
          ...whereHoy,
          estado: 'resuelta',
        },
      });

      // Conversaciones chatbot
      const conversacionesHoy = await ChatbotConversacion.findAll({ where: whereHoy });
      const mensajesHoy = await ChatbotMensaje.findAll({ where: whereHoy });
      const tiempoPromedioMs =
        mensajesHoy.filter((m) => m.tiempo_respuesta_ms).length > 0
          ? mensajesHoy
              .filter((m) => m.tiempo_respuesta_ms)
              .reduce((sum, m) => sum + m.tiempo_respuesta_ms, 0) /
            mensajesHoy.filter((m) => m.tiempo_respuesta_ms).length
          : 0;

      // Satisfacción promedio
      const satisfacciones = await SatisfaccionCliente.findAll();
      const satisfaccionPromedio =
        satisfacciones.length > 0
          ? satisfacciones.reduce((sum, s) => sum + s.calificacion, 0) /
            satisfacciones.length
          : 0;

      return {
        fecha: new Date().toISOString().split('T')[0],
        ventas_dia: {
          total: totalVentas,
          cantidad: ventasDia.length,
          ticket_promedio: ventasDia.length > 0 ? totalVentas / ventasDia.length : 0,
        },
        consultas_atendidas: consultasAtendidas,
        chatbot: {
          conversaciones: conversacionesHoy.length,
          mensajes: mensajesHoy.length,
          tiempo_respuesta_promedio_ms: Math.round(tiempoPromedioMs),
        },
        satisfaccion_promedio: parseFloat(satisfaccionPromedio.toFixed(2)),
      };
    } catch (error) {
      logger.error('Error en obtenerKPIsDia:', error);
      throw error;
    }
  }

  /**
   * Ventas por semana
   */
  static async ventasPorSemana() {
    try {
      const hace7Dias = new Date();
      hace7Dias.setDate(hace7Dias.getDate() - 7);

      const ventas = await Venta.findAll({
        where: {
          createdAt: {
            [require('sequelize').Op.gte]: hace7Dias,
          },
        },
        order: [['createdAt', 'ASC']],
      });

      // Agrupar por día
      const ventasPorDia = {};
      ventas.forEach((v) => {
        const fecha = new Date(v.createdAt).toISOString().split('T')[0];
        if (!ventasPorDia[fecha]) {
          ventasPorDia[fecha] = { total: 0, cantidad: 0 };
        }
        ventasPorDia[fecha].total += parseFloat(v.total);
        ventasPorDia[fecha].cantidad += 1;
      });

      return ventasPorDia;
    } catch (error) {
      logger.error('Error en ventasPorSemana:', error);
      throw error;
    }
  }

  /**
   * Métricas del chatbot
   */
  static async metricasChatbot() {
    try {
      const totalConversaciones = await ChatbotConversacion.count();
      const conversacionesCerradas = await ChatbotConversacion.count({
        where: { estado: 'cerrada' },
      });
      const conversacionesActivas = totalConversaciones - conversacionesCerradas;

      const totalMensajes = await ChatbotMensaje.count();
      const mensajesBot = await ChatbotMensaje.findAll({
        where: { emisor: 'bot' },
      });

      const tiempoPromedio =
        mensajesBot.length > 0
          ? mensajesBot
              .filter((m) => m.tiempo_respuesta_ms)
              .reduce((sum, m) => sum + (m.tiempo_respuesta_ms || 0), 0) / mensajesBot.length
          : 0;

      // Satisfacción de conversaciones
      const conversacionesConSatisfaccion = await ChatbotConversacion.count({
        where: { satisfaccion: { [require('sequelize').Op.ne]: null } },
      });

      const satisfaccionPromedio =
        conversacionesConSatisfaccion > 0
          ? (
              await ChatbotConversacion.findAll({
                where: { satisfaccion: { [require('sequelize').Op.ne]: null } },
              })
            ).reduce((sum, c) => sum + c.satisfaccion, 0) / conversacionesConSatisfaccion
          : 0;

      return {
        total_conversaciones: totalConversaciones,
        conversaciones_activas: conversacionesActivas,
        conversaciones_cerradas: conversacionesCerradas,
        total_mensajes: totalMensajes,
        tiempo_respuesta_promedio_ms: Math.round(tiempoPromedio),
        satisfaccion_promedio: parseFloat(satisfaccionPromedio.toFixed(2)),
        tasa_cierre: totalConversaciones > 0 ? (conversacionesCerradas / totalConversaciones * 100).toFixed(2) + '%' : '0%',
      };
    } catch (error) {
      logger.error('Error en metricasChatbot:', error);
      throw error;
    }
  }

  /**
   * Leads y conversiones
   */
  static async leadsYConversiones() {
    try {
      const totalLeads = await ClientePotencial.count();
      const leadsConvertidos = await ClientePotencial.count({
        where: { estado: 'convertido' },
      });
      const leadsEnNegociacion = await ClientePotencial.count({
        where: { estado: 'en_negociacion' },
      });
      const leadsPerdidos = await ClientePotencial.count({
        where: { estado: 'perdido' },
      });

      const tasaConversion = totalLeads > 0 ? ((leadsConvertidos / totalLeads) * 100).toFixed(2) : 0;

      return {
        total_leads: totalLeads,
        leads_convertidos: leadsConvertidos,
        leads_en_negociacion: leadsEnNegociacion,
        leads_perdidos: leadsPerdidos,
        tasa_conversion: tasaConversion + '%',
      };
    } catch (error) {
      logger.error('Error en leadsYConversiones:', error);
      throw error;
    }
  }

  /**
   * Resumen ejecutivo (todo junto)
   */
  static async resumenEjecutivo() {
    try {
      const [kpisDia, ventasSemana, metricasChat, leads] = await Promise.all([
        this.obtenerKPIsDia(),
        this.ventasPorSemana(),
        this.metricasChatbot(),
        this.leadsYConversiones(),
      ]);

      return {
        kpis_dia: kpisDia,
        ventas_semana: ventasSemana,
        chatbot_metricas: metricasChat,
        leads_conversiones: leads,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error en resumenEjecutivo:', error);
      throw error;
    }
  }
}

module.exports = DashboardService;
