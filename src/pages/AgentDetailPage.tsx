import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Agent, Property } from '../types'
import { PropertyCard } from '../components/PropertyCard'
import { Footer } from '../components/Footer'

export default function AgentDetailPage() {
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

  const { id } = useParams()
  const navigate = useNavigate()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAgent = async () => {
      const { data: agentData } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single()
      
      if (!agentData) {
        navigate('/agents')
        return
      }
      setAgent(agentData)

      const { data: propsData } = await supabase
        .from('properties')
        .select('*, agents(*), areas(*)')
        .eq('agent_id', id)
        .in('status', ['active', 'pending'])
      
      setProperties(propsData ?? [])
      setLoading(false)
    }
    if (id) {
      fetchAgent()
    }
  }, [id, navigate])

  if (loading) return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700" />
      </div>
    </div>
  )

  if (!agent) return null

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-8">
            <div className="w-32 h-32 rounded-3xl flex-shrink-0 shadow-2xl overflow-hidden">
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
                <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor(agent.name)} flex items-center justify-center text-white text-4xl font-bold`}>
                  {getInitials(agent.name)}
                </div>
              )}
            </div>
            
            <div>
              <p className="text-blue-300 text-sm font-medium mb-1">Real Estate Agent</p>
              <h1 className="text-4xl font-bold text-white mb-2">
                {agent.name}
              </h1>
              <p className="text-slate-300 mb-4">
                {agent.years_experience} years experience
              </p>
              
              <div className="flex flex-wrap gap-2">
                {(agent.specialties ?? []).map(s => (
                  <span key={s} className="bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full px-3 py-1 text-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="ml-auto flex flex-col gap-3">
              {agent.phone && (
                <a href={`tel:${agent.phone}`} className="btn-secondary text-center bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white">
                  📞 {agent.phone}
                </a>
              )}
              <a href={`mailto:${agent.email}`} className="btn-primary text-center">
                ✉️ {agent.email}
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        {agent.bio && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              About {agent.name}
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {agent.bio}
            </p>
            {agent.license_number && (
              <p className="text-slate-400 text-sm mt-3">
                License: {agent.license_number}
              </p>
            )}
          </div>
        )}
        
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Current Listings ({properties.length})
        </h2>
        
        {properties.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No active listings at this time
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
