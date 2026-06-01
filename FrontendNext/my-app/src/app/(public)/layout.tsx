"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shirt, ShoppingCart, Menu, Phone, Mail, MapPin, Facebook, Instagram, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatWidget } from '@/components/chatbot/ChatWidget';
import { CartSheet } from '@/components/cart/CartSheet';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const [cartOpen, setCartOpen]   = useState(false);
  const [mobileOpen, setMobile]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((a, i) => a + i.quantity, 0);

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/catalogo', label: 'Catálogo' },
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/contacto', label: 'Contacto' },
  ];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobile(false), [pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <nav className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-primary/95 backdrop-blur-md shadow-xl shadow-primary/20'
          : 'bg-primary shadow-md'
      )}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-accent p-2 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Shirt className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-tighter text-white">PAT-LI</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50">Textiles · Ica</span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200',
                    active
                      ? 'text-accent bg-white/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-accent rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* WhatsApp quick */}
            <a
              href="https://wa.me/51987654321"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors duration-200"
            >
              <MessageCircle size={13} /> WhatsApp
            </a>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-white/10 relative text-white"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1 bg-accent text-primary text-[10px] font-black border-2 border-primary rounded-full">
                  {cartCount}
                </Badge>
              )}
            </Button>

            <div className="hidden sm:block h-6 w-px bg-white/20 mx-1" />

            <Link href="/login" className="hidden sm:block">
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 text-xs font-bold rounded-xl">
                Admin
              </Button>
            </Link>

            {/* Mobile burger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-white/10"
              onClick={() => setMobile(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-primary/98 backdrop-blur-md border-t border-white/10 animate-in slide-in-from-top-2 duration-200">
            <div className="container mx-auto px-4 py-6 flex flex-col gap-2">
              {navLinks.map((link) => {
                const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center px-4 py-3 rounded-2xl text-base font-bold transition-all duration-200',
                      active ? 'bg-white/10 text-accent' : 'text-white/70 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-4 flex gap-3">
                <a href="https://wa.me/51987654321" target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 font-bold gap-2">
                    <MessageCircle size={16} /> WhatsApp
                  </Button>
                </a>
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full border-white/30 text-white font-bold">Panel Admin</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">{children}</main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400">
        {/* Top wave */}
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary" />

        <div className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-3 text-white">
              <div className="p-2 bg-accent/20 rounded-xl">
                <Shirt className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-black tracking-tighter leading-none">PAT-LI</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Textiles · Ica, Perú</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Líderes en la industria textil de Ica desde 1995. Prendas de algodón pima premium que destacan por su calidad, estilo y durabilidad.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: MessageCircle, href: 'https://wa.me/51987654321', label: 'WhatsApp' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href !== '#' ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-accent/20 hover:text-accent text-slate-400 flex items-center justify-center transition-all duration-200"
                  aria-label={label}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-5">Empresa</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: '/nosotros', label: '¿Quiénes Somos?' },
                { href: '/catalogo', label: 'Catálogo Digital' },
                { href: '/contacto', label: 'Ubícanos' },
                { href: '#', label: 'Términos de Uso' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-accent transition-colors duration-200">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-5">Contacto</h4>
            <div className="space-y-4 text-sm">
              {[
                { icon: MapPin,  text: 'Calle Lima 123, Ica, Perú' },
                { icon: Phone,   text: '+51 (056) 212121' },
                { icon: Mail,    text: 'ventas@patli.pe' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <Icon className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <span>{text}</span>
                </div>
              ))}
              <a
                href="https://wa.me/51987654321"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold px-3 py-2 rounded-xl transition-colors duration-200 mt-2"
              >
                <MessageCircle size={13} /> Chat WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800">
          <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
            <p>&copy; {new Date().getFullYear()} PAT-LI Textiles S.R.L. · Todos los derechos reservados.</p>
            <p className="flex items-center gap-1.5 text-slate-500">
              Hecho con <span className="text-accent">♥</span> en Ica · Potenciado con IA
            </p>
          </div>
        </div>
      </footer>

      <ChatWidget />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}
