import { useState, useEffect } from 'react'
import { LayoutGrid, List, Map as MapIcon, SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useStore } from '../store'
import { PropertyCard } from '../components/PropertyCard'
import { PropertyMap } from '../components/PropertyMap'
import { PROPERTY_FEATURES } from '../types'
import type { Property } from '../types'

export const PropertiesPage = () => {
  const { filters } = useStore()
  const [localFilters, setLocalFilters] = useState({
    listing_type: 'all',
    property_type: 'all',
    city: '',
    min_price: null as number | null,
    max_price: null as number | null,
    min_beds: null as number | null,
    query: '',
    state: '',
    features: [] as string[]
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const [sortBy, setSortBy] = useState('default')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  const handleClearAll = () => {
    // Reset state first
    setLocalFilters({
      listing_type: 'all',
      property_type: 'all',
      city: '',
      min_price: null,
      max_price: null,
      min_beds: null,
      query: '',
      state: '',
      features: []
    })
    // Then navigate to clear URL params
    // Small timeout to let state update first
    setTimeout(() => {
      navigate('/properties', { replace: true })
    }, 10)
  }

  const handleRemoveFilter = (key: string) => {
    const newFilters = {
      ...localFilters,
      [key]: key === 'listing_type' || 
             key === 'property_type' 
        ? 'all' 
        : key === 'city' || key === 'query' 
        ? ''
        : null
    }
    setLocalFilters(newFilters as any)
    setTimeout(() => {
      navigate('/properties', { replace: true })
    }, 10)
  }

  const fetchWithFilters = async (filters: typeof localFilters) => {
    setLoading(true)
    try {
      let query_builder = supabase
        .from('properties')
        .select('*, agents(*), areas(*)', { count: 'exact' })

      if (filters.listing_type !== 'all') {
        query_builder = query_builder.eq(
          'listing_type', filters.listing_type)
      }
      if (filters.property_type !== 'all') {
        query_builder = query_builder.eq(
          'property_type', filters.property_type)
      }
      if (filters.city?.trim()) {
        query_builder = query_builder.ilike(
          'city', `%${filters.city.trim()}%`)
      }
      if (filters.min_price && Number(filters.min_price) > 0) {
        query_builder = query_builder.gte(
          'price', Number(filters.min_price))
      }
      if (filters.max_price && Number(filters.max_price) > 0) {
        query_builder = query_builder.lte(
          'price', Number(filters.max_price))
      }
      if (filters.min_beds && Number(filters.min_beds) > 0) {
        query_builder = query_builder.gte(
          'bedrooms', Number(filters.min_beds))
      }
      if (filters.query?.trim()) {
        query_builder = query_builder.or(
          `title.ilike.%${filters.query.trim()}%,` +
          `city.ilike.%${filters.query.trim()}%`
        )
      }

      switch(sortBy) {
        case 'price_asc':
          query_builder = query_builder.order(
            'price', { ascending: true })
          break
        case 'price_desc':
          query_builder = query_builder.order(
            'price', { ascending: false })
          break
        case 'newest':
          query_builder = query_builder.order(
            'created_at', { ascending: false })
          break
        case 'beds':
          query_builder = query_builder.order(
            'bedrooms', { ascending: false })
          break
        default:
          query_builder = query_builder
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false })
      }

      const from = (page - 1) * 20
      query_builder = query_builder.range(from, from + 19)

      const { data, error, count } = await query_builder

      if (error) {
        console.error('Error:', error)
        setProperties([])
        setTotalCount(0)
        return
      }

      setProperties(data ?? [])
      setTotalCount(count ?? 0)
    } catch (err) {
      console.error('Catch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const hasParams = searchParams.toString().length > 0
    
    if (hasParams) {
      // Read from URL params
      const listing_type = searchParams.get('listing_type')
      const property_type = searchParams.get('property_type')
      const city = searchParams.get('city')
      const min_price = searchParams.get('min_price')
      const max_price = searchParams.get('max_price')
      const min_beds = searchParams.get('min_beds')
      const query = searchParams.get('query')
      
      const activeFilters = {
        listing_type: (listing_type as any) ?? 'all',
        property_type: (property_type as any) ?? 'all',
        city: city ?? '',
        min_price: min_price ? Number(min_price) : null,
        max_price: max_price ? Number(max_price) : null,
        min_beds: min_beds ? Number(min_beds) : null,
        query: query ?? '',
        state: '',
        features: []
      }
      setLocalFilters(activeFilters)
      fetchWithFilters(activeFilters)
    } else {
      // No params - use current localFilters
      fetchWithFilters(localFilters)
    }
  }, [searchParams, page, sortBy])

  useEffect(() => {
    // Only run if no URL params (sidebar filtering)
    if (!searchParams.toString().length) {
      fetchWithFilters(localFilters)
    }
  }, [
    localFilters.listing_type,
    localFilters.property_type,
    localFilters.city,
    localFilters.min_price,
    localFilters.max_price,
    localFilters.min_beds,
    localFilters.query
  ])



  const activeFiltersCount = Object.values(localFilters).filter(v => {
    if (Array.isArray(v)) return v.length > 0
    if (typeof v === 'string') return v !== '' && v !== 'all'
    return v !== null
  }).length

  const propertyTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'house', label: 'Houses' },
    { value: 'apartment', label: 'Apartments' },
    { value: 'condo', label: 'Condos' },
    { value: 'townhouse', label: 'Townhouses' },
    { value: 'villa', label: 'Villas' },
    { value: 'land', label: 'Land' },
    { value: 'commercial', label: 'Commercial' },
  ]

  const listingTypes = [
    { value: 'all', label: 'All' },
    { value: 'sale', label: 'Buy' },
    { value: 'rent', label: 'Rent' },
  ]

  const activeFilters = []
  if (localFilters.listing_type !== 'all') 
    activeFilters.push({
      label: localFilters.listing_type === 'sale' 
        ? 'For Sale' : 'For Rent',
      key: 'listing_type'
    })
  if (localFilters.property_type !== 'all')
    activeFilters.push({
      label: localFilters.property_type,
      key: 'property_type'
    })
  if (localFilters.city)
    activeFilters.push({
      label: localFilters.city,
      key: 'city'
    })
  if (localFilters.min_price)
    activeFilters.push({
      label: 'Min $' + localFilters.min_price.toLocaleString(),
      key: 'min_price'
    })
  if (localFilters.max_price)
    activeFilters.push({
      label: 'Max $' + localFilters.max_price.toLocaleString(),
      key: 'max_price'
    })
  if (localFilters.min_beds)
    activeFilters.push({
      label: localFilters.min_beds + '+ Beds',
      key: 'min_beds'
    })

  return (
    <div className="pt-20 min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <div className="md:hidden p-4 bg-white border-b border-slate-200 flex justify-between items-center z-20">
              <button onClick={() => setShowFilters(true)} className="flex items-center gap-2 font-medium text-slate-700 bg-slate-100 px-4 py-2 rounded-lg">
                <SlidersHorizontal className="w-5 h-5" />
                Filters {activeFiltersCount > 0 && <span className="bg-blue-700 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeFiltersCount}</span>}
              </button>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {['grid', 'list', 'map'].map(mode => (
                  <button key={mode} onClick={() => setViewMode(mode as any)} className={`p-2 rounded-md ${viewMode === mode ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500'}`}>
                    {mode === 'grid' && <LayoutGrid className="w-5 h-5" />}
                    {mode === 'list' && <List className="w-5 h-5" />}
                    {mode === 'map' && <MapIcon className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>

            <aside className={`fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-slate-200 overflow-y-auto transform transition-transform duration-300 md:translate-x-0 md:static md:w-72 lg:w-80 shrink-0 ${showFilters ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-slate-900">Filters</h2>
                  <div className="flex items-center gap-4">
                    {activeFiltersCount > 0 && (
                      <button onClick={handleClearAll} className="text-sm text-slate-500 hover:text-blue-700 font-medium">Reset All</button>
                    )}
              <button onClick={() => setShowFilters(false)} className="md:hidden p-2"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {listingTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setLocalFilters(prev => ({
                      ...prev, listing_type: type.value as any
                    }))}
                    className={`flex-1 py-2 rounded-xl text-sm 
                    font-medium transition-colors
                    ${localFilters.listing_type === type.value
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Property Type</h3>
              <div className="space-y-1">
                {propertyTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setLocalFilters(prev => ({
                      ...prev, property_type: type.value as any
                    }))}
                    className={`w-full text-left px-3 py-2 rounded-xl 
                    text-sm transition-colors
                    ${localFilters.property_type === type.value
                      ? 'bg-blue-700 text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Price Range</h3>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={localFilters.min_price || ''} onChange={e => setLocalFilters(prev => ({ ...prev, min_price: Number(e.target.value) || null }))} className="input-field px-3 w-1/2" />
                <input type="number" placeholder="Max" value={localFilters.max_price || ''} onChange={e => setLocalFilters(prev => ({ ...prev, max_price: Number(e.target.value) || null }))} className="input-field px-3 w-1/2" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Bedrooms</h3>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(num => (
                  <button 
                    key={num}
                    onClick={() => setLocalFilters(prev => ({ ...prev, min_beds: prev.min_beds === num ? null : num }))}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-colors ${localFilters.min_beds === num ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}
                  >
                    {num}+
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Features</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                {PROPERTY_FEATURES.map(feature => (
                  <label key={feature} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input 
                        type="checkbox" 
                        checked={localFilters.features.includes(feature)}
                        onChange={(e) => {
                          const newFeatures = e.target.checked 
                            ? [...localFilters.features, feature]
                            : localFilters.features.filter(f => f !== feature)
                          setLocalFilters(prev => ({ ...prev, features: newFeatures }))
                        }}
                        className="peer appearance-none w-5 h-5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500/20 checked:bg-blue-700 checked:border-blue-700 transition-all cursor-pointer"
                      />
                      <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-slate-600 group-hover:text-slate-900">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <button onClick={() => setShowFilters(false)} className="w-full btn-primary md:hidden">Apply Filters</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-0">
        <div className="bg-white border-b border-slate-200 p-4 md:p-6 sticky top-20 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-900">{totalCount} Properties Found</h1>
            
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="input-field w-48"
                >
                  <option value="default">Featured First</option>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="beds">Most Bedrooms</option>
                </select>
              </div>
              
              <div className="flex bg-slate-100 p-1 rounded-lg ml-4">
                {['grid', 'list', 'map'].map(mode => (
                  <button key={mode} onClick={() => setViewMode(mode as any)} className={`p-2 rounded-md transition-colors ${viewMode === mode ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}>
                    {mode === 'grid' && <LayoutGrid className="w-4 h-4" />}
                    {mode === 'list' && <List className="w-4 h-4" />}
                    {mode === 'map' && <MapIcon className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              <span className="text-slate-500 text-sm">
                Active filters:
              </span>
              {activeFilters.map(filter => (
                <span
                  key={filter.key}
                  className="inline-flex items-center gap-1.5 
                  bg-blue-50 text-blue-700 border border-blue-200
                  rounded-full px-3 py-1 text-sm font-medium"
                >
                  {filter.label}
                  <button
                    onClick={() => handleRemoveFilter(filter.key)}
                    className="text-blue-400 hover:text-blue-600 ml-0.5"
                  >
                    ✕
                  </button>
                </span>
              ))}
              <button
                onClick={handleClearAll}
                className="text-slate-400 hover:text-red-500 text-sm transition-colors"
              >
                Clear all
              </button>
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map(property => <PropertyCard key={property.id} property={property} />)}
            </div>
          )}
          
          {viewMode === 'list' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {properties.map(property => (
                <div key={property.id} className="card flex flex-col sm:flex-row h-auto sm:h-48 group">
                  <div className="w-full sm:w-64 h-48 sm:h-full shrink-0 relative">
                    <img src={property.images?.[0]} className="w-full h-full object-cover" alt={property.title} />
                    <div className="absolute top-2 left-2"><span className="badge bg-blue-700 text-white">For {property.listing_type}</span></div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{property.title}</h3>
                        <span className="text-xl font-bold text-blue-700">${property.price.toLocaleString()}</span>
                      </div>
                      <p className="text-slate-500 text-sm">{property.city}, {property.state}</p>
                    </div>
                    <div className="flex gap-4 text-sm text-slate-600 mt-4 border-t border-slate-100 pt-4">
                      <span>{property.bedrooms} Beds</span>
                      <span>{property.bathrooms} Baths</span>
                      <span>{property.area_sqft} sqft</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'map' && (
            <div className="h-[calc(100vh-200px)] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200">
              <PropertyMap properties={properties} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
