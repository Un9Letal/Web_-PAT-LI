const DashboardService = require('./dashboard.service');
const { success, error } = require('../../utils/response.helper');
const logger = require('../../config/logger');

class DashboardController {
  /**
   * GET /api/dashboard/kpis
   */
  static async obtenerKPIs(req, res, next) {
    try {
      const kpis = await DashboardService.obtenerKPIsDia();

      return success(res, kpis, 'KPIs obtenidos exitosamente', 200);
    } catch (err) {
      logger.error('Error en obtenerKPIs:', err);
      next(err);
    }
  }

  /**
   * GET /api/dashboard/ventas-semana
   */
  static async ventasPorSemana(req, res, next) {
    try {
      const ventas = await DashboardService.ventasPorSemana();

      return success(res, ventas, 'Ventas de la semana obtenidas', 200);
    } catch (err) {
      logger.error('Error en ventasPorSemana:', err);
      next(err);
    }
  }

  /**
   * GET /api/dashboard/chatbot-metricas
   */
  static async metricasChatbot(req, res, next) {
    try {
      const metricas = await DashboardService.metricasChatbot();

      return success(res, metricas, 'Métricas del chatbot obtenidas', 200);
    } catch (err) {
      logger.error('Error en metricasChatbot:', err);
      next(err);
    }
  }

  /**
   * GET /api/dashboard/leads
   */
  static async leadsYConversiones(req, res, next) {
    try {
      const leads = await DashboardService.leadsYConversiones();

      return success(res, leads, 'Datos de leads obtenidos', 200);
    } catch (err) {
      logger.error('Error en leadsYConversiones:', err);
      next(err);
    }
  }

  /**
   * GET /api/dashboard/resumen
   */
  static async resumenEjecutivo(req, res, next) {
    try {
      const resumen = await DashboardService.resumenEjecutivo();

      return success(res, resumen, 'Resumen ejecutivo obtenido', 200);
    } catch (err) {
      logger.error('Error en resumenEjecutivo:', err);
      next(err);
    }
  }
}

module.exports = DashboardController;
