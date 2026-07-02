
"use client";

import { CatalogImage } from '@/components/catalog/CatalogImage';
import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ShoppingCart, Shirt, Flame, Star, Zap, Sparkles, Loader2, ChevronRight, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { useCartStore } from '@/store/cartStore';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ProductDetailModal } from '@/components/catalog/ProductDetailModal';
import type { StyleQuizOutput } from '@/ai/flows/customer-style-quiz-flow';

const categories = ['Todo', 'Caballeros', 'Damas', 'Niños', 'Bebés', 'Deportivo', 'Accesorios'];

// Products that are marked as "best sellers" or "new"
const BEST_SELLERS = new Set(['polo-pima-blanco', 'jean-skinny-azul', 'vestido-lino-floral', 'leggings-deportivos-mujer', 'medias-pack-x3', 'blazer-entallado-negro']);
const NEW_ARRIVALS = new Set(['conjunto-yoga-mujer', 'ajuar-bebe-completo', 'sudadera-hoodie-gris', 'jumpsuit-casual-verde', 'casaca-bomber-negra']);

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)  return <Badge className="bg-red-600 text-white text-[9px] shadow-sm">AGOTADO</Badge>;
  if (stock <= 3)   return <Badge className="bg-red-500 text-white text-[9px] shadow-sm animate-pulse">¡Solo {stock} ud.!</Badge>;
  if (stock <= 8)   return <Badge className="bg-amber-500 text-white text-[9px] shadow-sm">Pocas unidades</Badge>;
  return null;
}

export default function CatalogoPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todo');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [detailProduct, setDetailProduct] = useState<ImagePlaceholder | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const storeProducts = useAppStore((s) => s.products);

  /* ── Style Quiz state ── */
  const [quizOpen, setQuizOpen]     = useState(false);
  const [quizStep, setQuizStep]     = useState(1);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizResult, setQuizResult] = useState<StyleQuizOutput | null>(null);
  const [outfitOpen, setOutfitOpen] = useState(false);
  const [quizForm, setQuizForm]     = useState({
    occasion:    '',
    budget:      150,
    gender:      'Mujer',
    preferences: '',
  });

  const OCCASIONS = ['Casual diario', 'Trabajo / oficina', 'Fiesta / evento', 'Deporte / gym', 'Salida en familia', 'Reunión de negocios'];
  const GENDERS   = ['Mujer', 'Hombre', 'Niño/a', 'Bebé'];

  const handleRunQuiz = async () => {
    setQuizLoading(true);
    try {
      const availableProducts = PlaceHolderImages
        .filter(p => (stockMap[p.id] ?? 99) > 0)
        .map(p => ({ id: p.id, name: p.description, category: p.category, price: p.price }));

      const res = await fetch('/api/ai/style-quiz', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...quizForm, availableProducts }),
      });

      if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status}`);
      }

      const data = await res.json();

      // Validar que la respuesta tiene la estructura esperada
      if (!data.picks || !Array.isArray(data.picks) || data.picks.length === 0) {
        throw new Error('Respuesta inválida del servidor');
      }

      setQuizResult(data as StyleQuizOutput);
      setQuizStep(4);
    } catch (err) {
      console.error('Style quiz error:', err);
      toast({
        title: 'No se pudo analizar tu estilo',
        description: 'Gemini tardó demasiado. Intenta de nuevo en unos segundos.',
        variant: 'destructive',
      });
      // Volver al paso 3 para que el usuario pueda reintentar
      setQuizStep(3);
    } finally {
      setQuizLoading(false);
    }
  };

  const resetQuiz = () => {
    setQuizStep(1);
    setQuizResult(null);
    setQuizForm({ occasion: '', budget: 150, gender: 'Mujer', preferences: '' });
  };

  const stockMap = useMemo(
    () => Object.fromEntries(storeProducts.map((p) => [p.id, p.stock])),
    [storeProducts]
  );

  const filteredProducts = useMemo(() => {
    let list = PlaceHolderImages.filter((p) => {
      const matchCat  = selectedCategory === 'Todo' || p.category === selectedCategory;
      const matchSearch = p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
    if (sortBy === 'price-asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [selectedCategory, searchTerm, sortBy]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Todo: PlaceHolderImages.length };
    PlaceHolderImages.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

  const handleAddToCart = (product: typeof PlaceHolderImages[0]) => {
    const stock = stockMap[product.id] ?? 99;
    if (stock === 0) {
      toast({ title: 'Producto agotado', description: 'Este producto no tiene stock disponible.', variant: 'destructive' });
      return;
    }
    addItem(product);
    toast({ title: '¡Agregado al carrito!', description: `${product.description} añadido.`, duration: 2000 });
  };

  const inStockCount  = filteredProducts.filter(p => (stockMap[p.id] ?? 99) > 0).length;
  const outStockCount = filteredProducts.filter(p => (stockMap[p.id] ?? 99) === 0).length;

  /* ── Outfit (productos del quiz) ── */
  const outfitProducts = useMemo(() => {
    if (!quizResult) return [];
    return quizResult.picks
      .map(pick => {
        const product = PlaceHolderImages.find(p => p.id === pick.productId);
        return product ? { product, pick } : null;
      })
      .filter((x): x is { product: ImagePlaceholder; pick: typeof quizResult.picks[0] } => x !== null);
  }, [quizResult]);

  const outfitTotal = outfitProducts.reduce((sum, { product }) => sum + product.price, 0);

  const handleAddOutfitToCart = () => {
    let added = 0;
    outfitProducts.forEach(({ product }) => {
      const stock = stockMap[product.id] ?? 99;
      if (stock > 0) { addItem(product); added++; }
    });
    if (added > 0) {
      toast({ title: '¡Outfit agregado!', description: `${added} prenda(s) añadida(s) al carrito.`, duration: 2500 });
    } else {
      toast({ title: 'Sin stock', description: 'Las prendas del outfit están agotadas.', variant: 'destructive' });
    }
    return added;
  };

  const handleOutfitCheckout = () => {
    const added = handleAddOutfitToCart();
    if (added > 0) {
      setOutfitOpen(false);
      // Abrir el carrito para completar el pago (sincronizado con ventas en tiempo real)
      setTimeout(() => window.dispatchEvent(new Event('open-cart')), 150);
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      {/* Hero header */}
      <section className="bg-gradient-to-br from-primary via-primary to-blue-800 py-14 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-primary-foreground">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-accent text-primary font-bold text-xs px-3">TEMPORADA 2025</Badge>
                {outStockCount > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-3">{outStockCount} agotados</Badge>
                )}
              </div>
              <h1 className="text-4xl font-black mb-2 leading-tight">Catálogo Digital</h1>
              <p className="opacity-70 text-sm">
                {inStockCount} productos disponibles · Colección completa PAT-LI Textiles
              </p>
            </div>
            <div className="space-y-2 w-full md:w-[440px]">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Busca por prenda, tela o color..."
                  className="pl-10 h-12 bg-white text-slate-900 border-none rounded-xl shadow-lg focus-visible:ring-accent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {(['default', 'price-asc', 'price-desc'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-lg font-bold transition-colors',
                      sortBy === s
                        ? 'bg-accent text-primary'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    )}
                  >
                    {s === 'default' ? 'Relevancia' : s === 'price-asc' ? '↑ Precio' : '↓ Precio'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10 flex-1">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar filtros */}
          <aside className="w-full md:w-60 shrink-0 space-y-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Categorías
              </h3>
              <div className="flex flex-wrap md:flex-col gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                      selectedCategory === cat
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100'
                    )}
                  >
                    <span>{cat}</span>
                    <span className={cn('text-xs font-black', selectedCategory === cat ? 'text-white/70' : 'text-slate-300')}>
                      {categoryCounts[cat] ?? 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Leyenda stock */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Disponibilidad</h4>
              {[
                { label: 'Disponible', color: 'bg-green-500' },
                { label: 'Pocas unidades', color: 'bg-amber-500' },
                { label: '¡Solo 1-3!', color: 'bg-red-500' },
                { label: 'Agotado', color: 'bg-slate-300' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-xs text-slate-500">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                  {s.label}
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-violet-50 to-blue-50 p-5 rounded-2xl border border-violet-100 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <h4 className="font-bold text-violet-800 text-sm">Quiz de Estilo IA</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dinos la ocasión y presupuesto. Gemini te elige los 3 mejores productos.
              </p>
              <Button
                className="w-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold gap-2"
                onClick={() => { resetQuiz(); setQuizOpen(true); }}
              >
                <Sparkles className="h-3.5 w-3.5" /> Ayúdame a elegir
              </Button>
            </div>

            <div className="bg-accent/10 p-5 rounded-2xl border border-accent/20">
              <h4 className="font-bold text-primary mb-1 text-sm">Asesoría Inteligente</h4>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                ¿No encuentras tu talla? Usa el chat y recibe recomendación personalizada.
              </p>
              <Button
                className="w-full bg-primary text-white text-xs font-bold"
                onClick={() => window.dispatchEvent(new Event('open-chat'))}
              >
                Consultar con PAT-LI Bot
              </Button>
            </div>
          </aside>

          {/* Grid de productos */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <span className="text-sm font-black text-primary">{filteredProducts.length}</span>
                <span className="text-sm text-slate-500 ml-1">productos · </span>
                <span className="text-sm font-bold text-green-600">{inStockCount} en stock</span>
                {outStockCount > 0 && (
                  <span className="text-sm text-red-400 ml-1">· {outStockCount} agotados</span>
                )}
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:block">
                {selectedCategory === 'Todo' ? 'Toda la colección' : selectedCategory}
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="bg-slate-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto">
                  <Shirt className="text-slate-300 h-10 w-10" />
                </div>
                <p className="text-slate-500">No encontramos productos con ese filtro.</p>
                <Button variant="outline" onClick={() => { setSelectedCategory('Todo'); setSearchTerm(''); }}>
                  Ver todo el catálogo
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const stock = stockMap[product.id] ?? 99;
                  const isBestSeller = BEST_SELLERS.has(product.id);
                  const isNew = NEW_ARRIVALS.has(product.id);
                  const isOutOfStock = stock === 0;
                  return (
                    <Card
                      key={product.id}
                      className={cn(
                        'overflow-hidden group hover:shadow-2xl transition-all duration-500 border-none bg-white rounded-2xl cursor-pointer',
                        isOutOfStock && 'opacity-70'
                      )}
                      onClick={() => setDetailProduct(product)}
                    >
                      <div className="relative h-[300px] w-full bg-slate-100">
                        <CatalogImage
                          src={product.imageUrl}
                          alt={product.description}
                          fill
                          category={product.category}
                          className={cn('transition-transform duration-700', !isOutOfStock && 'group-hover:scale-105')}
                        />
                        {/* Overlay if out of stock */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                            <span className="bg-white text-slate-700 font-black text-sm px-4 py-2 rounded-full shadow-lg">AGOTADO</span>
                          </div>
                        )}
                        {/* Top badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          <Badge className="bg-accent text-primary font-bold text-[9px] shadow-sm">{product.category.toUpperCase()}</Badge>
                          {isBestSeller && !isOutOfStock && (
                            <Badge className="bg-primary text-white font-bold text-[9px] shadow-sm gap-1">
                              <Flame className="h-2.5 w-2.5" /> TOP VENTAS
                            </Badge>
                          )}
                          {isNew && !isOutOfStock && (
                            <Badge className="bg-emerald-500 text-white font-bold text-[9px] shadow-sm gap-1">
                              <Zap className="h-2.5 w-2.5" /> NUEVO
                            </Badge>
                          )}
                        </div>
                        {/* Stock badge (top right) */}
                        <div className="absolute top-3 right-3">
                          <StockBadge stock={stock} />
                        </div>
                      </div>

                      <CardContent className="pt-4 pb-2">
                        <div className="text-[9px] text-primary/50 font-bold uppercase tracking-[0.2em] mb-1">Colección Ica 2025</div>
                        <h3 className="font-bold text-base mb-2 text-slate-800 group-hover:text-primary transition-colors line-clamp-2 h-11">
                          {product.description}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-black text-primary">S/ {product.price.toFixed(2)}</span>
                            <span className="text-xs text-slate-400 line-through">S/ {(product.price * 1.2).toFixed(2)}</span>
                          </div>
                          {/* Stock indicator dots */}
                          {!isOutOfStock && (
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3].map((dot) => (
                                <span
                                  key={dot}
                                  className={cn(
                                    'w-1.5 h-1.5 rounded-full',
                                    stock >= 10 ? 'bg-green-400' :
                                    stock >= 5  ? (dot <= 2 ? 'bg-amber-400' : 'bg-slate-200') :
                                    (dot <= 1   ? 'bg-red-400' : 'bg-slate-200')
                                  )}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Ratings mock */}
                        <div className="flex items-center gap-1 mt-1.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={cn('h-3 w-3', s <= 4 ? 'fill-amber-400 text-amber-400' : 'text-slate-200')} />
                          ))}
                          <span className="text-[10px] text-slate-400 ml-1">(24)</span>
                        </div>
                      </CardContent>

                      <CardFooter className="pb-5 pt-1">
                        <Button
                          className={cn(
                            'w-full h-10 gap-2 font-bold shadow-sm transition-colors text-sm',
                            isOutOfStock
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed hover:bg-slate-200'
                              : 'bg-slate-900 hover:bg-primary'
                          )}
                          disabled={isOutOfStock}
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {isOutOfStock ? 'Sin Stock' : 'Añadir al Carrito'}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Style Quiz Modal */}
      <Dialog open={quizOpen} onOpenChange={(v) => { setQuizOpen(v); if (!v) resetQuiz(); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              Quiz de Estilo Personal
            </DialogTitle>
            <DialogDescription>
              {quizStep < 4 ? `Paso ${quizStep} de 3 — ` : ''}
              {quizStep === 1 && 'Cuéntanos la ocasión y para quién es.'}
              {quizStep === 2 && 'Define tu presupuesto.'}
              {quizStep === 3 && 'Preferencias adicionales.'}
              {quizStep === 4 && 'Gemini eligió los mejores productos para ti.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            {/* Step 1: Occasion + Gender */}
            {quizStep === 1 && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-600 mb-2">¿Para qué ocasión?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {OCCASIONS.map((occ) => (
                      <button
                        key={occ}
                        onClick={() => setQuizForm(f => ({ ...f, occasion: occ }))}
                        className={cn(
                          'text-xs px-3 py-2.5 rounded-xl border font-medium transition-all text-left',
                          quizForm.occasion === occ
                            ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300'
                        )}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-600 mb-2">¿Para quién?</p>
                  <div className="flex flex-wrap gap-2">
                    {GENDERS.map((g) => (
                      <button
                        key={g}
                        onClick={() => setQuizForm(f => ({ ...f, gender: g }))}
                        className={cn(
                          'text-xs px-4 py-2 rounded-full border font-medium transition-all',
                          quizForm.gender === g
                            ? 'bg-violet-600 text-white border-violet-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300'
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2"
                  disabled={!quizForm.occasion}
                  onClick={() => setQuizStep(2)}
                >
                  Siguiente <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Budget */}
            {quizStep === 2 && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-600 mb-1">Presupuesto máximo</p>
                  <p className="text-3xl font-black text-violet-600 mb-3">S/ {quizForm.budget}</p>
                  <input
                    type="range"
                    min={30} max={500} step={10}
                    value={quizForm.budget}
                    onChange={(e) => setQuizForm(f => ({ ...f, budget: Number(e.target.value) }))}
                    className="w-full accent-violet-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>S/ 30</span><span>S/ 500</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[50, 100, 150, 200, 300].map((b) => (
                    <button
                      key={b}
                      onClick={() => setQuizForm(f => ({ ...f, budget: b }))}
                      className={cn(
                        'flex-1 text-xs py-1.5 rounded-lg border font-bold transition-all',
                        quizForm.budget === b
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300'
                      )}
                    >
                      S/{b}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setQuizStep(1)}>Atrás</Button>
                  <Button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white gap-2" onClick={() => setQuizStep(3)}>
                    Siguiente <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Preferences */}
            {quizStep === 3 && !quizLoading && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-600 mb-2">Preferencias adicionales <span className="text-slate-400 font-normal">(opcional)</span></p>
                  <textarea
                    value={quizForm.preferences}
                    onChange={(e) => setQuizForm(f => ({ ...f, preferences: e.target.value }))}
                    placeholder="Ej: me gustan los colores neutros, prefiero algodón, talla M..."
                    className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
                  />
                </div>
                <div className="bg-violet-50 rounded-xl p-3 space-y-1 text-xs text-slate-600">
                  <p><span className="font-bold text-violet-700">Ocasión:</span> {quizForm.occasion}</p>
                  <p><span className="font-bold text-violet-700">Para:</span> {quizForm.gender}</p>
                  <p><span className="font-bold text-violet-700">Presupuesto:</span> S/ {quizForm.budget}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setQuizStep(2)}>Atrás</Button>
                  <Button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white gap-2" onClick={handleRunQuiz}>
                    <Sparkles className="h-4 w-4" /> Analizar con IA
                  </Button>
                </div>
              </div>
            )}

            {/* Loading — pantalla separada sin superponer el formulario */}
            {quizLoading && (
              <div className="flex flex-col items-center justify-center py-10 gap-4 text-slate-500">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
                  <Sparkles className="h-6 w-6 text-violet-500 absolute inset-0 m-auto" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-slate-700">Gemini está eligiendo tu look perfecto…</p>
                  <p className="text-xs text-slate-400">Analizando {PlaceHolderImages.length} productos del catálogo</p>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {['Ocasión', 'Presupuesto', 'Estilo'].map((s, i) => (
                    <span key={s} className="text-[10px] bg-violet-50 text-violet-600 border border-violet-200 px-2 py-0.5 rounded-full font-bold"
                      style={{ animationDelay: `${i * 200}ms` }}>
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Results */}
            {quizStep === 4 && quizResult && (
              <div className="space-y-4">
                {/* Style advice */}
                <div className="bg-violet-50 border border-violet-100 rounded-xl p-3">
                  <p className="text-[10px] font-black text-violet-600 uppercase mb-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Consejo de estilo
                  </p>
                  <p className="text-xs text-slate-700 italic">{quizResult.styleAdvice}</p>
                </div>

                {/* Picks */}
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toca una prenda para ver el detalle</p>
                <div className="space-y-2">
                  {quizResult.picks.map((pick, i) => {
                    const product = PlaceHolderImages.find(p => p.id === pick.productId);
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (product) {
                            setQuizOpen(false);
                            setDetailProduct(product);
                          }
                        }}
                        disabled={!product}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-violet-300 hover:bg-violet-50/40 hover:shadow-sm transition-all text-left group disabled:opacity-60 disabled:cursor-default"
                      >
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-black text-sm shrink-0">
                          {i + 1}
                        </div>
                        {product && (
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                            <CatalogImage src={product.imageUrl} alt={pick.productName} fill category={product.category} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate group-hover:text-violet-700 transition-colors">{pick.productName}</p>
                          <p className="text-[10px] text-slate-500 leading-tight line-clamp-1">{pick.reason}</p>
                          {product && <p className="text-[11px] font-black text-violet-600 mt-0.5">S/ {product.price.toFixed(2)}</p>}
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                          <div>
                            <p className="text-xs font-black text-violet-600">{pick.matchScore}%</p>
                            <p className="text-[9px] text-slate-400">match</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Outfit tip */}
                {quizResult.outfitTip && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <p className="text-[10px] font-black text-amber-600 uppercase mb-1">💡 Tip de outfit</p>
                    <p className="text-xs text-slate-700">{quizResult.outfitTip}</p>
                  </div>
                )}

                {/* Acciones */}
                <div className="space-y-2">
                  <Button
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white text-sm gap-2 h-11 font-bold shadow-md"
                    onClick={() => { setQuizOpen(false); setOutfitOpen(true); }}
                  >
                    <Sparkles className="h-4 w-4" /> Ver el Outfit Completo
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 text-xs" onClick={resetQuiz}>Repetir quiz</Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-xs border-violet-200 text-violet-700 hover:bg-violet-50"
                      onClick={() => {
                        const firstProduct = PlaceHolderImages.find(p => p.id === quizResult.picks[0]?.productId);
                        if (firstProduct) setSelectedCategory(firstProduct.category);
                        setQuizOpen(false);
                      }}
                    >
                      Ver en catálogo
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Outfit Completo Modal ── */}
      <Dialog open={outfitOpen} onOpenChange={setOutfitOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[92vh] overflow-y-auto p-0 gap-0">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-br from-violet-600 to-purple-700 text-white p-6 rounded-t-lg">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-amber-300" /> Tu Outfit Completo
              </DialogTitle>
              <DialogDescription className="text-white/70">
                {outfitProducts.length} prendas seleccionadas por IA para tu estilo
              </DialogDescription>
            </DialogHeader>
            {quizResult?.styleAdvice && (
              <div className="mt-3 bg-white/10 rounded-xl p-3 border border-white/15">
                <p className="text-xs leading-relaxed italic">{quizResult.styleAdvice}</p>
              </div>
            )}
          </div>

          {/* Lista de prendas */}
          <div className="p-5 space-y-3">
            {outfitProducts.map(({ product, pick }, i) => {
              const stock = stockMap[product.id] ?? 99;
              const isOut = stock === 0;
              return (
                <div key={product.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white hover:border-violet-200 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-black text-xs shrink-0">{i + 1}</div>
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    <CatalogImage src={product.imageUrl} alt={product.description} fill category={product.category} className={isOut ? 'grayscale opacity-50' : ''} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 leading-tight">{product.description}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mb-0.5">{pick.reason}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{product.category}</span>
                      {isOut
                        ? <span className="text-[10px] font-black text-red-500">AGOTADO</span>
                        : <span className="text-[10px] font-bold text-emerald-600">En stock</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-black text-violet-600">S/ {product.price.toFixed(2)}</p>
                    <button
                      onClick={() => { setOutfitOpen(false); setDetailProduct(product); }}
                      className="text-[10px] text-slate-400 hover:text-violet-600 transition-colors mt-0.5"
                    >
                      Ver detalle →
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Tip de outfit */}
            {quizResult?.outfitTip && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
                <span className="text-base shrink-0">💡</span>
                <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-0.5">Cómo combinarlo</p>
                  <p className="text-xs text-slate-700">{quizResult.outfitTip}</p>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="bg-gradient-to-br from-slate-50 to-violet-50/50 border border-violet-100 rounded-2xl p-4 mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-slate-600">Total del outfit</span>
                <span className="text-2xl font-black text-violet-700">S/ {outfitTotal.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-slate-400">Precios incluyen IGV · {outfitProducts.length} prendas</p>
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-2 pt-1">
              <Button
                onClick={handleOutfitCheckout}
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white font-bold gap-2 shadow-md text-sm"
              >
                <ShoppingCart className="h-4 w-4" /> Comprar Outfit Completo · S/ {outfitTotal.toFixed(2)}
              </Button>
              <Button
                onClick={handleAddOutfitToCart}
                variant="outline"
                className="w-full h-11 border-violet-200 text-violet-700 hover:bg-violet-50 font-bold gap-2 text-sm"
              >
                <Plus className="h-4 w-4" /> Agregar todo al carrito
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        stock={detailProduct ? (stockMap[detailProduct.id] ?? 99) : 0}
        isBestSeller={detailProduct ? BEST_SELLERS.has(detailProduct.id) : false}
        isNew={detailProduct ? NEW_ARRIVALS.has(detailProduct.id) : false}
        onClose={() => setDetailProduct(null)}
        onAddToCart={handleAddToCart}
        onPrev={() => {
          if (!detailProduct) return;
          const idx = filteredProducts.findIndex(p => p.id === detailProduct.id);
          if (idx > 0) setDetailProduct(filteredProducts[idx - 1]);
        }}
        onNext={() => {
          if (!detailProduct) return;
          const idx = filteredProducts.findIndex(p => p.id === detailProduct.id);
          if (idx < filteredProducts.length - 1) setDetailProduct(filteredProducts[idx + 1]);
        }}
      />
    </div>
  );
}
