export interface Area {
  id: string
  name: string
  city: string
  state: string
  country: string
}

export interface Agent {
  id: string
  name: string
  email: string
  phone?: string
  bio?: string
  photo_url?: string
  license_number?: string
  years_experience: number
  specialties?: string[]
}

export type PropertyType = 
  'house' | 'apartment' | 'condo' | 
  'townhouse' | 'villa' | 'land' | 'commercial'

export type ListingType = 'sale' | 'rent'
export type PropertyStatus = 
  'active' | 'pending' | 'sold' | 'rented'

export interface Property {
  id: string
  title: string
  description?: string
  property_type: PropertyType
  listing_type: ListingType
  status: PropertyStatus
  price: number
  price_period?: string
  bedrooms: number
  bathrooms: number
  area_sqft?: number
  lot_size_sqft?: number
  year_built?: number
  garage_spaces: number
  floors: number
  address: string
  city: string
  state: string
  zip_code?: string
  country: string
  latitude?: number
  longitude?: number
  area_id?: string
  agent_id?: string
  features?: string[]
  images?: string[]
  is_featured: boolean
  views: number
  created_at: string
  updated_at: string
  agents?: Agent
  areas?: Area
}

export interface Inquiry {
  id: string
  property_id?: string
  agent_id?: string
  name: string
  email: string
  phone?: string
  message: string
  inquiry_type: 'general' | 'viewing' | 'offer' | 'information'
  status: 'new' | 'read' | 'replied' | 'closed'
  created_at: string
}

export interface SearchFilters {
  query: string
  listing_type: ListingType | 'all'
  property_type: PropertyType | 'all'
  min_price: number | null
  max_price: number | null
  min_beds: number | null
  city: string
  state: string
  features: string[]
}

export const PROPERTY_FEATURES = [
  'Pool', 'Garage', 'Garden', 'Gym', 'Smart Home',
  'Ocean View', 'City Views', 'Pet Friendly',
  'Furnished', 'Air Conditioning', 'Fireplace',
  'Rooftop', 'Concierge', 'Security System',
  'Solar Panels', 'EV Charging', 'Wine Cellar',
  'Home Theater', 'Guest House', 'Tennis Court'
]
