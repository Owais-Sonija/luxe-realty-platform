import { useState, useEffect } from 'react'
import { Award, CheckCircle2 } from 'lucide-react'
import type { Agent } from '../types'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export const AgentsPage = () => {
  const getInitials = (name: string) => 
    name.split(' ').map(n => n[0]).join('').toUpperCase()

  const avatarColors = [
    'from-blue-600 to-blue-800',
    'from-emerald-600 to-emerald-800', 
    'from-violet-600 to-violet-800',
    'from-amber-500 to-orange-600',
  ]

  const getAvatarColor = (name: string) => {
    const index = name.charCodeAt(0) % avatarColors.length
    return avatarColors[index]
  }

  const [agents, setAgents] = useState<Agent[]>([])
  const [propertyCounts, setPropertyCounts] = useState<Record<string, number>>({})
  const navigate = useNavigate()

  const fetchAgentPropertyCounts = async (agentsData: Agent[]) => {
    const counts: Record<string, number> = {}
    
    for (const agent of agentsData) {
      const { count, error } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agent.id)
        .in('status', ['active', 'pending'])
      
      if (!error) {
        counts[agent.id] = count ?? 0
      }
    }
    
    setPropertyCounts(counts)
  }

  useEffect(() => {
    const fetchAgents = async () => {
      const { data } = await supabase.from('agents').select('*')
      if (data) {
        setAgents(data)
        fetchAgentPropertyCounts(data)
      }
    }
    fetchAgents()
  }, [])

  return (
    <div className="pt-24 min-h-screen bg-slate-50 pb-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Meet Our Expert Agents</h1>
          <p className="text-slate-600 text-lg">
            Our team of experienced professionals is dedicated to helping you find the perfect property.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map(agent => (
            <div key={agent.id} className="bg-white rounded-2xl p-6 shadow-md hover:-translate-y-1 transition-all border border-slate-100 group">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="w-24 h-24 rounded-3xl mx-auto mb-4 flex-shrink-0 shadow-lg overflow-hidden">
                  {agent.photo_url ? (
                    <img 
                      src={agent.photo_url} 
                      alt={agent.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor(agent.name)} flex items-center justify-center text-white text-2xl font-bold`}>
                      {getInitials(agent.name)}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900">{agent.name}</h3>
                  <div className="flex items-center text-amber-500 text-sm font-medium mt-1 gap-1">
                    <Award className="w-4 h-4" />
                    {agent.years_experience} Years Experience
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {agent.specialties?.map(spec => (
                  <span key={spec} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                    {spec}
                  </span>
                ))}
              </div>

              <p className="text-slate-600 text-sm line-clamp-2 mb-6">
                {agent.bio}
              </p>

              <div className="flex items-center gap-4 text-slate-500 text-sm mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium text-slate-700">{propertyCounts[agent.id] ?? 0}</span> Active Listings
                </div>
              </div>

              <div className="flex gap-3 mb-2">
                <a href={`tel:${agent.phone}`} className="btn-secondary flex-1 text-center text-sm py-2 px-0">
                  📞 Call
                </a>
                <a href={`mailto:${agent.email}`} className="btn-primary flex-1 text-center text-sm py-2 px-0">
                  ✉️ Email
                </a>
              </div>
              <button onClick={() => navigate('/agents/' + agent.id)} className="btn-secondary w-full text-sm mt-2">
                View Profile →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
