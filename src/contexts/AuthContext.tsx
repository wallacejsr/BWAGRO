import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { User } from '../types'

interface UserStats {
  total_ads: number
  active_ads: number
  total_views: number
  unread_messages: number
  favorites_count: number
  opportunities_count: number
  is_seller: boolean
  first_ad_at: string | null
}

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  stats: UserStats | null
  isLoading: boolean
  isSeller: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshStats: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)

  // Buscar dados do usuário da VIEW vw_user_status
  const fetchUserStatus = async (userId: string, signal?: AbortSignal) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .abortSignal(signal)
        .single()

      if (userError) {
        if (userError.name !== 'AbortError') {
          console.error('Erro ao buscar usuário:', userError)
        }
        return null
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name || 'Usuário',
        phone: userData.phone,
        role: userData.role || 'USER',
        location: userData.location,
        avatar: userData.avatar,
        plan: userData.plan,
        isAdmin: userData.is_admin ?? false
      }

      setUser(user)
      return userData
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Erro inesperado ao buscar usuário:', err)
      }
      return null
    }
  }

  // Buscar estatísticas via função get_user_stats
  const fetchStats = async (userId: string, signal?: AbortSignal) => {
    try {
      const { data, error } = await supabase.rpc('get_user_stats', {
        user_uuid: userId
      }, { signal })

      if (error) {
        if (error.name !== 'AbortError') {
          console.error('Erro ao buscar estatísticas:', error)
        }
        setStats({
          total_ads: 0,
          active_ads: 0,
          total_views: 0,
          total_clicks: 0,
          is_seller: false,
          first_ad_at: null
        })
        return
      }

      setStats(data as UserStats)
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Erro inesperado ao buscar estatísticas:', err)
      }
      setStats({
        total_ads: 0,
        active_ads: 0,
        total_views: 0,
        total_clicks: 0,
        is_seller: false,
        first_ad_at: null
      })
    }
  }

  const refreshStats = async () => {
    if (supabaseUser && !isFetching) {
      setIsFetching(true)
      try {
        await Promise.all([
          fetchUserStatus(supabaseUser.id),
          fetchStats(supabaseUser.id)
        ])
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Erro ao atualizar dados:', err)
        }
      } finally {
        setIsFetching(false)
      }
    }
  }

  // Configurar listener de autenticação
  useEffect(() => {
    let abortController: AbortController | null = null

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Cancelar requisições anteriores
      if (abortController) {
        abortController.abort()
      }

      setSupabaseUser(session?.user ?? null)

      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        if (!user && !isFetching) {
          setIsLoading(true)
          setIsFetching(true)
          abortController = new AbortController()
          
          try {
            await Promise.all([
              fetchUserStatus(session.user.id, abortController.signal),
              fetchStats(session.user.id, abortController.signal)
            ])
          } catch (err: any) {
            if (err.name !== 'AbortError') {
              console.error('Erro ao carregar dados do usuário:', err)
            }
          } finally {
            setIsLoading(false)
            setIsFetching(false)
          }
        } else {
          setIsLoading(false)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setStats(null)
        setIsLoading(false)
        setIsFetching(false)
      } else if (!session?.user) {
        setIsLoading(false)
        setIsFetching(false)
      }
    })

    return () => {
      if (abortController) {
        abortController.abort()
      }
      subscription.unsubscribe()
    }
  }, [user, isFetching])

  // Função de login
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  // Função de cadastro
  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    // Criar conta no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone
        }
      }
    })

    if (authError) return { error: authError }

    // Criar registro na tabela users
    if (authData.user) {
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          phone,
          role: 'USER',
          is_admin: false,
          credits: 0
        })

      if (dbError) {
        console.error('Erro ao criar usuário no banco:', dbError)
        return { error: dbError }
      }
    }

    return { error: null }
  }

  // Função de logout
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setStats(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        stats,
        isLoading,
        isSeller: stats?.is_seller ?? false,
        isAdmin: (user?.isAdmin ?? (user?.role === 'ADMIN')) || false,
        signIn,
        signUp,
        signOut,
        refreshStats
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
