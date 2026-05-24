import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { Spinner } from '@/components/ui/Spinner'

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail]       = useState('')
  const [contrasena, setPass]   = useState('')
  const [shake, setShake]       = useState(false)

  const loginMutation = useMutation({
    mutationFn: () => authApi.login(email, contrasena),
    onSuccess: ({ data }) => {
      setAuth(data.access_token, data.usuario)
      const rol = data.usuario.rol
      if (rol === 'Admin')       navigate('/dashboard/admin',      { replace: true })
      else if (rol === 'Inventario') navigate('/dashboard/inventario', { replace: true })
      else                       navigate('/dashboard/produccion', { replace: true })
    },
    onError: () => {
      setShake(true)
      setTimeout(() => setShake(false), 600)
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email || !contrasena) return
    loginMutation.mutate()
  }

  return (
    <div className="flex min-h-screen">
      {/* Panel izquierdo — marca */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-primary-800 lg:flex">
        {/* Patrón decorativo */}
        <div className="absolute inset-0 opacity-[0.06] bg-[url('/pattern.svg')] bg-repeat bg-[length:300px]" />

        <div className="relative z-10 flex flex-col items-center gap-6 text-center px-12">
          {/* Logo */}
          <h1 className="font-display text-6xl tracking-wider text-white">
            DUL<span className="italic">S</span>ERÉ
          </h1>

          {/* Separador decorativo */}
          <div className="h-px w-24 bg-white/30" />

          {/* Slogan */}
          <p className="text-lg text-white/75 leading-relaxed">
            El detalle perfecto<br />en cada bocado
          </p>

          {/* Sub-label */}
          <p className="mt-4 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/60">
            Sistema de gestión
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex w-full flex-col items-center justify-center bg-brand-cream px-6 lg:w-1/2">
        {/* Logo móvil */}
        <h1 className="mb-8 font-display text-4xl text-primary-800 lg:hidden">
          DUL<span className="italic">S</span>ERÉ
        </h1>

        <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">Bienvenido</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-neutral-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-neutral-200 px-3 py-2.5 text-sm
                           placeholder:text-neutral-300 focus:border-primary-800
                           focus:outline-none focus:ring-1 focus:ring-primary-800"
                placeholder="usuario@dulsere.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-neutral-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={contrasena}
                onChange={(e) => setPass(e.target.value)}
                className={`w-full rounded-md border px-3 py-2.5 text-sm
                            placeholder:text-neutral-300 focus:outline-none
                            focus:ring-1 focus:ring-primary-800 transition-colors
                            ${loginMutation.isError
                              ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
                              : 'border-neutral-200 focus:border-primary-800'
                            }
                            ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Mensaje de error */}
            {loginMutation.isError && (
              <p className="rounded-md bg-error-50 px-3 py-2 text-sm text-error-600">
                Credenciales incorrectas. Intenta de nuevo.
              </p>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-md
                         bg-primary-800 py-3 font-semibold text-white
                         hover:bg-primary-900 disabled:opacity-60
                         transition-colors mt-2"
            >
              {loginMutation.isPending ? (
                <><Spinner size="sm" className="text-white" /> Ingresando...</>
              ) : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-xs text-neutral-400">
          Dulseré ERP © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
