const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ClientePotencial = sequelize.define(
  'ClientePotencial',
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
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    empresa: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    nivel_interes: {
      type: DataTypes.ENUM('frio', 'tibio', 'caliente'),
      defaultValue: 'frio',
    },
    estado: {
      type: DataTypes.ENUM('prospecto', 'contactado', 'en_negociacion', 'convertido', 'perdido'),
      defaultValue: 'prospecto',
    },
    fuente: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'ej: chatbot, referencia, evento, web',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    id_usuario_asignado: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
  },
  {
    tableName: 'clientes_potenciales',
    timestamps: true,
    underscored: true,
  }
);

module.exports = ClientePotencial;
