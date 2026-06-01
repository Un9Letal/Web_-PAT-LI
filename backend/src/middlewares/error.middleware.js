const logger = require('../config/logger');

const errorMiddleware = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  logger.error(`${status} - ${message} - ${req.originalUrl} - ${req.method}`);

  // Errores de Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(422).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'El registro ya existe',
      field: err.fields,
    });
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
