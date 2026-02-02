
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { NewsItem } from '../types';

interface NewsCardProps {
  news: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  return (
    <a 
      href={news.link}
      className="group block bg-white rounded-xl overflow-hidden transition-all duration-300 border border-slate-100 h-full"
    >
      {/* Image Container with Badge */}
      <div className="relative h-40 overflow-hidden">
        <img 
          src={news.imageUrl} 
          alt={news.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 z-10 bg-slate-900 text-white text-[10px] font-semibold uppercase px-2.5 py-1 rounded-md tracking-widest">
          {news.category}
        </div>
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {news.date}
        </p>
        <h3 className="text-sm font-semibold text-slate-800 mb-2 line-clamp-2 leading-tight group-hover:text-green-700 transition-colors">
          {news.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {news.summary}
        </p>
        
        {/* Visual Cue for Link */}
        <div className="mt-4 flex items-center gap-2 text-green-700 font-semibold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          Ler notícia completa
          <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
        </div>
      </div>
    </a>
  );
};

export default NewsCard;
