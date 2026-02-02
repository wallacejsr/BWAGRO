import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Camera, CreditCard, DollarSign, Download, Edit3, FileText, Heart, Inbox, LayoutGrid, LogOut, Map, MapPin, MessageSquare, PauseCircle, ShieldCheck, Trash2, User } from 'lucide-react';
import { MOCK_ADS, MOCK_MESSAGES, MOCK_NOTIFICATIONS, MOCK_INVOICES, MOCK_METRICS } from '../constants';
import { AdStatus, Message, Ad, AdMetrics } from '../types';

const Icons = {
  Dashboard: () => <LayoutGrid className="w-5 h-5" strokeWidth={1.5} />,
  Ads: () => <FileText className="w-5 h-5" strokeWidth={1.5} />,
  Messages: () => <MessageSquare className="w-5 h-5" strokeWidth={1.5} />,
  Favorites: () => <Heart className="w-5 h-5" strokeWidth={1.5} />,
  Notifications: () => <Bell className="w-5 h-5" strokeWidth={1.5} />,
  Finance: () => <DollarSign className="w-5 h-5" strokeWidth={1.5} />,
  Profile: () => <User className="w-5 h-5" strokeWidth={1.5} />,
  Logout: () => <LogOut className="w-5 h-5" strokeWidth={1.5} />,
};

