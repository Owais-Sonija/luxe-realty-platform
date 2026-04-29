import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStore, useAuthStore } from '../store'
import { Home, Heart, Menu, X } from 'lucide-react'

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const favCount = useStore(s => s.favorites.length)
  const { isAdmin } = useAuthStore()
  const location = useLocation()
  
  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    !scrolled && isHome 
      ? 'bg-transparent py-6' 
      : 'bg-white/95 backdrop-blur-md shadow-sm py-4'
  }`
  
  const textClass = !scrolled && isHome ? 'text-white' : 'text-slate-600'
  const hoverClass = !scrolled && isHome ? 'hover:text-blue-200' : 'hover:text-blue-700'
  const activeClass = !scrolled && isHome ? 'text-white font-semibold' : 'text-blue-700 font-semibold'

  const links = [
    { name: 'Properties', path: '/properties' },
    { name: 'Agents', path: '/agents' },
    { name: 'Mortgage', path: '/mortgage' },
  ]

  return (
    <nav className={navClasses}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-700 to-blue-500 rounded-xl flex items-center justify-center shadow-fab">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className={`text-xl font-bold ${!scrolled && isHome ? 'text-white' : 'text-slate-900'}`}>
            Luxe<span className={!scrolled && isHome ? 'text-blue-200' : 'text-blue-700'}>Realty</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`font-medium transition-colors ${location.pathname.startsWith(link.path) && link.path !== '/' ? activeClass : `${textClass} ${hoverClass}`}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/favorites" className={`relative p-2 rounded-full transition-colors ${textClass} ${hoverClass}`}>
            <Heart className="w-6 h-6" />
            {favCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-amber-500 text-white text-xs flex items-center justify-center rounded-full font-bold">
                {favCount}
              </span>
            )}
          </Link>
          {isAdmin && (
            <Link to="/admin" className={`font-medium ${textClass} ${hoverClass}`}>Admin</Link>
          )}
          <Link to="/admin/login" className={`font-medium ${textClass} ${hoverClass} text-sm opacity-80 hover:opacity-100`}>Sign In</Link>
        </div>

        <button 
          className="md:hidden text-slate-900"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className={`w-7 h-7 ${!scrolled && isHome ? 'text-white' : 'text-slate-900'}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col p-6">
          <div className="flex justify-end">
            <button onClick={() => setMobileOpen(false)} className="p-2">
              <X className="w-8 h-8 text-slate-900" />
            </button>
          </div>
          <div className="flex flex-col gap-6 text-2xl font-semibold mt-8">
            {links.map(link => (
              <Link 
                key={link.name} 
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="text-slate-900 hover:text-blue-700"
              >
                {link.name}
              </Link>
            ))}
            <Link to="/favorites" onClick={() => setMobileOpen(false)} className="text-slate-900 hover:text-blue-700 flex items-center gap-2">
              Favorites <span className="bg-amber-500 text-white text-sm px-3 py-1 rounded-full">{favCount}</span>
            </Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-slate-900 hover:text-blue-700">Admin</Link>
            )}
            <Link to="/admin/login" onClick={() => setMobileOpen(false)} className="text-slate-900 hover:text-blue-700">Sign In</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
