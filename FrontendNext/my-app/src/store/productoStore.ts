import { create } from 'zustand';
import { productosAPI } from '@/lib/api';

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  sku: string;
  precio_compra: number;
  precio_venta: number;
  stock: number;
  stock_minimo: number;
  id_categoria: number;
  imagen_url?: string;
  estado: number;
  createdAt?: string;
  updatedAt?: string;
  categoria?: {
    nombre: string;
  };
}

interface ProductoStore {
  productos: Producto[];
  loading: boolean;
  error: string | null;
  
  // Acciones
  obtenerProductos: () => Promise<void>;
  obtenerProductoPorId: (id: number) => Promise<Producto>;
  crearProducto: (data: Partial<Producto>) => Promise<Producto>;
  actualizarProducto: (id: number, data: Partial<Producto>) => Promise<Producto>;
  eliminarProducto: (id: number) => Promise<void>;
  limpiarError: () => void;
}

export const useProductoStore = create<ProductoStore>((set, get) => ({
  productos: [],
  loading: false,
  error: null,

  obtenerProductos: async () => {
    set({ loading: true, error: null });
    try {
      const response = await productosAPI.obtenerTodos();
      set({ productos: response.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  obtenerProductoPorId: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await productosAPI.obtenerPorId(id);
      return response.data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  crearProducto: async (data: Partial<Producto>) => {
    set({ loading: true, error: null });
    try {
      const response = await productosAPI.crear(data);
      const nuevoProducto = response.data;
      set((state) => ({
        productos: [...state.productos, nuevoProducto],
        loading: false,
      }));
      return nuevoProducto;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  actualizarProducto: async (id: number, data: Partial<Producto>) => {
    set({ loading: true, error: null });
    try {
      const response = await productosAPI.actualizar(id, data);
      const productoActualizado = response.data;
      set((state) => ({
        productos: state.productos.map((p) =>
          p.id === id ? productoActualizado : p
        ),
        loading: false,
      }));
      return productoActualizado;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  eliminarProducto: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await productosAPI.eliminar(id);
      set((state) => ({
        productos: state.productos.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  limpiarError: () => set({ error: null }),
}));
