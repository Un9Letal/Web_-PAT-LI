/**
 * Respuesta exitosa estandarizada
 */
const success = (res, data, message = 'OK', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Respuesta de error estandarizada
 */
const error = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

/**
 * Respuesta paginada
 */
const paginate = (res, data, total, page, limit, message = 'OK', statusCode = 200) => {
  const totalPages = Math.ceil(total / limit);
  
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  });
};

module.exports = {
  success,
  error,
  paginate,
};
