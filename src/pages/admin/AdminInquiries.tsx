import { useState } from 'react'

export const AdminInquiries = () => {
  const [filter, setFilter] = useState('all')

  const inquiries = [
    { id: '1', name: 'John Smith', email: 'john@example.com', property: 'Modern Villa with Ocean View', type: 'viewing', message: 'I would like to schedule a viewing for this weekend.', status: 'new', date: 'Oct 24, 2023' },
    { id: '2', name: 'Alice Johnson', email: 'alice@example.com', property: 'Luxury Penthouse', type: 'information', message: 'Are pets allowed in this building?', status: 'replied', date: 'Oct 23, 2023' },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Inquiries</h1>
        <div className="flex bg-white border border-slate-200 p-1 rounded-xl">
          {['all', 'new', 'read', 'replied', 'closed'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
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
              <tr key={inq.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                <td className="p-4">
                  <div className="font-bold text-slate-900">{inq.name}</div>
                  <div className="text-xs text-slate-500">{inq.email}</div>
                </td>
                <td className="p-4">
                  <div className="text-slate-900 font-medium truncate max-w-[200px]">{inq.property}</div>
                  <div className="text-xs text-slate-500 capitalize">{inq.type}</div>
                </td>
                <td className="p-4">
                  <div className="text-slate-600 truncate max-w-xs">{inq.message}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                    inq.status === 'new' ? 'bg-amber-100 text-amber-700' : 
                    inq.status === 'replied' ? 'bg-emerald-100 text-emerald-700' : 
                    'bg-slate-100 text-slate-700'
                  }`}>{inq.status}</span>
                </td>
                <td className="p-4 text-slate-500">{inq.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
