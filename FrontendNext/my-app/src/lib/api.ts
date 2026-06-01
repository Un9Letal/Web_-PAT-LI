/**
 * Configuración de API para conectar con el backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Clase para manejo de APIs
 */
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  /**
   * Establecer token JWT
   */
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  /**
   * Obtener headers con token
   */
  private getHeaders(customHeaders: Record<string, string> = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Método genérico GET
   */
  async get<T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Método genérico POST
   */
  async post<T = any>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Método genérico PUT
   */
  async put<T = any>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Método genérico DELETE
   */
  async delete<T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      ...options,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Manejo de respuestas
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Error: ${response.status}`);
    }

    return data;
  }
}

export const apiClient = new ApiClient();

/**
 * API para Productos
 */
export const productosAPI = {
  obtenerTodos: (pagina = 1, limite = 10) =>
    apiClient.get('/productos', { method: 'GET' }),
  obtenerPorId: (id: number) =>
    apiClient.get(`/productos/${id}`),
  crear: (data: any) =>
    apiClient.post('/productos', data),
  actualizar: (id: number, data: any) =>
    apiClient.put(`/productos/${id}`, data),
  eliminar: (id: number) =>
    apiClient.delete(`/productos/${id}`),
};

/**
 * API para Clientes
 */
export const clientesAPI = {
  obtenerTodos: (pagina = 1, limite = 10) =>
    apiClient.get('/clientes'),
  obtenerPorId: (id: number) =>
    apiClient.get(`/clientes/${id}`),
  crear: (data: any) =>
    apiClient.post('/clientes', data),
  actualizar: (id: number, data: any) =>
    apiClient.put(`/clientes/${id}`, data),
  eliminar: (id: number) =>
    apiClient.delete(`/clientes/${id}`),
};

/**
 * API para Ventas
 */
export const ventasAPI = {
  obtenerTodas: (pagina = 1, limite = 10) =>
    apiClient.get('/ventas'),
  obtenerPorId: (id: number) =>
    apiClient.get(`/ventas/${id}`),
  crear: (data: any) =>
    apiClient.post('/ventas', data),
  cambiarEstado: (id: number, estado: string) =>
    apiClient.put(`/ventas/${id}/estado`, { estado }),
  ventasDelDia: () =>
    apiClient.get('/ventas/dia/hoy'),
};

/**
 * API para Chatbot
 */
export const chatbotAPI = {
  enviarMensaje: (data: { mensaje: string; id_cliente?: number; id_conversacion?: number }) =>
    apiClient.post('/chatbot/mensaje', data),
  obtenerHistorial: (id: number) =>
    apiClient.get(`/chatbot/conversacion/${id}`),
  listarConversaciones: () =>
    apiClient.get('/chatbot/conversaciones'),
  cerrarConversacion: (id: number) =>
    apiClient.post(`/chatbot/conversacion/${id}/cerrar`, {}),
  obtenerMetricas: () =>
    apiClient.get('/chatbot/metricas'),
};

/**
 * API para Dashboard
 */
export const dashboardAPI = {
  obtenerKPIs: () =>
    apiClient.get('/dashboard/kpis'),
  ventasPorSemana: () =>
    apiClient.get('/dashboard/ventas-semana'),
  metricasChatbot: () =>
    apiClient.get('/dashboard/chatbot-metricas'),
  leads: () =>
    apiClient.get('/dashboard/leads'),
  resumen: () =>
    apiClient.get('/dashboard/resumen'),
};

/**
 * API para Autenticación
 */
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  register: (data: any) =>
    apiClient.post('/auth/register', data),
};

/**
 * API para Inventario
 */
export const inventarioAPI = {
  obtenerMovimientos: () =>
    apiClient.get('/inventario/movimientos'),
  registrarMovimiento: (data: any) =>
    apiClient.post('/inventario/movimientos', data),
};

/**
 * API para Consultas
 */
export const consultasAPI = {
  obtenerTodas: () =>
    apiClient.get('/consultas'),
  crear: (data: any) =>
    apiClient.post('/consultas', data),
  cambiarEstado: (id: number, estado: string) =>
    apiClient.put(`/consultas/${id}/estado`, { estado }),
};

/**
 * API para Satisfacción
 */
export const satisfaccionAPI = {
  registrar: (data: any) =>
    apiClient.post('/satisfaccion', data),
  obtenerPorVenta: (id: number) =>
    apiClient.get(`/satisfaccion/venta/${id}`),
};

export default apiClient;
