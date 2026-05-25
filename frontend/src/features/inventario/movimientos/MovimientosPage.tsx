import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { insumosApi, movimientosApi } from '@/lib/api'
import { Modal } from '@/components/ui/Modal'
import { InputField, TextareaField } from '@/components/ui/FormField'
import { Spinner } from '@/components/ui/Spinner'
import type { Insumo, MovimientoInventario } from '@/types/inventario'

type TipoMovimiento = 'Entrada' | 'Salida' | 'Ajuste'

const TIPO_CONFIG = {
  Entrada: { color: 'text-success-600', bg: 'bg-success-50',  icon: '↑', badge: 'bg-success-100 text-success-700' },
  Salida:  { color: 'text-error-600',   bg: 'bg-error-50',    icon: '↓', badge: 'bg-error-100   text-error-700'   },
  Ajuste:  { color: 'text-info-600',    bg: 'bg-info-50',     icon: '~', badge: 'bg-info-100    text-info-700'    },
}

interface MovForm {
  insumo_id: string
  tipo: TipoMovimiento
  cantidad: string
  motivo: string
  fecha: string
}

export function MovimientosPage() {
  const qc = useQueryClient()
  const [filtroTipo, setFiltroTipo] = useState<TipoMovimiento | 'Todos'>('Todos')
  const [modalOpen, setModalOpen]   = useState(false)
  const [form, setForm]             = useState<MovForm>({
    insumo_id: '', tipo: 'Entrada', cantidad: '', motivo: '',
    fecha: new Date().toISOString().split('T')[0],
  })
  const [errors, setErrors] = useState<Partial<MovForm>>({})

  const { data: movimientos = [], isLoading } = useQuery({
    queryKey: ['movimientos'],
    queryFn: () => movimientosApi.list().then((r) => r.data),
  })

  const { data: insumos = [] } = useQuery({
    queryKey: ['insumos'],
    queryFn: () => insumosApi.list().then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      movimientosApi.create({
        insumoId:        Number(form.insumo_id),
        tipoMovimiento:  form.tipo,
        cantidad:        Number(form.cantidad),
        motivo:          form.motivo || 'Sin motivo',
        fecha:           form.fecha,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movimientos'] })
      qc.invalidateQueries({ queryKey: ['insumos'] })
      setModalOpen(false)
      setForm({ insumo_id: '', tipo: 'Entrada', cantidad: '', motivo: '', fecha: new Date().toISOString().split('T')[0] })
    },
  })

  function validate() {
    const e: Partial<MovForm> = {}
    if (!form.insumo_id) e.insumo_id = 'Selecciona un insumo'
    if (!form.cantidad)  e.cantidad  = 'La cantidad es requerida'
    if (!form.fecha)     e.fecha     = 'La fecha es requerida'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); if (validate()) createMutation.mutate()
  }

  function set(k: keyof MovForm, v: string) {
    setForm((f) => ({ ...f, [k]: v })); setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const filtrados = (movimientos as MovimientoInventario[]).filter((m) =>
    filtroTipo === 'Todos' || m.tipo_movimiento === filtroTipo
  )

  const resumen = {
    entradas: movimientos.filter((m: MovimientoInventario) => m.tipo_movimiento === 'Entrada').length,
    salidas:  movimientos.filter((m: MovimientoInventario) => m.tipo_movimiento === 'Salida').length,
    ajustes:  movimientos.filter((m: MovimientoInventario) => m.tipo_movimiento === 'Ajuste').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Movimientos</h1>
          <p className="text-sm text-neutral-500">Kardex de entradas, salidas y ajustes</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-md bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-900 transition-colors shadow-xs"
        >
          + Registrar movimiento
        </button>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-3 gap-4">
        {(Object.entries(resumen) as [string, number][]).map(([key, val]) => {
          const tipo = key === 'entradas' ? 'Entrada' : key === 'salidas' ? 'Salida' : 'Ajuste'
          const cfg  = TIPO_CONFIG[tipo as TipoMovimiento]
          return (
            <div key={key} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${cfg.color}`}>{cfg.icon}</span>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 capitalize">{key}</p>
              </div>
              <p className="mt-2 text-3xl font-bold text-neutral-900">{val}</p>
            </div>
          )
        })}
      </div>

      {/* Filtro de tipo */}
      <div className="flex gap-2">
        {(['Todos', 'Entrada', 'Salida', 'Ajuste'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFiltroTipo(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filtroTipo === t
                ? 'bg-primary-800 text-white'
                : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtrados.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <p className="font-medium">Sin movimientos registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-800 text-left text-xs font-semibold uppercase tracking-wider text-white">
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Insumo</th>
                <th className="px-6 py-3 text-right">Cantidad</th>
                <th className="px-6 py-3">Motivo</th>
                <th className="px-6 py-3">Usuario</th>
                <th className="px-6 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((m: MovimientoInventario, i: number) => {
                const cfg = TIPO_CONFIG[m.tipo_movimiento]
                return (
                  <tr key={m.id} className={`border-b border-neutral-100 hover:bg-primary-50 transition-colors ${i % 2 === 1 ? 'bg-neutral-50/60' : 'bg-white'}`}>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}>
                        {cfg.icon} {m.tipo_movimiento}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-medium text-neutral-800">{m.insumo.nombre}</td>
                    <td className={`px-6 py-3 text-right font-semibold ${cfg.color}`}>
                      {m.tipo_movimiento === 'Salida' ? '-' : '+'}{m.cantidad} {m.insumo.unidad_medida}
                    </td>
                    <td className="px-6 py-3 text-neutral-600">{m.motivo ?? <span className="text-neutral-300">—</span>}</td>
                    <td className="px-6 py-3 text-neutral-500">{m.usuario?.nombre ?? '—'}</td>
                    <td className="px-6 py-3 text-neutral-500">
                      {new Date(m.created_at).toLocaleDateString('es-EC', { dateStyle: 'medium' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal registrar movimiento */}
      <Modal
        open={modalOpen} onClose={() => setModalOpen(false)}
        title="Registrar movimiento" size="sm"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Cancelar</button>
            <button onClick={handleSubmit} disabled={createMutation.isPending} className="rounded-md bg-primary-800 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900 disabled:opacity-60">
              {createMutation.isPending ? 'Guardando...' : 'Registrar'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-700">Tipo de movimiento <span className="text-primary-800">*</span></p>
            <div className="grid grid-cols-3 gap-2">
              {(['Entrada', 'Salida', 'Ajuste'] as TipoMovimiento[]).map((t) => {
                const cfg = TIPO_CONFIG[t]
                return (
                  <button
                    key={t} type="button"
                    onClick={() => set('tipo', t)}
                    className={`flex flex-col items-center gap-1 rounded-lg border py-3 text-sm font-medium transition-colors ${
                      form.tipo === t ? `border-current ${cfg.bg} ${cfg.color}` : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-xl">{cfg.icon}</span>
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Insumo <span className="text-primary-800">*</span>
            </label>
            <select
              value={form.insumo_id}
              onChange={(e) => set('insumo_id', e.target.value)}
              className="w-full rounded-md border border-neutral-200 px-3 py-2.5 text-sm focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800"
            >
              <option value="">Seleccionar insumo...</option>
              {(insumos as Insumo[]).filter((i) => i.activo).map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nombre} — stock: {i.stock_actual} {i.unidad_medida}
                </option>
              ))}
            </select>
            {errors.insumo_id && <p className="mt-1 text-xs text-error-600">{errors.insumo_id}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Cantidad" required type="number" min="0.01" step="0.01"
              value={form.cantidad} onChange={(e) => set('cantidad', e.target.value)}
              error={errors.cantidad}
            />
            <InputField
              label="Fecha" required type="date"
              value={form.fecha} onChange={(e) => set('fecha', e.target.value)}
              error={errors.fecha}
            />
          </div>

          <TextareaField
            label="Motivo / referencia"
            value={form.motivo} onChange={(e) => set('motivo', e.target.value)}
            placeholder="Ej. Compra proveedor, pedido #12, conteo físico..."
          />
        </form>
      </Modal>
    </div>
  )
}