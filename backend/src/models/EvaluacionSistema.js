const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EvaluacionSistema = sequelize.define(
  'EvaluacionSistema',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    total_ventas_dia: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    cantidad_ventas_dia: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    cantidad_consultas_atendidas: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tiempo_respuesta_promedio_ms: {
      type: DataTypes.DECIMAL(10, 3),
      defaultValue: 0,
    },
    total_conversaciones_chatbot: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    satisfaccion_promedio: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    tasa_conversion: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: 'Porcentaje: leads → clientes',
    },
  },
  {
    tableName: 'evaluacion_sistema',
    timestamps: true,
    underscored: true,
  }
);

module.exports = EvaluacionSistema;
