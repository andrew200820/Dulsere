import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useQuery } from '@tanstack/react-query'
import { productosApi, proformasApi } from '@/lib/api'
import { useCanvasStore } from '@/stores/canvasStore'
import { ProductoPaleta } from './ProductoPaleta'
import { CanvasDropZone } from './CanvasDropZone'
import { TotalPanel } from './TotalPanel'
import type { Producto } from '@/types/proformas'

const CANVAS_DROP_ID = 'canvas-drop-zone'

export function CotizacionCanvas() {
  const [draggingProducto, setDraggingProducto] = useState<Producto | null>(null)
  const { agregarProducto } = useCanvasStore()

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['productos'],
    queryFn: () => productosApi.list().then((r) => r.data),
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragStart(event: DragStartEvent) {
    const producto = productos.find((p) => p.id === event.active.id)
    setDraggingProducto(producto ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingProducto(null)
    if (event.over?.id === CANVAS_DROP_ID && draggingProducto) {
      agregarProducto(draggingProducto)
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-0 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">

        {/* Panel izquierdo — Paleta de productos */}
        <div className="w-64 shrink-0 border-r border-neutral-100 overflow-y-auto">
          <ProductoPaleta productos={productos} isLoading={isLoading} />
        </div>

        {/* Panel central — Canvas de arrastre */}
        <div className="flex-1 overflow-y-auto bg-brand-cream/30">
          <CanvasDropZone dropId={CANVAS_DROP_ID} />
        </div>

        {/* Panel derecho — Totales y acciones */}
        <div className="w-64 shrink-0 border-l border-neutral-100 overflow-y-auto">
          <TotalPanel />
        </div>
      </div>

      {/* Overlay visual durante el arrastre */}
      <DragOverlay>
        {draggingProducto && (
          <div className="rounded-md bg-primary-800 px-3 py-2 text-sm font-medium text-white shadow-lg opacity-90">
            {draggingProducto.nombre}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
