import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { proformasApi, insumosApi, productosApi } from '@/lib/api'
import { EstadoBadge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import type { Proforma, EstadoProforma, DetalleProforma } from '@/types/proformas'
import type { Insumo, RecetaBOM } from '@/types/inventario'

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface NecesidadIngrediente {
  insumo: Insumo
  cantidadNecesaria: number
  stockActual: number
  suficiente: boolean
  deficit: number
}

// ─── Constantes del Kanban ────────────────────────────────────────────────────

const COLUMNAS: {
  estado: EstadoProforma
  label: string
  desc: string
  headerBg: string
  colBg: string
  border: string
}[] = [
  {
    estado:    'Pendiente',
    label:     'Por confirmar',
    desc:      'Esperando pago del 50%',
    headerBg:  'bg-warning-600',
    colBg:     'bg-warning-50',
    border:    'border-warning-200',
  },
  {
    estado:    'Definitiva',
    label:     'En producción',
    desc:      'Confirmadas — a preparar',
    headerBg:  'bg-primary-800',
    colBg:     'bg-primary-50/40',
    border:    'border-primary-200',
  },
  {
    estado:    'Cerrada',
    label:     'Completadas',
    desc:      'Entregadas y cobradas',
    headerBg:  'bg-success-600',
    colBg:     'bg-success-50/40',
    border:    'border-success-200',
  },
]

// ─── Componente principal ─────────────────────────────────────────────────────

export function ProduccionDashboard() {
  const [tab, setTab] = useState<'kanban' | 'plan'>('kanban')

  const { data: proformas = [], isLoading } = useQuery({
    queryKey: ['proformas'],
    queryFn: () => proformasApi.list().then((r) => r.data),
  })

  // Métricas
  const hoy = new Date().toDateString()
  const entregasHoy    = (proformas as Proforma[]).filter(
    (p) => p.fecha_entrega && new Date(p.fecha_entrega).toDateString() === hoy && p.estado !== 'Cerrada'
  ).length
  const estaSemanaCut  = new Date(); estaSemanaCut.setDate(estaSemanaCut.getDate() + 7)
  const entregasSemana = (proformas as Proforma[]).filter(
    (p) => p.fecha_entrega && new Date(p.fecha_entrega) <= estaSemanaCut && p.estado === 'Definitiva'
  ).length
  const enProduccion   = (proformas as Proforma[]).filter((p) => p.estado === 'Definitiva').length
  const pendientes     = (proformas as Proforma[]).filter((p) => p.estado === 'Pendiente').length

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Producción</h1>
        <p className="text-sm text-neutral-500">Tablero de pedidos y plan de ingredientes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Entregas hoy"
          value={entregasHoy}
          icon="📅"
          alert={entregasHoy > 0}
          alertText="¡Urgente!"
        />
        <StatCard label="Esta semana" value={entregasSemana} icon="📆" />
        <StatCard
          label="En producción"
          value={enProduccion}
          icon="🧁"
          highlight={enProduccion > 0}
        />
        <StatCard label="Por confirmar" value={pendientes} icon="⏳" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-neutral-200 bg-white p-1 w-fit">
        {[
          { key: 'kanban', label: '⊞  Tablero Kanban' },
          { key: 'plan',   label: '📋  Plan de producción' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as 'kanban' | 'plan')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-primary-800 text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenido por tab */}
      {tab === 'kanban' ? (
        <KanbanBoard proformas={proformas as Proforma[]} />
      ) : (
        <PlanProduccion proformas={proformas as Proforma[]} />
      )}
    </div>
  )
}

// ─── Kanban Board ─────────────────────────────────────────────────────────────

function KanbanBoard({ proformas }: { proformas: Proforma[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {COLUMNAS.map((col) => {
        const items = proformas
          .filter((p) => p.estado === col.estado)
          .sort((a, b) => {
            if (!a.fecha_entrega) return 1
            if (!b.fecha_entrega) return -1
            return new Date(a.fecha_entrega).getTime() - new Date(b.fecha_entrega).getTime()
          })

        return (
          <div key={col.estado} className={`flex flex-col rounded-xl border ${col.border} ${col.colBg} overflow-hidden`}>
            {/* Header de columna */}
            <div className={`${col.headerBg} px-4 py-3 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{col.label}</h3>
                  <p className="mt-0.5 text-xs text-white/70">{col.desc}</p>
                </div>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                  {items.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              {items.length === 0 ? (
                <div className="py-10 text-center text-sm text-neutral-400">
                  Sin pedidos aquí
                </div>
              ) : (
                items.map((p) => <ProformaCard key={p.id} proforma={p} />)
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Proforma Kanban Card ─────────────────────────────────────────────────────

function ProformaCard({ proforma }: { proforma: Proforma }) {
  const [expanded, setExpanded] = useState(false)

  const hoy = new Date()
  const fechaEntrega = proforma.fecha_entrega ? new Date(proforma.fecha_entrega) : null
  const diasRestantes = fechaEntrega
    ? Math.ceil((fechaEntrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    : null

  const urgente = diasRestantes !== null && diasRestantes <= 1 && proforma.estado !== 'Cerrada'
  const proximo = diasRestantes !== null && diasRestantes <= 3 && diasRestantes > 1 && proforma.estado !== 'Cerrada'

  const pagosTotal = (proforma.pagos ?? []).reduce((a, p) => a + p.monto, 0)
  const pctPagado  = proforma.total > 0 ? (pagosTotal / proforma.total) * 100 : 0

  return (
    <div className={`rounded-lg border bg-white shadow-sm transition-all hover:shadow-md ${
      urgente ? 'border-error-400' : proximo ? 'border-warning-300' : 'border-neutral-200'
    }`}>
      {/* Franja urgente */}
      {urgente && (
        <div className="rounded-t-lg bg-error-600 px-3 py-1 text-center text-xs font-bold uppercase tracking-wider text-white">
          🔴 Entrega hoy{diasRestantes === 0 ? ' o vencida' : ''}
        </div>
      )}
      {proximo && (
        <div className="rounded-t-lg bg-warning-500 px-3 py-1 text-center text-xs font-semibold text-white">
          ⚠ Entrega en {diasRestantes}d
        </div>
      )}

      <div className="p-4">
        {/* Número + estado */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold text-neutral-400">{proforma.numero}</p>
            <p className="mt-0.5 truncate font-semibold text-neutral-800">
              {proforma.cliente.nombre}
            </p>
          </div>
          <EstadoBadge estado={proforma.estado} />
        </div>

        {/* Fecha de entrega */}
        {fechaEntrega && (
          <div className={`mt-2 flex items-center gap-1.5 text-xs ${urgente ? 'text-error-600 font-semibold' : proximo ? 'text-warning-600' : 'text-neutral-500'}`}>
            <span>📅</span>
            <span>
              {fechaEntrega.toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric', month: 'short' })}
              {diasRestantes !== null && (
                <span className="ml-1 font-semibold">
                  ({diasRestantes === 0 ? 'hoy' : diasRestantes < 0 ? `hace ${Math.abs(diasRestantes)}d` : `en ${diasRestantes}d`})
                </span>
              )}
            </span>
          </div>
        )}

        {/* Total + barra de pago */}
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary-800">${proforma.total.toFixed(2)}</span>
            <span className="text-xs text-neutral-500">{pctPagado.toFixed(0)}% pagado</span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                pctPagado >= 100 ? 'bg-success-500' : pctPagado >= 50 ? 'bg-info-500' : 'bg-warning-400'
              }`}
              style={{ width: `${Math.min(100, pctPagado)}%` }}
            />
          </div>
        </div>

        {/* Botón expandir receta */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex w-full items-center justify-between rounded-md border border-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-50 transition-colors"
        >
          <span>
            {proforma.detalles?.length ?? 0} producto(s) · Ver receta
          </span>
          <span className="text-neutral-400">{expanded ? '▲' : '▼'}</span>
        </button>

        {/* Detalle expandible */}
        {expanded && (
          <div className="mt-2 space-y-1.5 rounded-lg bg-neutral-50 p-3">
            {!proforma.detalles?.length ? (
              <p className="text-xs text-neutral-400">Sin detalle</p>
            ) : (
              proforma.detalles.map((d: DetalleProforma) => (
                <div key={d.id} className="flex items-center justify-between text-xs">
                  <span className="text-neutral-700">{d.producto.nombre}</span>
                  <span className="rounded-full bg-primary-100 px-2 py-0.5 font-semibold text-primary-800">
                    × {d.cantidad}
                  </span>
                </div>
              ))
            )}
            {proforma.notas && (
              <div className="mt-1 rounded bg-brand-cream px-2 py-1.5 text-xs text-neutral-600">
                📝 {proforma.notas}
              </div>
            )}
            <Link
              to={`/proformas/${proforma.id}`}
              className="mt-1 block text-center text-xs font-medium text-primary-800 hover:underline"
            >
              Ver proforma completa →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Plan de Producción ───────────────────────────────────────────────────────

function PlanProduccion({ proformas }: { proformas: Proforma[] }) {
  const definitivas = proformas.filter((p) => p.estado === 'Definitiva')

  // IDs únicos de productos en proformas confirmadas
  const productosIds = useMemo(() => {
    const ids = new Set<number>()
    definitivas.forEach((p) => p.detalles?.forEach((d) => ids.add(d.producto.id)))
    return Array.from(ids)
  }, [definitivas])

  const { data: insumos = [] } = useQuery({
    queryKey: ['insumos'],
    queryFn: () => insumosApi.list().then((r) => r.data),
  })

  // Fetch BOM de cada producto confirmado en paralelo
  const bomsQueries = useQuery({
    queryKey: ['boms-produccion', productosIds],
    queryFn: async () => {
      if (productosIds.length === 0) return {}
      const results = await Promise.all(
        productosIds.map((id) =>
          productosApi.getBOM(id).then((r) => ({ id, bom: r.data as RecetaBOM[] }))
        )
      )
      return Object.fromEntries(results.map(({ id, bom }) => [id, bom]))
    },
    enabled: productosIds.length > 0,
  })

  const necesidades = useMemo<NecesidadIngrediente[]>(() => {
    const boms = bomsQueries.data ?? {}
    const totales: Record<number, number> = {}

    definitivas.forEach((proforma) => {
      proforma.detalles?.forEach((detalle) => {
        const bom = boms[detalle.producto.id] ?? []
        bom.forEach((item: RecetaBOM) => {
          const cantTotal = item.cantidad_requerida * detalle.cantidad
          totales[item.insumo.id] = (totales[item.insumo.id] ?? 0) + cantTotal
        })
      })
    })

    return Object.entries(totales).map(([insumoIdStr, cantidadNecesaria]) => {
      const insumoId = Number(insumoIdStr)
      const insumo = (insumos as Insumo[]).find((i) => i.id === insumoId)
      if (!insumo) return null
      const stockActual  = insumo.stock_actual
      const suficiente   = stockActual >= cantidadNecesaria
      const deficit      = suficiente ? 0 : cantidadNecesaria - stockActual
      return { insumo, cantidadNecesaria, stockActual, suficiente, deficit }
    })
      .filter(Boolean)
      .sort((a, b) => (a!.suficiente === b!.suficiente ? 0 : a!.suficiente ? 1 : -1)) as NecesidadIngrediente[]
  }, [bomsQueries.data, definitivas, insumos])

  if (definitivas.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-neutral-200 bg-white py-20 text-neutral-400 shadow-sm">
        <span className="mb-3 text-5xl">📋</span>
        <p className="font-semibold">Sin proformas en producción</p>
        <p className="mt-1 text-sm">El plan se genera con las proformas en estado <strong>Definitiva</strong></p>
      </div>
    )
  }

  const faltantes   = necesidades.filter((n) => !n.suficiente)
  const disponibles = necesidades.filter((n) => n.suficiente)

  return (
    <div className="space-y-6">
      {/* Resumen del plan */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-neutral-800">
          Plan basado en {definitivas.length} proforma(s) confirmada(s)
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-neutral-50 p-3">
            <p className="text-2xl font-bold text-neutral-800">{necesidades.length}</p>
            <p className="text-xs text-neutral-500">Ingredientes requeridos</p>
          </div>
          <div className="rounded-lg bg-error-50 p-3">
            <p className="text-2xl font-bold text-error-600">{faltantes.length}</p>
            <p className="text-xs text-error-600">Con déficit de stock</p>
          </div>
          <div className="rounded-lg bg-success-50 p-3">
            <p className="text-2xl font-bold text-success-600">{disponibles.length}</p>
            <p className="text-xs text-success-600">Stock suficiente</p>
          </div>
        </div>
      </div>

      {bomsQueries.isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : necesidades.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-400 shadow-sm">
          <p>No hay recetas BOM configuradas para los productos confirmados</p>
          <Link to="/inventario/productos" className="mt-2 block text-sm text-primary-800 hover:underline">
            Configurar recetas →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Faltantes primero */}
          {faltantes.length > 0 && (
            <div className="rounded-xl border border-error-300 bg-white shadow-sm overflow-hidden lg:col-span-2">
              <div className="border-b border-error-200 bg-error-50 px-6 py-4">
                <h3 className="font-semibold text-error-700">
                  ⚠ Ingredientes insuficientes — requieren compra
                </h3>
              </div>
              <div className="divide-y divide-neutral-100">
                {faltantes.map((n) => (
                  <IngredienteRow key={n.insumo.id} necesidad={n} />
                ))}
              </div>
            </div>
          )}

          {/* Disponibles */}
          {disponibles.length > 0 && (
            <div className={`rounded-xl border border-success-200 bg-white shadow-sm overflow-hidden ${faltantes.length === 0 ? 'lg:col-span-2' : ''}`}>
              <div className="border-b border-success-200 bg-success-50 px-6 py-4">
                <h3 className="font-semibold text-success-700">
                  ✓ Stock disponible
                </h3>
              </div>
              <div className="divide-y divide-neutral-100">
                {disponibles.map((n) => (
                  <IngredienteRow key={n.insumo.id} necesidad={n} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Proformas incluidas en el plan */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-neutral-100 px-6 py-4">
          <h3 className="font-semibold text-neutral-800">Proformas incluidas en el plan</h3>
        </div>
        <div className="divide-y divide-neutral-100">
          {definitivas.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-6 py-3">
              <div>
                <p className="font-medium text-neutral-800">{p.numero} — {p.cliente.nombre}</p>
                <p className="text-xs text-neutral-500">
                  {p.detalles?.length ?? 0} producto(s)
                  {p.fecha_entrega && (
                    <> · Entrega: {new Date(p.fecha_entrega).toLocaleDateString('es-EC', { dateStyle: 'medium' })}</>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-primary-800">${p.total.toFixed(2)}</span>
                <Link to={`/proformas/${p.id}`} className="text-xs text-primary-800 hover:underline">Ver →</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Fila de ingrediente ──────────────────────────────────────────────────────

function IngredienteRow({ necesidad }: { necesidad: NecesidadIngrediente }) {
  const { insumo, cantidadNecesaria, stockActual, suficiente, deficit } = necesidad
  const pct = Math.min(100, (stockActual / cantidadNecesaria) * 100)

  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
        suficiente ? 'bg-success-100 text-success-700' : 'bg-error-100 text-error-700'
      }`}>
        {suficiente ? '✓' : '!'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-neutral-800 truncate">{insumo.nombre}</p>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-neutral-700">
              Necesita: {cantidadNecesaria.toFixed(1)} {insumo.unidad}
            </p>
            <p className={`text-xs ${suficiente ? 'text-success-600' : 'text-error-600'}`}>
              {suficiente
                ? `Stock: ${stockActual.toFixed(1)} ${insumo.unidad}`
                : `Falta: ${deficit.toFixed(1)} ${insumo.unidad}`}
            </p>
          </div>
        </div>
        {/* Barra de stock */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
          <div
            className={`h-full rounded-full ${suficiente ? 'bg-success-500' : 'bg-error-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon, alert, alertText, highlight,
}: {
  label: string; value: number; icon: string
  alert?: boolean; alertText?: string; highlight?: boolean
}) {
  return (
    <div className={`rounded-xl border bg-white p-5 shadow-sm ${alert ? 'border-error-300' : 'border-neutral-200'}`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`mt-3 text-3xl font-bold ${
        alert && value > 0 ? 'text-error-600' : highlight ? 'text-primary-800' : 'text-neutral-900'
      }`}>
        {value}
      </p>
      {alert && value > 0 && alertText && (
        <p className="mt-1 text-xs font-semibold text-error-600">{alertText}</p>
      )}
    </div>
  )
}
