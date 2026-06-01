const express = require('express');
const router = express.Router();
const DashboardController = require('./dashboard.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

/**
 * RUTAS - Todas requieren autenticación
 */

// GET /api/dashboard/kpis (KPIs del día)
router.get('/kpis', authMiddleware, roleMiddleware('vendedor', 'admin'), DashboardController.obtenerKPIs);

// GET /api/dashboard/ventas-semana
router.get(
  '/ventas-semana',
  authMiddleware,
  roleMiddleware('admin'),
  DashboardController.ventasPorSemana
);

// GET /api/dashboard/chatbot-metricas
router.get(
  '/chatbot-metricas',
  authMiddleware,
  roleMiddleware('admin'),
  DashboardController.metricasChatbot
);

// GET /api/dashboard/leads
router.get('/leads', authMiddleware, roleMiddleware('admin'), DashboardController.leadsYConversiones);

// GET /api/dashboard/resumen (Resumen ejecutivo - todo junto)
router.get('/resumen', authMiddleware, roleMiddleware('admin'), DashboardController.resumenEjecutivo);

module.exports = router;
