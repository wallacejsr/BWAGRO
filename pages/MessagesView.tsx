import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MessageCard } from '../components/MessageCard';
import { ChatWindow } from '../components/ChatWindow';
import { AdContextCard } from '../components/AdContextCard';
import { MessageCircle, ShoppingBag, ShoppingCart, Inbox } from 'lucide-react';
import { Chat } from '../types';
import { getChats, initializeMockData, getUnreadCount } from '../services/messageService';

export const MessagesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'purchases'>('sales');
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    // Carregar usuário
    const storedUser = localStorage.getItem('bwagro_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      
      // Inicializar dados mock se necessário
      initializeMockData();
      
      // Carregar chats
      loadChats(user.id);
    }
  }, []);
  
  const loadChats = (userId: string) => {
    const allChats = getChats(userId);
    setChats(allChats);
    
    // Se não há chat selecionado, selecionar o primeiro
    if (!selectedChat && allChats.length > 0) {
      setSelectedChat(allChats[0]);
    }
  };
  
  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    // Recarregar chats para atualizar contadores
    if (currentUser) {
      loadChats(currentUser.id);
    }
  };
  
  const handleLeadUnlocked = () => {
    // Recarregar chats após desbloquear lead
    if (currentUser) {
      loadChats(currentUser.id);
    }
  };
  
  // Filtrar chats por aba
  const filteredChats = chats.filter(chat => {
    if (!currentUser) return false;
    
    if (activeTab === 'sales') {
      return chat.sellerId === currentUser.id;
    } else {
      return chat.buyerId === currentUser.id;
    }
  });
  
  const salesCount = chats.filter(c => currentUser && c.sellerId === currentUser.id).length;
  const purchasesCount = chats.filter(c => currentUser && c.buyerId === currentUser.id).length;
  
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-slate-600">Faça login para acessar suas mensagens</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-6">
        {/* Cabeçalho */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-6 h-6 text-green-700" strokeWidth={1.5} />
            <h1 className="text-2xl font-bold text-slate-900">Central de Mensagens</h1>
          </div>
          <p className="text-slate-600">
            Gerencie suas conversas com compradores e vendedores
          </p>
        </div>
        
        {/* Layout de 3 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-280px)]">
          {/* Coluna 1: Lista de conversas (esquerda) */}
          <div className="lg:col-span-3 bg-white border rounded-lg overflow-hidden flex flex-col">
            {/* Abas */}
            <div className="border-b bg-slate-50 p-2 flex gap-1">
              <button
                onClick={() => setActiveTab('sales')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'sales'
                    ? 'bg-green-700 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                Minhas Vendas
                {salesCount > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === 'sales' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {salesCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('purchases')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'purchases'
                    ? 'bg-green-700 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />
                Minhas Compras
                {purchasesCount > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === 'purchases' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {purchasesCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* Lista de conversas */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 p-6">
                  <Inbox className="w-12 h-12 mb-3 text-slate-300" strokeWidth={1.5} />
                  <p className="text-sm text-center">
                    {activeTab === 'sales' 
                      ? 'Você ainda não recebeu mensagens sobre seus anúncios' 
                      : 'Você ainda não iniciou nenhuma conversa com vendedores'}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredChats.map(chat => (
                    <MessageCard
                      key={chat.id}
                      chat={chat}
                      isActive={selectedChat?.id === chat.id}
                      currentUserId={currentUser.id}
                      onClick={() => handleChatSelect(chat)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Coluna 2: Janela de chat (centro) */}
          <div className="lg:col-span-6 bg-white border rounded-lg overflow-hidden">
            {selectedChat ? (
              <ChatWindow
                chat={selectedChat}
                currentUserId={currentUser.id}
                currentUserName={currentUser.name}
                onLeadUnlocked={handleLeadUnlocked}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" strokeWidth={1.5} />
                  <p className="text-sm">Selecione uma conversa para começar</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Coluna 3: Contexto do anúncio (direita) */}
          <div className="lg:col-span-3 overflow-y-auto">
            {selectedChat ? (
              <AdContextCard
                chat={selectedChat}
                currentUserId={currentUser.id}
                onLeadUnlocked={handleLeadUnlocked}
              />
            ) : (
              <div className="bg-white border rounded-lg p-6 text-center text-slate-500">
                <p className="text-sm">Informações do anúncio aparecerão aqui</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MessagesView;
