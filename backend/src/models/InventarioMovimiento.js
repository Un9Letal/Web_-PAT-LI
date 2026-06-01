const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InventarioMovimiento = sequelize.define(
  'InventarioMovimiento',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productos',
        key: 'id',
      },
    },
    tipo: {
      type: DataTypes.ENUM('entrada', 'salida', 'ajuste', 'devolucion'),
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    referencia: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Ej: numero_venta, numero_compra',
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    stock_anterior: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stock_actual: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'inventario_movimientos',
    timestamps: true,
    underscored: true,
  }
);

module.exports = InventarioMovimiento;
