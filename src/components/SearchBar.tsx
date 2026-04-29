import { useState, useRef, useEffect } from 'react'
import { Search, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { PROPERTY_FEATURES } from '../types'
import type { PropertyType, ListingType } from '../types'

const POPULAR_CITIES = [
  { city: 'Los Angeles', state: 'California' },
  { city: 'New York', state: 'New York' },
  { city: 'Miami', state: 'Florida' },
  { city: 'Chicago', state: 'Illinois' },
  { city: 'Houston', state: 'Texas' },
  { city: 'Phoenix', state: 'Arizona' },
  { city: 'Seattle', state: 'Washington' },
  { city: 'Atlanta', state: 'Georgia' },
  { city: 'Dallas', state: 'Texas' },
  { city: 'San Francisco', state: 'California' },
  { city: 'Boston', state: 'Massachusetts' },
  { city: 'Denver', state: 'Colorado' },
  { city: 'Las Vegas', state: 'Nevada' },
  { city: 'Portland', state: 'Oregon' },
  { city: 'Nashville', state: 'Tennessee' },
  { city: 'Austin', state: 'Texas' },
  { city: 'San Diego', state: 'California' },
  { city: 'Orlando', state: 'Florida' },
  { city: 'Minneapolis', state: 'Minnesota' },
  { city: 'Charlotte', state: 'North Carolina' },
]

export const SearchBar = () => {
  const navigate = useNavigate()
  const { filters, setFilters } = useStore()
  const [citySearch, setCitySearch] = useState('')
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [selectedCity, setSelectedCity] = useState('')
  const cityRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && 
          !cityRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredCities = POPULAR_CITIES.filter(c =>
    c.city.toLowerCase().includes(
      citySearch.toLowerCase()) ||
    c.state.toLowerCase().includes(
      citySearch.toLowerCase())
  )

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (filters.listing_type !== 'all') 
      params.set('listing_type', filters.listing_type)
    if (filters.property_type !== 'all') 
      params.set('property_type', filters.property_type)
    if (selectedCity) 
      params.set('city', selectedCity)
    if (filters.min_price) 
      params.set('min_price', String(filters.min_price))
    if (filters.max_price) 
      params.set('max_price', String(filters.max_price))
    if (filters.min_beds) 
      params.set('min_beds', String(filters.min_beds))
    navigate('/properties?' + params.toString())
    setShowCityDropdown(false)
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-5xl mx-auto relative z-10">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
          <button 
            onClick={() => setFilters({ listing_type: 'sale' })}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${filters.listing_type === 'sale' ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Buy
          </button>
          <button 
            onClick={() => setFilters({ listing_type: 'rent' })}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${filters.listing_type === 'rent' ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Rent
          </button>
        </div>

        <div ref={cityRef} className="relative flex-1">
          <div className="relative">
            <span className="absolute left-3 top-1/2 
            -translate-y-1/2 text-slate-400">📍</span>
            <input
              value={citySearch}
              onChange={e => {
                setCitySearch(e.target.value)
                setShowCityDropdown(true)
                if (!e.target.value) setSelectedCity('')
              }}
              onFocus={() => setShowCityDropdown(true)}
              placeholder="Select city..."
              className="w-full pl-9 pr-4 py-3 bg-slate-50 
              border border-slate-200 rounded-xl text-slate-900 
              placeholder-slate-400 focus:outline-none 
              focus:border-blue-500 focus:ring-2 
              focus:ring-blue-500/20 transition-all"
            />
            {citySearch && (
              <button
                onClick={() => {
                  setCitySearch('')
                  setSelectedCity('')
                  setShowCityDropdown(false)
                }}
                className="absolute right-3 top-1/2 
                -translate-y-1/2 text-slate-400 
                hover:text-slate-600"
              >✕</button>
            )}
          </div>
          
          {showCityDropdown && filteredCities.length > 0 && (
            <div className="absolute z-50 w-full mt-1 
            bg-white border border-slate-200 rounded-xl 
            shadow-xl overflow-hidden max-h-60 overflow-y-auto">
              
              {!citySearch && (
                <div className="px-3 py-2 text-xs text-slate-400 
                font-medium uppercase tracking-wider 
                border-b border-slate-100">
                  Popular Cities
                </div>
              )}
              
              {filteredCities.map(c => (
                <div
                  key={c.city + c.state}
                  onClick={() => {
                    setCitySearch(c.city)
                    setSelectedCity(c.city)
                    setShowCityDropdown(false)
                  }}
                  className={`px-4 py-3 cursor-pointer 
                  hover:bg-blue-50 hover:text-blue-700 
                  transition-colors flex items-center 
                  justify-between
                  ${selectedCity === c.city 
                    ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <span className="font-medium">{c.city}</span>
                  <span className="text-slate-400 text-sm">
                    {c.state}
                  </span>
                </div>
              ))}
              
              {citySearch && filteredCities.length === 0 && (
                <div className="px-4 py-3 text-slate-400 text-sm">
                  No cities found
                </div>
              )}
            </div>
          )}
        </div>

        <select 
          value={filters.property_type}
          onChange={(e) => setFilters({ property_type: e.target.value as any })}
          className="input-field md:w-48 bg-white"
        >
          <option value="all">Property Type</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="condo">Condo</option>
          <option value="townhouse">Townhouse</option>
          <option value="villa">Villa</option>
        </select>
        
        <select 
          value={filters.min_beds || ''}
          onChange={(e) => setFilters({ min_beds: e.target.value ? Number(e.target.value) : null })}
          className="input-field md:w-32 bg-white"
        >
          <option value="">Beds</option>
          <option value="1">1+ Beds</option>
          <option value="2">2+ Beds</option>
          <option value="3">3+ Beds</option>
          <option value="4">4+ Beds</option>
          <option value="5">5+ Beds</option>
        </select>

        <button 
          onClick={handleSearch}
          className="bg-amber-500 hover:bg-amber-400 h-12 px-8 rounded-2xl font-bold shadow-fab text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shrink-0"
        >
          <Search className="w-5 h-5" />
          Search
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        <button 
          onClick={() => setFilters({ features: [] })}
          className={`chip ${filters.features.length === 0 ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}
        >
          All
        </button>
        {PROPERTY_FEATURES.slice(0, 8).map(feature => {
          const isSelected = filters.features.includes(feature)
          return (
            <button
              key={feature}
              onClick={() => {
                const newFeatures = isSelected 
                  ? filters.features.filter(f => f !== feature)
                  : [...filters.features, feature]
                setFilters({ features: newFeatures })
              }}
              className={`chip whitespace-nowrap border transition-colors ${isSelected ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700'}`}
            >
              {feature}
            </button>
          )
        })}
      </div>
    </div>
  )
}
