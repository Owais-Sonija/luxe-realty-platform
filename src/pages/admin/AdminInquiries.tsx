import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store'
export const AdminInquiries = () => {
  const [statusFilter, setStatusFilter] = useState('all')
  const [inquiries, setInquiries] = useState<any[]>([])
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

  const fetchInquiries = async () => {
    try {
      let query = supabase
        .from('inquiries')
        .select('*, properties(title, property_type)')
        .order('created_at', { ascending: false })
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      setInquiries(data ?? [])
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Inquiries error:', err)
      }
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [statusFilter])

  const updateStatus = async (
    id: string, 
    status: string
  ) => {
    const { error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id)
    
    if (!error) {
      setInquiries(prev => prev.map(inq => 
        inq.id === id ? { ...inq, status } : inq
      ))
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Inquiries</h1>
        <div className="flex bg-white border border-slate-200 p-1 rounded-xl">
          {['all', 'new', 'read', 'replied', 'closed'].map(f => (
            <button 
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${statusFilter === f ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
              <th className="p-4 font-medium">Contact</th>
              <th className="p-4 font-medium">Property & Type</th>
              <th className="p-4 font-medium">Message</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {inquiries.map(inq => (
              <tr key={inq.id} className="hover:bg-slate-50 border-b border-slate-100">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">
                    {inq.name}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {inq.email}
                  </p>
                  {inq.phone && (
                    <p className="text-slate-400 text-xs">
                      {inq.phone}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-slate-700 text-sm">
                    {inq.properties?.title ?? 'General Inquiry'}
                  </p>
                  <p className="text-slate-400 text-xs capitalize">
                    {inq.inquiry_type}
                  </p>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-slate-600 text-sm truncate">
                    {inq.message}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={inq.status}
                    onChange={e => updateStatus(inq.id, e.target.value)}
                    className="text-xs border border-slate-200 
                    rounded-lg px-2 py-1 bg-white"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-slate-500 text-sm">
                  {new Date(inq.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
