"use client";

import { useState } from 'react';
import { Package, Search, Plus, Edit, Trash2, ChevronRight, Filter, FileSpreadsheet, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast';
import { useAppStore, type Producto } from '@/store/appStore';
import type { ProductDescriptionOutput } from '@/ai/flows/admin-product-description-flow';

type FormErrors = { name?: string; category?: string; price?: string; stock?: string };

function getStatus(stock: number) {
  if (stock === 0)   return 'Agotado';
  if (stock < 5)     return 'Crítico';
  if (stock < 10)    return 'Stock Bajo';
  return 'Activo';
}

function getStatusStyle(stock: number) {
  if (stock === 0)  return 'bg-red-100 text-red-700 border-red-200';
  if (stock < 5)    return 'bg-red-50 text-red-600 border-red-100';
  if (stock < 10)   return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-green-50 text-green-700 border-green-200';
}

export default function ProductosPage() {
  const products       = useAppStore((s) => s.products);
  const addProduct     = useAppStore((s) => s.addProduct);
  const updateProduct  = useAppStore((s) => s.updateProduct);
  const deleteProduct  = useAppStore((s) => s.deleteProduct);

  const [searchTerm, setSearchTerm]         = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [isDialogOpen, setIsDialogOpen]     = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [deleteTarget, setDeleteTarget]     = useState<Producto | null>(null);
  const [form, setForm]   = useState({ name: '', category: '', price: '', stock: '' });
  const [errors, setErrors] = useState<FormErrors>({});

  /* ── IA Product Description state ── */
  const [descTarget, setDescTarget]         = useState<Producto | null>(null);
  const [descLoading, setDescLoading]       = useState(false);
  const [descResult, setDescResult]         = useState<ProductDescriptionOutput | null>(null);
  const [copiedField, setCopiedField]       = useState<string | null>(null);

  const handleGenerateDesc = async (p: Producto) => {
    setDescTarget(p);
    setDescResult(null);
    setDescLoading(true);
    try {
      const res = await fetch('/api/ai/product-description', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: p.name, category: p.category, price: p.price, stock: p.stock }),
      });
      const data = await res.json() as ProductDescriptionOutput;
      setDescResult(data);
    } catch {
      toast({ title: 'Error al generar descripción', variant: 'destructive' });
    } finally {
      setDescLoading(false);
    }
  };

  const handleCopyField = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
    toast({ title: 'Copiado al portapapeles' });
  };

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'Todos' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'El nombre es requerido';
    else if (form.name.trim().length < 3) errs.name = 'Mínimo 3 caracteres';
    if (!form.category.trim()) errs.category = 'La categoría es requerida';
    const price = parseFloat(form.price);
    if (!form.price) errs.price = 'El precio es requerido';
    else if (isNaN(price) || price <= 0) errs.price = 'El precio debe ser mayor a S/ 0.00';
    const stock = parseInt(form.stock);
    if (form.stock === '') errs.stock = 'El stock es requerido';
    else if (isNaN(stock) || stock < 0) errs.stock = 'El stock no puede ser negativo';
    return errs;
  };

  const openNew = () => {
    setEditingProduct(null);
    setForm({ name: '', category: '', price: '', stock: '' });
    setErrors({});
    setIsDialogOpen(true);
  };

  const openEdit = (p: Producto) => {
    setEditingProduct(p);
    setForm({ name: p.name, category: p.category, price: String(p.price), stock: String(p.stock) });
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    if (editingProduct) {
      updateProduct({ ...editingProduct, name: form.name.trim(), category: form.category.trim(), price: parseFloat(form.price), stock: parseInt(form.stock) });
      toast({ title: 'Producto actualizado', description: `${form.name} editado correctamente.` });
    } else {
      const slug = form.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[áéíóú]/g, (c) => ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' }[c] || c));
      const newId = `${slug}-${Date.now().toString().slice(-4)}`;
      addProduct({ id: newId, name: form.name.trim(), category: form.category.trim(), price: parseFloat(form.price), stock: parseInt(form.stock) });
      toast({ title: 'Producto añadido', description: `${form.name} ya está en el catálogo.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (p: Producto) => {
    deleteProduct(p.id);
    toast({ title: 'Producto eliminado', description: `${p.name} fue removido.`, variant: 'destructive' });
    setDeleteTarget(null);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Nombre', 'Categoría', 'Precio (S/)', 'Stock', 'Estado'];
    const rows = filtered.map(p => [p.id, p.name, p.category, p.price.toFixed(2), String(p.stock), getStatus(p.stock)]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'productos_patli.csv'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'CSV exportado', description: `${filtered.length} productos descargados.` });
  };

  const totalAgotados   = products.filter(p => p.stock === 0).length;
  const totalCritico    = products.filter(p => p.stock > 0 && p.stock < 5).length;
  const totalStockBajo  = products.filter(p => p.stock >= 5 && p.stock < 10).length;
  const categorias      = new Set(products.map(p => p.category)).size;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-secondary to-blue-700 rounded-2xl flex items-center justify-center shadow-md">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Catálogo de Productos</h1>
            <p className="page-subtitle">Gestiona las prendas, precios y stock de PAT-LI</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={exportCSV}>
            <FileSpreadsheet className="h-4 w-4 text-green-600" /> CSV
          </Button>
          <Button onClick={openNew} className="bg-secondary hover:bg-secondary/90 gap-2">
            <Plus className="h-4 w-4" /> Agregar Producto
          </Button>
        </div>
      </div>

      {/* Dialog crear / editar */}
      <Dialog open={isDialogOpen} onOpenChange={(v) => { setIsDialogOpen(v); if (!v) setErrors({}); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Modifica los datos del producto.' : 'Completa la ficha del producto para añadirlo al catálogo.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label>Nombre del Producto</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej. Polo Pima Negro XL"
                className={errors.name ? 'border-destructive' : ''} />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Categoría</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  {['Caballeros', 'Damas', 'Niños', 'Bebés', 'Deportivo', 'Accesorios'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
              </div>
              <div className="space-y-1">
                <Label>Precio (S/)</Label>
                <Input type="number" step="0.01" min="0.01" value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00"
                  className={errors.price ? 'border-destructive' : ''} />
                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Stock</Label>
              <Input type="number" min="0" value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0"
                className={errors.stock ? 'border-destructive' : ''} />
              {errors.stock && <p className="text-xs text-destructive">{errors.stock}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-primary">
                {editingProduct ? 'Guardar Cambios' : 'Añadir al Catálogo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Productos',     value: products.length,            sub: 'en el catálogo',         icon: Package,     grad: 'from-[#1e3a5f] to-[#2563eb]', valCls: 'text-slate-900' },
          { label: 'Categorías',          value: categorias,                 sub: 'líneas de producto',     icon: ChevronRight,grad: 'from-cyan-500 to-blue-600',    valCls: 'text-slate-900' },
          { label: 'Stock Bajo/Crítico',  value: totalStockBajo + totalCritico, sub: 'requieren atención',  icon: Filter,      grad: 'from-amber-400 to-orange-500', valCls: (totalStockBajo + totalCritico) > 0 ? 'text-amber-700' : 'text-slate-900' },
          { label: 'Agotados',            value: totalAgotados,              sub: 'sin stock',              icon: Trash2,      grad: 'from-red-400 to-red-600',      valCls: totalAgotados > 0 ? 'text-red-600' : 'text-slate-900' },
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

      {/* Alerta visual si hay productos críticos */}
      {(totalAgotados > 0 || totalCritico > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-red-500 text-lg">⚠️</span>
          <div>
            <p className="font-bold text-red-700 text-sm">Alerta de inventario</p>
            <p className="text-xs text-red-600 mt-0.5">
              {totalAgotados > 0 && `${totalAgotados} producto(s) agotado(s). `}
              {totalCritico > 0 && `${totalCritico} producto(s) en nivel crítico (< 5 unidades).`}
            </p>
          </div>
        </div>
      )}

      {/* Tabla */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-secondary to-blue-700" />
        <CardHeader className="py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar por nombre, categoría o ID..." className="pl-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex gap-1 flex-wrap">
              {categories.map(c => (
                <Button key={c} variant={categoryFilter === c ? 'default' : 'outline'} size="sm"
                  className={`text-xs h-8 rounded-lg ${categoryFilter === c ? 'bg-primary' : 'border-slate-200'}`}
                  onClick={() => setCategoryFilter(c)}>
                  {c}
                </Button>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">{filtered.length} de {products.length} productos</p>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center text-slate-400 py-10">No se encontraron productos.</td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <p className="font-bold text-slate-800">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{p.id}</p>
                  </td>
                  <td><span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{p.category}</span></td>
                  <td><span className="font-black text-primary">S/ {p.price.toFixed(2)}</span></td>
                  <td>
                    <span className={`font-black ${p.stock === 0 ? 'text-red-600' : p.stock < 5 ? 'text-red-500' : p.stock < 10 ? 'text-amber-600' : 'text-slate-700'}`}>
                      {p.stock} ud.
                    </span>
                  </td>
                  <td>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusStyle(p.stock)}`}>
                      {getStatus(p.stock)}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 rounded-lg text-violet-500 hover:text-violet-700 hover:bg-violet-50"
                        title="Generar descripción IA"
                        onClick={() => handleGenerateDesc(p)}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-primary" onClick={() => openEdit(p)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => setDeleteTarget(p)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* IA Product Description Dialog */}
      <Dialog open={!!descTarget} onOpenChange={(v) => { if (!v) { setDescTarget(null); setDescResult(null); } }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              Descripción Generada por IA
            </DialogTitle>
            <DialogDescription>
              Marketing copy para <span className="font-bold text-slate-700">{descTarget?.name}</span> — generado por Gemini
            </DialogDescription>
          </DialogHeader>

          {descLoading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              <p className="text-sm">Gemini está redactando el contenido…</p>
            </div>
          )}

          {descResult && !descLoading && (
            <div className="space-y-4 py-2">
              {/* Short description */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest">Descripción Corta (Catálogo)</p>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1"
                    onClick={() => handleCopyField('short', descResult.shortDescription)}>
                    {copiedField === 'short' ? <><Check className="h-2.5 w-2.5 text-emerald-600" /> Copiado</> : <><Copy className="h-2.5 w-2.5" /> Copiar</>}
                  </Button>
                </div>
                <p className="text-sm font-medium text-slate-800 p-3 bg-violet-50 rounded-xl border border-violet-100">
                  {descResult.shortDescription}
                </p>
              </div>

              {/* Long description */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest">Descripción Larga</p>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1"
                    onClick={() => handleCopyField('long', descResult.longDescription)}>
                    {copiedField === 'long' ? <><Check className="h-2.5 w-2.5 text-emerald-600" /> Copiado</> : <><Copy className="h-2.5 w-2.5" /> Copiar</>}
                  </Button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed p-3 bg-slate-50 rounded-xl border border-slate-100">
                  {descResult.longDescription}
                </p>
              </div>

              {/* Keywords */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest">Keywords SEO</p>
                <div className="flex flex-wrap gap-1.5">
                  {descResult.keywords.map((kw, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      #{kw}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Call to action */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest">Call to Action</p>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1"
                    onClick={() => handleCopyField('cta', descResult.callToAction)}>
                    {copiedField === 'cta' ? <><Check className="h-2.5 w-2.5 text-emerald-600" /> Copiado</> : <><Copy className="h-2.5 w-2.5" /> Copiar</>}
                  </Button>
                </div>
                <p className="text-sm font-bold text-primary p-3 bg-primary/5 rounded-xl border border-primary/10">
                  {descResult.callToAction}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDescTarget(null); setDescResult(null); }}>Cerrar</Button>
            {descTarget && !descLoading && (
              <Button
                className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
                onClick={() => handleGenerateDesc(descTarget)}
              >
                <Sparkles className="h-4 w-4" /> Regenerar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar <span className="font-bold text-slate-900">"{deleteTarget?.name}"</span>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}>
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

