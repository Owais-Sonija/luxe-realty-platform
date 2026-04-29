export const formatPrice = (
  price: number, 
  type?: string
): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(price)
  
  if (type === 'rent') return `${formatted}/mo`
  return formatted
}

export const formatArea = (sqft?: number): string => {
  if (!sqft) return '—'
  return `${sqft.toLocaleString()} sq ft`
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    sold: 'bg-red-100 text-red-700',
    rented: 'bg-blue-100 text-blue-700',
  }
  return colors[status] ?? 'bg-slate-100 text-slate-700'
}

export const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    house: 'bg-emerald-100 text-emerald-700',
    apartment: 'bg-blue-100 text-blue-700',
    condo: 'bg-violet-100 text-violet-700',
    townhouse: 'bg-orange-100 text-orange-700',
    villa: 'bg-amber-100 text-amber-700',
    land: 'bg-lime-100 text-lime-700',
    commercial: 'bg-slate-100 text-slate-700',
  }
  return colors[type] ?? 'bg-slate-100 text-slate-700'
}
