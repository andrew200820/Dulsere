import { CotizacionCanvas } from './canvas/CotizacionCanvas'

export function NuevaProformaPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-neutral-900">Nueva proforma</h1>
        <p className="text-sm text-neutral-500">
          Arrastra productos al canvas para armar la cotización
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <CotizacionCanvas />
      </div>
    </div>
  )
}
