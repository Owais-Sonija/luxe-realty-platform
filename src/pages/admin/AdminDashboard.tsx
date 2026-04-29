import { Building2, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'

export const AdminDashboard = () => {
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
          { label: 'Total Properties', value: '142', icon: Building2, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'For Sale', value: '85', icon: Building2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'For Rent', value: '57', icon: Building2, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'New Inquiries', value: '12', icon: MessageSquare, color: 'text-purple-700', bg: 'bg-purple-50' },
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
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 font-medium text-slate-900">John Doe {i}</td>
                    <td className="py-3 text-slate-600">Modern Villa in Malibu</td>
                    <td className="py-3"><span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-semibold">New</span></td>
                    <td className="py-3 text-slate-500">Today</td>
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
                <span className="text-slate-900 font-bold">60%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 font-medium">Pending</span>
                <span className="text-slate-900 font-bold">15%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 font-medium">Sold/Rented</span>
                <span className="text-slate-900 font-bold">25%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
