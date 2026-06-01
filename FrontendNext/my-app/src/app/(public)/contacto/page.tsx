"use client";

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, Instagram, Facebook, MessageCircle, ChevronDown, ChevronUp, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

const FAQ = [
  { q: '¿Hacen envíos a todo el Perú?', a: 'Sí, realizamos envíos nacionales mediante courier (Olva, Shalom, Rappi). El costo y tiempo de envío varía según tu ubicación. En Ica el delivery es el mismo día.' },
  { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos efectivo, YaPe, Plin, transferencia bancaria (BCP, Interbank) y tarjetas de débito/crédito en tienda.' },
  { q: '¿Puedo hacer devoluciones o cambios?', a: 'Sí, aceptamos cambios dentro de los 7 días posteriores a la compra con boleta y que la prenda esté sin uso y con etiqueta. Consulta condiciones para tallas.' },
  { q: '¿Tienen ventas al por mayor?', a: 'Sí, tenemos programa de distribuidores con precios especiales a partir de 12 unidades. Contáctanos directamente para coordinar tu primera orden.' },
  { q: '¿Puedo visitar la tienda sin cita?', a: 'Por supuesto. Estamos abiertos Lunes a Viernes de 9:00 a 19:00 y Sábados de 9:00 a 14:00 en Calle Lima 123, Ica. ¡Te esperamos!' },
];

export default function ContactoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="animate-in fade-in duration-700">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-primary py-24 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 -skew-x-12 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Badge className="bg-accent text-primary font-black mb-6 px-5 py-1.5 text-xs tracking-widest uppercase shadow-lg">
            Estamos aquí para ti
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
            Estamos para <span className="text-accent italic">escucharte</span>
          </h1>
          <p className="text-primary-foreground/70 max-w-xl mx-auto text-base font-light leading-relaxed">
            ¿Tienes dudas sobre un pedido, ventas mayoristas o quieres visitarnos? Escríbenos y te respondemos en menos de 24 horas.
          </p>

          {/* Quick contact options */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <a href="https://wa.me/51987654321" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:scale-105 text-sm">
              <MessageCircle size={18} /> WhatsApp Rápido
            </a>
            <a href="tel:+5156212121"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold px-5 py-3 rounded-2xl border border-white/20 transition-all duration-200 text-sm">
              <Phone size={18} /> +51 056-212121
            </a>
          </div>
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Address */}
              <div className="flex gap-4 p-6 rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <div className="bg-accent p-3 rounded-xl text-primary shrink-0">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 className="font-black mb-1">Sede Central</h4>
                  <p className="text-sm opacity-80">Calle Lima 123, Ica, Perú</p>
                  <span className="text-[10px] uppercase font-black tracking-widest mt-2 block text-accent">Punto de Fábrica</span>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-secondary/10 p-3 rounded-xl text-secondary shrink-0">
                  <Phone size={22} />
                </div>
                <div>
                  <h4 className="font-black mb-1">Teléfonos</h4>
                  <p className="text-sm text-slate-600">+51 (056) 212121</p>
                  <p className="text-sm text-emerald-600 font-semibold">WhatsApp: +51 987 654 321</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-accent/10 p-3 rounded-xl text-accent shrink-0">
                  <Mail size={22} />
                </div>
                <div>
                  <h4 className="font-black mb-1">Correos</h4>
                  <p className="text-sm text-slate-600">ventas@patli.pe</p>
                  <p className="text-sm text-slate-600">soporte@patli.pe</p>
                </div>
              </div>

              {/* Hours */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <h5 className="font-black flex items-center gap-2 mb-4 text-sm">
                  <Clock size={16} className="text-primary" /> Horario de Atención
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lunes – Viernes</span>
                    <span className="font-bold">09:00 – 19:00</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2">
                    <span className="text-slate-500">Sábados</span>
                    <span className="font-bold">09:00 – 14:00</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2">
                    <span className="text-slate-500">Domingos</span>
                    <span className="font-bold text-destructive">Cerrado</span>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <h5 className="font-black text-sm mb-4">Síguenos</h5>
                <div className="flex gap-3">
                  <a href="#" className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center hover:bg-pink-100 transition-colors">
                    <Instagram size={18} />
                  </a>
                  <a href="#" className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-colors">
                    <Facebook size={18} />
                  </a>
                  <a href="https://wa.me/51987654321" target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-100 transition-colors">
                    <MessageCircle size={18} />
                  </a>
                </div>
                <p className="text-xs text-slate-400 mt-3">@patli.textiles · Contenido diario</p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-xl">
                {submitted ? (
                  <div className="text-center py-16 space-y-5 animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                      <Send size={36} />
                    </div>
                    <h3 className="text-3xl font-black">¡Mensaje Enviado!</h3>
                    <p className="text-slate-500 max-w-sm mx-auto leading-relaxed text-sm">
                      Gracias por contactarnos. Uno de nuestros asesores te responderá en menos de 24 horas. También puedes escribirnos por WhatsApp para una respuesta inmediata.
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                      <Button variant="outline" onClick={() => setSubmitted(false)} className="rounded-2xl">
                        Enviar otro mensaje
                      </Button>
                      <a href="https://wa.me/51987654321" target="_blank" rel="noopener noreferrer">
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl gap-2">
                          <MessageCircle size={16} /> WhatsApp
                        </Button>
                      </a>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h2 className="text-3xl font-black mb-2">Envíanos un mensaje</h2>
                      <p className="text-slate-500 text-sm">Te responderemos con gusto a la brevedad posible.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nombre Completo</label>
                          <Input placeholder="Ej. Juan Pérez" required className="h-12 rounded-2xl focus-visible:ring-primary border-slate-200" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Correo Electrónico</label>
                          <Input type="email" placeholder="ejemplo@correo.com" required className="h-12 rounded-2xl focus-visible:ring-primary border-slate-200" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Teléfono / WhatsApp</label>
                          <Input type="tel" placeholder="+51 987 654 321" className="h-12 rounded-2xl focus-visible:ring-primary border-slate-200" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Tipo de Consulta</label>
                          <select className="w-full h-12 rounded-2xl border border-slate-200 px-4 text-sm focus:ring-2 focus:ring-primary focus:outline-none bg-white text-slate-700">
                            <option value="">Selecciona...</option>
                            <option>Consulta de productos</option>
                            <option>Ventas al por mayor</option>
                            <option>Pedido personalizado</option>
                            <option>Soporte / Reclamo</option>
                            <option>Otro</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Asunto</label>
                        <Input placeholder="Ej. Consulta ventas mayoristas" required className="h-12 rounded-2xl focus-visible:ring-primary border-slate-200" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Mensaje</label>
                        <Textarea
                          placeholder="Cuéntanos cómo podemos ayudarte. Si buscas un producto específico, menciona colores, tallas y cantidades."
                          required
                          className="min-h-[140px] rounded-2xl focus-visible:ring-primary py-4 border-slate-200 resize-none"
                        />
                      </div>
                      <Button type="submit" className="w-full h-14 bg-primary text-white font-black text-base rounded-2xl hover:bg-primary/90 shadow-lg gap-2">
                        Enviar Mensaje <Send size={18} />
                      </Button>
                      <p className="text-center text-xs text-slate-400">
                        O contáctanos directamente por{' '}
                        <a href="https://wa.me/51987654321" className="text-emerald-600 font-bold hover:underline">WhatsApp</a>
                        {' '}para respuesta inmediata.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className="text-primary border-primary/30 mb-4 font-black uppercase tracking-widest text-xs">
              FAQ
            </Badge>
            <h2 className="text-3xl font-black tracking-tight">Preguntas Frecuentes</h2>
            <p className="text-slate-500 mt-3 text-sm">Lo que más nos preguntan nuestros clientes</p>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left font-bold text-sm hover:bg-slate-50 transition-colors duration-200"
                >
                  <span>{item.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={16} className="text-primary shrink-0" />
                    : <ChevronDown size={16} className="text-slate-400 shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed animate-in slide-in-from-top-2 duration-200 border-t border-slate-100 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Map ──────────────────────────────────────────────────── */}
      <section className="h-[420px] relative bg-slate-200">
        <Image
          src="https://picsum.photos/seed/map-ica2/1920/600"
          alt="Mapa de Ica"
          fill
          className="object-cover grayscale hover:grayscale-0 transition-all duration-700 opacity-40"
          data-ai-hint="city map aerial"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white px-8 py-6 rounded-[2rem] shadow-2xl flex items-center gap-5 animate-bounce">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-accent shadow-lg">
              <Shirt size={26} />
            </div>
            <div>
              <p className="font-black text-primary text-lg leading-none">PAT-LI Textiles</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Calle Lima 123, Ica, Perú</p>
              <p className="text-xs text-slate-400 mt-0.5">Lun-Vie 9:00-19:00 · Sáb 9:00-14:00</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
