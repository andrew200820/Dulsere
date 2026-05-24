export interface Insumo {
  id: number
  nombre: string
  unidad: 'g' | 'ml' | 'ud'
  stock_actual: number
  stock_minimo: number
  precio_unitario: number
  activo: boolean
}

export interface MovimientoInventario {
  id: number
  tipo: 'Entrada' | 'Salida' | 'Ajuste'
  insumo: { id: number; nombre: string; unidad: string }
  cantidad: number
  fecha: string
  motivo: string | null
  usuario: { nombre: string }
}

export interface RecetaBOM {
  id: number
  producto_id: number
  insumo: Insumo
  cantidad_requerida: number
}
