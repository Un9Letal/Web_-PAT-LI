"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck, Zap, TrendingUp, ArrowUpRight, Shirt, Sparkles, Users, Award, MessageCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const STATS = [
  { value: '25+', label: 'Años de experiencia', icon: Award },
  { value: '500+', label: 'Clientes satisfechos', icon: Users },
  { value: '4.8★', label: 'Calificación promedio', icon: Star },
  { value: '98%', label: 'Satisfacción garantizada', icon: CheckCircle },
];

const TESTIMONIALS = [
  { name: 'María C.', role: 'Clienta frecuente, Ica', text: 'Los polos de algodón pima son increíbles, duran años y mantienen el color. No compro en otro lado.', rating: 5 },
  { name: 'Jorge R.', role: 'Distribuidor, Lima', text: 'Trabajo con PAT-LI hace 3 años para mi boutique. Calidad constante, precios justos y atención de primera.', rating: 5 },
  { name: 'Lucía M.', role: 'Mamá, Ica', text: 'Los mameluco de bebé son suavísimos y seguros. El chatbot me ayudó a elegir el talle correcto al instante.', rating: 5 },
];

const CATEGORIES = [
  { title: 'Caballeros', subtitle: 'Polos · Jeans · Camisas', img: 'https://picsum.photos/seed/men-patli/400/600', hint: 'men fashion' },
  { title: 'Damas', subtitle: 'Vestidos · Blusas · Blazers', img: 'https://picsum.photos/seed/women-patli/400/600', hint: 'women clothing' },
  { title: 'Niños', subtitle: 'Conjuntos · Vestiditos · Sets', img: 'https://picsum.photos/seed/kids-patli/400/600', hint: 'children wear' },
  { title: 'Accesorios', subtitle: 'Bolsos · Gorros · Billeteras', img: 'https://picsum.photos/seed/acc-patli/400/600', hint: 'fashion accessories' },
];

