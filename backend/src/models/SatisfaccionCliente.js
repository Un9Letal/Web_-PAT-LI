const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SatisfaccionCliente = sequelize.define(
  'SatisfaccionCliente',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_venta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ventas',
        key: 'id',
      },
    },
    calificacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Escala 1-5',
    },
    comentario: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    factores: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Ej: {calidad: 5, precio: 4, entrega: 5}',
    },
  },
  {
    tableName: 'satisfaccion_cliente',
    timestamps: true,
    underscored: true,
  }
);

module.exports = SatisfaccionCliente;
