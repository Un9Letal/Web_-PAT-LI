const jwt = require('jsonwebtoken');
const { Usuario, Rol } = require('../../models');
const logger = require('../../config/logger');

class AuthService {
  /**
   * Login de usuario
   */
  static async login(email, password) {
    try {
      const usuario = await Usuario.findOne({
        where: { email },
        include: { association: 'rol', attributes: ['nombre'] },
      });

      if (!usuario) {
        throw new Error('Credenciales inválidas');
      }

      if (usuario.estado === 0) {
        throw new Error('Usuario inactivo');
      }

      // Validar password
      const passwordValido = await usuario.validarPassword(password);
      if (!passwordValido) {
        throw new Error('Credenciales inválidas');
      }

      // Generar token
      const token = jwt.sign(
        {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol.nombre,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );

      return {
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol.nombre,
        },
      };
    } catch (error) {
      logger.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Registrar nuevo usuario (solo admin)
   */
  static async registrar(datosUsuario) {
    try {
      const { nombre, email, password, telefono, id_rol } = datosUsuario;

      // Verificar si el usuario ya existe
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        throw new Error('El email ya está registrado');
      }

      // Crear usuario
      const usuario = await Usuario.create({
        nombre,
        email,
        password,
        telefono,
        id_rol: id_rol || 2, // 2 = vendedor por defecto
      });

      // Recargar con rol
      await usuario.reload({ include: { association: 'rol', attributes: ['nombre'] } });

      return {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol.nombre,
      };
    } catch (error) {
      logger.error('Error en registrar:', error);
      throw error;
    }
  }

  /**
   * Validar token (para verificación posterior)
   */
  static async validarToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
}

module.exports = AuthService;
