import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { proformasApi } from '@/lib/api'
import { EstadoBadge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import type { Proforma, EstadoProforma } from '@/types/proformas'

const FILTROS: { label: string; value: EstadoProforma | 'Todas' }[] = [
  { label: 'Todas',      value: 'Todas' },
  { label: 'Pendiente',  value: 'Pendiente' },
  { label: 'Definitiva', value: 'Definitiva' },
  { label: 'Cerrada',    value: 'Cerrada' },
]

export function ProformasListPage() {
  const [filtroEstado, setFiltroEstado] = useState<EstadoProforma | 'Todas'>('Todas')
  const [busqueda, setBusqueda] = useState('')

  const { data: proformas = [], isLoading } = useQuery({
    queryKey: ['proformas'],
    queryFn: () => proformasApi.list().then((r) => r.data),
  })

  const filtradas = proformas.filter((p: Proforma) => {
    const matchEstado = filtroEstado === 'Todas' || p.estado === filtroEstado
    const matchBusqueda =
      busqueda === '' ||
      p.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      String(p.id).includes(busqueda)
    return matchEstado && matchBusqueda
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Proformas</h1>
          <p className="text-sm text-neutral-500">{proformas.length} cotizaciones en total</p>
        </div>
        <Link
          to="/proformas/nueva"
          className="inline-flex items-center gap-2 rounded-md bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-900 transition-colors shadow-xs"
        >
          + Nueva proforma
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Búsqueda */}
        <input
          type="text"
          placeholder="Buscar por cliente o N°..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm
                     placeholder:text-neutral-300 focus:border-primary-800
                     focus:outline-none focus:ring-1 focus:ring-primary-800 sm:w-64"
        />

        {/* Tabs de estado */}
        <div className="flex rounded-md border border-neutral-200 bg-white overflow-hidden">
          {FILTROS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFiltroEstado(value)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filtroEstado === value
                  ? 'bg-primary-800 text-white'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtradas.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-neutral-400">
            <span className="mb-3 text-4xl">◻</span>
            <p className="font-medium">Aún no hay proformas</p>
            <p className="mt-1 text-sm">
              {busqueda || filtroEstado !== 'Todas'
                ? 'Prueba con otros filtros'
                : 'Crea tu primera proforma para comenzar'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary-800 text-left text-xs font-semibold uppercase tracking-wider text-white">
                  <th className="px-6 py-3">N° Proforma</th>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Emisión</th>
                  <th className="px-6 py-3">Entrega</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((p: Proforma, i: number) => (
                  <tr
                    key={p.id}
                    className={`border-b border-neutral-100 hover:bg-primary-50 transition-colors ${
                      i % 2 === 1 ? 'bg-neutral-50/60' : 'bg-white'
                    }`}
                  >
                    <td className="px-6 py-3 font-semibold text-neutral-800">#{p.id}</td>
                    <td className="px-6 py-3">
                      <p className="font-medium text-neutral-800">{p.cliente.nombre}</p>
                      <p className="text-xs text-neutral-500">{p.cliente.cedula_ruc}</p>
                    </td>
                    <td className="px-6 py-3 font-semibold text-primary-800">
                      ${p.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <EstadoBadge estado={p.estado} />
                    </td>
                    <td className="px-6 py-3 text-neutral-500">
                      {new Date(p.fecha_emision).toLocaleDateString('es-EC')}
                    </td>
                    <td className="px-6 py-3 text-neutral-500">
                      {p.fecha_entrega
                        ? new Date(p.fecha_entrega).toLocaleDateString('es-EC')
                        : <span className="text-neutral-300">—</span>}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        to={`/proformas/${p.id}`}
                        className="rounded-md border border-primary-600 px-3 py-1.5 text-xs font-medium text-primary-800 hover:bg-primary-50 transition-colors"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
