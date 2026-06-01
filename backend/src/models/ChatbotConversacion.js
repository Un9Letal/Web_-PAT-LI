const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatbotConversacion = sequelize.define(
  'ChatbotConversacion',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'null si es anónimo',
      references: {
        model: 'clientes',
        key: 'id',
      },
    },
    estado: {
      type: DataTypes.ENUM('activa', 'cerrada'),
      defaultValue: 'activa',
    },
    tiempo_respuesta_promedio: {
      type: DataTypes.DECIMAL(10, 3),
      defaultValue: 0,
      comment: 'Milisegundos',
    },
    cantidad_mensajes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    satisfaccion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Escala 1-5',
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fecha_cierre: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'chatbot_conversaciones',
    timestamps: true,
    underscored: true,
  }
);

module.exports = ChatbotConversacion;
