import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { insumosApi } from '@/lib/api'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { InputField, SelectField } from '@/components/ui/FormField'
import { Spinner } from '@/components/ui/Spinner'
import type { Insumo } from '@/types/inventario'

const UNIDADES = [
  { value: 'g',  label: 'Gramos (g)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'ud', label: 'Unidades (ud)' },
]

interface InsumoForm {
  nombre: string
  unidad: 'g' | 'ml' | 'ud'
  stock_actual: string
  stock_minimo: string
  precio_unitario: string
}

const EMPTY_FORM: InsumoForm = {
  nombre: '', unidad: 'g', stock_actual: '', stock_minimo: '', precio_unitario: '',
}

export function InsumosPage() {
  const qc = useQueryClient()
  const [busqueda, setBusqueda]       = useState('')
  const [formOpen, setFormOpen]       = useState(false)
  const [editando, setEditando]       = useState<Insumo | null>(null)
  const [form, setForm]               = useState<InsumoForm>(EMPTY_FORM)
  const [errors, setErrors]           = useState<Partial<InsumoForm>>({})
  const [confirmDelete, setConfirmDelete] = useState<Insumo | null>(null)

  const { data: insumos = [], isLoading } = useQuery({
    queryKey: ['insumos'],
    queryFn: () => insumosApi.list().then((r) => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        nombre:         form.nombre,
        unidadMedida:   form.unidad,
        stockActual:    Number(form.stock_actual),
        stockMinimo:    Number(form.stock_minimo),
        costoUnitario:  Number(form.precio_unitario),
      }
      return editando
        ? insumosApi.update(editando.id, payload)
        : insumosApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['insumos'] })
      closeForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => insumosApi.update(id, { activo: false }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['insumos'] })
      setConfirmDelete(null)
    },
  })

  function openCreate() {
    setEditando(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setFormOpen(true)
  }

  function openEdit(insumo: Insumo) {
    setEditando(insumo)
    setForm({
      nombre:          insumo.nombre,
      unidad:          insumo.unidad_medida as 'g' | 'ml' | 'ud',
      stock_actual:    String(insumo.stock_actual),
      stock_minimo:    String(insumo.stock_minimo),
      precio_unitario: String(insumo.costo_unitario),
    })
    setErrors({})
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditando(null)
    setForm(EMPTY_FORM)
  }

  function validate(): boolean {
    const e: Partial<InsumoForm> = {}
    if (!form.nombre.trim())       e.nombre = 'El nombre es requerido'
    if (!form.stock_actual)        e.stock_actual = 'Requerido'
    if (!form.stock_minimo)        e.stock_minimo = 'Requerido'
    if (!form.precio_unitario)     e.precio_unitario = 'Requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validate()) saveMutation.mutate()
  }

  function set(key: keyof InsumoForm, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const filtrados = insumos.filter((i: Insumo) =>
    i.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Insumos</h1>
          <p className="text-sm text-neutral-500">Materias primas y su stock</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-md bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-900 transition-colors shadow-xs"
        >
          + Nuevo insumo
        </button>
      </div>

      {/* Búsqueda */}
      <input
        type="text"
        placeholder="Buscar insumo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full max-w-xs rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-300 focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800"
      />

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtrados.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <p className="font-medium">Sin insumos{busqueda ? ` para "${busqueda}"` : ' registrados'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-800 text-left text-xs font-semibold uppercase tracking-wider text-white">
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Unidad</th>
                <th className="px-6 py-3 text-right">Stock actual</th>
                <th className="px-6 py-3 text-right">Stock mínimo</th>
                <th className="px-6 py-3 text-right">Precio</th>
                <th className="px-6 py-3 text-center">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((insumo: Insumo, i: number) => {
                const bajo = insumo.stock_actual <= insumo.stock_minimo
                return (
                  <tr
                    key={insumo.id}
                    className={`border-b border-neutral-100 transition-colors hover:bg-primary-50 ${i % 2 === 1 ? 'bg-neutral-50/60' : 'bg-white'}`}
                  >
                    <td className="px-6 py-3 font-medium text-neutral-800">{insumo.nombre}</td>
                    <td className="px-6 py-3 text-neutral-600 uppercase text-xs font-semibold">{insumo.unidad_medida}</td>
                    <td className={`px-6 py-3 text-right font-semibold ${bajo ? 'text-error-600' : 'text-neutral-800'}`}>
                      {insumo.stock_actual} {insumo.unidad_medida}
                      {bajo && <span className="ml-1 text-xs">⚠</span>}
                    </td>
                    <td className="px-6 py-3 text-right text-neutral-500">
                      {insumo.stock_minimo} {insumo.unidad_medida}
                    </td>
                    <td className="px-6 py-3 text-right text-neutral-700">
                      ${Number(insumo.costo_unitario).toFixed(4)}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${insumo.activo ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        {insumo.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(insumo)}
                          className="rounded px-2.5 py-1 text-xs font-medium text-primary-800 hover:bg-primary-50 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setConfirmDelete(insumo)}
                          className="rounded px-2.5 py-1 text-xs font-medium text-error-600 hover:bg-error-50 transition-colors"
                        >
                          Desactivar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal crear / editar */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editando ? `Editar — ${editando.nombre}` : 'Nuevo insumo'}
        size="sm"
        footer={
          <>
            <button onClick={closeForm} className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saveMutation.isPending}
              className="rounded-md bg-primary-800 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900 disabled:opacity-60"
            >
              {saveMutation.isPending ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear insumo'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Nombre" required
            value={form.nombre} onChange={(e) => set('nombre', e.target.value)}
            error={errors.nombre} placeholder="Ej. Harina de trigo"
          />
          <SelectField
            label="Unidad de medida" required
            value={form.unidad}
            onChange={(e) => set('unidad', e.target.value)}
            options={UNIDADES}
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Stock actual" required type="number" min="0" step="0.01"
              value={form.stock_actual} onChange={(e) => set('stock_actual', e.target.value)}
              error={errors.stock_actual}
            />
            <InputField
              label="Stock mínimo" required type="number" min="0" step="0.01"
              value={form.stock_minimo} onChange={(e) => set('stock_minimo', e.target.value)}
              error={errors.stock_minimo}
            />
          </div>
          <InputField
            label="Precio unitario" required type="number" min="0" step="0.0001"
            value={form.precio_unitario} onChange={(e) => set('precio_unitario', e.target.value)}
            error={errors.precio_unitario}
            hint="Precio por gramo, mililitro o unidad según corresponda"
          />
        </form>
      </Modal>

      {/* Modal confirmar desactivar */}
      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}
        title="Desactivar insumo"
        description={`¿Desactivar "${confirmDelete?.nombre}"? No se eliminará el historial de movimientos.`}
        confirmLabel="Desactivar"
        danger
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
