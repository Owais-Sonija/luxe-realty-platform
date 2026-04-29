import { useState } from 'react'
import { Plus, Edit, Trash2, Star, Eye } from 'lucide-react'
import { formatPrice, getStatusColor, getTypeColor } from '../../utils/format'

export const AdminProperties = () => {
  const [properties, setProperties] = useState([
    { id: '1', title: 'Modern Villa with Ocean View', price: 2500000, listing_type: 'sale', property_type: 'villa', status: 'active', is_featured: true, views: 1240, agent_name: 'Sarah Jenkins', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=200' },
    { id: '2', title: 'Luxury Penthouse', price: 15000, listing_type: 'rent', property_type: 'apartment', status: 'active', is_featured: true, views: 890, agent_name: 'Michael Chen', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=200' },
  ])

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Manage Properties</h1>
        <button className="bg-blue-700 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Property
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Property</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Agent</th>
                <th className="p-4 font-medium">Views</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {properties.map(prop => (
                <tr key={prop.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={prop.image} alt={prop.title} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          {prop.title}
                          {prop.is_featured && <Star className="w-3 h-3 fill-amber-500 text-amber-500" />}
                        </div>
                        <div className="text-xs text-slate-500">ID: {prop.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className={`badge capitalize self-start ${getTypeColor(prop.property_type)}`}>{prop.property_type}</span>
                      <span className="text-xs font-medium text-slate-500">For {prop.listing_type}</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-900">{formatPrice(prop.price, prop.listing_type)}</td>
                  <td className="p-4">
                    <span className={`badge capitalize ${getStatusColor(prop.status)}`}>{prop.status}</span>
                  </td>
                  <td className="p-4 text-slate-600">{prop.agent_name}</td>
                  <td className="p-4 text-slate-600 flex items-center gap-1 mt-2"><Eye className="w-4 h-4" /> {prop.views}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-700 bg-white hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-700 bg-white hover:bg-red-50 rounded-lg border border-slate-200 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
