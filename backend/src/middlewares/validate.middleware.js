const validateMiddleware = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      return res.status(422).json({
        success: false,
        message: 'Validación fallida',
        errors,
      });
    }

    req.body = value;
    next();
  };
};

module.exports = validateMiddleware;
