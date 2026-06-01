"use client";

import Image from 'next/image';
import { Target, Heart, Users, Award, CheckCircle2, Star, Zap, Sparkles, MapPin, TrendingUp, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MILESTONES = [
  { year: '1995', title: 'Fundación', desc: 'Nacemos como un pequeño taller familiar en el corazón de Ica, con el sueño de vestir a nuestra comunidad con calidad.', icon: Sparkles },
  { year: '2005', title: 'Expansión Regional', desc: 'Abrimos distribución en toda la región Ica y comenzamos a surtir a boutiques y tiendas del sur del Perú.', icon: TrendingUp },
  { year: '2015', title: 'Modernización', desc: 'Renovamos maquinaria e incorporamos procesos de control de calidad internacionales. Segunda generación al frente.', icon: Shield },
  { year: '2024', title: 'Era Digital con IA', desc: 'Lanzamos nuestra plataforma inteligente con asistente virtual, catálogo digital y gestión con Inteligencia Artificial.', icon: Zap },
];

const VALUES = [
  { title: 'Integridad', icon: Award, color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600', desc: 'Actuamos con honestidad y transparencia en cada transacción.' },
  { title: 'Excelencia', icon: Star, color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600', desc: 'Buscamos la perfección en cada prenda que sale de nuestro taller.' },
  { title: 'Comunidad', icon: Users, color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600', desc: 'Crecemos junto a nuestra gente y la economía de Ica.' },
  { title: 'Innovación', icon: Zap, color: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600', desc: 'Adoptamos tecnología para mejorar la experiencia de cada cliente.' },
];

const TEAM = [
  { name: 'Patricia L.', role: 'Fundadora & CEO', img: 'https://picsum.photos/seed/ceo-patli/200/200', hint: 'businesswoman portrait' },
  { name: 'Andrés L.', role: 'Director de Operaciones', img: 'https://picsum.photos/seed/ops-patli/200/200', hint: 'businessman portrait' },
  { name: 'Carla M.', role: 'Diseñadora Principal', img: 'https://picsum.photos/seed/design-patli/200/200', hint: 'fashion designer portrait' },
  { name: 'Miguel T.', role: 'Jefe de Ventas', img: 'https://picsum.photos/seed/sales-patli/200/200', hint: 'sales manager portrait' },
];

export default function NosotrosPage() {
  return (
    <div className="animate-in fade-in duration-700">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-primary py-28 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 -skew-x-12 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge className="bg-accent text-primary font-black mb-6 px-5 py-1.5 text-xs tracking-widest uppercase shadow-lg">
              Ica, Perú · Desde 1995
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-tight">
              Nuestra pasión es<br />vestir con <span className="text-accent italic">excelencia</span>
            </h1>
            <p className="text-xl opacity-70 font-light leading-relaxed max-w-2xl">
              Desde el corazón de Ica, PAT-LI Textiles ha evolucionado de un pequeño taller familiar a referente regional de calidad textil, fusionando técnicas artesanales con innovación tecnológica.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
            {[
              { value: '25+', label: 'Años de trayectoria' },
              { value: '500+', label: 'Clientes y distribuidores' },
              { value: '10K+', label: 'Prendas producidas / año' },
              { value: '100%', label: 'Mano de obra iqueña' },
            ].map((s, i) => (
              <div key={i} className="text-center py-10">
                <p className="text-4xl font-black text-primary mb-1">{s.value}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── History ──────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative h-[520px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://picsum.photos/seed/history-patli/800/1000"
                  alt="Historia PAT-LI"
                  fill
                  className="object-cover"
                  data-ai-hint="textile factory workers"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
              </div>
              <div className="absolute bottom-8 left-8 bg-white p-6 rounded-2xl shadow-xl">
                <p className="text-5xl font-black text-primary mb-1">25+</p>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Años de trayectoria</p>
              </div>
              <div className="absolute -top-4 -right-4 bg-accent text-primary p-5 rounded-2xl shadow-xl font-black text-center">
                <p className="text-2xl">⭐ 4.8</p>
                <p className="text-[10px] uppercase tracking-widest mt-1">Calificación</p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <Badge variant="outline" className="text-primary border-primary/30 mb-4 font-black uppercase tracking-widest text-xs">
                  Nuestra Historia
                </Badge>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-6">De un taller local<br />a tu hogar</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                PAT-LI nació en 1995 con el sueño de aprovechar la riqueza algodonera de nuestra región para crear prendas que no solo se vean bien, sino que duren toda la vida.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Hoy, bajo la dirección de la segunda generación familiar, hemos integrado Inteligencia Artificial para optimizar nuestra producción y mejorar la experiencia de cada cliente, sin perder el toque humano que nos caracteriza.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-2">
                {[
                  { icon: CheckCircle2, title: 'Orgullo Regional', desc: 'Mano de obra 100% iqueña.' },
                  { icon: CheckCircle2, title: 'IA Integrada', desc: 'Procesos digitales modernos.' },
                  { icon: CheckCircle2, title: 'Calidad Premium', desc: 'Algodón pima certificado.' },
                  { icon: CheckCircle2, title: 'Sostenibilidad', desc: 'Producción responsable.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <item.icon className="text-success mt-0.5 shrink-0" size={18} />
                    <div>
                      <h4 className="font-bold text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <MapPin className="text-primary shrink-0" size={20} />
                <div>
                  <p className="font-bold text-sm">Sede Central</p>
                  <p className="text-xs text-slate-500">Calle Lima 123, Ica, Perú · Abiertos Lun-Vie 9:00-19:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="text-primary border-primary/30 mb-4 font-black uppercase tracking-widest text-xs">
              Hitos
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Nuestra línea de tiempo</h2>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2 hidden md:block" />
            <div className="space-y-12">
              {MILESTONES.map((m, i) => (
                <div key={i} className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className={`bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 ${i % 2 === 0 ? 'md:ml-auto' : ''} max-w-sm ${i % 2 === 0 ? 'md:mr-0' : 'md:ml-0'}`}>
                      <span className="text-3xl font-black text-accent block mb-2">{m.year}</span>
                      <h3 className="text-xl font-bold mb-2">{m.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                  <div className="relative z-10 w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                    <m.icon size={22} className="text-accent" />
                  </div>
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ─────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-lg p-10 bg-primary text-primary-foreground rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <Target size={200} />
              </div>
              <CardContent className="p-0 space-y-6 relative z-10">
                <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center text-primary">
                  <Target size={28} />
                </div>
                <h3 className="text-3xl font-black">Nuestra Misión</h3>
                <p className="text-primary-foreground/75 leading-relaxed">
                  Proveer soluciones textiles de alta calidad que superen las expectativas de nuestros clientes en estilo, confort y durabilidad, promoviendo el desarrollo económico de la región Ica y el bienestar de nuestros colaboradores.
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm p-10 bg-white rounded-3xl border border-slate-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
                <Heart size={200} />
              </div>
              <CardContent className="p-0 space-y-6 relative z-10">
                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                  <Heart size={28} />
                </div>
                <h3 className="text-3xl font-black">Nuestra Visión</h3>
                <p className="text-slate-600 leading-relaxed">
                  Ser la marca textil líder en el sur del Perú por nuestra innovación, compromiso social y excelencia operativa, llevando el nombre de PAT-LI a nuevos mercados nacionales e internacionales para 2030.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="text-primary border-primary/30 mb-4 font-black uppercase tracking-widest text-xs">
            Valores
          </Badge>
          <h2 className="text-3xl md:text-4xl font-black mb-16 tracking-tight">Los principios que nos guían</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group text-left">
                <div className={`w-14 h-14 ${v.color} group-hover:text-white rounded-2xl flex items-center justify-center mb-6 transition-all duration-500`}>
                  <v.icon size={26} />
                </div>
                <h4 className="text-xl font-black mb-3">{v.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge variant="outline" className="text-primary border-primary/30 mb-4 font-black uppercase tracking-widest text-xs">
              El equipo
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Las personas detrás de PAT-LI</h2>
            <p className="text-slate-500 mt-3 text-sm max-w-lg mx-auto">Un equipo apasionado por la moda, la calidad y el servicio al cliente iqueño.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <div key={i} className="text-center group">
                <div className="relative w-full aspect-square rounded-3xl overflow-hidden mb-4 shadow-sm group-hover:shadow-lg transition-shadow duration-300">
                  <Image
                    src={member.img}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    data-ai-hint={member.hint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h4 className="font-black text-base">{member.name}</h4>
                <p className="text-xs text-slate-500 font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
