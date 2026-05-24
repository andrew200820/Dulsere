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

// Páginas placeholder (se completan en siguientes fases)
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center py-24 text-neutral-400">
    <span className="text-5xl mb-4">🚧</span>
    <p className="text-lg font-semibold">{title}</p>
    <p className="text-sm mt-1">En construcción</p>
  </div>
)

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
      { path: 'proformas',       element: <Placeholder title="Lista de proformas" /> },
      { path: 'proformas/nueva', element: withSuspense(NuevaProforma) },
      { path: 'proformas/:id',   element: <Placeholder title="Detalle de proforma" /> },

      // Inventario
      { path: 'inventario/insumos',     element: <Placeholder title="Gestión de insumos" /> },
      { path: 'inventario/productos',   element: <Placeholder title="Gestión de productos" /> },
      { path: 'inventario/movimientos', element: <Placeholder title="Movimientos de inventario" /> },

      // Otros
      { path: 'clientes',          element: <Placeholder title="Clientes" /> },
      { path: 'admin/usuarios',    element: <Placeholder title="Usuarios" /> },
    ],
  },
])