const UserDashboardView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('bwagro_user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isPremium = user?.plan && user.plan !== 'seed';

  const menuItems = [
    { label: 'Visão Geral', path: '/minha-conta', icon: <Icons.Dashboard />, badge: 0 },
    { label: 'Meus Anúncios', path: '/minha-conta/anuncios', icon: <Icons.Ads />, badge: 0 },
    { label: 'Mensagens', path: '/minha-conta/mensagens', icon: <Icons.Messages />, badge: MOCK_MESSAGES.filter(m => !m.isRead).length },
    { label: 'Favoritos', path: '/minha-conta/favoritos', icon: <Icons.Favorites />, badge: 0 },
    { label: 'Notificações', path: '/minha-conta/notificacoes', icon: <Icons.Notifications />, badge: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length },
    { label: 'Financeiro', path: '/minha-conta/financeiro', icon: <Icons.Finance />, badge: 0 },
    { label: 'Perfil', path: '/minha-conta/perfil', icon: <Icons.Profile />, badge: 0 },
  ];

  const handleLogout = () => {
    localStorage.removeItem('bwagro_user');
    navigate('/login');
  };

  // --- WIDGET COMPONENTS ---

  const MiniTile = ({ label, value, icon, color = "green" }: { label: string, value: string | number, icon: React.ReactNode, color?: string }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4 transition-all hover:bg-slate-50">
      <div className={`w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-lg bg-green-700/10 text-green-700`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 leading-tight">{value}</h3>
      </div>
    </div>
  );

  const HeatmapWidget = ({ metrics }: { metrics: AdMetrics }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-sm font-bold text-gray-900">Alcance por Região</h4>
        <Icons.Dashboard />
      </div>
      
      <div className="flex-grow flex flex-col xl:flex-row gap-6 items-center">
          <div className="w-full xl:w-1/2 aspect-square bg-slate-50/50 rounded-lg p-4 border border-slate-100 flex items-center justify-center">
           <Map className="w-16 h-16 text-green-600/60" strokeWidth={1.5} />
        </div>

        <div className="w-full xl:w-1/2 space-y-3">
          {metrics.clicksByState.slice(0, 4).map((s) => (
            <div key={s.state} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] font-bold text-gray-600">
                <span>{s.state}</span>
                <span className="text-gray-900">{s.count} cliques</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-700 transition-all duration-1000" style={{ width: `${(s.count / metrics.clicksByState[0].count) * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PriceThermometer = ({ ad, metrics }: { ad: Ad, metrics: AdMetrics }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-sm font-bold text-gray-900">Análise de Preço</h4>
        <div className="text-[10px] font-bold text-green-700 px-2 py-0.5 bg-green-50 rounded uppercase">Competitivo</div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between">
           <div>
             <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Seu Valor</p>
             <p className="text-xl font-bold text-gray-900">R$ {ad.price.toLocaleString('pt-BR')}</p>
           </div>
           <div className="text-right">
             <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Média Mercado</p>
             <p className="text-lg font-semibold text-gray-600">R$ {metrics.marketAvgPrice.toLocaleString('pt-BR')}</p>
           </div>
        </div>

        <div className="relative pt-6">
           <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full w-1/3 bg-green-400"></div>
              <div className="h-full w-1/3 bg-yellow-300"></div>
              <div className="h-full w-1/3 bg-red-400"></div>
           </div>
           <div 
            className="absolute top-0 flex flex-col items-center transition-all duration-1000"
            style={{ left: `${metrics.pricePosition === 'LOW' ? '15%' : metrics.pricePosition === 'MED' ? '50%' : '85%'}` }}
           >
              <div className="bg-gray-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-sm mb-1 whitespace-nowrap">
                R$ {ad.price.toLocaleString('pt-BR')}
              </div>
              <div className="w-0.5 h-6 bg-gray-900"></div>
           </div>
        </div>
      </div>
    </div>
  );

  const HomeDashboard = () => {
    const userAds = MOCK_ADS.filter(a => a.userId === user?.id);
    const adMetrics = MOCK_METRICS.find(m => m.adId === userAds[0]?.id) || MOCK_METRICS[0];

    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        {/* SaaS Mini-Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniTile label="Anúncios Ativos" value={userAds.length} icon={<Icons.Ads />} />
          <MiniTile label="Novas Mensagens" value={MOCK_MESSAGES.filter(m => !m.isRead).length} icon={<Icons.Messages />} />
          <MiniTile label="Visualizações" value="1.2k" icon={<Icons.Dashboard />} />
          <MiniTile label="Créditos" value="12" icon={<Icons.Finance />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <HeatmapWidget metrics={adMetrics} />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <PriceThermometer ad={userAds[0] || MOCK_ADS[0]} metrics={adMetrics} />
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-white">
              <h4 className="text-sm font-bold mb-4">Plano Atual: {user?.plan || 'Free'}</h4>
              <div className="flex justify-between text-xs mb-2">
                <span>Uso de Cota</span>
                <span>{userAds.length} / 5</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${(userAds.length / 5) * 100}%` }}></div>
              </div>
              <Link to="/minha-conta/financeiro" className="block text-center mt-6 text-xs font-bold text-green-400 hover:text-green-300 transition-colors uppercase tracking-wider">Fazer Upgrade do Plano</Link>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100">
          <h4 className="text-sm font-bold text-gray-900 mb-6">Mensagens Recentes</h4>
          <div className="divide-y divide-slate-50">
            {MOCK_MESSAGES.slice(0, 3).map(m => (
              <div key={m.id} className="py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{m.senderName}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{m.content}</p>
                  </div>
                </div>
                <Link to="/minha-conta/mensagens" className="text-[10px] font-bold text-green-700 uppercase">Responder</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const AdsDashboard = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending' | 'paused' | 'blocked'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const userAds = useMemo(() => MOCK_ADS.filter(a => a.userId === user?.id), [user?.id]);

    const counts = useMemo(() => {
      const active = userAds.filter(a => a.status === AdStatus.ACTIVE).length;
      const pending = userAds.filter(a => a.status === AdStatus.PENDING).length;
      const paused = userAds.filter(a => a.status === AdStatus.PAUSED).length;
      const blocked = userAds.filter(a => a.status === AdStatus.BLOCKED).length;
      return {
        all: userAds.length,
        active,
        pending,
        paused,
        blocked
      };
    }, [userAds]);

    const filteredAds = useMemo(() => {
      const normalized = searchTerm.trim().toLowerCase();
      const byTab = userAds.filter(ad => {
        if (activeTab === 'active') return ad.status === AdStatus.ACTIVE;
        if (activeTab === 'pending') return ad.status === AdStatus.PENDING;
        if (activeTab === 'paused') return ad.status === AdStatus.PAUSED;
        if (activeTab === 'blocked') return ad.status === AdStatus.BLOCKED;
        return true;
      });

      if (!normalized) return byTab;
      return byTab.filter(ad => ad.title.toLowerCase().includes(normalized) || ad.id.toLowerCase().includes(normalized));
    }, [userAds, activeTab, searchTerm]);

    const pagedAds = useMemo(() => filteredAds.slice(0, itemsPerPage), [filteredAds, itemsPerPage]);

    const tabs = [
      { id: 'all', label: 'Todos', count: counts.all },
      { id: 'active', label: 'Ativos', count: counts.active },
      { id: 'pending', label: 'Em Análise', count: counts.pending },
      { id: 'paused', label: 'Pausados', count: counts.paused },
      { id: 'blocked', label: 'Excluídos', count: counts.blocked }
    ] as const;

    const statusLabel: Record<AdStatus, string> = {
      [AdStatus.ACTIVE]: 'Ativo',
      [AdStatus.PAUSED]: 'Pausado',
      [AdStatus.PENDING]: 'Em Análise',
      [AdStatus.BLOCKED]: 'Excluído',
      [AdStatus.EXPIRED]: 'Expirado',
      [AdStatus.SOLD]: 'Vendido'
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-9 px-3 rounded-lg text-sm font-semibold border transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
                <span className={`ml-2 text-xs font-semibold ${activeTab === tab.id ? 'text-slate-100' : 'text-slate-500'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto lg:justify-end">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título ou código"
              className="h-9 w-full sm:w-64 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            >
              <option value={5}>5 por página</option>
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
            </select>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {pagedAds.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
                <div className="mx-auto mb-4 w-10 h-10 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center">
                  <Inbox className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Você não possui anúncios nesta categoria no momento</p>
                <p className="text-sm text-slate-500 mb-6">Crie um anúncio para começar a gerar oportunidades.</p>
                <Link
                  to="/anunciar"
                  className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-colors"
                >
                  Anunciar Agora
                </Link>
              </div>
            ) : (
              pagedAds.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-4 h-20"
                >
                  <div className="w-[60px] h-[60px] rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{ad.title}</p>
                    <p className="text-xs text-slate-500 truncate">
                      Código: {ad.id} | Cadastrado em: {new Date(ad.createdAt).toLocaleDateString('pt-BR')} às {new Date(ad.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-slate-500">
                      Visitas: {ad.views} | Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ad.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-semibold ${ad.status === AdStatus.ACTIVE ? 'text-green-700' : 'text-slate-500'}`}>
                      {statusLabel[ad.status] || 'Status'}
                    </span>
                    <div className="flex items-center gap-2 text-slate-400">
                      <button className="p-2 rounded-lg hover:bg-slate-50 hover:text-green-700 transition-colors" title="Ver cobrança">
                        <CreditCard className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-slate-50 hover:text-green-700 transition-colors" title="Editar">
                        <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-slate-50 hover:text-slate-700 transition-colors" title="Pausar">
                        <PauseCircle className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-slate-50 hover:text-red-600 transition-colors" title="Excluir">
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  const FinanceDashboard = () => {
    const nextInvoice = MOCK_INVOICES.find((inv) => inv.status !== 'PAID') || MOCK_INVOICES[0];
    const currentPlan = user?.plan ? user.plan : 'seed';
    const isBoostPlan = currentPlan === 'boost';

    const statusBadge = (status: string) => {
      if (status === 'PAID') return 'bg-green-100 text-green-700';
      if (status === 'PENDING') return 'bg-yellow-100 text-yellow-700';
      return 'bg-red-100 text-red-700';
    };

    const statusLabel: Record<string, string> = {
      PAID: 'Pago',
      PENDING: 'Pendente',
      OVERDUE: 'Vencido'
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-700/10 text-green-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Plano Atual</p>
              <p className="text-sm font-semibold text-slate-900">{currentPlan === 'boost' ? 'Impulso' : currentPlan === 'harvest' ? 'Colheita' : 'Semente'}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-900/5 text-slate-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Próxima Fatura</p>
              <p className="text-sm font-semibold text-slate-900">R$ {nextInvoice?.amount.toLocaleString('pt-BR')}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-900/5 text-slate-700 flex items-center justify-center">
              <FileText className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vencimento</p>
              <p className="text-sm font-semibold text-slate-900">{nextInvoice?.date}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Gestão de Assinatura</h3>
              <p className="text-sm text-slate-500">Acompanhe seu plano, altere forma de pagamento e visualize benefícios.</p>
            </div>
            <div className="flex gap-2">
              <button className="h-9 px-4 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Atualizar Pagamento
              </button>
              <button className="h-9 px-4 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800">
                Gerenciar Plano
              </button>
            </div>
          </div>
        </div>

        {isBoostPlan && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Upgrade</p>
                <h4 className="text-sm font-semibold text-slate-900">Migre para o Plano Business</h4>
                <p className="text-sm text-slate-600">Mais visibilidade e suporte dedicado para acelerar suas vendas.</p>
                <ul className="text-sm text-slate-600 mt-3 space-y-1">
                  <li>• Relatórios avançados de performance</li>
                  <li>• Prioridade na busca e destaque premium</li>
                </ul>
              </div>
              <button className="h-9 px-4 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800">
                Fazer Upgrade
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Faturas Recentes</h3>
          </div>

          <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-500">
                  <th className="px-4 py-3 font-semibold">Fatura</th>
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Valor</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_INVOICES.map((inv) => (
                  <tr key={inv.id} className="text-slate-700">
                    <td className="px-4 py-3 font-semibold text-slate-900">{inv.planName}</td>
                    <td className="px-4 py-3 text-slate-500">{inv.date}</td>
                    <td className="px-4 py-3 text-slate-900">R$ {inv.amount.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusBadge(inv.status)}`}>
                        {statusLabel[inv.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={inv.pdfUrl}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-green-700 hover:bg-slate-50 transition-colors"
                        title="Baixar PDF"
                      >
                        <Download className="w-4 h-4" strokeWidth={1.5} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {MOCK_INVOICES.map((inv) => (
              <div key={inv.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-900">{inv.planName}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusBadge(inv.status)}`}>
                    {statusLabel[inv.status]}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Data: {inv.date}</p>
                <p className="text-xs text-slate-500">Valor: R$ {inv.amount.toLocaleString('pt-BR')}</p>
                <div className="mt-3">
                  <a
                    href={inv.pdfUrl}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-green-700"
                  >
                    <Download className="w-4 h-4" strokeWidth={1.5} />
                    Baixar PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const ProfileDashboard = () => {
    const userName = user?.name || 'Usuário BWAGRO';
    const userCity = user?.location || 'São Paulo, SP';

    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative">
            <img
              src={user?.avatar || 'https://i.pravatar.cc/150?u=bwagro'}
              alt={userName}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <button className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Camera className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-sm font-semibold text-slate-900">{userName}</h3>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">Vendedor Verificado</span>
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4" strokeWidth={1.5} />
              {userCity}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <User className="w-4 h-4" strokeWidth={1.5} />
              <h4 className="text-sm font-semibold">Identidade</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Nome / Razão Social</label>
                <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" placeholder="Ex: Agro Tech Ltda" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">CPF / CNPJ</label>
                <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" placeholder="00.000.000/0001-00" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Descrição do Negócio</label>
              <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none" rows={3} placeholder="Conte um pouco sobre sua atuação." />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <Map className="w-4 h-4" strokeWidth={1.5} />
              <h4 className="text-sm font-semibold">Localização e Contato</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">CEP</label>
                <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" placeholder="00000-000" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">WhatsApp</label>
                <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" placeholder="(11) 99999-9999" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Endereço Completo</label>
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" placeholder="Rua, número, bairro, cidade" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
              <h4 className="text-sm font-semibold">Segurança e Acesso</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Senha Atual</label>
                <input type="password" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Nova Senha</label>
                <input type="password" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-500">Confirmação</label>
                <input type="password" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Autenticação em Duas Etapas</p>
                <p className="text-xs text-slate-500">Aumente a proteção da sua conta.</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200">
                <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-1" />
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              <h4 className="text-sm font-semibold">Central de Verificação</h4>
            </div>
            <div className="border border-dashed border-slate-200 rounded-lg p-5 text-center">
              <input type="file" className="hidden" id="doc-upload" />
              <label htmlFor="doc-upload" className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 cursor-pointer">
                <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                Enviar Documento (RG/CNH ou Contrato Social)
              </label>
              <p className="text-xs text-slate-500 mt-2">
                Seus dados são protegidos por criptografia e servem apenas para validar sua identidade na plataforma.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#fcfcfd] font-sans">
      {/* SaaS Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white sticky top-0 h-screen flex-col p-6 border-r border-slate-100">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center text-white font-bold">T</div>
          <span className="text-lg font-bold text-gray-900">BWAGRO</span>
        </div>

        <nav className="flex-grow space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all group ${
                location.pathname === item.path ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-500 hover:bg-slate-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`${location.pathname === item.path ? 'text-green-700' : 'text-gray-400 group-hover:text-gray-600'}`}>{item.icon}</span>
                {item.label}
              </div>
              {item.badge > 0 && (
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              )}
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 font-medium text-sm hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <Icons.Logout /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-grow p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Olá, {user?.name.split(' ')[0]}</h2>
            <p className="text-sm text-gray-500">Acompanhe seus negócios e oportunidades rurais.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg border border-slate-100">
              <div className="w-7 h-7 bg-slate-200 rounded-full overflow-hidden">
                <img src={user?.avatar} alt="" />
              </div>
              <span className="text-xs font-bold text-gray-700">{user?.name}</span>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<HomeDashboard />} />
          <Route path="/anuncios" element={<AdsDashboard />} />
          <Route path="/mensagens" element={<div className="p-10 text-gray-400 font-bold border border-dashed rounded-xl">Módulo de Mensagens</div>} />
          <Route path="/financeiro" element={<FinanceDashboard />} />
          <Route path="/perfil" element={<ProfileDashboard />} />
          <Route path="*" element={<HomeDashboard />} />
        </Routes>
      </main>
    </div>
  );
};

export default UserDashboardView;