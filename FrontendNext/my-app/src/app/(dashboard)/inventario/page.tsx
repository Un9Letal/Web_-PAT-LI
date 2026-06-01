"use client";

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import {
  Warehouse, ArrowUpRight, ArrowDownRight, History, AlertTriangle,
  RefreshCcw, Search, ArrowRightLeft, Loader2, BrainCircuit, Zap,
  PackagePlus, TrendingDown, CheckCircle2, Package, Sparkles, Clock, ShieldAlert,
} from 'lucide-react';
import type { StockPredictionOutput } from '@/ai/flows/admin-stock-prediction-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { optimizeInventory, type InventoryOptimizationOutput } from '@/ai/flows/admin-inventory-optimization-flow';

type Movimiento = { id: string; product: string; type: 'entrada' | 'salida' | 'ajuste'; qty: number; user: string; date: string; motivo: string };
type MovFormErrors = { product?: string; qty?: string; user?: string; motivo?: string };

const MAX_STOCK_REF = 50; // reference for progress bar

const initialMovements: Movimiento[] = [
  { id: 'MOV-001', product: 'Polo Algodón Pima Blanco',    type: 'entrada', qty: 50,  user: 'Admin Ica',    date: '2025-05-10 10:30', motivo: 'Reposición semanal'    },
  { id: 'MOV-002', product: 'Jean Skinny Azul Ica',        type: 'salida',  qty: 3,   user: 'Caja 01',      date: '2025-05-10 11:15', motivo: 'Venta directa'         },
  { id: 'MOV-003', product: 'Vestido Lino Floral',         type: 'salida',  qty: 2,   user: 'Venta Online', date: '2025-05-09 15:45', motivo: 'Pedido web'            },
  { id: 'MOV-004', product: 'Casaca Bomber Premium Negra', type: 'entrada', qty: 8,   user: 'Suministros',  date: '2025-05-09 09:00', motivo: 'Reposición proveedor'  },
  { id: 'MOV-005', product: 'Medias Pack x3',              type: 'salida',  qty: 15,  user: 'Caja 02',      date: '2025-05-08 18:20', motivo: 'Ventas del día'        },
  { id: 'MOV-006', product: 'Leggings Deportivos Mujer',   type: 'entrada', qty: 20,  user: 'Almacén',      date: '2025-05-08 08:00', motivo: 'Nuevo lote proveedor'  },
  { id: 'MOV-007', product: 'Blazer Entallado Negro',      type: 'ajuste',  qty: 2,   user: 'Admin Ica',    date: '2025-05-07 16:30', motivo: 'Corrección inventario' },
  { id: 'MOV-008', product: 'Polo Rayas Náutico',          type: 'salida',  qty: 5,   user: 'Caja 01',      date: '2025-05-07 14:00', motivo: 'Ventas del día'        },
  { id: 'MOV-009', product: 'Set Bodies Bebé x3',          type: 'entrada', qty: 30,  user: 'Suministros',  date: '2025-05-06 09:30', motivo: 'Reposición mensual'    },
  { id: 'MOV-010', product: 'Conjunto Yoga Mujer',         type: 'salida',  qty: 4,   user: 'Venta Online', date: '2025-05-06 12:00', motivo: 'Pedidos web'           },
  { id: 'MOV-011', product: 'Vestido Midi Elegante',       type: 'salida',  qty: 2,   user: 'Caja 02',      date: '2025-05-05 17:45', motivo: 'Venta directa'         },
  { id: 'MOV-012', product: 'Pantalón Drill Camel',        type: 'entrada', qty: 15,  user: 'Almacén',      date: '2025-05-05 08:00', motivo: 'Reposición semanal'    },
];

