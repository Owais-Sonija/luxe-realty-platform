import { Link, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Building2, MessageSquare, Users } from 'lucide-react'

export const Layout = () => {
  const location = useLocation()

  const links = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Properties', path: '/admin/properties', icon: Building2 },
    { name: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare },
    { name: 'Agents', path: '/admin/agents', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 left-0">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-700 to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold">L</span>
            </div>
            <span className="text-xl font-bold text-slate-900">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {links.map(link => {
            const active = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path))
            const Icon = link.icon
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  active 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-blue-700' : 'text-slate-400'}`} />
                {link.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 pl-64 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
