
import React from 'react';
import { Newspaper } from 'lucide-react';
import NewsCard from './NewsCard';
import { MOCK_NEWS } from '../constants';

const NewsGrid: React.FC = () => {
  return (
    <section className="py-16 bg-slate-50/50 border-y border-slate-200/40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 text-center md:text-left">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 justify-center md:justify-start">
              <span className="w-7 h-7 bg-green-100 text-green-700 rounded-lg flex items-center justify-center">
                <Newspaper className="w-4 h-4" strokeWidth={1.5} />
              </span>
              Mural de Informações BWAGRO
            </h2>
            <p className="text-slate-500 mt-2 max-w-xl text-sm">
              Fique por dentro das principais notícias e tendências do agronegócio que impactam o seu dia a dia no campo.
            </p>
          </div>
          <button className="mt-6 md:mt-0 text-slate-900 font-semibold text-sm uppercase tracking-widest border-b border-slate-900 pb-1 hover:text-green-700 hover:border-green-700 transition-all">
            Ver todas as matérias
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_NEWS.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsGrid;
