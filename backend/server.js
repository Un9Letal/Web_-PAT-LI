require('dotenv').config();
const app = require('./src/app');
const { initDatabase } = require('./src/config/database');
const logger = require('./src/config/logger');

const PORT = process.env.PORT || 3000;

/**
 * Función para iniciar el servidor
 */
const startServer = async () => {
  try {
    // Inicializar base de datos
    await initDatabase();

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('✗ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

/**
 * Manejo de excepciones no capturadas
 */
process.on('uncaughtException', (error) => {
  logger.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

/**
 * Iniciar
 */
startServer();
