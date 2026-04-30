import { useState, useEffect } from 'react'
import { Building2, MessageSquare } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store'

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0, forSale: 0, forRent: 0, 
    active: 0, pending: 0, soldRented: 0
  })
  const [newInquiries, setNewInquiries] = useState(0)
  const [recentInquiries, setRecentInquiries] = useState<any[]>([])
  const [resourceStats, setResourceStats] = useState({
    propCount: 0,
    agentCount: 0,
    inquiryCount: 0
  })
  const { isAdmin, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin/login')
      return
    }
    if (!isAdmin) {
      navigate('/admin/login')
      return
    }
  }, [isAuthenticated, isAdmin, navigate])
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Total properties count by status
        const { data: propStats } = await supabase
          .from('properties')
          .select('status, listing_type')
        
        const total = propStats?.length ?? 0
        const forSale = propStats?.filter(
          p => p.listing_type === 'sale' && 
          p.status === 'active'
        ).length ?? 0
        const forRent = propStats?.filter(
          p => p.listing_type === 'rent' && 
          p.status === 'active'
        ).length ?? 0
        const active = propStats?.filter(
          p => p.status === 'active'
        ).length ?? 0
        const pending = propStats?.filter(
          p => p.status === 'pending'
        ).length ?? 0
        const soldRented = propStats?.filter(
          p => p.status === 'sold' || 
          p.status === 'rented'
        ).length ?? 0

        setStats({ 
          total, forSale, forRent, 
          active, pending, soldRented 
        })

        // New inquiries count
        const { count: inquiryCount } = await supabase
          .from('inquiries')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'new')
        
        setNewInquiries(inquiryCount ?? 0)

        // Recent inquiries (real data)
        const { data: recentInq } = await supabase
          .from('inquiries')
          .select('*, properties(title)')
          .order('created_at', { ascending: false })
          .limit(5)
        
        setRecentInquiries(recentInq ?? [])

        const { count: propCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })

        const { count: agentCount } = await supabase
          .from('agents')
          .select('*', { count: 'exact', head: true })

        const { count: inquiryCountTotal } = await supabase
          .from('inquiries')
          .select('*', { count: 'exact', head: true })

        setResourceStats({
          propCount: propCount ?? 0,
          agentCount: agentCount ?? 0,
          inquiryCount: inquiryCountTotal ?? 0
        })

      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Dashboard error:', err)
        }
      }
    }
    fetchStats()
  }, [])

  const activePercent = stats.total > 0 
    ? Math.round(stats.active / stats.total * 100) : 0
  const pendingPercent = stats.total > 0 
    ? Math.round(stats.pending / stats.total * 100) : 0
  const soldPercent = stats.total > 0 
    ? Math.round(stats.soldRented / stats.total * 100) : 0
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500">Welcome back to the admin portal.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/properties" className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 transition-colors">
            Add Property
          </Link>
          <Link to="/admin/agents" className="bg-blue-700 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors">
            Add Agent
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Properties', value: stats.total, icon: Building2, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'For Sale', value: stats.forSale, icon: Building2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'For Rent', value: stats.forRent, icon: Building2, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'New Inquiries', value: newInquiries, icon: MessageSquare, color: 'text-purple-700', bg: 'bg-purple-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-slate-500 font-medium">{stat.label}</h3>
            </div>
            <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Inquiries</h2>
            <Link to="/admin/inquiries" className="text-blue-700 text-sm font-medium hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-500 text-sm border-b border-slate-100">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Property</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentInquiries.map(inq => (
                  <tr key={inq.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 font-medium text-slate-900">{inq.name}</td>
                    <td className="py-3 text-slate-600">{inq.properties?.title ?? 'General'}</td>
                    <td className="py-3"><span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-semibold">{inq.status}</span></td>
                    <td className="py-3 text-slate-500">{new Date(inq.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Properties by Status</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 font-medium">Active</span>
                <span className="text-slate-900 font-bold">{activePercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${activePercent}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 font-medium">Pending</span>
                <span className="text-slate-900 font-bold">{pendingPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${pendingPercent}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 font-medium">Sold/Rented</span>
                <span className="text-slate-900 font-bold">{soldPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${soldPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            📊 Resource Usage (Free Tier)
          </h3>
          <div className="space-y-3">
            {[
              { 
                label: 'Properties', 
                used: resourceStats.propCount, 
                max: 20,
                color: 'blue'
              },
              { 
                label: 'Agents', 
                used: resourceStats.agentCount, 
                max: 10,
                color: 'emerald'
              },
              { 
                label: 'Inquiries', 
                used: resourceStats.inquiryCount, 
                max: 50,
                color: 'violet'
              },
            ].map(item => {
              const pct = Math.min(
                Math.round(item.used / item.max * 100), 100
              )
              const isWarning = pct >= 80
              const isFull = pct >= 100
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 font-medium">
                      {item.label}
                    </span>
                    <span className={
                      isFull ? 'text-red-600 font-bold' :
                      isWarning ? 'text-amber-600 font-semibold' :
                      'text-slate-500'
                    }>
                      {item.used}/{item.max}
                      {isFull ? ' FULL' : 
                       isWarning ? ' Almost full' : ''}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div 
                      className={`h-2 rounded-full transition-all ${isFull ? 'bg-red-500' : isWarning ? 'bg-amber-500' : `bg-${item.color}-500`}`}
                      style={{ width: pct + '%' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-slate-400 text-xs mt-4">
            Auto-cleanup runs when limits are reached.
            Featured properties are protected from auto-deletion.
          </p>
        </div>
      </div>
    </div>
  )
}
