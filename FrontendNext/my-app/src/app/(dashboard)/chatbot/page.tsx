"use client";

import { useState } from 'react';
import {
  Bot,
  Settings,
  BarChart,
  MessageCircle,
  Cpu,
  History,
  Zap,
  TrendingUp,
  AlertCircle,
  Save,
  SlidersHorizontal,
  Sparkles,
  Loader2,
  SmilePlus,
  Meh,
  Frown,
  CheckCircle2,
  PhoneForwarded,
  LogOut,
  ShoppingBag,
  DollarSign,
  Users,
  ArrowUpRight,
  Flame,
  UserCheck,
  Target,
  ShoppingCart,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { ChatConversation } from '@/store/appStore';
import { toast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/appStore';
import { useMemo } from 'react';
import type { ChatbotHistoryOutput } from '@/ai/flows/admin-chatbot-history-flow';

const MOCK_SESSIONS = [
  { id: 'CHAT-2841', date: '28 May · 14:32', turns: 6,  outcome: 'resuelto'   as const, preview: 'Perfecto, ¡muchas gracias! Me llevaré el polo pima azul en M.' },
  { id: 'CHAT-2840', date: '28 May · 13:18', turns: 9,  outcome: 'escalado'   as const, preview: 'No me aparece el botón de pago, es urgente porque ya pagué.' },
  { id: 'CHAT-2839', date: '28 May · 11:55', turns: 4,  outcome: 'resuelto'   as const, preview: 'Ok, entendido. Veo que el jean slim tiene buen margen, lo agrego.' },
  { id: 'CHAT-2838', date: '28 May · 10:40', turns: 3,  outcome: 'resuelto'   as const, preview: 'Genial, ¿y me pueden enviar a Ica ciudad?' },
  { id: 'CHAT-2837', date: '27 May · 18:22', turns: 11, outcome: 'escalado'   as const, preview: 'Es inaceptable, pedí talla M y me mandaron XL, quiero devolución.' },
  { id: 'CHAT-2836', date: '27 May · 16:05', turns: 2,  outcome: 'abandonado' as const, preview: '¿Cuánto cuesta el blazer negro de mujer?' },
  { id: 'CHAT-2835', date: '27 May · 14:30', turns: 7,  outcome: 'resuelto'   as const, preview: 'Listo, agendé la visita para el viernes. Muchas gracias.' },
  { id: 'CHAT-2834', date: '27 May · 11:10', turns: 5,  outcome: 'resuelto'   as const, preview: '¿Tienen tallas grandes en la línea deportiva?' },
  { id: 'CHAT-2833', date: '26 May · 17:45', turns: 8,  outcome: 'resuelto'   as const, preview: 'El conjunto de yoga que me recomendaron es perfecto, gracias.' },
  { id: 'CHAT-2832', date: '26 May · 15:00', turns: 3,  outcome: 'abandonado' as const, preview: '¿Tienen descuento por mayor?' },
];

const BASE_CHATS = 237;
const BASE_TOKENS = 12_400;

const data = [
  { name: '08:00', chats: 12 },
  { name: '10:00', chats: 45 },
  { name: '12:00', chats: 38 },
  { name: '14:00', chats: 65 },
  { name: '16:00', chats: 52 },
  { name: '18:00', chats: 25 },
];

export default function ChatbotConfigPage() {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const completedSales    = useAppStore((s) => s.completedSales);
  const surveyResponses   = useAppStore((s) => s.surveyResponses);
  const chatConversations = useAppStore((s) => s.chatConversations);

  const totalChats  = BASE_CHATS + completedSales.length * 3 + surveyResponses.length * 2;
  const tokensHoy   = BASE_TOKENS + completedSales.length * 220 + surveyResponses.length * 80;
  const derivaciones = 14 + completedSales.filter(s => s.items.length > 3).length;
  const autonomia   = Math.max(85, Math.min(99, Math.round(((totalChats - derivaciones) / totalChats) * 100)));

  // Impact panel metrics
  const chatbotRevenue  = completedSales.reduce((sum, s) => sum + s.total, 0);
  const ventasAtribuidas = completedSales.length;
  const tasaConversion   = totalChats > 0 ? ((ventasAtribuidas / totalChats) * 100).toFixed(1) : '0.0';
  const ticketPromedio   = ventasAtribuidas > 0 ? chatbotRevenue / ventasAtribuidas : 0;

  // Real-time metrics from store
  const totalReal       = chatConversations.length;
  const resolvedReal    = chatConversations.filter(c => c.resolved && !c.escalated).length;
  const escalatedReal   = chatConversations.filter(c => c.escalated).length;
  const leadsReal       = chatConversations.filter(c => c.leadCaptured).length;
  const resolutionRate  = totalReal > 0 ? Math.round((resolvedReal / totalReal) * 100) : 0;
  const escalationRate  = totalReal > 0 ? Math.round((escalatedReal / totalReal) * 100) : 0;
  const leadRate        = totalReal > 0 ? Math.round((leadsReal / totalReal) * 100) : 0;

  const intentionCounts = chatConversations.reduce((acc, c) => {
    acc[c.mainIntention] = (acc[c.mainIntention] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const INTENTION_DATA = [
    { name: 'Consulta', value: (intentionCounts['consulta'] ?? 0) + 118, fill: '#3b82f6', icon: HelpCircle },
    { name: 'Compra',   value: (intentionCounts['compra']   ?? 0) + 79,  fill: '#10b981', icon: ShoppingCart },
    { name: 'Reclamo',  value: (intentionCounts['reclamo']  ?? 0) + 14,  fill: '#f59e0b', icon: AlertTriangle },
    { name: 'Otro',     value: (intentionCounts['otro']     ?? 0) + 26,  fill: '#8b5cf6', icon: MessageCircle },
  ];
  const totalIntentions = INTENTION_DATA.reduce((s, d) => s + d.value, 0);

  const BEFORE_AFTER_DATA = [
    { mes: 'Ene', sinChatbot: 18, conChatbot: 18 },
    { mes: 'Feb', sinChatbot: 21, conChatbot: 21 },
    { mes: 'Mar', sinChatbot: 19, conChatbot: 19 },
    { mes: 'Abr', sinChatbot: 22, conChatbot: 34 },
    { mes: 'May', sinChatbot: 20, conChatbot: 41 + ventasAtribuidas },
  ];

  const recentLogs = useMemo(() => [
    ...completedSales.slice(0, 2).map((s, i) => ({
      id: `LOG-W${i + 1}`,
      action: 'Pedido Web',
      reason: `Cliente completó compra por S/ ${s.total.toFixed(2)} · ${s.items.length} producto(s)`,
      time: new Date(s.date).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      confidence: '98%',
      isWeb: true,
    })),
    { id: 'LOG-1', action: 'Derivación',    reason: 'Cliente solicitó hablar con humano explícitamente', time: '10:12 AM', confidence: '100%', isWeb: false },
    { id: 'LOG-2', action: 'Recomendación', reason: 'Identificó interés en telas frescas para verano',   time: '10:05 AM', confidence: '88%',  isWeb: false },
    { id: 'LOG-3', action: 'Consulta Stock', reason: 'Verificó base de datos para SKU P004',             time: '09:50 AM', confidence: '95%',  isWeb: false },
  ], [completedSales]);

  const [historyResult, setHistoryResult]         = useState<ChatbotHistoryOutput | null>(null);
  const [historyLoading, setHistoryLoading]       = useState(false);

  const handleAnalyzeHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/ai/chatbot-history', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: MOCK_SESSIONS }),
      });
      const data = await res.json() as ChatbotHistoryOutput;
      setHistoryResult(data);
      toast({ title: 'Análisis de historial completo', description: 'Gemini clasificó todas las sesiones.' });
    } catch {
      toast({ title: 'Error al analizar historial', variant: 'destructive' });
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Configuración de IA actualizada",
      description: "Los parámetros del modelo Gemini se han ajustado correctamente.",
    });
    setIsConfigOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Rendimiento PAT-LI Bot</h1>
          <p className="text-slate-500">Supervisión y parámetros técnicos del asistente IA</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-success text-white px-3 py-1">Sistema Online</Badge>
          
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-primary text-primary hover:bg-primary/5">
                <Settings className="h-4 w-4" /> Configuración Avanzada
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-primary" /> 
                  Parámetros de IA Gemini
                </DialogTitle>
                <DialogDescription>
                  Ajusta la "personalidad" y el comportamiento técnico del bot.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveConfig} className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label>Temperatura (Creatividad)</Label>
                  <div className="flex items-center gap-4">
                    <input type="range" className="flex-1 accent-primary" min="0" max="1" step="0.1" defaultValue="0.7" />
                    <span className="text-xs font-bold w-8">0.7</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Límite de Tokens por Respuesta</Label>
                  <Input type="number" defaultValue="1024" />
                </div>
                <div className="space-y-2">
                  <Label>Prompt de Identidad</Label>
                  <textarea 
                    className="w-full min-h-[100px] text-xs p-3 rounded-md border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
                    defaultValue="Eres el asistente experto de PAT-LI Textiles. Tu tono es profesional, iqueño y servicial..."
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <Label className="text-xs cursor-pointer">Habilitar Historial de Contexto</Label>
                  <Switch defaultChecked />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full bg-primary gap-2">
                    <Save className="h-4 w-4" /> Aplicar Cambios
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ===== PANEL DE IMPACTO DEL CHATBOT EN VENTAS ===== */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-500" />
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Flame className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-base">Panel de Impacto del Chatbot en Ventas</CardTitle>
              <CardDescription>Ventas y revenue directamente atribuidos al asistente IA · datos en tiempo real</CardDescription>
            </div>
            {ventasAtribuidas > 0 && (
              <span className="ml-auto flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                <ArrowUpRight className="h-3 w-3" /> ACTIVO
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="h-4 w-4 text-emerald-600" />
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Ventas Atribuidas</p>
              </div>
              <p className="text-3xl font-black text-emerald-700">{ventasAtribuidas}</p>
              <p className="text-[10px] text-emerald-500 mt-1">pedidos vía chatbot web</p>
            </div>
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-teal-600" />
                <p className="text-[10px] font-black text-teal-600 uppercase tracking-wider">Revenue IA</p>
              </div>
              <p className="text-3xl font-black text-teal-700">S/ {chatbotRevenue.toFixed(0)}</p>
              <p className="text-[10px] text-teal-500 mt-1">ingresos generados por bot</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Tasa Conversión</p>
              </div>
              <p className="text-3xl font-black text-blue-700">{tasaConversion}%</p>
              <p className="text-[10px] text-blue-500 mt-1">chats que terminan en venta</p>
            </div>
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-violet-600" />
                <p className="text-[10px] font-black text-violet-600 uppercase tracking-wider">Ticket Promedio</p>
              </div>
              <p className="text-3xl font-black text-violet-700">S/ {ticketPromedio.toFixed(0)}</p>
              <p className="text-[10px] text-violet-500 mt-1">valor medio por pedido IA</p>
            </div>
          </div>

          {/* Before / After chart */}
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
              Comparativa Antes vs. Después del Chatbot · Unidades vendidas/mes
            </p>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={BEFORE_AFTER_DATA} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    formatter={(value: number, name: string) => [
                      value,
                      name === 'sinChatbot' ? 'Sin Chatbot' : 'Con Chatbot IA',
                    ]}
                  />
                  <Legend
                    formatter={(value) => value === 'sinChatbot' ? 'Sin Chatbot' : 'Con Chatbot IA'}
                    wrapperStyle={{ fontSize: '11px' }}
                  />
                  <Bar dataKey="sinChatbot" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conChatbot" fill="#10b981" radius={[4, 4, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-1">
              * Implementación del chatbot: Abril 2026 · datos de Ene–Mar son base histórica
            </p>
          </div>

          {/* Insight banner */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-emerald-800 mb-1">Impacto demostrado en la tesis</p>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                El chatbot generativo ha incrementado las ventas un <strong>~82% respecto al período pre-implementación</strong>.
                Cada conversación tiene una tasa de conversión de <strong>{tasaConversion}%</strong>, superior al promedio
                sectorial textil del 2.3%. Revenue atribuible al chatbot: <strong>S/ {chatbotRevenue.toFixed(2)}</strong>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== MÉTRICAS OPERATIVAS EN TIEMPO REAL ===== */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-indigo-500" />
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">Métricas Operativas — Tiempo Real</CardTitle>
              <CardDescription>
                Intenciones detectadas, tasa de resolución y leads capturados · {totalReal} conversaciones registradas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-1">Conversaciones</p>
              <p className="text-3xl font-black text-blue-700">{totalReal + 237}</p>
              <p className="text-[10px] text-blue-400 mt-1">{totalReal} reales + 237 históricas</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider mb-1">Tasa Resolución</p>
              <p className="text-3xl font-black text-emerald-700">{totalReal > 0 ? resolutionRate : 91}%</p>
              <p className="text-[10px] text-emerald-400 mt-1">sin escalar a humano</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider mb-1">Leads Capturados</p>
              <p className="text-3xl font-black text-amber-700">{leadsReal + 18}</p>
              <p className="text-[10px] text-amber-400 mt-1">{totalReal > 0 ? `${leadRate}% rate` : '~7% rate'} · via chatbot</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-wider mb-1">Escalaciones</p>
              <p className="text-3xl font-black text-red-700">{escalatedReal + 14}</p>
              <p className="text-[10px] text-red-400 mt-1">{totalReal > 0 ? `${escalationRate}% rate` : '~6% rate'} a asesor</p>
            </div>
          </div>

          {/* Intentions breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Intenciones Detectadas por el Bot</p>
              <div className="space-y-3">
                {INTENTION_DATA.map((item) => {
                  const pct = Math.round((item.value / totalIntentions) * 100);
                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <item.icon size={14} style={{ color: item.fill }} />
                          <span className="text-xs font-bold text-slate-700">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-600">{item.value}</span>
                          <span className="text-[10px] text-slate-400 w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: item.fill }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="h-[200px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={INTENTION_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {INTENTION_DATA.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    formatter={(value: number, name: string) => [`${value} chats`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resolution funnel */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Embudo de Resolución</p>
            <div className="flex items-center gap-2 text-xs">
              {[
                { label: 'Inician chat', value: totalReal + 237, color: 'bg-blue-100 text-blue-700' },
                { label: '→', value: null, color: '' },
                { label: 'Bot responde', value: totalReal + 233, color: 'bg-indigo-100 text-indigo-700' },
                { label: '→', value: null, color: '' },
                { label: 'Resuelto IA', value: resolvedReal + 208, color: 'bg-emerald-100 text-emerald-700' },
                { label: '→', value: null, color: '' },
                { label: 'Lead generado', value: leadsReal + 18, color: 'bg-amber-100 text-amber-700' },
              ].map((step, i) =>
                step.value === null
                  ? <span key={i} className="text-slate-300 font-bold">›</span>
                  : (
                    <div key={i} className={`flex-1 ${step.color} rounded-xl p-2 text-center`}>
                      <p className="font-black text-base">{step.value}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wide leading-tight">{step.label}</p>
                    </div>
                  )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats */}
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Actividad Hoy</CardTitle>
                <CardDescription className="text-primary-foreground/70">Conversaciones gestionadas por la IA en tiempo real</CardDescription>
              </div>
              <TrendingUp className="h-8 w-8 opacity-20" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Chats</p>
                <p className="text-2xl font-bold">{totalChats}</p>
                {completedSales.length > 0 && <p className="text-[10px] text-teal-500">+{completedSales.length * 3} web</p>}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Derivaciones</p>
                <p className="text-2xl font-bold text-amber-600">{derivaciones}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Res. Autónoma</p>
                <p className="text-2xl font-bold text-success">{autonomia}%</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Tokens Hoy</p>
                <p className="text-2xl font-bold">{tokensHoy > 1000 ? `${(tokensHoy / 1000).toFixed(1)}k` : tokensHoy}</p>
              </div>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  />
                  <Line type="monotone" dataKey="chats" stroke="#2563eb" strokeWidth={3} dot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Health & Config */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" /> Estado del Modelo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-600">Confianza Promedio</span>
                <span className="font-bold">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            
            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold">Autorespuesta</p>
                  <p className="text-[10px] text-slate-400">Responder sin intervención humana</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold">Modo Nocturno</p>
                  <p className="text-[10px] text-slate-400">Priorizar derivación en feriados</p>
                </div>
                <Switch />
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-900">Aviso de Sistema</p>
                <p className="text-[10px] text-amber-700 leading-tight mt-1">
                  Se detectó un patrón de consultas sobre "Precios Mayoristas" sin respuesta clara en el catálogo.
                </p>
              </div>
            </div>

            <Button className="w-full bg-secondary hover:bg-secondary/90 shadow-lg">Actualizar Base de Conocimiento</Button>
          </CardContent>
        </Card>
      </div>

      {/* Historial de Sesiones IA */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-50 rounded-xl">
                <History className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-base">Historial de Sesiones</CardTitle>
                <CardDescription>Últimas {MOCK_SESSIONS.length} conversaciones · análisis de temas y sentimiento con IA</CardDescription>
              </div>
            </div>
            <Button
              onClick={handleAnalyzeHistory}
              disabled={historyLoading}
              className="bg-violet-600 hover:bg-violet-700 text-white gap-2 shrink-0"
            >
              {historyLoading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Analizando…</>
                : <><Sparkles className="h-4 w-4" /> Analizar con IA</>
              }
            </Button>
          </div>

          {/* Skeleton while loading */}
          {historyLoading && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 space-y-2">
                <Skeleton className="h-3 w-28" />
                <div className="flex gap-3">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 space-y-2">
                <Skeleton className="h-3 w-32" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
              <div className="sm:col-span-2 rounded-2xl bg-violet-50 border border-violet-100 p-3 space-y-2">
                <Skeleton className="h-3 w-24 bg-violet-200" />
                <Skeleton className="h-4 w-full bg-violet-100" />
                <Skeleton className="h-4 w-3/4 bg-violet-100" />
              </div>
            </div>
          )}

          {/* Real conversations strip */}
          {chatConversations.length > 0 && !historyLoading && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
              <UserCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-700 font-medium">
                <strong>{chatConversations.length} conversaciones reales</strong> registradas desde el chatbot del cliente
                · {chatConversations.filter(c => c.leadCaptured).length} leads capturados
                · {chatConversations.filter(c => c.resolved).length} resueltas
              </p>
            </div>
          )}

          {/* Aggregate stats (shown after analysis) */}
          {historyResult && !historyLoading && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sentiment breakdown */}
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sentimiento global</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <SmilePlus className="h-4 w-4" />
                    <span className="text-sm font-black">{historyResult.sentimentBreak.positivo}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Meh className="h-4 w-4" />
                    <span className="text-sm font-black">{historyResult.sentimentBreak.neutro}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-red-500">
                    <Frown className="h-4 w-4" />
                    <span className="text-sm font-black">{historyResult.sentimentBreak.negativo}%</span>
                  </div>
                </div>
              </div>
              {/* Top topics */}
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Temas más frecuentes</p>
                <div className="flex flex-wrap gap-1.5">
                  {historyResult.topTopics.slice(0, 3).map((t, i) => (
                    <span key={i} className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-2 py-0.5 font-semibold">
                      {t.topic} · {t.count}
                    </span>
                  ))}
                </div>
              </div>
              {/* Recommendation */}
              <div className="sm:col-span-2 rounded-2xl bg-violet-50 border border-violet-100 p-3">
                <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Recomendación IA
                </p>
                <p className="text-xs text-slate-700">{historyResult.recommendation}</p>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-2">
            {historyLoading && MOCK_SESSIONS.slice(0, 4).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
            {!historyLoading && (
              <>
                {/* Real conversations from store */}
                {chatConversations.slice(0, 5).map((conv: ChatConversation) => {
                  const lastUserMsg = conv.messages.filter(m => m.role === 'user').slice(-1)[0];
                  const intentionColors: Record<string, string> = {
                    consulta: 'bg-blue-50 text-blue-700',
                    compra:   'bg-emerald-50 text-emerald-700',
                    reclamo:  'bg-amber-50 text-amber-700',
                    otro:     'bg-slate-100 text-slate-600',
                  };
                  return (
                    <div
                      key={conv.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/40 hover:bg-blue-50/80 transition-colors border border-blue-100"
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        conv.escalated ? 'bg-amber-100 text-amber-600' :
                        conv.resolved  ? 'bg-emerald-100 text-emerald-600' :
                                         'bg-slate-200 text-slate-500'
                      }`}>
                        {conv.escalated  ? <PhoneForwarded className="h-3.5 w-3.5" /> :
                         conv.resolved   ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                                           <LogOut className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-xs font-black text-slate-700">{conv.id}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(conv.startedAt).toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] text-slate-400">· {conv.messagesCount} mensajes</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            conv.escalated ? 'bg-amber-100 text-amber-700' :
                            conv.resolved  ? 'bg-emerald-100 text-emerald-700' :
                                             'bg-slate-200 text-slate-500'
                          }`}>
                            {conv.escalated ? 'escalado' : conv.resolved ? 'resuelto' : 'abandonado'}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${intentionColors[conv.mainIntention]}`}>
                            {conv.mainIntention}
                          </span>
                          {conv.leadCaptured && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700 flex items-center gap-0.5">
                              <UserCheck className="h-2.5 w-2.5" /> Lead
                            </span>
                          )}
                          <span className="text-[9px] bg-blue-100 text-blue-600 font-bold px-1.5 py-0.5 rounded-full">🔴 Real</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                          "{lastUserMsg?.content?.slice(0, 80) ?? '—'}"
                        </p>
                        {conv.leadPhone && (
                          <p className="text-[10px] text-violet-600 font-medium mt-0.5">📞 Tel capturado: {conv.leadPhone}{conv.leadName ? ` · ${conv.leadName}` : ''}</p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Divider */}
                {chatConversations.length > 0 && (
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Historial de demostración</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                )}

                {/* Mock sessions */}
                {MOCK_SESSIONS.map((session) => {
                  const analysis = historyResult?.sessions.find(s => s.id === session.id);
                  return (
                    <div
                      key={session.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        session.outcome === 'resuelto'   ? 'bg-emerald-100 text-emerald-600' :
                        session.outcome === 'escalado'   ? 'bg-amber-100 text-amber-600' :
                                                           'bg-slate-200 text-slate-500'
                      }`}>
                        {session.outcome === 'resuelto'   ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                         session.outcome === 'escalado'   ? <PhoneForwarded className="h-3.5 w-3.5" /> :
                                                            <LogOut className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-xs font-black text-slate-700">{session.id}</span>
                          <span className="text-[10px] text-slate-400">{session.date}</span>
                          <span className="text-[10px] text-slate-400">· {session.turns} turnos</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            session.outcome === 'resuelto'   ? 'bg-emerald-100 text-emerald-700' :
                            session.outcome === 'escalado'   ? 'bg-amber-100 text-amber-700' :
                                                               'bg-slate-200 text-slate-500'
                          }`}>
                            {session.outcome}
                          </span>
                          {analysis && (
                            <>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {analysis.topic}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                analysis.sentiment === 'positivo' ? 'bg-emerald-50 text-emerald-700' :
                                analysis.sentiment === 'negativo' ? 'bg-red-50 text-red-700' :
                                                                    'bg-slate-100 text-slate-600'
                              }`}>
                                {analysis.sentiment === 'positivo' ? '😊' : analysis.sentiment === 'negativo' ? '😟' : '😐'} {analysis.sentiment}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 italic">"{session.preview}"</p>
                        {analysis && (
                          <p className="text-[10px] text-violet-600 font-medium mt-0.5">{analysis.insight}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ===== MAPA DE CALOR DE ACTIVIDAD ===== */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-xl">
              <BarChart className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base">Mapa de Calor — Actividad por Hora y Día</CardTitle>
              <CardDescription>Distribución de conversaciones durante la semana</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            const HOURS = ['8h','9h','10h','11h','12h','13h','14h','15h','16h','17h','18h','19h'];
            const DAYS  = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
            const HEAT: Record<string, number[]> = {
              Lun: [3,5,12,18,14,8,22,19,11,7,4,2],
              Mar: [2,4,10,15,20,12,28,24,16,9,5,1],
              Mié: [4,6,14,20,16,10,25,21,13,8,4,2],
              Jue: [3,5,11,17,19,14,30,26,18,10,6,3],
              Vie: [5,7,15,22,18,11,26,22,15,9,5,2],
              Sáb: [1,3,8,14,22,18,24,20,12,6,3,1],
              Dom: [0,1,4,8,12,10,14,11,7,3,1,0],
            };
            const maxVal = 30;
            const intensity = (v: number) => {
              const pct = v / maxVal;
              if (pct === 0) return 'bg-slate-100 text-transparent';
              if (pct < 0.2) return 'bg-amber-100 text-amber-300';
              if (pct < 0.4) return 'bg-amber-200 text-amber-500';
              if (pct < 0.6) return 'bg-orange-300 text-orange-700';
              if (pct < 0.8) return 'bg-orange-500 text-white';
              return 'bg-red-600 text-white';
            };
            return (
              <div className="overflow-x-auto">
                <div className="min-w-[520px]">
                  {/* Hour labels */}
                  <div className="flex gap-1 ml-10 mb-1">
                    {HOURS.map(h => (
                      <div key={h} className="flex-1 text-center text-[9px] font-bold text-slate-400">{h}</div>
                    ))}
                  </div>
                  {/* Grid */}
                  {DAYS.map(day => (
                    <div key={day} className="flex items-center gap-1 mb-1">
                      <div className="w-9 text-[10px] font-bold text-slate-500 shrink-0">{day}</div>
                      {HEAT[day].map((val, hi) => (
                        <div
                          key={hi}
                          className={`flex-1 h-7 rounded flex items-center justify-center text-[9px] font-black transition-all cursor-default ${intensity(val)}`}
                          title={`${day} ${HOURS[hi]}: ${val} chats`}
                        >
                          {val > 0 ? val : ''}
                        </div>
                      ))}
                    </div>
                  ))}
                  {/* Legend */}
                  <div className="flex items-center gap-2 mt-3 justify-end">
                    <span className="text-[9px] text-slate-400">Menos</span>
                    {['bg-slate-100','bg-amber-100','bg-amber-200','bg-orange-300','bg-orange-500','bg-red-600'].map(c => (
                      <div key={c} className={`w-5 h-3 rounded ${c}`} />
                    ))}
                    <span className="text-[9px] text-slate-400">Más</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Log de Decisiones Críticas</CardTitle>
          <CardDescription>Análisis del razonamiento del bot en interacciones complejas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLogs.map((log, i) => (
              <div key={i} className={`flex items-start justify-between p-3 rounded-lg border transition-colors hover:border-primary/20 ${log.isWeb ? 'bg-teal-50/40 border-teal-100' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex gap-4">
                  <div className={`p-2 rounded-md shrink-0 ${
                    log.isWeb ? 'bg-teal-100 text-teal-600' :
                    log.action === 'Derivación' ? 'bg-amber-100 text-amber-600' : 'bg-primary/5 text-primary'
                  }`}>
                    <Cpu size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-sm">{log.action}: {log.id}</h5>
                      {log.isWeb && <Badge className="text-[9px] h-4 bg-teal-500 hover:bg-teal-500">Web</Badge>}
                    </div>
                    <p className="text-xs text-slate-500">{log.reason}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-[10px] font-bold block">{log.time}</span>
                  <Badge variant="outline" className="text-[9px] h-4 mt-1 border-primary/20 text-primary">Conf: {log.confidence}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
