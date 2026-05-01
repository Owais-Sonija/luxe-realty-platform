import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HeartCrack } from 'lucide-react'
import { useStore } from '../store'
import { PropertyCard } from '../components/PropertyCard'
import type { Property } from '../types'
import { supabase } from '../lib/supabase'
import { Footer } from '../components/Footer'

export const FavoritesPage = () => {
  const { favorites } = useStore()
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!favorites || favorites.length === 0) {
      setLoading(false)
      return
    }
    
    const fetchFavorites = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('properties')
        .select('*, agents(*), areas(*)')
        .in('id', favorites)
      
      if (error) {
        if (import.meta.env.DEV) {
          console.error('Favorites error:', error)
        }
        setLoading(false)
        return
      }
      
      setFavoriteProperties(data ?? [])
      setLoading(false)
    }
    
    fetchFavorites()
  }, [favorites])

  if (loading) return <div className="pt-32 min-h-screen text-center">Loading...</div>

  return (
    <div className="pt-24 min-h-screen bg-slate-50 pb-24">
      <div className="container mx-auto px-4">
        {favorites.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartCrack className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">No Saved Properties Yet</h2>
            <p className="text-slate-600 mb-8">
              Start browsing to save your favorite properties and view them later.
            </p>
            <Link to="/properties" className="btn-primary inline-block">
              Browse Properties
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                My Saved Properties <span className="text-slate-500 font-normal">({favorites.length})</span>
              </h1>
              <button 
                onClick={() => useStore.getState().favorites.forEach(id => useStore.getState().removeFavorite(id))}
                className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
              >
                Remove All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteProperties.map(prop => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
