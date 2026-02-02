
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import AdCard from '../components/AdCard';
import { AdStatus } from '../types';

type Step = 'CATEGORY' | 'DETAILS' | 'MEDIA' | 'PRICING' | 'REVIEW' | 'SUCCESS';

const AdCreationView: React.FC = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('bwagro_user');
  
  // Se não estiver logado, o App.tsx tratará o redirecionamento, 
  // mas mantemos um fallback de segurança aqui.
  if (!user) return <Navigate to="/login" replace />;

  const [currentStep, setCurrentStep] = useState<Step>('CATEGORY');
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    price: 0,
    priceNegotiable: false,
    categoryId: '',
    categorySlug: '',
    location: { cep: '', city: '', state: '' },
    technical: {},
    images: [],
    isPremium: false
  });

  // Persistência de rascunho
  useEffect(() => {
    const draft = localStorage.getItem('bwagro_ad_draft');
    if (draft) setFormData(JSON.parse(draft));
  }, []);

  useEffect(() => {
    localStorage.setItem('bwagro_ad_draft', JSON.stringify(formData));
  }, [formData]);

  const handleCepLookup = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData({
            ...formData,
            location: { ...formData.location, cep: cleanCep, city: data.localidade, state: data.uf }
          });
        }
      } catch (e) { console.error("CEP error"); }
    }
  };

  const steps: Step[] = ['CATEGORY', 'DETAILS', 'MEDIA', 'PRICING', 'REVIEW'];
  const currentStepIndex = steps.indexOf(currentStep);

  const renderStep = () => {
    switch (currentStep) {
      case 'CATEGORY':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setFormData({ ...formData, categoryId: cat.id, categorySlug: cat.slug });
                  setCurrentStep('DETAILS');
                }}
                className={`p-8 rounded-[2rem] border-2 transition-all text-center group ${formData.categoryId === cat.id ? 'border-green-600 bg-green-50 shadow-lg' : 'border-slate-100 hover:border-green-200 hover:bg-slate-50'}`}
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <div className="font-black text-slate-800">{cat.name}</div>
              </button>
            ))}
          </div>
        );

      case 'DETAILS':
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Título do Anúncio</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-green-600 outline-none" 
                  placeholder="Ex: Trator John Deere 6125J - Único Dono"
                />
              </div>

              {/* Campos Dinâmicos conforme categoria */}
              <div className="grid grid-cols-2 gap-4">
                {formData.categorySlug === 'maquinas' && (
                  <>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Horas de Uso</label>
                      <input type="number" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-600 outline-none" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ano</label>
                      <input type="number" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-600 outline-none" placeholder="2024" />
                    </div>
                  </>
                )}
                {formData.categorySlug === 'animais' && (
                  <>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Quantidade</label>
                      <input type="number" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-600 outline-none" placeholder="Ex: 50" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Raça</label>
                      <input type="text" className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-600 outline-none" placeholder="Ex: Nelore" />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Descrição Completa</label>
                <textarea 
                  rows={6}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-green-600 outline-none resize-none" 
                  placeholder="Descreva detalhes do produto, histórico e condições de conservação..."
                ></textarea>
              </div>
            </div>
            <button onClick={() => setCurrentStep('MEDIA')} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all">Próxima Etapa: Fotos</button>
          </div>
        );

      case 'MEDIA':
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center hover:border-green-200 transition-colors cursor-pointer bg-slate-50/50">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-lg font-black text-slate-800">Clique ou arraste suas fotos aqui</h3>
              <p className="text-slate-400 text-sm mt-2">Formatos aceitos: JPG, PNG. Tamanho máximo 5MB por foto.</p>
              <input type="file" multiple className="hidden" />
              <button 
                onClick={() => setFormData({...formData, images: ['https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop']})}
                className="mt-6 bg-white text-slate-900 px-6 py-2 rounded-xl font-bold border border-slate-200 shadow-sm"
              >
                Simular Upload de Capa
              </button>
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {formData.images.map((img: string, i: number) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-green-500 shadow-md">
                    <img src={img} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">Capa</div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setCurrentStep('PRICING')} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all">Próxima Etapa: Preço e Local</button>
          </div>
        );

      case 'PRICING':
        return (
          <div className="max-w-2xl mx-auto space-y-10">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Valor de Venda (R$)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-16 pr-6 py-5 text-2xl font-black text-slate-900 outline-none focus:ring-2 focus:ring-green-600" 
                    placeholder="0,00"
                  />
                </div>
                <div className="mt-4 flex items-center gap-2">
                   <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500" />
                   <span className="text-sm font-bold text-slate-600">Preço sob consulta / Aceita troca</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">CEP Localização</label>
                  <input 
                    type="text" 
                    maxLength={9}
                    value={formData.location.cep}
                    onChange={e => handleCepLookup(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-green-600 outline-none" 
                    placeholder="00000-000"
                  />
                </div>
                <div>
                   <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cidade</label>
                   <input disabled value={formData.location.city} className="w-full bg-slate-100 border-none rounded-xl px-6 py-4 text-slate-500" />
                </div>
                <div>
                   <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Estado</label>
                   <input disabled value={formData.location.state} className="w-full bg-slate-100 border-none rounded-xl px-6 py-4 text-slate-500" />
                </div>
              </div>
            </div>
            <button onClick={() => setCurrentStep('REVIEW')} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all">Revisar Anúncio</button>
          </div>
        );

      case 'REVIEW':
        const previewAd = {
          ...formData,
          id: 'preview',
          status: AdStatus.ACTIVE,
          views: 0,
          createdAt: new Date().toISOString(),
          userId: 'u1',
          whatsapp: '11999999999',
          location: { city: formData.location.city || 'Cidade', state: formData.location.state || 'UF' }
        };
        return (
          <div className="flex flex-col lg:flex-row gap-12 items-start max-w-5xl mx-auto">
            <div className="flex-1 space-y-8">
              <div className="bg-green-50 p-8 rounded-[2rem] border border-green-100">
                <h3 className="text-xl font-black text-green-900 mb-2">Quase lá!</h3>
                <p className="text-green-700">Verifique se todas as informações estão corretas. Seu anúncio será publicado instantaneamente.</p>
              </div>
              <div className="space-y-4">
                <button 
                  onClick={() => {
                    localStorage.removeItem('bwagro_ad_draft');
                    setCurrentStep('SUCCESS');
                  }}
                  className="w-full py-6 bg-green-700 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-green-900/20 hover:bg-green-800 transition-all active:scale-95"
                >
                  Publicar Anúncio Agora
                </button>
                <button onClick={() => setCurrentStep('CATEGORY')} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-all">Editar Informações</button>
              </div>
            </div>
            <div className="w-full lg:w-[400px]">
               <div className="sticky top-28">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Visualização no App</p>
                  <AdCard ad={previewAd as any} />
               </div>
            </div>
          </div>
        );

      case 'SUCCESS':
        return (
          <div className="max-w-xl mx-auto text-center py-20">
            <div className="w-32 h-32 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-10 text-6xl shadow-xl shadow-green-100">
               ✅
            </div>
            <h1 className="text-4xl font-black text-slate-900 font-display mb-4">Anúncio Publicado!</h1>
            <p className="text-slate-500 text-lg mb-12">Seu anúncio já está no ar e visível para milhares de produtores rurais.</p>
            <div className="flex flex-col gap-4">
               <button onClick={() => navigate('/anuncios')} className="w-full py-5 bg-green-700 text-white rounded-2xl font-black shadow-lg">Ver Meus Anúncios</button>
               <button onClick={() => { setFormData({title: '', description: '', price: 0, location: {cep:'', city:'', state:''}, images:[]}); setCurrentStep('CATEGORY'); }} className="w-full py-5 border-2 border-slate-100 text-slate-600 rounded-2xl font-black">Anunciar Outro Produto</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      {/* Stepper Progress Header */}
      {currentStep !== 'SUCCESS' && (
        <div className="bg-white border-b border-gray-100 mb-12 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center relative">
              {/* Progress Line */}
              <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
              <div 
                className="absolute left-0 top-1/2 h-1 bg-green-600 -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              ></div>
              
              {steps.map((s, i) => (
                <div key={s} className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${i <= currentStepIndex ? 'bg-green-600 text-white shadow-lg shadow-green-200 scale-110' : 'bg-white border-2 border-slate-100 text-slate-300'}`}>
                    {i + 1}
                  </div>
                  <span className={`hidden md:block absolute -bottom-8 whitespace-nowrap text-[10px] font-black uppercase tracking-widest ${i <= currentStepIndex ? 'text-green-700' : 'text-slate-300'}`}>
                    {s === 'CATEGORY' ? 'Categoria' : s === 'DETAILS' ? 'Dados' : s === 'MEDIA' ? 'Fotos' : s === 'PRICING' ? 'Preço' : 'Revisão'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        {renderStep()}
      </div>
    </div>
  );
};

export default AdCreationView;
