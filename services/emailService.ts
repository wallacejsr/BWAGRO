import { SMTPConfig } from '../types';

// ========================================
// GERENCIAMENTO DE CONFIGURAÇÃO SMTP
// ========================================

export const getSMTPConfig = (): SMTPConfig | null => {
  const stored = localStorage.getItem('bwagro_smtp_config');
  return stored ? JSON.parse(stored) : null;
};

export const saveSMTPConfig = (config: SMTPConfig): void => {
  // Criptografia simples (em produção, usar bcrypt/crypto no backend)
  const encrypted = {
    ...config,
    password: btoa(config.password), // Base64 (apenas para demo)
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem('bwagro_smtp_config', JSON.stringify(encrypted));
};

export const decryptSMTPPassword = (encryptedPassword: string): string => {
  try {
    return atob(encryptedPassword);
  } catch {
    return '';
  }
};

export const testSMTPConnection = async (config: SMTPConfig): Promise<{ success: boolean; message: string }> => {
  // Simulação de teste de conexão
  // Em produção, fazer requisição para backend testar SMTP real
  
  return new Promise((resolve) => {
    setTimeout(() => {
      if (config.host && config.port && config.user && config.password) {
        resolve({
          success: true,
          message: 'Conexão SMTP testada com sucesso!'
        });
      } else {
        resolve({
          success: false,
          message: 'Dados de configuração inválidos'
        });
      }
    }, 1500);
  });
};

// ========================================
// ENVIO DE E-MAILS
// ========================================

export const sendPriceDropEmail = async (
  to: string,
  userName: string,
  adTitle: string,
  adId: string,
  oldPrice: number,
  newPrice: number,
  percentDrop: number
): Promise<{ success: boolean; message: string }> => {
  const smtpConfig = getSMTPConfig();
  
  if (!smtpConfig || !smtpConfig.isActive) {
    return {
      success: false,
      message: 'Configuração SMTP não encontrada ou inativa'
    };
  }
  
  // Formatar preços
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  const emailHTML = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Alerta de Preço - BWAGRO</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #15803d 0%, #166534 100%); padding: 32px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">🔥 Alerta de Preço!</h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">O item que você favoritou teve uma redução de preço</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px;">
          <p style="margin: 0 0 24px; color: #334155; font-size: 16px;">Olá, <strong>${userName}</strong>!</p>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 18px; font-weight: 600;">${adTitle}</h2>
            
            <div style="display: flex; align-items: center; gap: 12px; margin-top: 16px;">
              <div>
                <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">De</p>
                <p style="margin: 4px 0 0; font-size: 18px; color: #64748b; text-decoration: line-through;">${formatPrice(oldPrice)}</p>
              </div>
              
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="7 13 12 18 17 13"></polyline>
                <polyline points="7 6 12 11 17 6"></polyline>
              </svg>
              
              <div>
                <p style="margin: 0; font-size: 12px; color: #15803d; text-transform: uppercase; font-weight: 600;">Para</p>
                <p style="margin: 4px 0 0; font-size: 24px; color: #15803d; font-weight: 700;">${formatPrice(newPrice)}</p>
              </div>
            </div>
            
            <div style="margin-top: 16px; padding: 12px; background: #dcfce7; border-radius: 6px; text-align: center;">
              <p style="margin: 0; color: #15803d; font-size: 14px; font-weight: 600;">
                💰 Você economiza ${percentDrop.toFixed(0)}% neste anúncio!
              </p>
            </div>
          </div>
          
          <a href="${window.location.origin}/#/anuncio/${adId}" 
             style="display: block; width: 100%; padding: 14px 24px; background: #15803d; color: white; text-align: center; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-sizing: border-box;">
            Ver Anúncio Completo
          </a>
          
          <p style="margin: 24px 0 0; color: #64748b; font-size: 12px; text-align: center;">
            Esta é uma notificação automática baseada em seus favoritos.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8fafc; padding: 24px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="margin: 0; color: #64748b; font-size: 12px;">
            © 2026 BWAGRO - Marketplace Rural<br>
            <a href="${window.location.origin}" style="color: #15803d; text-decoration: none;">www.bwagro.com.br</a>
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;
  
  // Simulação de envio (em produção, fazer requisição para backend)
  console.log('📧 Email enviado:', {
    from: `${smtpConfig.fromName} <${smtpConfig.fromEmail}>`,
    to,
    subject: `🔥 Preço Reduzido: ${adTitle}`,
    html: emailHTML,
    smtp: {
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.user,
      encryption: smtpConfig.encryption
    }
  });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'E-mail enviado com sucesso!'
      });
    }, 1000);
  });
};

export const sendTestEmail = async (toEmail: string): Promise<{ success: boolean; message: string }> => {
  const smtpConfig = getSMTPConfig();
  
  if (!smtpConfig) {
    return {
      success: false,
      message: 'Configure o SMTP antes de enviar e-mails de teste'
    };
  }
  
  // Simulação
  console.log('📧 E-mail de teste enviado para:', toEmail);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `E-mail de teste enviado para ${toEmail}`
      });
    }, 1000);
  });
};

// ========================================
// VALIDAÇÕES
// ========================================

export const validateSMTPConfig = (config: Partial<SMTPConfig>): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!config.host || config.host.trim() === '') {
    errors.push('Host SMTP é obrigatório');
  }
  
  if (!config.port || config.port < 1 || config.port > 65535) {
    errors.push('Porta deve estar entre 1 e 65535');
  }
  
  if (!config.user || config.user.trim() === '') {
    errors.push('Usuário (e-mail) é obrigatório');
  }
  
  if (!config.password || config.password.trim() === '') {
    errors.push('Senha é obrigatória');
  }
  
  if (!config.fromEmail || !config.fromEmail.includes('@')) {
    errors.push('E-mail do remetente inválido');
  }
  
  if (!config.fromName || config.fromName.trim() === '') {
    errors.push('Nome do remetente é obrigatório');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
