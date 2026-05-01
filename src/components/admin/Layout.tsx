import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Building2, MessageSquare, Users } from 'lucide-react'
import { useAuthStore } from '../../store'

export const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuthStore()

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

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
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium mt-auto"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </nav>
        
        <div className="px-4 py-3 border-t border-slate-200">
          <div className="flex flex-col gap-1">
            <p className="text-slate-400 text-xs text-center">
              Built by
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <a
                href="https://github.com/Owais-Sonija"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors text-xs"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                Owais Sonija
              </a>
              <span className="text-slate-300 text-xs">·</span>
              <a
                href="https://dr-owais-sonija-developer-portfolio-website.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-700 transition-colors text-xs"
              >
                Portfolio
              </a>
              <span className="text-slate-300 text-xs">·</span>
              <a
                href="http://martz.live/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-700 transition-colors text-xs"
              >
                martz.live
              </a>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 pl-64 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