export default function InicioPage() {
  return (
    <div className="animate-in fade-in duration-700">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[620px] flex items-center overflow-hidden bg-primary">
        <div className="absolute inset-0">
          <Image
            src="https://picsum.photos/seed/patli-hero2/1920/1080"
            alt="Textiles PAT-LI"
            fill
            className="object-cover opacity-30"
            priority
            data-ai-hint="textile fabric clothes"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-2xl text-primary-foreground">
            <Badge className="bg-accent/90 text-primary font-black mb-6 px-5 py-1.5 text-xs tracking-wider uppercase shadow-lg">
              Nueva Colección 2024 · Ica, Perú
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.05] tracking-tighter">
              Moda que une<br />
              <span className="text-accent italic">Calidad</span> y<br />
              <span className="text-accent italic">Tradición</span>
            </h1>
            <p className="text-lg opacity-80 mb-10 font-light max-w-md leading-relaxed">
              Descubre la excelencia del algodón pima iqueño en prendas diseñadas para durar. Estilo, confort y durabilidad en cada costura.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/catalogo">
                <Button size="lg" className="bg-accent text-primary font-black hover:bg-accent/90 h-14 px-8 text-base shadow-xl shadow-accent/30 rounded-2xl gap-2">
                  Explorar Catálogo <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/nosotros">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 h-14 px-8 text-base rounded-2xl backdrop-blur-sm">
                  Nuestra Historia
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mt-10">
              {['Algodón Pima 100%', 'Envíos a todo el Perú', 'YaPe · Plin · Efectivo'].map(b => (
                <span key={b} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  <CheckCircle className="h-3 w-3 text-accent" /> {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
            {STATS.map((s, i) => (
              <div key={i} className="flex flex-col items-center py-8 gap-2 text-center group hover:bg-accent/5 transition-colors duration-300">
                <s.icon className="h-6 w-6 text-accent mb-1" />
                <span className="text-3xl font-black text-primary">{s.value}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Pillars ──────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge variant="outline" className="text-primary border-primary/30 mb-4 font-bold uppercase tracking-widest text-xs">
              ¿Por qué PAT-LI?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">El estilo iqueño que enamora</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                color: 'bg-primary/5 text-primary',
                title: 'Calidad Certificada',
                desc: 'Usamos las mejores fibras de algodón pima y lino de Ica para prendas que no pierden su forma ni color con el tiempo.',
              },
              {
                icon: Zap,
                color: 'bg-accent/10 text-accent',
                title: 'Asistente con IA',
                desc: 'Nuestro PAT-LI Bot te ayuda a encontrar la prenda ideal, consultar stock en tiempo real y coordinar tu pedido al instante.',
              },
              {
                icon: TrendingUp,
                color: 'bg-secondary/10 text-secondary',
                title: 'Precios de Fábrica',
                desc: 'Somos productores directos en Ica. Sin intermediarios → mejor precio para ti y la misma calidad de exportación.',
              },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 group">
                <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Grid ────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <Badge variant="outline" className="text-primary border-primary/30 mb-3 font-bold uppercase tracking-widest text-xs">
                Colecciones
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Explora por Estilo</h2>
              <p className="text-slate-500 mt-2 text-sm">Encuentra la prenda perfecta para cada ocasión</p>
            </div>
            <Link href="/catalogo" className="hidden md:flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all duration-300">
              Ver todo el catálogo <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map((cat, i) => (
              <Link key={i} href="/catalogo" className="group relative overflow-hidden rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="relative h-[380px]">
                  <Image
                    src={cat.img}
                    alt={cat.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    data-ai-hint={cat.hint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{cat.subtitle}</span>
                  <h4 className="text-2xl font-black mb-2">{cat.title}</h4>
                  <span className="flex items-center gap-1 text-xs font-bold text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Ver productos <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8 md:hidden">
            <Link href="/catalogo">
              <Button variant="outline" className="rounded-2xl border-primary text-primary font-bold">
                Ver todo el catálogo <ArrowUpRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge variant="outline" className="text-primary border-primary/30 mb-4 font-bold uppercase tracking-widest text-xs">
              Lo que dicen nuestros clientes
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Testimonios reales</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 flex flex-col">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} size={14} className="fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Assistant CTA ─────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-slate-900 via-primary to-primary/80 rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center gap-10 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
              <Sparkles size={400} />
            </div>
            <div className="text-center md:text-left text-white flex-1 relative z-10">
              <Badge className="bg-accent text-primary font-black mb-4 text-xs px-4 py-1.5 tracking-widest uppercase">
                IA · 24/7
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                ¿No sabes qué elegir?<br />Nuestro bot te asesora
              </h2>
              <p className="opacity-70 text-sm leading-relaxed max-w-md">
                PAT-LI Bot conoce todo nuestro catálogo en tiempo real. Pregúntale por tallas, precios, combinaciones y recibe recomendaciones personalizadas al instante.
              </p>
            </div>
            <div className="shrink-0 relative z-10">
              <button
                onClick={() => window.dispatchEvent(new Event('open-chat'))}
                className="flex items-center gap-3 bg-white text-primary font-black px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-base"
              >
                <MessageCircle className="h-5 w-5" />
                Chatear ahora
              </button>
              <p className="text-center text-white/40 text-xs mt-3">Responde en segundos · Gratis</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Wholesale CTA ────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none flex items-center justify-end pr-10">
              <Shirt size={350} className="rotate-12" />
            </div>
            <div className="max-w-2xl relative z-10">
              <Badge className="bg-accent text-primary font-black mb-6 text-xs px-4 py-1.5 tracking-widest uppercase">
                Distribuidores
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tighter">
                ¿Ventas al por mayor para tu negocio?
              </h2>
              <p className="text-primary-foreground/70 text-base mb-10 leading-relaxed max-w-lg">
                Únete a nuestra red de distribuidores en el sur del Perú. Beneficios exclusivos, asesoría personalizada y catálogos adelantados de temporada.
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <Link href="/contacto">
                  <Button className="bg-accent text-primary font-black h-14 px-8 rounded-2xl text-base hover:bg-accent/90 shadow-lg shadow-accent/20 gap-2">
                    Contactar Ventas Mayoristas <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3 text-white">
                  <div className="flex -space-x-2">
                    {[11, 12, 13].map(i => (
                      <div key={i} className="w-9 h-9 rounded-full border-2 border-primary bg-slate-200 overflow-hidden relative shadow-sm">
                        <Image src={`https://picsum.photos/seed/${i}/36/36`} alt="distribuidor" fill />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-semibold opacity-80">+500 distribuidores activos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
