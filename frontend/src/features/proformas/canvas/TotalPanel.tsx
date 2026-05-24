import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useCanvasStore } from '@/stores/canvasStore'
import { clientesApi, proformasApi } from '@/lib/api'
import type { Cliente } from '@/types/proformas'

export function TotalPanel() {
  const navigate = useNavigate()
  const {
    items, totales, clienteSeleccionado, fechaEntrega, notas,
    setCliente, setFechaEntrega, setNotas,
    aiPreviewUrl, aiLoading, setAiPreview, setAiLoading,
    reset,
  } = useCanvasStore()

  const [clienteSearch, setClienteSearch] = useState('')
  const [showClienteList, setShowClienteList] = useState(false)

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clientesApi.list().then((r) => r.data),
  })

  const clientesFiltrados = clientes.filter((c: Cliente) =>
    c.nombre.toLowerCase().includes(clienteSearch.toLowerCase()) ||
    c.cedula_ruc.includes(clienteSearch)
  )

  const crearMutation = useMutation({
    mutationFn: () =>
      proformasApi.create({
        cliente_id: clienteSeleccionado!.id,
        fecha_entrega: fechaEntrega,
        notas,
        items: items.map((i) => ({
          producto_id: i.productoId,
          cantidad: i.cantidad,
          precio_unitario: i.precioUnitario,
          descuento: i.descuento,
        })),
      }),
    onSuccess: (res) => {
      reset()
      navigate(`/proformas/${res.data.id}`)
    },
  })

  async function handleAiPreview() {
    if (items.length === 0) return
    setAiLoading(true)
    try {
      const res = await proformasApi.aiPreview(
        items.map((i) => ({ nombre: i.nombre, cantidad: i.cantidad }))
      )
      setAiPreview(res.data.imagen_url)
    } catch {
      // toast error manejado globalmente
    } finally {
      setAiLoading(false)
    }
  }

  const puedeCrear = items.length > 0 && clienteSeleccionado !== null

  return (
    <div className="flex h-full flex-col">
      {/* Cliente */}
      <div className="border-b border-neutral-100 p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Cliente
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={clienteSeleccionado ? clienteSeleccionado.nombre : clienteSearch}
            onChange={(e) => {
              setClienteSearch(e.target.value)
              setCliente(null)
              setShowClienteList(true)
            }}
            onFocus={() => setShowClienteList(true)}
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm
                       placeholder:text-neutral-300 focus:border-primary-800
                       focus:outline-none focus:ring-1 focus:ring-primary-800"
          />
          {showClienteList && clienteSearch && !clienteSeleccionado && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-neutral-200 bg-white shadow-md">
              {clientesFiltrados.slice(0, 5).map((c: Cliente) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCliente(c)
                    setClienteSearch(c.nombre)
                    setShowClienteList(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50"
                >
                  <p className="font-medium text-neutral-800">{c.nombre}</p>
                  <p className="text-xs text-neutral-500">{c.cedula_ruc}</p>
                </button>
              ))}
              {clientesFiltrados.length === 0 && (
                <p className="px-3 py-2 text-sm text-neutral-400">Sin resultados</p>
              )}
            </div>
          )}
        </div>

        {/* Fecha de entrega */}
        <input
          type="date"
          value={fechaEntrega ?? ''}
          onChange={(e) => setFechaEntrega(e.target.value || null)}
          className="mt-2 w-full rounded-md border border-neutral-200 px-3 py-2
                     text-sm focus:border-primary-800 focus:outline-none focus:ring-1 focus:ring-primary-800"
        />
      </div>

      {/* Totales */}
      <div className="border-b border-neutral-100 p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Resumen
        </h2>
        <div className="space-y-2 text-sm">
          <Row label="Subtotal" value={totales.subtotal} />
          {totales.descuentoTotal > 0 && (
            <Row label="Descuentos" value={-totales.descuentoTotal} negative />
          )}
          <Row label="Base imponible" value={totales.baseImponible} />
          <Row label="IVA (12%)" value={totales.iva} />
          <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2">
            <span className="font-semibold text-neutral-800">TOTAL</span>
            <span className="font-bold text-primary-800">
              ${totales.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="border-b border-neutral-100 p-4">
        <textarea
          placeholder="Notas adicionales..."
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-md border border-neutral-200 px-3 py-2
                     text-sm placeholder:text-neutral-300 focus:border-primary-800
                     focus:outline-none focus:ring-1 focus:ring-primary-800"
        />
      </div>

      {/* Preview IA */}
      <div className="border-b border-neutral-100 p-4">
        <button
          onClick={handleAiPreview}
          disabled={items.length === 0 || aiLoading}
          className="flex w-full items-center justify-center gap-2 rounded-md border
                     border-primary-600 px-3 py-2 text-sm font-medium text-primary-800
                     hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors"
        >
          {aiLoading ? (
            <>
              <span className="animate-spin">⟳</span> Generando...
            </>
          ) : (
            <>✨ Ver preview IA</>
          )}
        </button>
        {aiPreviewUrl && (
          <div className="mt-3 overflow-hidden rounded-lg border border-neutral-200">
            <img src={aiPreviewUrl} alt="Preview IA de la tabla" className="w-full" />
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-auto p-4">
        <button
          onClick={() => crearMutation.mutate()}
          disabled={!puedeCrear || crearMutation.isPending}
          className="w-full rounded-md bg-primary-800 px-4 py-3 font-semibold text-white
                     hover:bg-primary-900 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors shadow-xs"
        >
          {crearMutation.isPending ? 'Creando...' : 'Crear proforma'}
        </button>
        {!clienteSeleccionado && items.length > 0 && (
          <p className="mt-2 text-center text-xs text-warning-600">
            Selecciona un cliente para continuar
          </p>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, negative }: { label: string; value: number; negative?: boolean }) {
  return (
    <div className="flex justify-between text-neutral-600">
      <span>{label}</span>
      <span className={negative ? 'text-success-600' : ''}>
        {negative && value < 0 ? '-' : ''}${Math.abs(value).toFixed(2)}
      </span>
    </div>
  )
}
