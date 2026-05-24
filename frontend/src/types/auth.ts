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
