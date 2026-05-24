import { create } from 'zustand'
import { v4 as uuid } from 'crypto'  // disponible en browsers modernos via crypto.randomUUID
import type { CanvasItem, CanvasTotales, Cliente } from '@/types/proformas'

const IVA_RATE = 0.12

function calcularSubtotal(item: Pick<CanvasItem, 'precioUnitario' | 'cantidad' | 'descuento'>): number {
  return item.precioUnitario * item.cantidad * (1 - item.descuento / 100)
}

function calcularTotales(items: CanvasItem[]): CanvasTotales {
  const subtotal = items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0)
  const descuentoTotal = items.reduce(
    (acc, i) => acc + i.precioUnitario * i.cantidad * (i.descuento / 100), 0
  )
  const baseImponible = subtotal - descuentoTotal
  const iva = baseImponible * IVA_RATE
  return { subtotal, descuentoTotal, baseImponible, iva, total: baseImponible + iva }
}

interface CanvasStore {
  // Estado
  items: CanvasItem[]
  clienteSeleccionado: Cliente | null
  fechaEntrega: string | null
  notas: string
  totales: CanvasTotales
  aiPreviewUrl: string | null
  aiLoading: boolean

  // Acciones de items
  agregarProducto: (producto: { id: number; nombre: string; precio_venta: number }) => void
  eliminarItem:    (canvasId: string) => void
  setCantidad:     (canvasId: string, cantidad: number) => void
  setDescuento:    (canvasId: string, descuento: number) => void
  reordenarItems:  (items: CanvasItem[]) => void

  // Acciones de metadata
  setCliente:      (cliente: Cliente | null) => void
  setFechaEntrega: (fecha: string | null) => void
  setNotas:        (notas: string) => void

  // IA
  setAiPreview:    (url: string | null) => void
  setAiLoading:    (loading: boolean) => void

  // Reset
  reset:           () => void
}

const totalesVacios: CanvasTotales = {
  subtotal: 0, descuentoTotal: 0, baseImponible: 0, iva: 0, total: 0,
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  items:                [],
  clienteSeleccionado:  null,
  fechaEntrega:         null,
  notas:                '',
  totales:              totalesVacios,
  aiPreviewUrl:         null,
  aiLoading:            false,

  agregarProducto: (producto) => {
    const { items } = get()
    const existente = items.find((i) => i.productoId === producto.id)

    if (existente) {
      // Si ya existe, incrementa cantidad
      const nuevosItems = items.map((i) =>
        i.productoId === producto.id
          ? { ...i, cantidad: i.cantidad + 1, subtotal: calcularSubtotal({ ...i, cantidad: i.cantidad + 1 }) }
          : i
      )
      set({ items: nuevosItems, totales: calcularTotales(nuevosItems) })
      return
    }

    const nuevoItem: CanvasItem = {
      canvasId:       crypto.randomUUID(),
      productoId:     producto.id,
      nombre:         producto.nombre,
      precioUnitario: producto.precio_venta,
      cantidad:       1,
      descuento:      0,
      subtotal:       producto.precio_venta,
    }
    const nuevosItems = [...items, nuevoItem]
    set({ items: nuevosItems, totales: calcularTotales(nuevosItems) })
  },

  eliminarItem: (canvasId) => {
    const nuevosItems = get().items.filter((i) => i.canvasId !== canvasId)
    set({ items: nuevosItems, totales: calcularTotales(nuevosItems) })
  },

  setCantidad: (canvasId, cantidad) => {
    if (cantidad < 1) return
    const nuevosItems = get().items.map((i) =>
      i.canvasId === canvasId
        ? { ...i, cantidad, subtotal: calcularSubtotal({ ...i, cantidad }) }
        : i
    )
    set({ items: nuevosItems, totales: calcularTotales(nuevosItems) })
  },

  setDescuento: (canvasId, descuento) => {
    const d = Math.min(100, Math.max(0, descuento))
    const nuevosItems = get().items.map((i) =>
      i.canvasId === canvasId
        ? { ...i, descuento: d, subtotal: calcularSubtotal({ ...i, descuento: d }) }
        : i
    )
    set({ items: nuevosItems, totales: calcularTotales(nuevosItems) })
  },

  reordenarItems: (items) =>
    set({ items, totales: calcularTotales(items) }),

  setCliente:      (cliente) => set({ clienteSeleccionado: cliente }),
  setFechaEntrega: (fecha)   => set({ fechaEntrega: fecha }),
  setNotas:        (notas)   => set({ notas }),
  setAiPreview:    (url)     => set({ aiPreviewUrl: url }),
  setAiLoading:    (loading) => set({ aiLoading: loading }),

  reset: () =>
    set({
      items: [], clienteSeleccionado: null, fechaEntrega: null,
      notas: '', totales: totalesVacios, aiPreviewUrl: null, aiLoading: false,
    }),
}))
