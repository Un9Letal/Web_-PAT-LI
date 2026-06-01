
"use client";

import { useState, useEffect } from 'react';
import { ConfettiEffect } from '@/components/ConfettiEffect';
import { ShoppingCart, Trash2, Plus, Minus, Shirt, Star, CheckCircle2, CreditCard, Banknote, Smartphone, ArrowLeft, Loader2, Building2, Lock, Tag, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'Yape' | 'Plin' | 'Transferencia';
type PaymentStep = 'method' | 'details' | 'processing' | 'success' | 'satisfaction';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ElementType; color: string; description: string }[] = [
  { id: 'Efectivo',      label: 'Efectivo',      icon: Banknote,   color: 'text-green-600',  description: 'Pago en billetes y monedas' },
  { id: 'Tarjeta',       label: 'Tarjeta',        icon: CreditCard, color: 'text-blue-600',   description: 'Débito o crédito Visa/MC' },
  { id: 'Yape',          label: 'Yape',           icon: Smartphone, color: 'text-purple-600', description: 'Pago con Yape BCP' },
  { id: 'Plin',          label: 'Plin',           icon: Smartphone, color: 'text-teal-600',   description: 'Pago con BBVA Plin' },
  { id: 'Transferencia', label: 'Transferencia',  icon: Building2,  color: 'text-primary',    description: 'Transferencia bancaria' },
];

function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

