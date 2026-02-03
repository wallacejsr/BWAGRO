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

  // Buscar dados do usuário da VIEW vw_user_status
  const fetchUserStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('vw_user_status')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erro ao buscar status do usuário:', error)
        // Fallback: buscar diretamente da tabela users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (userError || !userData) {
          console.error('Erro ao buscar usuário:', userError)
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
      }

      // Converter para o tipo User
      const userData: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: data.role || 'USER',
        location: data.location,
        avatar: data.avatar,
        plan: data.plan,
        isAdmin: data.is_admin ?? false
      }

      setUser(userData)
      return data
    } catch (err) {
      console.error('Erro inesperado ao buscar usuário:', err)
      return null
    }
  }

  // Buscar estatísticas via função get_user_stats
  const fetchStats = async (userId: string) => {
    try {
      // Temporariamente desabilitado devido a erro de recursão infinita em RLS
      // Usar valores padrão até que as políticas sejam corrigidas
      console.warn('Função get_user_stats desabilitada temporariamente')
      
      setStats({
        total_ads: 0,
        active_ads: 0,
        total_views: 0,
        total_clicks: 0,
        is_seller: false,
        first_ad_at: null
      })
      
      // TODO: Implementar consulta direta às tabelas quando RLS estiver corrigido
      /*
      const { data, error } = await supabase.rpc('get_user_stats', {
        user_uuid: userId
      })

      if (error) throw error
      setStats(data as UserStats)
      */
    } catch (err) {
      console.error('Erro inesperado ao buscar estatísticas:', err)
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
    if (supabaseUser) {
      try {
        await Promise.all([
          fetchUserStatus(supabaseUser.id),
          fetchStats(supabaseUser.id)
        ])
      } catch (err) {
        console.error('Erro ao atualizar dados:', err)
      }
    }
  }

  // Configurar listener de autenticação
  useEffect(() => {
    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSupabaseUser(session?.user ?? null)

      if (session?.user && !user) {
        await fetchUserStatus(session.user.id)
        await fetchStats(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setStats(null)
      }
      
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

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
