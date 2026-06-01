const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SeguimientoCliente = sequelize.define(
  'SeguimientoCliente',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clientes',
        key: 'id',
      },
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    tipo: {
      type: DataTypes.ENUM('llamada', 'email', 'mensaje', 'visita', 'nota'),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    proxima_fecha_contacto: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resultado: {
      type: DataTypes.ENUM('positivo', 'negativo', 'pendiente'),
      allowNull: true,
    },
  },
  {
    tableName: 'seguimiento_clientes',
    timestamps: true,
    underscored: true,
  }
);

module.exports = SeguimientoCliente;
