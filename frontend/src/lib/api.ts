import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dulsere_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dulsere_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (email: string, contrasena: string) =>
    api.post<{ access_token: string; usuario: import('@/types/auth').Usuario }>(
      '/auth/login', { email, contrasena }
    ),
}

export const productosApi = {
  list: () => api.get<import('@/types/proformas').Producto[]>('/inventario/productos'),
}

export const insumosApi = {
  list:   ()         => api.get<import('@/types/inventario').Insumo[]>('/inventario/insumos'),
  create: (data: unknown) => api.post('/inventario/insumos', data),
  update: (id: number, data: unknown) => api.patch(`/inventario/insumos/${id}`, data),
}

export const movimientosApi = {
  list:   () => api.get<import('@/types/inventario').MovimientoInventario[]>('/inventario/movimientos'),
  create: (data: unknown) => api.post('/inventario/movimientos', data),
  visionAudit: (imageBase64: string) =>
    api.post<{ insumos: { nombre: string; cantidad: number; unidad: string }[] }>(
      '/inventario/vision/audit', { image: imageBase64 }
    ),
}

export const clientesApi = {
  list:   () => api.get<import('@/types/proformas').Cliente[]>('/clientes'),
  create: (data: unknown) => api.post('/clientes', data),
}

export const proformasApi = {
  list:   () => api.get<import('@/types/proformas').Proforma[]>('/proformas'),
  get:    (id: number) => api.get<import('@/types/proformas').Proforma>(`/proformas/${id}`),
  create: (data: import('@/types/proformas').CreateProformaDto) =>
    api.post<import('@/types/proformas').Proforma>('/proformas', data),
  cambiarEstado: (id: number, estado: string) =>
    api.patch(`/proformas/${id}/estado`, { estado }),
  registrarPago: (id: number, data: unknown) =>
    api.post(`/proformas/${id}/pagos`, data),
  pdf: (id: number) =>
    api.get(`/proformas/${id}/pdf`, { responseType: 'blob' }),
  aiPreview: (items: { nombre: string; cantidad: number }[]) =>
    api.post<{ imagen_url: string }>('/proformas/ai-preview', { items }),
}
