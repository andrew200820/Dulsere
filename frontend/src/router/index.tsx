import { createBrowserRouter, redirect, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Spinner } from '@/components/ui/Spinner'
import { useAuthStore } from '@/stores/authStore'

// Lazy imports — code splitting por ruta
const LoginPage         = lazy(() => import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const AdminDashboard    = lazy(() => import('@/features/dashboard/AdminDashboard').then((m) => ({ default: m.AdminDashboard })))
const InventarioDash    = lazy(() => import('@/features/dashboard/InventarioDashboard').then((m) => ({ default: m.InventarioDashboard })))
const ProduccionDash    = lazy(() => import('@/features/dashboard/ProduccionDashboard').then((m) => ({ default: m.ProduccionDashboard })))
const NuevaProforma     = lazy(() => import('@/features/proformas/NuevaProformaPage').then((m) => ({ default: m.NuevaProformaPage })))
const ProformasList     = lazy(() => import('@/features/proformas/ProformasListPage').then((m) => ({ default: m.ProformasListPage })))
const ProformaDetail    = lazy(() => import('@/features/proformas/ProformaDetailPage').then((m) => ({ default: m.ProformaDetailPage })))
const InsumosPage       = lazy(() => import('@/features/inventario/insumos/InsumosPage').then((m) => ({ default: m.InsumosPage })))
const ProductosPage     = lazy(() => import('@/features/inventario/productos/ProductosPage').then((m) => ({ default: m.ProductosPage })))
const MovimientosPage   = lazy(() => import('@/features/inventario/movimientos/MovimientosPage').then((m) => ({ default: m.MovimientosPage })))
const ClientesPage      = lazy(() => import('@/features/clientes/ClientesPage').then((m) => ({ default: m.ClientesPage })))
const UsuariosPage      = lazy(() => import('@/features/admin/UsuariosPage').then((m) => ({ default: m.UsuariosPage })))


function Loading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  )
}

function requireAuth() {
  const { token } = useAuthStore.getState()
  if (!token) return redirect('/login')
  return null
}

function roleRedirect() {
  const { usuario } = useAuthStore.getState()
  if (!usuario) return redirect('/login')
  if (usuario.rol === 'Admin')       return redirect('/dashboard/admin')
  if (usuario.rol === 'Inventario')  return redirect('/dashboard/inventario')
  return redirect('/dashboard/produccion')
}

function requireRole(...roles: string[]) {
  return () => {
    const { usuario } = useAuthStore.getState()
    if (!usuario) return redirect('/login')
    if (!roles.includes(usuario.rol)) return redirect('/')
    return null
  }
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<Loading />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    element: <AppLayout />,
    loader: requireAuth,
    children: [
      { index: true, loader: roleRedirect, element: <Navigate to="/" /> },

      // Dashboards por rol
      {
        path: 'dashboard/admin',
        loader: requireRole('Admin'),
        element: withSuspense(AdminDashboard),
      },
      {
        path: 'dashboard/inventario',
        loader: requireRole('Admin', 'Inventario'),
        element: withSuspense(InventarioDash),
      },
      {
        path: 'dashboard/produccion',
        element: withSuspense(ProduccionDash),
      },

      // Proformas
      { path: 'proformas',       element: withSuspense(ProformasList) },
      { path: 'proformas/nueva', element: withSuspense(NuevaProforma) },
      { path: 'proformas/:id',   element: withSuspense(ProformaDetail) },

      // Inventario
      { path: 'inventario/insumos',     element: withSuspense(InsumosPage) },
      { path: 'inventario/productos',   element: withSuspense(ProductosPage) },
      { path: 'inventario/movimientos', element: withSuspense(MovimientosPage) },

      // Otros
      { path: 'clientes',          element: withSuspense(ClientesPage) },
      { path: 'admin/usuarios',    loader: requireRole('Admin'), element: withSuspense(UsuariosPage) },
    ],
  },
])
