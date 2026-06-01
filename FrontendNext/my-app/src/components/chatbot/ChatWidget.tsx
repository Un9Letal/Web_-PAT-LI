"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Shirt, PhoneCall, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';
import type { ChatConversation, ChatIntention } from '@/store/appStore';

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  escalated?: boolean;
  suggestions?: string[];
}

const INITIAL_SUGGESTIONS = [
  '¿Qué tienen para caballeros?',
  '¿Tienen polos de algodón pima?',
  '¿Cuáles son sus precios?',
  '¿Tienen descuentos hoy?',
];

const makeId = () => `CHAT-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

function TypingDots() {
  return (
    <div className="flex gap-1 items-center py-1 px-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.18}s`, animationDuration: '0.9s' }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <span className="leading-relaxed">
      {lines.map((line, li) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={li}>
            {li > 0 && <br />}
            {parts.map((part, pi) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={pi}>{part.slice(2, -2)}</strong>
                : <span key={pi}>{part}</span>
            )}
          </span>
        );
      })}
    </span>
  );
}

export function ChatWidget() {
  const storeProducts = useAppStore((s) => s.products);
  const addChatConversation = useAppStore((s) => s.addChatConversation);

  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [convId] = useState(() => makeId());
  const [startedAt] = useState(() => new Date().toISOString());
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: '¡Hola! Soy **PAT-LI Bot**, tu asesor virtual de moda en Ica.\n\nPuedo ayudarte con precios, disponibilidad y recomendaciones personalizadas. ¿Qué estás buscando hoy?',
      timestamp: new Date(),
      suggestions: INITIAL_SUGGESTIONS,
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [leadInfo, setLeadInfo] = useState<{ phone?: string; name?: string } | null>(null);
  const [currentIntention, setCurrentIntention] = useState<ChatIntention>('consulta');
  const [showLeadBanner, setShowLeadBanner] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const liveCatalog = useMemo(() => {
    const byCategory = new Map<string, typeof storeProducts>();
    storeProducts.forEach(p => {
      const list = byCategory.get(p.category) ?? [];
      list.push(p);
      byCategory.set(p.category, list);
    });
    let catalog = '';
    byCategory.forEach((prods, cat) => {
      catalog += `\n${cat.toUpperCase()}:\n`;
      prods.forEach(p => {
        const stockLabel =
          p.stock === 0 ? 'AGOTADO' :
          p.stock <= 3 ? `¡Solo ${p.stock} ud.!` :
          p.stock <= 8 ? `${p.stock} ud. (pocas)` :
          `${p.stock} und.`;
        catalog += `- ${p.name}: S/ ${p.price.toFixed(2)} (${stockLabel})\n`;
      });
    });
    return catalog;
  }, [storeProducts]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-chat', handler);
    return () => window.removeEventListener('open-chat', handler);
  }, []);

  useEffect(() => {
    if (isOpen) setShowTooltip(false);
    else {
      const t = setTimeout(() => setShowTooltip(true), 4000);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Save conversation to store when closing (if has real messages)
  const saveConversation = useCallback((
    msgs: Message[],
    escalated: boolean,
    intention: ChatIntention,
    lead: { phone?: string; name?: string } | null,
    hadLead: boolean,
  ) => {
    const userMsgs = msgs.filter(m => m.role === 'user');
    if (userMsgs.length === 0) return;

    const conv: ChatConversation = {
      id: convId,
      startedAt,
      endedAt: new Date().toISOString(),
      messages: msgs.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      })),
      mainIntention: intention,
      escalated,
      resolved: !escalated && userMsgs.length >= 2,
      leadCaptured: hadLead,
      leadName: lead?.name,
      leadPhone: lead?.phone,
      messagesCount: msgs.length,
    };
    addChatConversation(conv);
  }, [convId, startedAt, addChatConversation]);

  const handleClose = useCallback(() => {
    saveConversation(messages, isEscalated, currentIntention, leadInfo, leadCaptured);
    setIsOpen(false);
  }, [messages, isEscalated, currentIntention, leadInfo, leadCaptured, saveConversation]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping || isEscalated) return;

    const userMessage = text.trim();
    setInput('');
    const updatedMessages: Message[] = [...messages, { role: 'user', content: userMessage, timestamp: new Date() }];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          liveCatalog,
        }),
      });

      const data = await response.json();
      const escalate = !!data.escalate;
      const intention: ChatIntention = (data.intention as ChatIntention) ?? 'consulta';

      setCurrentIntention(intention);

      // Lead capture
      if (data.leadDetected && !leadCaptured) {
        const lead = data.leadDetected as { phone?: string; name?: string };
        if (lead.phone) {
          setLeadInfo(lead);
          setLeadCaptured(true);
          setShowLeadBanner(true);
          setTimeout(() => setShowLeadBanner(false), 5000);
        }
      }

      const newMessages: Message[] = [...updatedMessages, {
        role: 'model',
        content: data.response || 'Lo siento, no pude procesar tu consulta. ¿Puedes repetirme tu pregunta?',
        timestamp: new Date(),
        escalated: escalate,
        suggestions: data.suggestions ?? [],
      }];
      setMessages(newMessages);

      if (escalate) {
        setIsEscalated(true);
        saveConversation(newMessages, true, intention, data.leadDetected ?? leadInfo, leadCaptured || !!data.leadDetected?.phone);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'model',
        content: 'Hubo un error de conexión. Por favor intenta de nuevo. 🙏',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const lastSuggestions = [...messages].reverse().find(m => m.role === 'model' && (m.suggestions?.length ?? 0) > 0)?.suggestions ?? [];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-[390px] h-[620px] shadow-2xl flex flex-col border-0 ring-1 ring-black/10 animate-in slide-in-from-bottom-4 duration-300 overflow-hidden rounded-3xl">
          {/* Header */}
          <CardHeader className="bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-4 px-5 flex flex-row items-center justify-between shrink-0 rounded-t-3xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center">
                  <Shirt className="h-5 w-5 text-accent" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-primary" />
              </div>
              <div>
                <h3 className="font-black text-sm leading-none">PAT-LI Bot</h3>
                <span className="text-[11px] text-white/60 mt-0.5 block">
                  {isEscalated ? '🔴 Conectando asesor humano...' : '● En línea · Responde al instante'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {leadCaptured && (
                <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[10px] font-bold px-2 py-1 rounded-full">
                  <UserCheck size={10} /> Lead
                </div>
              )}
              <Button variant="ghost" size="icon" onClick={handleClose} className="hover:bg-white/10 h-8 w-8 rounded-full text-white">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Lead captured banner */}
          {showLeadBanner && (
            <div className="mx-3 mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
              <UserCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-emerald-800">¡Lead capturado!</p>
                <p className="text-[10px] text-emerald-600">Tel: {leadInfo?.phone}{leadInfo?.name ? ` · ${leadInfo.name}` : ''} — registrado en el sistema</p>
              </div>
            </div>
          )}

          {/* Messages */}
          <CardContent className="flex-1 p-0 overflow-hidden" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            <ScrollArea className="h-full px-4 py-3" ref={scrollRef}>
              <div className="space-y-3">
                {messages.map((msg, i) => {
                  const isLastBot = msg.role === 'model' && i === messages.length - 1;
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className={cn("flex gap-2 items-end", msg.role === 'user' ? "justify-end" : "justify-start")}>
                        {msg.role === 'model' && (
                          <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm mb-0.5">
                            <Bot size={13} className="text-white" />
                          </div>
                        )}
                        <div className={cn(
                          "px-4 py-2.5 text-sm max-w-[78%] shadow-sm",
                          msg.role === 'user'
                            ? "bg-primary text-white rounded-2xl rounded-br-sm"
                            : "bg-white border border-slate-100 text-foreground rounded-2xl rounded-bl-sm"
                        )}>
                          <MessageBubble content={msg.content} />
                          <span className="text-[10px] opacity-30 mt-1.5 block text-right leading-none">
                            {msg.timestamp.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-7 h-7 rounded-xl bg-secondary flex items-center justify-center shrink-0 shadow-sm mb-0.5">
                            <User size={13} className="text-white" />
                          </div>
                        )}
                      </div>

                      {isLastBot && !isEscalated && (msg.suggestions?.length ?? 0) > 0 && (
                        <div className="ml-9 flex flex-wrap gap-1.5 pt-0.5">
                          {msg.suggestions!.map((s, si) => (
                            <button
                              key={si}
                              onClick={() => sendMessage(s)}
                              disabled={isTyping}
                              className="text-[11px] bg-white border border-primary/25 text-primary font-semibold px-3 py-1 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 shadow-sm disabled:opacity-40"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex gap-2 items-end">
                    <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
                      <Bot size={13} className="text-white" />
                    </div>
                    <div className="px-4 py-3 bg-white border border-slate-100 rounded-2xl rounded-bl-sm shadow-sm">
                      <TypingDots />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          {isEscalated && (
            <div className="mx-3 mb-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
              <PhoneCall className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-800">Asesor notificado</p>
                <p className="text-[10px] text-amber-600">Visítanos en Calle Lima, Ica · Tel: +51 056-212121</p>
              </div>
            </div>
          )}

          <CardFooter className="p-3 bg-white border-t border-slate-100 flex flex-col gap-2 rounded-b-3xl">
            {!isTyping && !isEscalated && messages.length <= 2 && lastSuggestions.length === 0 && (
              <div className="flex flex-wrap gap-1.5 w-full">
                {INITIAL_SUGGESTIONS.slice(0, 3).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="text-[11px] bg-slate-50 border border-slate-200 text-slate-600 font-medium px-2.5 py-1 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="flex w-full items-center gap-2">
              <Input
                placeholder={isEscalated ? "Sesión finalizada..." : "Escribe tu consulta..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                className="flex-1 focus-visible:ring-primary border-slate-200 rounded-xl h-10 text-sm"
                disabled={isEscalated}
                autoComplete="off"
              />
              <Button
                size="icon"
                onClick={() => sendMessage(input)}
                className="bg-primary hover:bg-primary/90 shadow-md h-10 w-10 rounded-xl shrink-0"
                disabled={isTyping || isEscalated || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-slate-300 text-center">PAT-LI Textiles · Asistente virtual con IA</p>
          </CardFooter>
        </Card>
      ) : (
        <div className="relative flex flex-col items-end gap-2">
          {showTooltip && (
            <div className="bg-white shadow-xl border border-slate-100 rounded-2xl rounded-br-none px-4 py-2.5 text-sm font-medium text-slate-700 whitespace-nowrap animate-in slide-in-from-bottom-2 fade-in duration-500 mr-2">
              <span className="text-primary font-bold">¡Hola!</span> ¿Te ayudo a elegir? 👋
              <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-r border-b border-slate-100 rotate-45" />
            </div>
          )}
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-110 group relative"
          >
            <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-accent" />
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
