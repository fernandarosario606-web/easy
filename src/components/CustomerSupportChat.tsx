import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Bot, User, Sparkles, HelpCircle } from 'lucide-react';
import { Message } from '../types';

export default function CustomerSupportChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Olá! Sou o **Easy Assistant**, seu assistente financeiro inteligente em tempo real. 🚀\n\nComo posso ajudar você hoje? Você pode me perguntar sobre dicas de economia, como definir metas, como conectar bancos via Open Finance ou como exportar relatórios contábeis!',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: data.reply || 'Desculpe, ocorreu um erro ao gerar a resposta do assistente.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro na chamada do chat:', error);
      const errorMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: 'Desculpe, estou enfrentando problemas de conexão no momento. Mas se você estiver offline, pode continuar navegando pelas abas e gerindo seus saldos normalmente!',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const QUICK_QUESTIONS = [
    'Como conectar meu banco?',
    'Como baixar PDF ou CSV?',
    'Dicas rápidas para economizar',
    'Como funciona a biometria?'
  ];

  return (
    <div id="customer-support-chat-panel" className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/50 transition-all flex flex-col h-[520px] animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/10">
              <Bot className="h-5 w-5" />
            </div>
            {/* Pulsing online status indicator */}
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-1.5 font-display">
              Suporte em Tempo Real
              <span className="text-[10px] bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full font-mono flex items-center gap-0.5 font-bold uppercase tracking-wider">
                <Sparkles className="h-2.5 w-2.5" /> IA Ativa
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Respondendo dúvidas de uso e consultoria financeira instantaneamente</p>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 scrollbar-thin">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isAssistant ? '' : 'flex-row-reverse'}`}
            >
              <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                isAssistant 
                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' 
                  : 'bg-emerald-500 text-slate-950'
              }`}>
                {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>

              <div className={`flex flex-col max-w-[80%] ${isAssistant ? '' : 'items-end'}`}>
                <div className={`rounded-3xl px-4 py-2.5 text-xs whitespace-pre-line leading-relaxed ${
                  isAssistant 
                    ? 'bg-slate-50 text-slate-850 dark:bg-slate-850 dark:text-slate-100 border border-slate-100 dark:border-slate-800/30' 
                    : 'bg-emerald-500 text-slate-950 font-medium'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="h-8 w-8 rounded-full shrink-0 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-slate-50 border border-slate-100 dark:bg-slate-850 dark:border-slate-800/40 rounded-3xl px-4 py-3 flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:-0.3s]" />
              <div className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:-0.15s]" />
              <div className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggestion Bubbles */}
      {messages.length === 1 && (
        <div className="mb-4">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1 font-mono">
            <HelpCircle className="h-3.5 w-3.5" /> Dúvidas frequentes:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                className="text-[11px] bg-slate-50 border border-slate-200/60 rounded-full px-3 py-1.5 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="flex gap-2 items-center pt-2 border-t border-slate-100 dark:border-slate-800"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Escreva sua mensagem aqui..."
          disabled={isLoading}
          className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-950 focus:outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
        />
        <button
          type="submit"
          id="btn-send-support-chat"
          disabled={!inputValue.trim() || isLoading}
          className="rounded-full bg-emerald-500 hover:bg-emerald-400 p-2.5 text-slate-950 shadow-md shadow-emerald-500/10 transition disabled:opacity-50 cursor-pointer flex items-center justify-center"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>
    </div>
  );
}
