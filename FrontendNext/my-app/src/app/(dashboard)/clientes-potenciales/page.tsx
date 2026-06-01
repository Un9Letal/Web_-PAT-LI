"use client";

import { useState } from 'react';
import { UserPlus, Flame, IceCream, Thermometer, Facebook, Instagram, Bot, MoreHorizontal, Search, Sparkles, Loader2, CheckCircle2, Target, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast';
import { generateLeadStrategy, type LeadStrategyOutput } from '@/ai/flows/admin-lead-strategy-flow';
import type { LeadScoringOutput } from '@/ai/flows/admin-lead-scoring-flow';

type Lead = { id: string; nombre: string; fuente: string; interes: string; nivel: string; fecha: string; convertido?: boolean };

type LeadFormErrors = { nombre?: string; fuente?: string; interes?: string };

const initialLeads: Lead[] = [
  { id: 'L001', nombre: 'Carlos Ruiz',  fuente: 'Facebook', interes: 'Polos Algodón',   nivel: 'Caliente', fecha: 'Hoy 10:15'    },
  { id: 'L002', nombre: 'Diana Silva',  fuente: 'Chatbot',  interes: 'Venta Mayorista', nivel: 'Tibio',    fecha: 'Hoy 09:30'    },
  { id: 'L003', nombre: 'Kevin Soto',   fuente: 'Instagram',interes: 'Catálogo Damas',  nivel: 'Frio',     fecha: 'Ayer 18:45'   },
  { id: 'L004', nombre: 'Elena Paz',    fuente: 'Chatbot',  interes: 'Jeans Caballero', nivel: 'Tibio',    fecha: 'Ayer 14:00'   },
  { id: 'L005', nombre: 'Mario Luna',   fuente: 'Facebook', interes: 'Precios Envío',   nivel: 'Tibio',    fecha: 'Ayer 12:20'   },
];

const getNivelIcon = (nivel: string) => {
  switch (nivel) {
    case 'Caliente': return <Flame className="h-3 w-3 text-destructive" />;
    case 'Tibio':    return <Thermometer className="h-3 w-3 text-amber-500" />;
    case 'Frio':     return <IceCream className="h-3 w-3 text-blue-400" />;
    default: return null;
  }
};

const getFuenteIcon = (fuente: string) => {
  switch (fuente) {
    case 'Facebook':  return <Facebook className="h-4 w-4 text-blue-600" />;
    case 'Instagram': return <Instagram className="h-4 w-4 text-pink-600" />;
    case 'Chatbot':   return <Bot className="h-4 w-4 text-primary" />;
    default: return null;
  }
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [leadErrors, setLeadErrors] = useState<LeadFormErrors>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const validateLead = (): LeadFormErrors => {
    const errs: LeadFormErrors = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido';
    else if (form.nombre.trim().length < 3) errs.nombre = 'Mínimo 3 caracteres';
    if (!form.fuente.trim()) errs.fuente = 'La fuente de captación es requerida';
    if (!form.interes.trim()) errs.interes = 'El interés del prospecto es requerido';
    return errs;
  };
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [aiStrategy, setAiStrategy] = useState<LeadStrategyOutput | null>(null);
  const [form, setForm] = useState({ nombre: '', fuente: '', interes: '', nivel: 'Tibio' });

  const filtered = leads.filter(l =>
    l.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.fuente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.interes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateLead();
    if (Object.keys(errs).length > 0) { setLeadErrors(errs); return; }
    setLeadErrors({});
    const newId = `L${String(leads.length + 1).padStart(3, '0')}`;
    const now = new Date();
    setLeads(prev => [{
      id: newId,
      nombre: form.nombre.trim(),
      fuente: form.fuente.trim(),
      interes: form.interes.trim(),
      nivel: form.nivel,
      fecha: `Hoy ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
    }, ...prev]);
    toast({ title: "Prospecto registrado", description: `${form.nombre} fue añadido a la bandeja de leads.` });
    setIsNewLeadOpen(false);
    setForm({ nombre: '', fuente: '', interes: '', nivel: 'Tibio' });
  };

  const convertirACliente = (lead: Lead) => {
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, convertido: true } : l));
    toast({ title: "Lead convertido", description: `${lead.nombre} fue registrado como cliente.` });
  };

  const eliminarLead = (lead: Lead) => {
    setLeads(prev => prev.filter(l => l.id !== lead.id));
    toast({ title: "Lead eliminado", description: `${lead.nombre} fue removido.`, variant: "destructive" });
    setDeleteTarget(null);
  };

  const handleAnalyzeLead = async (lead: Lead) => {
    setSelectedLead(lead);
    setIsAnalyzing(true);
    setAiStrategy(null);
    try {
      const result = await generateLeadStrategy({ nombre: lead.nombre, fuente: lead.fuente, interes: lead.interes, nivelInteres: lead.nivel });
      setAiStrategy(result);
      toast({ title: "Estrategia Generada", description: "Gemini ha analizado el prospecto correctamente." });
    } catch {
      toast({ variant: "destructive", title: "Error IA", description: "No se pudo generar la estrategia en este momento." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ── Lead Scoring IA state ── */
  const [scoringResult, setScoringResult] = useState<LeadScoringOutput | null>(null);
  const [scoringLoading, setScoringLoading] = useState(false);

  const handleScoreLeads = async () => {
    setScoringLoading(true);
    try {
      const enrichedLeads = leads.filter(l => !l.convertido).map(l => ({
        id:                l.id,
        nombre:            l.nombre,
        interes:           l.interes,
        presupuesto:       l.nivel === 'Caliente' ? 'Alto' : l.nivel === 'Tibio' ? 'Medio' : 'Bajo',
        canal:             l.fuente,
        interacciones:     l.nivel === 'Caliente' ? 5 : l.nivel === 'Tibio' ? 3 : 1,
        diasDesdeContacto: l.fecha.startsWith('Hoy') ? 0 : l.fecha.startsWith('Ayer') ? 1 : 3,
        estado:            l.nivel,
      }));
      const res = await fetch('/api/ai/lead-scoring', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ leads: enrichedLeads, totalSalesThisMonth: 24560, topCategories: ['Algodón Pima', 'Jeans', 'Damas'] }),
      });
      const data = await res.json() as LeadScoringOutput;
      setScoringResult(data);
      toast({ title: 'Scoring completado', description: `${data.scores.length} leads evaluados por Gemini.` });
    } catch {
      toast({ title: 'Error al evaluar leads', variant: 'destructive' });
    } finally {
      setScoringLoading(false);
    }
  };

  const scoreMap = new Map(scoringResult?.scores.map(s => [s.id, s]) ?? []);

  const calientes  = leads.filter(l => l.nivel === 'Caliente').length;
  const convertidos = leads.filter(l => l.convertido).length;
  const conversion = leads.length > 0 ? Math.round((convertidos / leads.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
            <UserPlus className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Clientes Potenciales — Leads</h1>
            <p className="page-subtitle">Prospectos captados via chatbot, redes sociales y web</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 border-violet-200 text-violet-700 hover:bg-violet-50"
            onClick={handleScoreLeads}
            disabled={scoringLoading}
          >
            {scoringLoading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Sparkles className="h-4 w-4" />
            }
            {scoringLoading ? 'Evaluando…' : 'Scoring IA'}
          </Button>
          <Button onClick={() => setIsNewLeadOpen(true)} className="bg-accent text-primary font-bold hover:bg-accent/90 gap-2">
            <UserPlus className="h-4 w-4" /> Nuevo Prospecto
          </Button>
        </div>
      </div>

      <Dialog open={isNewLeadOpen} onOpenChange={(v) => { setIsNewLeadOpen(v); if (!v) setLeadErrors({}); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Lead</DialogTitle>
            <DialogDescription>Ingresa los datos del cliente potencial captado de forma manual.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLead} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label>Nombre Completo</Label>
              <Input
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="Ej. Maria Lopez"
                className={leadErrors.nombre ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {leadErrors.nombre && <p className="text-xs text-destructive">{leadErrors.nombre}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Fuente</Label>
                <Input
                  value={form.fuente}
                  onChange={e => setForm(f => ({ ...f, fuente: e.target.value }))}
                  placeholder="Ej. WhatsApp, Visita"
                  className={leadErrors.fuente ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {leadErrors.fuente && <p className="text-xs text-destructive">{leadErrors.fuente}</p>}
              </div>
              <div className="space-y-1">
                <Label>Interés</Label>
                <Input
                  value={form.interes}
                  onChange={e => setForm(f => ({ ...f, interes: e.target.value }))}
                  placeholder="Ej. Polos Pima"
                  className={leadErrors.interes ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {leadErrors.interes && <p className="text-xs text-destructive">{leadErrors.interes}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nivel de Interés</Label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={form.nivel} onChange={e => setForm(f => ({ ...f, nivel: e.target.value }))}>
                <option value="Caliente">Caliente (Cierre pronto)</option>
                <option value="Tibio">Tibio (Interesado)</option>
                <option value="Frio">Frío (Solo consulta)</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-primary text-white">Registrar Prospecto</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {aiStrategy && selectedLead && (
        <Card className="border-primary bg-primary/5 animate-in slide-in-from-top-4 duration-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent fill-accent" /> Estrategia IA para: {selectedLead.nombre}</CardTitle>
              <Badge variant="outline" className="bg-white border-primary/20 text-primary">Cierre {aiStrategy.probabilidad}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-primary/10 italic text-sm shadow-sm">"{aiStrategy.pitch}"</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Próximos Pasos</h4>
                <div className="space-y-2">
                  {aiStrategy.pasosSiguientes.map((paso, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle2 size={16} className="text-green-500" />{paso}</div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Consejo del Experto</h4>
                <div className="p-3 bg-accent/10 rounded-lg border border-accent/20 flex gap-3 items-start">
                  <Target size={18} className="text-accent shrink-0 mt-0.5" />
                  <p className="text-xs text-primary font-medium">{aiStrategy.consejoExperto}</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-primary font-bold" onClick={() => setAiStrategy(null)}>Cerrar Análisis</Button>
          </CardContent>
        </Card>
      )}

      {/* Scoring IA Panel */}
      {scoringResult && (
        <Card className="border-none shadow-sm overflow-hidden animate-in slide-in-from-top-4 duration-500">
          <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500" />
                <div>
                  <CardTitle className="text-base">Scoring de Conversión — Gemini</CardTitle>
                  <CardDescription className="text-xs">{scoringResult.scores.length} leads evaluados con probabilidad de cierre</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-slate-400" onClick={() => setScoringResult(null)}>
                Cerrar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
              <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl">
                <p className="text-[10px] font-black text-violet-600 uppercase mb-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Insight del embudo
                </p>
                <p className="text-xs text-slate-700">{scoringResult.funnelInsight}</p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-[10px] font-black text-amber-600 uppercase mb-1">⏰ Mejor momento de contacto</p>
                <p className="text-xs text-slate-700">{scoringResult.bestTimeToContact}</p>
              </div>
            </div>
            <div className="space-y-2">
              {scoringResult.scores.map((s) => {
                const lead = leads.find(l => l.id === s.id);
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      s.priority === 'caliente' ? 'bg-red-100 text-red-700' :
                      s.priority === 'tibio'    ? 'bg-amber-100 text-amber-700' :
                                                  'bg-blue-100 text-blue-700'
                    }`}>
                      {s.score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-slate-800">{lead?.nombre ?? s.id}</span>
                        <Badge variant="outline" className={`text-[9px] h-4 px-1.5 ${
                          s.priority === 'caliente' ? 'bg-red-50 text-red-600 border-red-200' :
                          s.priority === 'tibio'    ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                      'bg-blue-50 text-blue-600 border-blue-200'
                        }`}>
                          {s.priority}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-500">{s.reason}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-bold text-violet-600 max-w-[100px] text-right">{s.nextAction}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads',  value: String(leads.length), sub: 'prospectos captados',   icon: UserPlus,    grad: 'from-[#1e3a5f] to-[#2563eb]', valCls: 'text-slate-900' },
          { label: 'Calientes',    value: String(calientes),    sub: 'cierre inminente',       icon: Flame,       grad: 'from-rose-400 to-red-600',     valCls: 'text-rose-600' },
          { label: 'Conversión',   value: `${conversion}%`,     sub: 'tasa lead → cliente',    icon: TrendingUp,  grad: 'from-emerald-400 to-teal-600', valCls: 'text-emerald-700' },
          { label: 'Convertidos',  value: String(convertidos),  sub: 'leads ganados',          icon: CheckCircle2,grad: 'from-amber-400 to-orange-500', valCls: 'text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b ${stat.grad}`} />
            <div className="p-4 pl-5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm mb-2.5 bg-gradient-to-br ${stat.grad} text-white`}><stat.icon className="h-4 w-4" /></div>
              <p className="section-label mb-1">{stat.label}</p>
              <p className={`text-2xl font-black leading-none ${stat.valCls}`}>{stat.value}</p>
              <p className="text-[10px] text-slate-400 mt-1">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Funnel de conversión */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-primary" />
            <CardTitle>Embudo de Conversión</CardTitle>
          </div>
          <CardDescription>Distribución de prospectos por etapa del ciclo de venta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(() => {
              const total      = leads.length;
              const interesado = leads.filter(l => l.nivel === 'Caliente' || l.nivel === 'Tibio').length;
              const calienteN  = leads.filter(l => l.nivel === 'Caliente').length;
              const convertN   = leads.filter(l => l.convertido).length;
              const stages = [
                { label: 'Captados',    count: total,      color: 'bg-blue-500',    pct: 100,                                        desc: 'Total de prospectos registrados' },
                { label: 'Interesados', count: interesado, color: 'bg-primary',     pct: total > 0 ? Math.round((interesado / total) * 100) : 0, desc: 'Nivel Caliente o Tibio' },
                { label: 'Calientes',   count: calienteN,  color: 'bg-orange-500',  pct: total > 0 ? Math.round((calienteN / total) * 100) : 0,  desc: 'Listos para cierre próximo' },
                { label: 'Convertidos', count: convertN,   color: 'bg-green-500',   pct: total > 0 ? Math.round((convertN / total) * 100) : 0,   desc: 'Clientes confirmados' },
              ];
              return stages.map((s, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                      <span className="font-medium">{s.label}</span>
                      <span className="text-xs text-slate-400">{s.desc}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{s.count}</span>
                      <span className="text-xs text-slate-400 w-8 text-right">{s.pct}%</span>
                    </div>
                  </div>
                  <div className="relative h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${s.color} opacity-80 rounded-full transition-all duration-700`}
                      style={{ width: `${s.pct}%` }}
                    />
                    {s.pct > 10 && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white">
                        {s.count} prospectos
                      </span>
                    )}
                  </div>
                </div>
              ));
            })()}
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100 flex items-center justify-between">
            <span className="text-sm font-medium text-green-800">Tasa de conversión global</span>
            <span className="text-xl font-bold text-green-700">{leads.length > 0 ? Math.round((leads.filter(l => l.convertido).length / leads.length) * 100) : 0}%</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 to-purple-600" />
        <CardHeader className="py-4">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base font-black">Bandeja de Entrada de Leads</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar prospecto..." className="pl-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th>Prospecto</th>
                <th>Fuente</th>
                <th>Interés Principal</th>
                <th>Nivel</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-slate-400 py-10">No se encontraron prospectos.</td></tr>}
              {filtered.map(l => (
                <tr key={l.id}>
                  <td><span className="font-bold text-slate-800">{l.nombre}</span></td>
                  <td>
                    <div className="flex items-center gap-2">{getFuenteIcon(l.fuente)}<span className="text-xs text-slate-600">{l.fuente}</span></div>
                  </td>
                  <td><span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{l.interes}</span></td>
                  <td>
                    <div className="flex items-center gap-1.5 font-medium text-xs">
                      {getNivelIcon(l.nivel)}{l.nivel}
                      {scoreMap.has(l.id) && (
                        <span className={`text-[9px] font-black ml-1 px-1.5 py-0.5 rounded-full ${
                          (scoreMap.get(l.id)?.score ?? 0) >= 70 ? 'bg-red-100 text-red-700' :
                          (scoreMap.get(l.id)?.score ?? 0) >= 40 ? 'bg-amber-100 text-amber-700' :
                                                                   'bg-blue-100 text-blue-700'
                        }`}>
                          {scoreMap.get(l.id)?.score}pts
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {l.convertido
                      ? <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Convertido</span>
                      : <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Prospecto</span>
                    }
                  </td>
                  <td><span className="text-xs text-slate-500">{l.fecha}</span></td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" className="gap-1 rounded-lg border-primary/20 text-primary hover:bg-primary/5 h-8"
                        disabled={isAnalyzing && selectedLead?.id === l.id} onClick={() => handleAnalyzeLead(l)}>
                        {isAnalyzing && selectedLead?.id === l.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-accent fill-accent" />}
                        IA
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          {!l.convertido && <DropdownMenuItem onClick={() => convertirACliente(l)}><CheckCircle2 className="h-4 w-4 mr-2 text-green-600" /> Convertir a cliente</DropdownMenuItem>}
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(l)}><Trash2 className="h-4 w-4 mr-2" /> Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar prospecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar a <span className="font-bold text-slate-900">"{deleteTarget?.nombre}"</span> de la bandeja de leads. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteTarget && eliminarLead(deleteTarget)}>
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
