
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-semibold">T</span>
              </div>
              <span className="text-xl font-semibold tracking-tight text-white">BW<span className="text-green-500">AGRO</span></span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Conectando o campo ao mercado com tecnologia, transparência e as melhores oportunidades para o produtor rural brasileiro.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-green-600 transition-colors">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" strokeWidth={1.5} />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-green-600 transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Plataforma</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/anuncios" className="hover:text-green-500 transition-colors">Todos os anúncios</Link></li>
              <li><Link to="/categorias" className="hover:text-green-500 transition-colors">Categorias</Link></li>
              <li><Link to="/anunciar" className="hover:text-green-500 transition-colors">Anunciar Grátis</Link></li>
              <li><Link to="/planos" className="hover:text-green-500 transition-colors">Planos Premium</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Institucional</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/quem-somos" className="hover:text-green-500 transition-colors">Quem Somos</Link></li>
              <li><Link to="/termos-de-uso" className="hover:text-green-500 transition-colors">Termos de Uso</Link></li>
              <li><Link to="/privacidade" className="hover:text-green-500 transition-colors">Privacidade</Link></li>
              <li><Link to="/contato" className="hover:text-green-500 transition-colors">Contato</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Fale Conosco</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-green-500" strokeWidth={1.5} />
                0800 123 4567
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-green-500" strokeWidth={1.5} />
                suporte@bwagro.com.br
              </li>
            </ul>
            <div className="mt-8">
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">Receba novidades</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Seu e-mail" 
                  className="bg-slate-800 border-none rounded-l-lg px-3 h-9 text-sm w-full focus:ring-1 focus:ring-green-500 outline-none"
                />
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 h-9 rounded-r-lg text-sm font-semibold">
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            &copy; 2024 BWAGRO Marketplace. Todos os direitos reservados. CNPJ: 00.000.000/0001-00
          </p>
          <div className="flex gap-6 grayscale opacity-50">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="Mastercard" className="h-4" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
