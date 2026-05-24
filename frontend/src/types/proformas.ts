export type EstadoProforma = 'Pendiente' | 'Definitiva' | 'Cerrada'
export type MetodoPago = 'Transferencia' | 'Efectivo' | 'Tarjeta'

export interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  precio_venta: number
  unidad: string
  activo: boolean
}

export interface Cliente {
  id: number
  nombre: string
  cedula_ruc: string
  email: string | null
  telefono: string | null
  direccion_entrega: string | null
}

// Estado local del canvas (antes de crear la proforma en el servidor)
export interface CanvasItem {
  canvasId: string        // UUID local para dnd-kit
  productoId: number
  nombre: string
  precioUnitario: number
  cantidad: number
  descuento: number       // porcentaje 0–100
  subtotal: number        // calculado: precio * cantidad * (1 - descuento/100)
}

export interface CanvasTotales {
  subtotal: number
  descuentoTotal: number
  baseImponible: number
  iva: number
  total: number
}

export interface DetalleProforma {
  id: number
  producto_id: number
  producto: Producto
  cantidad: number
  precio_unitario: number
  descuento: number
  subtotal: number
}

export interface PagoAnticipo {
  id: number
  monto: number
  metodo_pago: MetodoPago
  referencia: string | null
  fecha_pago: string
}

export interface Proforma {
  id: number
  numero: string
  estado: EstadoProforma
  token_acceso: string
  cliente: Cliente
  fecha_emision: string
  fecha_entrega: string | null
  subtotal: number
  descuento: number
  iva: number
  total: number
  notas: string | null
  detalles: DetalleProforma[]
  pagos: PagoAnticipo[]
}

export interface CreateProformaDto {
  cliente_id: number
  fecha_entrega: string | null
  notas: string | null
  items: {
    producto_id: number
    cantidad: number
    precio_unitario: number
    descuento: number
  }[]
}