export default function InventarioPage() {
  const completedSales  = useAppStore((s) => s.completedSales);
  const products        = useAppStore((s) => s.products);
  const updateProduct   = useAppStore((s) => s.updateProduct);

  const [movements, setMovements]       = useState<Movimiento[]>(initialMovements);
  const [searchTerm, setSearchTerm]     = useState('');
  const [stockSearch, setStockSearch]   = useState('');
  const [stockFilter, setStockFilter]   = useState<'todos' | 'critico' | 'bajo' | 'ok'>('todos');
  const [isSyncing, setIsSyncing]       = useState(false);
  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [isMovementOpen, setIsMovementOpen] = useState(false);
  const [restockTarget, setRestockTarget]   = useState<typeof products[0] | null>(null);
  const [restockQty, setRestockQty]         = useState('');
  const [movErrors, setMovErrors]       = useState<MovFormErrors>({});
  const [aiResult, setAiResult]         = useState<InventoryOptimizationOutput | null>(null);
  const [prediction, setPrediction]     = useState<StockPredictionOutput | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [form, setForm] = useState({ product: '', type: 'entrada', qty: '', user: 'Admin', motivo: '' });

  const handlePredictStock = async () => {
    setIsPredicting(true);
    // Calcular velocidad de ventas por producto desde completedSales
    const salesMap = new Map<string, number>();
    completedSales.forEach(s => s.items.forEach(item => {
      salesMap.set(item.id, (salesMap.get(item.id) ?? 0) + item.quantity);
    }));
    const recentSales = Array.from(salesMap.entries()).map(([productId, totalSold]) => ({
      productId, totalSold, daysTracked: 7,
    }));
    try {
      const res = await fetch('/api/ai/stock-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: products.map(p => ({ id: p.id, name: p.name, category: p.category, stock: p.stock, price: p.price })),
          recentSales,
          totalWebSales: completedSales.length,
        }),
      });
      const data = await res.json();
      setPrediction(data);
    } catch {
      toast({ title: 'Error al predecir stock', variant: 'destructive' });
    } finally {
      setIsPredicting(false);
    }
  };

  // Movements from completed web sales
  const saleMovements: Movimiento[] = useMemo(() =>
    completedSales.flatMap((s) =>
      s.items.map((item) => ({
        id: `MOV-WEB-${s.id}-${item.id}`,
        product: item.description,
        type: 'salida' as const,
        qty: item.quantity,
        user: 'Venta Web',
        date: new Date(s.date).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }),
        motivo: `Pedido ${s.id}`,
      }))
    ), [completedSales]
  );

  const allMovements = useMemo(() => [...saleMovements, ...movements], [saleMovements, movements]);
  const filteredMov  = allMovements.filter(m =>
    m.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stock overview with filters
  const filteredProducts = useMemo(() => {
    let list = products.filter(p =>
      p.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(stockSearch.toLowerCase())
    );
    if (stockFilter === 'critico') list = list.filter(p => p.stock > 0 && p.stock < 5);
    if (stockFilter === 'bajo')    list = list.filter(p => p.stock >= 5 && p.stock < 10);
    if (stockFilter === 'ok')      list = list.filter(p => p.stock >= 10);
    return list.sort((a, b) => a.stock - b.stock); // ascending by stock (critical first)
  }, [products, stockSearch, stockFilter]);

  // KPIs from store
  const totalUnits    = products.reduce((s, p) => s + p.stock, 0);
  const criticos      = products.filter(p => p.stock > 0 && p.stock < 5).length;
  const agotados      = products.filter(p => p.stock === 0).length;
  const totalEntradas = allMovements.filter(m => m.type === 'entrada').reduce((s, m) => s + m.qty, 0);
  const totalSalidas  = allMovements.filter(m => m.type === 'salida').reduce((s, m) => s + m.qty, 0);

  const validateMovement = (): MovFormErrors => {
    const errs: MovFormErrors = {};
    if (!form.product.trim()) errs.product = 'Producto requerido';
    else if (form.product.trim().length < 3) errs.product = 'Mínimo 3 caracteres';
    const qty = parseInt(form.qty);
    if (!form.qty) errs.qty = 'Cantidad requerida';
    else if (isNaN(qty) || qty < 1) errs.qty = 'Mínimo 1 unidad';
    if (!form.user.trim()) errs.user = 'Responsable requerido';
    if (!form.motivo.trim()) errs.motivo = 'Motivo requerido';
    return errs;
  };

  const handleSync = () => {
    setIsSyncing(true);
    toast({ title: 'Sincronizando almacenes…', description: 'Actualizando datos con la base central.' });
    setTimeout(() => {
      setIsSyncing(false);
      toast({ title: 'Sincronización completa', description: 'El stock es el más reciente.' });
    }, 2000);
  };

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const inventoryData = products.slice(0, 10).map(p => ({ name: p.name, stock: p.stock, category: p.category }));
      const result = await optimizeInventory({ inventory: inventoryData });
      setAiResult(result);
      toast({ title: 'Análisis IA Completo', description: 'Nuevas recomendaciones generadas.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error en IA', description: 'No se pudo completar el análisis.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRegisterMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateMovement();
    if (Object.keys(errs).length > 0) { setMovErrors(errs); return; }
    setMovErrors({});
    const now = new Date();
    const dateStr = `${now.toISOString().split('T')[0]} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newId = `MOV-${String(movements.length + 1).padStart(3, '0')}`;
    setMovements(prev => [{
      id: newId, product: form.product.trim(),
      type: form.type as 'entrada' | 'salida' | 'ajuste',
      qty: parseInt(form.qty), user: form.user.trim(),
      date: dateStr, motivo: form.motivo.trim(),
    }, ...prev]);
    toast({ title: 'Movimiento registrado', description: `${form.type.toUpperCase()} de ${form.qty} ud. de ${form.product}.` });
    setIsMovementOpen(false);
    setForm({ product: '', type: 'entrada', qty: '', user: 'Admin', motivo: '' });
  };

  const handleRestock = () => {
    if (!restockTarget) return;
    const qty = parseInt(restockQty);
    if (!restockQty || isNaN(qty) || qty < 1) {
      toast({ title: 'Cantidad inválida', variant: 'destructive' }); return;
    }
    updateProduct({ ...restockTarget, stock: restockTarget.stock + qty });
    setMovements(prev => [{
      id: `MOV-R-${Date.now().toString().slice(-6)}`,
      product: restockTarget.name, type: 'entrada', qty,
      user: 'Admin', date: new Date().toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }),
      motivo: 'Reabastecimiento manual',
    }, ...prev]);
    toast({ title: `✅ Reabastecido: ${restockTarget.name}`, description: `+${qty} unidades. Nuevo stock: ${restockTarget.stock + qty}` });
    setRestockTarget(null);
    setRestockQty('');
  };

  function getStockColor(stock: number) {
    if (stock === 0) return 'text-red-600';
    if (stock < 5)  return 'text-red-500';
    if (stock < 10) return 'text-amber-600';
    return 'text-green-600';
  }
  function getStockBg(stock: number) {
    if (stock === 0) return 'bg-red-500';
    if (stock < 5)  return 'bg-orange-500';
    if (stock < 10) return 'bg-amber-400';
    return 'bg-green-500';
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] rounded-2xl flex items-center justify-center shadow-md">
            <Warehouse className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Control de Inventario</h1>
            <p className="page-subtitle">{products.length} productos · {totalUnits.toLocaleString()} unidades en stock</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-2 border-violet-400 text-violet-700 hover:bg-violet-50" onClick={handlePredictStock} disabled={isPredicting}>
            {isPredicting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isPredicting ? 'Prediciendo…' : 'Predecir Stock IA'}
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-primary text-primary" onClick={handleAiAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />} Optimización IA
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            {isSyncing ? 'Sincronizando…' : 'Sincronizar'}
          </Button>
          <Button size="sm" className="gap-2 bg-primary" onClick={() => setIsMovementOpen(true)}>
            <ArrowRightLeft className="h-4 w-4" /> Registrar Movimiento
          </Button>
        </div>
      </div>

      {/* Restock Dialog */}
      <Dialog open={!!restockTarget} onOpenChange={(v) => { if (!v) { setRestockTarget(null); setRestockQty(''); } }}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><PackagePlus className="h-5 w-5 text-primary" /> Reabastecer Producto</DialogTitle>
            <DialogDescription>{restockTarget?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm text-slate-500">Stock actual</span>
              <span className={`text-xl font-black ${getStockColor(restockTarget?.stock ?? 0)}`}>{restockTarget?.stock ?? 0} ud.</span>
            </div>
            <div className="space-y-1">
              <Label>Unidades a agregar</Label>
              <Input type="number" min="1" value={restockQty} onChange={e => setRestockQty(e.target.value)} placeholder="Ej. 20" />
            </div>
            {restockQty && !isNaN(parseInt(restockQty)) && parseInt(restockQty) > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center">
                <span className="text-sm text-green-700">Nuevo stock</span>
                <span className="text-lg font-black text-green-600">{(restockTarget?.stock ?? 0) + parseInt(restockQty)} ud.</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button className="w-full bg-primary gap-2" onClick={handleRestock}>
              <CheckCircle2 className="h-4 w-4" /> Confirmar Reabastecimiento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Movement Dialog */}
      <Dialog open={isMovementOpen} onOpenChange={(v) => { setIsMovementOpen(v); if (!v) setMovErrors({}); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registro de Movimiento</DialogTitle>
            <DialogDescription>Añade entradas, salidas o ajustes de forma manual.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegisterMovement} className="space-y-4 py-4">
            <div className="space-y-1">
              <Label>Nombre del Producto</Label>
              <Input value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))} placeholder="Ej. Polo Pima Blanco"
                className={movErrors.product ? 'border-destructive' : ''} />
              {movErrors.product && <p className="text-xs text-destructive">{movErrors.product}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Tipo</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="entrada">Entrada (+)</option>
                  <option value="salida">Salida (-)</option>
                  <option value="ajuste">Ajuste</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Cantidad</Label>
                <Input type="number" min="1" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
                  placeholder="0" className={movErrors.qty ? 'border-destructive' : ''} />
                {movErrors.qty && <p className="text-xs text-destructive">{movErrors.qty}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Responsable</Label>
              <Input value={form.user} onChange={e => setForm(f => ({ ...f, user: e.target.value }))} placeholder="Ej. Admin, Caja 01"
                className={movErrors.user ? 'border-destructive' : ''} />
              {movErrors.user && <p className="text-xs text-destructive">{movErrors.user}</p>}
            </div>
            <div className="space-y-1">
              <Label>Motivo</Label>
              <Input value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} placeholder="Ej. Reposición semanal"
                className={movErrors.motivo ? 'border-destructive' : ''} />
              {movErrors.motivo && <p className="text-xs text-destructive">{movErrors.motivo}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-primary font-bold">Guardar Movimiento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Result */}
      {aiResult && (
        <Card className="border-accent bg-accent/5 animate-in slide-in-from-top-4 duration-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><Zap className="h-5 w-5 text-accent fill-accent" /> Recomendaciones IA</CardTitle>
            <CardDescription>{aiResult.summary}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              {aiResult.recommendations.map((rec, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-accent/20 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 truncate">{rec.product}</p>
                  <Badge variant={rec.action === 'Reponer' ? 'destructive' : rec.action === 'Liquidar' ? 'secondary' : 'outline'}>{rec.action}</Badge>
                  <p className="text-[10px] text-slate-600 leading-tight mt-2">{rec.reason}</p>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="mt-4 text-xs font-bold text-accent" onClick={() => setAiResult(null)}>Cerrar Análisis</Button>
          </CardContent>
        </Card>
      )}

      {/* Predicción de Stock IA */}
      {(isPredicting || prediction) && (
        <Card className="border-violet-200 bg-violet-50/50 animate-in slide-in-from-top-4 duration-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-600" /> Predicción de Agotamiento — Gemini IA
              </CardTitle>
              {prediction && (
                <Button variant="ghost" size="sm" className="text-xs text-violet-600 h-7" onClick={() => setPrediction(null)}>
                  Cerrar
                </Button>
              )}
            </div>
            {prediction && <CardDescription className="text-violet-600 text-xs">{prediction.generalInsight}</CardDescription>}
          </CardHeader>
          <CardContent>
            {isPredicting && (
              <div className="flex items-center justify-center gap-3 py-6 text-violet-600">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm">Analizando ritmo de ventas y niveles de stock…</span>
              </div>
            )}
            {prediction && !isPredicting && (
              <div className="space-y-3">
                {prediction.alerts.map((alert, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                    alert.urgency === 'critico'     ? 'bg-red-50 border-red-200' :
                    alert.urgency === 'moderado'    ? 'bg-amber-50 border-amber-200' :
                                                     'bg-blue-50 border-blue-200'
                  }`}>
                    {alert.urgency === 'critico'
                      ? <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      : alert.urgency === 'moderado'
                        ? <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        : <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5 flex-wrap">
                        <p className="text-xs font-bold text-slate-800 truncate">{alert.productName}</p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge className={
                            alert.urgency === 'critico'  ? 'bg-red-500 text-white text-[9px]' :
                            alert.urgency === 'moderado' ? 'bg-amber-500 text-white text-[9px]' :
                                                          'bg-blue-500 text-white text-[9px]'
                          }>
                            {alert.urgency}
                          </Badge>
                          <span className="text-[10px] font-black text-slate-600">
                            ~{alert.daysLeft} día{alert.daysLeft !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600">{alert.recommendation}</p>
                    </div>
                  </div>
                ))}
                {prediction.restockPriority.length > 0 && (
                  <div className="pt-2 border-t border-violet-200 flex items-center gap-2 flex-wrap">
                    <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest">Prioridad de reabastecimiento:</p>
                    {prediction.restockPriority.map(id => {
                      const p = products.find(p => p.id === id);
                      return p ? (
                        <Badge key={id} variant="outline" className="text-[9px] border-violet-300 text-violet-700 bg-violet-50">
                          {p.name.split(' ').slice(0, 3).join(' ')}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Productos', value: products.length,            sub: `${new Set(products.map(p => p.category)).size} categorías`, icon: Package,        grad: 'from-[#1e3a5f] to-[#2563eb]', valCls: 'text-slate-900' },
          { label: 'Unidades Totales',value: totalUnits.toLocaleString(), sub: `${totalEntradas} entradas`,        icon: ArrowUpRight,   grad: 'from-emerald-400 to-teal-600', valCls: 'text-emerald-700' },
          { label: 'Salidas',         value: totalSalidas,                sub: 'Ventas y ajustes',                 icon: ArrowDownRight, grad: 'from-rose-400 to-red-600',     valCls: 'text-rose-600' },
          { label: 'Stock Crítico',   value: criticos,                    sub: 'Menos de 5 unidades',              icon: AlertTriangle,  grad: 'from-amber-400 to-orange-500', valCls: criticos > 0 ? 'text-amber-700' : 'text-slate-900' },
          { label: 'Agotados',        value: agotados,                    sub: 'Sin stock disponible',             icon: ShieldAlert,    grad: 'from-red-400 to-red-600',      valCls: agotados > 0 ? 'text-red-600' : 'text-slate-900' },
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

      {/* Stock Overview Table */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Stock Actual por Producto</CardTitle>
              <CardDescription>Niveles en tiempo real — conectado al catálogo digital</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['todos', 'critico', 'bajo', 'ok'] as const).map((f) => (
                <Button key={f} size="sm" variant={stockFilter === f ? 'default' : 'outline'}
                  className={`text-xs h-8 ${stockFilter === f ? 'bg-primary' : ''}`}
                  onClick={() => setStockFilter(f)}>
                  {f === 'todos' ? 'Todos' : f === 'critico' ? '🔴 Crítico' : f === 'bajo' ? '🟡 Bajo' : '🟢 OK'}
                </Button>
              ))}
            </div>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Buscar producto o categoría..." className="pl-9 h-9" value={stockSearch} onChange={e => setStockSearch(e.target.value)} />
          </div>
          <p className="text-xs text-slate-400">{filteredProducts.length} de {products.length} productos</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold truncate">{p.name}</p>
                    <Badge variant="outline" className="text-[9px] shrink-0">{p.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getStockBg(p.stock)}`}
                        style={{ width: `${Math.min((p.stock / MAX_STOCK_REF) * 100, 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-black w-16 text-right shrink-0 ${getStockColor(p.stock)}`}>
                      {p.stock === 0 ? 'AGOTADO' : `${p.stock} ud.`}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 h-8 gap-1 text-xs border-primary/30 text-primary hover:bg-primary/5"
                  onClick={() => setRestockTarget(p)}
                >
                  <PackagePlus className="h-3.5 w-3.5" /> Reabastecer
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Movements Log */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-slate-400" /> Historial de Movimientos</CardTitle>
              <CardDescription>Registro cronológico de flujos de mercadería ({allMovements.length} movimientos)</CardDescription>
            </div>
          </div>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input placeholder="Buscar por producto o código..." className="pl-10 h-11 rounded-xl" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <table className="w-full admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cant.</th>
                <th>Motivo</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              {filteredMov.length === 0 && <tr><td colSpan={6} className="text-center text-slate-400 py-10">Sin movimientos.</td></tr>}
              {filteredMov.map(m => (
                <tr key={m.id}>
                  <td><span className="text-[10px] font-bold text-slate-400">{m.date}</span></td>
                  <td><span className="font-semibold text-slate-800">{m.product}</span></td>
                  <td>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      m.type === 'entrada' ? 'bg-emerald-100 text-emerald-700' :
                      m.type === 'salida'  ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {m.type.toUpperCase()}
                    </span>
                  </td>
                  <td><span className={`font-black ${m.type === 'entrada' ? 'text-emerald-600' : m.type === 'salida' ? 'text-red-500' : 'text-blue-600'}`}>
                    {m.type === 'entrada' ? '+' : m.type === 'salida' ? '-' : '±'}{m.qty}
                  </span></td>
                  <td><span className="text-xs text-slate-500">{m.motivo}</span></td>
                  <td>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.user === 'Venta Web' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
                      {m.user}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

