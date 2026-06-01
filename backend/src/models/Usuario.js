const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define(
  'Usuario',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    id_rol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id',
      },
    },
    estado: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '1 = activo, 0 = inactivo',
    },
  },
  {
    tableName: 'usuarios',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (usuario) => {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          usuario.password = await bcrypt.hash(usuario.password, salt);
        }
      },
    },
  }
);

/**
 * Método para comparar passwords
 */
Usuario.prototype.validarPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

/**
 * Excluir password del toJSON
 */
Usuario.prototype.toJSON = function () {
  const usuario = Object.assign({}, this.get());
  delete usuario.password;
  return usuario;
};

module.exports = Usuario;
