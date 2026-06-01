const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado',
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: `No tienes permiso. Roles requeridos: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
