import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { proformasApi } from '@/lib/api'
import { EstadoBadge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { useAuthStore } from '@/stores/authStore'
import type { EstadoProforma, MetodoPago } from '@/types/proformas'

export function ProformaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { hasRole } = useAuthStore()

  const [pagoModalOpen, setPagoModalOpen]       = useState(false)
  const [confirmModal, setConfirmModal]         = useState<{
    open: boolean; title: string; description: string; action: () => void
  }>({ open: false, title: '', description: '', action: () => {} })

  const { data: proforma, isLoading, isError } = useQuery({
    queryKey: ['proformas', id],
    queryFn: () => proformasApi.get(Number(id)).then((r) => r.data),
    enabled: !!id,
  })

  const cambiarEstadoMutation = useMutation({
    mutationFn: (estado: EstadoProforma) =>
      proformasApi.cambiarEstado(Number(id), estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proformas'] })
      setConfirmModal((c) => ({ ...c, open: false }))
    },
  })

  function pedirConfirmacion(title: string, description: string, action: () => void) {
    setConfirmModal({ open: true, title, description, action })
  }

  async function handleDescargarPDF() {
    const res = await proformasApi.pdf(Number(id))
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `proforma-${proforma?.id}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleWhatsApp() {
    if (!proforma) return
    const publicUrl = `${window.location.origin}/p/${proforma.token_acceso}`
    const texto = encodeURIComponent(
      `¡Hola ${proforma.cliente.nombre}! 👋\n\nTe compartimos tu proforma *#${proforma.id}* de Dulseré por un total de *$${proforma.total.toFixed(2)}*.\n\nPuedes verla aquí: ${publicUrl}`
    )
    window.open(`https://wa.me/?text=${texto}`, '_blank')
  }

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  if (isError || !proforma) return (
    <div className="py-24 text-center text-neutral-500">
      <p className="text-lg font-semibold">Proforma no encontrada</p>
      <Link to="/proformas" className="mt-2 text-sm text-primary-800 hover:underline">
        ← Volver a la lista
      </Link>
    </div>
  )

  const pagosAcumulados = (proforma.pagos ?? []).reduce((a, p) => a + p.monto, 0)
  const porcentajePagado = proforma.total > 0 ? (pagosAcumulados / proforma.total) * 100 : 0
  const saldoPendiente = proforma.total - pagosAcumulados

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link to="/proformas" className="text-sm text-neutral-400 hover:text-neutral-600">
              ← Proformas
            </Link>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900">#{proforma.id}</h1>
            <EstadoBadge estado={proforma.estado} />
          </div>
          <p className="text-sm text-neutral-500">
            Emitida el {new Date(proforma.fecha_emision).toLocaleDateString('es-EC', { dateStyle: 'long' })}
          </p>
        </div>

        {/* Acciones de share */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 rounded-md border border-success-600 bg-success-50 px-3 py-2 text-sm font-medium text-success-700 hover:bg-success-100 transition-colors"
          >
            <span>💬</span> WhatsApp
          </button>
          <button
            onClick={handleDescargarPDF}
            className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <span>↓</span> PDF
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/p/${proforma.token_acceso}`)}
            className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            title="Copiar enlace público"
          >
            <span>⧉</span> Copiar enlace
          </button>
        </div>
      </div>

      {/* Cuerpo — 2 columnas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Columna principal (2/3) */}
        <div className="space-y-6 lg:col-span-2">

          {/* Info del cliente */}
          <SectionCard title="Cliente">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Nombre" value={proforma.cliente.nombre} />
              <Field label="RUC / Cédula" value={proforma.cliente.cedula_ruc} />
              <Field label="Teléfono" value={proforma.cliente.telefono ?? '—'} />
              <Field label="Email" value={proforma.cliente.email ?? '—'} />
              {proforma.cliente.direccion_entrega && (
                <Field label="Dirección de entrega" value={proforma.cliente.direccion_entrega} className="col-span-2" />
              )}
              {proforma.fecha_entrega && (
                <Field
                  label="Fecha de entrega"
                  value={new Date(proforma.fecha_entrega).toLocaleDateString('es-EC', { dateStyle: 'long' })}
                />
              )}
            </div>
          </SectionCard>

          {/* Detalle de productos */}
          <SectionCard title="Productos">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    <th className="pb-2">Producto</th>
                    <th className="pb-2 text-right">Precio</th>
                    <th className="pb-2 text-right">Cant.</th>
                    <th className="pb-2 text-right">Desc.</th>
                    <th className="pb-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {proforma.detalles.map((d) => (
                    <tr key={d.id}>
                      <td className="py-3 font-medium text-neutral-800">{d.producto.nombre}</td>
                      <td className="py-3 text-right text-neutral-600">${d.precio_unitario.toFixed(2)}</td>
                      <td className="py-3 text-right text-neutral-600">{d.cantidad}</td>
                      <td className="py-3 text-right text-neutral-600">—</td>
                      <td className="py-3 text-right font-semibold text-neutral-800">
                        ${d.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales de la tabla */}
            <div className="mt-4 border-t border-neutral-200 pt-4 space-y-1.5">
              <TotalRow label="Subtotal"      value={proforma.subtotal} />
              {proforma.descuento > 0 && (
                <TotalRow label="Descuento"   value={-proforma.descuento} negative />
              )}
              <TotalRow label="IVA (12%)"     value={proforma.monto_iva} />
              <TotalRow label="TOTAL"         value={proforma.total} bold />
            </div>

          </SectionCard>

          {/* Historial de pagos */}
          <SectionCard
            title="Pagos recibidos"
            action={
              proforma.estado !== 'Cerrada' && (
                <button
                  onClick={() => setPagoModalOpen(true)}
                  className="rounded-md bg-primary-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-900 transition-colors"
                >
                  + Registrar pago
                </button>
              )
            }
          >
            {/* Barra de progreso de pago */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-neutral-500 mb-1">
                <span>Pagado: ${pagosAcumulados.toFixed(2)}</span>
                <span>Saldo: ${saldoPendiente.toFixed(2)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    porcentajePagado >= 100 ? 'bg-success-500' :
                    porcentajePagado >= 50  ? 'bg-info-500' : 'bg-warning-500'
                  }`}
                  style={{ width: `${Math.min(100, porcentajePagado)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-neutral-500 text-right">
                {porcentajePagado.toFixed(0)}% pagado
              </p>
            </div>

            {(!proforma.pagos || proforma.pagos.length === 0) ? (
              <p className="text-center text-sm text-neutral-400 py-4">Sin pagos registrados aún</p>
            ) : (
              <div className="space-y-2">
                {proforma.pagos.map((pago) => (
                  <div key={pago.id} className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">
                        {pago.metodo_pago}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {new Date(pago.fecha_pago).toLocaleDateString('es-EC')}
                        {pago.referencia && <> · Ref: {pago.referencia}</>}
                      </p>
                    </div>
                    <span className="font-semibold text-success-700">
                      +${pago.monto.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Columna lateral — acciones (1/3) */}
        <div className="space-y-4">
          {/* Tarjeta de resumen total */}
          <div className="rounded-xl border-t-4 border-primary-800 bg-white p-5 shadow-sm border border-neutral-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Total proforma</p>
            <p className="mt-2 text-4xl font-bold text-primary-800">${proforma.total.toFixed(2)}</p>
            <p className="mt-1 text-sm text-neutral-500">{proforma.detalles.length} producto(s)</p>
          </div>

          {/* Máquina de estados */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Acciones
            </p>

            {proforma.estado === 'Pendiente' && hasRole('Admin', 'Inventario') && (
              <button
                onClick={() =>
                  pedirConfirmacion(
                    'Convertir a Definitiva',
                    `¿Confirmar la proforma #${proforma.id}? Se descontará el inventario y se creará el evento en calendario.`,
                    () => cambiarEstadoMutation.mutate('Definitiva')
                  )
                }
                className="w-full rounded-md bg-info-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-info-700 transition-colors"
              >
                Convertir a Definitiva
              </button>
            )}

            {proforma.estado === 'Definitiva' && (
              <>
                <button
                  onClick={() => setPagoModalOpen(true)}
                  className="w-full rounded-md bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-900 transition-colors"
                >
                  Registrar pago
                </button>
                {hasRole('Admin') && (
                  <button
                    onClick={() =>
                      pedirConfirmacion(
                        'Cerrar proforma',
                        `¿Marcar la proforma #${proforma.id} como completada?`,
                        () => cambiarEstadoMutation.mutate('Cerrada')
                      )
                    }
                    className="w-full rounded-md border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Cerrar proforma
                  </button>
                )}
              </>
            )}

            {proforma.estado === 'Cerrada' && (
              <div className="rounded-lg bg-success-50 px-4 py-3 text-center text-sm font-medium text-success-700">
                ✓ Proforma completada
              </div>
            )}
          </div>

          {/* Timeline de estados */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Historial
            </p>
            <StateTimeline estado={proforma.estado} fechaEmision={proforma.fecha_emision} />
          </div>
        </div>
      </div>

      {/* Modal: Registrar pago */}
      <PagoModal
        open={pagoModalOpen}
        onClose={() => setPagoModalOpen(false)}
        proformaId={Number(id)}
        saldoPendiente={saldoPendiente}
        onSuccess={() => {
          setPagoModalOpen(false)
          queryClient.invalidateQueries({ queryKey: ['proformas', id] })
        }}
      />

      {/* Modal: Confirmación de cambio de estado */}
      <ConfirmModal
        open={confirmModal.open}
        onClose={() => setConfirmModal((c) => ({ ...c, open: false }))}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        description={confirmModal.description}
        loading={cambiarEstadoMutation.isPending}
      />
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SectionCard({
  title, children, action,
}: {
  title: string; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
        <h2 className="font-semibold text-neutral-800">{title}</h2>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function Field({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">{label}</p>
      <p className="mt-0.5 text-sm text-neutral-800">{value}</p>
    </div>
  )
}

function TotalRow({ label, value, bold, negative }: { label: string; value: number; bold?: boolean; negative?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? 'border-t border-neutral-200 pt-1.5 font-bold text-neutral-900' : 'text-neutral-600'}`}>
      <span>{label}</span>
      <span className={negative ? 'text-success-600' : bold ? 'text-primary-800' : ''}>
        {negative && value < 0 ? '-' : ''}${Math.abs(value).toFixed(2)}
      </span>
    </div>
  )
}

function StateTimeline({ estado, fechaEmision }: { estado: EstadoProforma; fechaEmision: string }) {
  const steps: { key: EstadoProforma; label: string }[] = [
    { key: 'Pendiente',  label: 'Creada' },
    { key: 'Definitiva', label: 'Confirmada' },
    { key: 'Cerrada',    label: 'Completada' },
  ]
  const currentIdx = steps.findIndex((s) => s.key === estado)

  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const done    = i <= currentIdx
        const current = i === currentIdx
        return (
          <div key={step.key} className="flex items-start gap-3">
            <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              done
                ? current
                  ? 'bg-primary-800 text-white'
                  : 'bg-success-500 text-white'
                : 'border-2 border-neutral-200 text-neutral-300'
            }`}>
              {done && !current ? '✓' : i + 1}
            </div>
            <div>
              <p className={`text-sm font-medium ${done ? 'text-neutral-800' : 'text-neutral-400'}`}>
                {step.label}
              </p>
              {i === 0 && (
                <p className="text-xs text-neutral-400">
                  {new Date(fechaEmision).toLocaleDateString('es-EC')}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PagoModal({
  open, onClose, proformaId, saldoPendiente, onSuccess,
}: {
  open: boolean; onClose: () => void; proformaId: number
  saldoPendiente: number; onSuccess: () => void
}) {
  const [monto, setMonto]           = useState('')
  const [metodo, setMetodo]         = useState<MetodoPago>('Transferencia')
  const [referencia, setReferencia] = useState('')

  const mutation = useMutation({
    mutationFn: () => {
      const montoNum = Number(monto)
      return proformasApi.registrarPago(proformaId, {
        monto: montoNum,
        metodoPago: metodo,
        tipoPago: montoNum >= saldoPendiente ? 'Completo' : 'Anticipo',
        referencia: referencia || undefined,
      })
    },
    onSuccess,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!monto || Number(monto) <= 0) return
    mutation.mutate()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar pago"
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending || !monto}
            className="rounded-md bg-primary-800 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900 disabled:opacity-60"
          >
            {mutation.isPending ? 'Guardando...' : 'Registrar pago'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Monto <span className="text-neutral-400">(saldo: ${saldoPendiente.toFixed(2)})</span>
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            max={saldoPendiente}
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-md border border-neutral-200 px-3 py-2.5 text-sm focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Método de pago</label>
          <div className="grid grid-cols-3 gap-2">
            {(['Transferencia', 'Efectivo', 'Tarjeta'] as MetodoPago[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetodo(m)}
                className={`rounded-md border py-2 text-xs font-medium transition-colors ${
                  metodo === m
                    ? 'border-primary-800 bg-primary-50 text-primary-800'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Referencia / comprobante <span className="text-neutral-400">(opcional)</span>
          </label>
          <input
            type="text"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            placeholder="N° transferencia, cheque..."
            className="w-full rounded-md border border-neutral-200 px-3 py-2.5 text-sm focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800"
          />
        </div>
      </form>
    </Modal>
  )
}
