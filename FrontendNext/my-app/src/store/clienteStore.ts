import { create } from 'zustand';
import { clientesAPI } from '@/lib/api';

export interface Cliente {
  id: number;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  whatsapp?: string;
  direccion?: string;
  ciudad?: string;
  tipo_cliente: 'minorista' | 'mayorista' | 'corporativo';
  estado: number;
  creado_por_chatbot: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ClienteStore {
  clientes: Cliente[];
  loading: boolean;
  error: string | null;

  obtenerClientes: () => Promise<void>;
  obtenerClientePorId: (id: number) => Promise<Cliente>;
  crearCliente: (data: Partial<Cliente>) => Promise<Cliente>;
  actualizarCliente: (id: number, data: Partial<Cliente>) => Promise<Cliente>;
  eliminarCliente: (id: number) => Promise<void>;
  limpiarError: () => void;
}

export const useClienteStore = create<ClienteStore>((set, get) => ({
  clientes: [],
  loading: false,
  error: null,

  obtenerClientes: async () => {
    set({ loading: true, error: null });
    try {
      const response = await clientesAPI.obtenerTodos();
      set({ clientes: response.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  obtenerClientePorId: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await clientesAPI.obtenerPorId(id);
      return response.data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  crearCliente: async (data: Partial<Cliente>) => {
    set({ loading: true, error: null });
    try {
      const response = await clientesAPI.crear(data);
      const nuevoCliente = response.data;
      set((state) => ({
        clientes: [...state.clientes, nuevoCliente],
        loading: false,
      }));
      return nuevoCliente;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  actualizarCliente: async (id: number, data: Partial<Cliente>) => {
    set({ loading: true, error: null });
    try {
      const response = await clientesAPI.actualizar(id, data);
      const clienteActualizado = response.data;
      set((state) => ({
        clientes: state.clientes.map((c) =>
          c.id === id ? clienteActualizado : c
        ),
        loading: false,
      }));
      return clienteActualizado;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  eliminarCliente: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await clientesAPI.eliminar(id);
      set((state) => ({
        clientes: state.clientes.filter((c) => c.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  limpiarError: () => set({ error: null }),
}));
