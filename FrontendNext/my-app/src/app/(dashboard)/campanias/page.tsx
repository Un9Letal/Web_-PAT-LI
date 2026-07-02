"use client";

import { useState, useMemo } from 'react';
import {
  Megaphone, Plus, Sparkles, Loader2, Calendar, Tag, Target,
  TrendingUp, Play, Pause, CheckCircle2, Trash2, Copy, Check,
  Zap, Globe, Mail, Share2, ChevronRight, Flame, Gift,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/appStore';
import type { Campaign, CampaignStatus } from '@/store/appStore';
import type { CampaignGeneratorOutput } from '@/ai/flows/admin-campaign-generator-flow';

// Fechas especiales predefinidas para generación rápida
const FECHAS_ESPECIALES = [
  { nombre: 'Black Friday',     emoji: '🛍️', color: 'from-slate-700 to-slate-900', fecha: '2026-11-27' },
  { nombre: 'CyberWow',         emoji: '💻', color: 'from-blue-600 to-indigo-700', fecha: '2026-07-15' },
  { nombre: 'Día de la Madre',  emoji: '🌷', color: 'from-pink-500 to-rose-600',   fecha: '2026-05-10' },
  { nombre: 'Día del Padre',    emoji: '👔', color: 'from-cyan-600 to-blue-700',   fecha: '2026-06-21' },
  { nombre: 'Fiestas Patrias',  emoji: '🇵🇪', color: 'from-red-500 to-red-700',     fecha: '2026-07-28' },
  { nombre: 'Navidad',          emoji: '🎄', color: 'from-emerald-600 to-green-700',fecha: '2026-12-20' },
  { nombre: 'San Valentín',     emoji: '💝', color: 'from-rose-500 to-pink-600',   fecha: '2026-02-14' },
  { nombre: 'Vuelta al Cole',   emoji: '🎒', color: 'from-amber-500 to-orange-600',fecha: '2026-03-01' },
];

const STATUS_META: Record<CampaignStatus, { label: string; cls: string; icon: typeof Play }> = {
  borrador:   { label: 'Borrador',   cls: 'bg-slate-100 text-slate-600',    icon: Tag },
  programada: { label: 'Programada', cls: 'bg-blue-100 text-blue-700',      icon: Calendar },
  activa:     { label: 'Activa',     cls: 'bg-emerald-100 text-emerald-700',icon: Play },
  finalizada: { label: 'Finalizada', cls: 'bg-slate-200 text-slate-500',    icon: CheckCircle2 },
};

const CANAL_ICON: Record<string, typeof Globe> = {
  'Web': Globe, 'Redes Sociales': Share2, 'Email': Mail, 'WhatsApp': Share2,
};

export default function CampaniasPage() {
  const campaigns           = useAppStore(s => s.campaigns);
  const addCampaign         = useAppStore(s => s.addCampaign);
  const updateCampaignStatus= useAppStore(s => s.updateCampaignStatus);
  const deleteCampaign      = useAppStore(s => s.deleteCampaign);
  const completedSales      = useAppStore(s => s.completedSales);

  const [genDialogOpen, setGenDialogOpen] = useState(false);
  const [generating, setGenerating]       = useState(false);
  const [aiResult, setAiResult]           = useState<CampaignGeneratorOutput | null>(null);
  const [selectedOcasion, setSelectedOcasion] = useState('');
  const [selectedFecha, setSelectedFecha]     = useState('');
  const [customOcasion, setCustomOcasion]     = useState('');
  const [copiedCopy, setCopiedCopy]           = useState(false);
  const [deleteTarget, setDeleteTarget]       = useState<Campaign | null>(null);

  // ── Métricas globales ──────────────────────────────────────────
  const activas      = campaigns.filter(c => c.estado === 'activa').length;
  const programadas  = campaigns.filter(c => c.estado === 'programada').length;
  const revenueTotal = campaigns.reduce((s, c) => s + c.ventasReales, 0) + completedSales.reduce((s, v) => s + v.total, 0);
  const metaTotal    = campaigns.reduce((s, c) => s + c.metaVentas, 0);
  const cumplimiento = metaTotal > 0 ? Math.round((revenueTotal / metaTotal) * 100) : 0;

  // ── Generar campaña con IA ─────────────────────────────────────
  const handleGenerate = async (ocasion: string, fecha?: string) => {
    setSelectedOcasion(ocasion);
    setSelectedFecha(fecha ?? '');
    setGenerating(true);
    setAiResult(null);
    try {
      const res = await fetch('/api/ai/campaign-generator', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ocasion,
          fecha,
          topProductos: ['Polo Algodón Pima', 'Jean Skinny', 'Vestido Lino Floral'],
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json() as CampaignGeneratorOutput;
      setAiResult(data);
      toast({ title: 'Campaña generada por Gemini', description: `"${data.nombre}" lista para revisar y publicar.` });
    } catch {
      toast({ title: 'Error al generar campaña', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveCampaign = (estado: CampaignStatus) => {
    if (!aiResult) return;
    const hoy = new Date();
    const fin = new Date(hoy); fin.setDate(fin.getDate() + 7);
    addCampaign({
      nombre:      aiResult.nombre,
      tipo:        selectedOcasion,
      descuento:   aiResult.descuentoSugerido,
      fechaInicio: selectedFecha || hoy.toISOString().split('T')[0],
      fechaFin:    fin.toISOString().split('T')[0],
      estado,
      canales:     aiResult.canalesSugeridos,
      categorias:  aiResult.categoriasSugeridas,
      metaVentas:  10000,
      copy:        aiResult.copy,
      emoji:       aiResult.emoji,
    });
    toast({ title: `Campaña ${estado === 'activa' ? 'publicada' : 'guardada'}`, description: `"${aiResult.nombre}" se agregó a tu gestión de campañas.` });
    setGenDialogOpen(false);
    setAiResult(null);
    setCustomOcasion('');
  };

  const handleCopyCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCopy(true);
    setTimeout(() => setCopiedCopy(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-md">
            <Megaphone className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Gestión de Campañas</h1>
            <p className="page-subtitle">Analiza, crea y publica campañas para fechas especiales con IA</p>
          </div>
        </div>
        <Button onClick={() => { setGenDialogOpen(true); setAiResult(null); }} className="gap-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:opacity-90 rounded-xl shadow-md">
          <Sparkles className="h-4 w-4" /> Generar Campaña IA
        </Button>
      </div>

      {/* ── KPIs ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Campañas Activas',    value: activas,                   sub: 'en ejecución ahora',     icon: Play,       grad: 'from-emerald-400 to-teal-600', valCls: 'text-emerald-700' },
          { label: 'Programadas',         value: programadas,               sub: 'próximas a lanzar',      icon: Calendar,   grad: 'from-blue-500 to-indigo-600',  valCls: 'text-blue-700' },
          { label: 'Revenue Campañas',    value: `S/ ${revenueTotal.toLocaleString()}`, sub: 'ventas atribuidas', icon: TrendingUp, grad: 'from-[#1e3a5f] to-[#2563eb]', valCls: 'text-slate-900' },
          { label: 'Cumplimiento Meta',   value: `${cumplimiento}%`,        sub: 'del objetivo global',    icon: Target,     grad: 'from-amber-400 to-orange-500', valCls: cumplimiento >= 100 ? 'text-emerald-700' : 'text-amber-700' },
        ].map((k, i) => (
          <div key={i} className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b ${k.grad}`} />
            <div className="p-4 pl-5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm mb-2.5 bg-gradient-to-br ${k.grad} text-white`}><k.icon className="h-4 w-4" /></div>
              <p className="section-label mb-1">{k.label}</p>
              <p className={`text-2xl font-black leading-none ${k.valCls}`}>{k.value}</p>
              <p className="text-[10px] text-slate-400 mt-1">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Generador rápido por días especiales ────────────────── */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500" />
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 rounded-xl">
              <Flame className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <CardTitle className="text-base">Generar Campaña por Día Especial</CardTitle>
              <CardDescription>Selecciona una fecha clave y deja que Gemini cree la campaña completa</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FECHAS_ESPECIALES.map((f) => (
              <button
                key={f.nombre}
                onClick={() => { setGenDialogOpen(true); handleGenerate(f.nombre, f.fecha); }}
                className={`relative overflow-hidden rounded-2xl p-4 text-left text-white bg-gradient-to-br ${f.color} hover:scale-[1.03] transition-transform shadow-sm group`}
              >
                <span className="text-2xl block mb-2">{f.emoji}</span>
                <p className="font-black text-sm leading-tight">{f.nombre}</p>
                <p className="text-[10px] opacity-70 mt-0.5">{new Date(f.fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}</p>
                <Sparkles className="absolute top-3 right-3 h-4 w-4 opacity-40 group-hover:opacity-90 transition-opacity" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Lista de campañas (gestión) ─────────────────────────── */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-[#1e3a5f] to-secondary" />
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/5 rounded-xl">
              <Megaphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Mis Campañas ({campaigns.length})</CardTitle>
              <CardDescription>Gestiona el estado, rendimiento y publicación de cada campaña</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {campaigns.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aún no tienes campañas. Genera una con IA para empezar.</p>
            </div>
          )}
          {campaigns.map((c) => {
            const meta = STATUS_META[c.estado];
            const progreso = c.metaVentas > 0 ? Math.min(Math.round((c.ventasReales / c.metaVentas) * 100), 100) : 0;
            return (
              <div key={c.id} className="rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-all overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-2xl shrink-0">
                        {c.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-slate-800">{c.nombre}</h3>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${meta.cls}`}>{meta.label}</span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">{c.descuento}% OFF</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {c.tipo} · {new Date(c.fechaInicio).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} → {new Date(c.fechaFin).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setDeleteTarget(c)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Copy de la campaña */}
                  <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100">
                    <p className="text-xs text-slate-600 italic leading-relaxed">{c.copy}</p>
                  </div>

                  {/* Canales + categorías */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {c.canales.map((canal) => {
                      const Icon = CANAL_ICON[canal] ?? Globe;
                      return (
                        <span key={canal} className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                          <Icon className="h-2.5 w-2.5" /> {canal}
                        </span>
                      );
                    })}
                    {c.categorias.map((cat) => (
                      <span key={cat} className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{cat}</span>
                    ))}
                  </div>

                  {/* Progreso de meta */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progreso de meta</span>
                      <span className="text-[10px] font-black text-slate-600">
                        S/ {c.ventasReales.toLocaleString()} / S/ {c.metaVentas.toLocaleString()} ({progreso}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${progreso >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-rose-500 to-pink-600'}`} style={{ width: `${progreso}%` }} />
                    </div>
                  </div>

                  {/* Acciones de estado */}
                  <div className="flex items-center gap-2">
                    {c.estado !== 'activa' && c.estado !== 'finalizada' && (
                      <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs h-8" onClick={() => updateCampaignStatus(c.id, 'activa')}>
                        <Play className="h-3 w-3" /> Activar
                      </Button>
                    )}
                    {c.estado === 'activa' && (
                      <>
                        <Button size="sm" variant="outline" className="gap-1.5 rounded-lg text-xs h-8" onClick={() => updateCampaignStatus(c.id, 'programada')}>
                          <Pause className="h-3 w-3" /> Pausar
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1.5 rounded-lg text-xs h-8 border-slate-200 text-slate-500" onClick={() => updateCampaignStatus(c.id, 'finalizada')}>
                          <CheckCircle2 className="h-3 w-3" /> Finalizar
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" className="gap-1.5 rounded-lg text-xs h-8 text-slate-500 ml-auto" onClick={() => handleCopyCopy(c.copy)}>
                      {copiedCopy ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />} Copiar copy
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ── Dialog Generador IA ─────────────────────────────────── */}
      <Dialog open={genDialogOpen} onOpenChange={(v) => { setGenDialogOpen(v); if (!v) { setAiResult(null); setCustomOcasion(''); } }}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-rose-500" /> Generador de Campañas con IA
            </DialogTitle>
            <DialogDescription>Gemini crea el nombre, descuento, copy y estrategia completa</DialogDescription>
          </DialogHeader>

          {/* Input ocasión personalizada */}
          {!aiResult && !generating && (
            <div className="py-3 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Ocasión o fecha especial</Label>
                <div className="flex gap-2">
                  <Input
                    value={customOcasion}
                    onChange={e => setCustomOcasion(e.target.value)}
                    placeholder="Ej. Aniversario PAT-LI, Liquidación invierno..."
                    onKeyDown={e => e.key === 'Enter' && customOcasion.trim() && handleGenerate(customOcasion.trim())}
                  />
                  <Button
                    className="gap-1.5 bg-rose-600 hover:bg-rose-700 shrink-0"
                    disabled={!customOcasion.trim()}
                    onClick={() => handleGenerate(customOcasion.trim())}
                  >
                    <Sparkles className="h-4 w-4" /> Generar
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">O elige una fecha clave</Label>
                <div className="grid grid-cols-2 gap-2">
                  {FECHAS_ESPECIALES.slice(0, 6).map(f => (
                    <button
                      key={f.nombre}
                      onClick={() => handleGenerate(f.nombre, f.fecha)}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/40 transition-all text-left"
                    >
                      <span className="text-lg">{f.emoji}</span>
                      <span className="text-xs font-bold text-slate-700">{f.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {generating && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-rose-100 border-t-rose-600 animate-spin" />
                <Sparkles className="h-6 w-6 text-rose-500 absolute inset-0 m-auto" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700">Gemini está creando tu campaña…</p>
                <p className="text-xs text-slate-400 mt-1">Generando nombre, copy, descuento y estrategia para "{selectedOcasion}"</p>
              </div>
            </div>
          )}

          {/* Resultado */}
          {aiResult && !generating && (
            <div className="py-2 space-y-4 animate-in fade-in duration-500">
              {/* Nombre + descuento */}
              <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{aiResult.emoji}</span>
                  <div>
                    <p className="font-black text-lg leading-none">{aiResult.nombre}</p>
                    <p className="text-[10px] opacity-80 mt-0.5">{selectedOcasion}</p>
                  </div>
                  <span className="ml-auto text-2xl font-black bg-white/20 px-3 py-1 rounded-xl">{aiResult.descuentoSugerido}%</span>
                </div>
              </div>

              {/* Copy */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Copy para redes</p>
                  <button onClick={() => handleCopyCopy(aiResult.copy)} className="text-[10px] flex items-center gap-1 text-rose-600 font-bold">
                    {copiedCopy ? <><Check className="h-2.5 w-2.5" /> Copiado</> : <><Copy className="h-2.5 w-2.5" /> Copiar</>}
                  </button>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{aiResult.copy}</p>
              </div>

              {/* Estrategia */}
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 flex items-start gap-2">
                <Zap className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-0.5">Estrategia</p>
                  <p className="text-xs text-slate-700">{aiResult.estrategia}</p>
                </div>
              </div>

              {/* Canales + categorías + hashtags */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Canales</p>
                  <div className="flex flex-wrap gap-1">
                    {aiResult.canalesSugeridos.map(c => (
                      <span key={c} className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Categorías</p>
                  <div className="flex flex-wrap gap-1">
                    {aiResult.categoriasSugeridas.map(c => (
                      <span key={c} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Hashtags</p>
                <div className="flex flex-wrap gap-1">
                  {aiResult.hashtagsSugeridos.map(h => (
                    <span key={h} className="text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded-full">{h}</span>
                  ))}
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" className="gap-1.5" onClick={() => handleSaveCampaign('borrador')}>
                  <Tag className="h-4 w-4" /> Guardar borrador
                </Button>
                <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleSaveCampaign('activa')}>
                  <Play className="h-4 w-4" /> Publicar ahora
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ──────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar campaña?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará <span className="font-bold text-slate-900">"{deleteTarget?.nombre}"</span> de tu gestión de campañas. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => { if (deleteTarget) { deleteCampaign(deleteTarget.id); toast({ title: 'Campaña eliminada' }); } setDeleteTarget(null); }}>
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
