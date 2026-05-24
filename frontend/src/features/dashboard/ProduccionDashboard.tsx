import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { proformasApi } from '@/lib/api'
import { EstadoBadge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import type { Proforma, EstadoProforma, DetalleProforma } from '@/types/proformas'

const COLUMNAS: { estado: EstadoProforma; label: string; color: string; headerColor: string }[] = [
  { estado: 'Pendiente',  label: 'Pendiente',  color: 'bg-warning-50  border-warning-200', headerColor: 'bg-warning-100  text-warning-700'  },
  { estado: 'Definitiva', label: 'Confirmada', color: 'bg-info-50    border-info-200',    headerColor: 'bg-info-100    text-info-700'    },
  { estado: 'Cerrada',    label: 'Completada', color: 'bg-success-50  border-success-200', headerColor: 'bg-success-100  text-success-700'  },
]

export function ProduccionDashboard() {
  const { data: proformas = [], isLoading } = useQuery({
    queryKey: ['proformas'],
    queryFn: () => proformasApi.list().then((r) => r.data),
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Producción</h1>
        <p className="text-sm text-neutral-500">
          Tablero de pedidos confirmados y recetas
        </p>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {COLUMNAS.map(({ estado, label, color, headerColor }) => {
          const columnaProformas = proformas.filter((p: Proforma) => p.estado === estado)
          return (
            <KanbanColumn
              key={estado}
              label={label}
              proformas={columnaProformas}
              color={color}
              headerColor={headerColor}
            />
          )
        })}
      </div>
    </div>
  )
}

interface KanbanColumnProps {
  label: string
  proformas: Proforma[]
  color: string
  headerColor: string
}

function KanbanColumn({ label, proformas, color, headerColor }: KanbanColumnProps) {
  return (
    <div className={`flex flex-col rounded-xl border ${color} overflow-hidden`}>
      {/* Header de columna */}
      <div className={`flex items-center justify-between px-4 py-3 ${headerColor}`}>
        <h2 className="font-semibold">{label}</h2>
        <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs font-bold">
          {proformas.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {proformas.length === 0 && (
          <div className="py-8 text-center text-sm text-neutral-400">
            Sin pedidos aquí
          </div>
        )}
        {proformas.map((p: Proforma) => (
          <ProformaKanbanCard key={p.id} proforma={p} />
        ))}
      </div>
    </div>
  )
}

function ProformaKanbanCard({ proforma }: { proforma: Proforma }) {
  const [expanded, setExpanded] = useState(false)

  const diasRestantes = proforma.fecha_entrega
    ? Math.ceil(
        (new Date(proforma.fecha_entrega).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null

  const urgente = diasRestantes !== null && diasRestantes <= 2 && proforma.estado !== 'Cerrada'

  return (
    <div className={`rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md ${urgente ? 'border-error-300' : 'border-neutral-200'}`}>
      {/* Card header */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-500">{proforma.numero}</span>
              {urgente && (
                <span className="rounded-full bg-error-100 px-1.5 py-0.5 text-[10px] font-semibold text-error-600">
                  URGENTE
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate font-semibold text-neutral-800">
              {proforma.cliente.nombre}
            </p>
          </div>
          <EstadoBadge estado={proforma.estado} />
        </div>

        {/* Fecha y total */}
        <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
          {proforma.fecha_entrega ? (
            <span className={urgente ? 'font-semibold text-error-600' : ''}>
              📅 {new Date(proforma.fecha_entrega).toLocaleDateString('es-EC')}
              {diasRestantes !== null && diasRestantes >= 0 && (
                <> · {diasRestantes === 0 ? 'hoy' : `${diasRestantes}d`}</>
              )}
            </span>
          ) : (
            <span>Sin fecha</span>
          )}
          <span className="font-semibold text-primary-800">${proforma.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Toggle receta */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between border-t border-neutral-100 px-4 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-50 transition-colors"
      >
        <span>Ver receta ({proforma.detalles?.length ?? 0} productos)</span>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Detalle BOM expandible */}
      {expanded && (
        <div className="border-t border-neutral-100 px-4 py-3 space-y-1.5">
          {!proforma.detalles || proforma.detalles.length === 0 ? (
            <p className="text-xs text-neutral-400">Sin detalle disponible</p>
          ) : (
            proforma.detalles.map((d: DetalleProforma) => (
              <div key={d.id} className="flex items-center justify-between">
                <span className="text-xs text-neutral-700">{d.producto.nombre}</span>
                <span className="text-xs font-semibold text-neutral-800">
                  × {d.cantidad}
                </span>
              </div>
            ))
          )}

          {/* Notas de la proforma */}
          {proforma.notas && (
            <div className="mt-2 rounded-md bg-brand-cream px-3 py-2 text-xs text-neutral-600">
              📝 {proforma.notas}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
