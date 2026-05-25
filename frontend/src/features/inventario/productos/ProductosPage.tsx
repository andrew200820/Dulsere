import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productosApi, insumosApi } from '@/lib/api'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { InputField, TextareaField } from '@/components/ui/FormField'
import { Spinner } from '@/components/ui/Spinner'
import type { Producto } from '@/types/proformas'
import type { Insumo, RecetaBOM } from '@/types/inventario'

interface ProductoForm {
  nombre: string
  descripcion: string
  precio_venta: string
  unidad: string
}

const EMPTY: ProductoForm = { nombre: '', descripcion: '', precio_venta: '', unidad: '' }

export function ProductosPage() {
  const qc = useQueryClient()
  const [busqueda, setBusqueda]             = useState('')
  const [formOpen, setFormOpen]             = useState(false)
  const [editando, setEditando]             = useState<Producto | null>(null)
  const [bomModal, setBomModal]             = useState<Producto | null>(null)
  const [form, setForm]                     = useState<ProductoForm>(EMPTY)
  const [errors, setErrors]                 = useState<Partial<ProductoForm>>({})
  const [confirmDelete, setConfirmDelete]   = useState<Producto | null>(null)

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['productos'],
    queryFn: () => productosApi.list().then((r) => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        nombre:       form.nombre,
        descripcion:  form.descripcion || null,
        precio_venta: Number(form.precio_venta),
        unidad:       form.unidad,
      }
      return editando
        ? productosApi.update(editando.id, payload)
        : productosApi.create(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['productos'] }); closeForm() },
  })

  const toggleActivoMutation = useMutation({
    mutationFn: (p: Producto) => productosApi.update(p.id, { activo: !p.activo }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['productos'] }); setConfirmDelete(null) },
  })

  function openCreate() {
    setEditando(null); setForm(EMPTY); setErrors({}); setFormOpen(true)
  }
  function openEdit(p: Producto) {
    setEditando(p)
    setForm({ nombre: p.nombre, descripcion: p.descripcion ?? '', precio_venta: String(p.precio_venta), unidad: p.unidad ?? '' })
    setErrors({}); setFormOpen(true)
  }
  function closeForm() { setFormOpen(false); setEditando(null); setForm(EMPTY) }

  function validate() {
    const e: Partial<ProductoForm> = {}
    if (!form.nombre.trim())   e.nombre = 'El nombre es requerido'
    if (!form.precio_venta)    e.precio_venta = 'El precio es requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); if (validate()) saveMutation.mutate()
  }

  function set(k: keyof ProductoForm, v: string) {
    setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const filtrados = productos.filter((p: Producto) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Productos</h1>
          <p className="text-sm text-neutral-500">Catálogo de productos terminados</p>
        </div>
        <button onClick={openCreate} className="rounded-md bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-900 transition-colors shadow-xs">
          + Nuevo producto
        </button>
      </div>

      <input
        type="text" placeholder="Buscar producto..."
        value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
        className="w-full max-w-xs rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-300 focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800"
      />

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtrados.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <p className="font-medium">Sin productos{busqueda ? ` para "${busqueda}"` : ''}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-800 text-left text-xs font-semibold uppercase tracking-wider text-white">
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3 text-right">Precio venta</th>
                <th className="px-6 py-3">Unidad</th>
                <th className="px-6 py-3 text-center">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p: Producto, i: number) => (
                <tr key={p.id} className={`border-b border-neutral-100 hover:bg-primary-50 transition-colors ${i % 2 === 1 ? 'bg-neutral-50/60' : 'bg-white'}`}>
                  <td className="px-6 py-3">
                    <p className="font-medium text-neutral-800">{p.nombre}</p>
                    {p.descripcion && <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{p.descripcion}</p>}
                  </td>
                  <td className="px-6 py-3 text-right font-semibold text-primary-800">${p.precio_venta.toFixed(2)}</td>
                  <td className="px-6 py-3 text-neutral-600">{p.unidad || '—'}</td>
                  <td className="px-6 py-3 text-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.activo ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-500'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setBomModal(p)} className="rounded px-2.5 py-1 text-xs font-medium text-info-600 hover:bg-info-50 transition-colors">
                        Receta
                      </button>
                      <button onClick={() => openEdit(p)} className="rounded px-2.5 py-1 text-xs font-medium text-primary-800 hover:bg-primary-50 transition-colors">
                        Editar
                      </button>
                      <button onClick={() => setConfirmDelete(p)} className="rounded px-2.5 py-1 text-xs font-medium text-error-600 hover:bg-error-50 transition-colors">
                        {p.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal crear/editar */}
      <Modal
        open={formOpen} onClose={closeForm}
        title={editando ? `Editar — ${editando.nombre}` : 'Nuevo producto'}
        size="sm"
        footer={
          <>
            <button onClick={closeForm} className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Cancelar</button>
            <button onClick={handleSubmit} disabled={saveMutation.isPending} className="rounded-md bg-primary-800 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900 disabled:opacity-60">
              {saveMutation.isPending ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Nombre" required value={form.nombre} onChange={(e) => set('nombre', e.target.value)} error={errors.nombre} placeholder="Ej. Tabla de bocaditos" />
          <TextareaField label="Descripción" value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} placeholder="Descripción opcional..." />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Precio de venta" required type="number" min="0" step="0.01" value={form.precio_venta} onChange={(e) => set('precio_venta', e.target.value)} error={errors.precio_venta} />
            <InputField label="Unidad" value={form.unidad} onChange={(e) => set('unidad', e.target.value)} placeholder="Ej. unidad, porción" />
          </div>
        </form>
      </Modal>

      {/* Modal BOM / Receta */}
      {bomModal && <BOMModal producto={bomModal} onClose={() => setBomModal(null)} />}

      {/* Confirm toggle activo */}
      <ConfirmModal
        open={!!confirmDelete} onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && toggleActivoMutation.mutate(confirmDelete)}
        title={confirmDelete?.activo ? 'Desactivar producto' : 'Activar producto'}
        description={`¿${confirmDelete?.activo ? 'Desactivar' : 'Activar'} "${confirmDelete?.nombre}"?`}
        confirmLabel={confirmDelete?.activo ? 'Desactivar' : 'Activar'}
        danger={confirmDelete?.activo}
        loading={toggleActivoMutation.isPending}
      />
    </div>
  )
}

