import React, { useState, useEffect } from 'react';
import { Heart, ArrowLeft, GitCompare, Inbox, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FavoriteCard } from '../components/FavoriteCard';
import { Favorite } from '../types';
import { getFavorites, canCompare, getFavoritesStats } from '../services/favoriteService';
import { AnimatePresence } from 'framer-motion';

export const FavoritesView: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, withPriceReduction: 0, soldOrPaused: 0 });
  
  useEffect(() => {
    const storedUser = localStorage.getItem('bwagro_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      loadFavorites(user.id);
    }
  }, []);
  
  const loadFavorites = (userId: string) => {
    const userFavorites = getFavorites(userId);
    setFavorites(userFavorites);
    setStats(getFavoritesStats(userId));
  };
  
  const handleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(selectedId => selectedId !== id);
      } else {
        if (prev.length >= 4) {
          return prev; // Máximo 4 itens
        }
        return [...prev, id];
      }
    });
  };
  
  const handleRemove = () => {
    if (currentUser) {
      loadFavorites(currentUser.id);
    }
  };
  
  const handleCompare = () => {
    if (canCompare(selectedIds)) {
      // Navegar para página de comparação (a ser implementada)
      alert(`Comparando ${selectedIds.length} anúncios selecionados`);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedIds.length === favorites.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(favorites.slice(0, 4).map(f => f.id));
    }
  };
  
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Faça login para acessar seus favoritos</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header fixo */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/minha-conta')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
              </button>
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-green-700" strokeWidth={1.5} />
                <h1 className="text-xl font-bold text-slate-900">Meus Favoritos</h1>
              </div>
            </div>
            
            {/* Stats */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <Heart className="w-4 h-4 text-slate-600" strokeWidth={1.5} />
                <span className="font-semibold text-slate-900">{stats.total}</span>
                <span className="text-slate-600">favoritos</span>
              </div>
              
              {stats.withPriceReduction > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                  <TrendingDown className="w-4 h-4 text-green-700" strokeWidth={1.5} />
                  <span className="font-semibold text-green-700">{stats.withPriceReduction}</span>
                  <span className="text-green-700">com preço reduzido</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Toolbar de ações */}
      {favorites.length > 0 && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-slate-600 hover:text-green-700 font-medium transition-colors"
                >
                  {selectedIds.length === favorites.length ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
                
                {selectedIds.length > 0 && (
                  <span className="text-sm text-slate-500">
                    {selectedIds.length} selecionado{selectedIds.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              {canCompare(selectedIds) && (
                <button
                  onClick={handleCompare}
                  className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-800 transition-colors"
                >
                  <GitCompare className="w-4 h-4" strokeWidth={1.5} />
                  Comparar Selecionados ({selectedIds.length})
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Conteúdo */}
      <div className="flex-1 container mx-auto px-4 py-6">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Inbox className="w-16 h-16 mb-4 text-slate-300" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Nenhum favorito ainda
            </h3>
            <p className="text-sm text-center mb-6 max-w-md">
              Explore nossos anúncios e clique no ícone de coração para salvar seus favoritos aqui
            </p>
            <button
              onClick={() => navigate('/anuncios')}
              className="px-6 py-2.5 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors"
            >
              Explorar Anúncios
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {favorites.map(favorite => (
                <FavoriteCard
                  key={favorite.id}
                  favorite={favorite}
                  userId={currentUser.id}
                  isSelected={selectedIds.includes(favorite.id)}
                  onSelect={handleSelect}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default FavoritesView;
