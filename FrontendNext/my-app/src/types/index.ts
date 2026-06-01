export type UserRole = 'admin' | 'vendedor' | 'cliente';

export interface Role {
  id_rol: number;
  nombre_rol: string;
  descripcion: string;
  estado: number; // TINYINT
  fecha_creacion: Date;
}

export interface Usuario {
  id_usuario: number;
  id_rol: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  estado: number;
  fecha_registro: Date;
}

export interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  direccion: string;
  fecha_registro: Date;
  estado: number;
}

export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
  descripcion: string;
  estado: number;
}

export interface Producto {
  id_producto: number;
  id_categoria: number;
  nombre_producto: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string; // Coincide con SQL 'imagen'
  estado: number;
  fecha_registro: Date;
}

export interface Venta {
  id_venta: number;
  id_cliente: number;
  id_usuario: number;
  fecha_venta: Date;
  total: number;
  metodo_pago: string;
  estado: string;
}

export interface DetalleVenta {
  id_detalle: number;
  id_venta: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Consulta {
  id_consulta: number;
  id_cliente: number;
  tipo_consulta: string;
  mensaje: string;
  canal: string;
  fecha_consulta: Date;
  estado: string;
}

export interface ChatbotConversacion {
  id_conversacion: number;
  id_cliente: number;
  fecha_inicio: Date;
  fecha_fin?: Date;
  tiempo_respuesta_promedio: number;
  estado: string;
}

export interface ChatbotMensaje {
  id_mensaje: number;
  id_conversacion: number;
  emisor: string;
  mensaje: string;
  fecha: Date;
}

export interface SeguimientoCliente {
  id_seguimiento: number;
  id_cliente: number;
  id_usuario: number;
  observacion: string;
  fecha: Date;
  estado_cliente: string;
}

export interface SatisfaccionCliente {
  id_satisfaccion: number;
  id_cliente: number;
  id_venta: number;
  calificacion: number;
  comentario: string;
  fecha: Date;
}

export interface EvaluacionSistema {
  id_evaluacion: number;
  tipo_evaluacion: string;
  id_cliente: number;
  id_usuario: number;
  tiempo_respuesta: number;
  eficiencia_ventas: number;
  satisfaccion: number;
  fecha: Date;
}

export interface InventarioMovimiento {
  id_movimiento: number;
  id_producto: number;
  tipo_movimiento: string;
  cantidad: number;
  motivo: string;
  fecha: Date;
}

export interface ClientePotencial {
  id_potencial: number;
  id_usuario: number;
  id_cliente?: number | null;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  fuente: string;
  interes: string;
  nivel_interes: 'frio' | 'tibio' | 'caliente';
  estado: 'nuevo' | 'contactado' | 'seguimiento' | 'convertido' | 'perdido';
  fecha_registro: Date;
}
