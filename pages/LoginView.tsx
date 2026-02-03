
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';

const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [adminHint, setAdminHint] = useState(false);
  
  // Prioriza o destino de onde o usuário veio, ou vai para o painel por padrão
  const from = (location.state as any)?.from?.pathname || "/minha-conta";

  // Validação em tempo real
  useEffect(() => {
    const validate = () => {
      let newErrors = { email: '', password: '' };
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Formato de e-mail inválido';
      }
      
      // Detecta se é o email do admin para dar um aviso
      if (formData.email === 'admin@bwagro.com' || formData.email === 'admin@bwagro.com.br') {
        setAdminHint(true);
      } else {
        setAdminHint(false);
      }

      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'A senha deve ter no mínimo 6 caracteres';
      }
      setErrors(newErrors);
    };
    validate();
  }, [formData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (errors.email || errors.password || !formData.email || !formData.password) return;

    if (formData.email === 'admin@bwagro.com' || formData.email === 'admin@bwagro.com.br') {
      navigate('/admin/login');
      return;
    }

    setLoading(true);
    setLoginError('');

    const { error } = await signIn(formData.email, formData.password);

    if (error) {
      setLoginError(
        error.message === 'Invalid login credentials' 
          ? 'E-mail ou senha incorretos' 
          : 'Erro ao fazer login. Tente novamente.'
      );
      setLoading(false);
    } else {
      navigate(from, { replace: true });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Lado Esquerdo: Imagem Dinâmica (60%) */}
      <div className="hidden md:flex md:w-[60%] relative h-screen">
        <img 
          src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1600&auto=format&fit=crop" 
          alt="Agronegócio de Alta Performance" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-green-800/40 to-transparent"></div>
        <div className="relative z-10 p-20 flex flex-col justify-end h-full text-white">
          <div className="max-w-xl">
            <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block border border-white/20">
              Conexão Rural
            </span>
            <h2 className="text-5xl font-black mb-6 font-display leading-tight">
              O futuro do agronegócio acontece aqui.
            </h2>
            <p className="text-xl text-green-50/80 font-medium leading-relaxed">
              Junte-se à maior rede de produtores rurais do Brasil e transforme sua produtividade em resultados reais.
            </p>
          </div>
        </div>
      </div>

      {/* Lado Direito: Formulário (40%) */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-slate-50 md:bg-white overflow-y-auto">
        <div className="max-w-md w-full animate-in fade-in slide-in-from-right duration-700">
          <div className="mb-12">
            <Link to="/" className="inline-flex items-center gap-2 mb-10 group">
              <div className="w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 transition-transform group-hover:scale-110">
                <span className="text-white text-3xl font-black">T</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-800">Terra<span className="text-green-700">Link</span></span>
            </Link>
            <h1 className="text-3xl font-black text-slate-900 font-display">Acesse sua conta</h1>
            <p className="text-slate-500 mt-3 font-medium">Insira suas credenciais para gerenciar seus negócios.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Endereço de E-mail</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 outline-none transition-all font-medium ${errors.email ? 'border-red-200 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-green-600 focus:bg-white'}`}
                  placeholder="exemplo@agro.com.br"
                />
                {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1 uppercase">{errors.email}</p>}
                {adminHint && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-[10px] text-blue-700 font-bold leading-tight">
                      Este e-mail pertence à administração. Por favor, use o <Link to="/admin/login" className="underline font-black">Portal Admin</Link>.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha Segura</label>
                <button type="button" className="text-[10px] font-black text-green-700 uppercase tracking-widest hover:underline">Esqueci minha senha</button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 outline-none transition-all font-medium pr-14 ${errors.password ? 'border-red-200 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-green-600 focus:bg-white'}`}
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
                {errors.password && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1 uppercase">{errors.password}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 py-2">
              <input 
                type="checkbox" 
                id="remember"
                className="w-5 h-5 rounded border-slate-200 text-green-600 focus:ring-green-500 transition-all cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm font-bold text-slate-600 cursor-pointer">Lembrar-me neste dispositivo</label>
            </div>

            {loginError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700 font-bold">{loginError}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-green-200 hover:bg-green-800 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : 'Entrar no BWAGRO'}
              </button>
            </div>
          </form>

          <div className="my-10 flex items-center gap-4">
            <div className="h-px bg-slate-200 flex-grow"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Ou entre com</span>
            <div className="h-px bg-slate-200 flex-grow"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 py-4 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 group">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              <span className="text-sm font-bold text-slate-700">Google</span>
            </button>
            <button className="flex items-center justify-center gap-3 py-4 border-2 border-slate-100 rounded-2xl hover:bg-green-50 transition-all active:scale-95 group">
              <img src="https://www.svgrepo.com/show/475692/whatsapp-color.svg" className="w-5 h-5" alt="WhatsApp" />
              <span className="text-sm font-bold text-slate-700">WhatsApp</span>
            </button>
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-500 font-medium">
              Não tem uma conta?{' '}
              <Link to="/cadastro" className="text-green-700 font-black hover:underline underline-offset-4 decoration-2">Cadastre-se grátis</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
