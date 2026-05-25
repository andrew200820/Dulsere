import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientesApi, proformasApi } from '@/lib/api'
import { Modal } from '@/components/ui/Modal'
import { InputField, TextareaField } from '@/components/ui/FormField'
import { EstadoBadge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import type { Cliente, Proforma } from '@/types/proformas'

interface ClienteForm {
  nombre: string
  cedula_ruc: string
  email: string
  telefono: string
  direccion_entrega: string
}

const EMPTY: ClienteForm = {
  nombre: '', cedula_ruc: '', email: '', telefono: '', direccion_entrega: '',
}

export function ClientesPage() {
  const qc = useQueryClient()
  const [busqueda, setBusqueda]           = useState('')
  const [formOpen, setFormOpen]           = useState(false)
  const [editando, setEditando]           = useState<Cliente | null>(null)
  const [historialCliente, setHistorial]  = useState<Cliente | null>(null)
  const [form, setForm]                   = useState<ClienteForm>(EMPTY)
  const [errors, setErrors]               = useState<Partial<ClienteForm>>({})

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clientesApi.list().then((r) => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        nombre:            form.nombre,
        cedula_ruc:        form.cedula_ruc,
        email:             form.email || null,
        telefono:          form.telefono || null,
        direccion_entrega: form.direccion_entrega || null,
      }
      return editando
        ? clientesApi.update(editando.id, payload)
        : clientesApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] })
      closeForm()
    },
  })

  function openCreate() {
    setEditando(null); setForm(EMPTY); setErrors({}); setFormOpen(true)
  }

  function openEdit(c: Cliente) {
    setEditando(c)
    setForm({
      nombre:            c.nombre,
      cedula_ruc:        c.cedula_ruc,
      email:             c.email ?? '',
      telefono:          c.telefono ?? '',
      direccion_entrega: c.direccion_entrega ?? '',
    })
    setErrors({}); setFormOpen(true)
  }

  function closeForm() { setFormOpen(false); setEditando(null); setForm(EMPTY) }

  function validate() {
    const e: Partial<ClienteForm> = {}
    if (!form.nombre.trim())     e.nombre = 'El nombre es requerido'
    if (!form.cedula_ruc.trim()) e.cedula_ruc = 'El RUC/Cédula es requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); if (validate()) saveMutation.mutate()
  }

  function set(k: keyof ClienteForm, v: string) {
    setForm((f) => ({ ...f, [k]: v })); setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const filtrados = (clientes as Cliente[]).filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.cedula_ruc.includes(busqueda) ||
    (c.email ?? '').toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Clientes</h1>
          <p className="text-sm text-neutral-500">{clientes.length} clientes registrados</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-md bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-900 transition-colors shadow-xs"
        >
          + Nuevo cliente
        </button>
      </div>

      {/* Búsqueda */}
      <input
        type="text"
        placeholder="Buscar por nombre, RUC/cédula o email..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full max-w-md rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm
                   placeholder:text-neutral-300 focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800"
      />

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-neutral-400">
            <span className="mb-3 text-4xl">◷</span>
            <p className="font-medium">
              {busqueda ? `Sin resultados para "${busqueda}"` : 'Aún no hay clientes'}
            </p>
            {!busqueda && (
              <button onClick={openCreate} className="mt-3 text-sm text-primary-800 hover:underline">
                Crear el primer cliente →
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-800 text-left text-xs font-semibold uppercase tracking-wider text-white">
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">RUC / Cédula</th>
                <th className="px-6 py-3">Contacto</th>
                <th className="px-6 py-3">Dirección</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c: Cliente, i: number) => (
                <tr
                  key={c.id}
                  className={`border-b border-neutral-100 hover:bg-primary-50 transition-colors ${i % 2 === 1 ? 'bg-neutral-50/60' : 'bg-white'}`}
                >
                  <td className="px-6 py-3 font-semibold text-neutral-800">{c.nombre}</td>
                  <td className="px-6 py-3 font-mono text-sm text-neutral-600">{c.cedula_ruc}</td>
                  <td className="px-6 py-3">
                    {c.telefono && <p className="text-neutral-700">{c.telefono}</p>}
                    {c.email && <p className="text-xs text-neutral-500">{c.email}</p>}
                    {!c.telefono && !c.email && <span className="text-neutral-300">—</span>}
                  </td>
                  <td className="px-6 py-3 text-neutral-600 max-w-[200px]">
                    <span className="line-clamp-1">{c.direccion_entrega ?? <span className="text-neutral-300">—</span>}</span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setHistorial(c)}
                        className="rounded px-2.5 py-1 text-xs font-medium text-info-600 hover:bg-info-50 transition-colors"
                      >
                        Historial
                      </button>
                      <button
                        onClick={() => openEdit(c)}
                        className="rounded px-2.5 py-1 text-xs font-medium text-primary-800 hover:bg-primary-50 transition-colors"
                      >
                        Editar
                      </button>
                      <a
                        href={`https://wa.me/${c.telefono?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`rounded px-2.5 py-1 text-xs font-medium text-success-600 hover:bg-success-50 transition-colors ${!c.telefono ? 'pointer-events-none opacity-30' : ''}`}
                      >
                        💬
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal crear / editar */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editando ? `Editar — ${editando.nombre}` : 'Nuevo cliente'}
        size="md"
        footer={
          <>
            <button
              onClick={closeForm}
              className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saveMutation.isPending}
              className="rounded-md bg-primary-800 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900 disabled:opacity-60"
            >
              {saveMutation.isPending ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear cliente'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Nombre completo" required
              value={form.nombre} onChange={(e) => set('nombre', e.target.value)}
              error={errors.nombre} placeholder="Ej. María García"
              className="col-span-2"
            />
            <InputField
              label="RUC / Cédula" required
              value={form.cedula_ruc} onChange={(e) => set('cedula_ruc', e.target.value)}
              error={errors.cedula_ruc} placeholder="0912345678001"
            />
            <InputField
              label="Teléfono"
              value={form.telefono} onChange={(e) => set('telefono', e.target.value)}
              placeholder="099 123 4567"
            />
            <InputField
              label="Email" type="email"
              value={form.email} onChange={(e) => set('email', e.target.value)}
              placeholder="cliente@email.com"
              className="col-span-2"
            />
          </div>
          <TextareaField
            label="Dirección de entrega"
            value={form.direccion_entrega} onChange={(e) => set('direccion_entrega', e.target.value)}
            placeholder="Calle, sector, referencia..."
          />
        </form>
      </Modal>

      {/* Drawer historial de proformas */}
      {historialCliente && (
        <HistorialDrawer
          cliente={historialCliente}
          onClose={() => setHistorial(null)}
        />
      )}
    </div>
  )
}

// ─── Drawer historial ─────────────────────────────────────────────────────────

function HistorialDrawer({ cliente, onClose }: { cliente: Cliente; onClose: () => void }) {
  const { data: proformas = [], isLoading } = useQuery({
    queryKey: ['proformas'],
    queryFn: () => proformasApi.list().then((r) => r.data),
  })

  const propias = (proformas as Proforma[]).filter((p) => p.cliente.id === cliente.id)

  const totalFacturado = propias
    .filter((p) => p.estado === 'Cerrada')
    .reduce((a, p) => a + p.total, 0)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[400] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-[500] flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-neutral-100 bg-primary-800 px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">{cliente.nombre}</h2>
              <p className="mt-0.5 font-mono text-sm text-white/70">{cliente.cedula_ruc}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Stats del cliente */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <StatChip label="Proformas" value={propias.length} />
            <StatChip
              label="Completadas"
              value={propias.filter((p) => p.estado === 'Cerrada').length}
            />
            <StatChip label="Facturado" value={`$${totalFacturado.toFixed(0)}`} />
          </div>
        </div>

        {/* Datos de contacto */}
        <div className="border-b border-neutral-100 px-6 py-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {cliente.telefono && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Teléfono</p>
                <p className="mt-0.5 text-neutral-800">{cliente.telefono}</p>
              </div>
            )}
            {cliente.email && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Email</p>
                <p className="mt-0.5 text-neutral-800 truncate">{cliente.email}</p>
              </div>
            )}
            {cliente.direccion_entrega && (
              <div className="col-span-2">
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Dirección</p>
                <p className="mt-0.5 text-neutral-800">{cliente.direccion_entrega}</p>
              </div>
            )}
          </div>
        </div>

        {/* Historial de proformas */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Historial de proformas
            </p>

            {isLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : propias.length === 0 ? (
              <div className="py-12 text-center text-sm text-neutral-400">
                Este cliente aún no tiene proformas
              </div>
            ) : (
              <div className="space-y-3">
                {[...propias]
                  .sort((a, b) => new Date(b.fecha_emision).getTime() - new Date(a.fecha_emision).getTime())
                  .map((p) => (
                    <div
                      key={p.id}
                      className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-primary-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-neutral-800">{p.numero}</p>
                          <p className="mt-0.5 text-xs text-neutral-500">
                            {new Date(p.fecha_emision).toLocaleDateString('es-EC', { dateStyle: 'medium' })}
                            {p.fecha_entrega && (
                              <> · Entrega: {new Date(p.fecha_entrega).toLocaleDateString('es-EC', { dateStyle: 'short' })}</>
                            )}
                          </p>
                        </div>
                        <EstadoBadge estado={p.estado} />
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-lg font-bold text-primary-800">${p.total.toFixed(2)}</p>
                        <a
                          href={`/proformas/${p.id}`}
                          className="text-xs font-medium text-primary-800 hover:underline"
                        >
                          Ver detalle →
                        </a>
                      </div>

                      {/* Mini barra de pago */}
                      {p.pagos && p.pagos.length > 0 && (
                        <div className="mt-2">
                          <div className="h-1 w-full rounded-full bg-neutral-200 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-success-400"
                              style={{
                                width: `${Math.min(100, (p.pagos.reduce((a, pg) => a + pg.monto, 0) / p.total) * 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white/10 px-3 py-2 text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  )
}
