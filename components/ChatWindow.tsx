import React, { useState, useEffect, useRef } from 'react';
import { Chat, Message } from '../types';
import { Send, AlertCircle, Unlock } from 'lucide-react';
import { getMessages, sendMessage, markChatAsRead, getLeadStatus, unlockLead, getUserCredits } from '../services/messageService';

interface ChatWindowProps {
  chat: Chat;
  currentUserId: string;
  currentUserName: string;
  onLeadUnlocked?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  chat, 
  currentUserId, 
  currentUserName,
  onLeadUnlocked 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [leadStatus, setLeadStatus] = useState<'pending' | 'unlocked'>('unlocked');
  const [userCredits, setUserCredits] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousMessagesLength = useRef(0);
  
  const isSeller = currentUserId === chat.sellerId;
  const canUnlock = isSeller && leadStatus === 'pending';
  
  useEffect(() => {
    loadMessages();
    markChatAsRead(chat.id, currentUserId);
    setLeadStatus(getLeadStatus(chat.id));
    setUserCredits(getUserCredits(currentUserId));
  }, [chat.id, currentUserId]);
  
  useEffect(() => {
    // Só rola se uma nova mensagem foi adicionada
    if (messages.length > previousMessagesLength.current) {
      scrollToBottom();
    }
    previousMessagesLength.current = messages.length;
  }, [messages]);
  
  const loadMessages = () => {
    const msgs = getMessages(chat.id);
    setMessages(msgs);
  };
  
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };
  
  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    sendMessage(chat.id, currentUserId, currentUserName, newMessage);
    setNewMessage('');
    loadMessages();
  };
  
  const handleUnlock = () => {
    const result = unlockLead(chat.id, currentUserId);
    
    if (result.success) {
      setLeadStatus('unlocked');
      setUserCredits(getUserCredits(currentUserId));
      onLeadUnlocked?.();
      alert(result.message);
    } else {
      alert(result.message);
    }
  };
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">
              {isSeller ? chat.buyerName : chat.sellerName}
            </h3>
            <p className="text-sm text-slate-600 truncate max-w-md">
              {chat.adTitle}
            </p>
          </div>
          
          {/* Badge de status do lead */}
          {canUnlock && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                Lead Pendente
              </span>
              <button
                onClick={handleUnlock}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 text-white text-sm rounded hover:bg-green-800 transition-colors"
              >
                <Unlock className="w-4 h-4" strokeWidth={1.5} />
                Desbloquear ({userCredits} créditos)
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mensagens */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p className="text-sm">Nenhuma mensagem ainda. Inicie a conversa!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {/* Nome do remetente (apenas mensagens dos outros) */}
                  {!isOwn && (
                    <span className="text-xs text-slate-600 px-3">
                      {message.senderName}
                    </span>
                  )}
                  
                  {/* Bolha da mensagem */}
                  <div
                    className={`px-4 py-2.5 rounded-lg ${
                      isOwn
                        ? 'bg-green-700 text-white'
                        : 'bg-white text-slate-900 border'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    
                    {/* Aviso de mensagem filtrada */}
                    {message.isFiltered && (
                      <div className="flex items-center gap-1 mt-2 text-xs opacity-75">
                        <AlertCircle className="w-3 h-3" strokeWidth={1.5} />
                        <span>Informação de contato bloqueada</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Hora */}
                  <span className={`text-xs text-slate-500 px-3 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Aviso de lead bloqueado */}
      {canUnlock && (
        <div className="px-4 py-3 bg-amber-50 border-t border-amber-200">
          <div className="flex items-start gap-2 text-sm text-amber-800">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <p className="font-medium">Lead não desbloqueado</p>
              <p className="text-xs mt-0.5">
                Mensagens com números de telefone ou e-mails serão bloqueadas automaticamente. 
                Desbloqueie o lead para ter acesso completo aos dados de contato.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Input de mensagem */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Digite sua mensagem..."
            rows={2}
            className="flex-1 px-4 py-2.5 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-700 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="px-4 h-[76px] bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
