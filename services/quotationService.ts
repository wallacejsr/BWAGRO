
import { Quotation } from '../types';

const CACHE_KEY = 'terralink_quotations_cache';
const CACHE_EXPIRATION = 15 * 60 * 1000; // 15 minutos

// Simulação de busca em API externa (CEPEA/B3)
const fetchExternalQuotations = async (): Promise<Quotation[]> => {
  // Em um cenário real, aqui seria o fetch para a API financeira
  return [
    { id: '1', name: 'Soja (Paranaguá)', value: '134,50', unit: 'Saca 60kg', change: 1.25, trend: 'up', lastUpdate: new Date().toISOString() },
    { id: '2', name: 'Milho (Campinas)', value: '62,80', unit: 'Saca 60kg', change: -0.45, trend: 'down', lastUpdate: new Date().toISOString() },
    { id: '3', name: 'Boi Gordo (SP)', value: '235,15', unit: '@', change: 0.15, trend: 'up', lastUpdate: new Date().toISOString() },
    { id: '4', name: 'Dólar Comercial', value: '4,98', unit: 'R$', change: 0.88, trend: 'up', lastUpdate: new Date().toISOString() },
    { id: '5', name: 'Café Arábica', value: '1.020,00', unit: 'Saca 60kg', change: -1.10, trend: 'down', lastUpdate: new Date().toISOString() },
    { id: '6', name: 'Trigo (PR)', value: '1.250,00', unit: 'Tonelada', change: 0.00, trend: 'stable', lastUpdate: new Date().toISOString() },
  ];
};

export const getQuotations = async (): Promise<Quotation[]> => {
  const cached = localStorage.getItem(CACHE_KEY);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > CACHE_EXPIRATION;
    
    if (!isExpired) {
      return data;
    }
  }

  // Se expirou ou não existe, busca novo e atualiza cache
  try {
    const freshData = await fetchExternalQuotations();
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: freshData,
      timestamp: Date.now()
    }));
    return freshData;
  } catch (error) {
    console.error("Erro ao sincronizar cotações:", error);
    return cached ? JSON.parse(cached).data : [];
  }
};
