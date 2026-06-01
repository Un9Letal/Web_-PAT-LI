"use client";

import { useState } from 'react';
import { Users, Search, UserPlus, Mail, Phone, Calendar, MoreVertical, Filter, Sparkles, Loader2, Brain, TrendingUp, Star, RefreshCcw, AlertTriangle, Download } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast';
import type { ClientSegmentationOutput } from '@/ai/flows/admin-client-segmentation-flow';
import { Skeleton } from '@/components/ui/skeleton';

const SEGMENT_STYLES: Record<string, { label: string; className: string }> = {
  vip:       { label: 'VIP',       className: 'bg-amber-100 text-amber-800 border-amber-300' },
  frecuente: { label: 'Frecuente', className: 'bg-green-100 text-green-800 border-green-300' },
  inactivo:  { label: 'Inactivo',  className: 'bg-slate-100 text-slate-600 border-slate-300' },
  riesgo:    { label: 'Riesgo',    className: 'bg-orange-100 text-orange-800 border-orange-300' },
};

type Cliente = { id: string; nombre: string; correo: string; telefono: string; ultimaCompra: string; totalGastado: number; estado: 'Activo' | 'Inactivo' };

type FormErrors = { nombre?: string; correo?: string; telefono?: string };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^9\d{8}$/;

