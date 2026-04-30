import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, BedDouble, Bath, Square, Calendar, Heart, Check } from 'lucide-react'
import { PropertyMap } from '../components/PropertyMap'
import { MortgageCalculator } from '../components/MortgageCalculator'
import { formatPrice, getTypeColor } from '../utils/format'
import type { Property } from '../types'
import { useStore } from '../store'
import { supabase } from '../lib/supabase'

export const PropertyDetailPage = () => {
  const { id } = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const { isFavorite, addFavorite, removeFavorite } = useStore()
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [copied, setCopied] = useState(false)
  const [inquiryForm, setInquiryForm] = useState({
    name: '', email: '', phone: '', message: '', inquiry_type: 'general'
  })
  const navigate = useNavigate()
  
  const isValidUUID = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  
  useEffect(() => {
    const fetchProperty = async () => {
      const { data } = await supabase
        .from('properties')
        .select('*, agents(*), areas(*)')
        .eq('id', id)
        .single()
      
      if (data) {
        setProperty(data)
      }
    }
    if (id && isValidUUID) {
      fetchProperty()
    }
  }, [id, isValidUUID])

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    
    if (!property) return

    try {
      const { error } = await supabase
        .from('inquiries')
        .insert({
          property_id: property?.id ?? null,
          agent_id: property?.agent_id ?? null,
          name: inquiryForm.name.trim(),
          email: inquiryForm.email.trim(),
          phone: inquiryForm.phone?.trim() || null,
          message: inquiryForm.message.trim(),
          inquiry_type: inquiryForm.inquiry_type ?? 'general'
        })
      

      if (error) throw error
      
      const cleanupInquiries = async () => {
        const { count } = await supabase
          .from('inquiries')
          .select('*', { count: 'exact', head: true })
        
        if (count && count > 50) {
          const { data: old } = await supabase
            .from('inquiries')
            .select('id')
            .eq('status', 'closed')
            .order('created_at', { ascending: true })
            .limit(10)
          
          if (old && old.length > 0) {
            await supabase
              .from('inquiries')
              .delete()
              .in('id', old.map(i => i.id))
          }
        }
      }
      
      await cleanupInquiries()
      
      setSubmitSuccess(true)
      setInquiryForm({ 
        name: '', email: '', phone: '', 
        message: '', inquiry_type: 'general' 
      })
      
      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Inquiry error:', err)
      }
      setSubmitError('Failed to send message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const title = property?.title ?? 'Property'
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch (err) {
        // User cancelled - ignore
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Fallback for browsers without clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  if (!isValidUUID) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-6xl mb-4">🏠</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Property Not Found
          </h1>
          <p className="text-slate-500 mb-6">
            The property you are looking for does not exist.
          </p>
          <button 
            onClick={() => navigate('/properties')}
            className="btn-primary"
          >
            Browse Properties
          </button>
        </div>
      </div>
    )
  }

  if (!property) return <div className="min-h-screen flex items-center justify-center pt-20">Loading...</div>

  const favorite = isFavorite(property.id)

  return (
    <div className="pt-20 bg-slate-50 min-h-screen pb-24">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center text-sm text-slate-500 mb-6 gap-2">
          <Link to="/" className="hover:text-blue-700">Home</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-blue-700">Properties</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium truncate">{property.title}</span>
        </div>

        <div className="mb-8 bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 p-2">
          <div className="h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden relative group">
            <img 
              src={property.images?.[activeImage] ?? property.images?.[0] ?? ''} 
              alt={property.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
              }}
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-blue-700 text-white badge text-sm px-4 py-1.5 shadow-md">For {property.listing_type}</span>
              <span className={`badge text-sm px-4 py-1.5 capitalize shadow-md ${getTypeColor(property.property_type)}`}>{property.property_type}</span>
            </div>
          </div>
          <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide">
            {(property.images ?? []).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${property.title} - Image ${idx + 1}`}
                className={`w-24 md:w-32 h-20 md:h-24 shrink-0 rounded-xl object-cover cursor-pointer transition-all border-2 ${activeImage === idx ? 'border-blue-700 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                onClick={() => setActiveImage(idx)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{property.title}</h1>
                  <div className="flex items-center text-slate-500 gap-2 text-lg">
                    <MapPin className="w-5 h-5 text-blue-700" />
                    <span>{property.city}, {property.state}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => favorite ? removeFavorite(property.id) : addFavorite(property.id)} className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-colors bg-white shadow-sm">
                    <Heart className={`w-5 h-5 ${favorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 
                    bg-slate-100 hover:bg-slate-200 rounded-xl 
                    text-slate-700 text-sm font-medium transition-colors"
                  >
                    {copied ? '✓ Link Copied!' : '⬆ Share'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: BedDouble, label: 'Bedrooms', value: property.bedrooms },
                  { icon: Bath, label: 'Bathrooms', value: property.bathrooms },
                  { icon: Square, label: 'Square Feet', value: property.area_sqft?.toLocaleString() },
                  { icon: Calendar, label: 'Year Built', value: property.year_built }
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center justify-center text-center">
                    <stat.icon className="w-6 h-6 text-blue-700 mb-2" />
                    <span className="text-xl font-bold text-slate-900">{stat.value}</span>
                    <span className="text-sm text-slate-500">{stat.label}</span>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">About This Property</h3>
                <p className="text-slate-600 leading-relaxed">{property.description}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Property Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.features?.map(feature => (
                  <div key={feature} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-slate-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Location</h3>
              <div className="h-[400px] rounded-2xl overflow-hidden border border-slate-200">
                <PropertyMap 
                  properties={[property]} 
                  center={
                    property.latitude && property.longitude
                      ? [property.latitude, property.longitude]
                      : undefined
                  }
                  zoom={15} 
                />
              </div>
            </div>

            <div>
              <MortgageCalculator initialPrice={property.price} />
            </div>
          </div>

          <div className="w-full lg:w-96 shrink-0">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <span className="block text-slate-500 text-sm font-medium mb-1">Asking Price</span>
                  <div className="text-4xl font-bold text-slate-900">{formatPrice(property.price)}</div>
                  {property.area_sqft && (
                    <div className="text-sm text-slate-500 mt-2">${Math.round(property.price / property.area_sqft)} / sq ft</div>
                  )}
                </div>

                {property.agents && (
                  <div className="mb-6">
                    <span className="block text-sm font-bold text-slate-900 mb-4">Listed By</span>
                    <div className="flex items-center gap-4">
                      {property.agents.photo_url ? (
                        <img src={property.agents.photo_url} alt={property.agents.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" />
                      ) : (
                        <div className="w-14 h-14 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-md">
                          {property.agents.name?.charAt(0) ?? 'A'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900">{property.agents.name}</h4>
                        <p className="text-sm text-slate-500">{property.agents.phone}</p>
                        <p className="text-sm text-slate-500">{property.agents.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleInquiry}>
                  <h4 className="font-bold text-slate-900 mb-2">Request Info</h4>
                  {submitSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm">
                      ✓ Message sent successfully! An agent will contact you shortly.
                    </div>
                  )}
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                      {submitError}
                    </div>
                  )}
                  <input type="text" placeholder="Your Name" value={inquiryForm.name} onChange={e => setInquiryForm({...inquiryForm, name: e.target.value})} className="input-field" required />
                  <input type="email" placeholder="Your Email" value={inquiryForm.email} onChange={e => setInquiryForm({...inquiryForm, email: e.target.value})} className="input-field" required />
                  <input type="tel" placeholder="Your Phone" value={inquiryForm.phone} onChange={e => setInquiryForm({...inquiryForm, phone: e.target.value})} className="input-field" />
                  <textarea placeholder="I am interested in this property..." rows={4} value={inquiryForm.message} onChange={e => setInquiryForm({...inquiryForm, message: e.target.value})} className="input-field resize-none" required></textarea>
                  <button type="submit" disabled={submitting} className="w-full btn-primary h-14 text-lg">
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
