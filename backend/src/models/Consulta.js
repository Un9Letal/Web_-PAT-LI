const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Consulta = sequelize.define(
  'Consulta',
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
    tipo: {
      type: DataTypes.ENUM('producto', 'precio', 'disponibilidad', 'garantia', 'devolucion', 'otro'),
      allowNull: false,
    },
    canal: {
      type: DataTypes.ENUM('chatbot', 'whatsapp', 'email', 'telefono', 'presencial'),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('abierta', 'en_proceso', 'resuelta', 'cerrada'),
      defaultValue: 'abierta',
    },
    id_usuario_asignado: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    fecha_resolucion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'consultas',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Consulta;
