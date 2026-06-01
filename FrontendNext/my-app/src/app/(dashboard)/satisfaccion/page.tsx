"use client";

import { useMemo, useState } from 'react';
import {
  Star, MessageSquare, ThumbsUp, Frown, Meh, Smile, Heart,
  TrendingUp, Award, Users, BarChart2, Download, Sparkles, Loader2,
  Copy, Check, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, RadialBarChart, RadialBar,
} from 'recharts';
import { useAppStore } from '@/store/appStore';
import { toast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/* ── Datos mock base (representan historial previo) ── */
const MOCK_RESPONSES = [
  { id: 'ENC-MOCK-001', saleId: 'V-2041', date: '2024-06-10T10:15:00Z', rating: 5, comment: 'Increíble la rapidez con la que el bot me ayudó a encontrar mi talla.' },
  { id: 'ENC-MOCK-002', saleId: 'V-2040', date: '2024-06-10T09:30:00Z', rating: 5, comment: 'La calidad del algodón pima es superior. Muy contenta con mi compra.' },
  { id: 'ENC-MOCK-003', saleId: 'V-2039', date: '2024-06-09T18:45:00Z', rating: 3, comment: 'El envío a Chincha demoró un poco más de lo esperado.' },
  { id: 'ENC-MOCK-004', saleId: 'V-2038', date: '2024-06-09T14:00:00Z', rating: 4, comment: 'Buena atención, precios justos. Volvería a comprar.' },
  { id: 'ENC-MOCK-005', saleId: 'V-2037', date: '2024-06-08T12:20:00Z', rating: 5, comment: 'El chatbot es muy amable y resolvió todas mis dudas.' },
  { id: 'ENC-MOCK-006', saleId: 'V-2036', date: '2024-06-08T10:00:00Z', rating: 4, comment: 'Excelente variedad de productos.' },
  { id: 'ENC-MOCK-007', saleId: 'V-2035', date: '2024-06-07T16:30:00Z', rating: 2, comment: 'El talle no era el correcto, tuve que devolverlo.' },
  { id: 'ENC-MOCK-008', saleId: 'V-2034', date: '2024-06-07T11:00:00Z', rating: 5, comment: 'Súper recomendado. La ropa llegó perfectamente embalada.' },
];

const SENTIMENT_ICONS: Record<number, { icon: typeof Smile; color: string; label: string }> = {
  5: { icon: Heart,  color: 'text-rose-500',   label: 'Muy satisfecho'   },
  4: { icon: Smile,  color: 'text-emerald-500', label: 'Satisfecho'       },
  3: { icon: Meh,    color: 'text-amber-500',   label: 'Regular'          },
  2: { icon: Frown,  color: 'text-orange-500',  label: 'Insatisfecho'     },
  1: { icon: Frown,  color: 'text-destructive',  label: 'Muy insatisfecho' },
};

const STAR_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#10b981'];

type SentimentResult = {
  id: string;
  sentiment: 'positivo' | 'negativo' | 'sugerencia' | 'neutro';
  topic: string;
  summary: string;
};

type SurveyResponseResult = {
  response:    string;
  tone:        'empathetic' | 'apologetic' | 'grateful' | 'informative';
  actionItems: string[];
};

const TONE_LABELS: Record<string, { label: string; color: string }> = {
  empathetic:  { label: 'Empático',    color: 'bg-blue-100 text-blue-700 border-blue-200'     },
  apologetic:  { label: 'Disculpa',    color: 'bg-red-100 text-red-700 border-red-200'        },
  grateful:    { label: 'Gratitud',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  informative: { label: 'Informativo', color: 'bg-violet-100 text-violet-700 border-violet-200' },
};

const SENTIMENT_COLORS: Record<string, string> = {
  positivo:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  negativo:   'bg-red-100 text-red-700 border-red-200',
  sugerencia: 'bg-blue-100 text-blue-700 border-blue-200',
  neutro:     'bg-slate-100 text-slate-600 border-slate-200',
};

export default function SatisfaccionPage() {
  const liveResponses = useAppStore((s) => s.surveyResponses);
  const allResponses  = useMemo(() => [...liveResponses, ...MOCK_RESPONSES], [liveResponses]);

  /* ── IA Sentiment state ── */
  const [sentimentMap, setSentimentMap]   = useState<Map<string, SentimentResult>>(new Map());
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [globalInsight, setGlobalInsight] = useState('');

  /* ── IA Survey Response state ── */
  const [responseMap, setResponseMap]       = useState<Map<string, SurveyResponseResult>>(new Map());
  const [responseLoading, setResponseLoading] = useState<string | null>(null);
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);
  const [copiedId, setCopiedId]             = useState<string | null>(null);

  const handleGenerateResponse = async (r: { id: string; rating: number; comment: string }) => {
    setResponseLoading(r.id);
    const aiData = sentimentMap.get(r.id);
    try {
      const res = await fetch('/api/ai/survey-response', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ rating: r.rating, comment: r.comment, topic: aiData?.topic }),
      });
      const data = await res.json() as SurveyResponseResult;
      setResponseMap((prev) => new Map(prev).set(r.id, data));
      setExpandedResponse(r.id);
    } catch {
      toast({ title: 'Error al generar respuesta', variant: 'destructive' });
    } finally {
      setResponseLoading(null);
    }
  };

  const handleCopyResponse = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: 'Respuesta copiada al portapapeles' });
  };

  const handleAnalyzeSentiment = async () => {
    setSentimentLoading(true);
    const toAnalyze = allResponses
      .filter(r => r.comment && r.comment.trim().length > 5)
      .slice(0, 10)
      .map(r => ({ id: r.id, rating: r.rating, comment: r.comment }));

    try {
      const res  = await fetch('/api/ai/sentiment', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ comments: toAnalyze }),
      });
      const data = await res.json();
      if (data.results) {
        const map = new Map<string, SentimentResult>();
        (data.results as SentimentResult[]).forEach(r => map.set(r.id, r));
        setSentimentMap(map);
      }
      if (data.globalInsight) setGlobalInsight(data.globalInsight);
    } catch {
      toast({ title: 'Error al analizar sentimiento', variant: 'destructive' });
    } finally {
      setSentimentLoading(false);
    }
  };

  /* ── Métricas calculadas ── */
  const avgRating = useMemo(() => {
    if (allResponses.length === 0) return 0;
    return allResponses.reduce((s, r) => s + r.rating, 0) / allResponses.length;
  }, [allResponses]);

  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // index 0 = 1 estrella … index 4 = 5 estrellas
    allResponses.forEach((r) => { counts[r.rating - 1]++; });
    return [1, 2, 3, 4, 5].map((star, i) => ({
      star,
      count: counts[i],
      pct: allResponses.length > 0 ? Math.round((counts[i] / allResponses.length) * 100) : 0,
      fill: STAR_COLORS[i],
    }));
  }, [allResponses]);

  const pieData = useMemo(() => [
    { name: 'Excelente (5★)', value: distribution[4].pct, color: '#10b981' },
    { name: 'Bueno (4★)',     value: distribution[3].pct, color: '#2563eb' },
    { name: 'Regular (3★)',   value: distribution[2].pct, color: '#f59e0b' },
    { name: 'Malo (1-2★)',    value: distribution[0].pct + distribution[1].pct, color: '#ef4444' },
  ].filter((d) => d.value > 0), [distribution]);

  // NPS: Promotores (5★) - Detractores (1-2★)
  const promotores  = allResponses.filter((r) => r.rating === 5).length;
  const detractores = allResponses.filter((r) => r.rating <= 2).length;
  const nps = allResponses.length > 0
    ? Math.round(((promotores - detractores) / allResponses.length) * 100)
    : 0;

  const feedbackAspectos = [
    { aspect: 'Atención IA',    score: 4.8 },
    { aspect: 'Calidad Tela',   score: 4.5 },
    { aspect: 'Rapidez Envío',  score: 3.9 },
    { aspect: 'Precios',        score: 4.2 },
    { aspect: 'Facilidad Web',  score: 4.6 },
  ];

  /* ── PDF Export ── */
  const handleExport = () => {
    toast({ title: 'Generando reporte de satisfacción…' });
    const doc = new jsPDF() as any;
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, 210, 38, 'F');
    doc.setFontSize(18); doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
    doc.text('PAT-LI TEXTILES', 20, 15);
    doc.setFontSize(11); doc.setFont('helvetica', 'normal');
    doc.text('Reporte de Satisfacción del Cliente', 20, 24);
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, 20, 32);

    doc.setFontSize(13); doc.setTextColor(30, 58, 95); doc.setFont('helvetica', 'bold');
    doc.text('Métricas Generales', 20, 52);
    doc.autoTable({
      startY: 57,
      head: [['Indicador', 'Valor']],
      body: [
        ['Total Encuestas',   String(allResponses.length)],
        ['Calificación Promedio', `${avgRating.toFixed(2)} / 5.00`],
        ['NPS Score',          String(nps)],
        ['Promotores (5★)',   String(promotores)],
        ['Detractores (1-2★)',String(detractores)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 95], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      tableWidth: 100,
    });

    let y = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(13); doc.setTextColor(30, 58, 95); doc.setFont('helvetica', 'bold');
    doc.text('Distribución por Estrellas', 20, y);
    doc.autoTable({
      startY: y + 5,
      head: [['Estrellas', 'Cantidad', '%']],
      body: [...distribution].reverse().map((d) => [`${d.star}★`, d.count, `${d.pct}%`]),
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], textColor: 30 },
      tableWidth: 100,
    });

    y = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(13); doc.setTextColor(30, 58, 95); doc.setFont('helvetica', 'bold');
    doc.text('Últimos Comentarios', 20, y);
    doc.autoTable({
      startY: y + 5,
      head: [['ID', 'Calif.', 'Comentario', 'Fecha']],
      body: allResponses.slice(0, 10).map((r) => [
        r.id,
        `${r.rating}★`,
        r.comment.slice(0, 60) + (r.comment.length > 60 ? '…' : ''),
        new Date(r.date).toLocaleDateString('es-PE'),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [30, 58, 95], textColor: 255 },
      bodyStyles: { fontSize: 9 },
    });

    doc.setFontSize(8); doc.setTextColor(150);
    doc.text('PAT-LI Textiles — Reporte de Satisfacción | Confidencial', 20, 290);
    doc.save('satisfaccion_patli.pdf');
    toast({ title: 'Reporte descargado correctamente' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-md">
            <Star className="h-5 w-5 text-white fill-white" />
          </div>
          <div>
            <h1 className="page-title">Satisfacción del Cliente</h1>
            <p className="page-subtitle">Retroalimentación y encuestas post-compra en tiempo real</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {liveResponses.length > 0 && (
            <Badge className="bg-emerald-500 text-white gap-1.5 px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              {liveResponses.length} nuevas en esta sesión
            </Badge>
          )}
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="h-1 bg-amber-400 w-full" />
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 rounded-xl"><Award className="h-5 w-5 text-amber-500" /></div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Promedio General</p>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-slate-900">{avgRating.toFixed(1)}</h3>
              <span className="text-slate-400 text-sm mb-1">/ 5.0</span>
            </div>
            <div className="flex mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <div className="h-1 bg-primary w-full" />
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/8 rounded-xl"><Users className="h-5 w-5 text-primary" /></div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Encuestas</p>
            </div>
            <h3 className="text-3xl font-black text-slate-900">{allResponses.length}</h3>
            <p className="text-[11px] text-slate-400 mt-1">{liveResponses.length} en esta sesión</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <div className="h-1 bg-emerald-500 w-full" />
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 rounded-xl"><ThumbsUp className="h-5 w-5 text-emerald-600" /></div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">NPS Score</p>
            </div>
            <h3 className="text-3xl font-black text-slate-900">{nps}</h3>
            <p className="text-[11px] mt-1 font-bold text-emerald-600">
              {nps >= 50 ? 'Excelente' : nps >= 0 ? 'Bueno' : 'Por mejorar'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <div className="h-1 bg-secondary w-full" />
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-secondary/10 rounded-xl"><TrendingUp className="h-5 w-5 text-secondary" /></div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Promotores</p>
            </div>
            <h3 className="text-3xl font-black text-slate-900">{promotores}</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {allResponses.length > 0 ? Math.round((promotores / allResponses.length) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución de estrellas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribución de Estrellas</CardTitle>
            <CardDescription className="text-xs">{allResponses.length} encuestas totales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {[...distribution].reverse().map((d) => (
              <div key={d.star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12 shrink-0">
                  <span className="text-xs font-bold text-slate-600">{d.star}</span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1">
                  <Progress value={d.pct} className="h-2" style={{ '--progress-bg': d.fill } as React.CSSProperties} />
                </div>
                <div className="flex items-center gap-1 w-16 shrink-0 text-right">
                  <span className="text-xs font-bold text-slate-700">{d.count}</span>
                  <span className="text-[10px] text-slate-400">({d.pct}%)</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sentimiento General</CardTitle>
            <CardDescription className="text-xs">Distribución de calificaciones</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-1.5 mt-2">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-[11px] text-slate-500 flex-1">{d.name}</span>
                  <span className="text-xs font-bold">{d.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Desempeño por Categoría</CardTitle>
            <CardDescription className="text-xs">Puntajes promedio por aspecto</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feedbackAspectos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 5]} hide />
                <YAxis dataKey="aspect" type="category" axisLine={false} tickLine={false} width={90} tick={{ fontSize: 11, fontWeight: 500 }} />
                <Tooltip formatter={(v: number) => [`${v} / 5`, 'Puntaje']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="score" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={16}>
                  {feedbackAspectos.map((d, i) => (
                    <Cell key={i} fill={d.score >= 4.5 ? '#10b981' : d.score >= 4 ? '#2563eb' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Comentarios recientes + IA Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Comentarios Recientes</CardTitle>
              <CardDescription className="text-xs">Lo que dicen nuestros clientes</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{allResponses.length} total</Badge>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs h-7 border-violet-200 text-violet-700 hover:bg-violet-50"
                onClick={handleAnalyzeSentiment}
                disabled={sentimentLoading}
              >
                {sentimentLoading
                  ? <><Loader2 className="h-3 w-3 animate-spin" /> Analizando…</>
                  : <><Sparkles className="h-3 w-3" /> Analizar IA</>
                }
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {allResponses.slice(0, 10).map((r) => {
              const meta        = SENTIMENT_ICONS[r.rating] ?? SENTIMENT_ICONS[3];
              const Icon        = meta.icon;
              const isLive      = liveResponses.some((lr) => lr.id === r.id);
              const aiData      = sentimentMap.get(r.id);
              const aiResponse  = responseMap.get(r.id);
              const isExpanded  = expandedResponse === r.id;
              const isRespLoading = responseLoading === r.id;
              const needsResponse = r.rating <= 3;
              return (
                <div key={r.id} className={`rounded-xl border transition-colors ${isLive ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-100 hover:bg-slate-50'}`}>
                  <div className="flex gap-3 p-3.5">
                    <div className={`w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 ${meta.color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-700">{isLive ? 'Cliente Web' : `Reseña #${r.id.slice(-4)}`}</span>
                          {isLive && <Badge className="bg-emerald-500 text-white text-[9px] h-4 px-1.5">Nuevo</Badge>}
                          {aiData && (
                            <>
                              <Badge variant="outline" className={`text-[9px] h-4 px-1.5 border ${SENTIMENT_COLORS[aiData.sentiment]}`}>
                                {aiData.sentiment}
                              </Badge>
                              <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-violet-50 text-violet-600 border-violet-200">
                                {aiData.topic}
                              </Badge>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`h-3 w-3 ${s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                            ))}
                          </div>
                          {needsResponse && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-[10px] gap-1 border-orange-200 text-orange-600 hover:bg-orange-50"
                              onClick={() => aiResponse ? setExpandedResponse(isExpanded ? null : r.id) : handleGenerateResponse(r)}
                              disabled={isRespLoading}
                            >
                              {isRespLoading
                                ? <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                : aiResponse
                                  ? isExpanded ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />
                                  : <Sparkles className="h-2.5 w-2.5" />
                              }
                              {isRespLoading ? 'Generando…' : aiResponse ? 'Ver respuesta' : 'Responder IA'}
                            </Button>
                          )}
                        </div>
                      </div>
                      {r.comment && <p className="text-xs text-slate-600 italic leading-relaxed">"{r.comment}"</p>}
                      {aiData && (
                        <p className="text-[10px] text-violet-600 mt-1 flex items-center gap-1">
                          <Sparkles className="h-2.5 w-2.5" /> {aiData.summary}
                        </p>
                      )}
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block">
                        {new Date(r.date).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>

                  {/* AI Response Panel */}
                  {aiResponse && isExpanded && (
                    <div className="mx-3 mb-3 p-3 rounded-xl bg-orange-50 border border-orange-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3 text-orange-500" />
                          <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Respuesta sugerida por IA</span>
                          <Badge variant="outline" className={`text-[9px] h-4 px-1.5 border ${TONE_LABELS[aiResponse.tone]?.color}`}>
                            {TONE_LABELS[aiResponse.tone]?.label}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-[10px] gap-1 hover:bg-orange-100"
                          onClick={() => handleCopyResponse(r.id, aiResponse.response)}
                        >
                          {copiedId === r.id
                            ? <><Check className="h-2.5 w-2.5 text-emerald-600" /> Copiado</>
                            : <><Copy className="h-2.5 w-2.5" /> Copiar</>
                          }
                        </Button>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed italic">"{aiResponse.response}"</p>
                      {aiResponse.actionItems.length > 0 && (
                        <div className="pt-2 border-t border-orange-200">
                          <p className="text-[10px] font-black text-orange-600 uppercase mb-1">Acciones internas recomendadas</p>
                          <ul className="space-y-0.5">
                            {aiResponse.actionItems.map((item, i) => (
                              <li key={i} className="text-[10px] text-slate-600 flex items-start gap-1.5">
                                <span className="text-orange-400 font-bold mt-0.5">→</span> {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary text-primary-foreground">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">IA Insights</CardTitle>
            <CardDescription className="text-primary-foreground/70 text-xs">Análisis automático de tendencias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-4">
              <div className="flex gap-3">
                <TrendingUp className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">El interés por la nueva colección de verano subió un 15% en comentarios positivos.</p>
              </div>
              <div className="flex gap-3">
                <Frown className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">Un 8% menciona tiempos de entrega lentos hacia la zona de Parcona — revisar logística.</p>
              </div>
              <div className="flex gap-3">
                <ThumbsUp className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">La atención de PAT-LI Bot es calificada como "muy humana" en el 90% de interacciones.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-primary-foreground/10 space-y-3">
              <p className="text-[10px] font-bold uppercase opacity-60">NPS Breakdown</p>
              <div className="flex justify-between text-xs">
                <div className="text-center">
                  <p className="font-black text-emerald-400 text-lg">{promotores}</p>
                  <p className="opacity-60 text-[10px]">Promotores</p>
                </div>
                <div className="text-center">
                  <p className="font-black text-amber-400 text-lg">{allResponses.filter((r) => r.rating === 3).length}</p>
                  <p className="opacity-60 text-[10px]">Neutros</p>
                </div>
                <div className="text-center">
                  <p className="font-black text-rose-400 text-lg">{detractores}</p>
                  <p className="opacity-60 text-[10px]">Detractores</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-primary-foreground/10">
              <p className="text-[10px] font-bold uppercase opacity-60 mb-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Patrón detectado por IA
              </p>
              {sentimentLoading ? (
                <div className="flex items-center gap-2 opacity-70">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <p className="text-xs">Analizando comentarios…</p>
                </div>
              ) : globalInsight ? (
                <p className="text-xs italic leading-relaxed opacity-90">"{globalInsight}"</p>
              ) : (
                <p className="text-xs italic leading-relaxed opacity-90">
                  "Presiona 'Analizar IA' en los comentarios para obtener insights en tiempo real."
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

