"use client";

import { useState } from 'react';
import {
  MessageSquare, Search, Clock, CheckCircle2, ArrowRight, Plus, User,
  Sparkles, Loader2, Copy, Check, ChevronDown, ChevronUp, Tag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { ConsultaReplyOutput } from '@/ai/flows/admin-consulta-reply-flow';

type Consulta = {
  id: string;
  usuario: string;
  mensaje: string;
  canal: string;
  fecha: string;
  estado: 'pendiente' | 'derivado' | 'resuelto';
};
type ConsultaFormErrors = { usuario?: string; mensaje?: string };

const TONE_STYLES = {
  formal:  { bg: 'bg-blue-50 text-blue-700 border-blue-200',   label: 'Formal' },
  cordial: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Cordial' },
  urgente: { bg: 'bg-red-50 text-red-700 border-red-200',       label: 'Urgente' },
};

const initialConsultas: Consulta[] = [
  { id: 'Q-101', usuario: 'Anónimo',         mensaje: '¿Hacen envíos a la ciudad de Nasca?',                  canal: 'Web Chat',  fecha: '10:45 AM', estado: 'pendiente' },
  { id: 'Q-102', usuario: 'Karla Mendoza',   mensaje: 'Deseo saber el precio al por mayor de los polos pima', canal: 'WhatsApp',  fecha: '10:30 AM', estado: 'derivado'  },
  { id: 'Q-103', usuario: 'Pedro Gomez',     mensaje: 'Mi pedido #1024 no llega aún',                         canal: 'Web Chat',  fecha: '09:15 AM', estado: 'pendiente' },
  { id: 'Q-104', usuario: 'Lucía Fernández', mensaje: 'Gracias por la atención, el jean me quedó perfecto',   canal: 'Web Chat',  fecha: 'Ayer',      estado: 'resuelto'  },
];

export default function ConsultasPage() {
  const [consultas, setConsultas]           = useState<Consulta[]>(initialConsultas);
  const [searchTerm, setSearchTerm]         = useState('');
  const [isDialogOpen, setIsDialogOpen]     = useState(false);
  const [form, setForm]                     = useState({ usuario: '', mensaje: '', canal: 'Web Chat' });
  const [consultaErrors, setConsultaErrors] = useState<ConsultaFormErrors>({});

  /* ── IA per-consulta state ── */
  const [replyMap, setReplyMap]         = useState<Record<string, ConsultaReplyOutput>>({});
  const [loadingMap, setLoadingMap]     = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [copiedId, setCopiedId]         = useState<string | null>(null);

  const handleGenerateReply = async (q: Consulta) => {
    setLoadingMap(m => ({ ...m, [q.id]: true }));
    setExpandedId(q.id);
    try {
      const res = await fetch('/api/ai/consulta-reply', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ usuario: q.usuario, mensaje: q.mensaje, canal: q.canal }),
      });
      const data = await res.json() as ConsultaReplyOutput;
      setReplyMap(m => ({ ...m, [q.id]: data }));
      toast({ title: 'Respuesta IA generada', description: `Categoría: ${data.category}` });
    } catch {
      toast({ title: 'Error al generar respuesta', variant: 'destructive' });
    } finally {
      setLoadingMap(m => ({ ...m, [q.id]: false }));
    }
  };

  const handleCopy = (id: string) => {
    const text = replyMap[id]?.draft;
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: 'Respuesta copiada al portapapeles' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const validateConsulta = (): ConsultaFormErrors => {
    const errs: ConsultaFormErrors = {};
    if (!form.usuario.trim()) errs.usuario = 'El nombre del cliente es requerido';
    else if (form.usuario.trim().length < 2) errs.usuario = 'Mínimo 2 caracteres';
    if (!form.mensaje.trim()) errs.mensaje = 'El mensaje es requerido';
    else if (form.mensaje.trim().length < 5) errs.mensaje = 'Mínimo 5 caracteres';
    return errs;
  };

  const cambiarEstado = (id: string, estado: Consulta['estado']) => {
    setConsultas(prev => prev.map(q => q.id === id ? { ...q, estado } : q));
    const label = estado === 'derivado' ? 'derivada al asesor' : 'marcada como resuelta';
    toast({ title: 'Consulta actualizada', description: `La consulta ${id} fue ${label}.` });
  };

  const handleCrear = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateConsulta();
    if (Object.keys(errs).length > 0) { setConsultaErrors(errs); return; }
    setConsultaErrors({});
    const now = new Date();
    const hora = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} AM`;
    const newId = `Q-${105 + consultas.length}`;
    setConsultas(prev => [{
      id: newId,
      usuario: form.usuario.trim(),
      mensaje: form.mensaje.trim(),
      canal: form.canal,
      fecha: hora,
      estado: 'pendiente',
    }, ...prev]);
    toast({ title: 'Consulta registrada', description: `${newId} añadida como pendiente.` });
    setIsDialogOpen(false);
    setForm({ usuario: '', mensaje: '', canal: 'Web Chat' });
  };

  const filtered = (estado: string) => consultas.filter(q =>
    q.estado === estado &&
    (q.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
     q.mensaje.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pendientes = consultas.filter(q => q.estado === 'pendiente').length;
  const derivados  = consultas.filter(q => q.estado === 'derivado').length;

  const ConsultaCard = ({ q }: { q: Consulta }) => {
    const reply   = replyMap[q.id];
    const loading = loadingMap[q.id];
    const isExpanded = expandedId === q.id;
    const tone   = reply ? TONE_STYLES[reply.tone] : null;

    return (
      <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="font-bold text-sm">{q.usuario}</h4>
                  <span className="text-[10px] text-slate-400">·</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{q.id}</span>
                  <Badge variant="outline" className="text-[10px] h-5">{q.canal}</Badge>
                  {reply && (
                    <Badge variant="outline" className={cn('text-[9px] h-5', tone?.bg)}>
                      <Tag className="h-2.5 w-2.5 mr-1" />{reply.category}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{q.mensaje}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{q.fecha}</span>
              <div className="flex gap-1 flex-wrap justify-end">
                {/* IA Reply button */}
                {q.estado !== 'resuelto' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-violet-600 border-violet-200 hover:bg-violet-50 text-xs h-7"
                    onClick={() => reply && isExpanded ? setExpandedId(null) : handleGenerateReply(q)}
                    disabled={loading}
                  >
                    {loading
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Sparkles className="h-3 w-3" />}
                    {loading ? 'Generando…' : reply ? (isExpanded ? 'Ocultar' : 'Ver IA') : 'Responder IA'}
                    {reply && !loading && (isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </Button>
                )}
                {/* Status buttons */}
                {q.estado === 'pendiente' && (
                  <>
                    <Button size="sm" className="gap-1 bg-secondary text-xs h-7" onClick={() => cambiarEstado(q.id, 'derivado')}>
                      Derivar <ArrowRight className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-green-600 border-green-200 text-xs h-7" onClick={() => cambiarEstado(q.id, 'resuelto')}>
                      <CheckCircle2 className="h-3 w-3" /> Resolver
                    </Button>
                  </>
                )}
                {q.estado === 'derivado' && (
                  <Button size="sm" variant="outline" className="gap-1 text-green-600 border-green-200 text-xs h-7" onClick={() => cambiarEstado(q.id, 'resuelto')}>
                    <CheckCircle2 className="h-3 w-3" /> Marcar resuelta
                  </Button>
                )}
                {q.estado === 'resuelto' && (
                  <Badge className="bg-green-500 text-white hover:bg-green-500 h-7">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Resuelta
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* IA Reply panel */}
          {reply && isExpanded && (
            <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/60 p-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                  <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest">Borrador IA — Gemini</span>
                  {tone && (
                    <Badge variant="outline" className={cn('text-[9px]', tone.bg)}>{tone.label}</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 text-[10px] text-slate-500"
                  onClick={() => handleCopy(q.id)}
                >
                  {copiedId === q.id
                    ? <><Check className="h-3 w-3 text-emerald-500" /> Copiado</>
                    : <><Copy className="h-3 w-3" /> Copiar</>}
                </Button>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{reply.draft}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-6 text-[10px] text-violet-500 gap-1 hover:text-violet-700"
                onClick={() => handleGenerateReply(q)}
              >
                <Sparkles className="h-3 w-3" /> Regenerar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Gestión de Consultas</h1>
            <p className="page-subtitle">Bandeja unificada · respuestas automáticas con Gemini IA</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl px-4 py-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="section-label">T. Resp. Promedio</p>
              <p className="text-sm font-black text-slate-800">4.2 min</p>
            </div>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 rounded-xl shadow-md">
            <Plus className="h-4 w-4" /> Nueva Consulta
          </Button>
        </div>
      </div>

      {/* IA info banner */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 p-4 flex items-center gap-3">
        <div className="p-2 bg-violet-100 rounded-xl shrink-0">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-violet-800">Respuestas automáticas con Gemini IA</p>
          <p className="text-xs text-violet-600">Haz clic en <strong>"Responder IA"</strong> en cualquier consulta pendiente o derivada para que Gemini redacte un borrador profesional listo para copiar y enviar.</p>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(v) => { setIsDialogOpen(v); if (!v) setConsultaErrors({}); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Nueva Consulta</DialogTitle>
            <DialogDescription>Ingresa los datos de la consulta recibida.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCrear} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label>Cliente / Usuario</Label>
              <Input
                value={form.usuario}
                onChange={e => setForm(f => ({ ...f, usuario: e.target.value }))}
                placeholder="Ej. Juan Pérez o Anónimo"
                className={consultaErrors.usuario ? 'border-destructive' : ''}
              />
              {consultaErrors.usuario && <p className="text-xs text-destructive">{consultaErrors.usuario}</p>}
            </div>
            <div className="space-y-2">
              <Label>Canal</Label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm" value={form.canal} onChange={e => setForm(f => ({ ...f, canal: e.target.value }))}>
                <option>Web Chat</option>
                <option>WhatsApp</option>
                <option>Email</option>
                <option>Teléfono</option>
                <option>Presencial</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Mensaje / Consulta</Label>
              <Input
                value={form.mensaje}
                onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
                placeholder="Escribe el mensaje del cliente..."
                className={consultaErrors.mensaje ? 'border-destructive' : ''}
              />
              {consultaErrors.mensaje && <p className="text-xs text-destructive">{consultaErrors.mensaje}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-primary">Registrar Consulta</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="pendientes" className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <TabsList className="bg-white border">
            <TabsTrigger value="pendientes">Pendientes ({pendientes})</TabsTrigger>
            <TabsTrigger value="derivados">Derivados ({derivados})</TabsTrigger>
            <TabsTrigger value="resueltos">Resueltos</TabsTrigger>
          </TabsList>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Buscar consulta o mensaje..." className="pl-10 h-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {(['pendientes', 'derivados', 'resueltos'] as const).map(tab => {
          const estado = tab === 'pendientes' ? 'pendiente' : tab === 'derivados' ? 'derivado' : 'resuelto';
          const items  = filtered(estado);
          return (
            <TabsContent key={tab} value={tab} className="mt-0 space-y-4">
              {items.length === 0 && (
                <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="font-bold text-slate-900">Sin consultas {tab}</h3>
                  <p className="text-slate-500 max-w-xs mx-auto text-sm mt-1">No hay consultas en este estado por ahora.</p>
                </div>
              )}
              {items.map(q => <ConsultaCard key={q.id} q={q} />)}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

