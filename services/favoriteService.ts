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

// ========================================
// DETEC��O DE PRICE DROP E NOTIFICA��ES
// ========================================

import { canNotify, createPriceDropNotification, createInternalNotification, markAsOpportunity } from './notificationService';
import { sendPriceDropEmail } from './emailService';

export const checkPriceDrops = async (): Promise<void> => {
  // Obter todos os usu�rios com favoritos
  const allUsers = getAllUsersWithFavorites();
  
  for (const userId of allUsers) {
    const favorites = getFavorites(userId);
    
    for (const favorite of favorites) {
      const currentPrice = favorite.ad.price;
      const originalPrice = favorite.priceAtFavorite;
      
      // Verificar se houve redu��o de pre�o
      if (currentPrice < originalPrice) {
        // Verificar rate limiting (24h)
        if (!canNotify(userId, favorite.adId)) {
          continue; // Pular se j� notificou recentemente
        }
        
        const percentDrop = ((originalPrice - currentPrice) / originalPrice) * 100;
        
        // Criar notifica��o
        const notification = createPriceDropNotification(
          userId,
          favorite.adId,
          favorite.ad.title,
          originalPrice,
          currentPrice
        );
        
        // Notifica��o interna (push)
        createInternalNotification(
          userId,
          favorite.adId,
          favorite.ad.title,
          originalPrice,
          currentPrice,
          percentDrop
        );
        
        // Marcar como oportunidade (selo)
        markAsOpportunity(userId, favorite.adId);
        
        // Enviar e-mail (se configurado)
        try {
          const user = getUserById(userId);
          if (user && user.email) {
            const emailResult = await sendPriceDropEmail(
              user.email,
              user.name,
              favorite.ad.title,
              favorite.adId,
              originalPrice,
              currentPrice,
              percentDrop
            );
            
            console.log('Email enviado:', emailResult);
          }
        } catch (error) {
          console.error('Erro ao enviar e-mail:', error);
        }
      }
    }
  }
};

const getAllUsersWithFavorites = (): string[] => {
  const userIds: string[] = [];
  
  // Buscar todas as chaves de favoritos no localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('bwagro_favorites_')) {
      const userId = key.replace('bwagro_favorites_', '');
      userIds.push(userId);
    }
  }
  
  return userIds;
};

const getUserById = (userId: string): { id: string; name: string; email: string } | null => {
  // Mock - em produ��o, buscar do backend
  const storedUser = localStorage.getItem('bwagro_user');
  if (!storedUser) return null;
  
  const user = JSON.parse(storedUser);
  return user.id === userId ? user : null;
};

// Simular atualização de preço (para testes)
export const simulatePriceUpdate = (adId: string, newPrice: number): void => {
  // Em produção, isso viria do backend quando admin atualiza preço
  console.log(`Preço atualizado para anúncio ${adId}: R$ ${newPrice.toFixed(2)}`);
  
  // Disparar verificação
  checkPriceDrops();
};
