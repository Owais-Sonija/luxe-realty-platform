import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Property } from '../types'
import { formatPrice } from '../utils/format'
import { Link } from 'react-router-dom'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface PropertyMapProps {
  properties?: Property[]
  center?: [number, number]
  zoom?: number
  height?: string
}

export const PropertyMap = ({ properties = [], center, zoom, height }: PropertyMapProps) => {
  const validProperties = properties.filter(p => p.latitude && p.longitude)
  const mapCenter = validProperties.length === 1 && validProperties[0].latitude && validProperties[0].longitude
    ? [validProperties[0].latitude, validProperties[0].longitude] as [number, number]
    : center ?? [39.8283, -98.5795]

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden z-0 relative min-h-[400px]">
      <MapContainer center={mapCenter} zoom={zoom ?? (validProperties.length === 1 ? 14 : 4)} style={{ height: height ?? '100%', width: '100%', minHeight: '400px' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validProperties.map(property => (
          <Marker key={property.id} position={[property.latitude!, property.longitude!]}>
            <Popup maxWidth={240}>
              <div className="p-1">
                {property.images?.[0] && (
                  <img 
                    src={property.images[0]} 
                    alt={property.title}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )}
                <p className="font-bold text-slate-900 text-sm leading-tight">
                  {property.title}
                </p>
                <p className="text-blue-700 font-bold text-base mt-1">
                  {formatPrice(property.price, property.listing_type)}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  📍 {property.city}, {property.state}
                </p>
                <div className="flex gap-2 text-xs text-slate-600 mt-1">
                  {property.bedrooms > 0 && (
                    <span>🛏 {property.bedrooms} bed</span>
                  )}
                  {property.bathrooms > 0 && (
                    <span>🚿 {property.bathrooms} bath</span>
                  )}
                  {property.area_sqft && (
                    <span>📐 {property.area_sqft.toLocaleString()} sqft</span>
                  )}
                </div>
                <a 
                  href={'/properties/' + property.id}
                  className="block mt-2 text-center bg-blue-700 text-white text-xs py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  View Details →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
