"use client";

import { useMemo, useState, useEffect } from 'react';
import {
  ShoppingBag, Star, ArrowUpRight,
  Zap, Clock, MessageSquare, AlertTriangle, Download,
  Package, BarChart2, ShoppingCart, Wifi, Target,
  Sparkles, TrendingUp, Loader2, RefreshCw,
  Send, Bot, ChevronDown, ChevronUp, User, Pencil, Check, X,
} from 'lucide-react';
import type { DashboardSummaryOutput } from '@/ai/flows/admin-dashboard-summary-flow';
import type { SalesAssistantOutput } from '@/ai/flows/admin-sales-assistant-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ResponsiveContainer, XAxis, YAxis, Tooltip,
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart,
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { toast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/appStore';
import { AnimatedNumber } from '@/components/ui/animated-number';

const BASE_REVENUE = 24560;

const mainSalesData = [
  { day: 'Lun', sales: 1200, orders: 15 },
  { day: 'Mar', sales: 2100, orders: 22 },
  { day: 'Mie', sales: 1800, orders: 19 },
  { day: 'Jue', sales: 2400, orders: 28 },
  { day: 'Vie', sales: 3200, orders: 35 },
  { day: 'Sab', sales: 4500, orders: 48 },
  { day: 'Dom', sales: 3800, orders: 40 },
];

const categoryData = [
  { name: 'Algodón Pima', value: 45, color: '#1e3a5f' },
  { name: 'Lino Premium', value: 30, color: '#2563eb' },
  { name: 'Mezclilla',    value: 15, color: '#f59e0b' },
  { name: 'Otros',        value: 10, color: '#94a3b8' },
];

const mockTransactions = [
  { id: 'V-2041', cliente: 'María García',   producto: 'Polo Algodón Pima x2',       monto: 90.00,  metodo: 'Yape',      estado: 'Completado', canal: 'Tienda' },
  { id: 'V-2040', cliente: 'Juan Pérez',      producto: 'Jean Skinny Azul',            monto: 95.00,  metodo: 'Efectivo',  estado: 'Completado', canal: 'Tienda' },
  { id: 'V-2039', cliente: 'Ana Martínez',    producto: 'Blusa Lino Floral + Medias',  monto: 90.00,  metodo: 'Plin',      estado: 'Completado', canal: 'Tienda' },
  { id: 'V-2038', cliente: 'Pedro Gómez',     producto: 'Casaca Cuero Sintético',      monto: 180.00, metodo: 'Tarjeta',   estado: 'Anulado',    canal: 'Tienda' },
  { id: 'V-2037', cliente: 'Lucía Fernández', producto: 'Vestido Verano Floral',       monto: 85.00,  metodo: 'Efectivo',  estado: 'Completado', canal: 'Tienda' },
];

const BASE_TOP_PRODUCTS = [
  { id: 'polo-pima-blanco',         nombre: 'Polo Algodón Pima',       vendidos: 87,  ingresos: 3915 },
  { id: 'jean-skinny-azul',         nombre: 'Jean Skinny Caballero',   vendidos: 45,  ingresos: 4275 },
  { id: 'vestido-lino-floral',      nombre: 'Vestido Verano Floral',   vendidos: 38,  ingresos: 3230 },
  { id: 'blusa-lino-floral',        nombre: 'Blusa Lino Floral',       vendidos: 29,  ingresos: 1885 },
  { id: 'medias-pack-x3',           nombre: 'Medias Pack x3',          vendidos: 112, ingresos: 2800 },
  { id: 'leggings-deportivos-mujer',nombre: 'Leggings Deportivos',     vendidos: 22,  ingresos: 1540 },
  { id: 'sudadera-hoodie-gris',     nombre: 'Sudadera Hoodie Gris',    vendidos: 18,  ingresos: 2160 },
];

const botActivity = [
  { user: 'Juan P.',    action: 'Consulta precio Polo Pima',   time: 'Justo ahora', status: 'Resuelto',    urgent: false },
  { user: 'María G.',   action: 'Solicitud de asesor humano',  time: 'Hace 5 min',  status: 'Derivado',    urgent: true  },
  { user: 'Anónimo',    action: 'Catálogo colección Verano',   time: 'Hace 12 min', status: 'Recomendado', urgent: false },
  { user: 'Karla M.',   action: 'Consulta tallas disponibles', time: 'Hace 18 min', status: 'Resuelto',    urgent: false },
  { user: 'Pedro G.',   action: 'Reclamo pedido #1024',        time: 'Hace 25 min', status: 'Derivado',    urgent: true  },
  { user: 'Ana R.',     action: 'Precio mayoreo Jeans',        time: 'Hace 40 min', status: 'Recomendado', urgent: false },
];

export default function AdminDashboard() {
  const completedSales  = useAppStore((s) => s.completedSales);
  const products        = useAppStore((s) => s.products);
  const monthlyGoal     = useAppStore((s) => s.monthlyGoal);
  const setMonthlyGoal  = useAppStore((s) => s.setMonthlyGoal);

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput]     = useState('');
  const [mounted, setMounted]         = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 700);
    return () => clearTimeout(t);
  }, []);

  /* ── Live metrics from catalog sales ── */
  const liveRevenue  = useMemo(() => completedSales.reduce((s, v) => s + v.total, 0), [completedSales]);
  const liveOrders   = completedSales.length;
  const totalRevenue = BASE_REVENUE + liveRevenue;
  const goalPct      = Math.min(Math.round((totalRevenue / monthlyGoal) * 100), 100);

  /* ── Stock crítico real desde el store ── */
  const criticalCount = useMemo(
    () => products.filter((p) => p.stock < 10 && p.stock > 0).length,
    [products]
  );
  const outOfStockCount = useMemo(
    () => products.filter((p) => p.stock === 0).length,
    [products]
  );

  /* ── Top products: real sales merged with base mock ── */
  const topProducts = useMemo(() => {
    // Agregar ventas reales por product ID
    const liveMap = new Map<string, { vendidos: number; ingresos: number }>();
    completedSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const prev = liveMap.get(item.id) ?? { vendidos: 0, ingresos: 0 };
        liveMap.set(item.id, {
          vendidos: prev.vendidos + item.quantity,
          ingresos: prev.ingresos + item.price * item.quantity,
        });
      });
    });

    // Fusionar con base mock
    const merged = BASE_TOP_PRODUCTS.map((p) => {
      const live = liveMap.get(p.id);
      liveMap.delete(p.id); // evitar duplicado
      return {
        nombre: p.nombre,
        vendidos: p.vendidos + (live?.vendidos ?? 0),
        ingresos: p.ingresos + (live?.ingresos ?? 0),
      };
    });

    // Agregar productos nuevos que no estaban en la base
    liveMap.forEach((v, id) => {
      const prod = products.find((p) => p.id === id);
      if (prod) merged.push({ nombre: prod.name, vendidos: v.vendidos, ingresos: v.ingresos });
    });

    // Ordenar por ingresos descendente y tomar top 5
    merged.sort((a, b) => b.ingresos - a.ingresos);
    const top5 = merged.slice(0, 5);
    const max  = Math.max(...top5.map((p) => p.vendidos), 1);
    return top5.map((p) => ({ ...p, maxVendidos: max }));
  }, [completedSales, products]);

  /* ── IA Insights state ── */
  const [aiInsights, setAiInsights] = useState<DashboardSummaryOutput | null>(null);
  const [aiLoading, setAiLoading]   = useState(false);

  /* ── Sales Assistant state ── */
  type ChatMessage = { role: 'user' | 'assistant'; content: string };
  const [assistantOpen, setAssistantOpen]     = useState(false);
  const [chatHistory, setChatHistory]         = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput]             = useState('');
  const [chatLoading, setChatLoading]         = useState(false);
  const [lastAssistant, setLastAssistant]     = useState<SalesAssistantOutput | null>(null);

  const handleAskAssistant = async () => {
    const question = chatInput.trim();
    if (!question || chatLoading) return;
    setChatInput('');
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: question }];
    setChatHistory(newHistory);
    setChatLoading(true);
    try {
      const res = await fetch('/api/ai/sales-assistant', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: {
            totalRevenue,
            liveOrders,
            criticalStock:   criticalCount,
            outOfStock:      outOfStockCount,
            goalPct,
            topProducts:     topProducts.map(p => ({ nombre: p.nombre, vendidos: p.vendidos, ingresos: p.ingresos })),
            totalProducts:   products.length,
          },
          history: chatHistory.slice(-6),
        }),
      });
      const data = await res.json() as SalesAssistantOutput;
      setLastAssistant(data);
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Error al conectar con el asistente. Intenta de nuevo.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAnalyzeWithAI = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/dashboard-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalRevenue,
          liveOrders,
          criticalStock:    criticalCount,
          outOfStock:       outOfStockCount,
          goalPct,
          avgSatisfaction:  4.8,
          topProducts:      topProducts.map(p => ({ nombre: p.nombre, vendidos: p.vendidos, ingresos: p.ingresos })),
          recentSalesCount: completedSales.length,
        }),
      });
      const data = await res.json();
      setAiInsights(data);
    } catch {
      toast({ title: 'Error al conectar con IA', variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  };

  /* ── Merge transactions: catalog first, then mock ── */
  const allTransactions = useMemo(() => {
    const live = completedSales.slice(0, 5).map((s) => ({
      id: s.id,
      cliente: 'Cliente Web',
      producto: s.itemsDescription.slice(0, 48) + (s.itemsDescription.length > 48 ? '…' : ''),
      monto: s.total,
      metodo: s.paymentMethod,
      estado: 'Completado',
      canal: 'Web',
    }));
    return [...live, ...mockTransactions].slice(0, 8);
  }, [completedSales]);

  /* ── PDF export ── */
  const handleExportDashboard = () => {
    toast({ title: "Generando reporte ejecutivo…", description: "Preparando resumen de KPIs y actividad." });
    const doc = new jsPDF() as any;

    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(20); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
    doc.text('PAT-LI TEXTILES', 20, 18);
    doc.setFontSize(11); doc.setFont('helvetica', 'normal');
    doc.text('Reporte Ejecutivo — Centro de Comando', 20, 28);
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, 20, 36);

    doc.setFontSize(13); doc.setTextColor(30, 58, 95); doc.setFont('helvetica', 'bold');
    doc.text('KPIs del Mes', 20, 55);
    doc.autoTable({
      startY: 60,
      head: [['Indicador', 'Valor', 'Meta']],
      body: [
        ['Ventas del Mes', `S/ ${totalRevenue.toLocaleString()}`, `S/ ${monthlyGoal.toLocaleString()}`],
        ['Pedidos Catálogo', liveOrders, '—'],
        ['Conversión IA', '24.5%', '>20%'],
        ['Satisfacción', '4.8/5', '≥4.5'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 248, 255] },
    });

    let y = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(13); doc.setTextColor(30, 58, 95); doc.setFont('helvetica', 'bold');
    doc.text('Ventas por Día (Semana Actual)', 20, y);
    doc.autoTable({
      startY: y + 5,
      head: [['Día', 'Ventas (S/)', 'Pedidos']],
      body: mainSalesData.map(d => [d.day, `S/ ${d.sales.toLocaleString()}`, d.orders]),
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], textColor: 30, fontStyle: 'bold' },
    });

    y = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(13); doc.setTextColor(30, 58, 95); doc.setFont('helvetica', 'bold');
    doc.text('Top Productos por Ingresos', 20, y);
    doc.autoTable({
      startY: y + 5,
      head: [['Producto', 'Unidades Vendidas', 'Ingresos (S/)']],
      body: topProducts.map(p => [p.nombre, p.vendidos, `S/ ${p.ingresos.toLocaleString()}`]),
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 248, 255] },
    });

    y = doc.lastAutoTable.finalY + 12;
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(13); doc.setTextColor(30, 58, 95); doc.setFont('helvetica', 'bold');
    doc.text('Últimas Transacciones', 20, y);
    doc.autoTable({
      startY: y + 5,
      head: [['ID', 'Cliente', 'Producto', 'Monto', 'Método', 'Canal']],
      body: allTransactions.map(t => [t.id, t.cliente, t.producto, `S/ ${t.monto.toFixed(2)}`, t.metodo, t.canal]),
      theme: 'striped',
      headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8); doc.setTextColor(150);
      doc.text(`PAT-LI Textiles — Confidencial | Página ${i} de ${pageCount}`, 20, 290);
    }
    doc.save('reporte_ejecutivo_patli.pdf');
    toast({ title: "Reporte descargado correctamente" });
  };

  const kpis = [
    {
      title: 'Ventas del Mes',
      numValue: totalRevenue, prefix: 'S/ ', suffix: '', decimals: 0,
      trend: liveRevenue > 0 ? `+S/${liveRevenue.toFixed(0)} web` : '+12.5%',
      icon: ShoppingBag,
      iconCls: 'bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-white',
      barCls:  'bg-gradient-to-b from-[#1e3a5f] to-[#2563eb]',
      sub: `Meta: ${goalPct}% completada`,
    },
    {
      title: 'Pedidos Totales',
      numValue: 167 + liveOrders, prefix: '', suffix: '', decimals: 0,
      trend: liveOrders > 0 ? `+${liveOrders} web hoy` : '+8.2%',
      icon: ShoppingCart,
      iconCls: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white',
      barCls:  'bg-gradient-to-b from-cyan-500 to-blue-600',
      sub: `${liveOrders} desde catálogo digital`,
    },
    {
      title: 'Conversión IA',
      numValue: 24.5, prefix: '', suffix: '%', decimals: 1,
      trend: '+4.2%',
      icon: Zap,
      iconCls: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white',
      barCls:  'bg-gradient-to-b from-amber-400 to-orange-500',
      sub: '342 consultas este mes',
    },
    {
      title: 'Satisfacción',
      numValue: 4.8, prefix: '', suffix: ' / 5', decimals: 1,
      trend: '+0.3 pts',
      icon: Star,
      iconCls: 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white',
      barCls:  'bg-gradient-to-b from-emerald-400 to-teal-600',
      sub: 'Basado en 215 encuestas',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] rounded-2xl flex items-center justify-center shadow-md">
              <BarChart2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="page-title">Centro de Comando</h1>
              <p className="page-subtitle">Monitoreo en tiempo real · PAT-LI Textiles, Ica</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {liveOrders > 0 && (
            <div className="flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              {liveOrders} {liveOrders === 1 ? 'pedido' : 'pedidos'} en vivo
            </div>
          )}
          <Button variant="outline" size="sm" className="gap-2 bg-white border-slate-200 rounded-xl text-sm" onClick={handleExportDashboard}>
            <Download className="h-3.5 w-3.5" /> Reporte PDF
          </Button>
        </div>
      </div>

      {/* Live sales banner */}
      {liveOrders > 0 && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/20 rounded-xl"><Wifi className="h-5 w-5" /></div>
            <div>
              <p className="font-bold text-sm">Catálogo Digital activo</p>
              <p className="text-xs opacity-80">{liveOrders} {liveOrders === 1 ? 'compra realizada' : 'compras realizadas'} en esta sesión · S/ {liveRevenue.toFixed(2)} recaudados</p>
            </div>
          </div>
          <div className="text-white/90 text-xs font-bold bg-white/20 px-4 py-2 rounded-xl whitespace-nowrap">
            Última: {completedSales[0]?.items[0]?.description ?? '—'}
          </div>
        </div>
      )}

      {/* ── KPI Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!mounted
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="w-11 h-11 rounded-2xl" />
                  <Skeleton className="w-16 h-5 rounded-full" />
                </div>
                <Skeleton className="w-20 h-3 rounded mb-2" />
                <Skeleton className="w-28 h-8 rounded mb-2" />
                <Skeleton className="w-24 h-3 rounded" />
              </div>
            ))
          : kpis.map((kpi, i) => (
              <div key={i} className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-default">
                {/* Left accent bar */}
                <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${kpi.barCls}`} />
                <div className="p-5 pl-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${kpi.iconCls}`}>
                      <kpi.icon className="h-5 w-5" />
                    </div>
                    <span className="metric-up">
                      <ArrowUpRight className="h-3 w-3" />{kpi.trend}
                    </span>
                  </div>
                  <p className="section-label mb-1.5">{kpi.title}</p>
                  <h3 className="text-3xl font-black text-slate-900 leading-none mb-2">
                    <AnimatedNumber value={kpi.numValue} prefix={kpi.prefix} suffix={kpi.suffix} decimals={kpi.decimals} />
                  </h3>
                  <p className="text-[10px] text-slate-400">{kpi.sub}</p>
                </div>
              </div>
            ))
        }
      </div>

      {/* IA Insights Card */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-50 rounded-xl">
                <Sparkles className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Análisis IA — Gemini</h3>
                <p className="text-xs text-slate-500">Insights automáticos sobre el estado del negocio</p>
              </div>
            </div>
            <Button
              onClick={handleAnalyzeWithAI}
              disabled={aiLoading}
              className="bg-violet-600 hover:bg-violet-700 text-white gap-2 shrink-0"
            >
              {aiLoading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Analizando...</>
                : aiInsights
                  ? <><RefreshCw className="h-4 w-4" /> Re-analizar</>
                  : <><Sparkles className="h-4 w-4" /> Analizar con IA</>
              }
            </Button>
          </div>

          {!aiInsights && !aiLoading && (
            <div className="text-center py-6 text-slate-400">
              <Sparkles className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Presiona "Analizar con IA" para obtener insights en tiempo real sobre tus KPIs actuales.</p>
            </div>
          )}

          {aiLoading && (
            <div className="space-y-3 pt-2">
              <Skeleton className="h-8 w-36 rounded-full" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-slate-100 p-3 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2 p-3 rounded-2xl bg-slate-50">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="space-y-2 p-3 rounded-2xl bg-slate-50">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          )}

          {aiInsights && !aiLoading && (
            <div className="space-y-4">
              {/* Status badge */}
              <div className="flex items-center gap-2 mb-2">
                <Badge className={
                  aiInsights.overallStatus === 'excelente' ? 'bg-emerald-500 text-white' :
                  aiInsights.overallStatus === 'bueno'     ? 'bg-blue-500 text-white' :
                                                             'bg-amber-500 text-white'
                }>
                  Estado general: {aiInsights.overallStatus.charAt(0).toUpperCase() + aiInsights.overallStatus.slice(1)}
                </Badge>
              </div>

              {/* Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {aiInsights.insights.map((ins, i) => (
                  <div key={i} className={`flex items-start gap-2.5 p-3.5 rounded-xl border ${
                    ins.type === 'positive'  ? 'bg-emerald-50 border-emerald-200' :
                    ins.type === 'warning'   ? 'bg-amber-50 border-amber-200' :
                                              'bg-blue-50 border-blue-200'
                  }`}>
                    {ins.type === 'positive'
                      ? <TrendingUp  className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      : ins.type === 'warning'
                        ? <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        : <Zap className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    }
                    <p className="text-xs leading-relaxed text-slate-700">{ins.text}</p>
                  </div>
                ))}
              </div>

              {/* Recommendation */}
              <div className="flex items-start gap-3 p-4 bg-violet-50 border border-violet-200 rounded-xl">
                <Sparkles className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-1">Recomendación Estratégica</p>
                  <p className="text-sm font-medium text-slate-800 italic">"{aiInsights.recommendation}"</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales Assistant IA */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />
        <CardContent className="p-6">
          <button
            className="w-full flex items-center justify-between"
            onClick={() => setAssistantOpen((v) => !v)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 rounded-xl">
                <Bot className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-900">Asistente de Ventas IA</h3>
                <p className="text-xs text-slate-500">Pregunta sobre KPIs, productos o tendencias del negocio</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {chatHistory.length > 0 && (
                <Badge className="bg-amber-500 text-white text-xs">{Math.floor(chatHistory.length / 2)} consultas</Badge>
              )}
              {assistantOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </div>
          </button>

          {assistantOpen && (
            <div className="mt-5 space-y-4">
              {/* Quick suggestions */}
              {chatHistory.length === 0 && (
                <div className="flex flex-wrap gap-2">
                  {[
                    '¿Cuál es el producto más rentable?',
                    '¿Cómo vamos respecto a la meta?',
                    '¿Qué hacer con el stock crítico?',
                    '¿Cuánto ingresó por ventas web?',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setChatInput(q); }}
                      className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-3 py-1.5 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat messages */}
              {chatHistory.length > 0 && (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="h-3.5 w-3.5 text-amber-600" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-slate-100 text-slate-800 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="h-3.5 w-3.5 text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <Bot className="h-3.5 w-3.5 text-amber-600" />
                      </div>
                      <div className="bg-slate-100 rounded-2xl rounded-tl-none px-3.5 py-2.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Data points from last answer */}
              {lastAssistant?.dataPoints && lastAssistant.dataPoints.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {lastAssistant.dataPoints.map((dp, i) => (
                    <span key={i} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-1">
                      {dp}
                    </span>
                  ))}
                </div>
              )}

              {/* Suggestion box */}
              {lastAssistant?.suggestion && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 italic">{lastAssistant.suggestion}</p>
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2 pt-1">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAssistant()}
                  placeholder="Escribe tu consulta sobre el negocio…"
                  className="flex-1 text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                  disabled={chatLoading}
                />
                <Button
                  onClick={handleAskAssistant}
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-amber-500 hover:bg-amber-600 text-white h-9 w-9 p-0 rounded-xl shrink-0"
                >
                  {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Goal Progress */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/8 rounded-xl"><Target className="h-6 w-6 text-primary" /></div>
              <div>
                <p className="font-bold text-slate-900">Meta de Ventas — Mayo 2026</p>
                <p className="text-sm text-slate-500">S/ {totalRevenue.toLocaleString()} recaudados de S/ {monthlyGoal.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {editingGoal ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 font-medium">S/</span>
                  <input
                    type="number"
                    className="w-28 h-9 px-3 text-sm border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 font-bold"
                    value={goalInput}
                    onChange={e => setGoalInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const v = parseInt(goalInput);
                        if (!isNaN(v) && v >= 1000) { setMonthlyGoal(v); toast({ title: `Meta actualizada: S/ ${v.toLocaleString()}` }); }
                        setEditingGoal(false);
                      }
                      if (e.key === 'Escape') setEditingGoal(false);
                    }}
                    autoFocus
                  />
                  <button
                    className="h-9 w-9 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90"
                    onClick={() => {
                      const v = parseInt(goalInput);
                      if (!isNaN(v) && v >= 1000) { setMonthlyGoal(v); toast({ title: `Meta actualizada: S/ ${v.toLocaleString()}` }); }
                      setEditingGoal(false);
                    }}
                  ><Check className="h-4 w-4" /></button>
                  <button
                    className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                    onClick={() => setEditingGoal(false)}
                  ><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-3xl font-black text-primary">{goalPct}%</p>
                    <p className="text-xs text-slate-400">completado</p>
                  </div>
                  <button
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-primary transition-colors"
                    title="Editar meta"
                    onClick={() => { setGoalInput(String(monthlyGoal)); setEditingGoal(true); }}
                  ><Pencil className="h-3.5 w-3.5" /></button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <Progress value={goalPct} className="h-3 rounded-full" />
            <div className="flex justify-between mt-1.5 text-[10px] text-slate-400 font-bold">
              <span>S/ 0</span>
              <span>S/ {(monthlyGoal / 2).toLocaleString()}</span>
              <span>S/ {monthlyGoal.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Flujo de Ingresos</CardTitle>
              <CardDescription>Ventas diarias de la semana en curso</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-primary/10 text-primary border-none">Diario</Badge>
              <Badge variant="outline">Semanal</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mainSalesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  formatter={(v: number) => [`S/ ${v.toLocaleString()}`, 'Ventas']}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Mix de Productos</CardTitle>
            <CardDescription>Ventas por tipo de textil</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={categoryData} innerRadius={50} outerRadius={76} paddingAngle={6} dataKey="value" strokeWidth={0}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, 'Participación']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full mt-2 space-y-1.5">
              {categoryData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] text-slate-500 flex-1 truncate">{item.name}</span>
                  <span className="text-xs font-black text-slate-700">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Transactions ─────────────────────────────────── */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-primary via-secondary to-emerald-500" />
        <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
          <div>
            <CardTitle className="text-base font-black">Últimas Transacciones</CardTitle>
            <CardDescription className="text-xs">Tienda física + catálogo digital en tiempo real</CardDescription>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            En vivo
          </div>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Canal</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {allTransactions.map((t) => (
                <tr key={t.id}>
                  <td><span className="font-mono text-[11px] text-slate-400">{t.id}</span></td>
                  <td><span className="font-semibold text-slate-800">{t.cliente}</span></td>
                  <td><span className="text-slate-500 block max-w-[160px] truncate">{t.producto}</span></td>
                  <td><span className="font-black text-primary">S/ {t.monto.toFixed(2)}</span></td>
                  <td>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t.metodo}</span>
                  </td>
                  <td>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.canal === 'Web'
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}>{t.canal}</span>
                  </td>
                  <td>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                      t.estado === 'Completado'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}>{t.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ── Bottom Row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pb-6">

        {/* Bot Activity */}
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <CardHeader className="py-4 px-5 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black">Actividad PAT-LI Bot</CardTitle>
                <CardDescription className="text-[11px]">Últimas interacciones</CardDescription>
              </div>
              <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-1.5">
            {botActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  item.urgent ? 'bg-red-100 text-red-500' : 'bg-primary/8 text-primary'
                }`}>
                  <MessageSquare size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 leading-none">{item.user}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.action}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                    item.status === 'Resuelto'    ? 'bg-emerald-100 text-emerald-700' :
                    item.status === 'Derivado'    ? 'bg-amber-100 text-amber-700' :
                                                   'bg-blue-100 text-blue-700'
                  }`}>{item.status}</span>
                  <p className="text-[9px] text-slate-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-amber-400 to-orange-500" />
          <CardHeader className="py-4 px-5 pb-3">
            <CardTitle className="text-sm font-black">Top Productos</CardTitle>
            <CardDescription className="text-[11px]">Más vendidos del mes · S/ ingresos</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3.5">
            {topProducts.map((p, i) => {
              const pct = Math.round((p.vendidos / p.maxVendidos) * 100);
              const colors = ['from-[#1e3a5f] to-[#2563eb]','from-cyan-500 to-blue-500','from-violet-500 to-purple-500','from-amber-400 to-orange-500','from-emerald-400 to-teal-500'];
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${colors[i]} flex items-center justify-center text-white font-black text-[9px] shrink-0`}>{i + 1}</div>
                      <p className="text-xs font-bold text-slate-700 truncate max-w-[110px]">{p.nombre}</p>
                    </div>
                    <span className="text-xs font-black text-primary shrink-0">S/ {p.ingresos.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${colors[i]} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{p.vendidos} unid. vendidas</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Logistics & Alerts */}
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
          <CardHeader className="py-4 px-5 pb-3">
            <CardTitle className="text-sm font-black">Logística e Inventario</CardTitle>
            <CardDescription className="text-[11px]">Alertas críticas de stock</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2.5">
            {[
              { label: 'Stock Crítico',   value: `${criticalCount} prod.`,    icon: AlertTriangle, urgent: criticalCount > 5 },
              { label: 'Agotados',        value: `${outOfStockCount} prod.`,  icon: Package,       urgent: outOfStockCount > 0 },
              { label: 'T. Respuesta Bot',value: '< 3 seg',                   icon: Clock,         urgent: false },
              { label: 'Eficiencia IA',   value: '92%',                       icon: BarChart2,     urgent: false },
            ].map((item, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-2xl border ${
                item.urgent ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    item.urgent ? 'bg-red-100 text-red-500' : 'bg-white text-primary shadow-sm'
                  }`}>
                    <item.icon size={15} />
                  </div>
                  <p className="text-xs font-bold text-slate-700">{item.label}</p>
                </div>
                <p className={`text-sm font-black ${item.urgent ? 'text-red-600' : 'text-primary'}`}>{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
