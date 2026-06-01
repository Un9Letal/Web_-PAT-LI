"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AdminAssistantOutput } from '@/ai/flows/admin-assistant-flow';

type Message = {
  id:      string;
  role:    'user' | 'assistant';
  content: string;
};

const QUICK_SUGGESTIONS = [
  '¿Qué módulos tiene el sistema?',
  '¿Cómo interpreto los KPIs del dashboard?',
  '¿Qué hacer con los clientes inactivos?',
  '¿Cuándo reponer inventario?',
];

const THINKING_STEPS = [
  'Analizando tu consulta…',
  'Revisando datos del negocio…',
  'Generando recomendación…',
  'Finalizando respuesta…',
];

export function AdminChatWidget() {
  const [open, setOpen]               = useState(false);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>(QUICK_SUGGESTIONS);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const thinkingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id:      'welcome',
        role:    'assistant',
        content: '¡Hola! Soy tu asistente IA de PAT-LI Textiles. Puedo ayudarte con análisis de ventas, gestión de inventario, estrategias de clientes y más. ¿En qué te ayudo hoy?',
      }]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSuggestions([]);
    setLoading(true);
    setThinkingStep(0);
    thinkingRef.current = setInterval(() => {
      setThinkingStep(s => (s + 1) % THINKING_STEPS.length);
    }, 900);
    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const res  = await fetch('/api/ai/admin-assistant', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text.trim(), history }),
      });
      const data: AdminAssistantOutput = await res.json();

      const reply = data.reply?.trim() || 'No pude generar una respuesta. Por favor intenta de nuevo.';
      setMessages(prev => [...prev, { id: Date.now().toString() + '-ai', role: 'assistant', content: reply }]);

      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }
    } catch {
      setMessages(prev => [...prev, {
        id:      Date.now().toString() + '-err',
        role:    'assistant',
        content: 'Error de conexión. Verifica tu conexión e intenta nuevamente.',
      }]);
    } finally {
      if (thinkingRef.current) clearInterval(thinkingRef.current);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300',
          open
            ? 'bg-slate-700 hover:bg-slate-800'
            : 'bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] hover:scale-105'
        )}
        aria-label="Asistente IA"
      >
        {open
          ? <X className="h-5 w-5 text-white" />
          : <Bot className="h-6 w-6 text-white" />
        }
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
            <Sparkles className="h-2.5 w-2.5 text-amber-900" />
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[560px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Asistente IA</p>
              <p className="text-[10px] text-blue-200">PAT-LI Textiles · Powered by Gemini</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map(m => (
              <div key={m.id} className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                )}
                <div className={cn(
                  'max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'bg-[#1e3a5f] text-white rounded-tr-sm'
                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                )}>
                  {m.role === 'assistant'
                    ? m.content.split('\n').map((line, li) => (
                        <span key={li} className="block">
                          {li > 0 && line === '' ? <br /> : line}
                        </span>
                      ))
                    : m.content
                  }
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shrink-0" />
                  <span className="text-[11px] text-slate-500 italic transition-all duration-300">
                    {THINKING_STEPS[thinkingStep]}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && !loading && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-1 border-t border-slate-100">
            <div className="flex gap-2 items-center bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 focus-within:border-blue-300 focus-within:ring-1 focus-within:ring-blue-200 transition-all">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder="Escribe tu consulta..."
                disabled={loading}
                className="flex-1 bg-transparent text-sm outline-none placeholder-slate-400 min-w-0"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-7 h-7 rounded-lg bg-[#1e3a5f] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#1e3a5f]/90 transition-opacity shrink-0"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
