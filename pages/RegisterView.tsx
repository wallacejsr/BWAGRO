import React, { useState, useEffect } from 'react';
import { Building2, ChevronLeft, Sprout } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';

type ProfileType = 'individual' | 'company' | null;

const RegisterView: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [profileType, setProfileType] = useState<ProfileType>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    document: '', // CPF ou CNPJ
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      navigate('/minha-conta', { replace: true });
    }
  }, [user, navigate]);

  // Validação
  useEffect(() => {
    if (!profileType) return;
    const newErrors: Record<string, string> = {};
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    // Simplificação de máscaras/validadores de documento para o protótipo
    if (formData.document && profileType === 'individual' && formData.document.replace(/\D/g, '').length !== 11) {
      newErrors.document = 'CPF inválido';
    }
    if (formData.document && profileType === 'company' && formData.document.replace(/\D/g, '').length !== 14) {
      newErrors.document = 'CNPJ inválido';
    }

    setErrors(newErrors);
  }, [formData, profileType]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0 || !acceptedTerms) return;

    setLoading(true);
    setRegisterError('');

    const { error } = await signUp(
      formData.email,
      formData.password,
      formData.name,
      formData.phone
    );

    if (error) {
      setRegisterError(
        error.message === 'User already registered'
          ? 'Este e-mail já está cadastrado'
          : 'Erro ao criar conta. Tente novamente.'
      );
      setLoading(false);
    } else {
      // Cadastro bem-sucedido
      setLoading(false);
      navigate('/anunciar', { replace: true });
    }
  };

  const getPasswordStrength = () => {
    if (!formData.password) return 0;
    let strength = 0;
    if (formData.password.length > 7) strength += 25;
    if (/[A-Z]/.test(formData.password)) strength += 25;
    if (/[0-9]/.test(formData.password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;
    return strength;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Lado Esquerdo: Imagem (60%) */}
      <div className="hidden md:flex md:w-[60%] relative h-screen">
        <img 
          src="https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=1600&auto=format&fit=crop" 
          alt="Inovação no Campo" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-950/80 via-green-800/40 to-transparent"></div>
        <div className="relative z-10 p-20 flex flex-col justify-end h-full text-white">
          <div className="max-w-xl">
            <h2 className="text-5xl font-black mb-6 font-display leading-tight">
              Sua jornada no agro digital começa agora.
            </h2>
            <p className="text-xl text-green-50/80 font-medium leading-relaxed">
              Crie seu perfil em segundos e conecte-se com o maior ecossistema de negócios rurais do país.
            </p>
          </div>
        </div>
      </div>

      {/* Lado Direito: Formulário (40%) */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-20 bg-slate-50 md:bg-white overflow-y-auto">
        <div className="max-w-md w-full animate-in fade-in slide-in-from-right duration-500">
          
          <div className="mb-10 text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-2xl font-black">T</span>
              </div>
              <span className="text-xl font-black text-slate-800">BWAGRO</span>
            </Link>
            
            {!profileType ? (
              <>
                <h1 className="text-3xl font-black text-slate-900 font-display">Como você quer atuar?</h1>
                <p className="text-slate-500 mt-2 font-medium">Selecione o tipo de conta para continuar.</p>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setProfileType(null)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-green-700 uppercase tracking-widest mb-4 hover:underline"
                >
                  <ChevronLeft className="w-3 h-3" strokeWidth={1.5} />
                  Trocar Tipo de Perfil
                </button>
                <h1 className="text-3xl font-black text-slate-900 font-display">
                  {profileType === 'individual' ? 'Perfil Produtor' : 'Perfil Empresa'}
                </h1>
                <p className="text-slate-500 mt-1 font-medium">Preencha os dados básicos da sua conta.</p>
              </>
            )}
          </div>

          {!profileType ? (
            /* Seleção de Perfil */
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setProfileType('individual')}
                className="group p-5 bg-white border border-slate-100 rounded-xl text-left hover:border-green-600 transition-all"
              >
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4">
                  <Sprout className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Sou Produtor</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">Para pessoas físicas que desejam comprar ou vender animais e máquinas.</p>
              </button>
              <button 
                onClick={() => setProfileType('company')}
                className="group p-5 bg-white border border-slate-100 rounded-xl text-left hover:border-green-600 transition-all"
              >
                <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Sou Empresa / Revenda</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">Para imobiliárias, concessionárias e empresas de insumos com CNPJ.</p>
              </button>
            </div>
          ) : (
            /* Formulário de Registro */
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  {profileType === 'individual' ? 'Nome Completo' : 'Razão Social'}
                </label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-green-600 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all font-medium"
                  placeholder={profileType === 'individual' ? 'Ex: João da Silva' : 'Ex: Agro Tech Ltda'}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  {profileType === 'individual' ? 'CPF' : 'CNPJ'}
                </label>
                <input 
                  required
                  type="text"
                  value={formData.document}
                  onChange={e => setFormData({...formData, document: e.target.value})}
                  className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-medium ${errors.document ? 'border-red-200' : 'border-transparent focus:border-green-600 focus:bg-white'}`}
                  placeholder={profileType === 'individual' ? '000.000.000-00' : '00.000.000/0001-00'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Telefone</label>
                  <input 
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-green-600 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all font-medium"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">E-mail</label>
                  <input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-medium ${errors.email ? 'border-red-200' : 'border-transparent focus:border-green-600 focus:bg-white'}`}
                    placeholder="email@agro.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Senha de Acesso</label>
                <div className="relative">
                  <input 
                    required
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-green-600 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all font-medium pr-14"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {/* Strength Meter */}
                {formData.password && (
                  <div className="mt-2 flex gap-1 h-1 px-1">
                    {[25, 50, 75, 100].map(s => (
                      <div 
                        key={s} 
                        className={`flex-1 rounded-full transition-all duration-500 ${getPasswordStrength() >= s ? (getPasswordStrength() > 50 ? 'bg-green-500' : 'bg-yellow-500') : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Confirmar Senha</label>
                <input 
                  required
                  type="password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className={`w-full bg-slate-50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-medium ${errors.confirmPassword ? 'border-red-200' : 'border-transparent focus:border-green-600 focus:bg-white'}`}
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-start gap-3 py-2">
                <input 
                  type="checkbox" 
                  id="terms"
                  required
                  checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-slate-200 text-green-600 focus:ring-green-500 transition-all cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs font-bold text-slate-500 leading-relaxed cursor-pointer">
                  Li e aceito os <Link to="/termos-de-uso" className="text-green-700 hover:underline">Termos de Uso</Link> e a <Link to="/privacidade" className="text-green-700 hover:underline">Política de Privacidade</Link> do BWAGRO.
                </label>
              </div>

              {registerError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-700 font-bold">{registerError}</p>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading || !acceptedTerms || Object.keys(errors).length > 0}
                className="w-full bg-green-700 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-green-200 hover:bg-green-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Criando sua conta...
                  </>
                ) : 'Finalizar Cadastro'}
              </button>
            </form>
          )}

          <div className="mt-12 text-center">
            <p className="text-slate-500 font-medium">
              Já possui uma conta?{' '}
              <Link to="/login" className="text-green-700 font-black hover:underline underline-offset-4 decoration-2">Fazer Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterView;