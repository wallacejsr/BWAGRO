import { PriceDropNotification, Notification } from '../types';

// ========================================
// RATE LIMITING (ANTI-SPAM)
// ========================================

const NOTIFICATION_COOLDOWN = 24 * 60 * 60 * 1000; // 24 horas em ms

export const getLastNotification = (userId: string, adId: string): PriceDropNotification | null => {
  const stored = localStorage.getItem('bwagro_price_notifications');
  if (!stored) return null;
  
  const notifications: PriceDropNotification[] = JSON.parse(stored);
  
  // Buscar última notificação deste usuário para este anúncio
  const userNotifications = notifications.filter(n => n.userId === userId && n.adId === adId);
  
  if (userNotifications.length === 0) return null;
  
  // Ordenar por data e retornar a mais recente
  userNotifications.sort((a, b) => new Date(b.notifiedAt).getTime() - new Date(a.notifiedAt).getTime());
  return userNotifications[0];
};

export const canNotify = (userId: string, adId: string): boolean => {
  const lastNotification = getLastNotification(userId, adId);
  
  if (!lastNotification) return true;
  
  const timeSinceLastNotification = Date.now() - new Date(lastNotification.notifiedAt).getTime();
  return timeSinceLastNotification >= NOTIFICATION_COOLDOWN;
};

// ========================================
// CRIAÇÃO DE NOTIFICAÇÕES
// ========================================

export const createPriceDropNotification = (
  userId: string,
  adId: string,
  adTitle: string,
  oldPrice: number,
  newPrice: number,
  channels: ('email' | 'push')[] = ['email', 'push']
): PriceDropNotification => {
  const percentDrop = ((oldPrice - newPrice) / oldPrice) * 100;
  
  const notification: PriceDropNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    adId,
    adTitle,
    oldPrice,
    newPrice,
    percentDrop,
    notifiedAt: new Date().toISOString(),
    channels,
    emailSent: false,
    pushSent: false
  };
  
  // Salvar histórico
  savePriceDropNotification(notification);
  
  return notification;
};

const savePriceDropNotification = (notification: PriceDropNotification): void => {
  const stored = localStorage.getItem('bwagro_price_notifications');
  const notifications: PriceDropNotification[] = stored ? JSON.parse(stored) : [];
  
  notifications.unshift(notification);
  
  // Manter apenas os últimos 100 registros
  const trimmed = notifications.slice(0, 100);
  
  localStorage.setItem('bwagro_price_notifications', JSON.stringify(trimmed));
};

// ========================================
// NOTIFICAÇÃO PUSH INTERNA
// ========================================

export const createInternalNotification = (
  userId: string,
  adId: string,
  adTitle: string,
  oldPrice: number,
  newPrice: number,
  percentDrop: number
): void => {
  const notifications = JSON.parse(localStorage.getItem('bwagro_notifications') || '[]');
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  const notification: Notification = {
    id: `notif_${Date.now()}`,
    type: 'PROMO',
    title: `🔥 Preço Reduzido em ${percentDrop.toFixed(0)}%!`,
    content: `O anúncio "${adTitle}" teve uma redução de ${formatPrice(oldPrice)} para ${formatPrice(newPrice)}. Aproveite!`,
    timestamp: new Date().toISOString(),
    isRead: false,
    link: `/anuncio/${adId}`
  };
  
  notifications.unshift(notification);
  
  // Manter apenas as 50 mais recentes
  localStorage.setItem('bwagro_notifications', JSON.stringify(notifications.slice(0, 50)));
};

// ========================================
// MARCADOR DE OPORTUNIDADE
// ========================================

export const markAsOpportunity = (userId: string, adId: string): void => {
  const stored = localStorage.getItem(`bwagro_opportunities_${userId}`);
  const opportunities: { adId: string; markedAt: string }[] = stored ? JSON.parse(stored) : [];
  
  // Verificar se já está marcado
  if (!opportunities.some(op => op.adId === adId)) {
    opportunities.unshift({
      adId,
      markedAt: new Date().toISOString()
    });
    
    // Manter apenas os últimos 20
    localStorage.setItem(`bwagro_opportunities_${userId}`, JSON.stringify(opportunities.slice(0, 20)));
  }
};

export const isOpportunity = (userId: string, adId: string): boolean => {
  const stored = localStorage.getItem(`bwagro_opportunities_${userId}`);
  if (!stored) return false;
  
  const opportunities: { adId: string; markedAt: string }[] = JSON.parse(stored);
  const opportunity = opportunities.find(op => op.adId === adId);
  
  if (!opportunity) return false;
  
  // Considerar oportunidade por 7 dias
  const timeSinceMarked = Date.now() - new Date(opportunity.markedAt).getTime();
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  
  return timeSinceMarked < SEVEN_DAYS;
};

export const removeOpportunity = (userId: string, adId: string): void => {
  const stored = localStorage.getItem(`bwagro_opportunities_${userId}`);
  if (!stored) return;
  
  const opportunities: { adId: string; markedAt: string }[] = JSON.parse(stored);
  const filtered = opportunities.filter(op => op.adId !== adId);
  
  localStorage.setItem(`bwagro_opportunities_${userId}`, JSON.stringify(filtered));
};

// ========================================
// ESTATÍSTICAS
// ========================================

export const getUserNotificationStats = (userId: string): {
  totalNotifications: number;
  last24h: number;
  totalSavings: number;
} => {
  const stored = localStorage.getItem('bwagro_price_notifications');
  if (!stored) return { totalNotifications: 0, last24h: 0, totalSavings: 0 };
  
  const notifications: PriceDropNotification[] = JSON.parse(stored);
  const userNotifications = notifications.filter(n => n.userId === userId);
  
  const now = Date.now();
  const last24hNotifications = userNotifications.filter(n => {
    const notifTime = new Date(n.notifiedAt).getTime();
    return (now - notifTime) < NOTIFICATION_COOLDOWN;
  });
  
  const totalSavings = userNotifications.reduce((sum, n) => sum + (n.oldPrice - n.newPrice), 0);
  
  return {
    totalNotifications: userNotifications.length,
    last24h: last24hNotifications.length,
    totalSavings
  };
};
