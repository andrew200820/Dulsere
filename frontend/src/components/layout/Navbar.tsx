import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export function Navbar() {
  const { usuario, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = usuario?.nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-[200] flex h-14 items-center justify-between border-b border-primary-900 bg-primary-800 px-6">
      {/* Logo */}
      <span className="font-display text-xl tracking-wide text-white">
        DUL<span className="italic">S</span>ERÉ
      </span>

      {/* User menu */}
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-white/70 sm:block">{usuario?.nombre}</span>
        <span className="rounded-full bg-brand-peach px-2.5 py-0.5 text-xs font-semibold text-primary-800">
          {usuario?.rol}
        </span>
        <button
          onClick={handleLogout}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white hover:bg-white/20 transition-colors"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          {initials}
        </button>
      </div>
    </header>
  )
}
