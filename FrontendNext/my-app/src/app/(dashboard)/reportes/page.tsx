
"use client";

import { useMemo, useState } from 'react';
import {
  TrendingUp, Calendar, Download, Star, ShoppingBag,
  Package, FileText, Users, Zap, BarChart2, ArrowUpRight, ArrowDownRight,
  Filter, Printer, Sparkles, Loader2, CheckCircle2, AlertTriangle, RefreshCw,
  GitCompare, X, Table2,
} from 'lucide-react';
import type { NarrativeReportOutput } from '@/ai/flows/admin-narrative-report-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, Line, LineChart, Area, AreaChart,
  Cell, Pie, PieChart, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { toast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

/* ── Static rich mock data ── */
const MONTHLY_DATA = [
  { mes: 'Ene', ventas: 18200, pedidos: 89,  clientes: 72,  chatbot: 310, satisfaccion: 4.2 },
  { mes: 'Feb', ventas: 19500, pedidos: 95,  clientes: 80,  chatbot: 340, satisfaccion: 4.3 },
  { mes: 'Mar', ventas: 22100, pedidos: 112, clientes: 95,  chatbot: 390, satisfaccion: 4.4 },
  { mes: 'Abr', ventas: 20800, pedidos: 104, clientes: 88,  chatbot: 365, satisfaccion: 4.3 },
  { mes: 'May', ventas: 23400, pedidos: 121, clientes: 103, chatbot: 418, satisfaccion: 4.5 },
  { mes: 'Jun', ventas: 25100, pedidos: 132, clientes: 115, chatbot: 452, satisfaccion: 4.6 },
  { mes: 'Jul', ventas: 24200, pedidos: 125, clientes: 108, chatbot: 435, satisfaccion: 4.5 },
  { mes: 'Ago', ventas: 27300, pedidos: 141, clientes: 124, chatbot: 490, satisfaccion: 4.7 },
  { mes: 'Sep', ventas: 25800, pedidos: 133, clientes: 116, chatbot: 470, satisfaccion: 4.6 },
  { mes: 'Oct', ventas: 28600, pedidos: 152, clientes: 135, chatbot: 520, satisfaccion: 4.7 },
  { mes: 'Nov', ventas: 31200, pedidos: 168, clientes: 148, chatbot: 572, satisfaccion: 4.8 },
  { mes: 'Dic', ventas: 34800, pedidos: 188, clientes: 165, chatbot: 624, satisfaccion: 4.9 },
];

const COMPARISON_DATA = [
  { name: 'Lun', actual: 3200, previo: 2400 },
  { name: 'Mar', actual: 4100, previo: 3100 },
  { name: 'Mie', actual: 3800, previo: 2900 },
  { name: 'Jue', actual: 4400, previo: 3600 },
  { name: 'Vie', actual: 5200, previo: 4100 },
  { name: 'Sab', actual: 7800, previo: 6200 },
  { name: 'Dom', actual: 6500, previo: 5400 },
];

const SOURCE_DATA = [
  { name: 'Chatbot IA',     value: 45, color: '#1e3a5f' },
  { name: 'Redes Sociales', value: 25, color: '#2563eb' },
  { name: 'Tienda Física',  value: 20, color: '#f59e0b' },
  { name: 'Referidos',      value: 10, color: '#10b981' },
];

const CATEGORY_SALES = [
  { cat: 'Caballeros',  ventas: 9820,  unidades: 248, color: '#1e3a5f' },
  { cat: 'Damas',       ventas: 8540,  unidades: 214, color: '#2563eb' },
  { cat: 'Deportivo',   ventas: 5230,  unidades: 187, color: '#10b981' },
  { cat: 'Accesorios',  ventas: 3640,  unidades: 312, color: '#f59e0b' },
  { cat: 'Niños',       ventas: 2890,  unidades: 156, color: '#8b5cf6' },
  { cat: 'Bebés',       ventas: 1760,  unidades: 98,  color: '#ec4899' },
];

const RADAR_DATA = [
  { subject: 'Ventas', A: 88, B: 70 },
  { subject: 'Stock',  A: 72, B: 85 },
  { subject: 'Chatbot',A: 95, B: 65 },
  { subject: 'Satisf.',A: 96, B: 78 },
  { subject: 'Leads',  A: 82, B: 60 },
  { subject: 'Pedidos',A: 91, B: 74 },
];

const BASE_TOP_PRODUCTS = [
  { id: 'polo-pima-blanco',          nombre: 'Polo Algodón Pima Blanco',   categoria: 'Caballeros', unidades: 87,  ingresos: 3915, margen: 38 },
  { id: 'jean-skinny-azul',          nombre: 'Jean Skinny Azul',           categoria: 'Caballeros', unidades: 45,  ingresos: 4275, margen: 42 },
  { id: 'vestido-lino-floral',       nombre: 'Vestido Lino Floral',        categoria: 'Damas',      unidades: 38,  ingresos: 3230, margen: 45 },
  { id: 'medias-pack-x3',            nombre: 'Medias Pack x3',             categoria: 'Accesorios', unidades: 112, ingresos: 2800, margen: 55 },
  { id: 'blusa-lino-floral',         nombre: 'Blusa Lino Floral',          categoria: 'Damas',      unidades: 29,  ingresos: 1885, margen: 40 },
  { id: 'leggings-deportivos-mujer', nombre: 'Leggings Deportivos',        categoria: 'Deportivo',  unidades: 22,  ingresos: 1540, margen: 44 },
  { id: 'sudadera-hoodie-gris',      nombre: 'Sudadera Hoodie Gris',       categoria: 'Caballeros', unidades: 18,  ingresos: 2160, margen: 38 },
  { id: 'casaca-bomber-negra',       nombre: 'Casaca Bomber Negra',        categoria: 'Caballeros', unidades: 14,  ingresos: 2100, margen: 46 },
];

const PERIODS = ['Este Mes', 'Últimos 3 Meses', 'Último Año'] as const;
type Period = typeof PERIODS[number];

export default function ReportesPage() {
  const [period, setPeriod] = useState<Period>('Último Año');
  const completedSales  = useAppStore((s) => s.completedSales);
  const products        = useAppStore((s) => s.products);
  const surveyResponses = useAppStore((s) => s.surveyResponses);

  /* ── Live metrics ── */
  const liveRevenue = useMemo(() => completedSales.reduce((s, v) => s + v.total, 0), [completedSales]);
  const totalRevenue = 280000 + liveRevenue;  // base anual + ventas web en vivo
  const avgTicket = completedSales.length > 0
    ? (liveRevenue / completedSales.length).toFixed(2)
    : '172.95';

  /* ── Stock stats ── */
  const stockStats = useMemo(() => ({
    total:    products.length,
    ok:       products.filter(p => p.stock >= 10).length,
    bajo:     products.filter(p => p.stock > 3 && p.stock < 10).length,
    critico:  products.filter(p => p.stock > 0 && p.stock <= 3).length,
    agotado:  products.filter(p => p.stock === 0).length,
  }), [products]);

  const stockChartData = useMemo(() => {
    const top15 = [...products].sort((a, b) => a.stock - b.stock).slice(0, 15);
    return top15.map(p => ({
      name: p.name.split(' ').slice(0, 2).join(' '),
      stock: p.stock,
      fill: p.stock === 0 ? '#ef4444' : p.stock <= 3 ? '#f97316' : p.stock < 10 ? '#f59e0b' : '#10b981',
    }));
  }, [products]);

  /* ── Survey satisfaction ── */
  const liveAvgRating = useMemo(() => {
    if (surveyResponses.length === 0) return 4.8;
    const sum = surveyResponses.reduce((acc, r) => acc + r.rating, 0);
    return (sum / surveyResponses.length).toFixed(1);
  }, [surveyResponses]);

  /* ── Top products merged with real sales ── */
  const topProducts = useMemo(() => {
    const liveMap = new Map<string, { unidades: number; ingresos: number }>();
    completedSales.forEach(sale => {
      sale.items.forEach(item => {
        const prev = liveMap.get(item.id) ?? { unidades: 0, ingresos: 0 };
        liveMap.set(item.id, {
          unidades: prev.unidades + item.quantity,
          ingresos: prev.ingresos + item.price * item.quantity,
        });
      });
    });

    const merged = BASE_TOP_PRODUCTS.map(p => {
      const live = liveMap.get(p.id);
      liveMap.delete(p.id);
      return { ...p, unidades: p.unidades + (live?.unidades ?? 0), ingresos: p.ingresos + (live?.ingresos ?? 0) };
    });

    liveMap.forEach((v, id) => {
      const prod = products.find(p => p.id === id);
      if (prod) merged.push({ id, nombre: prod.name, categoria: prod.category, unidades: v.unidades, ingresos: v.ingresos, margen: 40 });
    });

    return merged.sort((a, b) => b.ingresos - a.ingresos).slice(0, 8);
  }, [completedSales, products]);

  /* ── Monthly data sliced by period ── */
  const chartData = useMemo(() => {
    if (period === 'Este Mes')         return MONTHLY_DATA.slice(-1);
    if (period === 'Últimos 3 Meses')  return MONTHLY_DATA.slice(-3);
    return MONTHLY_DATA;
  }, [period]);

  const totalSalesYear   = MONTHLY_DATA.reduce((s, d) => s + d.ventas, 0);
  const totalOrdersYear  = MONTHLY_DATA.reduce((s, d) => s + d.pedidos, 0);
  const totalClientsYear = MONTHLY_DATA.reduce((s, d) => s + d.clientes, 0);

  const currentMonthData = MONTHLY_DATA[MONTHLY_DATA.length - 1];
  const prevMonthData    = MONTHLY_DATA[MONTHLY_DATA.length - 2];

  /* ── Period comparison ── */
  const [compareMode, setCompareMode] = useState(false);

  const pctChange = (current: number, prev: number) => {
    const diff = ((current - prev) / prev) * 100;
    return { diff, label: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`, positive: diff >= 0 };
  };

  const currentTicket = currentMonthData.pedidos > 0
    ? currentMonthData.ventas / currentMonthData.pedidos
    : 0;
  const prevTicket = prevMonthData.pedidos > 0
    ? prevMonthData.ventas / prevMonthData.pedidos
    : 0;

  const compareKPIs = [
    {
      label: 'Ingresos',
      current: currentMonthData.ventas,
      prev: prevMonthData.ventas,
      format: (v: number) => `S/ ${v.toLocaleString()}`,
      icon: ShoppingBag,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Pedidos',
      current: currentMonthData.pedidos,
      prev: prevMonthData.pedidos,
      format: (v: number) => `${v}`,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Clientes Nuevos',
      current: currentMonthData.clientes,
      prev: prevMonthData.clientes,
      format: (v: number) => `${v}`,
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Ticket Promedio',
      current: currentTicket,
      prev: prevTicket,
      format: (v: number) => `S/ ${v.toFixed(0)}`,
      icon: TrendingUp,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Satisfacción',
      current: currentMonthData.satisfaccion,
      prev: prevMonthData.satisfaccion,
      format: (v: number) => `${v.toFixed(1)}/5`,
      icon: Star,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Sesiones Bot',
      current: currentMonthData.chatbot,
      prev: prevMonthData.chatbot,
      format: (v: number) => `${v}`,
      icon: Zap,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
  ];

  /* ── Narrative Report IA ── */
  const [narrative, setNarrative]             = useState<NarrativeReportOutput | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);

  const handleGenerateNarrative = async () => {
    setNarrativeLoading(true);
    try {
      const res = await fetch('/api/ai/narrative-report', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month:           'Diciembre 2025',
          totalRevenue:    currentMonthData.ventas + liveRevenue,
          prevRevenue:     prevMonthData.ventas,
          totalOrders:     currentMonthData.pedidos + completedSales.length,
          newClients:      currentMonthData.clientes,
          avgSatisfaction: typeof liveAvgRating === 'string' ? parseFloat(liveAvgRating) : liveAvgRating,
          topProducts:     topProducts.slice(0, 3).map(p => ({ nombre: p.nombre, ingresos: p.ingresos })),
          criticalStock:   stockStats.critico + stockStats.agotado,
          webOrders:       completedSales.length,
          chatbotSessions: currentMonthData.chatbot,
          goalPct:         Math.min(Math.round(((currentMonthData.ventas + liveRevenue) / 35000) * 100), 100),
        }),
      });
      const data = await res.json() as NarrativeReportOutput;
      setNarrative(data);
    } catch {
      toast({ title: 'Error al generar el informe narrativo', variant: 'destructive' });
    } finally {
      setNarrativeLoading(false);
    }
  };

  /* ── PDF Export ── */
  const handleExport = () => {
    toast({ title: 'Generando reporte completo…', description: 'Compilando todos los módulos analíticos.' });
    const doc = new jsPDF() as any;

    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, 210, 42, 'F');
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 42, 210, 3, 'F');
    doc.setFontSize(22); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
    doc.text('PAT-LI TEXTILES', 20, 17);
    doc.setFontSize(12); doc.setFont('helvetica', 'normal');
    doc.text('Reporte de Inteligencia de Negocio — Análisis Completo', 20, 28);
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')} | Período: ${period}`, 20, 37);

    // KPIs
    doc.setFontSize(13); doc.setTextColor(30, 58, 95); doc.setFont('helvetica', 'bold');
    doc.text('Indicadores Clave de Desempeño (KPIs)', 20, 57);
    doc.autoTable({
      startY: 62,
      head: [['KPI', 'Valor Actual', 'Variación', 'Meta']],
      body: [
        ['Ingresos Totales Año',    `S/ ${totalSalesYear.toLocaleString()}`, '+12.8%',  `S/ 320,000`],
        ['Pedidos Totales',         `${totalOrdersYear + completedSales.length}`, '+8.2%', '1,800'],
        ['Clientes Nuevos',         `${totalClientsYear}`, '+15.4%', '1,400'],
        ['Ticket Promedio',         `S/ ${avgTicket}`, '+8.5%', 'S/ 180'],
        ['Satisfacción Promedio',   `${liveAvgRating} / 5`, '+0.3 pts', '≥ 4.5'],
        ['Conversión Chatbot',      '24.5%', '+4.2%', '≥ 20%'],
        ['Stock Crítico / Agotado', `${stockStats.critico + stockStats.agotado} productos`, '—', '< 5'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 248, 255] },
    });

    // Monthly
    let y = doc.lastAutoTable.finalY + 12;
    if (y > 230) { doc.addPage(); y = 20; }
    doc.setFontSize(13); doc.setTextColor(30, 58, 95); doc.setFont('helvetica', 'bold');
    doc.text('Evolución Mensual de Ventas y Pedidos', 20, y);
    doc.autoTable({
      startY: y + 5,
      head: [['Mes', 'Ventas (S/)', 'Pedidos', 'Clientes Nuevos', 'Satisfacción']],
      body: MONTHLY_DATA.map(d => [d.mes, `S/ ${d.ventas.toLocaleString()}`, d.pedidos, d.clientes, `${d.satisfaccion}/5`]),
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], textColor: 30, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
    });

    // Top products
    y = doc.lastAutoTable.finalY + 12;
    if (y > 230) { doc.addPage(); y = 20; }
    doc.setFontSize(13); doc.setTextColor(30, 58, 95); doc.setFont('helvetica', 'bold');
    doc.text('Top 8 Productos por Ingresos', 20, y);
    doc.autoTable({
      startY: y + 5,
      head: [['#', 'Producto', 'Categoría', 'Unidades', 'Ingresos (S/)', 'Margen']],
      body: topProducts.map((p, i) => [i + 1, p.nombre, p.categoria, p.unidades, `S/ ${p.ingresos.toLocaleString()}`, `${p.margen}%`]),
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 248, 255] },
    });

    // Category
    y = doc.lastAutoTable.finalY + 12;
    if (y > 230) { doc.addPage(); y = 20; }
    doc.setFontSize(13); doc.setTextColor(30, 58, 95); doc.setFont('helvetica', 'bold');
    doc.text('Ventas por Categoría', 20, y);
    doc.autoTable({
      startY: y + 5,
      head: [['Categoría', 'Ingresos (S/)', 'Unidades', '% del Total']],
      body: CATEGORY_SALES.map(c => [
        c.cat,
        `S/ ${c.ventas.toLocaleString()}`,
        c.unidades,
        `${Math.round((c.ventas / CATEGORY_SALES.reduce((s, x) => s + x.ventas, 0)) * 100)}%`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
    });

    // Stock
    y = doc.lastAutoTable.finalY + 12;
    if (y > 230) { doc.addPage(); y = 20; }
    doc.setFontSize(13); doc.setTextColor(30, 58, 95); doc.setFont('helvetica', 'bold');
    doc.text('Estado de Inventario', 20, y);
    doc.autoTable({
      startY: y + 5,
      head: [['Estado', 'Cantidad', '%']],
      body: [
        ['Stock Normal (≥10 ud.)',   stockStats.ok,      `${Math.round((stockStats.ok / stockStats.total) * 100)}%`],
        ['Stock Bajo (4-9 ud.)',     stockStats.bajo,    `${Math.round((stockStats.bajo / stockStats.total) * 100)}%`],
        ['Stock Crítico (1-3 ud.)',  stockStats.critico, `${Math.round((stockStats.critico / stockStats.total) * 100)}%`],
        ['Agotado (0 ud.)',          stockStats.agotado, `${Math.round((stockStats.agotado / stockStats.total) * 100)}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
    });

    // Narrative IA
    if (narrative) {
      doc.addPage();
      doc.setFillColor(109, 40, 217);
      doc.rect(0, 0, 210, 18, 'F');
      doc.setFontSize(13); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
      doc.text('Informe Narrativo — Análisis IA Gemini', 20, 12);

      let ny = 28;
      doc.setFontSize(12); doc.setTextColor(109, 40, 217); doc.setFont('helvetica', 'bold');
      doc.text('Resumen Ejecutivo', 20, ny); ny += 7;
      doc.setFontSize(10); doc.setTextColor(50, 50, 50); doc.setFont('helvetica', 'normal');
      const summaryLines = doc.splitTextToSize(narrative.executiveSummary, 170);
      doc.text(summaryLines, 20, ny); ny += summaryLines.length * 5 + 8;

      doc.setFontSize(12); doc.setTextColor(16, 185, 129); doc.setFont('helvetica', 'bold');
      doc.text('Logros Destacados', 20, ny); ny += 7;
      doc.setFontSize(10); doc.setTextColor(50, 50, 50); doc.setFont('helvetica', 'normal');
      narrative.highlights.forEach(h => { doc.text(`✓ ${h}`, 24, ny); ny += 6; });
      ny += 4;

      doc.setFontSize(12); doc.setTextColor(239, 68, 68); doc.setFont('helvetica', 'bold');
      doc.text('Áreas de Atención', 20, ny); ny += 7;
      doc.setFontSize(10); doc.setTextColor(50, 50, 50); doc.setFont('helvetica', 'normal');
      narrative.concerns.forEach(c => { doc.text(`⚠ ${c}`, 24, ny); ny += 6; });
      ny += 4;

      doc.setFontSize(12); doc.setTextColor(37, 99, 235); doc.setFont('helvetica', 'bold');
      doc.text('Perspectiva Próximo Mes', 20, ny); ny += 7;
      doc.setFontSize(10); doc.setTextColor(50, 50, 50); doc.setFont('helvetica', 'normal');
      const outlookLines = doc.splitTextToSize(narrative.outlook, 170);
      doc.text(outlookLines, 20, ny);
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8); doc.setTextColor(150);
      doc.text(`PAT-LI Textiles — Inteligencia de Negocio | Página ${i} de ${pageCount}`, 20, 290);
    }
    doc.save('reporte_inteligencia_negocio_patli.pdf');
    setTimeout(() => toast({ title: '¡Reporte descargado!', description: 'Archivo guardado correctamente.' }), 1200);
  };

  /* ── CSV/Excel Export ── */
  const handleExportCSV = () => {
    const escape = (v: string | number) => {
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = (header: string[], data: (string | number)[][]) =>
      [header, ...data].map(r => r.map(escape).join(',')).join('\n');

    const kpiSection = rows(
      ['KPI', 'Valor Actual', 'Variación', 'Meta'],
      [
        ['Ingresos Totales Año',    `S/ ${totalSalesYear.toLocaleString()}`, '+12.8%',  'S/ 320,000'],
        ['Pedidos Totales',         `${totalOrdersYear + completedSales.length}`, '+8.2%', '1,800'],
        ['Clientes Nuevos',         `${totalClientsYear}`, '+15.4%', '1,400'],
        ['Ticket Promedio',         `S/ ${avgTicket}`, '+8.5%', 'S/ 180'],
        ['Satisfacción Promedio',   `${liveAvgRating} / 5`, '+0.3 pts', '>= 4.5'],
        ['Stock Crítico / Agotado', `${stockStats.critico + stockStats.agotado} productos`, '—', '< 5'],
      ]
    );

    const monthlySection = rows(
      ['Mes', 'Ventas (S/)', 'Pedidos', 'Clientes Nuevos', 'Satisfacción'],
      MONTHLY_DATA.map(d => [d.mes, d.ventas, d.pedidos, d.clientes, d.satisfaccion])
    );

    const productsSection = rows(
      ['#', 'Producto', 'Categoría', 'Unidades', 'Ingresos (S/)', 'Margen (%)'],
      topProducts.map((p, i) => [i + 1, p.nombre, p.categoria, p.unidades, p.ingresos, p.margen])
    );

    const categorySection = rows(
      ['Categoría', 'Ventas (S/)', 'Unidades'],
      CATEGORY_SALES.map(c => [c.cat, c.ventas, c.unidades])
    );

    const csv = [
      'PAT-LI TEXTILES — Reporte de Inteligencia de Negocio',
      `Generado: ${new Date().toLocaleString('es-PE')} | Período: ${period}`,
      '',
      'INDICADORES CLAVE (KPIs)',
      kpiSection,
      '',
      'EVOLUCIÓN MENSUAL',
      monthlySection,
      '',
      'TOP PRODUCTOS POR INGRESOS',
      productsSection,
      '',
      'VENTAS POR CATEGORÍA',
      categorySection,
    ].join('\n');

    const bom = '﻿';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `reporte_patli_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: '¡Excel CSV descargado!', description: 'Abre el archivo con Excel o Google Sheets.' });
  };

  const kpiCards = [
    { label: 'Ingresos Año',     value: `S/ ${(totalSalesYear / 1000).toFixed(0)}k`, trend: '+12.8%', icon: ShoppingBag, color: 'text-primary',     bg: 'bg-primary/8' },
    { label: 'Total Pedidos',    value: `${totalOrdersYear + completedSales.length}`, trend: '+8.2%',  icon: Package,    color: 'text-secondary',   bg: 'bg-secondary/10' },
    { label: 'Nuevos Clientes',  value: `${totalClientsYear}`, trend: '+15.4%',  icon: Users,       color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Conversión IA',    value: '24.5%',         trend: '+4.2%',  icon: Zap,         color: 'text-amber-600',   bg: 'bg-amber-50' },
    { label: 'Satisfacción',     value: `${liveAvgRating}/5`, trend: '+0.3',   icon: Star,        color: 'text-yellow-600',  bg: 'bg-yellow-50' },
    { label: 'Eficiencia Bot',   value: '92%',           trend: '+1.5%',  icon: BarChart2,   color: 'text-violet-600',  bg: 'bg-violet-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inteligencia de Negocio</h1>
          <p className="text-slate-500">Análisis integral de desempeño — PAT-LI Textiles, Ica 2025</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-white">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'text-xs px-3 py-2 font-bold transition-colors',
                  period === p ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <Button
            variant={compareMode ? 'default' : 'outline'}
            className={cn('gap-2', compareMode && 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600')}
            onClick={() => setCompareMode(m => !m)}
          >
            <GitCompare className="h-4 w-4" />
            {compareMode ? 'Ocultar comparativa' : 'Comparar períodos'}
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Imprimir
          </Button>
          <Button variant="outline" className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50" onClick={handleExportCSV}>
            <Table2 className="h-4 w-4" /> Excel CSV
          </Button>
          <Button className="bg-primary text-white gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((k, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className={`w-8 h-8 rounded-lg ${k.bg} ${k.color} flex items-center justify-center mb-3`}>
                <k.icon className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight mb-1">{k.label}</p>
              <p className="text-xl font-black text-slate-900">{k.value}</p>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                <ArrowUpRight className="h-3 w-3" />{k.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Period comparison panel */}
      {compareMode && (
        <Card className="border-none shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-300">
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-violet-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <GitCompare className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Comparativa de Períodos</CardTitle>
                  <CardDescription>
                    <span className="font-semibold text-slate-600">Nov 2025</span>
                    {' '}→{' '}
                    <span className="font-semibold text-indigo-600">Dic 2025</span>
                    {' '}· Variación mensual por KPI
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400" onClick={() => setCompareMode(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* KPI grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {compareKPIs.map((k, i) => {
                const { diff, label: pctLabel, positive } = pctChange(k.current, k.prev);
                return (
                  <div key={i} className="rounded-2xl border border-slate-100 bg-white p-3 hover:shadow-md transition-shadow">
                    <div className={`w-7 h-7 rounded-lg ${k.bg} ${k.color} flex items-center justify-center mb-2`}>
                      <k.icon className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{k.label}</p>
                    {/* Current month */}
                    <p className="text-lg font-black text-slate-900 leading-tight">{k.format(k.current)}</p>
                    {/* Previous month */}
                    <p className="text-[10px] text-slate-400 mt-0.5">vs {k.format(k.prev)}</p>
                    {/* Delta */}
                    <div className={cn(
                      'flex items-center gap-0.5 mt-1.5 text-[11px] font-black',
                      positive ? 'text-emerald-600' : 'text-red-500'
                    )}>
                      {positive
                        ? <ArrowUpRight className="h-3 w-3" />
                        : <ArrowDownRight className="h-3 w-3" />}
                      {pctLabel}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Side-by-side bar chart */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">Evolución últimos 6 meses — Ingresos (S/)</p>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MONTHLY_DATA.slice(-6)} barGap={3}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(v: number) => [`S/ ${v.toLocaleString()}`, 'Ingresos']}
                    />
                    <Bar dataKey="ventas" name="Ingresos" radius={[4, 4, 0, 0]}>
                      {MONTHLY_DATA.slice(-6).map((_, i, arr) => (
                        <Cell
                          key={i}
                          fill={i === arr.length - 1 ? '#4f46e5' : i === arr.length - 2 ? '#818cf8' : '#c7d2fe'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 mt-2 justify-center text-[10px] text-slate-500 font-medium">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-indigo-600" /> Dic (actual)</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-indigo-300" /> Nov (anterior)</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-indigo-100" /> Meses previos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Annual Revenue Area Chart */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg">Evolución de Ingresos Mensuales</CardTitle>
            <CardDescription>Ventas acumuladas, pedidos y nuevos clientes por mes — 2025</CardDescription>
          </div>
          <Badge className="bg-primary/10 text-primary border-none text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />+12.8% vs 2024
          </Badge>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1e3a5f" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gPedidos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                formatter={(v: number, name: string) =>
                  name === 'ventas' ? [`S/ ${v.toLocaleString()}`, 'Ventas'] : [v, name === 'pedidos' ? 'Pedidos' : 'Clientes']
                }
              />
              <Legend iconType="circle" />
              <Area type="monotone" dataKey="ventas"  name="ventas"  stroke="#1e3a5f" fill="url(#gVentas)"  strokeWidth={2.5} dot={false} />
              <Area type="monotone" dataKey="pedidos" name="pedidos" stroke="#f59e0b" fill="url(#gPedidos)" strokeWidth={2}   dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weekly comparison + source pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Ventas: Semana Actual vs Anterior</CardTitle>
            <CardDescription>Comparativa diaria de ingresos (S/)</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COMPARISON_DATA} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(v: number) => [`S/ ${v.toLocaleString()}`]} />
                <Legend iconType="circle" />
                <Bar dataKey="actual" name="Semana Actual" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="previo" name="Semana Previa" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Canales de Adquisición</CardTitle>
            <CardDescription>Distribución de nuevos clientes por origen</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] flex items-center">
            <div className="flex flex-col md:flex-row items-center w-full gap-4">
              <div className="w-full md:w-1/2 h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={SOURCE_DATA} cx="50%" cy="50%" innerRadius={52} outerRadius={76} paddingAngle={5} dataKey="value" strokeWidth={0}>
                      {SOURCE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v}%`, 'Participación']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-3 px-2">
                {SOURCE_DATA.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-medium text-slate-700">{item.name}</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">{item.value}%</span>
                    </div>
                    <Progress value={item.value} className="h-1.5" style={{ '--progress-color': item.color } as React.CSSProperties} />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category sales + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Ventas por Categoría</CardTitle>
            <CardDescription>Ingresos y unidades vendidas por línea de producto</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CATEGORY_SALES} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="cat" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={72} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} formatter={(v: number) => [`S/ ${v.toLocaleString()}`, 'Ventas']} />
                <Bar dataKey="ventas" radius={[0, 4, 4, 0]}>
                  {CATEGORY_SALES.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Análisis Comparativo</CardTitle>
            <CardDescription>PAT-LI vs promedio del sector textil</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="PAT-LI" dataKey="A" stroke="#1e3a5f" fill="#1e3a5f" fillOpacity={0.25} strokeWidth={2} />
                <Radar name="Sector" dataKey="B" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} strokeDasharray="4 4" />
                <Legend iconType="circle" />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Satisfaction trend */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base">Tendencia de Satisfacción del Cliente</CardTitle>
            <CardDescription>NPS mensual basado en encuestas post-compra y chatbot</CardDescription>
          </div>
          <div className="flex items-center gap-1.5">
            {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
            <span className="font-black text-slate-900 ml-1">{liveAvgRating}</span>
            {surveyResponses.length > 0 && (
              <Badge className="ml-2 bg-emerald-500/10 text-emerald-600 border-none text-[10px]">
                +{surveyResponses.length} encuestas en vivo
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MONTHLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis domain={[3.8, 5.0]} ticks={[4.0, 4.2, 4.4, 4.6, 4.8, 5.0]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} formatter={(v: number) => [`${v}/5`, 'Satisfacción']} />
              <Line type="monotone" dataKey="satisfaccion" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2 }} name="Satisfacción" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stock health + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Estado de Inventario</CardTitle>
              <CardDescription>Distribución de stock actual en tiempo real</CardDescription>
            </div>
            <Badge className={cn(
              'text-[10px] border-none',
              stockStats.agotado > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
            )}>
              {stockStats.agotado > 0 ? `${stockStats.agotado} agotados` : 'Stock saludable'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Normal',   count: stockStats.ok,       color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
                { label: 'Bajo',     count: stockStats.bajo,     color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500' },
                { label: 'Crítico',  count: stockStats.critico,  color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
                { label: 'Agotado',  count: stockStats.agotado,  color: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
              ].map((s, i) => (
                <div key={i} className={`rounded-xl p-3 ${s.color} flex items-center gap-3`}>
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
                  <div>
                    <p className="text-xs font-bold">{s.count}</p>
                    <p className="text-[10px] opacity-70">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockChartData} margin={{ bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#94a3b8' }} angle={-35} textAnchor="end" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} formatter={(v: number) => [v, 'Unidades']} />
                  <Bar dataKey="stock" radius={[3, 3, 0, 0]}>
                    {stockChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Top 8 Productos</CardTitle>
              <CardDescription>Ranking por ingresos generados (acumulado + ventas web)</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={handleExport}>
              <FileText className="h-3.5 w-3.5 mr-1" /> PDF
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100">
                  <TableHead className="text-xs w-6">#</TableHead>
                  <TableHead className="text-xs">Producto</TableHead>
                  <TableHead className="text-xs text-right">Und.</TableHead>
                  <TableHead className="text-xs text-right">Ingresos</TableHead>
                  <TableHead className="text-xs text-right">Margen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((p, i) => (
                  <TableRow key={i} className="border-slate-50">
                    <TableCell>
                      <div className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0',
                        i === 0 ? 'bg-amber-400 text-white' :
                        i === 1 ? 'bg-slate-300 text-slate-700' :
                        i === 2 ? 'bg-orange-300 text-white' : 'bg-slate-100 text-slate-500'
                      )}>{i + 1}</div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-xs leading-tight">{p.nombre}</p>
                      <p className="text-[9px] text-slate-400">{p.categoria}</p>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-right">{p.unidades}</TableCell>
                    <TableCell className="text-xs font-black text-primary text-right">S/ {p.ingresos.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-emerald-50 text-emerald-700 border-none text-[9px] px-1.5">{p.margen}%</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Chatbot performance */}
      <Card className="border-none shadow-sm pb-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Rendimiento del Chatbot PAT-LI Bot</CardTitle>
          <CardDescription>Actividad mensual de conversaciones e interacciones inteligentes</CardDescription>
        </CardHeader>
        <CardContent className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={period === 'Último Año' ? 18 : 40}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
              <Bar dataKey="chatbot" name="Conversaciones" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Informe Narrativo IA */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-50 rounded-xl">
                <FileText className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Informe Narrativo — Análisis IA</h3>
                <p className="text-xs text-slate-500">Gemini redacta el resumen ejecutivo del mes en prosa profesional</p>
              </div>
            </div>
            <Button
              onClick={handleGenerateNarrative}
              disabled={narrativeLoading}
              className="bg-violet-600 hover:bg-violet-700 text-white gap-2 shrink-0"
            >
              {narrativeLoading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Generando…</>
                : narrative
                  ? <><RefreshCw className="h-4 w-4" /> Re-generar</>
                  : <><Sparkles className="h-4 w-4" /> Generar Informe IA</>
              }
            </Button>
          </div>

          {!narrative && !narrativeLoading && (
            <div className="text-center py-8 text-slate-400">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Genera un informe ejecutivo narrativo del mes basado en los KPIs actuales.</p>
              <p className="text-xs mt-1 opacity-70">El informe también se incluirá en el PDF al exportar.</p>
            </div>
          )}

          {narrativeLoading && (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-violet-50 border border-violet-100 rounded-2xl space-y-2">
                <Skeleton className="h-3 w-28 bg-violet-200" />
                <Skeleton className="h-4 w-full bg-violet-100" />
                <Skeleton className="h-4 w-5/6 bg-violet-100" />
                <Skeleton className="h-4 w-4/5 bg-violet-100" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2">
                  <Skeleton className="h-3 w-24 bg-emerald-200" />
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-start gap-2">
                      <Skeleton className="h-3.5 w-3.5 rounded-full bg-emerald-200 shrink-0 mt-0.5" />
                      <Skeleton className="h-3 w-full bg-emerald-100" />
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-2">
                  <Skeleton className="h-3 w-28 bg-amber-200" />
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-start gap-2">
                      <Skeleton className="h-3.5 w-3.5 rounded-full bg-amber-200 shrink-0 mt-0.5" />
                      <Skeleton className="h-3 w-full bg-amber-100" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl space-y-2">
                <Skeleton className="h-3 w-36 bg-blue-200" />
                <Skeleton className="h-4 w-full bg-blue-100" />
                <Skeleton className="h-4 w-2/3 bg-blue-100" />
              </div>
            </div>
          )}

          {narrative && !narrativeLoading && (
            <div className="space-y-5">
              {/* Executive summary */}
              <div className="p-4 bg-violet-50 border border-violet-100 rounded-2xl">
                <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Resumen Ejecutivo
                </p>
                <p className="text-sm text-slate-800 leading-relaxed">{narrative.executiveSummary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Highlights */}
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">✓ Logros Destacados</p>
                  {narrative.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700">{h}</p>
                    </div>
                  ))}
                </div>

                {/* Concerns */}
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-2">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">⚠ Áreas de Atención</p>
                  {narrative.concerns.map((c, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700">{c}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outlook */}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">→ Perspectiva Próximo Mes</p>
                <p className="text-sm text-slate-700 italic leading-relaxed">"{narrative.outlook}"</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
