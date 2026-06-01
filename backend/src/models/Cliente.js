const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cliente = sequelize.define(
  'Cliente',
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
    apellido: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    whatsapp: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ciudad: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tipo_cliente: {
      type: DataTypes.ENUM('minorista', 'mayorista', 'corporativo'),
      defaultValue: 'minorista',
    },
    estado: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '1 = activo, 0 = inactivo (soft delete)',
    },
    creado_por_chatbot: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '1 = creado automáticamente por chatbot',
    },
  },
  {
    tableName: 'clientes',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Cliente;
