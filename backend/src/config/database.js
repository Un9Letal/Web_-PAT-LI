const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const logger = require('./logger');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: '-05:00',
  }
);

// Sincronizar modelos (se ejecutará después que se carguen todos)
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✓ Conexión a base de datos exitosa');
    
    // En producción: { alter: false }
    // En desarrollo: { alter: true } para sincronizar cambios automáticamente
    const alter = process.env.NODE_ENV === 'development';
    await sequelize.sync({ alter });
    
    logger.info('✓ Modelos sincronizados con la BD');
  } catch (error) {
    logger.error('✗ Error conectando a la base de datos:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, initDatabase };
