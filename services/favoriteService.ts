import { Favorite, Ad } from '../types';

// ========================================
// GERENCIAMENTO DE FAVORITOS
// ========================================

export const getFavorites = (userId: string): Favorite[] => {
  const stored = localStorage.getItem(`bwagro_favorites_${userId}`);
  return stored ? JSON.parse(stored) : [];
};

export const saveFavorites = (userId: string, favorites: Favorite[]): void => {
  localStorage.setItem(`bwagro_favorites_${userId}`, JSON.stringify(favorites));
};

export const isFavorited = (userId: string, adId: string): boolean => {
  const favorites = getFavorites(userId);
  return favorites.some(fav => fav.adId === adId);
};

export const toggleFavorite = (userId: string, ad: Ad): { isFavorited: boolean; message: string } => {
  const favorites = getFavorites(userId);
  const existingIndex = favorites.findIndex(fav => fav.adId === ad.id);
  
  if (existingIndex >= 0) {
    // Remover favorito
    favorites.splice(existingIndex, 1);
    saveFavorites(userId, favorites);
    return { isFavorited: false, message: 'Removido dos favoritos' };
  } else {
    // Adicionar favorito
    const newFavorite: Favorite = {
      id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      adId: ad.id,
      ad,
      priceAtFavorite: ad.price,
      favoritedAt: new Date().toISOString()
    };
    
    favorites.unshift(newFavorite); // Adicionar no início
    saveFavorites(userId, favorites);
    return { isFavorited: true, message: 'Adicionado aos favoritos' };
  }
};

export const removeFavorite = (userId: string, favoriteId: string): void => {
  const favorites = getFavorites(userId);
  const filtered = favorites.filter(fav => fav.id !== favoriteId);
  saveFavorites(userId, filtered);
};

// ========================================
// ANÁLISE DE PREÇO
// ========================================

export const getPriceChange = (favorite: Favorite): {
  hasChanged: boolean;
  isReduced: boolean;
  percentChange: number;
} => {
  const currentPrice = favorite.ad.price;
  const originalPrice = favorite.priceAtFavorite;
  
  if (currentPrice === originalPrice) {
    return { hasChanged: false, isReduced: false, percentChange: 0 };
  }
  
  const percentChange = ((currentPrice - originalPrice) / originalPrice) * 100;
  const isReduced = currentPrice < originalPrice;
  
  return {
    hasChanged: true,
    isReduced,
    percentChange: Math.abs(percentChange)
  };
};

// ========================================
// COMPARAÇÃO DE ANÚNCIOS
// ========================================

export const canCompare = (selectedIds: string[]): boolean => {
  return selectedIds.length >= 2 && selectedIds.length <= 4;
};

export const getSelectedFavorites = (userId: string, selectedIds: string[]): Favorite[] => {
  const favorites = getFavorites(userId);
  return favorites.filter(fav => selectedIds.includes(fav.id));
};

// ========================================
// DADOS MOCK PARA DESENVOLVIMENTO
// ========================================

export const initializeMockFavorites = (userId: string): void => {
  const existing = getFavorites(userId);
  
  // Só inicializa se não houver favoritos
  if (existing.length === 0) {
    // Mock será criado quando o usuário favoritar via interface
  }
};

// ========================================
// ESTATÍSTICAS
// ========================================

export const getFavoritesStats = (userId: string): {
  total: number;
  withPriceReduction: number;
  soldOrPaused: number;
} => {
  const favorites = getFavorites(userId);
  
  let withPriceReduction = 0;
  let soldOrPaused = 0;
  
  favorites.forEach(fav => {
    const priceChange = getPriceChange(fav);
    if (priceChange.isReduced) {
      withPriceReduction++;
    }
    
    if (fav.ad.status === 'SOLD' || fav.ad.status === 'PAUSED') {
      soldOrPaused++;
    }
  });
  
  return {
    total: favorites.length,
    withPriceReduction,
    soldOrPaused
  };
};
