import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { proformasApi, insumosApi } from '@/lib/api'
import { EstadoBadge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import type { Proforma } from '@/types/proformas'
import type { Insumo } from '@/types/inventario'

export function AdminDashboard() {
  const { data: proformas = [], isLoading: loadingP } = useQuery({
    queryKey: ['proformas'],
    queryFn: () => proformasApi.list().then((r) => r.data),
  })

  const { data: insumos = [] } = useQuery({
    queryKey: ['insumos'],
    queryFn: () => insumosApi.list().then((r) => r.data),
  })

  // Métricas derivadas del lado cliente
  const activas      = proformas.filter((p: Proforma) => p.estado !== 'Cerrada').length
  const ingresosMes  = proformas
    .filter((p: Proforma) => {
      const mes = new Date(p.fecha_emision).getMonth()
      return p.estado === 'Cerrada' && mes === new Date().getMonth()
    })
    .reduce((acc: number, p: Proforma) => acc + Number(p.total), 0)
  const entregas     = proformas.filter((p: Proforma) => p.estado === 'Definitiva').length
  const stockBajo    = insumos.filter((i: Insumo) => i.stock_actual <= i.stock_minimo).length

  const recientes = [...proformas]
    .sort((a, b) => new Date(b.fecha_emision).getTime() - new Date(a.fecha_emision).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-500">Vista general de ventas y operaciones</p>
        </div>
        <Link
          to="/proformas/nueva"
          className="rounded-md bg-primary-800 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900 transition-colors"
        >
          + Nueva proforma
        </Link>
      </div>

      {/* Métricas */}
      {loadingP ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard label="Proformas activas"   value={activas}                   icon="◻" to="/proformas" />
          <MetricCard label="Ingresos del mes"    value={`$${ingresosMes.toFixed(2)}`} icon="$" highlight to="/proformas" />
          <MetricCard label="Pendientes de entrega" value={entregas}                icon="◷" to="/proformas" />
          <MetricCard label="Insumos bajo mínimo" value={stockBajo}                 icon="⚠" alert={stockBajo > 0} to="/inventario/insumos" />
        </div>
      )}

      {/* Tabla proformas recientes */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="font-semibold text-neutral-800">Proformas recientes</h2>
          <Link to="/proformas" className="text-sm text-primary-800 hover:underline">
            Ver todas →
          </Link>
        </div>

        {recientes.length === 0 ? (
          <div className="py-16 text-center text-sm text-neutral-400">
            Aún no hay proformas
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-800 text-left text-xs font-semibold uppercase tracking-wider text-white">
                <th className="px-6 py-3">N°</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {recientes.map((p: Proforma, i: number) => (
                <tr
                  key={p.id}
                  className={`border-b border-neutral-100 hover:bg-primary-50 transition-colors ${i % 2 === 1 ? 'bg-neutral-50' : 'bg-white'}`}
                >
                  <td className="px-6 py-3 font-medium text-neutral-800">#{p.id}</td>
                  <td className="px-6 py-3 text-neutral-700">{p.cliente.nombre}</td>
                  <td className="px-6 py-3 font-semibold text-primary-800">${Number(p.total).toFixed(2)}</td>
                  <td className="px-6 py-3"><EstadoBadge estado={p.estado} /></td>
                  <td className="px-6 py-3 text-neutral-500">
                    {new Date(p.fecha_emision).toLocaleDateString('es-EC')}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link to={`/proformas/${p.id}`} className="text-primary-800 hover:underline">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string | number
  icon: string
  highlight?: boolean
  alert?: boolean
  to?: string
}

function MetricCard({ label, value, icon, highlight, alert, to }: MetricCardProps) {
  const inner = (
    <div className={`rounded-xl border bg-white p-5 shadow-sm transition-shadow ${alert ? 'border-warning-400' : 'border-neutral-200'} ${to ? 'hover:shadow-md cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
        <span className={`text-lg ${alert ? 'text-warning-600' : 'text-neutral-300'}`}>{icon}</span>
      </div>
      <p className={`mt-3 text-3xl font-bold ${highlight ? 'text-primary-800' : alert ? 'text-warning-600' : 'text-neutral-900'}`}>
        {value}
      </p>
      {alert && (
        <p className="mt-1 text-xs text-warning-600">Requiere atención</p>
      )}
    </div>
  )

  return to ? <Link to={to}>{inner}</Link> : inner
}
