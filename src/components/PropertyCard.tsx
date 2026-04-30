import type { Property } from '../types'
import { formatPrice, getTypeColor, getStatusColor } from '../utils/format'
import { useStore } from '../store'
import { Heart, MapPin, BedDouble, Bath, Square } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  const { isFavorite, addFavorite, removeFavorite } = useStore()
  const favorite = isFavorite(property.id)
  const [copied, setCopied] = useState(false)

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const url = window.location.origin + '/properties/' + property.id
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: url
        })
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    if (favorite) removeFavorite(property.id)
    else addFavorite(property.id)
  }

  return (
    <Link to={`/properties/${property.id}`} className="card group cursor-pointer block hover:-translate-y-1 relative">
      <div className="h-56 relative overflow-hidden bg-slate-100">
        <img 
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'} 
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        
        <div className="absolute top-4 left-4">
          <span className={`badge ${property.listing_type === 'sale' ? 'bg-blue-700 text-white' : 'bg-emerald-600 text-white'}`}>
            For {property.listing_type === 'sale' ? 'Sale' : 'Rent'}
          </span>
        </div>
        
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button 
            onClick={handleShare}
            title="Share property"
            className="px-3 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors hover:bg-white shadow-sm text-sm font-medium text-slate-700"
          >
            {copied ? '✓ Copied!' : '⬆ Share'}
          </button>
          <button 
            onClick={toggleFavorite}
            className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors hover:bg-white shadow-sm"
          >
            <Heart className={`w-5 h-5 transition-colors ${favorite ? 'fill-red-500 text-red-500' : 'text-slate-400 hover:text-red-500'}`} />
          </button>
        </div>

        {property.status !== 'active' && (
          <div className="absolute bottom-4 left-4">
            <span className={`badge capitalize ${getStatusColor(property.status)}`}>{property.status}</span>
          </div>
        )}
        
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md">
            1/{property.images.length}
          </div>
        )}
      </div>

      <div className="p-5 relative pb-16 bg-white">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold text-slate-900">
            {formatPrice(property.price, property.listing_type)}
          </span>
          <span className={`badge capitalize ${getTypeColor(property.property_type)}`}>
            {property.property_type}
          </span>
        </div>

        <h3 className="text-base font-semibold text-slate-800 truncate mb-2">
          {property.title}
        </h3>

        <div className="flex items-center text-slate-500 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">{property.city}, {property.state}</span>
        </div>

        <div className="border-t border-slate-100 my-4" />

        <div className="flex items-center justify-between text-slate-600 text-sm mb-4">
          <div className="flex items-center gap-1.5">
            <BedDouble className="w-4 h-4 text-slate-400" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-slate-400" />
            <span>{property.bathrooms} Baths</span>
          </div>
          {property.area_sqft && (
            <div className="flex items-center gap-1.5">
              <Square className="w-4 h-4 text-slate-400" />
              <span>{property.area_sqft.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        {property.agents && (
          <div className="flex items-center gap-2 mt-4">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
              {property.agents.name.charAt(0)}
            </div>
            <span className="text-slate-500 text-xs truncate">{property.agents.name}</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-blue-700 text-white text-center py-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-semibold z-10">
        View Details
      </div>
    </Link>
  )
}
