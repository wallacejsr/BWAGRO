/**
 * EXEMPLO DE INTEGRAÇÃO - MODELO HÍBRIDO DE PERFIS
 * 
 * Este arquivo demonstra como integrar o novo modelo de perfis
 * no frontend React/TypeScript com Supabase
 */

import { supabase } from './lib/supabaseClient'
import { createContext, useContext, useEffect, useState } from 'react'

// ========================================
// TYPES
// ========================================

interface UserStatus {
  id: string
  email: string
  name: string
  phone: string | null
  role: string
  is_admin: boolean
  location: string | null
  avatar: string | null
  plan: string | null
  credits: number
  first_ad_at: string | null
  created_at: string
  updated_at: string
  is_seller: boolean // ← Flag dinâmica calculada pela VIEW
  active_ads_count: number
}

interface UserStats {
  total_ads: number
  active_ads: number
  total_views: number
  unread_messages: number
  favorites_count: number
  opportunities_count: number
  is_seller: boolean // ← Flag dinâmica
  first_ad_at: string | null
}

// ========================================
// CONTEXT API - GERENCIAMENTO GLOBAL
// ========================================

interface UserContextType {
  user: UserStatus | null
  stats: UserStats | null
  isLoading: boolean
  isSeller: boolean // Helper: atalho para stats?.is_seller
  isAdmin: boolean // Helper: atalho para user?.is_admin
  refreshStats: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserStatus | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Buscar status do usuário (com is_seller dinâmico)
  const fetchUserStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from('vw_user_status')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Erro ao buscar status do usuário:', error)
      return
    }

    setUser(data)
  }

  // Buscar estatísticas (incluindo is_seller)
  const fetchStats = async (userId: string) => {
    const { data, error } = await supabase.rpc('get_user_stats', {
      user_uuid: userId
    })

    if (error) {
      console.error('Erro ao buscar estatísticas:', error)
      return
    }

    setStats(data)
  }

  const refreshStats = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      await Promise.all([
        fetchUserStatus(authUser.id),
        fetchStats(authUser.id)
      ])
    }
  }

  // Inicializar ao montar componente
  useEffect(() => {
    const initUser = async () => {
      setIsLoading(true)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        await refreshStats()
      }
      
      setIsLoading(false)
    }

    initUser()

    // Listener: reagir a mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserStatus(session.user.id)
        await fetchStats(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setStats(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <UserContext.Provider
      value={{
        user,
        stats,
        isLoading,
        isSeller: stats?.is_seller ?? false,
        isAdmin: user?.is_admin ?? false,
        refreshStats
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser deve ser usado dentro de UserProvider')
  }
  return context
}

// ========================================
// COMPONENTE: SIDEBAR DINÂMICA
// ========================================

export const Sidebar: React.FC = () => {
  const { user, stats, isSeller, isAdmin } = useUser()

  // Menu base (visível para todos)
  const baseMenu = [
    { label: 'Início', path: '/', icon: 'Home' },
    { label: 'Anúncios', path: '/anuncios', icon: 'List' },
    { label: 'Favoritos', path: '/favoritos', icon: 'Heart' },
    { label: 'Mensagens', path: '/mensagens', icon: 'MessageCircle' }
  ]

  // Menu vendedor (visível apenas se is_seller = TRUE)
  const sellerMenu = isSeller ? [
    { label: '--- VENDEDOR ---', path: null, icon: null },
    { label: 'Meus Anúncios', path: '/meus-anuncios', icon: 'Package' },
    { label: 'Leads', path: '/leads', icon: 'Users' },
    { label: 'Financeiro', path: '/financeiro-vendedor', icon: 'DollarSign' },
    { label: 'Performance', path: '/performance', icon: 'TrendingUp' }
  ] : []

  // Menu admin (visível apenas se is_admin = TRUE)
  const adminMenu = isAdmin ? [
    { label: '--- ADMIN ---', path: null, icon: null },
    { label: 'Dashboard Admin', path: '/admin', icon: 'Shield' },
    { label: 'Gerenciar Usuários', path: '/admin/users', icon: 'Users' },
    { label: 'Config. E-mail', path: '/admin/email', icon: 'Mail' }
  ] : []

  const allMenuItems = [...baseMenu, ...sellerMenu, ...adminMenu]

  return (
    <aside className="w-64 bg-white border-r">
      <nav className="p-4 space-y-2">
        {allMenuItems.map((item, idx) => (
          <div key={idx}>
            {item.path ? (
              <a
                href={item.path}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </a>
            ) : (
              <div className="px-4 py-2 text-xs font-semibold text-gray-500">
                {item.label}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Estatísticas do vendedor (visível apenas se is_seller) */}
      {isSeller && stats && (
        <div className="p-4 m-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-sm font-semibold text-green-800 mb-2">
            📊 Performance
          </h3>
          <div className="space-y-1 text-sm text-green-700">
            <div>Anúncios Ativos: {stats.active_ads}</div>
            <div>Visualizações: {stats.total_views}</div>
            <div>Leads: {stats.unread_messages}</div>
          </div>
          {stats.first_ad_at && (
            <div className="mt-2 pt-2 border-t border-green-200 text-xs text-green-600">
              Vendedor desde {new Date(stats.first_ad_at).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
      )}
    </aside>
  )
}

// ========================================
// COMPONENTE: BOTÃO "CRIAR ANÚNCIO"
// ========================================

export const CreateAdButton: React.FC = () => {
  const { user, isSeller, refreshStats } = useUser()

  const handleCreateAd = async () => {
    // Qualquer usuário autenticado pode criar anúncio
    const { data, error } = await supabase
      .from('ads')
      .insert({
        title: 'Novo Anúncio',
        description: 'Descrição...',
        price: 0,
        city: 'Cidade',
        state: 'UF',
        category_id: 'category-uuid',
        user_id: user!.id
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar anúncio:', error)
      alert('Erro ao criar anúncio')
      return
    }

    // Se é o primeiro anúncio, o trigger set_first_ad_timestamp()
    // já preencheu automaticamente first_ad_at no banco
    
    // Atualizar stats no frontend para refletir is_seller = TRUE
    await refreshStats()

    // Agora isSeller = true e menu de vendedor aparece automaticamente!
    alert('Anúncio criado com sucesso!')
  }

  return (
    <button
      onClick={handleCreateAd}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
    >
      {isSeller ? '+ Novo Anúncio' : '🚀 Publicar Meu Primeiro Anúncio'}
    </button>
  )
}

// ========================================
// COMPONENTE: BADGE "VENDEDOR"
// ========================================

export const SellerBadge: React.FC = () => {
  const { isSeller, stats } = useUser()

  if (!isSeller) return null

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
      <span>⭐</span>
      <span>Vendedor</span>
      {stats?.first_ad_at && (
        <span className="text-xs opacity-75">
          desde {new Date(stats.first_ad_at).getFullYear()}
        </span>
      )}
    </div>
  )
}

// ========================================
// EXEMPLO DE USO NO APP
// ========================================

export default function App() {
  return (
    <UserProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">BWAGRO</h1>
              <SellerBadge />
            </div>
            <CreateAdButton />
          </header>

          {/* Conteúdo da página... */}
        </main>
      </div>
    </UserProvider>
  )
}

// ========================================
// EXEMPLO: HOOK PERSONALIZADO
// ========================================

/**
 * Hook para verificar se usuário pode acessar área de vendedor
 */
export const useSellerAccess = () => {
  const { isSeller, stats } = useUser()
  
  return {
    hasAccess: isSeller,
    totalAds: stats?.total_ads ?? 0,
    activeAds: stats?.active_ads ?? 0,
    firstAdDate: stats?.first_ad_at ? new Date(stats.first_ad_at) : null,
    message: isSeller 
      ? 'Acesso liberado'
      : 'Crie seu primeiro anúncio para acessar esta área'
  }
}

// Uso:
// const { hasAccess, message } = useSellerAccess()
// if (!hasAccess) return <div>{message}</div>

// ========================================
// EXEMPLO: PROTEÇÃO DE ROTA
// ========================================

export const SellerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSeller, isLoading } = useUser()

  if (isLoading) {
    return <div>Carregando...</div>
  }

  if (!isSeller) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Área do Vendedor</h2>
        <p className="text-gray-600 mb-6">
          Você ainda não possui anúncios cadastrados.
        </p>
        <CreateAdButton />
      </div>
    )
  }

  return <>{children}</>
}

// Uso em rotas:
// <Route path="/meus-anuncios" element={<SellerRoute><MeusAnuncios /></SellerRoute>} />
