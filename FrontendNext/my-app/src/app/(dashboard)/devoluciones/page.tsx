"use client";

import { useState } from 'react';
import {
  RotateCcw, Plus, Sparkles, Loader2, CheckCircle2, XCircle, Clock,
  AlertTriangle, Package, User, CalendarDays, MessageSquare, Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { ReturnClassificationOutput } from '@/ai/flows/admin-return-classification-flow';

type EstadoDevolucion = 'pendiente' | 'aprobado' | 'rechazado' | 'en_revision';

type Devolucion = {
  id:              string;
  cliente:         string;
  producto:        string;
  motivo:          string;
  fecha:           string;
  diasDesdeCompra: number;
  estado:          EstadoDevolucion;
  iaResult:        ReturnClassificationOutput | null;
};

const INITIAL_DEVOLUCIONES: Devolucion[] = [
  { id: 'DEV-001', cliente: 'María García',   producto: 'Polo Pima Azul M',      motivo: 'Vino con costura rota en la manga',   fecha: '2026-05-26', diasDesdeCompra: 4,  estado: 'pendiente',   iaResult: null },
  { id: 'DEV-002', cliente: 'Luis Torres',    producto: 'Jean Slim Negro 32',    motivo: 'Me mandaron talla L, pedí M',         fecha: '2026-05-25', diasDesdeCompra: 8,  estado: 'en_revision', iaResult: null },
  { id: 'DEV-003', cliente: 'Ana Martínez',   producto: 'Casaca Cuero Marrón S', motivo: 'Ya no me gusta el modelo',            fecha: '2026-05-20', diasDesdeCompra: 15, estado: 'rechazado',   iaResult: null },
  { id: 'DEV-004', cliente: 'Carlos Ramos',   producto: 'Polo Deportivo Verde L', motivo: 'Se decoloró al primer lavado',        fecha: '2026-05-27', diasDesdeCompra: 2,  estado: 'aprobado',    iaResult: null },
  { id: 'DEV-005', cliente: 'Sofía Mendoza',  producto: 'Vestido Verano Floral M', motivo: 'El pedido nunca llegó a mi casa',    fecha: '2026-05-28', diasDesdeCompra: 1,  estado: 'pendiente',   iaResult: null },
];

const ESTADO_META: Record<EstadoDevolucion, { label: string; icon: typeof Clock; className: string }> = {
  pendiente:   { label: 'Pendiente',   icon: Clock,         className: 'bg-amber-100 text-amber-700 border-amber-200'  },
  en_revision: { label: 'En revisión', icon: AlertTriangle,  className: 'bg-blue-100 text-blue-700 border-blue-200'    },
  aprobado:    { label: 'Aprobado',    icon: CheckCircle2,   className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rechazado:   { label: 'Rechazado',   icon: XCircle,        className: 'bg-red-100 text-red-700 border-red-200'       },
};

const CATEGORIA_LABEL: Record<string, string> = {
  defecto_fabricacion:   'Defecto de fabricación',
  talla_incorrecta:      'Talla incorrecta',
  cambio_parecer:        'Cambio de parecer',
  dano_usuario:          'Daño por uso',
  producto_no_recibido:  'Producto no recibido',
  otro:                  'Otro motivo',
};

let idCounter = 6;

export default function DevolucionesPage() {
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>(INITIAL_DEVOLUCIONES);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [analyzingId, setAnalyzingId]   = useState<string | null>(null);
  const [form, setForm] = useState({ cliente: '', producto: '', motivo: '', diasDesdeCompra: '' });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const totalPendientes  = devoluciones.filter(d => d.estado === 'pendiente').length;
  const totalAprobados   = devoluciones.filter(d => d.estado === 'aprobado').length;
  const totalRechazados  = devoluciones.filter(d => d.estado === 'rechazado').length;
  const tasaAprobacion   = devoluciones.length > 0 ? Math.round((totalAprobados / devoluciones.length) * 100) : 0;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cliente.trim() || !form.producto.trim() || !form.motivo.trim()) {
      toast({ title: 'Completa todos los campos', variant: 'destructive' });
      return;
    }
    const newDev: Devolucion = {
      id:              `DEV-${String(idCounter++).padStart(3, '0')}`,
      cliente:         form.cliente.trim(),
      producto:        form.producto.trim(),
      motivo:          form.motivo.trim(),
      fecha:           new Date().toISOString().split('T')[0],
      diasDesdeCompra: parseInt(form.diasDesdeCompra) || 1,
      estado:          'pendiente',
      iaResult:        null,
    };
    setDevoluciones(prev => [newDev, ...prev]);
    toast({ title: 'Devolución registrada', description: `${newDev.id} agregada. Usa IA para clasificarla.` });
    setIsDialogOpen(false);
    setForm({ cliente: '', producto: '', motivo: '', diasDesdeCompra: '' });
  };

  const handleAnalyzeIA = async (dev: Devolucion) => {
    setAnalyzingId(dev.id);
    try {
      const res = await fetch('/api/ai/return-classification', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente:         dev.cliente,
          producto:        dev.producto,
          motivo:          dev.motivo,
          diasDesdeCompra: dev.diasDesdeCompra,
        }),
      });
      const data: ReturnClassificationOutput = await res.json();
      setDevoluciones(prev => prev.map(d => d.id === dev.id
        ? { ...d, iaResult: data, estado: data.aceptar ? 'aprobado' : 'rechazado' }
        : d
      ));
      toast({
        title: `IA recomienda: ${data.aceptar ? 'Aprobar' : 'Rechazar'}`,
        description: data.accion,
      });
    } catch {
      toast({ title: 'Error al analizar', variant: 'destructive' });
    } finally {
      setAnalyzingId(null);
    }
  };

  const cambiarEstado = (id: string, estado: EstadoDevolucion) => {
    setDevoluciones(prev => prev.map(d => d.id === id ? { ...d, estado } : d));
    toast({ title: `Estado actualizado a: ${ESTADO_META[estado].label}` });
  };

  const selected = selectedId ? devoluciones.find(d => d.id === selectedId) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-red-600 rounded-2xl flex items-center justify-center shadow-md">
            <RotateCcw className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Gestión de Devoluciones</h1>
            <p className="page-subtitle">Clasificación automática con IA y seguimiento de solicitudes</p>
          </div>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90 gap-2 rounded-xl shadow-md">
          <Plus className="h-4 w-4" /> Nueva Devolución
        </Button>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Registrar Devolución</DialogTitle>
            <DialogDescription>Ingresa los datos para iniciar el proceso de devolución.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label>Nombre del cliente</Label>
              <Input value={form.cliente} onChange={e => setForm(f => ({ ...f, cliente: e.target.value }))} placeholder="Ej. Juan Pérez" />
            </div>
            <div className="space-y-1">
              <Label>Producto a devolver</Label>
              <Input value={form.producto} onChange={e => setForm(f => ({ ...f, producto: e.target.value }))} placeholder="Ej. Polo Pima Azul M" />
            </div>
            <div className="space-y-1">
              <Label>Motivo de devolución</Label>
              <textarea
                value={form.motivo}
                onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
                placeholder="Describe el motivo con detalle..."
                className="w-full min-h-[80px] text-sm p-3 rounded-md border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="space-y-1">
              <Label>Días desde la compra</Label>
              <Input type="number" min="1" max="365" value={form.diasDesdeCompra} onChange={e => setForm(f => ({ ...f, diasDesdeCompra: e.target.value }))} placeholder="Ej. 5" />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-primary">Registrar Devolución</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total solicitudes', value: devoluciones.length, color: 'text-slate-700',   bg: 'bg-slate-50'   },
          { label: 'Pendientes',        value: totalPendientes,      color: 'text-amber-700',   bg: 'bg-amber-50'   },
          { label: 'Aprobadas',         value: totalAprobados,       color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Tasa aprobación',   value: `${tasaAprobacion}%`, color: 'text-primary',     bg: 'bg-primary/5'  },
        ].map((k, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className={`pt-5 pb-4 ${k.bg} rounded-xl`}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{k.label}</p>
              <p className={`text-2xl font-black mt-1 ${k.color}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content: list + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {devoluciones.map(dev => {
            const meta  = ESTADO_META[dev.estado];
            const Icon  = meta.icon;
            const isAnalyzing = analyzingId === dev.id;
            return (
              <Card
                key={dev.id}
                onClick={() => setSelectedId(dev.id === selectedId ? null : dev.id)}
                className={cn(
                  'border-none shadow-sm cursor-pointer transition-all hover:shadow-md',
                  selectedId === dev.id && 'ring-2 ring-primary'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${meta.className} border`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-black text-slate-700 font-mono">{dev.id}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${meta.className}`}>
                          {meta.label}
                        </Badge>
                        {dev.iaResult && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-violet-50 text-violet-700 border-violet-200">
                            <Sparkles className="h-2.5 w-2.5 mr-1" />
                            IA: {CATEGORIA_LABEL[dev.iaResult.categoria] ?? dev.iaResult.categoria}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mb-1">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{dev.cliente}</span>
                        <span className="flex items-center gap-1"><Package className="h-3 w-3" />{dev.producto}</span>
                        <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{dev.diasDesdeCompra}d desde compra</span>
                      </div>
                      <p className="text-xs text-slate-500 italic line-clamp-1">"{dev.motivo}"</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isAnalyzing || !!dev.iaResult}
                      onClick={e => { e.stopPropagation(); handleAnalyzeIA(dev); }}
                      className={cn(
                        'gap-1.5 text-[11px] shrink-0',
                        dev.iaResult ? 'border-violet-200 text-violet-600 bg-violet-50' : 'border-slate-200'
                      )}
                    >
                      {isAnalyzing
                        ? <><Loader2 className="h-3 w-3 animate-spin" /> Analizando…</>
                        : dev.iaResult
                          ? <><Zap className="h-3 w-3" /> Analizado</>
                          : <><Sparkles className="h-3 w-3" /> Analizar IA</>
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detail panel */}
        <div>
          {!selected ? (
            <Card className="border-none shadow-sm h-full flex flex-col items-center justify-center py-16 text-center">
              <RotateCcw className="h-10 w-10 text-slate-200 mb-3" />
              <p className="text-sm text-slate-400">Selecciona una devolución<br/>para ver el detalle</p>
            </Card>
          ) : (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-primary" /> Detalle {selected.id}
                </CardTitle>
                <CardDescription>{selected.fecha}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-bold">Cliente:</span> {selected.cliente}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Package className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-bold">Producto:</span> {selected.producto}
                  </div>
                  <div className="flex items-start gap-2 text-slate-600">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-400 mt-0.5" />
                    <div><span className="font-bold">Motivo:</span> {selected.motivo}</div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-bold">Días desde compra:</span> {selected.diasDesdeCompra}
                  </div>
                </div>

                {selected.iaResult && (
                  <div className="space-y-2 border-t pt-3">
                    <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Análisis IA
                    </p>
                    <div className={`text-[10px] font-black px-2 py-1 rounded-full inline-flex items-center gap-1 ${selected.iaResult.aceptar ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {selected.iaResult.aceptar ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {selected.iaResult.aceptar ? 'Recomienda APROBAR' : 'Recomienda RECHAZAR'}
                    </div>
                    <div className="text-[10px] bg-slate-50 rounded-lg p-2.5 space-y-1.5">
                      <p><span className="font-bold text-slate-500">Categoría:</span> {CATEGORIA_LABEL[selected.iaResult.categoria] ?? selected.iaResult.categoria}</p>
                      <p><span className="font-bold text-slate-500">Acción:</span> {selected.iaResult.accion}</p>
                      <p><span className="font-bold text-slate-500">Prioridad:</span> {selected.iaResult.prioridad}</p>
                    </div>
                    <div className="text-[11px] text-slate-700 bg-violet-50 border border-violet-100 rounded-xl p-3">
                      {selected.iaResult.recomendacion}
                    </div>
                  </div>
                )}

                {/* Manual state actions */}
                <div className="border-t pt-3 space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Cambiar estado</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['aprobado','rechazado','en_revision','pendiente'] as EstadoDevolucion[]).map(est => (
                      <button
                        key={est}
                        onClick={() => cambiarEstado(selected.id, est)}
                        className={cn(
                          'text-[10px] font-bold py-1.5 px-2 rounded-lg border transition-colors',
                          selected.estado === est
                            ? `${ESTADO_META[est].className} border-current`
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        )}
                      >
                        {ESTADO_META[est].label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

