const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatbotMensaje = sequelize.define(
  'ChatbotMensaje',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_conversacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'chatbot_conversaciones',
        key: 'id',
      },
    },
    emisor: {
      type: DataTypes.ENUM('cliente', 'bot'),
      allowNull: false,
    },
    mensaje: {
      type: DataTypes.LONGTEXT,
      allowNull: false,
    },
    tiempo_respuesta_ms: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Solo para mensajes del bot',
    },
    tokens_usado: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'chatbot_mensajes',
    timestamps: true,
    underscored: true,
  }
);

module.exports = ChatbotMensaje;