const ratingLabels: Record<number, string> = {
  1: 'Muy insatisfecho', 2: 'Insatisfecho', 3: 'Regular',
  4: 'Satisfecho', 5: '¡Muy satisfecho!',
};

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, total, removeItem, updateQuantity, clearCart } = useCartStore();
  const addSale           = useAppStore((state) => state.addSale);
  const addSurveyResponse = useAppStore((state) => state.addSurveyResponse);
  const updateStock       = useAppStore((state) => state.updateStock);
  const useCoupon         = useAppStore((state) => state.useCoupon);

  // Payment flow
  const [paymentStep, setPaymentStep] = useState<PaymentStep | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (paymentStep === 'success') {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(t);
    }
  }, [paymentStep]);

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  // Digital (Yape/Plin/Transferencia) details
  const [phone, setPhone] = useState('');
  const [opCode, setOpCode] = useState('');
  const [cashGiven, setCashGiven] = useState('');
  const [detailErrors, setDetailErrors] = useState<Record<string, string>>({});

  // Coupon
  const [couponCode, setCouponCode]     = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: 'porcentaje' | 'monto' } | null>(null);

  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'porcentaje'
      ? (total * appliedCoupon.discount) / 100
      : Math.min(appliedCoupon.discount, total)
    : 0;
  const finalTotal = Math.max(0, total - discountAmount);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const coupon = useCoupon(couponCode.trim());
    if (!coupon) {
      toast({ title: 'Cupón inválido', description: 'El código no existe, está expirado o fue agotado.', variant: 'destructive' });
      return;
    }
    if (coupon.minCompra > total) {
      toast({ title: 'Monto insuficiente', description: `Este cupón requiere una compra mínima de S/ ${coupon.minCompra}.`, variant: 'destructive' });
      return;
    }
    setAppliedCoupon({ code: coupon.code, discount: coupon.discount, type: coupon.type });
    toast({ title: `Cupón ${coupon.code} aplicado`, description: `Descuento: ${coupon.discount}${coupon.type === 'porcentaje' ? '%' : ' S/'} off` });
    setCouponCode('');
  };

  // Satisfaction
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [satisfactionDone, setSatisfactionDone] = useState(false);

  const resetPayment = () => {
    setPaymentStep(null);
    setSelectedMethod(null);
    setCardNumber(''); setCardExpiry(''); setCardCvv(''); setCardName('');
    setCardErrors({});
    setPhone(''); setOpCode(''); setCashGiven('');
    setDetailErrors({});
    setRating(0); setHoverRating(0); setComment('');
    setSatisfactionDone(false);
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleCheckout = () => {
    setTransactionId(`TXN-${Date.now().toString().slice(-8)}`);
    setPaymentStep('method');
  };

  const handleSelectMethod = (m: PaymentMethod) => {
    setSelectedMethod(m);
    setPaymentStep('details');
  };

  const validateCard = () => {
    const errs: Record<string, string> = {};
    const rawNum = cardNumber.replace(/\s/g, '');
    if (!cardName.trim()) errs.name = 'El nombre del titular es requerido';
    if (rawNum.length < 16) errs.number = 'Número de tarjeta inválido (16 dígitos)';
    if (cardExpiry.length < 5) errs.expiry = 'Fecha de vencimiento inválida (MM/AA)';
    else {
      const [mm, yy] = cardExpiry.split('/').map(Number);
      if (mm < 1 || mm > 12) errs.expiry = 'Mes inválido';
      const now = new Date();
      if (yy + 2000 < now.getFullYear() || (yy + 2000 === now.getFullYear() && mm < now.getMonth() + 1))
        errs.expiry = 'Tarjeta vencida';
    }
    if (cardCvv.length < 3) errs.cvv = 'CVV inválido (3 dígitos)';
    return errs;
  };

  const validateDigital = () => {
    const errs: Record<string, string> = {};
    const p = phone.replace(/\D/g, '');
    if (!p || p.length < 9 || !p.startsWith('9')) errs.phone = 'Ingresa un número válido de 9 dígitos (empieza en 9)';
    if (!opCode.trim()) errs.opCode = 'El código de operación es requerido';
    return errs;
  };

  const validateCash = () => {
    const errs: Record<string, string> = {};
    const given = parseFloat(cashGiven);
    if (!cashGiven) errs.cash = 'Ingresa el monto entregado';
    else if (isNaN(given) || given < finalTotal) errs.cash = `El monto debe ser mayor o igual a S/ ${finalTotal.toFixed(2)}`;
    return errs;
  };

  const handleConfirmPayment = () => {
    let errs: Record<string, string> = {};
    if (selectedMethod === 'Tarjeta') errs = validateCard();
    else if (selectedMethod === 'Yape' || selectedMethod === 'Plin') errs = validateDigital();
    else if (selectedMethod === 'Transferencia') {
      if (!opCode.trim()) errs.opCode = 'El código de transferencia es requerido';
    } else if (selectedMethod === 'Efectivo') errs = validateCash();

    if (Object.keys(errs).length > 0) {
      setCardErrors(errs);
      setDetailErrors(errs);
      return;
    }
    setCardErrors({});
    setDetailErrors({});

    // Snapshot cart before async clear
    const itemsSnapshot = items.map(i => ({
      id: i.id,
      description: i.description,
      price: i.price,
      category: i.category,
      quantity: i.quantity,
    }));
    const totalSnapshot = finalTotal;

    setPaymentStep('processing');
    setTimeout(() => {
      addSale({
        id: transactionId,
        date: new Date().toISOString(),
        items: itemsSnapshot,
        total: totalSnapshot,
        paymentMethod: selectedMethod!,
        itemsDescription: itemsSnapshot.map(i => `${i.description} x${i.quantity}`).join(', '),
      });
      updateStock(itemsSnapshot);
      clearCart();
      setPaymentStep('success');
    }, 2000);
  };

  const handleSatisfactionSubmit = () => {
    if (rating === 0) {
      toast({ title: "Por favor selecciona una calificación", variant: "destructive" });
      return;
    }
    addSurveyResponse({
      id: `ENC-${Date.now().toString().slice(-8)}`,
      saleId: transactionId,
      date: new Date().toISOString(),
      rating,
      comment,
    });
    setSatisfactionDone(true);
    toast({ title: "¡Gracias por tu evaluación!", description: `Calificación: ${rating}/5. ¡Hasta pronto!` });
  };

  const handleCloseAll = () => {
    resetPayment();
    onOpenChange(false);
  };

  const change = parseFloat(cashGiven) - finalTotal;

  return (
    <>
      <ConfettiEffect active={showConfetti} />
      <Sheet open={open} onOpenChange={(v) => { if (!v && !paymentStep) onOpenChange(false); }}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader className="pb-6">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Tu Carrito
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="bg-slate-100 p-6 rounded-full">
                <Shirt size={48} className="text-slate-300" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900">Tu carrito está vacío</p>
                <p className="text-sm text-slate-500">¡Explora nuestro catálogo y encuentra algo increíble!</p>
              </div>
              <Button onClick={() => onOpenChange(false)} className="bg-primary">Ir a la tienda</Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-6 pb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative h-24 w-20 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                        <Image src={item.imageUrl} alt={item.description} fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-sm leading-tight">{item.description}</h4>
                            <p className="text-xs text-slate-500 mt-1">{item.category}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(item.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded-md h-8">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={12} /></Button>
                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={12} /></Button>
                          </div>
                          <p className="font-bold text-primary">S/ {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="pt-6 space-y-4">
                <Separator />

                {/* Coupon input */}
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="Código de descuento"
                        className="pl-8 h-9 text-sm font-mono tracking-wider"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApplyCoupon}
                      className="shrink-0 border-primary text-primary hover:bg-primary/5"
                    >
                      Aplicar
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-sm font-black text-emerald-700 font-mono">{appliedCoupon.code}</span>
                      <span className="text-xs text-emerald-600">
                        −{appliedCoupon.discount}{appliedCoupon.type === 'porcentaje' ? '%' : ' S/'}
                      </span>
                    </div>
                    <button onClick={() => setAppliedCoupon(null)} className="text-emerald-400 hover:text-emerald-700">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} artículos)</span>
                    <span className="font-medium">S/ {total.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Descuento ({appliedCoupon.code})</span>
                      <span className="font-bold">−S/ {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Envío</span>
                    <span className="text-success font-bold uppercase text-[10px]">Gratis</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-lg font-black">
                    <span>Total</span>
                    <span className="text-primary">S/ {finalTotal.toFixed(2)}</span>
                  </div>
                </div>
                <Button className="w-full h-12 bg-primary text-white font-bold text-lg rounded-xl gap-2" onClick={handleCheckout}>
                  <Lock className="h-5 w-5" /> Pagar Ahora
                </Button>
                <p className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Lock className="h-3 w-3" /> Pago 100% seguro y simulado
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Payment Dialog ── */}
      <Dialog open={!!paymentStep && paymentStep !== 'satisfaction'} onOpenChange={(v) => { if (!v && paymentStep !== 'processing') resetPayment(); }}>
        <DialogContent className="sm:max-w-[460px]">

          {/* STEP: Select method */}
          {paymentStep === 'method' && (
            <>
              <DialogHeader>
                <DialogTitle>Selecciona el método de pago</DialogTitle>
                <DialogDescription>Total a pagar: <span className="font-bold text-primary text-base">S/ {total.toFixed(2)}</span></DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-3 py-4">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMethod(m.id)}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-primary hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className={cn("p-3 rounded-xl bg-slate-100 group-hover:bg-primary/10 transition-colors", m.color)}>
                      <m.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{m.label}</p>
                      <p className="text-xs text-slate-500">{m.description}</p>
                    </div>
                    <div className="ml-auto text-slate-300 group-hover:text-primary text-lg">›</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* STEP: Payment details */}
          {paymentStep === 'details' && selectedMethod && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => { setPaymentStep('method'); setCardErrors({}); setDetailErrors({}); }}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <DialogTitle>Datos de pago — {selectedMethod}</DialogTitle>
                    <p className="text-sm text-slate-500">Total: <span className="font-bold text-primary">S/ {total.toFixed(2)}</span></p>
                  </div>
                </div>
              </DialogHeader>

              <div className="py-4 space-y-4">

                {/* TARJETA */}
                {selectedMethod === 'Tarjeta' && (
                  <>
                    <div className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-5 text-white mb-2 shadow-lg">
                      <p className="text-xs opacity-70 mb-3 uppercase tracking-widest">PAT-LI Textiles</p>
                      <p className="font-mono text-lg tracking-widest mb-4">
                        {(cardNumber || '•••• •••• •••• ••••')}
                      </p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] opacity-60 uppercase">Titular</p>
                          <p className="text-sm font-bold uppercase">{cardName || 'NOMBRE APELLIDO'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] opacity-60 uppercase">Vence</p>
                          <p className="text-sm font-bold">{cardExpiry || 'MM/AA'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>Número de tarjeta</Label>
                      <Input
                        value={cardNumber}
                        onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={cardErrors.number ? 'border-destructive' : ''}
                      />
                      {cardErrors.number && <p className="text-xs text-destructive">{cardErrors.number}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Vencimiento</Label>
                        <Input
                          value={cardExpiry}
                          onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/AA"
                          maxLength={5}
                          className={cardErrors.expiry ? 'border-destructive' : ''}
                        />
                        {cardErrors.expiry && <p className="text-xs text-destructive">{cardErrors.expiry}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label>CVV</Label>
                        <Input
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          placeholder="123"
                          maxLength={3}
                          className={cardErrors.cvv ? 'border-destructive' : ''}
                        />
                        {cardErrors.cvv && <p className="text-xs text-destructive">{cardErrors.cvv}</p>}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>Nombre del titular</Label>
                      <Input
                        value={cardName}
                        onChange={e => setCardName(e.target.value.toUpperCase())}
                        placeholder="TAL COMO APARECE EN LA TARJETA"
                        className={cardErrors.name ? 'border-destructive' : ''}
                      />
                      {cardErrors.name && <p className="text-xs text-destructive">{cardErrors.name}</p>}
                    </div>
                  </>
                )}

                {/* YAPE / PLIN */}
                {(selectedMethod === 'Yape' || selectedMethod === 'Plin') && (
                  <>
                    <div className={cn(
                      "p-5 rounded-2xl text-white text-center shadow-lg",
                      selectedMethod === 'Yape' ? "bg-gradient-to-br from-purple-700 to-purple-500" : "bg-gradient-to-br from-teal-700 to-teal-500"
                    )}>
                      <p className="text-sm font-bold mb-1">{selectedMethod === 'Yape' ? '💜 Yape BCP' : '💚 Plin BBVA'}</p>
                      <p className="text-2xl font-black">S/ {total.toFixed(2)}</p>
                      <p className="text-xs opacity-75 mt-1">Número: 956 123 456 | PAT-LI Textiles</p>
                    </div>
                    <div className="space-y-1">
                      <Label>Tu número de teléfono</Label>
                      <Input
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder="987654321"
                        maxLength={9}
                        className={detailErrors.phone ? 'border-destructive' : ''}
                      />
                      {detailErrors.phone && <p className="text-xs text-destructive">{detailErrors.phone}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label>Código de operación</Label>
                      <Input
                        value={opCode}
                        onChange={e => setOpCode(e.target.value.toUpperCase())}
                        placeholder="Ej. OP-123456"
                        className={detailErrors.opCode ? 'border-destructive' : ''}
                      />
                      {detailErrors.opCode && <p className="text-xs text-destructive">{detailErrors.opCode}</p>}
                      <p className="text-[10px] text-slate-400">Ingresa el código que aparece en la confirmación del pago</p>
                    </div>
                  </>
                )}

                {/* TRANSFERENCIA */}
                {selectedMethod === 'Transferencia' && (
                  <>
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2 text-sm">
                      <p className="font-bold text-primary">Datos para transferencia:</p>
                      <div className="grid grid-cols-2 gap-y-1 text-slate-600">
                        <span className="font-medium">Banco:</span><span>BCP</span>
                        <span className="font-medium">Cuenta:</span><span>194-XXXXXXXX-0-XX</span>
                        <span className="font-medium">CCI:</span><span>002-194-00XXXXXXXX-XX</span>
                        <span className="font-medium">Titular:</span><span>PAT-LI Textiles SAC</span>
                        <span className="font-medium">Monto:</span><span className="font-bold text-primary">S/ {total.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>Código de operación de la transferencia</Label>
                      <Input
                        value={opCode}
                        onChange={e => setOpCode(e.target.value.toUpperCase())}
                        placeholder="Ej. 123456789"
                        className={detailErrors.opCode ? 'border-destructive' : ''}
                      />
                      {detailErrors.opCode && <p className="text-xs text-destructive">{detailErrors.opCode}</p>}
                    </div>
                  </>
                )}

                {/* EFECTIVO */}
                {selectedMethod === 'Efectivo' && (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                      <p className="text-sm text-green-700 font-medium mb-1">Total a cobrar</p>
                      <p className="text-4xl font-black text-green-600">S/ {total.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                      <Label>Monto entregado por el cliente (S/)</Label>
                      <Input
                        type="number"
                        step="0.50"
                        min={total}
                        value={cashGiven}
                        onChange={e => setCashGiven(e.target.value)}
                        placeholder={total.toFixed(2)}
                        className={detailErrors.cash ? 'border-destructive' : ''}
                      />
                      {detailErrors.cash && <p className="text-xs text-destructive">{detailErrors.cash}</p>}
                    </div>
                    {cashGiven && !isNaN(parseFloat(cashGiven)) && parseFloat(cashGiven) >= total && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between items-center">
                        <span className="text-sm font-bold text-green-700">Vuelto</span>
                        <span className="text-2xl font-black text-green-600">S/ {change.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <DialogFooter>
                <Button className="w-full h-12 bg-primary font-bold text-base gap-2" onClick={handleConfirmPayment}>
                  <Lock className="h-4 w-4" /> Confirmar Pago — S/ {total.toFixed(2)}
                </Button>
              </DialogFooter>
            </>
          )}

          {/* STEP: Processing */}
          {paymentStep === 'processing' && (
            <div className="py-12 flex flex-col items-center gap-6 text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Procesando pago...</h3>
                <p className="text-sm text-slate-500 mt-1">Verificando con {selectedMethod}</p>
              </div>
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <p className="text-[10px] text-slate-400 max-w-xs">Por favor no cierres esta ventana mientras procesamos tu pago.</p>
            </div>
          )}

          {/* STEP: Success */}
          {paymentStep === 'success' && (
            <>
              <div className="py-6 flex flex-col items-center gap-4 text-center">
                <div className="bg-success/10 h-20 w-20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">¡Pago exitoso!</h3>
                  <p className="text-sm text-slate-500 mt-1">Tu compra ha sido confirmada</p>
                </div>
                <div className="w-full bg-slate-50 rounded-xl p-4 text-left space-y-2 border">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">N° Transacción</span>
                    <span className="font-mono font-bold">{transactionId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Método</span>
                    <Badge variant="outline">{selectedMethod}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-bold">Total pagado</span>
                    <span className="font-black text-primary text-lg">S/ {total.toFixed(2)}</span>
                  </div>
                  {selectedMethod === 'Efectivo' && change > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Vuelto entregado</span>
                      <span className="font-bold text-green-600">S/ {change.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full bg-primary" onClick={() => setPaymentStep('satisfaction')}>
                  Continuar
                </Button>
              </DialogFooter>
            </>
          )}

        </DialogContent>
      </Dialog>

      {/* ── Satisfaction Dialog ── */}
      <Dialog open={paymentStep === 'satisfaction'} onOpenChange={(v) => { if (!v) handleCloseAll(); }}>
        <DialogContent className="sm:max-w-[420px]">
          {!satisfactionDone ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">¿Cómo fue tu experiencia?</DialogTitle>
                <DialogDescription>Tu opinión nos ayuda a mejorar cada día en PAT-LI Textiles.</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-6">
                <div className="text-center space-y-3">
                  <Label className="text-sm font-bold text-slate-700">Califica tu experiencia de compra</Label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" className="transition-transform hover:scale-110"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                      >
                        <Star className={cn("h-10 w-10 transition-colors",
                          (hoverRating || rating) >= star ? "fill-amber-400 text-amber-400" : "text-slate-200"
                        )} />
                      </button>
                    ))}
                  </div>
                  {(hoverRating || rating) > 0 && (
                    <p className="text-sm font-bold text-amber-600 animate-in fade-in duration-200">
                      {ratingLabels[hoverRating || rating]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Comentario (opcional)</Label>
                  <Textarea
                    placeholder="¿Qué mejorarías? ¿Qué te gustó más de PAT-LI?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="resize-none h-20 text-sm"
                    maxLength={300}
                  />
                  <p className="text-[10px] text-slate-400 text-right">{comment.length}/300</p>
                </div>
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <Button className="w-full bg-primary font-bold" onClick={handleSatisfactionSubmit} disabled={rating === 0}>
                  Enviar Evaluación
                </Button>
                <Button variant="ghost" className="w-full text-slate-400 text-xs" onClick={handleCloseAll}>
                  Omitir
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-8 text-center space-y-4">
              <div className="bg-success/10 h-20 w-20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-bold">¡Gracias por tu opinión!</h3>
                <p className="text-sm text-slate-500 mt-1">Tu evaluación nos ayuda a crecer.</p>
              </div>
              <div className="flex justify-center gap-1">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={cn("h-6 w-6", s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                ))}
              </div>
              <Button className="w-full bg-primary mt-4" onClick={handleCloseAll}>Seguir comprando</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
