import React, { useState } from 'react';
import { Check, Clock, Mail, MapPin, MessageCircle } from 'lucide-react';
import { CONTACT_CONFIG } from '../constants';

const ContactView: React.FC = () => {
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Suporte Técnico',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');

    // Simulação de envio
    setTimeout(() => {
      setFormStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: 'Suporte Técnico', message: '' });
      setTimeout(() => setFormStatus('idle'), 5000);
    }, 1500);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-xl font-semibold mb-3">Fale Conosco</h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Estamos aqui para ajudar você a colher os melhores resultados. Entre em contato pelos nossos canais oficiais ou envie uma mensagem.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 -mt-8 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Coluna 1: Informações de Contato */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl p-5 border border-slate-100">
              <h2 className="text-xl font-semibold text-slate-900 mb-5">Canais de Atendimento</h2>
              
              <div className="space-y-5">
                {/* WhatsApp */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">WhatsApp</p>
                    <a href={`https://wa.me/${CONTACT_CONFIG.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-slate-800 hover:text-green-600 transition-colors">
                      {CONTACT_CONFIG.whatsappDisplay}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">E-mail</p>
                    <a href={`mailto:${CONTACT_CONFIG.email}`} className="text-sm font-semibold text-slate-800 hover:text-green-600 transition-colors">
                      {CONTACT_CONFIG.email}
                    </a>
                  </div>
                </div>

                {/* Endereço */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Endereço Sede</p>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">
                      {CONTACT_CONFIG.address}
                    </p>
                  </div>
                </div>

                {/* Horário */}
                <div className="pt-5 border-t border-slate-100 flex items-center gap-3 text-slate-500">
                  <Clock className="w-5 h-5 text-green-600" strokeWidth={1.5} />
                  <p className="text-sm font-semibold">{CONTACT_CONFIG.workingHours}</p>
                </div>
              </div>
            </div>

            {/* Google Map Placeholder */}
            <div className="bg-white rounded-xl p-2 border border-slate-100 overflow-hidden h-56">
              <iframe 
                src={CONTACT_CONFIG.mapEmbedUrl}
                width="100%" 
                height="100%" 
                style={{ border: 0, borderRadius: '0.75rem' }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Coluna 2: Formulário */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl p-6 border border-slate-100">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Envie sua Mensagem</h2>
              
              {formStatus === 'success' ? (
                <div className="py-12 text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-14 h-14 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Check className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Mensagem Enviada!</h3>
                  <p className="text-slate-500 text-sm">Agradecemos seu contato. Nossa equipe responderá em breve.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome Completo</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-lg px-4 h-10 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail</label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-lg px-4 h-10 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 ml-1">Telefone</label>
                      <input 
                        type="tel" 
                        required
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-lg px-4 h-10 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 ml-1">Assunto</label>
                      <select 
                        value={formData.subject}
                        onChange={e => setFormData({...formData, subject: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-lg px-4 h-10 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                      >
                        <option>Suporte Técnico</option>
                        <option>Dúvidas sobre Planos</option>
                        <option>Parcerias Comerciais</option>
                        <option>Sugestões e Elogios</option>
                        <option>Denunciar Anúncio</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 ml-1">Mensagem</label>
                    <textarea 
                      required
                      rows={5}
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none"
                      placeholder="Como podemos ajudar?"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    disabled={formStatus === 'sending'}
                    className="w-full bg-green-700 text-white h-10 rounded-lg font-semibold text-sm hover:bg-green-800 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {formStatus === 'sending' ? (
                      <>
                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                        Enviando Mensagem...
                      </>
                    ) : 'Enviar Mensagem'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactView;