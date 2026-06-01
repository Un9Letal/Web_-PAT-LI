"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ShoppingCart, Flame, Zap, Star, Package, Tag, ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { CatalogImage } from '@/components/catalog/CatalogImage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { useAppStore } from '@/store/appStore';

interface Recommendation {
  productId: string;
  reason:    string;
}

interface ProductDetailModalProps {
  product:     ImagePlaceholder | null;
  stock:       number;
  isBestSeller: boolean;
  isNew:       boolean;
  onClose:     () => void;
  onAddToCart: (product: ImagePlaceholder) => void;
  onPrev?:     () => void;
  onNext?:     () => void;
}

const SIZES    = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const FEATURES = [
  '100% algodón pima peruano',
  'Costura reforzada en hombros',
  'Lavable a máquina hasta 30°C',
  'Certificado OEKO-TEX® Standard 100',
];

// Reglas de combinación por categoría: qué categorías complementan bien
const COMBO_RULES: Record<string, { cats: string[]; reason: string }[]> = {
  Caballeros: [
    { cats: ['Caballeros'], reason: 'Mismo estilo, perfecto para completar el look' },
    { cats: ['Accesorios'], reason: 'El accesorio ideal para elevar el outfit' },
    { cats: ['Deportivo'],  reason: 'Opción versátil para cualquier ocasión' },
  ],
  Damas: [
    { cats: ['Damas'],      reason: 'Combinación femenina que no falla' },
    { cats: ['Accesorios'], reason: 'Toque final para un look completo' },
    { cats: ['Damas'],      reason: 'Alternativa elegante del mismo guardarropa' },
  ],
  Deportivo: [
    { cats: ['Deportivo'],  reason: 'Outfit deportivo coordinado' },
    { cats: ['Accesorios'], reason: 'Complemento perfecto para entrenar' },
    { cats: ['Caballeros', 'Damas'], reason: 'Fácil de combinar en tu día a día' },
  ],
  Accesorios: [
    { cats: ['Caballeros', 'Damas'], reason: 'Esta prenda destaca con el accesorio' },
    { cats: ['Damas', 'Caballeros'], reason: 'Look completo con este complemento' },
    { cats: ['Accesorios'], reason: 'Accesorios que se combinan entre sí' },
  ],
  Niños: [
    { cats: ['Niños'],  reason: 'Conjunto ideal para los más pequeños' },
    { cats: ['Niños'],  reason: 'Colores que combinan a la perfección' },
    { cats: ['Bebés', 'Niños'], reason: 'Moda infantil que nunca pasa de moda' },
  ],
  Bebés: [
    { cats: ['Bebés'],  reason: 'Set completo para el bebé' },
    { cats: ['Bebés'],  reason: 'Suavidad y estilo desde el primer día' },
    { cats: ['Niños'],  reason: 'Crece con este combo adorable' },
  ],
};

const STYLING_TIPS: Record<string, string> = {
  Caballeros: '¡Combina tus prendas con colores neutros y verás cómo todo encaja! 🔥',
  Damas:      '¡El secreto está en los accesorios — transforman cualquier look al instante! ✨',
  Deportivo:  '¡Look deportivo coordinado = motivación extra para entrenar! 💪',
  Accesorios: '¡Los accesorios son el punto final que hace brillar cualquier outfit! 👑',
  Niños:      '¡Los colores vivos y las telas suaves son la combinación perfecta para los pequeños! 🌈',
  Bebés:      '¡La comodidad es lo primero, y el estilo viene incluido! 🐣',
};

function buildFallbackRecs(
  product: ImagePlaceholder,
  allProducts: ImagePlaceholder[],
): Recommendation[] {
  const rules = COMBO_RULES[product.category] ?? COMBO_RULES['Caballeros'];
  const used = new Set<string>([product.id]);
  const result: Recommendation[] = [];

  for (const rule of rules) {
    if (result.length >= 3) break;
    // Busca un producto de las categorías recomendadas que no se haya usado
    const candidates = allProducts.filter(
      p => rule.cats.includes(p.category) && !used.has(p.id)
    );
    // Prefiere un producto de categoría diferente si ya tenemos uno igual
    const pick = candidates[Math.floor(Math.random() * Math.min(candidates.length, 6))];
    if (pick) {
      used.add(pick.id);
      result.push({ productId: pick.id, reason: rule.reason });
    }
  }

  // Si faltan, rellena con productos de cualquier categoría
  if (result.length < 3) {
    const remaining = allProducts.filter(p => !used.has(p.id));
    for (const p of remaining.slice(0, 3 - result.length)) {
      result.push({ productId: p.id, reason: 'Ideal para complementar tu compra' });
    }
  }

  return result.slice(0, 3);
}

function StockMeter({ stock }: { stock: number }) {
  const pct   = Math.min(Math.round((stock / 50) * 100), 100);
  const color = stock === 0 ? 'bg-red-500' : stock <= 3 ? 'bg-red-400' : stock <= 8 ? 'bg-amber-400' : 'bg-emerald-500';
  const label = stock === 0 ? 'Agotado' : stock <= 3 ? `¡Solo ${stock} unidad${stock === 1 ? '' : 'es'}!` : stock <= 8 ? 'Pocas unidades' : `${stock} disponibles`;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-bold text-slate-600">Stock</span>
        <span className={cn('font-black', stock === 0 ? 'text-red-600' : stock <= 3 ? 'text-red-500 animate-pulse' : stock <= 8 ? 'text-amber-600' : 'text-emerald-600')}>
          {label}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ProductDetailModal({
  product, stock, isBestSeller, isNew, onClose, onAddToCart, onPrev, onNext,
}: ProductDetailModalProps) {
  const storeProducts = useAppStore((s) => s.products);
  const [recs, setRecs]             = useState<Recommendation[]>([]);
  const [stylingTip, setStylingTip]   = useState('');
  const [aiUpgrading, setAiUpgrading] = useState(false);

  // Cada vez que cambia el producto:
  // 1) Fallback local instantáneo (sin esperar IA)
  // 2) Gemini en segundo plano — si responde, reemplaza con mejores recs
  useEffect(() => {
    if (!product) return;

    // ── 1. Fallback instantáneo ──
    const otherProducts = PlaceHolderImages.filter(p => p.id !== product.id);
    const fallback = buildFallbackRecs(product, otherProducts);
    setRecs(fallback);
    setStylingTip(STYLING_TIPS[product.category] ?? '¡Con los accesorios correctos, cualquier look brilla más!');
    setAiUpgrading(true);

    // ── 2. Mejora con Gemini en background ──
    const available = PlaceHolderImages.map(p => {
      const sp = storeProducts.find(s => s.id === p.id);
      return { id: p.id, name: p.description, category: p.category, price: p.price, inStock: (sp?.stock ?? 99) > 0 };
    }).filter(p => p.inStock && p.id !== product.id).slice(0, 30);

    const controller = new AbortController();
    fetch('/api/ai/related-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        productId:         product.id,
        productName:       product.description,
        category:          product.category,
        price:             product.price,
        availableProducts: available,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.recommendations?.length >= 1) setRecs(data.recommendations);
        if (data.stylingTip)                   setStylingTip(data.stylingTip);
      })
      .catch(() => { /* fallback ya está visible — no hacer nada */ })
      .finally(() => setAiUpgrading(false));

    return () => controller.abort();
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!product) return null;
  const isOut = stock === 0;

  // Buscar datos de los productos recomendados en el catálogo
  const recProducts = recs
    .map(r => ({ rec: r, p: PlaceHolderImages.find(p => p.id === r.productId) }))
    .filter(x => !!x.p) as { rec: Recommendation; p: ImagePlaceholder }[];

  return (
    <Dialog open={!!product} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0 border-none shadow-2xl max-h-[90vh] overflow-y-auto">
        <VisuallyHidden.Root>
          <DialogTitle>{product?.description ?? 'Detalle del producto'}</DialogTitle>
        </VisuallyHidden.Root>
        <div className="grid md:grid-cols-2">
          {/* Image panel */}
          <div className="relative bg-slate-100 h-72 md:h-auto min-h-[320px] md:sticky md:top-0">
            <CatalogImage
              src={product.imageUrl}
              alt={product.description}
              fill
              category={product.category}
              className={cn(isOut && 'opacity-50 grayscale')}
            />
            {isOut && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white/95 text-slate-700 font-black text-lg px-6 py-3 rounded-2xl shadow-lg tracking-wide">AGOTADO</span>
              </div>
            )}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <Badge className="bg-accent text-primary font-bold text-[10px] shadow">{product.category.toUpperCase()}</Badge>
              {isBestSeller && !isOut && (
                <Badge className="bg-primary text-white font-bold text-[10px] shadow gap-1">
                  <Flame className="h-2.5 w-2.5" /> TOP VENTAS
                </Badge>
              )}
              {isNew && !isOut && (
                <Badge className="bg-emerald-500 text-white font-bold text-[10px] shadow gap-1">
                  <Zap className="h-2.5 w-2.5" /> NUEVO
                </Badge>
              )}
            </div>
            <div className="absolute inset-y-0 left-0 flex items-center">
              {onPrev && (
                <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="ml-2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow transition-colors">
                  <ChevronLeft className="h-4 w-4 text-slate-600" />
                </button>
              )}
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
              {onNext && (
                <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="mr-2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow transition-colors">
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </button>
              )}
            </div>
          </div>

          {/* Info panel */}
          <div className="flex flex-col gap-4 bg-white dark:bg-card">
            <div className="p-6 space-y-4">
              <div>
                <p className="text-[9px] font-black text-primary/40 uppercase tracking-[0.25em] mb-1">Colección Ica 2025</p>
                <h2 className="text-xl font-black text-slate-900 dark:text-foreground leading-tight">{product.description}</h2>
              </div>

              <div className="flex items-end gap-3">
                <span className="text-3xl font-black text-primary">S/ {product.price.toFixed(2)}</span>
                <span className="text-base text-slate-400 line-through mb-0.5">S/ {(product.price * 1.2).toFixed(2)}</span>
                <Badge className="bg-red-500 text-white text-[10px] mb-0.5">-20%</Badge>
              </div>

              <div className="flex items-center gap-1.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={cn('h-4 w-4', s <= 4 ? 'fill-amber-400 text-amber-400' : 'text-slate-200')} />
                ))}
                <span className="text-xs text-slate-400 ml-1">4.4 · (48 reseñas)</span>
              </div>

              <StockMeter stock={stock} />

              <div>
                <p className="text-xs font-bold text-slate-600 mb-2">Tallas disponibles</p>
                <div className="flex gap-1.5 flex-wrap">
                  {SIZES.map(size => (
                    <span key={size} className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:border-primary hover:text-primary cursor-pointer transition-colors">
                      {size}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Características
                </p>
                <ul className="space-y-1">
                  {FEATURES.map((f, i) => (
                    <li key={i} className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary/60 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="space-y-2 pt-2">
                <Button
                  className={cn(
                    'w-full h-11 gap-2 font-bold text-sm',
                    isOut
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed hover:bg-slate-200'
                      : 'bg-slate-900 hover:bg-primary transition-colors'
                  )}
                  disabled={isOut}
                  onClick={() => { onAddToCart(product); onClose(); }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {isOut ? 'Sin Stock' : 'Añadir al Carrito'}
                </Button>
                {!isOut && (
                  <p className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Package className="h-3 w-3" /> Envío disponible · Recojo en tienda gratis
                  </p>
                )}
              </div>
            </div>

            {/* IA Recommendations section */}
            <div className="border-t px-6 pb-6 pt-4 bg-slate-50 dark:bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-violet-600" />
                <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Combina con</p>
                <div className="ml-auto flex items-center gap-1.5">
                  {aiUpgrading && (
                    <span className="flex items-center gap-1 text-[9px] text-violet-500">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" /> mejorando con IA…
                    </span>
                  )}
                  <Badge className="bg-violet-100 text-violet-700 border-none text-[9px]">IA Gemini</Badge>
                </div>
              </div>

              <div className="space-y-3">
                {stylingTip && (
                  <p className="text-[11px] text-violet-700 italic bg-violet-50 px-3 py-2 rounded-lg border border-violet-100">
                    💡 {stylingTip}
                  </p>
                )}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {recProducts.map(({ rec, p }) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onClose();
                        setTimeout(() => {
                          window.dispatchEvent(new CustomEvent('open-product-detail', { detail: p }));
                        }, 150);
                      }}
                      className="flex-shrink-0 w-[100px] group text-left"
                    >
                      <div className="relative h-[110px] w-full bg-slate-100 rounded-xl overflow-hidden mb-1.5">
                        <CatalogImage
                          src={p.imageUrl}
                          alt={p.description}
                          fill
                          category={p.category}
                          className="group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="text-[10px] font-bold text-slate-700 leading-tight line-clamp-2">{p.description}</p>
                      <p className="text-[10px] text-primary font-black">S/ {p.price}</p>
                      <p className="text-[9px] text-slate-400 italic leading-tight mt-0.5 line-clamp-2">{rec.reason}</p>
                    </button>
                  ))}
                  {/* Skeletons mientras la IA mejora (solo si hay <3 recs) */}
                  {aiUpgrading && recProducts.length === 0 && [0,1,2].map(i => (
                    <div key={i} className="flex-shrink-0 w-[100px]">
                      <div className="h-[110px] w-full bg-slate-200 rounded-xl mb-1.5 animate-pulse" />
                      <div className="h-2.5 bg-slate-200 rounded animate-pulse mb-1" />
                      <div className="h-2.5 bg-slate-200 rounded animate-pulse w-2/3" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
