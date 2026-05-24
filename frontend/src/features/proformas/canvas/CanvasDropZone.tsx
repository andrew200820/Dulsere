import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useCanvasStore } from '@/stores/canvasStore'
import type { CanvasItem } from '@/types/proformas'

interface Props {
  dropId: string
}

export function CanvasDropZone({ dropId }: Props) {
  const { items } = useCanvasStore()
  const { setNodeRef, isOver } = useDroppable({ id: dropId })

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-full p-6 transition-colors
        ${isOver ? 'bg-primary-50/60' : ''}
      `}
    >
      {/* Header del canvas */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-neutral-800">Canvas de cotización</h2>
        <p className="text-sm text-neutral-500">
          Arrastra productos desde el panel izquierdo
        </p>
      </div>

      {/* Estado vacío */}
      {items.length === 0 && (
        <div
          className={`
            flex flex-col items-center justify-center rounded-xl border-2 border-dashed
            py-16 transition-colors
            ${isOver ? 'border-primary-600 bg-primary-50' : 'border-neutral-200 bg-neutral-50/50'}
          `}
        >
          <div className="mb-3 text-4xl opacity-20">🧁</div>
          <p className="font-medium text-neutral-500">
            {isOver ? 'Suelta aquí para agregar' : 'Arrastra productos aquí'}
          </p>
          <p className="mt-1 text-sm text-neutral-400">
            O haz clic en un producto para agregarlo
          </p>
        </div>
      )}

      {/* Items del canvas */}
      {items.length > 0 && (
        <SortableContext items={items.map((i) => i.canvasId)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((item) => (
              <CanvasItemRow key={item.canvasId} item={item} />
            ))}
          </div>

          {/* Zona de drop adicional cuando hay items */}
          {isOver && (
            <div className="mt-3 rounded-lg border-2 border-dashed border-primary-400 py-4 text-center text-sm text-primary-600">
              Suelta aquí para agregar
            </div>
          )}
        </SortableContext>
      )}
    </div>
  )
}

function CanvasItemRow({ item }: { item: CanvasItem }) {
  const { eliminarItem, setCantidad, setDescuento } = useCanvasStore()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.canvasId,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        rounded-lg border border-neutral-200 bg-white shadow-sm
        transition-shadow
        ${isDragging ? 'opacity-50 shadow-md' : 'hover:shadow-md'}
      `}
    >
      {/* Handle de arrastre + nombre */}
      <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-neutral-300 hover:text-neutral-500 active:cursor-grabbing"
          aria-label="Reordenar item"
        >
          ⠿
        </button>
        <span className="flex-1 font-medium text-neutral-800">{item.nombre}</span>
        <span className="text-sm text-neutral-500">
          ${item.precioUnitario.toFixed(2)} c/u
        </span>
        <button
          onClick={() => eliminarItem(item.canvasId)}
          className="ml-2 text-neutral-300 hover:text-error-600 transition-colors"
          aria-label={`Eliminar ${item.nombre}`}
        >
          ✕
        </button>
      </div>

      {/* Controles de cantidad, descuento y subtotal */}
      <div className="flex items-center gap-4 px-4 py-2.5">
        {/* Cantidad */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-neutral-500">Cant.</label>
          <div className="flex items-center rounded-md border border-neutral-200 overflow-hidden">
            <button
              onClick={() => setCantidad(item.canvasId, item.cantidad - 1)}
              className="px-2 py-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-40"
              disabled={item.cantidad <= 1}
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.cantidad}</span>
            <button
              onClick={() => setCantidad(item.canvasId, item.cantidad + 1)}
              className="px-2 py-1 text-neutral-500 hover:bg-neutral-100"
            >
              +
            </button>
          </div>
        </div>

        {/* Descuento */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-neutral-500">Desc.</label>
          <div className="flex items-center rounded-md border border-neutral-200 overflow-hidden">
            <input
              type="number"
              min={0}
              max={100}
              value={item.descuento}
              onChange={(e) => setDescuento(item.canvasId, Number(e.target.value))}
              className="w-12 py-1 text-center text-sm focus:outline-none"
            />
            <span className="pr-2 text-xs text-neutral-400">%</span>
          </div>
        </div>

        {/* Subtotal */}
        <div className="ml-auto text-right">
          <span className="text-sm font-semibold text-primary-800">
            ${item.subtotal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
