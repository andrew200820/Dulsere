import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  footer?: ReactNode
}

const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

export function Modal({ open, onClose, title, children, size = 'md', footer }: ModalProps) {
  const firstFocusRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    firstFocusRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`relative w-full ${sizes[size]} rounded-xl bg-white shadow-xl`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 id="modal-title" className="text-lg font-semibold text-neutral-900">
            {title}
          </h2>
          <button
            ref={firstFocusRef}
            onClick={onClose}
            className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 border-t border-neutral-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  danger = false,
  loading = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  danger?: boolean
  loading?: boolean
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-neutral-600">{description}</p>
      <div className="mt-5 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
            danger
              ? 'bg-error-600 hover:bg-error-700'
              : 'bg-primary-800 hover:bg-primary-900'
          }`}
        >
          {loading ? 'Procesando...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
