"use client";

import { useState } from 'react';
import {
  Tag, Plus, Trash2, ToggleLeft, ToggleRight, Copy, Check,
  Percent, DollarSign, CalendarDays, Users, ShoppingCart, AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { useAppStore, type Coupon } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function DescuentosPage() {
  const coupons      = useAppStore((s) => s.coupons);
  const addCoupon    = useAppStore((s) => s.addCoupon);
  const toggleCoupon = useAppStore((s) => s.toggleCoupon);
  const deleteCoupon = useAppStore((s) => s.deleteCoupon);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget]  = useState<Coupon | null>(null);
  const [copied, setCopied]              = useState<string | null>(null);
  const [form, setForm] = useState({
    code:      '',
    discount:  '',
    type:      'porcentaje' as 'porcentaje' | 'monto',
    minCompra: '',
    expiry:    '',
    maxUsos:   '',
  });

  const today = new Date().toISOString().split('T')[0];

  const totalActivos   = coupons.filter(c => c.activo && c.expiry >= today).length;
  const totalUsos      = coupons.reduce((s, c) => s + c.usos, 0);
  const totalAhorro    = coupons.reduce((s, c) => {
    if (c.type === 'monto') return s + c.usos * c.discount;
    return s + c.usos * (c.discount / 100) * 150;
  }, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discount || !form.expiry || !form.maxUsos) {
      toast({ title: 'Completa todos los campos', variant: 'destructive' });
      return;
    }
    const code = form.code.trim().toUpperCase().replace(/\s/g, '');
    if (coupons.some(c => c.code === code)) {
      toast({ title: 'El código ya existe', variant: 'destructive' });
      return;
    }
    addCoupon({
      code,
      discount:  parseFloat(form.discount),
      type:      form.type,
      minCompra: parseFloat(form.minCompra) || 0,
      expiry:    form.expiry,
      maxUsos:   parseInt(form.maxUsos),
      activo:    true,
    });
    toast({ title: 'Cupón creado', description: `${code} ya está disponible en el catálogo web.` });
    setIsDialogOpen(false);
    setForm({ code: '', discount: '', type: 'porcentaje', minCompra: '', expiry: '', maxUsos: '' });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const isExpired = (c: Coupon) => c.expiry < today;
  const isAgotado = (c: Coupon) => c.usos >= c.maxUsos;

  const getStatus = (c: Coupon) => {
    if (!c.activo)     return { label: 'Inactivo',  cls: 'bg-slate-100 text-slate-500 border-slate-200' };
    if (isExpired(c))  return { label: 'Expirado',  cls: 'bg-red-100 text-red-600 border-red-200'       };
    if (isAgotado(c))  return { label: 'Agotado',   cls: 'bg-amber-100 text-amber-700 border-amber-200' };
    return               { label: 'Activo',    cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-md">
            <Tag className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Descuentos y Cupones</h1>
            <p className="page-subtitle">Gestiona los códigos de descuento para el catálogo web</p>
          </div>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90 gap-2 rounded-xl shadow-md">
          <Plus className="h-4 w-4" /> Nuevo Cupón
        </Button>
      </div>

      {/* Create dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Crear Cupón de Descuento</DialogTitle>
            <DialogDescription>El cupón estará disponible de inmediato en el catálogo web.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label>Código del cupón</Label>
              <Input
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                placeholder="Ej. VERANO25"
                className="font-mono tracking-wider"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Tipo de descuento</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as 'porcentaje' | 'monto' }))}
                >
                  <option value="porcentaje">Porcentaje (%)</option>
                  <option value="monto">Monto fijo (S/)</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>{form.type === 'porcentaje' ? 'Descuento (%)' : 'Monto (S/)'}</Label>
                <Input
                  type="number"
                  min="1"
                  max={form.type === 'porcentaje' ? '90' : '500'}
                  value={form.discount}
                  onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
                  placeholder={form.type === 'porcentaje' ? 'Ej. 20' : 'Ej. 15'}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Compra mínima (S/)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.minCompra}
                  onChange={e => setForm(f => ({ ...f, minCompra: e.target.value }))}
                  placeholder="0 = sin mínimo"
                />
              </div>
              <div className="space-y-1">
                <Label>Usos máximos</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.maxUsos}
                  onChange={e => setForm(f => ({ ...f, maxUsos: e.target.value }))}
                  placeholder="Ej. 50"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Fecha de expiración</Label>
              <Input
                type="date"
                min={today}
                value={form.expiry}
                onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-primary">Crear Cupón</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cupón {deleteTarget?.code}?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. El cupón dejará de funcionar inmediatamente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => { if (deleteTarget) { deleteCoupon(deleteTarget.id); toast({ title: 'Cupón eliminado', variant: 'destructive' }); setDeleteTarget(null); } }}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Cupones activos',   value: totalActivos,            icon: Tag,         color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Total cupones',     value: coupons.length,          icon: ShoppingCart, color: 'text-primary',     bg: 'bg-primary/5'  },
          { label: 'Usos totales',      value: totalUsos,               icon: Users,        color: 'text-violet-700',  bg: 'bg-violet-50'  },
          { label: 'Ahorro estimado',   value: `S/ ${totalAhorro.toFixed(0)}`, icon: DollarSign, color: 'text-amber-700', bg: 'bg-amber-50' },
        ].map((k, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className={`w-8 h-8 rounded-xl ${k.bg} ${k.color} flex items-center justify-center mb-3`}>
                <k.icon className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{k.label}</p>
              <p className={`text-2xl font-black mt-0.5 ${k.color}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coupon list */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4 text-slate-400" /> Lista de Cupones
          </CardTitle>
          <CardDescription>Los cupones activos son validados automáticamente en el catálogo web</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {coupons.map(c => {
              const status    = getStatus(c);
              const usoPct    = Math.min(100, Math.round((c.usos / c.maxUsos) * 100));
              const isUsable  = c.activo && !isExpired(c) && !isAgotado(c);
              return (
                <div
                  key={c.id}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-2xl border transition-colors',
                    isUsable ? 'bg-white border-slate-100 hover:border-slate-200' : 'bg-slate-50 border-slate-100 opacity-70'
                  )}
                >
                  {/* Code + badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-mono font-black text-base text-slate-800 tracking-widest">{c.code}</span>
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${status.cls}`}>
                        {status.label}
                      </Badge>
                      <button
                        onClick={() => copyCode(c.code)}
                        className="text-slate-400 hover:text-slate-700 transition-colors"
                        title="Copiar código"
                      >
                        {copied === c.code ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    {/* Details row */}
                    <div className="flex flex-wrap gap-3 text-[10px] text-slate-500 mb-2">
                      <span className="flex items-center gap-1">
                        {c.type === 'porcentaje' ? <Percent className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />}
                        <strong className="text-slate-700">{c.discount}{c.type === 'porcentaje' ? '%' : ' S/'}</strong> de descuento
                      </span>
                      {c.minCompra > 0 && (
                        <span className="flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3" />
                          Mín. S/ {c.minCompra}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        Expira {c.expiry}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {c.usos}/{c.maxUsos} usos
                      </span>
                    </div>

                    {/* Usage bar */}
                    <div className="flex items-center gap-2">
                      <Progress value={usoPct} className="h-1 flex-1" />
                      <span className="text-[9px] text-slate-400 font-bold w-8 text-right">{usoPct}%</span>
                    </div>

                    {/* Alerts */}
                    {usoPct >= 80 && isUsable && (
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-amber-600">
                        <AlertCircle className="h-3 w-3" />
                        Casi agotado — considera crear más usos
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleCoupon(c.id)}
                      className={cn(
                        'transition-colors',
                        c.activo ? 'text-emerald-500 hover:text-emerald-700' : 'text-slate-300 hover:text-slate-500'
                      )}
                      title={c.activo ? 'Desactivar' : 'Activar'}
                    >
                      {c.activo ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info panel */}
      <Card className="border-none shadow-sm bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-5 flex items-start gap-3">
          <Tag className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-slate-800 mb-1">¿Cómo funcionan los cupones?</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Los clientes ingresan el código en el carrito de compras del catálogo web antes de finalizar su pedido.
              El sistema valida automáticamente que el cupón esté activo, no haya expirado y el monto mínimo se cumpla.
              Cada uso queda registrado aquí en tiempo real.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

