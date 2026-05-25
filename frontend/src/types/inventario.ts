export interface Insumo {
  id: number
  nombre: string
  unidad_medida: string
  stock_actual: number
  stock_minimo: number
  costo_unitario: number
  activo: boolean
}

export interface MovimientoInventario {
  id: number
  tipo_movimiento: 'Entrada' | 'Salida' | 'Ajuste'
  insumo: { id: number; nombre: string; unidad_medida: string }
  cantidad: number
  created_at: string
  motivo: string | null
  usuario: { nombre: string } | null
}

export interface RecetaBOM {
  id: number
  producto_id: number
  insumo: Insumo
  cantidad_requerida: number
}