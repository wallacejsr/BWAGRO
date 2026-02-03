import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Ad } from '../types'

// Hook para buscar anúncios do usuário
export const useUserAds = () => {
  const { user } = useAuth()
  const [ads, setAds] = useState<Ad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setAds([])
      setIsLoading(false)
      return
    }

    const fetchAds = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          categories (name, slug)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
        console.error('Erro ao buscar anúncios:', error)
      } else {
        // Mapear para o formato do tipo Ad
        const mappedAds: Ad[] = data.map(ad => ({
          id: ad.id,
          title: ad.title,
          description: ad.description,
          price: parseFloat(ad.price),
          location: {
            city: ad.city,
            state: ad.state,
            cep: ad.cep
          },
          categoryId: ad.category_id,
          categorySlug: ad.categories?.slug,
          images: ad.images || [],
          userId: ad.user_id,
          status: ad.status,
          views: ad.views || 0,
          isPremium: ad.is_premium || false,
          createdAt: ad.created_at,
          whatsapp: ad.whatsapp
        }))
        setAds(mappedAds)
      }
      setIsLoading(false)
    }

    fetchAds()
  }, [user])

  return { ads, isLoading, error }
}

// Hook para buscar anúncios públicos (listagem geral)
export const usePublicAds = (filters?: {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  state?: string
}) => {
  const [ads, setAds] = useState<Ad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAds = async () => {
      setIsLoading(true)
      
      let query = supabase
        .from('ads')
        .select(`
          *,
          categories (name, slug),
          users (name, avatar)
        `)
        .eq('status', 'ACTIVE')

      // Aplicar filtros
      if (filters?.category) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', filters.category)
          .single()
        
        if (category) {
          query = query.eq('category_id', category.id)
        }
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice)
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice)
      }

      if (filters?.state) {
        query = query.eq('state', filters.state)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        setError(error.message)
        console.error('Erro ao buscar anúncios:', error)
      } else {
        const mappedAds: Ad[] = data.map(ad => ({
          id: ad.id,
          title: ad.title,
          description: ad.description,
          price: parseFloat(ad.price),
          location: {
            city: ad.city,
            state: ad.state,
            cep: ad.cep
          },
          categoryId: ad.category_id,
          categorySlug: ad.categories?.slug,
          images: ad.images || [],
          userId: ad.user_id,
          status: ad.status,
          views: ad.views || 0,
          isPremium: ad.is_premium || false,
          createdAt: ad.created_at,
          whatsapp: ad.whatsapp
        }))
        setAds(mappedAds)
      }
      setIsLoading(false)
    }

    fetchAds()
  }, [filters?.category, filters?.search, filters?.minPrice, filters?.maxPrice, filters?.state])

  return { ads, isLoading, error }
}

// Hook para buscar um anúncio específico
export const useAd = (adId: string | undefined) => {
  const [ad, setAd] = useState<Ad | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!adId) {
      setIsLoading(false)
      return
    }

    const fetchAd = async () => {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          categories (name, slug),
          users (name, avatar, phone),
          ad_technical_details (label, value, icon_name)
        `)
        .eq('id', adId)
        .single()

      if (error) {
        setError(error.message)
        console.error('Erro ao buscar anúncio:', error)
      } else {
        const mappedAd: Ad = {
          id: data.id,
          title: data.title,
          description: data.description,
          price: parseFloat(data.price),
          location: {
            city: data.city,
            state: data.state,
            cep: data.cep
          },
          categoryId: data.category_id,
          categorySlug: data.categories?.slug,
          images: data.images || [],
          userId: data.user_id,
          status: data.status,
          views: data.views || 0,
          isPremium: data.is_premium || false,
          createdAt: data.created_at,
          whatsapp: data.whatsapp,
          technicalDetails: data.ad_technical_details?.map((detail: any) => ({
            label: detail.label,
            value: detail.value,
            icon: null // Ícone será renderizado no componente
          })),
          healthScore: data.health_score
        }
        setAd(mappedAd)

        // Incrementar views
        await supabase.rpc('increment_ad_views', { ad_uuid: adId })
      }
      setIsLoading(false)
    }

    fetchAd()
  }, [adId])

  return { ad, isLoading, error }
}
