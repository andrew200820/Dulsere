import { NavLink } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { Rol } from '@/types/auth'

interface NavItem {
  to: string
  label: string
  icon: string
  roles: Rol[]
}

interface NavSection {
  title: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { to: '/dashboard/admin',      label: 'Dashboard',      icon: '◈', roles: ['Admin'] },
      { to: '/dashboard/inventario', label: 'Dashboard',      icon: '◈', roles: ['Inventario'] },
      { to: '/dashboard/produccion', label: 'Dashboard',      icon: '◈', roles: ['Produccion'] },
    ],
  },
  {
    title: 'Inventario',
    items: [
      { to: '/inventario/insumos',     label: 'Insumos',      icon: '◉', roles: ['Admin', 'Inventario'] },
      { to: '/inventario/productos',   label: 'Productos',    icon: '◎', roles: ['Admin', 'Inventario'] },
      { to: '/inventario/movimientos', label: 'Movimientos',  icon: '⇅', roles: ['Admin', 'Inventario'] },
    ],
  },
  {
    title: 'Ventas',
    items: [
      { to: '/proformas',       label: 'Proformas',  icon: '◻', roles: ['Admin', 'Inventario', 'Produccion'] },
      { to: '/clientes',        label: 'Clientes',   icon: '◷', roles: ['Admin', 'Inventario'] },
    ],
  },
  {
    title: 'Admin',
    items: [
      { to: '/admin/usuarios',  label: 'Usuarios',   icon: '◑', roles: ['Admin'] },
    ],
  },
]

export function Sidebar() {
  const { hasRole } = useAuthStore()

  const visibleSections = sections
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((item) => hasRole(...item.roles)),
    }))
    .filter((sec) => sec.items.length > 0)

  return (
    <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto border-r border-neutral-100 bg-white py-4">
      {visibleSections.map((sec) => (
        <div key={sec.title} className="mb-4">
          <p className="mb-1 px-4 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            {sec.title}
          </p>
          {sec.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md mx-2 px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'border-l-[3px] border-primary-800 bg-primary-50 font-semibold text-primary-800'
                    : 'text-neutral-700 hover:bg-neutral-50 hover:text-primary-800'
                }`
              }
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  )
}
