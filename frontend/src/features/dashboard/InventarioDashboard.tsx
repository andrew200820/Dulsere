import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { insumosApi, movimientosApi } from '@/lib/api'
import { Spinner } from '@/components/ui/Spinner'
import type { Insumo, MovimientoInventario } from '@/types/inventario'

export function InventarioDashboard() {
  const { data: insumos = [], isLoading } = useQuery({
    queryKey: ['insumos'],
    queryFn: () => insumosApi.list().then((r) => r.data),
  })

  const { data: movimientos = [] } = useQuery({
    queryKey: ['movimientos'],
    queryFn: () => movimientosApi.list().then((r) => r.data),
  })

  const criticos = insumos.filter((i: Insumo) => i.stock_actual <= i.stock_minimo)
  const totalActivos = insumos.filter((i: Insumo) => i.activo).length
  const ultimosMovimientos = [...movimientos]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Inventario</h1>
          <p className="text-sm text-neutral-500">Estado del stock y auditoría IA</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/inventario/movimientos"
            className="rounded-md border border-primary-800 px-4 py-2 text-sm font-semibold text-primary-800 hover:bg-primary-50 transition-colors"
          >
            + Registrar movimiento
          </Link>
        </div>
      </div>

      {/* Métricas */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StockCard label="Total insumos" value={totalActivos} icon="◉" />
          <StockCard
            label="Bajo mínimo"
            value={criticos.length}
            icon="⚠"
            alert={criticos.length > 0}
          />
          <StockCard
            label="Movimientos hoy"
            value={movimientos.filter((m: MovimientoInventario) =>
              new Date(m.fecha).toDateString() === new Date().toDateString()
            ).length}
            icon="⇅"
          />
          <StockCard label="Insumos activos" value={totalActivos} icon="◎" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Insumos críticos */}
        <div className="rounded-xl border border-warning-400 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-warning-200 bg-warning-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-warning-700">⚠ Insumos bajo mínimo</h2>
              <Link to="/inventario/insumos" className="text-sm text-warning-700 hover:underline">
                Ver todos →
              </Link>
            </div>
          </div>

          {criticos.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-400">
              ✓ Todo el stock está en orden
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {criticos.map((insumo: Insumo) => (
                <div key={insumo.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{insumo.nombre}</p>
                    <p className="text-xs text-neutral-500">
                      Mínimo: {insumo.stock_minimo} {insumo.unidad}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-error-600">
                      {insumo.stock_actual} {insumo.unidad}
                    </p>
                    <div className="mt-1 h-1.5 w-24 rounded-full bg-neutral-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-error-500"
                        style={{ width: `${Math.min(100, (insumo.stock_actual / insumo.stock_minimo) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Auditoría Vision IA + Últimos movimientos */}
        <div className="space-y-6">
          <VisionAuditCard />

          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-neutral-100 px-6 py-4">
              <h2 className="font-semibold text-neutral-800">Últimos movimientos</h2>
            </div>
            {ultimosMovimientos.length === 0 ? (
              <div className="py-8 text-center text-sm text-neutral-400">Sin movimientos aún</div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {ultimosMovimientos.map((m: MovimientoInventario) => (
                  <div key={m.id} className="flex items-center gap-3 px-6 py-3">
                    <span className={`text-lg font-bold ${
                      m.tipo === 'Entrada' ? 'text-success-600' :
                      m.tipo === 'Salida'  ? 'text-error-600'   : 'text-info-600'
                    }`}>
                      {m.tipo === 'Entrada' ? '↑' : m.tipo === 'Salida' ? '↓' : '~'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-800">
                        {m.insumo.nombre}
                      </p>
                      <p className="text-xs text-neutral-500">{m.usuario?.nombre}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-neutral-700">
                        {m.cantidad} {m.insumo.unidad}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {new Date(m.fecha).toLocaleDateString('es-EC')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function VisionAuditCard() {
  const [result, setResult] = useState<{ nombre: string; cantidad: number; unidad: string }[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const auditMutation = useMutation({
    mutationFn: (base64: string) => movimientosApi.visionAudit(base64),
    onSuccess: (res) => setResult(res.data.insumos),
  })

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(',')[1]
      setPreview(ev.target?.result as string)
      auditMutation.mutate(base64)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-neutral-100 px-6 py-4">
        <h2 className="font-semibold text-neutral-800">✨ Auditoría Vision IA</h2>
        <p className="mt-0.5 text-xs text-neutral-500">
          Sube una foto del inventario y la IA detecta los insumos
        </p>
      </div>

      <div className="p-6">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        {!preview ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-neutral-200 py-8 hover:border-primary-400 hover:bg-primary-50 transition-colors"
          >
            <span className="text-3xl text-neutral-300">📷</span>
            <span className="text-sm font-medium text-neutral-500">Subir imagen</span>
            <span className="text-xs text-neutral-400">PNG, JPG hasta 10MB</span>
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-3">
              <img src={preview} alt="Preview" className="h-24 w-24 rounded-lg object-cover border border-neutral-200" />
              <button
                onClick={() => { setPreview(null); setResult([]) }}
                className="self-start text-xs text-neutral-400 hover:text-error-600"
              >
                ✕ Cambiar
              </button>
            </div>

            {auditMutation.isPending && (
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Spinner size="sm" /> Analizando imagen...
              </div>
            )}

            {result.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Insumos detectados
                </p>
                <div className="space-y-1">
                  {result.map((item, i) => (
                    <div key={i} className="flex justify-between rounded-md bg-success-50 px-3 py-1.5 text-sm">
                      <span className="text-neutral-700">{item.nombre}</span>
                      <span className="font-medium text-success-700">
                        {item.cantidad} {item.unidad}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface StockCardProps {
  label: string
  value: number
  icon: string
  alert?: boolean
}

function StockCard({ label, value, icon, alert }: StockCardProps) {
  return (
    <div className={`rounded-xl border bg-white p-5 shadow-sm ${alert ? 'border-warning-400' : 'border-neutral-200'}`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
        <span className={`text-lg ${alert ? 'text-warning-600' : 'text-neutral-300'}`}>{icon}</span>
      </div>
      <p className={`mt-3 text-3xl font-bold ${alert && value > 0 ? 'text-warning-600' : 'text-neutral-900'}`}>
        {value}
      </p>
    </div>
  )
}
