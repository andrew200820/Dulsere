import type { EstadoProforma } from '@/types/proformas'

type Variant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

const variantClasses: Record<Variant, string> = {
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  error:   'bg-error-100   text-error-700',
  info:    'bg-info-100    text-info-700',
  neutral: 'bg-neutral-100 text-neutral-600',
}

interface BadgeProps {
  label: string
  variant?: Variant
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${variantClasses[variant]}`}>
      {label}
    </span>
  )
}

const estadoVariant: Record<EstadoProforma, Variant> = {
  Pendiente:  'warning',
  Definitiva: 'info',
  Cerrada:    'success',
}

export function EstadoBadge({ estado }: { estado: EstadoProforma }) {
  return <Badge label={estado} variant={estadoVariant[estado]} />
}
