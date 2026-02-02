
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, Clock, DollarSign, Eye, Heart, MessageCircle, Share2, ShieldCheck } from 'lucide-react';
import { MOCK_ADS } from '../constants';

const AdDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const ad = MOCK_ADS.find((a) => a.id === id);

  if (!ad) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Anúncio não encontrado</h2>
        <Link to="/" className="text-green-700 font-bold hover:underline">Voltar para a home</Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(ad.price);

  return (
    <div className="bg-gray-50 pb-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
          <Link to="/" className="hover:text-green-700">Início</Link>
          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-slate-600">Anúncio</span>
          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-slate-900 font-bold truncate max-w-[200px] md:max-w-none">{ad.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Gallery & Description */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Gallery Card */}
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 p-2">
            <div className="relative aspect-video rounded-[1.8rem] overflow-hidden">
              <img 
                src={ad.images[0]} 
                alt={ad.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 right-6 flex gap-2">
                 <button className="bg-white/90 backdrop-blur-md p-3 rounded-lg text-slate-700 hover:text-red-500 transition-colors">
                   <Heart className="w-5 h-5" strokeWidth={1.5} />
                </button>
                 <button className="bg-white/90 backdrop-blur-md p-3 rounded-lg text-slate-700 hover:text-blue-500 transition-colors">
                   <Share2 className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
            {/* Gallery Thumbnails (Placeholder) */}
            <div className="flex gap-4 p-6 overflow-x-auto custom-scrollbar">
              {[...ad.images, ...ad.images].map((img, i) => (
                <div key={i} className={`flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${i === 0 ? 'border-green-600' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Technical Specifications Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 font-display px-2">Especificações Técnicas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {ad.technicalDetails?.map((detail, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="p-3 bg-green-50 text-green-700 rounded-xl">
                    {detail.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{detail.label}</p>
                    <p className="text-lg font-black text-slate-800">{detail.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-1.5 h-8 bg-green-600 rounded-full"></div>
               <h2 className="text-2xl font-black text-slate-900 font-display">Descrição Detalhada</h2>
            </div>
            <div className="text-slate-600 leading-relaxed space-y-4">
              <p className="whitespace-pre-line text-lg">
                {ad.description}
              </p>
              <div className="pt-6 border-t border-gray-50 flex items-center gap-2 text-sm font-bold text-slate-400">
                <Clock className="w-4 h-4" strokeWidth={1.5} />
                Anunciado em: {new Date(ad.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: CTA & User info */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Fixed/Sticky CTA Card */}
          <div className="sticky top-28 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-gray-100 overflow-hidden">
            <div className="p-8 space-y-8">
              <div>
                <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">Valor de Venda</span>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{formattedPrice}</h1>
                <p className="text-slate-400 text-sm mt-2 font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4" strokeWidth={1.5} />
                  {ad.views.toLocaleString()} visualizações totais
                </p>
              </div>

              <div className="space-y-4">
                <a 
                  href={`https://wa.me/${ad.whatsapp}?text=Olá! Tenho interesse no anúncio: ${ad.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-lg transition-all shadow-lg shadow-green-600/20 active:scale-95"
                >
                  <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
                  Conversar agora
                </a>
                <button className="w-full py-5 border-2 border-slate-100 hover:border-green-600 hover:text-green-700 text-slate-600 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2">
                   <DollarSign className="w-5 h-5" strokeWidth={1.5} />
                   Fazer uma Proposta
                </button>
              </div>

              <div className="pt-8 border-t border-gray-50 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-xl font-bold text-slate-500">
                    JD
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">John Deere Authorized</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Vendedor Verificado</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-3 rounded-xl text-center">
                     <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Vendas</p>
                     <p className="text-sm font-black text-slate-700">+150</p>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-xl text-center">
                     <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Avaliação</p>
                     <p className="text-sm font-black text-slate-700">4.9/5.0</p>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900 p-6 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" strokeWidth={1.5} />
              <span className="text-white text-[11px] font-bold uppercase tracking-widest">Negócio 100% Protegido</span>
            </div>
          </div>

          {/* Safety Card */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-4">
             <h3 className="font-bold text-slate-900 flex items-center gap-2">
               <AlertTriangle className="w-5 h-5 text-yellow-500" strokeWidth={1.5} />
                Dicas de Segurança
             </h3>
             <ul className="text-xs text-slate-500 space-y-3">
               <li>• Nunca realize pagamentos antecipados sem ver o produto.</li>
               <li>• Desconfie de preços muito abaixo do mercado.</li>
               <li>• Prefira encontrar o vendedor em locais públicos.</li>
               <li>• Verifique a documentação antes de fechar negócio.</li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdDetailView;
