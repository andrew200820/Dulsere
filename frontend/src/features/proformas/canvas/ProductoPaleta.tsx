import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Producto } from '@/types/proformas'

interface Props {
  productos: Producto[]
  isLoading: boolean
}

export function ProductoPaleta({ productos, isLoading }: Props) {
  const [busqueda, setBusqueda] = useState('')

  const filtrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-100 p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Productos
        </h2>
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm
                     placeholder:text-neutral-300 focus:border-primary-800
                     focus:outline-none focus:ring-1 focus:ring-primary-800"
        />
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto p-3">
        {isLoading && (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-md bg-neutral-100" />
            ))}
          </div>
        )}

        {!isLoading && filtrados.length === 0 && (
          <p className="py-8 text-center text-sm text-neutral-400">
            Sin resultados
          </p>
        )}

        {filtrados.map((producto) => (
          <ProductoCard key={producto.id} producto={producto} />
        ))}
      </div>
    </div>
  )
}

function ProductoCard({ producto }: { producto: Producto }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: producto.id,
    data: { producto },
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        flex cursor-grab flex-col rounded-md border border-neutral-200 bg-white
        px-3 py-2.5 select-none transition-all
        hover:border-primary-600 hover:bg-primary-50 hover:shadow-xs
        active:cursor-grabbing
        ${isDragging ? 'opacity-40' : ''}
      `}
    >
      <span className="text-sm font-medium text-neutral-800">{producto.nombre}</span>
      <span className="mt-0.5 text-xs text-neutral-500">
        ${producto.precio_venta.toFixed(2)}
        {producto.unidad && <> / {producto.unidad}</>}
      </span>
    </div>
  )
}
