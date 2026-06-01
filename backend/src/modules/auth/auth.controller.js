const AuthService = require('./auth.service');
const { success, error } = require('../../utils/response.helper');
const logger = require('../../config/logger');

class AuthController {
  /**
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return error(res, 'Email y password requeridos', 400);
      }

      const resultado = await AuthService.login(email, password);

      return success(res, resultado, 'Login exitoso', 200);
    } catch (err) {
      logger.error('Error en login:', err);
      if (err.message.includes('Credenciales')) {
        return error(res, err.message, 401);
      }
      next(err);
    }
  }

  /**
   * POST /api/auth/register
   * (Solo para que administrador cree nuevos usuarios)
   */
  static async register(req, res, next) {
    try {
      const datosUsuario = req.body;

      const usuario = await AuthService.registrar(datosUsuario);

      return success(res, usuario, 'Usuario registrado exitosamente', 201);
    } catch (err) {
      logger.error('Error en register:', err);
      if (err.message.includes('ya está registrado')) {
        return error(res, err.message, 409);
      }
      next(err);
    }
  }
}

module.exports = AuthController;
