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
