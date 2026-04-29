import { Plus, Edit, Trash2 } from 'lucide-react'

export const AdminAgents = () => {
  const agents = [
    { id: '1', name: 'Sarah Jenkins', email: 'sarah@luxerealty.com', phone: '(555) 123-4567', listings: 12, photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150' },
    { id: '2', name: 'Michael Chen', email: 'michael@luxerealty.com', phone: '(555) 987-6543', listings: 8, photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150' },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Manage Agents</h1>
        <button className="bg-blue-700 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <div key={agent.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="p-1.5 text-slate-400 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-slate-400 hover:text-red-700 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <img src={agent.photo} alt={agent.name} className="w-20 h-20 rounded-full object-cover mb-4 shadow-sm" />
              <h3 className="text-lg font-bold text-slate-900">{agent.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{agent.email}</p>
              
              <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
                <div>
                  <div className="text-xs text-slate-500 font-medium mb-1">Phone</div>
                  <div className="text-sm text-slate-900">{agent.phone}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium mb-1">Listings</div>
                  <div className="text-sm text-slate-900 font-bold">{agent.listings}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
