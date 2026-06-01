// Importar todos los modelos
const Rol = require('./Rol');
const Usuario = require('./Usuario');
const Cliente = require('./Cliente');
const ClientePotencial = require('./ClientePotencial');
const Categoria = require('./Categoria');
const Producto = require('./Producto');
const Venta = require('./Venta');
const DetalleVenta = require('./DetalleVenta');
const Consulta = require('./Consulta');
const ChatbotConversacion = require('./ChatbotConversacion');
const ChatbotMensaje = require('./ChatbotMensaje');
const SeguimientoCliente = require('./SeguimientoCliente');
const SatisfaccionCliente = require('./SatisfaccionCliente');
const InventarioMovimiento = require('./InventarioMovimiento');
const EvaluacionSistema = require('./EvaluacionSistema');

/**
 * DEFINIR ASOCIACIONES
 */

// Rol ↔ Usuario (1:N)
Rol.hasMany(Usuario, { foreignKey: 'id_rol', as: 'usuarios' });
Usuario.belongsTo(Rol, { foreignKey: 'id_rol', as: 'rol' });

// Usuario ↔ Venta (1:N)
Usuario.hasMany(Venta, { foreignKey: 'id_usuario', as: 'ventas' });
Venta.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Usuario ↔ ClientePotencial (1:N)
Usuario.hasMany(ClientePotencial, { foreignKey: 'id_usuario_asignado', as: 'potenciales_asignados' });
ClientePotencial.belongsTo(Usuario, { foreignKey: 'id_usuario_asignado', as: 'usuario_asignado' });

// Usuario ↔ Consulta (1:N)
Usuario.hasMany(Consulta, { foreignKey: 'id_usuario_asignado', as: 'consultas_asignadas' });
Consulta.belongsTo(Usuario, { foreignKey: 'id_usuario_asignado', as: 'usuario_asignado' });

// Usuario ↔ SeguimientoCliente (1:N)
Usuario.hasMany(SeguimientoCliente, { foreignKey: 'id_usuario', as: 'seguimientos' });
SeguimientoCliente.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Usuario ↔ InventarioMovimiento (1:N)
Usuario.hasMany(InventarioMovimiento, { foreignKey: 'id_usuario', as: 'movimientos_inventario' });
InventarioMovimiento.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Cliente ↔ Venta (1:N)
Cliente.hasMany(Venta, { foreignKey: 'id_cliente', as: 'ventas' });
Venta.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });

// Cliente ↔ Consulta (1:N)
Cliente.hasMany(Consulta, { foreignKey: 'id_cliente', as: 'consultas' });
Consulta.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });

// Cliente ↔ SeguimientoCliente (1:N)
Cliente.hasMany(SeguimientoCliente, { foreignKey: 'id_cliente', as: 'seguimientos' });
SeguimientoCliente.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });

// Cliente ↔ ChatbotConversacion (1:N)
Cliente.hasMany(ChatbotConversacion, { foreignKey: 'id_cliente', as: 'conversaciones' });
ChatbotConversacion.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });

// Categoria ↔ Producto (1:N)
Categoria.hasMany(Producto, { foreignKey: 'id_categoria', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'id_categoria', as: 'categoria' });

// Producto ↔ DetalleVenta (1:N)
Producto.hasMany(DetalleVenta, { foreignKey: 'id_producto', as: 'detalle_ventas' });
DetalleVenta.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });

// Producto ↔ InventarioMovimiento (1:N)
Producto.hasMany(InventarioMovimiento, { foreignKey: 'id_producto', as: 'movimientos' });
InventarioMovimiento.belongsTo(Producto, { foreignKey: 'id_producto', as: 'producto' });

// Venta ↔ DetalleVenta (1:N)
Venta.hasMany(DetalleVenta, { foreignKey: 'id_venta', as: 'detalles' });
DetalleVenta.belongsTo(Venta, { foreignKey: 'id_venta', as: 'venta' });

// Venta ↔ SatisfaccionCliente (1:1)
Venta.hasOne(SatisfaccionCliente, { foreignKey: 'id_venta', as: 'satisfaccion' });
SatisfaccionCliente.belongsTo(Venta, { foreignKey: 'id_venta', as: 'venta' });

// ChatbotConversacion ↔ ChatbotMensaje (1:N)
ChatbotConversacion.hasMany(ChatbotMensaje, { foreignKey: 'id_conversacion', as: 'mensajes' });
ChatbotMensaje.belongsTo(ChatbotConversacion, { foreignKey: 'id_conversacion', as: 'conversacion' });

module.exports = {
  Rol,
  Usuario,
  Cliente,
  ClientePotencial,
  Categoria,
  Producto,
  Venta,
  DetalleVenta,
  Consulta,
  ChatbotConversacion,
  ChatbotMensaje,
  SeguimientoCliente,
  SatisfaccionCliente,
  InventarioMovimiento,
  EvaluacionSistema,
};
