"use client";

import { useState, useMemo } from 'react';
import {
  Truck, Sparkles, Loader2, Phone, MapPin, Tag, Package,
  ClipboardList, Copy, Check, Download, Mail, AlertTriangle,
  ChevronDown, ChevronUp, Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import type { SupplierOrderOutput } from '@/ai/flows/admin-supplier-order-flow';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { drawPdfHeader, drawPdfFooter } from '@/lib/pdf-header';

const SUPPLIERS = [
  {
    id: 'sup-1',
    name: 'Textiles Gamarra S.A.C.',
    type: 'telas y confección',
    contact: 'Lima — Emporio Gamarra',
    phone: '+51 993 244 501',
    rating: 4.8,
    specialties: ['Caballeros', 'Damas', 'Deportivo'],
    color: 'bg-blue-50 border-blue-200',
    accent: 'text-blue-700',
  },
  {
    id: 'sup-2',
    name: 'Punto Kids Importaciones',
    type: 'ropa infantil',
    contact: 'Gamarra, La Victoria',
    phone: '+51 987 654 321',
    rating: 4.5,
    specialties: ['Niños', 'Bebés'],
    color: 'bg-pink-50 border-pink-200',
    accent: 'text-pink-700',
  },
  {
    id: 'sup-3',
    name: 'Accesorios del Sur E.I.R.L.',
    type: 'accesorios y complementos',
    contact: 'Ica, Perú',
    phone: '+51 956 112 233',
    rating: 4.2,
    specialties: ['Accesorios'],
    color: 'bg-amber-50 border-amber-200',
    accent: 'text-amber-700',
  },
];

const PRIORITY_STYLES = {
  urgente:  { bg: 'bg-red-50 text-red-700 border-red-200',    dot: 'bg-red-500' },
  normal:   { bg: 'bg-blue-50 text-blue-700 border-blue-200',  dot: 'bg-blue-500' },
  opcional: { bg: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
};

export default function ProveedoresPage() {
  const products = useAppStore((s) => s.products);

  const criticalProducts = useMemo(
    () => products.filter(p => p.stock < 10).sort((a, b) => a.stock - b.stock),
    [products]
  );

  const [selectedSupplier, setSelectedSupplier] = useState<typeof SUPPLIERS[0] | null>(null);
  const [orderResult, setOrderResult]           = useState<SupplierOrderOutput | null>(null);
  const [orderLoading, setOrderLoading]         = useState(false);
  const [dialogOpen, setDialogOpen]             = useState(false);
  const [emailExpanded, setEmailExpanded]       = useState(false);
  const [copied, setCopied]                     = useState(false);

  const handleGenerateOrder = async (supplier: typeof SUPPLIERS[0]) => {
    setSelectedSupplier(supplier);
    setOrderResult(null);
    setEmailExpanded(false);
    setDialogOpen(true);
    setOrderLoading(true);

    const relevantProducts = criticalProducts.filter(p =>
      supplier.specialties.includes(p.category)
    ).slice(0, 12);

    try {
      const res = await fetch('/api/ai/supplier-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products:     relevantProducts.map(p => ({ id: p.id, name: p.name, category: p.category, stock: p.stock, price: p.price })),
          supplierName: supplier.name,
          supplierType: supplier.type,
        }),
      });
      const data = await res.json() as SupplierOrderOutput;
      setOrderResult(data);
    } catch {
      toast({ title: 'Error al generar la orden', variant: 'destructive' });
      setDialogOpen(false);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleCopyEmail = () => {
    if (!orderResult) return;
    navigator.clipboard.writeText(orderResult.emailBody);
    setCopied(true);
    toast({ title: 'Email copiado al portapapeles' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    if (!orderResult || !selectedSupplier) return;
    const doc = new jsPDF() as any;

    const startY = drawPdfHeader(doc, 'Orden de Compra', `${selectedSupplier.name} · Entrega est.: ${orderResult.estimatedDays} días`);

    doc.setFontSize(12); doc.setTextColor(30, 58, 95); doc.setFont('helvetica', 'bold');
    doc.text('Detalle de Artículos', 14, startY + 7);
    doc.autoTable({
      startY: startY + 12,
      head: [['Producto', 'Prioridad', 'Cant.', 'C. Unit. (S/)', 'Subtotal (S/)']],
      body: orderResult.orderItems.map(item => [
        item.productName,
        item.priority.toUpperCase(),
        item.quantity,
        item.unitCost.toFixed(2),
        item.subtotal.toFixed(2),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      bodyStyles: { fontSize: 9 },
    });

    let y = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(12); doc.setTextColor(30, 58, 95); doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: S/ ${orderResult.totalAmount.toFixed(2)}`, 20, y);
    y += 8;
    doc.setFontSize(10); doc.setTextColor(80); doc.setFont('helvetica', 'normal');
    doc.text(`Nota: ${orderResult.notes}`, 20, y);

    if (y + 60 < 250) { y += 14; } else { doc.addPage(); y = 20; }
    doc.setFontSize(12); doc.setTextColor(30, 58, 95); doc.setFont('helvetica', 'bold');
    doc.text('Email al Proveedor', 20, y); y += 7;
    doc.setFontSize(9); doc.setTextColor(60); doc.setFont('helvetica', 'normal');
    const emailLines = doc.splitTextToSize(orderResult.emailBody, 170);
    doc.text(emailLines, 20, y);

    drawPdfFooter(doc);
    doc.save(`orden_compra_${selectedSupplier.name.replace(/\s+/g, '_')}.pdf`);
    toast({ title: 'PDF de orden descargado' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Proveedores</h1>
          <p className="text-slate-500">Gestión de proveedores y órdenes automáticas con IA</p>
        </div>
        <Badge className={cn(
          'text-sm px-3 py-1',
          criticalProducts.length > 0 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
        )}>
          {criticalProducts.length > 0
            ? `${criticalProducts.length} productos con stock bajo`
            : 'Stock saludable'}
        </Badge>
      </div>

      {/* Stock-critical alert */}
      {criticalProducts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/60 border-none shadow-sm">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">
                {criticalProducts.length} productos requieren reabastecimiento
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {criticalProducts.slice(0, 3).map(p => p.name.split(' ').slice(0, 3).join(' ')).join(' · ')}
                {criticalProducts.length > 3 && ` · y ${criticalProducts.length - 3} más`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suppliers grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SUPPLIERS.map((sup) => {
          const relCount = criticalProducts.filter(p => sup.specialties.includes(p.category)).length;
          return (
            <Card key={sup.id} className={`border shadow-sm hover:shadow-md transition-shadow ${sup.color}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Truck className={`h-5 w-5 ${sup.accent}`} />
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-700">{sup.rating}</span>
                  </div>
                </div>
                <h3 className="font-black text-slate-800 text-sm leading-tight mb-1">{sup.name}</h3>
                <p className="text-[10px] text-slate-500 capitalize mb-3">{sup.type}</p>
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <MapPin className="h-3 w-3" /> {sup.contact}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Phone className="h-3 w-3" /> {sup.phone}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {sup.specialties.map(s => (
                    <Badge key={s} variant="outline" className="text-[9px] bg-white">{s}</Badge>
                  ))}
                </div>
                {relCount > 0 && (
                  <p className="text-[10px] text-amber-700 font-bold mb-3 flex items-center gap-1">
                    <Package className="h-3 w-3" /> {relCount} producto{relCount > 1 ? 's' : ''} con stock bajo
                  </p>
                )}
                <Button
                  className="w-full gap-2 bg-primary text-white text-xs h-9"
                  onClick={() => handleGenerateOrder(sup)}
                  disabled={relCount === 0}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {relCount === 0 ? 'Sin productos críticos' : 'Generar Orden IA'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Products needing restock */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-slate-400" /> Productos que Requieren Reabastecimiento
          </CardTitle>
          <CardDescription>Ordenados por urgencia (menor stock primero)</CardDescription>
        </CardHeader>
        <CardContent>
          {criticalProducts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Todos los productos tienen stock suficiente.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100">
                  <TableHead className="text-xs">Producto</TableHead>
                  <TableHead className="text-xs">Categoría</TableHead>
                  <TableHead className="text-xs text-right">Stock actual</TableHead>
                  <TableHead className="text-xs text-right">Precio venta</TableHead>
                  <TableHead className="text-xs text-center">Urgencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criticalProducts.map((p) => (
                  <TableRow key={p.id} className="border-slate-50">
                    <TableCell className="text-xs font-semibold">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px]">{p.category}</Badge>
                    </TableCell>
                    <TableCell className={cn(
                      'text-xs font-black text-right',
                      p.stock === 0 ? 'text-red-600' : p.stock < 5 ? 'text-red-500' : 'text-amber-600'
                    )}>
                      {p.stock === 0 ? 'AGOTADO' : `${p.stock} ud.`}
                    </TableCell>
                    <TableCell className="text-xs text-right">S/ {p.price}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn(
                        'text-[9px]',
                        p.stock === 0 ? 'bg-red-500 text-white' :
                        p.stock < 5  ? 'bg-orange-500 text-white' :
                                       'bg-amber-400 text-white'
                      )}>
                        {p.stock === 0 ? 'AGOTADO' : p.stock < 5 ? 'URGENTE' : 'BAJO'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setOrderResult(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              Orden de Compra — {selectedSupplier?.name}
            </DialogTitle>
            <DialogDescription>
              Generada automáticamente por Gemini IA basada en stock crítico
            </DialogDescription>
          </DialogHeader>

          {orderLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              <p className="text-sm">Gemini está elaborando la orden de compra…</p>
            </div>
          )}

          {orderResult && !orderLoading && (
            <div className="space-y-5 pt-2">
              {/* Summary pills */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full">
                  {orderResult.orderItems.length} artículos
                </span>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full">
                  Total: S/ {orderResult.totalAmount.toFixed(2)}
                </span>
                <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full">
                  Entrega: ~{orderResult.estimatedDays} días
                </span>
              </div>

              {/* Order items table */}
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="text-xs">Producto</TableHead>
                      <TableHead className="text-xs text-center">Prior.</TableHead>
                      <TableHead className="text-xs text-right">Cant.</TableHead>
                      <TableHead className="text-xs text-right">C. Unit.</TableHead>
                      <TableHead className="text-xs text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderResult.orderItems.map((item, i) => {
                      const style = PRIORITY_STYLES[item.priority] ?? PRIORITY_STYLES.normal;
                      return (
                        <TableRow key={i} className="border-slate-50">
                          <TableCell>
                            <p className="text-xs font-semibold leading-tight">{item.productName}</p>
                            <p className="text-[10px] text-slate-400">{item.justification}</p>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={`text-[9px] ${style.bg}`}>
                              {item.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-black text-right">{item.quantity}</TableCell>
                          <TableCell className="text-xs text-right">S/ {item.unitCost.toFixed(2)}</TableCell>
                          <TableCell className="text-xs font-black text-primary text-right">
                            S/ {item.subtotal.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Total row */}
              <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl border border-primary/10">
                <span className="text-sm font-bold text-slate-700">Total de la orden</span>
                <span className="text-xl font-black text-primary">S/ {orderResult.totalAmount.toFixed(2)}</span>
              </div>

              {/* Notes */}
              {orderResult.notes && (
                <p className="text-xs text-slate-500 italic">{orderResult.notes}</p>
              )}

              {/* Email section */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                  onClick={() => setEmailExpanded(e => !e)}
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Mail className="h-4 w-4 text-slate-400" />
                    Email al proveedor — {orderResult.subject}
                  </div>
                  {emailExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                {emailExpanded && (
                  <div className="p-4 bg-white">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                      {orderResult.emailBody}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-2 text-xs"
                      onClick={handleCopyEmail}
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copiado' : 'Copiar email'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button className="flex-1 bg-primary gap-2" onClick={handleExportPDF}>
                  <Download className="h-4 w-4" /> Descargar PDF
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setDialogOpen(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
