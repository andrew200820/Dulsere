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

// Campos Decimal que Prisma serializa como strings — los convertimos a number aquí
const DECIMAL_FIELDS = new Set([
  'total', 'subtotal', 'descuento', 'monto_iva', 'porcentaje_iva',
  'precio_unitario', 'precio_venta', 'monto',
  'stock_actual', 'stock_minimo', 'costo_unitario',
  'cantidad', 'cantidad_requerida',
])

function parseDecimals<T>(obj: T): T {
  if (Array.isArray(obj)) return obj.map(parseDecimals) as unknown as T
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        k,
        DECIMAL_FIELDS.has(k) && (typeof v === 'string' || typeof v === 'number')
          ? Number(v)
          : parseDecimals(v),
      ])
    ) as T
  }
  return obj
}

function withParse<T>(promise: Promise<{ data: T }>) {
  return promise.then((res) => ({ ...res, data: parseDecimals(res.data) }))
}

export const authApi = {
  login: (email: string, contrasena: string) =>
    api.post<{ access_token: string; usuario: import('@/types/auth').Usuario }>(
      '/auth/login', { email, password: contrasena }
    ),
}

export const productosApi = {
  list:      ()              => withParse(api.get<import('@/types/proformas').Producto[]>('/inventario/productos')),
  create:    (data: unknown) => api.post('/inventario/productos', data),
  update:    (id: number, data: unknown) => api.patch(`/inventario/productos/${id}`, data),
  getBOM:    (id: number)    => withParse(api.get<import('@/types/inventario').RecetaBOM[]>(`/inventario/productos/${id}/bom`)),
  addBOM:    (id: number, data: unknown) => api.post(`/inventario/productos/${id}/bom`, data),
  removeBOM: (id: number, bomId: number) => api.delete(`/inventario/productos/${id}/bom/${bomId}`),
}

export const insumosApi = {
  list:   ()         => withParse(api.get<import('@/types/inventario').Insumo[]>('/inventario/insumos')),
  create: (data: unknown) => api.post('/inventario/insumos', data),
  update: (id: number, data: unknown) => api.patch(`/inventario/insumos/${id}`, data),
}

export const movimientosApi = {
  list:   () => withParse(api.get<import('@/types/inventario').MovimientoInventario[]>('/inventario/movimientos')),
  create: (data: unknown) => api.post('/inventario/movimientos', data),
  visionAudit: (imageBase64: string) =>
    api.post<{ insumos: { nombre: string; cantidad: number; unidad: string }[] }>(
      '/inventario/vision/audit', { image: imageBase64 }
    ),
}

export const clientesApi = {
  list:   ()                    => api.get<import('@/types/proformas').Cliente[]>('/clientes'),
  get:    (id: number)          => api.get<import('@/types/proformas').Cliente>(`/clientes/${id}`),
  create: (data: unknown)       => api.post('/clientes', data),
  update: (id: number, data: unknown) => api.patch(`/clientes/${id}`, data),
}

export const usuariosApi = {
  list:       ()                    => api.get<import('@/types/auth').UsuarioAdmin[]>('/usuarios'),
  roles:      ()                    => api.get<{ id: number; nombre: string }[]>('/usuarios/roles'),
  create:     (data: unknown)       => api.post('/usuarios', data),
  update:     (id: string, data: unknown) => api.patch(`/usuarios/${id}`, data),
  remove:     (id: string)          => api.delete(`/usuarios/${id}`),
}

export const proformasApi = {
  list:   () => withParse(api.get<import('@/types/proformas').Proforma[]>('/proformas')),
  get:    (id: number) => withParse(api.get<import('@/types/proformas').Proforma>(`/proformas/${id}`)),
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