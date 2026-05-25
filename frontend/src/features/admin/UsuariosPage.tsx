import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usuariosApi } from '@/lib/api'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { InputField, SelectField } from '@/components/ui/FormField'
import { Spinner } from '@/components/ui/Spinner'
import type { UsuarioAdmin } from '@/types/auth'

const ROL_COLORS: Record<string, string> = {
  Admin:      'bg-primary-100 text-primary-800',
  Inventario: 'bg-info-100 text-info-700',
  Produccion: 'bg-success-100 text-success-700',
}

interface UserForm {
  nombre: string
  email: string
  roleId: string
  password: string
}

const EMPTY: UserForm = { nombre: '', email: '', roleId: '', password: '' }

export function UsuariosPage() {
  const qc = useQueryClient()
  const [formOpen, setFormOpen]         = useState(false)
  const [editando, setEditando]         = useState<UsuarioAdmin | null>(null)
  const [form, setForm]                 = useState<UserForm>(EMPTY)
  const [errors, setErrors]             = useState<Partial<UserForm>>({})
  const [confirmDelete, setConfirmDelete] = useState<UsuarioAdmin | null>(null)

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => usuariosApi.list().then((r) => r.data),
  })

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => usuariosApi.roles().then((r) => r.data),
  })

  const roleOptions = roles.map((r) => ({ value: String(r.id), label: r.nombre }))

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = {
        nombre: form.nombre,
        email:  form.email,
        roleId: Number(form.roleId),
      }
      if (!editando || form.password) payload.password = form.password
      return editando
        ? usuariosApi.update(editando.id, payload)
        : usuariosApi.create(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); closeForm() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usuariosApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); setConfirmDelete(null) },
  })

  function openCreate() {
    setEditando(null); setForm(EMPTY); setErrors({}); setFormOpen(true)
  }

  function openEdit(u: UsuarioAdmin) {
    setEditando(u)
    setForm({ nombre: u.nombre ?? '', email: u.email, roleId: String(u.role.id), password: '' })
    setErrors({})
    setFormOpen(true)
  }

  function closeForm() { setFormOpen(false); setEditando(null); setForm(EMPTY) }

  function validate() {
    const e: Partial<UserForm> = {}
    if (!form.nombre.trim())  e.nombre  = 'Requerido'
    if (!form.email.trim())   e.email   = 'Requerido'
    if (!form.roleId)         e.roleId  = 'Selecciona un rol'
    if (!editando && !form.password) e.password = 'Requerido'
    if (form.password && form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validate()) saveMutation.mutate()
  }

  function set(k: keyof UserForm, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Usuarios</h1>
          <p className="text-sm text-neutral-500">Gestión de accesos al sistema</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-md bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-900 transition-colors shadow-xs"
        >
          + Nuevo usuario
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : usuarios.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">Sin usuarios registrados</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary-800 text-left text-xs font-semibold uppercase tracking-wider text-white">
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Correo</th>
                <th className="px-6 py-3">Rol</th>
                <th className="px-6 py-3">Creado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(usuarios as UsuarioAdmin[]).map((u, i) => (
                <tr
                  key={u.id}
                  className={`border-b border-neutral-100 transition-colors hover:bg-primary-50 ${i % 2 === 1 ? 'bg-neutral-50/60' : 'bg-white'}`}
                >
                  <td className="px-6 py-3 font-medium text-neutral-800">{u.nombre ?? '—'}</td>
                  <td className="px-6 py-3 text-neutral-600">{u.email}</td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROL_COLORS[u.role.nombre] ?? 'bg-neutral-100 text-neutral-600'}`}>
                      {u.role.nombre}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-neutral-500">
                    {new Date(u.created_at).toLocaleDateString('es-EC', { dateStyle: 'medium' })}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="rounded px-2.5 py-1 text-xs font-medium text-primary-800 hover:bg-primary-50 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(u)}
                        className="rounded px-2.5 py-1 text-xs font-medium text-error-600 hover:bg-error-50 transition-colors"
                      >
                        Eliminar
                      </button>
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
        title={editando ? `Editar — ${editando.nombre}` : 'Nuevo usuario'}
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
              {saveMutation.isPending ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Nombre completo" required
            value={form.nombre} onChange={(e) => set('nombre', e.target.value)}
            error={errors.nombre} placeholder="Ej. Andrea Pérez"
          />
          <InputField
            label="Correo electrónico" required type="email"
            value={form.email} onChange={(e) => set('email', e.target.value)}
            error={errors.email} placeholder="correo@dulsere.com"
          />
          <SelectField
            label="Rol" required
            value={form.roleId}
            onChange={(e) => set('roleId', e.target.value)}
            options={roleOptions}
            error={errors.roleId}
          />
          <InputField
            label={editando ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
            required={!editando}
            type="password"
            value={form.password} onChange={(e) => set('password', e.target.value)}
            error={errors.password} placeholder="Mínimo 6 caracteres"
          />
        </form>
      </Modal>

      {/* Modal confirmar eliminar */}
      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}
        title="Eliminar usuario"
        description={`¿Eliminar a "${confirmDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
        loading={deleteMutation.isPending}
      />
    </div>
  )
}