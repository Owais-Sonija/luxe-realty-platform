import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export const AdminAgents = () => {
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [propertyCounts, setPropertyCounts] = useState<Record<string, number>>({})

  const fetchPropertyCounts = async (agentList: any[]) => {
    const counts: Record<string, number> = {}
    for (const agent of agentList) {
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agent.id)
      counts[agent.id] = count ?? 0
    }
    setPropertyCounts(counts)
  }

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('name')
      
      if (error) throw error
      if (data) {
        setAgents(data)
        fetchPropertyCounts(data)
      }
    } catch (err) {
      console.error('Agents error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAgents() }, [])

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const avatarColors = [
    'bg-blue-600', 'bg-emerald-600', 
    'bg-violet-600', 'bg-amber-500',
    'bg-rose-600', 'bg-cyan-600'
  ]

  const getColor = (name: string) =>
    avatarColors[name.charCodeAt(0) % avatarColors.length]

  const deleteAgent = async (id: string) => {
    if (!window.confirm('Delete this agent?')) return
    
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id)
    
    if (!error) {
      setAgents(prev => prev.filter(a => a.id !== id))
    } else {
      console.error('Delete error:', error)
      alert('Failed to delete agent')
    }
  }

  const [editingAgent, setEditingAgent] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    years_experience: 0,
    specialties: [] as string[]
  })

  const handleEdit = (agent: any) => {
    setEditingAgent(agent)
    setEditForm({
      name: agent.name,
      email: agent.email,
      phone: agent.phone ?? '',
      bio: agent.bio ?? '',
      years_experience: agent.years_experience ?? 0,
      specialties: agent.specialties ?? []
    })
  }

  const handleSaveEdit = async () => {
    if (!editingAgent) return
    
    const { error } = await supabase
      .from('agents')
      .update({
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || null,
        bio: editForm.bio || null,
        years_experience: editForm.years_experience,
        specialties: editForm.specialties
      })
      .eq('id', editingAgent.id)
    
    if (!error) {
      setAgents(prev => prev.map(a => 
        a.id === editingAgent.id 
          ? { ...a, ...editForm } 
          : a
      ))
      setEditingAgent(null)
    } else {
      console.error('Update error:', error)
      alert('Failed to update agent')
    }
  }

  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({
    name: '', email: '', phone: '', bio: '',
    years_experience: 0, specialties: [] as string[]
  })
  const [addError, setAddError] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  const handleAddAgent = async () => {
    if (!addForm.name.trim() || !addForm.email.trim()) {
      setAddError('Name and email are required')
      return
    }
    setAddLoading(true)
    setAddError('')
    try {
      const { data, error } = await supabase
        .from('agents')
        .insert({
          name: addForm.name.trim(),
          email: addForm.email.trim(),
          phone: addForm.phone || null,
          bio: addForm.bio || null,
          years_experience: addForm.years_experience,
          specialties: addForm.specialties
        })
        .select()
        .single()
      
      if (error) throw error
      setAgents(prev => [...prev, data])
      setShowAddModal(false)
      setAddForm({
        name: '', email: '', phone: '', bio: '',
        years_experience: 0, specialties: []
      })
      setPropertyCounts(prev => ({ ...prev, [data.id]: 0 }))
    } catch (err: any) {
      setAddError(err.message ?? 'Failed to add agent')
    } finally {
      setAddLoading(false)
    }
  }

  return (
    <>
      <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Manage Agents</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-700 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <div key={agent.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={() => handleEdit(agent)}
                className="btn-secondary text-sm px-3 py-1.5"
              >
                ✏️ Edit
              </button>
              <button 
                onClick={() => deleteAgent(agent.id)}
                className="bg-red-50 hover:bg-red-100 text-red-600 
                border border-red-200 text-sm px-3 py-1.5 
                rounded-xl transition-colors"
              >
                🗑️ Delete
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 mb-4 shadow-sm ${getColor(agent.name)}`}>
                {agent.photo_url ? (
                  <img src={agent.photo_url} alt={agent.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : getInitials(agent.name)}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{agent.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{agent.email}</p>
              
              <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
                <div>
                  <div className="text-xs text-slate-500 font-medium mb-1">Phone</div>
                  <div className="text-sm text-slate-900">{agent.phone}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium mb-1">Listings</div>
                  <div className="text-sm text-slate-900 font-bold">{propertyCounts[agent.id] ?? 0}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold mb-4">Add New Agent</h3>
            {addError && (
              <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 text-sm mb-4">
                {addError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input value={addForm.name}
                  onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                  className="input-field" placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input value={addForm.email}
                  onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                  className="input-field" placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input value={addForm.phone}
                  onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))}
                  className="input-field" placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Years Experience</label>
                <input type="number" min="0" max="50"
                  value={addForm.years_experience}
                  onChange={e => setAddForm(p => ({ ...p, years_experience: Number(e.target.value) }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                <textarea value={addForm.bio}
                  onChange={e => setAddForm(p => ({ ...p, bio: e.target.value }))}
                  rows={3} className="input-field" placeholder="Agent biography..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setAddError('')
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAgent}
                disabled={addLoading}
                className="btn-primary flex-1"
              >
                {addLoading ? 'Adding...' : 'Add Agent'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingAgent && (
        <div className="fixed inset-0 bg-black/50 flex 
        items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 
          w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-bold mb-4">
              Edit Agent
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium 
                text-slate-700 mb-1">Name *</label>
                <input
                  value={editForm.name}
                  onChange={e => setEditForm(p => ({
                    ...p, name: e.target.value
                  }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium 
                text-slate-700 mb-1">Email *</label>
                <input
                  value={editForm.email}
                  onChange={e => setEditForm(p => ({
                    ...p, email: e.target.value
                  }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium 
                text-slate-700 mb-1">Phone</label>
                <input
                  value={editForm.phone}
                  onChange={e => setEditForm(p => ({
                    ...p, phone: e.target.value
                  }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium 
                text-slate-700 mb-1">Years Experience</label>
                <input
                  type="number"
                  value={editForm.years_experience}
                  onChange={e => setEditForm(p => ({
                    ...p, 
                    years_experience: Number(e.target.value)
                  }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium 
                text-slate-700 mb-1">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={e => setEditForm(p => ({
                    ...p, bio: e.target.value
                  }))}
                  rows={3}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingAgent(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn-primary flex-1"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
