const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Venta = sequelize.define(
  'Venta',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numero_venta: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
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
    fecha_venta: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    descuento: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    impuesto: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    metodo_pago: {
      type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'cheque'),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'pagada', 'cancelada'),
      defaultValue: 'pendiente',
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'ventas',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Venta;
