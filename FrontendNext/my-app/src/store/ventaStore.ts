import { create } from 'zustand';
import { ventasAPI, inventarioAPI } from '@/lib/api';

export interface DetalleVenta {
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
}

export interface Venta {
  id: number;
  numero_venta: string;
  id_cliente: number;
  id_usuario?: number;
  fecha_venta: string;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque';
  estado: 'pendiente' | 'pagada' | 'cancelada';
  notas?: string;
  createdAt?: string;
  updatedAt?: string;
  cliente?: {
    nombre: string;
    email: string;
  };
  detalles?: any[];
}

export interface MovimientoInventario {
  id: number;
  id_producto: number;
  tipo: 'entrada' | 'salida' | 'ajuste' | 'devolucion';
  cantidad: number;
  referencia?: string;
  motivo?: string;
  stock_anterior: number;
  stock_actual: number;
  createdAt?: string;
}

interface VentaStore {
  ventas: Venta[];
  ventasDelDia: any;
  movimientos: MovimientoInventario[];
  loading: boolean;
  error: string | null;

  // Ventas
  obtenerVentas: () => Promise<void>;
  obtenerVentaPorId: (id: number) => Promise<Venta>;
  crearVenta: (data: { id_cliente: number; metodo_pago: string; detalles: DetalleVenta[] }) => Promise<Venta>;
  cambiarEstadoVenta: (id: number, estado: string) => Promise<Venta>;
  obtenerVentasDelDia: () => Promise<void>;

  // Inventario
  obtenerMovimientos: () => Promise<void>;
  registrarMovimiento: (data: any) => Promise<MovimientoInventario>;

  limpiarError: () => void;
}

export const useVentaStore = create<VentaStore>((set, get) => ({
  ventas: [],
  ventasDelDia: null,
  movimientos: [],
  loading: false,
  error: null,

  obtenerVentas: async () => {
    set({ loading: true, error: null });
    try {
      const response = await ventasAPI.obtenerTodas();
      set({ ventas: response.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  obtenerVentaPorId: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await ventasAPI.obtenerPorId(id);
      return response.data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  crearVenta: async (data: { id_cliente: number; metodo_pago: string; detalles: DetalleVenta[] }) => {
    set({ loading: true, error: null });
    try {
      const response = await ventasAPI.crear(data);
      const nuevaVenta = response.data.venta;
      set((state) => ({
        ventas: [...state.ventas, nuevaVenta],
        loading: false,
      }));
      return nuevaVenta;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  cambiarEstadoVenta: async (id: number, estado: string) => {
    set({ loading: true, error: null });
    try {
      const response = await ventasAPI.cambiarEstado(id, estado);
      const ventaActualizada = response.data;
      set((state) => ({
        ventas: state.ventas.map((v) =>
          v.id === id ? ventaActualizada : v
        ),
        loading: false,
      }));
      return ventaActualizada;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  obtenerVentasDelDia: async () => {
    set({ loading: true, error: null });
    try {
      const response = await ventasAPI.ventasDelDia();
      set({ ventasDelDia: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  obtenerMovimientos: async () => {
    set({ loading: true, error: null });
    try {
      const response = await inventarioAPI.obtenerMovimientos();
      set({ movimientos: response.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  registrarMovimiento: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const response = await inventarioAPI.registrarMovimiento(data);
      const nuevoMovimiento = response.data;
      set((state) => ({
        movimientos: [...state.movimientos, nuevoMovimiento],
        loading: false,
      }));
      return nuevoMovimiento;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  limpiarError: () => set({ error: null }),
}));
