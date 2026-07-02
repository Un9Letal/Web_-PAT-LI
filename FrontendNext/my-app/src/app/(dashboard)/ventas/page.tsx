"use client";

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import {
  ShoppingBag, Search, Filter, Download, Plus, MoreHorizontal,
  CheckCircle2, Clock, XCircle, FileText, CalendarRange,
  FileSpreadsheet, Printer, Sparkles, Loader2, TrendingUp,
  CreditCard, Zap, ArrowUpRight, BarChart2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar, Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { drawPdfHeader, drawPdfFooter } from '@/lib/pdf-header';
import { generateReceiptPDF } from '@/lib/receipt';

type Venta = { id: string; customer: string; date: string; total: number; status: 'completado' | 'pendiente' | 'cancelado'; method: string; canal: 'Web' | 'Tienda' };
type VentaFormErrors = { customer?: string; total?: string };
type PeriodFilter = 'hoy' | 'semana' | 'mes' | 'todo';

const salesData = [
  { month: 'Ene', amount: 15000 }, { month: 'Feb', amount: 18000 },
  { month: 'Mar', amount: 16500 }, { month: 'Abr', amount: 21000 },
  { month: 'May', amount: 19000 }, { month: 'Jun', amount: 24560 },
];

/* Ventas por hora del día (mock enriquecido) */
const HOURLY_DATA = [
  { hora: '8am',  ventas: 320,  pedidos: 3  },
  { hora: '9am',  ventas: 580,  pedidos: 6  },
  { hora: '10am', ventas: 1240, pedidos: 13 },
  { hora: '11am', ventas: 1890, pedidos: 20 },
  { hora: '12pm', ventas: 2340, pedidos: 25 },
  { hora: '1pm',  ventas: 1650, pedidos: 17 },
  { hora: '2pm',  ventas: 980,  pedidos: 10 },
  { hora: '3pm',  ventas: 1420, pedidos: 15 },
  { hora: '4pm',  ventas: 1780, pedidos: 19 },
  { hora: '5pm',  ventas: 2650, pedidos: 28 },
  { hora: '6pm',  ventas: 3100, pedidos: 33 },
  { hora: '7pm',  ventas: 2480, pedidos: 26 },
  { hora: '8pm',  ventas: 1200, pedidos: 13 },
];

const METHODS = ['Todos', 'Efectivo', 'Yape', 'Plin', 'Transferencia', 'Tarjeta'];

const initialTransactions: Venta[] = [
  { id: 'V-1024', customer: 'Carlos Rodriguez', date: new Date().toISOString().split('T')[0], total: 150.00, status: 'completado', method: 'Yape',          canal: 'Tienda' },
  { id: 'V-1025', customer: 'Ana Luz',           date: new Date().toISOString().split('T')[0], total: 85.50,  status: 'completado', method: 'Efectivo',      canal: 'Tienda' },
  { id: 'V-1026', customer: 'Roberto Gomez',     date: new Date().toISOString().split('T')[0], total: 320.00, status: 'pendiente',  method: 'Transferencia', canal: 'Tienda' },
  { id: 'V-1027', customer: 'Lucía Pardo',       date: new Date().toISOString().split('T')[0], total: 45.00,  status: 'completado', method: 'Tarjeta',       canal: 'Tienda' },
  { id: 'V-1028', customer: 'Marcos Ruiz',       date: new Date().toISOString().split('T')[0], total: 120.00, status: 'cancelado',  method: 'Yape',          canal: 'Tienda' },
  { id: 'V-1019', customer: 'Diana Torres',      date: '2025-05-27', total: 210.00, status: 'completado', method: 'Plin',     canal: 'Tienda' },
  { id: 'V-1018', customer: 'Miguel Vera',       date: '2025-05-26', total: 95.00,  status: 'completado', method: 'Efectivo', canal: 'Tienda' },
  { id: 'V-1017', customer: 'Sofía León',        date: '2025-05-25', total: 175.50, status: 'completado', method: 'Yape',     canal: 'Tienda' },
  { id: 'V-1016', customer: 'Andrés Chávez',     date: '2025-05-24', total: 88.00,  status: 'cancelado',  method: 'Tarjeta',  canal: 'Tienda' },
  { id: 'V-1015', customer: 'Fernanda Quispe',   date: '2025-05-22', total: 340.00, status: 'completado', method: 'Transferencia', canal: 'Tienda' },
];

const todayStr = new Date().toISOString().split('T')[0];
const weekAgo  = new Date(Date.now() - 7  * 86400000).toISOString().split('T')[0];
const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

export default function VentasPage() {
  const completedSales = useAppStore((s) => s.completedSales);
  const [transactions, setTransactions] = useState<Venta[]>(initialTransactions);
  const [searchTerm, setSearchTerm]     = useState('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('todo');
  const [methodFilter, setMethodFilter] = useState('Todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [anularTarget, setAnularTarget] = useState<Venta | null>(null);
  const [isNewVentaOpen, setIsNewVentaOpen] = useState(false);
  const [form, setForm]   = useState({ customer: '', total: '', method: 'Efectivo' });
  const [errors, setErrors] = useState<VentaFormErrors>({});

  /* ── IA Tendencias ── */
  const [aiTrend, setAiTrend]           = useState<{ answer: string; dataPoints?: string[]; suggestion?: string } | null>(null);
  const [aiTrendLoading, setAiTrendLoading] = useState(false);

  const storeSales: Venta[] = useMemo(() =>
    completedSales.map((s) => ({
      id: s.id, customer: 'Cliente Web', date: s.date.split('T')[0],
      total: s.total, status: 'completado' as const, method: s.paymentMethod, canal: 'Web' as const,
    })), [completedSales]);

  const allTransactions = useMemo(() => [...storeSales, ...transactions], [storeSales, transactions]);

  const filtered = useMemo(() => {
    const useCustomRange = dateFrom || dateTo;
    const dateThreshold  = !useCustomRange ? (periodFilter === 'hoy' ? todayStr : periodFilter === 'semana' ? weekAgo : periodFilter === 'mes' ? monthAgo : '') : '';
    return allTransactions.filter(t => {
      const matchSearch = t.customer.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDate   = useCustomRange
        ? (!dateFrom || t.date >= dateFrom) && (!dateTo || t.date <= dateTo)
        : !dateThreshold || t.date >= dateThreshold;
      const matchMethod = methodFilter === 'Todos' || t.method === methodFilter;
      return matchSearch && matchDate && matchMethod;
    });
  }, [allTransactions, searchTerm, periodFilter, methodFilter, dateFrom, dateTo]);

  /* ── Métricas ── */
  const totalCompleted = allTransactions.filter(t => t.status === 'completado').reduce((s, t) => s + t.total, 0);
  const ticketPromedio = allTransactions.length > 0 ? allTransactions.reduce((s, t) => s + t.total, 0) / allTransactions.length : 0;
  const webVentas      = storeSales.length;
  const webRevenue     = storeSales.reduce((s, t) => s + t.total, 0);
  const cancelRate     = allTransactions.length > 0 ? Math.round((allTransactions.filter(t => t.status === 'cancelado').length / allTransactions.length) * 100) : 0;

  const methodBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    allTransactions.filter(t => t.status === 'completado').forEach(t => {
      map.set(t.method, (map.get(t.method) ?? 0) + t.total);
    });
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
    return Array.from(map.entries())
      .map(([method, amount]) => ({ method, amount, pct: Math.round((amount / total) * 100) }))
      .sort((a, b) => b.amount - a.amount);
  }, [allTransactions]);

  const peakHour = HOURLY_DATA.reduce((max, h) => h.ventas > max.ventas ? h : max, HOURLY_DATA[0]);

  const handleAITrend = async () => {
    setAiTrendLoading(true);
    try {
      const res = await fetch('/api/ai/sales-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Analiza las tendencias de ventas: hora pico ${peakHour.hora} con S/${peakHour.ventas}, método más usado ${methodBreakdown[0]?.method ?? 'Efectivo'}, tasa de cancelación ${cancelRate}%. ¿Qué acciones concretas recomiendas?`,
          context: {
            totalRevenue: totalCompleted, liveOrders: webVentas,
            criticalStock: 0, outOfStock: 0, goalPct: Math.round((totalCompleted / 30000) * 100),
            topProducts: [], totalProducts: 0,
          },
        }),
      });
      const data = await res.json();
      setAiTrend(data);
    } catch {
      toast({ title: 'Error al analizar tendencias', variant: 'destructive' });
    } finally {
      setAiTrendLoading(false);
    }
  };

  const validateVenta = (): VentaFormErrors => {
    const errs: VentaFormErrors = {};
    if (!form.customer.trim()) errs.customer = 'El nombre del cliente es requerido';
    else if (form.customer.trim().length < 3) errs.customer = 'Mínimo 3 caracteres';
    const total = parseFloat(form.total);
    if (!form.total) errs.total = 'El monto es requerido';
    else if (isNaN(total) || total <= 0) errs.total = 'El monto debe ser mayor a S/ 0.00';
    return errs;
  };

  const handleCreateVenta = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateVenta();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    const hoy = new Date().toISOString().split('T')[0];
    const newId = `V-${1029 + transactions.length}`;
    setTransactions(prev => [{ id: newId, customer: form.customer.trim(), date: hoy, total: parseFloat(form.total), status: 'pendiente', method: form.method, canal: 'Tienda' }, ...prev]);
    toast({ title: 'Venta registrada', description: `${newId} guardada. Estado: Pendiente.` });
    setIsNewVentaOpen(false);
    setForm({ customer: '', total: '', method: 'Efectivo' });
  };

  const cambiarEstado = (id: string, status: Venta['status']) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    toast({ title: `Venta ${status}`, description: `La venta ${id} fue marcada como ${status}.` });
  };

  const exportCSV = () => {
    const csv = [['ID Venta', 'Cliente', 'Fecha', 'Canal', 'Método', 'Total (S/)', 'Estado'], ...filtered.map(t => [t.id, t.customer, t.date, t.canal, t.method, t.total.toFixed(2), t.status])].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = 'ventas_patli.csv'; a.click();
    toast({ title: 'CSV exportado', description: `${filtered.length} registros.` });
  };

  const handleExport = () => {
    const doc = new jsPDF() as any;
    const startY = drawPdfHeader(doc, 'Historial de Ventas', 'Reporte de transacciones');
    doc.setFontSize(12); doc.setTextColor(30,58,95); doc.setFont('helvetica', 'bold');
    doc.text('Resumen', 14, startY + 7);
    doc.autoTable({ startY: startY + 12, head: [['Indicador','Valor']], body: [['Total Completadas', `S/ ${totalCompleted.toFixed(2)}`],['Ticket Promedio', `S/ ${ticketPromedio.toFixed(2)}`],['Pedidos Web', String(webVentas)],['Tasa Cancelación', `${cancelRate}%`]], theme: 'grid', headStyles: { fillColor: [30,58,95], textColor: 255 }, tableWidth: 80 });
    let y = doc.lastAutoTable.finalY + 10;
    doc.text('Detalle de Transacciones', 14, y);
    doc.autoTable({ startY: y + 5, head: [['ID','Cliente','Fecha','Canal','Método','Total','Estado']], body: allTransactions.map(t => [t.id, t.customer, t.date, t.canal, t.method, `S/ ${t.total.toFixed(2)}`, t.status]), theme: 'striped', headStyles: { fillColor: [245,158,11], textColor: 30 }, bodyStyles: { fontSize: 9 } });
    drawPdfFooter(doc);
    doc.save('ventas_patli.pdf');
    toast({ title: 'PDF descargado' });
  };

  const downloadReceipt = (t: Venta) => {
    // Buscar la venta web real para obtener el detalle de items
    const webSale = completedSales.find((s) => s.id === t.id);

    const items = webSale && webSale.items.length > 0
      ? webSale.items.map((it) => ({
          description: it.description,
          quantity:    it.quantity,
          price:       it.price,
        }))
      : [{
          // Venta de tienda física sin desglose: una sola línea
          description: 'Venta de productos PAT-LI Textiles',
          quantity:    1,
          price:       t.total,
        }];

    generateReceiptPDF({
      transactionId: t.id,
      items,
      total:         t.total,
      discount:      0,
      paymentMethod: t.method,
      customerName:  t.customer !== 'Cliente Web' ? t.customer : undefined,
    });
    toast({ title: `Boleta ${t.id} descargada`, description: 'Comprobante electrónico generado conforme a ley (RUC, IGV, serie).' });
  };

  const PERIOD_LABELS: Record<PeriodFilter, string> = { hoy: 'Hoy', semana: 'Esta semana', mes: 'Este mes', todo: 'Todo' };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-secondary to-blue-700 rounded-2xl flex items-center justify-center shadow-md">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Gestión de Ventas</h1>
            <p className="page-subtitle">Monitorea y administra todas las transacciones</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-slate-200 bg-white text-sm" onClick={exportCSV}><FileSpreadsheet className="h-3.5 w-3.5 text-green-600" /> CSV</Button>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-slate-200 bg-white text-sm" onClick={handleExport}><Download className="h-3.5 w-3.5" /> PDF</Button>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl border-slate-200 bg-white text-sm print:hidden" onClick={() => window.print()}><Printer className="h-3.5 w-3.5" /></Button>
          <Button size="sm" className="gap-2 bg-secondary hover:bg-secondary/90 rounded-xl text-sm shadow-md" onClick={() => setIsNewVentaOpen(true)}><Plus className="h-4 w-4" /> Nueva Venta</Button>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={isNewVentaOpen} onOpenChange={(v) => { setIsNewVentaOpen(v); if (!v) setErrors({}); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Nueva Venta</DialogTitle>
            <DialogDescription>Ingresa los detalles de la venta para actualizar el registro.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateVenta} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label>Nombre del Cliente</Label>
              <Input value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))} placeholder="Ej. Juan Pérez" className={errors.customer ? 'border-destructive' : ''} />
              {errors.customer && <p className="text-xs text-destructive">{errors.customer}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Monto Total (S/)</Label>
                <Input type="number" step="0.01" min="0.01" value={form.total} onChange={e => setForm(f => ({ ...f, total: e.target.value }))} placeholder="0.00" className={errors.total ? 'border-destructive' : ''} />
                {errors.total && <p className="text-xs text-destructive">{errors.total}</p>}
              </div>
              <div className="space-y-1">
                <Label>Método de Pago</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
                  {['Efectivo','Yape','Plin','Transferencia','Tarjeta'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <DialogFooter><Button type="submit" className="w-full bg-primary">Guardar Venta</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── KPI Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Completadas', value: `S/ ${totalCompleted.toFixed(0)}`, sub: `${allTransactions.filter(t=>t.status==='completado').length} transacciones`, icon: ShoppingBag, iconCls: 'bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-white', barCls: 'bg-gradient-to-b from-[#1e3a5f] to-[#2563eb]' },
          { label: 'Ticket Promedio',   value: `S/ ${ticketPromedio.toFixed(2)}`, sub: `${allTransactions.length} transacciones en total`,                          icon: CreditCard,  iconCls: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white',    barCls: 'bg-gradient-to-b from-cyan-500 to-blue-600' },
          { label: 'Hora Pico',         value: peakHour.hora,                     sub: `S/ ${peakHour.ventas.toLocaleString()} recaudados`,                          icon: Zap,         iconCls: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white', barCls: 'bg-gradient-to-b from-amber-400 to-orange-500' },
          { label: 'Tasa Cancelación',  value: `${cancelRate}%`,                  sub: `${allTransactions.filter(t=>t.status==='cancelado').length} canceladas`,      icon: BarChart2,   iconCls: cancelRate > 10 ? 'bg-gradient-to-br from-red-400 to-red-600 text-white' : 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white', barCls: cancelRate > 10 ? 'bg-gradient-to-b from-red-400 to-red-600' : 'bg-gradient-to-b from-emerald-400 to-teal-600' },
        ].map((k, i) => (
          <div key={i} className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${k.barCls}`} />
            <div className="p-5 pl-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${k.iconCls}`}><k.icon className="h-4.5 w-4.5" /></div>
                <ArrowUpRight className="h-4 w-4 text-slate-300" />
              </div>
              <p className="section-label mb-1">{k.label}</p>
              <h3 className="text-2xl font-black text-slate-900 leading-none">{k.value}</h3>
              <p className="text-[10px] text-slate-400 mt-1">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Hourly sales */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Ventas por Hora del Día</CardTitle>
                <CardDescription className="text-xs">Distribución de ingresos — hoy</CardDescription>
              </div>
              <Badge className={`text-xs ${peakHour.hora ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                Pico: {peakHour.hora}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY_DATA} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hora" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(v: number) => [`S/ ${v.toLocaleString()}`, 'Ventas']}
                />
                <Bar dataKey="ventas" radius={[4, 4, 0, 0]}>
                  {HOURLY_DATA.map((h, i) => (
                    <Cell key={i} fill={h.hora === peakHour.hora ? '#f59e0b' : '#2563eb'} fillOpacity={h.hora === peakHour.hora ? 1 : 0.6} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment method breakdown */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Métodos de Pago</CardTitle>
            <CardDescription className="text-xs">Distribución por método — ventas completadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {methodBreakdown.map((m, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700">{m.method}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">S/ {m.amount.toFixed(0)}</span>
                    <span className="text-xs font-black text-primary w-8 text-right">{m.pct}%</span>
                  </div>
                </div>
                <Progress value={m.pct} className="h-1.5" />
              </div>
            ))}
            {methodBreakdown.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Sin datos de métodos</p>}
          </CardContent>
        </Card>
      </div>

      {/* IA Tendencias */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-pink-500" />
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-50 rounded-xl"><Sparkles className="h-4 w-4 text-violet-600" /></div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Análisis de Tendencias IA</p>
                <p className="text-xs text-slate-500">Gemini analiza los patrones de ventas y recomienda acciones</p>
              </div>
            </div>
            <Button onClick={handleAITrend} disabled={aiTrendLoading} className="bg-violet-600 hover:bg-violet-700 text-white gap-2 shrink-0 text-sm">
              {aiTrendLoading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analizando…</> : <><Sparkles className="h-3.5 w-3.5" /> Analizar</>}
            </Button>
          </div>
          {!aiTrend && !aiTrendLoading && (
            <p className="text-xs text-slate-400 text-center py-4">Presiona "Analizar" para obtener insights sobre hora pico, métodos de pago y tendencias de cancelación.</p>
          )}
          {aiTrendLoading && (
            <div className="flex items-center justify-center gap-2 py-4 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
              <span className="text-sm">Gemini está analizando los datos de ventas…</span>
            </div>
          )}
          {aiTrend && !aiTrendLoading && (
            <div className="space-y-3">
              <div className="p-3.5 bg-violet-50 border border-violet-100 rounded-xl">
                <p className="text-sm text-slate-800 leading-relaxed"><TrendingUp className="h-4 w-4 text-violet-500 inline mr-1.5 mb-0.5" />{aiTrend.answer}</p>
              </div>
              {aiTrend.dataPoints && aiTrend.dataPoints.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {aiTrend.dataPoints.map((dp, i) => <span key={i} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2.5 py-1">{dp}</span>)}
                </div>
              )}
              {aiTrend.suggestion && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 italic">{aiTrend.suggestion}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de transacciones */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Historial de Transacciones</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">{filtered.length} de {allTransactions.length} registros</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Quick period filters */}
              <div className="flex rounded-lg overflow-hidden border border-slate-200">
                {(['hoy','semana','mes','todo'] as PeriodFilter[]).map(p => (
                  <button key={p}
                    onClick={() => { setPeriodFilter(p); setDateFrom(''); setDateTo(''); }}
                    className={`text-xs px-3 py-1.5 font-bold transition-colors ${periodFilter === p && !dateFrom && !dateTo ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                    {PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>
              {/* Custom date range */}
              <div className="flex items-center gap-1.5">
                <CalendarRange className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => { setDateFrom(e.target.value); setPeriodFilter('todo'); }}
                  className="h-8 px-2 text-xs border border-slate-200 rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  title="Desde"
                />
                <span className="text-slate-400 text-xs">–</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => { setDateTo(e.target.value); setPeriodFilter('todo'); }}
                  className="h-8 px-2 text-xs border border-slate-200 rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  title="Hasta"
                />
                {(dateFrom || dateTo) && (
                  <button
                    onClick={() => { setDateFrom(''); setDateTo(''); }}
                    className="text-[10px] font-bold text-red-500 hover:text-red-700 px-1.5"
                    title="Limpiar fechas"
                  >
                    ✕
                  </button>
                )}
              </div>
              {/* Method filter */}
              <div className="flex gap-1 flex-wrap">
                {METHODS.map(m => (
                  <button key={m} onClick={() => setMethodFilter(m)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border font-bold transition-colors ${methodFilter === m ? 'bg-secondary text-white border-secondary' : 'text-slate-500 border-slate-200 hover:border-secondary/50'}`}>
                    {m}
                  </button>
                ))}
              </div>
              {/* Search */}
              <div className="relative ml-auto">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input placeholder="Buscar..." className="pl-8 w-40 h-8 text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">ID Venta</TableHead>
                <TableHead className="text-xs">Cliente</TableHead>
                <TableHead className="text-xs">Fecha</TableHead>
                <TableHead className="text-xs">Canal</TableHead>
                <TableHead className="text-xs">Método</TableHead>
                <TableHead className="text-xs">Total</TableHead>
                <TableHead className="text-xs">Estado</TableHead>
                <TableHead className="text-xs text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-slate-400 py-8">No se encontraron ventas con este filtro.</TableCell></TableRow>}
              {filtered.map(t => (
                <TableRow key={t.id} className={t.canal === 'Web' ? 'bg-teal-50/30' : ''}>
                  <TableCell className="font-medium font-mono text-xs">{t.id}</TableCell>
                  <TableCell className="text-sm">{t.customer}</TableCell>
                  <TableCell className="text-sm text-slate-500">{t.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-[10px]', t.canal === 'Web' ? 'text-teal-600 border-teal-200 bg-teal-50' : 'text-slate-500 border-slate-200')}>
                      {t.canal}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{t.method}</TableCell>
                  <TableCell className="font-bold text-primary">S/ {t.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('gap-1 text-[10px]',
                      t.status === 'completado' && 'bg-green-50 text-green-600 border-green-200',
                      t.status === 'pendiente'  && 'bg-amber-100 text-amber-700 border-amber-200',
                      t.status === 'cancelado'  && 'bg-destructive/10 text-destructive border-destructive/20'
                    )}>
                      {t.status === 'completado' && <CheckCircle2 className="h-3 w-3" />}
                      {t.status === 'pendiente'  && <Clock className="h-3 w-3" />}
                      {t.status === 'cancelado'  && <XCircle className="h-3 w-3" />}
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => downloadReceipt(t)}><FileText className="h-4 w-4 mr-2" /> Descargar recibo</DropdownMenuItem>
                        {t.canal !== 'Web' && t.status === 'pendiente' && <DropdownMenuItem onClick={() => cambiarEstado(t.id, 'completado')}><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Marcar completado</DropdownMenuItem>}
                        {t.canal !== 'Web' && t.status !== 'cancelado' && <><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive" onClick={() => setAnularTarget(t)}>Anular venta</DropdownMenuItem></>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!anularTarget} onOpenChange={(v) => !v && setAnularTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Anular esta venta?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de anular <span className="font-bold">{anularTarget?.id}</span> de <span className="font-bold">{anularTarget?.customer}</span> por S/ {anularTarget?.total.toFixed(2)}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => { if (anularTarget) { cambiarEstado(anularTarget.id, 'cancelado'); setAnularTarget(null); } }}>
              Sí, anular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
