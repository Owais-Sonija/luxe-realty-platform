import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SearchBar } from '../components/SearchBar'
import { PropertyCard } from '../components/PropertyCard'
import { MortgageCalculator } from '../components/MortgageCalculator'
import type { Property } from '../types'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const propertyTypes = [
  { type: 'house', label: 'Houses', emoji: '🏠' },
  { type: 'apartment', label: 'Apartments', emoji: '🏢' },
  { type: 'condo', label: 'Condos', emoji: '🏙️' },
  { type: 'townhouse', label: 'Townhouses', emoji: '🏘️' },
  { type: 'villa', label: 'Villas', emoji: '🏡' },
  { type: 'commercial', label: 'Commercial', emoji: '🏬' },
]

export const HomePage = () => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({})
  const navigate = useNavigate()

  const handleTypeClick = (type: string) => {
    navigate('/properties?property_type=' + type)
  }

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from('properties')
        .select('*, agents(*), areas(*)')
        .eq('is_featured', true)
        .limit(3)
      if (data) setFeaturedProperties(data)
    }
    fetchFeatured()

    const fetchCounts = async () => {
      const counts: Record<string, number> = {}
      for (const t of propertyTypes) {
        const { count } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('property_type', t.type)
          .in('status', ['active', 'pending'])
        counts[t.type] = count || 0
      }
      setTypeCounts(counts)
    }
    fetchCounts()
  }, [])

  return (
    <div className="min-h-screen">
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000" alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-950/80 to-slate-900/90" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 mt-20">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <span className="inline-block bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full px-4 py-2 text-sm font-medium mb-6 backdrop-blur-sm">
              ✦ Premium Real Estate Platform
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Find Your <br/><span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">Dream Home</span>
            </h1>
            <p className="text-slate-300 text-xl max-w-2xl mx-auto mb-10">
              Discover premium properties, connect with expert agents, and find the perfect place to call your own.
            </p>
            
            <div className="flex justify-center gap-12 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-1">500+</div>
                <div className="text-slate-400 font-medium">Properties</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-1">50+</div>
                <div className="text-slate-400 font-medium">Expert Agents</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-1">2k+</div>
                <div className="text-slate-400 font-medium">Happy Clients</div>
              </div>
            </div>
          </div>
          
          <div className="-mb-32">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="py-32 bg-slate-50">
        <div className="container mx-auto px-4 mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Featured Properties</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Handpicked premium listings tailored for you.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProperties.map(prop => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/properties" className="btn-secondary inline-block">
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Browse by Type</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Explore properties across different categories.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {propertyTypes.map(item => (
              <div
                key={item.type}
                onClick={() => handleTypeClick(item.type)}
                className="card p-6 cursor-pointer hover:-translate-y-1 
                text-center group"
              >
                <span className="text-5xl mb-3 block">{item.emoji}</span>
                <h3 className="font-bold text-slate-900 text-lg mb-1">
                  {item.label}
                </h3>
                <p className="text-slate-500 text-sm">
                  {typeCounts[item.type] ?? 0} listings
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Calculate Your Monthly Payment</h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Use our advanced mortgage calculator to estimate your monthly payments. Adjust the home price, down payment, and interest rate to see how it affects your costs.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Accurate principal and interest breakdown',
                  'Includes estimated taxes and insurance',
                  'Real-time updates as you adjust values'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">✓</div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/mortgage" className="btn-primary inline-block">Learn More About Mortgages</Link>
            </div>
            <div>
              <MortgageCalculator />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-600" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Find Your Dream Home?</h2>
          <p className="text-blue-100 text-xl max-w-2xl mx-auto mb-10">
            Join thousands of satisfied homeowners who found their perfect property with LuxeRealty.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/properties" className="bg-white text-blue-700 hover:bg-slate-50 font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:-translate-y-0.5">
              Browse Properties
            </Link>
            <Link to="/agents" className="bg-blue-700 text-white hover:bg-blue-600 border border-blue-500 font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:-translate-y-0.5">
              Contact an Agent
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