// Modal de receta BOM
function BOMModal({ producto, onClose }: { producto: Producto; onClose: () => void }) {
  const qc = useQueryClient()
  const [nuevoInsumoId, setNuevoInsumoId] = useState('')
  const [nuevaCantidad, setNuevaCantidad] = useState('')

  const { data: insumos = [] } = useQuery({
    queryKey: ['insumos'],
    queryFn: () => insumosApi.list().then((r) => r.data),
  })

  const { data: bom = [], isLoading } = useQuery({
    queryKey: ['bom', producto.id],
    queryFn: () => productosApi.getBOM(producto.id).then((r) => r.data),
  })

  const addMutation = useMutation({
    mutationFn: () => productosApi.addBOM(producto.id, { insumo_id: Number(nuevoInsumoId), cantidad_requerida: Number(nuevaCantidad) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bom', producto.id] }); setNuevoInsumoId(''); setNuevaCantidad('') },
  })

  const removeMutation = useMutation({
    mutationFn: (bomId: number) => productosApi.removeBOM(producto.id, bomId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bom', producto.id] }),
  })

  const insumoOptions = (insumos as Insumo[]).filter((i) => i.activo)

  return (
    <Modal open onClose={onClose} title={`Receta — ${producto.nombre}`} size="md">
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="space-y-4">
          {/* Ingredientes actuales */}
          {bom.length === 0 ? (
            <p className="py-4 text-center text-sm text-neutral-400">Sin ingredientes registrados</p>
          ) : (
            <div className="space-y-2">
              {(bom as RecetaBOM[]).map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{b.insumo.nombre}</p>
                    <p className="text-xs text-neutral-500">{b.cantidad_requerida} {b.insumo.unidad}</p>
                  </div>
                  <button onClick={() => removeMutation.mutate(b.id)} className="text-xs text-error-600 hover:text-error-800">✕ Quitar</button>
                </div>
              ))}
            </div>
          )}

          {/* Agregar ingrediente */}
          <div className="border-t border-neutral-100 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Agregar ingrediente</p>
            <div className="flex gap-2">
              <select
                value={nuevoInsumoId}
                onChange={(e) => setNuevoInsumoId(e.target.value)}
                className="flex-1 rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none"
              >
                <option value="">Seleccionar insumo...</option>
                {insumoOptions.map((i: Insumo) => (
                  <option key={i.id} value={i.id}>{i.nombre} ({i.unidad})</option>
                ))}
              </select>
              <input
                type="number" min="0.01" step="0.01" placeholder="Cant."
                value={nuevaCantidad} onChange={(e) => setNuevaCantidad(e.target.value)}
                className="w-24 rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none"
              />
              <button
                onClick={() => addMutation.mutate()}
                disabled={!nuevoInsumoId || !nuevaCantidad || addMutation.isPending}
                className="rounded-md bg-primary-800 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900 disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
