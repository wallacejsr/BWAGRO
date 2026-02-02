
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Globe, X } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';

interface AdsSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdsSideDrawer: React.FC<AdsSideDrawerProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Resetar visualização interna ao abrir
  useEffect(() => {
    if (isOpen) setActiveCategory(null);
  }, [isOpen]);

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const queryParams = new URLSearchParams(location.search);
  const currentCategorySlug = queryParams.get('categoria');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Overlay com Blur */}
      <div 
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div 
        className={`absolute left-0 top-0 h-full w-full max-w-[350px] bg-white transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header Drawer */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {activeCategory ? activeCategory.name : 'Anúncios'}
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-1">
              {activeCategory ? 'Subcategorias' : 'Categorias principais'}
            </p>
          </div>
          <button 
            onClick={activeCategory ? () => setActiveCategory(null) : onClose}
            className="p-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600"
          >
            {activeCategory ? (
              <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
            ) : (
              <X className="w-5 h-5" strokeWidth={1.5} />
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="relative h-[calc(100%-160px)] overflow-y-auto custom-scrollbar">
          <div className="py-4">
            {!activeCategory ? (
              /* Nível 1: Categorias */
              <ul className="space-y-1">
                {/* Opção Todos os Anúncios */}
                <li>
                  <button 
                    onClick={() => handleNavigation('/anuncios')}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${!currentCategorySlug && location.pathname === '/anuncios' ? 'bg-green-50 text-green-700' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <Globe className="w-5 h-5" strokeWidth={1.5} />
                    <span className="font-semibold">Todos os Anúncios</span>
                  </button>
                </li>

                {CATEGORIES.map((cat) => {
                  const isActive = currentCategorySlug === cat.slug;
                  return (
                    <li key={cat.id}>
                      <button 
                        onClick={() => setActiveCategory(cat)}
                        className={`w-full flex items-center justify-between px-4 py-3 group transition-all ${isActive ? 'bg-green-50 text-green-700' : 'hover:bg-green-50/50 text-slate-700'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 group-hover:text-green-700">{cat.icon}</span>
                          <span className="font-semibold">{cat.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-all" strokeWidth={1.5} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              /* Nível 2: Subcategorias */
              <ul className="space-y-1">
                {/* Link para Ver Tudo da Categoria Pai (Conforme Requisito de Filtragem) */}
                <li>
                  <button 
                    onClick={() => handleNavigation(`/anuncios?categoria=${activeCategory.slug}`)}
                    className="w-full flex items-center px-6 py-4 bg-slate-50 text-green-800 font-semibold text-xs uppercase tracking-widest hover:bg-green-100 transition-all border-l-4 border-green-600"
                  >
                    Ver Tudo em {activeCategory.name}
                  </button>
                </li>
                {activeCategory.subcategories?.map((sub, idx) => {
                  const subSlug = sub.toLowerCase().replace(/\s+/g, '-');
                  const isActiveSub = queryParams.get('sub') === subSlug;
                  return (
                    <li key={idx}>
                      <button 
                        onClick={() => handleNavigation(`/anuncios?categoria=${activeCategory.slug}&sub=${subSlug}`)}
                        className={`w-full text-left px-6 py-3 transition-all border-l-4 ${isActiveSub ? 'border-green-600 bg-green-50 text-green-700 font-semibold' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                      >
                        {sub}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Footer Fixo */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-50 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-3 text-center">Precisa de ajuda para encontrar?</p>
          <button 
            onClick={() => handleNavigation('/anunciar')}
            className="block w-full text-center bg-green-700 text-white h-10 leading-10 rounded-lg font-semibold text-sm hover:bg-green-800 transition-all"
          >
            Anuncie Gratuitamente
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdsSideDrawer;
