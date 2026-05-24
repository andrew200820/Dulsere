import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario, Rol } from '@/types/auth'

interface AuthStore {
  token: string | null
  usuario: Usuario | null
  setAuth: (token: string, usuario: Usuario) => void
  logout: () => void
  hasRole: (...roles: Rol[]) => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token:   null,
      usuario: null,

      setAuth: (token, usuario) => {
        localStorage.setItem('dulsere_token', token)
        set({ token, usuario })
      },

      logout: () => {
        localStorage.removeItem('dulsere_token')
        set({ token: null, usuario: null })
      },

      hasRole: (...roles) => {
        const { usuario } = get()
        return usuario ? roles.includes(usuario.rol) : false
      },
    }),
    { name: 'dulsere-auth' }
  )
)
