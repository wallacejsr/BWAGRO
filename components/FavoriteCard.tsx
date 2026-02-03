import React, { useState } from 'react';
import { Favorite } from '../types';
import { MapPin, Clock, Eye, Trash2, ExternalLink, ArrowDown, Zap } from 'lucide-react';
import { getPriceChange, removeFavorite } from '../services/favoriteService';
import { isOpportunity } from '../services/notificationService';
import { motion } from 'framer-motion';

interface FavoriteCardProps {
  favorite: Favorite;
  userId: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: () => void;
}

export const FavoriteCard: React.FC<FavoriteCardProps> = ({ 
  favorite, 
  userId, 
  isSelected, 
  onSelect,
  onRemove 
}) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const priceChange = getPriceChange(favorite);
  const { ad } = favorite;
  const hasOpportunity = isOpportunity(userId, ad.id);
  
  const isUnavailable = ad.status === 'SOLD' || ad.status === 'PAUSED' || ad.status === 'BLOCKED';
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };
  
  const handleRemove = () => {
    setIsRemoving(true);
    removeFavorite(userId, favorite.id);
    setTimeout(() => {
      onRemove();
    }, 300);
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl border overflow-hidden transition-all hover:shadow-md ${
        isUnavailable ? 'grayscale opacity-60' : ''
      } ${isSelected ? 'ring-2 ring-green-700' : ''}`}
    >
      {/* Imagem */}
      <div className="relative aspect-square">
        <img 
          src={ad.images[0]} 
          alt={ad.title}
          className="w-full h-full object-cover"
        />
        
        {/* Badge de Preço */}
        <div className="absolute top-3 right-3 bg-green-700 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
          {formatPrice(ad.price)}
        </div>
        
        {/* Selo de Preço Reduzido */}
        {priceChange.isReduced && !isUnavailable && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 shadow-lg">
            <ArrowDown className="w-3 h-3" strokeWidth={1.5} />
            -{priceChange.percentChange.toFixed(0)}%
          </div>
        )}
        
        {/* Selo de Oportunidade */}
        {hasOpportunity && !isUnavailable && (
          <div className="absolute top-14 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 shadow-lg animate-pulse">
            <Zap className="w-3 h-3 fill-current" strokeWidth={1.5} />
            Oportunidade
          </div>
        )}
        
        {/* Overlay de Status */}
        {isUnavailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-white text-slate-900 px-4 py-2 rounded-lg font-semibold text-sm">
              {ad.status === 'SOLD' ? 'VENDIDO' : ad.status === 'PAUSED' ? 'PAUSADO' : 'INDISPONÍVEL'}
            </span>
          </div>
        )}
        
        {/* Checkbox de Seleção */}
        <div className="absolute bottom-3 left-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(favorite.id)}
            className="w-5 h-5 rounded border-2 border-white bg-white/90 checked:bg-green-700 checked:border-green-700 cursor-pointer"
          />
        </div>
        
        {/* Botão de Remover */}
        <button
          onClick={handleRemove}
          className="absolute bottom-3 right-3 p-2 bg-white/90 hover:bg-red-50 rounded-lg transition-colors group"
        >
          <Trash2 className="w-4 h-4 text-slate-600 group-hover:text-red-600" strokeWidth={1.5} />
        </button>
      </div>
      
      {/* Conteúdo */}
      <div className="p-4">
        {/* Título */}
        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 leading-tight">
          {ad.title}
        </h3>
        
        {/* Informações Técnicas */}
        {ad.technicalDetails && ad.technicalDetails.length > 0 && (
          <div className="flex items-center gap-2 mb-2 text-xs text-slate-600">
            <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{ad.technicalDetails[0].value}</span>
          </div>
        )}
        
        {/* Localização */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3">
          <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>{ad.location.city}, {ad.location.state}</span>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{ad.views}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Fav. {formatDate(favorite.favoritedAt)}
            </span>
            <a
              href={`/anuncio/${ad.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-slate-100 rounded transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-slate-600" strokeWidth={1.5} />
            </a>
          </div>
        </div>
        
        {/* Indicador de mudança de preço */}
        {priceChange.hasChanged && !isUnavailable && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Preço anterior:</span>
              <span className={`font-semibold ${priceChange.isReduced ? 'text-green-700' : 'text-red-600'}`}>
                {formatPrice(favorite.priceAtFavorite)}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
