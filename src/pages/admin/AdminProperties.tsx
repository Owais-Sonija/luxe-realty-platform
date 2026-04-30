import { useState, useEffect } from 'react'
import { Plus, Star } from 'lucide-react'
import { formatPrice, getTypeColor } from '../../utils/format'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store'

export const AdminProperties = () => {
  const [properties, setProperties] = useState<any[]>([])
  const [adminSearch, setAdminSearch] = useState('')
  const [editingProperty, setEditingProperty] = useState<any>(null)
  const { isAdmin, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin/login')
      return
    }
    if (!isAdmin) {
      navigate('/admin/login')
      return
    }
  }, [isAuthenticated, isAdmin, navigate])

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*, agents(name)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setProperties(data ?? [])
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Properties error:', err)
      }
    }
  }

  useEffect(() => { fetchProperties() }, [])

  const deleteProperty = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) 
      return
    
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
    
    if (!error) {
      setProperties(prev => prev.filter(p => p.id !== id))
    } else {
      alert('Failed to delete property: ' + error.message)
    }
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('properties')
      .update({ is_featured: !current })
      .eq('id', id)
    
    if (!error) {
      setProperties(prev => prev.map(p => 
        p.id === id ? { ...p, is_featured: !current } : p
      ))
    }
  }

  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({
    title: '', description: '', property_type: 'house',
    listing_type: 'sale', status: 'active', price: '',
    bedrooms: 0, bathrooms: 0, area_sqft: '', year_built: '',
    garage_spaces: 0, address: '', city: '', state: '',
    zip_code: '', latitude: '', longitude: '', agent_id: '',
    is_featured: false, notes: '', images: [''] as string[]
  })
  const [agents, setAgents] = useState<any[]>([])
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [uploadingImages, setUploadingImages] = useState(false)

  const handleImageFile = (
    e: React.ChangeEvent<HTMLInputElement>, 
    index: number
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPG, PNG, WebP allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Max file size is 5MB')
      return
    }
    
    // Create preview URL
    const preview = URL.createObjectURL(file)
    const newFiles = [...imageFiles]
    const newPreviews = [...imagePreviews]
    newFiles[index] = file
    newPreviews[index] = preview
    setImageFiles(newFiles)
    setImagePreviews(newPreviews)
  }

  const uploadImagesToSupabase = async (): Promise<string[]> => {
    const uploadedUrls: string[] = []
    
    for (let i = 0; i < 3; i++) {
      // If file selected, upload to Supabase Storage
      if (imageFiles[i]) {
        const fileName = `properties/${Date.now()}-${i}-${imageFiles[i].name}`
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(fileName, imageFiles[i], {
            cacheControl: '3600',
            upsert: false
          })
        
        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(data.path)
          uploadedUrls.push(urlData.publicUrl)
        }
      } else if (imageUrls[i]?.trim()) {
        // Use URL directly if no file
        uploadedUrls.push(imageUrls[i].trim())
      }
    }
    
    return uploadedUrls
  }

  useEffect(() => {
    const fetchAgents = async () => {
      const { data } = await supabase.from('agents').select('id, name')
      setAgents(data ?? [])
    }
    fetchAgents()
  }, [])

  const handleAddProperty = async () => {
    if (!addForm.title || !addForm.price || !addForm.address || !addForm.city) {
      setAddError('Title, price, address and city required')
      return
    }
    setAddLoading(true)
    setAddError('')
    setUploadingImages(true)
    
    const finalImages = await uploadImagesToSupabase()
    setUploadingImages(false)
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          title: addForm.title,
          description: addForm.description || null,
          property_type: addForm.property_type,
          listing_type: addForm.listing_type,
          status: addForm.status,
          price: Number(addForm.price),
          bedrooms: addForm.bedrooms,
          bathrooms: addForm.bathrooms,
          area_sqft: addForm.area_sqft ? Number(addForm.area_sqft) : null,
          year_built: addForm.year_built ? Number(addForm.year_built) : null,
          garage_spaces: addForm.garage_spaces,
          address: addForm.address,
          city: addForm.city,
          state: addForm.state,
          zip_code: addForm.zip_code || null,
          latitude: addForm.latitude ? Number(addForm.latitude) : null,
          longitude: addForm.longitude ? Number(addForm.longitude) : null,
          agent_id: addForm.agent_id || null,
          is_featured: addForm.is_featured,
          images: finalImages,
          features: []
        })
        .select('*, agents(name)')
        .single()
      
      if (error) throw error
      setProperties(prev => [data, ...prev])
      setShowAddModal(false)
      setAddForm({
        title: '', description: '', property_type: 'house',
        listing_type: 'sale', status: 'active', price: '',
        bedrooms: 0, bathrooms: 0, area_sqft: '', year_built: '',
        garage_spaces: 0, address: '', city: '', state: '',
        zip_code: '', latitude: '', longitude: '', agent_id: '',
        is_featured: false, notes: '', images: ['']
      })
      setImageFiles([])
      setImagePreviews([])
      setImageUrls([''])
    } catch (err: any) {
      setAddError(err.message ?? 'Failed to add property')
    } finally {
      setAddLoading(false)
    }
  }

  return (
    <>
      <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Manage Properties</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <input
            value={adminSearch}
            onChange={e => setAdminSearch(e.target.value)}
            placeholder="Search by title, city or ID..."
            className="input-field w-full md:w-64"
          />
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-700 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Add Property
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                <th className="p-4 font-medium">Property</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Agent</th>
                <th className="p-4 font-medium">Views</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {properties.filter(p =>
                !adminSearch || 
                p.title.toLowerCase().includes(adminSearch.toLowerCase()) ||
                p.city?.toLowerCase().includes(adminSearch.toLowerCase()) ||
                p.id.includes(adminSearch)
              ).map(prop => (
                <tr key={prop.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                        {prop.images && prop.images[0] ? (
                          <img 
                            src={prop.images[0]} 
                            alt={prop.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-2xl">🏠</div>'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 text-sm max-w-[200px] truncate flex items-center gap-2">
                          {prop.title}
                          {prop.is_featured && <Star className="w-3 h-3 fill-amber-500 text-amber-500" />}
                        </div>
                        <p className="text-slate-400 text-xs font-mono">{prop.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className={`badge capitalize self-start ${getTypeColor(prop.property_type)}`}>{prop.property_type}</span>
                      <span className="text-xs font-medium text-slate-500">For {prop.listing_type}</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-900">{formatPrice(prop.price, prop.listing_type)}</td>
                  <td className="p-4">
                    <select
                      value={prop.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value
                        await supabase
                          .from('properties')
                          .update({ status: newStatus })
                          .eq('id', prop.id)
                        setProperties(prev => prev.map(p =>
                          p.id === prop.id 
                            ? { ...p, status: newStatus } 
                            : p
                        ))
                      }}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white capitalize"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="sold">Sold</option>
                      <option value="rented">Rented</option>
                    </select>
                  </td>
                  <td className="p-4 text-slate-600">{prop.agents?.name}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="flex items-center justify-center gap-1 text-slate-600 text-sm">
                      👁 {prop.views ?? 0}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setEditingProperty(prop)}
                        className="text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button onClick={() => toggleFeatured(prop.id, prop.is_featured)}
                        className={`text-xs px-2 py-1 rounded-lg border
                        ${prop.is_featured 
                          ? 'bg-amber-50 text-amber-600 border-amber-200' 
                          : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {prop.is_featured ? '★ Featured' : '☆ Feature'}
                      </button>
                      <button onClick={() => deleteProperty(prop.id, prop.title)}
                        className="text-xs px-2 py-1 rounded-lg bg-red-50 
                        text-red-600 border border-red-200">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[85vh]">
            <h3 className="text-lg font-bold mb-4">Add New Property</h3>
            {addError && (
              <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 text-sm mb-4">
                {addError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input value={addForm.title} onChange={e => setAddForm(p => ({ ...p, title: e.target.value }))} className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea value={addForm.description} onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))} className="input-field" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property Type</label>
                <select value={addForm.property_type} onChange={e => setAddForm(p => ({ ...p, property_type: e.target.value }))} className="input-field">
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="condo">Condo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Listing Type</label>
                <select value={addForm.listing_type} onChange={e => setAddForm(p => ({ ...p, listing_type: e.target.value }))} className="input-field">
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={addForm.status} onChange={e => setAddForm(p => ({ ...p, status: e.target.value }))} className="input-field">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price *</label>
                <input type="number" value={addForm.price} onChange={e => setAddForm(p => ({ ...p, price: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bedrooms</label>
                <input type="number" value={addForm.bedrooms} onChange={e => setAddForm(p => ({ ...p, bedrooms: Number(e.target.value) }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bathrooms</label>
                <input type="number" value={addForm.bathrooms} onChange={e => setAddForm(p => ({ ...p, bathrooms: Number(e.target.value) }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Area (sqft)</label>
                <input type="number" value={addForm.area_sqft} onChange={e => setAddForm(p => ({ ...p, area_sqft: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year Built</label>
                <input type="number" value={addForm.year_built} onChange={e => setAddForm(p => ({ ...p, year_built: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Garage Spaces</label>
                <input type="number" value={addForm.garage_spaces} onChange={e => setAddForm(p => ({ ...p, garage_spaces: Number(e.target.value) }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Agent</label>
                <select value={addForm.agent_id} onChange={e => setAddForm(p => ({ ...p, agent_id: e.target.value }))} className="input-field">
                  <option value="">No Agent</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address *</label>
                <input value={addForm.address} onChange={e => setAddForm(p => ({ ...p, address: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                <input value={addForm.city} onChange={e => setAddForm(p => ({ ...p, city: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <input value={addForm.state} onChange={e => setAddForm(p => ({ ...p, state: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ZIP Code</label>
                <input value={addForm.zip_code} onChange={e => setAddForm(p => ({ ...p, zip_code: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Featured</label>
                <label className="flex items-center gap-2 mt-2">
                  <input type="checkbox" checked={addForm.is_featured} onChange={e => setAddForm(p => ({ ...p, is_featured: e.target.checked }))} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-slate-700 text-sm">Yes, feature this property</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Property Images (up to 3)</label>
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="space-y-2">
                      <p className="text-xs text-slate-500 font-medium">
                        {i === 0 ? 'Main Image *' : `Image ${i + 1}`}
                      </p>
                      <div className="relative border-2 border-dashed border-slate-300 rounded-xl overflow-hidden hover:border-blue-400 transition-colors aspect-video bg-slate-50">
                        {imagePreviews[i] ? (
                          <div className="relative h-full">
                            <img src={imagePreviews[i]} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const f = [...imageFiles]
                                const p = [...imagePreviews]
                                f[i] = undefined as any
                                p[i] = ''
                                setImageFiles(f)
                                setImagePreviews(p)
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >✕</button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center h-full cursor-pointer p-2">
                            <span className="text-2xl mb-1">📷</span>
                            <span className="text-xs text-slate-500 text-center">Click to upload</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="hidden"
                              onChange={e => handleImageFile(e, i)}
                            />
                          </label>
                        )}
                      </div>
                      <input
                        value={imageUrls[i] ?? ''}
                        onChange={e => {
                          const urls = [...imageUrls]
                          urls[i] = e.target.value
                          setImageUrls(urls)
                        }}
                        placeholder="Or paste image URL..."
                        className="input-field text-xs py-1.5"
                      />
                    </div>
                  ))}
                </div>
                {uploadingImages && (
                  <p className="text-blue-600 text-sm mt-2 flex items-center gap-2">
                    <span className="animate-spin">⟳</span>
                    Uploading images...
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAddModal(false); setAddError(''); }} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAddProperty} disabled={addLoading} className="btn-primary flex-1">{addLoading ? 'Adding...' : 'Add Property'}</button>
            </div>
          </div>
        </div>
      )}

      {editingProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[85vh]">
            <h3 className="text-lg font-bold mb-4">Edit Property</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input value={editingProperty.title} onChange={e => setEditingProperty({ ...editingProperty, title: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                  <input type="number" value={editingProperty.price} onChange={e => setEditingProperty({ ...editingProperty, price: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={editingProperty.status} onChange={e => setEditingProperty({ ...editingProperty, status: e.target.value })} className="input-field">
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bedrooms</label>
                  <input type="number" value={editingProperty.bedrooms} onChange={e => setEditingProperty({ ...editingProperty, bedrooms: Number(e.target.value) })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bathrooms</label>
                  <input type="number" value={editingProperty.bathrooms} onChange={e => setEditingProperty({ ...editingProperty, bathrooms: Number(e.target.value) })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea value={editingProperty.description || ''} onChange={e => setEditingProperty({ ...editingProperty, description: e.target.value })} className="input-field" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Agent</label>
                <select value={editingProperty.agent_id || ''} onChange={e => setEditingProperty({ ...editingProperty, agent_id: e.target.value })} className="input-field">
                  <option value="">No Agent</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 mt-2">
                  <input type="checkbox" checked={editingProperty.is_featured} onChange={e => setEditingProperty({ ...editingProperty, is_featured: e.target.checked })} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-slate-700 text-sm">Yes, feature this property</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingProperty(null)} className="btn-secondary flex-1">Cancel</button>
              <button 
                onClick={async () => {
                  await supabase.from('properties').update({
                    title: editingProperty.title,
                    price: Number(editingProperty.price),
                    status: editingProperty.status,
                    bedrooms: editingProperty.bedrooms,
                    bathrooms: editingProperty.bathrooms,
                    description: editingProperty.description,
                    agent_id: editingProperty.agent_id || null,
                    is_featured: editingProperty.is_featured
                  }).eq('id', editingProperty.id)
                  
                  const agentObj = agents.find(a => a.id === editingProperty.agent_id)
                  setProperties(prev => prev.map(p => p.id === editingProperty.id ? { ...editingProperty, agents: agentObj } : p))
                  setEditingProperty(null)
                }} 
                className="btn-primary flex-1"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
