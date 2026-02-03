import React, { useState, useEffect } from 'react';
import { Mail, Server, Lock, Eye, EyeOff, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { SMTPConfig } from '../types';
import { getSMTPConfig, saveSMTPConfig, validateSMTPConfig, testSMTPConnection, sendTestEmail } from '../services/emailService';

export const SMTPConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<Partial<SMTPConfig>>({
    id: 'smtp_config_1',
    host: '',
    port: 587,
    user: '',
    password: '',
    encryption: 'TLS',
    fromEmail: '',
    fromName: 'BWAGRO',
    isActive: true
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  useEffect(() => {
    loadConfig();
  }, []);
  
  const loadConfig = () => {
    const stored = getSMTPConfig();
    if (stored) {
      setConfig(stored);
    }
  };
  
  const handleSave = () => {
    const validation = validateSMTPConfig(config);
    
    if (!validation.valid) {
      setMessage({
        type: 'error',
        text: validation.errors.join(', ')
      });
      return;
    }
    
    setIsSaving(true);
    
    saveSMTPConfig(config as SMTPConfig);
    
    setTimeout(() => {
      setIsSaving(false);
      setMessage({
        type: 'success',
        text: 'Configurações SMTP salvas com sucesso!'
      });
    }, 1000);
  };
  
  const handleTest = async () => {
    setIsTesting(true);
    setMessage(null);
    
    try {
      const result = await testSMTPConnection(config as SMTPConfig);
      
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao testar conexão SMTP'
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      setMessage({
        type: 'error',
        text: 'Digite um e-mail válido para teste'
      });
      return;
    }
    
    setIsTesting(true);
    
    try {
      const result = await sendTestEmail(testEmail);
      
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao enviar e-mail de teste'
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Configuração SMTP</h2>
        <p className="text-sm text-slate-600">
          Configure o servidor de e-mail para envio de notificações automáticas
        </p>
      </div>
      
      {/* Mensagem de feedback */}
      {message && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <Check className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          )}
          <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {message.text}
          </p>
        </div>
      )}
      
      {/* Formulário */}
      <div className="bg-white border rounded-lg p-6 space-y-5">
        {/* Servidor SMTP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Server className="w-4 h-4 inline mr-1.5" strokeWidth={1.5} />
              Host SMTP
            </label>
            <input
              type="text"
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              placeholder="smtp.gmail.com"
              className="w-full px-4 h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Porta
            </label>
            <input
              type="number"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
              placeholder="587"
              className="w-full px-4 h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 text-sm"
            />
          </div>
        </div>
        
        {/* Credenciais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Usuário (E-mail)
            </label>
            <input
              type="email"
              value={config.user}
              onChange={(e) => setConfig({ ...config, user: e.target.value })}
              placeholder="seu-email@exemplo.com"
              className="w-full px-4 h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1.5" strokeWidth={1.5} />
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <Eye className="w-4 h-4" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Criptografia */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Tipo de Criptografia
          </label>
          <div className="flex gap-4">
            {(['SSL', 'TLS', 'NONE'] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="encryption"
                  value={type}
                  checked={config.encryption === type}
                  onChange={(e) => setConfig({ ...config, encryption: e.target.value as any })}
                  className="w-4 h-4 text-green-700 focus:ring-green-700"
                />
                <span className="text-sm text-slate-700">{type}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Remetente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1.5" strokeWidth={1.5} />
              E-mail do Remetente
            </label>
            <input
              type="email"
              value={config.fromEmail}
              onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
              placeholder="notificacoes@bwagro.com.br"
              className="w-full px-4 h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nome do Remetente
            </label>
            <input
              type="text"
              value={config.fromName}
              onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
              placeholder="BWAGRO"
              className="w-full px-4 h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 text-sm"
            />
          </div>
        </div>
        
        {/* Status */}
        <div className="flex items-center gap-2 pt-3 border-t">
          <input
            type="checkbox"
            id="isActive"
            checked={config.isActive}
            onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-green-700 focus:ring-green-700"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
            Ativar envio de e-mails
          </label>
        </div>
      </div>
      
      {/* Ações */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 h-10 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
              Salvando...
            </>
          ) : (
            'Salvar Configurações'
          )}
        </button>
        
        <button
          onClick={handleTest}
          disabled={isTesting}
          className="px-6 h-10 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {isTesting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
              Testando...
            </>
          ) : (
            <>
              <Server className="w-4 h-4" strokeWidth={1.5} />
              Testar Conexão
            </>
          )}
        </button>
      </div>
      
      {/* Teste de E-mail */}
      <div className="bg-slate-50 border rounded-lg p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Enviar E-mail de Teste</h3>
        <div className="flex gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Digite um e-mail para teste"
            className="flex-1 px-4 h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 text-sm"
          />
          <button
            onClick={handleSendTestEmail}
            disabled={isTesting || !testEmail}
            className="px-6 h-10 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4" strokeWidth={1.5} />
            Enviar Teste
          </button>
        </div>
      </div>
    </div>
  );
};
