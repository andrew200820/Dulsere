export type Rol = 'Admin' | 'Inventario' | 'Produccion'

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: Rol
}

export interface AuthState {
  token: string | null
  usuario: Usuario | null
}

export interface LoginCredentials {
  email: string
  contrasena: string
}

export interface LoginResponse {
  access_token: string
  usuario: Usuario
}

export interface UsuarioAdmin {
  id: string
  email: string
  nombre: string | null
  role_id: number
  created_at: string
  role: { id: number; nombre: string }
}
