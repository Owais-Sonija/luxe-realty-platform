import { BrowserRouter, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Layout as AdminLayout } from './components/admin/Layout'
import { HomePage } from './pages/HomePage'
import { PropertiesPage } from './pages/PropertiesPage'
import { PropertyDetailPage } from './pages/PropertyDetailPage'
import { AgentsPage } from './pages/AgentsPage'
import AgentDetailPage from './pages/AgentDetailPage'
import { MortgagePage } from './pages/MortgagePage'
import { FavoritesPage } from './pages/FavoritesPage'
import { AdminLogin } from './pages/admin/AdminLogin'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminProperties } from './pages/admin/AdminProperties'
import { AdminInquiries } from './pages/admin/AdminInquiries'
import { AdminAgents } from './pages/admin/AdminAgents'
import { useAuthStore } from './store'
import { useEffect } from 'react'
import { supabase } from './lib/supabase'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin } = useAuthStore()
  
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  const { checkAdmin } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        useAuthStore.setState({ user: session.user })
        checkAdmin()
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        useAuthStore.setState({ user: session.user })
        checkAdmin()
      } else {
        useAuthStore.setState({ user: null, isAdmin: false })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Outlet />
            </main>
            <footer className="bg-slate-900 text-slate-400 py-12">
              <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-700 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">L</span>
                    </div>
                    <span className="text-xl font-bold text-white">LuxeRealty</span>
                  </div>
                  <p className="text-sm">Premium real estate platform for finding your dream home.</p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link to="/properties" className="hover:text-white transition-colors">Properties</Link></li>
                    <li><Link to="/agents" className="hover:text-white transition-colors">Agents</Link></li>
                    <li><Link to="/mortgage" className="hover:text-white transition-colors">Mortgage Calculator</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-4">Property Types</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link to="/properties" className="hover:text-white transition-colors">Houses</Link></li>
                    <li><Link to="/properties" className="hover:text-white transition-colors">Apartments</Link></li>
                    <li><Link to="/properties" className="hover:text-white transition-colors">Villas</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-4">Contact</h4>
                  <ul className="space-y-2 text-sm">
                    <li>123 Realty Street</li>
                    <li>Beverly Hills, CA 90210</li>
                    <li>contact@luxerealty.com</li>
                    <li>(555) 123-4567</li>
                  </ul>
                </div>
              </div>
              <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-sm text-center">
                &copy; {new Date().getFullYear()} LuxeRealty. All rights reserved.
              </div>
            </footer>
          </div>
        }>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/agents/:id" element={<AgentDetailPage />} />
          <Route path="/mortgage" element={<MortgagePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="agents" element={<AdminAgents />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
