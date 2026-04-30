import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SearchFilters } from '../types'
import { supabase } from '../lib/supabase'

interface Store {
  // Favorites
  favorites: string[]
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  
  // Search filters
  filters: SearchFilters
  setFilters: (filters: Partial<SearchFilters>) => void
  resetFilters: () => void
  
  // Recently viewed
  recentlyViewed: string[]
  addRecentlyViewed: (id: string) => void
  
  // Compare
  compareList: string[]
  addToCompare: (id: string) => void
  removeFromCompare: (id: string) => void
  clearCompare: () => void
}

const defaultFilters: SearchFilters = {
  query: '',
  listing_type: 'all',
  property_type: 'all',
  min_price: null,
  max_price: null,
  min_beds: null,
  city: '',
  state: '',
  features: []
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (id) => set(s => ({ 
        favorites: [...s.favorites, id] 
      })),
      removeFavorite: (id) => set(s => ({ 
        favorites: s.favorites.filter(f => f !== id) 
      })),
      isFavorite: (id) => get().favorites.includes(id),
      
      filters: defaultFilters,
      setFilters: (f) => set(s => ({ 
        filters: { ...s.filters, ...f } 
      })),
      resetFilters: () => set({ filters: defaultFilters }),
      
      recentlyViewed: [],
      addRecentlyViewed: (id) => set(s => ({
        recentlyViewed: [id, 
          ...s.recentlyViewed.filter(r => r !== id)
        ].slice(0, 10)
      })),
      
      compareList: [],
      addToCompare: (id) => set(s => ({
        compareList: s.compareList.includes(id)
          ? s.compareList
          : [...s.compareList, id].slice(0, 3)
      })),
      removeFromCompare: (id) => set(s => ({
        compareList: s.compareList.filter(c => c !== id)
      })),
      clearCompare: () => set({ compareList: [] })
    }),
    { name: 'realty-store' }
  )
)

interface AuthStore {
  user: any | null
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  checkAdmin: () => Promise<void>
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAdmin: false,
      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        set({ user: data.user })
        await get().checkAdmin()
      },
      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, isAdmin: false })
      },
      checkAdmin: async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', user.id)
          .single()
        set({ isAdmin: !!data, user })
      },
      isAuthenticated: () => get().user !== null
    }),
    { name: 'auth-store' }
  )
)