const initialClientes: Cliente[] = [
  { id: 'C001', nombre: 'Juan Pérez',     correo: 'juan.perez@email.com', telefono: '956123456', ultimaCompra: '2023-10-20', totalGastado: 450.00,  estado: 'Activo'   },
  { id: 'C002', nombre: 'María García',   correo: 'm.garcia@email.com',   telefono: '988777666', ultimaCompra: '2023-10-24', totalGastado: 1200.50, estado: 'Activo'   },
  { id: 'C003', nombre: 'Luis Torres',    correo: 'lutorres@email.com',   telefono: '944555333', ultimaCompra: '2023-09-15', totalGastado: 85.00,   estado: 'Inactivo' },
  { id: 'C004', nombre: 'Ana Martínez',   correo: 'ana.mtz@email.com',    telefono: '912345678', ultimaCompra: '2023-10-25', totalGastado: 320.00,  estado: 'Activo'   },
  { id: 'C005', nombre: 'Roberto Carlos', correo: 'rcarlos@email.com',    telefono: '933222111', ultimaCompra: '2023-10-10', totalGastado: 15.00,   estado: 'Activo'   },
];

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);
  const [form, setForm] = useState({ nombre: '', correo: '', telefono: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [segmentResult, setSegmentResult] = useState<ClientSegmentationOutput | null>(null);
  const [segmentLoading, setSegmentLoading] = useState(false);

  const filtered = clientes.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefono.includes(searchTerm)
  );

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido';
    else if (form.nombre.trim().length < 3) errs.nombre = 'Mínimo 3 caracteres';
    if (!form.correo.trim()) errs.correo = 'El correo es requerido';
    else if (!EMAIL_REGEX.test(form.correo.trim())) errs.correo = 'Formato de correo inválido';
    const phone = form.telefono.replace(/\s/g, '');
    if (!phone) errs.telefono = 'El teléfono es requerido';
    else if (!PHONE_REGEX.test(phone)) errs.telefono = 'Debe ser 9 dígitos empezando en 9 (ej: 987654321)';
    return errs;
  };

  const openNew = () => {
    setEditingCliente(null);
    setForm({ nombre: '', correo: '', telefono: '' });
    setErrors({});
    setIsDialogOpen(true);
  };

  const openEdit = (c: Cliente) => {
    setEditingCliente(c);
    setForm({ nombre: c.nombre, correo: c.correo, telefono: c.telefono });
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const trimmed = { nombre: form.nombre.trim(), correo: form.correo.trim().toLowerCase(), telefono: form.telefono.replace(/\s/g, '') };
    if (editingCliente) {
      setClientes(prev => prev.map(c => c.id === editingCliente.id ? { ...c, ...trimmed } : c));
      toast({ title: "Cliente actualizado", description: `${trimmed.nombre} fue editado correctamente.` });
    } else {
      const hoy = new Date().toISOString().split('T')[0];
      const newId = `C${String(clientes.length + 1).padStart(3, '0')}`;
      setClientes(prev => [...prev, { id: newId, ...trimmed, ultimaCompra: hoy, totalGastado: 0, estado: 'Activo' }]);
      toast({ title: "Cliente registrado", description: `${trimmed.nombre} fue añadido a la base de datos.` });
    }
    setIsDialogOpen(false);
  };

  const toggleEstado = (c: Cliente) => {
    const nuevo = c.estado === 'Activo' ? 'Inactivo' : 'Activo';
    setClientes(prev => prev.map(x => x.id === c.id ? { ...x, estado: nuevo } : x));
    toast({ title: `Cliente ${nuevo === 'Activo' ? 'activado' : 'suspendido'}`, description: `${c.nombre} ahora está ${nuevo}.` });
  };

  const eliminar = (c: Cliente) => {
    setClientes(prev => prev.filter(x => x.id !== c.id));
    toast({ title: "Cliente eliminado", description: `${c.nombre} fue removido.`, variant: "destructive" });
    setDeleteTarget(null);
  };

  const handleSegmentClients = async () => {
    setSegmentLoading(true);
    try {
      const payload = clientes.map(c => ({
        id:           c.id,
        nombre:       c.nombre,
        totalGastado: c.totalGastado,
        ultimaCompra: c.ultimaCompra,
        estado:       c.estado,
      }));
      const res = await fetch('/api/ai/client-segmentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientes: payload }),
      });
      const data: ClientSegmentationOutput = await res.json();
      setSegmentResult(data);
      toast({ title: 'Segmentación completada', description: `${data.segments.length} clientes analizados con IA.` });
    } catch {
      toast({ title: 'Error', description: 'No se pudo segmentar. Intenta nuevamente.', variant: 'destructive' });
    } finally {
      setSegmentLoading(false);
    }
  };

  const getSegment = (id: string) => segmentResult?.segments.find(s => s.clienteId === id);

  const handleExportCSV = () => {
    const BOM = '﻿';
    const headers = ['ID', 'Nombre', 'Correo', 'Teléfono', 'Última Compra', 'Total Gastado (S/)', 'Estado', 'Segmento IA'];
    const rows = clientes.map(c => {
      const seg = getSegment(c.id);
      return [
        c.id,
        c.nombre,
        c.correo,
        c.telefono,
        c.ultimaCompra,
        c.totalGastado.toFixed(2),
        c.estado,
        seg ? SEGMENT_STYLES[seg.segment]?.label ?? seg.segment : '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    const csv = BOM + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `clientes-patli-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'CSV exportado', description: `${clientes.length} clientes descargados correctamente.` });
  };

  const totalActivos   = clientes.filter(c => c.estado === 'Activo').length;
  const retencion      = clientes.length > 0 ? Math.round((totalActivos / clientes.length) * 100) : 0;
  const ticketPromedio = clientes.length > 0 ? clientes.reduce((s, c) => s + c.totalGastado, 0) / clientes.length : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-md">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Gestión de Clientes</h1>
            <p className="page-subtitle">Base de datos centralizada · {clientes.length} registros</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleSegmentClients}
            disabled={segmentLoading}
            className="gap-2 border-violet-300 text-violet-700 hover:bg-violet-50"
          >
            {segmentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {segmentLoading ? 'Analizando...' : 'Segmentación IA'}
          </Button>
          <Button onClick={openNew} className="bg-primary hover:bg-primary/90 gap-2">
            <UserPlus className="h-4 w-4" /> Registrar Cliente
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(v) => { setIsDialogOpen(v); if (!v) setErrors({}); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCliente ? 'Editar Cliente' : 'Registrar Cliente'}</DialogTitle>
            <DialogDescription>{editingCliente ? 'Modifica los datos del cliente.' : 'Ingresa los datos del nuevo cliente.'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label>Nombre completo</Label>
              <Input
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="Ej. Ana López"
                className={errors.nombre ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre}</p>}
            </div>
            <div className="space-y-1">
              <Label>Correo electrónico</Label>
              <Input
                type="text"
                value={form.correo}
                onChange={e => setForm(f => ({ ...f, correo: e.target.value }))}
                placeholder="correo@ejemplo.com"
                className={errors.correo ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.correo && <p className="text-xs text-destructive">{errors.correo}</p>}
            </div>
            <div className="space-y-1">
              <Label>Teléfono</Label>
              <Input
                value={form.telefono}
                onChange={e => {
                  const val = e.target.value.replace(/[^\d]/g, '').slice(0, 9);
                  setForm(f => ({ ...f, telefono: val }));
                }}
                placeholder="987654321"
                maxLength={9}
                className={errors.telefono ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.telefono
                ? <p className="text-xs text-destructive">{errors.telefono}</p>
                : <p className="text-[10px] text-slate-400">Solo dígitos, 9 caracteres, empieza en 9</p>
              }
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-primary">{editingCliente ? 'Guardar Cambios' : 'Registrar Cliente'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-gradient-to-b from-[#1e3a5f] to-[#2563eb]" />
          <div className="p-5 pl-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-white flex items-center justify-center shadow-sm"><Users className="h-4.5 w-4.5" /></div>
              <span className="metric-up"><TrendingUp className="h-3 w-3" />{totalActivos} activos</span>
            </div>
            <p className="section-label mb-1">Total Clientes</p>
            <h3 className="text-2xl font-black text-slate-900 leading-none">{clientes.length}</h3>
            <p className="text-[10px] text-slate-400 mt-1">registrados en el sistema</p>
          </div>
        </div>
        <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-gradient-to-b from-cyan-500 to-blue-600" />
          <div className="p-5 pl-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-sm"><Star className="h-4.5 w-4.5" /></div>
            </div>
            <p className="section-label mb-1">Tasa de Retención</p>
            <h3 className="text-2xl font-black text-slate-900 leading-none">{retencion}%</h3>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden"><div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-700" style={{ width: `${retencion}%` }} /></div>
          </div>
        </div>
        <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
          <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-gradient-to-b from-emerald-400 to-teal-600" />
          <div className="p-5 pl-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-sm"><TrendingUp className="h-4.5 w-4.5" /></div>
            </div>
            <p className="section-label mb-1">Ticket Promedio</p>
            <h3 className="text-2xl font-black text-slate-900 leading-none">S/ {ticketPromedio.toFixed(2)}</h3>
            <p className="text-[10px] text-slate-400 mt-1">basado en todos los clientes</p>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 to-teal-500" />
        <CardHeader className="py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar por nombre, correo o teléfono..." className="pl-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl border-slate-200"><Filter className="h-3.5 w-3.5" /> Filtros</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Última Compra</th>
                <th>Inversión Total</th>
                <th>Estado</th>
                {segmentResult && <th>Segmento IA</th>}
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={segmentResult ? 7 : 6} className="text-center text-slate-400 py-10">No se encontraron clientes.</td></tr>}
              {filtered.map(c => {
                const seg = getSegment(c.id);
                const segStyle = seg ? SEGMENT_STYLES[seg.segment] : null;
                return (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center font-black text-primary text-sm shrink-0">{c.nombre[0]}</div>
                        <div className="font-semibold text-slate-800">{c.nombre}</div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-0.5">
                        <div className="text-[11px] flex items-center gap-1.5 text-slate-500"><Mail className="h-3 w-3" /> {c.correo}</div>
                        <div className="text-[11px] flex items-center gap-1.5 text-slate-500"><Phone className="h-3 w-3" /> {c.telefono}</div>
                      </div>
                    </td>
                    <td><div className="text-xs flex items-center gap-1.5 text-slate-600"><Calendar className="h-3 w-3 text-slate-400" /> {c.ultimaCompra}</div></td>
                    <td><span className="font-black text-primary">S/ {c.totalGastado.toFixed(2)}</span></td>
                    <td>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${c.estado === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{c.estado}</span>
                    </td>
                    {segmentResult && (
                      <td>
                        {segStyle ? (
                          <div className="space-y-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${segStyle.className}`}>
                              {segStyle.label}
                            </span>
                            {seg?.action && <p className="text-[10px] text-slate-400 max-w-[120px] leading-tight">{seg.action}</p>}
                          </div>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>
                    )}
                    <td className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem onClick={() => openEdit(c)}>Editar datos</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleEstado(c)}>{c.estado === 'Activo' ? 'Suspender' : 'Activar'}</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(c)}>Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
      {segmentLoading && (
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300 animate-pulse" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="w-48 h-5 rounded" />
              </div>
              <Skeleton className="w-24 h-7 rounded" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-100 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="w-16 h-3 rounded" />
                  </div>
                  <Skeleton className="w-10 h-7 rounded" />
                  <Skeleton className="w-12 h-3 rounded" />
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-violet-100 bg-violet-50 p-4 space-y-2">
                <Skeleton className="w-32 h-3 bg-violet-200 rounded" />
                <Skeleton className="w-full h-4 bg-violet-100 rounded" />
                <Skeleton className="w-4/5 h-4 bg-violet-100 rounded" />
              </div>
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 space-y-2">
                <Skeleton className="w-32 h-3 bg-indigo-200 rounded" />
                <Skeleton className="w-full h-4 bg-indigo-100 rounded" />
                <Skeleton className="w-3/4 h-4 bg-indigo-100 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {segmentResult && !segmentLoading && (
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-violet-600" />
                <span className="font-semibold text-slate-800">Análisis de Segmentación IA</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSegmentClients} disabled={segmentLoading} className="gap-1 text-violet-600 hover:text-violet-700 hover:bg-violet-50">
                <RefreshCcw className="h-3.5 w-3.5" /> Actualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'vip',       label: 'VIP',       icon: Star,          color: 'bg-amber-50 border-amber-200 text-amber-800' },
                { key: 'frecuente', label: 'Frecuente', icon: TrendingUp,    color: 'bg-green-50 border-green-200 text-green-800' },
                { key: 'riesgo',    label: 'En Riesgo', icon: AlertTriangle, color: 'bg-orange-50 border-orange-200 text-orange-800' },
                { key: 'inactivo',  label: 'Inactivo',  icon: Users,         color: 'bg-slate-50 border-slate-200 text-slate-600' },
              ].map(({ key, label, icon: Icon, color }) => (
                <div key={key} className={`rounded-xl border p-4 ${color}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium">{label}</span>
                  </div>
                  <div className="text-2xl font-bold">{segmentResult.summary[key as keyof typeof segmentResult.summary]}</div>
                  <div className="text-xs opacity-70">clientes</div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 space-y-1">
                <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide">Observación principal</p>
                <p className="text-sm text-slate-700">{segmentResult.insight}</p>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-1">
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Estrategia prioritaria</p>
                <p className="text-sm text-slate-700">{segmentResult.topStrategy}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar a <span className="font-bold text-slate-900">"{deleteTarget?.nombre}"</span> de la base de datos. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteTarget && eliminar(deleteTarget)}>
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
