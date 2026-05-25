export type EstadoProforma = 'Pendiente' | 'Definitiva' | 'Cerrada'
export type MetodoPago = 'Transferencia' | 'Efectivo' | 'Tarjeta'
export type TipoPago = 'Anticipo' | 'Saldo_Cierre' | 'Completo'

export interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  precio_venta: number
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
  producto: Producto
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export interface PagoAnticipo {
  id: number
  monto: number
  tipo_pago: TipoPago
  metodo_pago: MetodoPago
  referencia: string | null
  fecha_pago: string
}

export interface Proforma {
  id: number
  estado: EstadoProforma
  token_acceso: string | null
  cliente: Cliente
  fecha_emision: string
  fecha_entrega: string | null
  subtotal: number
  descuento: number
  monto_iva: number
  total: number
  detalles: DetalleProforma[]
  pagos: PagoAnticipo[]
}

export interface CreateProformaDto {
  clienteId: number
  fechaEntrega: string
  descuento?: number
  motivoDescuento?: string
  porcentajeIva?: number
  detalles: {
    productoId: number
    cantidad: number
  }[]
}
