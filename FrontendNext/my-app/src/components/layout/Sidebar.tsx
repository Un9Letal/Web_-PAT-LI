"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, ShoppingBag, Package, Users, UserPlus,
  MessageSquare, Bot, Warehouse, BarChart3, Star, LogOut,
  Shirt, Settings, Home, Truck, Activity, RotateCcw, Tag,
  TrendingUp, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/appStore';

const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard',   label: 'Dashboard',     icon: LayoutDashboard },
      { href: '/ventas',      label: 'Ventas',         icon: ShoppingBag,    badge: 'sales' },
      { href: '/productos',   label: 'Productos',      icon: Package },
      { href: '/inventario',  label: 'Inventario',     icon: Warehouse },
    ],
  },
  {
    label: 'Clientes',
    items: [
      { href: '/clientes',              label: 'Clientes',    icon: Users },
      { href: '/clientes-potenciales',  label: 'Leads',       icon: UserPlus },
      { href: '/consultas',             label: 'Consultas',   icon: MessageSquare },
      { href: '/satisfaccion',          label: 'Satisfacción',icon: Star },
    ],
  },
  {
    label: 'Inteligencia IA',
    items: [
      { href: '/chatbot',       label: 'Chatbot IA',    icon: Bot },
      { href: '/optimizacion',  label: 'Optimización',  icon: TrendingUp },
      { href: '/reportes',      label: 'Reportes',      icon: BarChart3 },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { href: '/proveedores',   label: 'Proveedores',   icon: Truck },
      { href: '/devoluciones',  label: 'Devoluciones',  icon: RotateCcw },
      { href: '/descuentos',    label: 'Descuentos',    icon: Tag },
      { href: '/actividad',     label: 'Actividad',     icon: Activity },
      { href: '/ajustes',       label: 'Configuración', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const webOrders = useAppStore((s) => s.completedSales.length);

  const handleLogout = () => {
    toast({ title: 'Cerrando sesión...', description: 'Has salido del panel administrativo.' });
    setTimeout(() => router.push('/'), 1000);
  };

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border">

      {/* Logo */}
      <Link href="/" className="p-5 flex items-center gap-3 border-b border-sidebar-border hover:bg-white/5 transition-colors duration-200 group">
        <div className="p-2.5 bg-accent/15 rounded-xl shadow-sm group-hover:bg-accent/25 transition-colors duration-200">
          <Shirt className="h-5 w-5 text-accent" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-lg font-black tracking-tighter">PAT-LI</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] opacity-40">Textiles Flow</span>
        </div>
      </Link>

      {/* Nav */}
      <ScrollArea className="flex-1 py-3">
        <nav className="px-3 space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] opacity-30 px-3 mb-1.5">{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  const showBadge = item.badge === 'sales' && webOrders > 0;
                  return (
                    <Link key={item.href} href={item.href}>
                      <span className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative overflow-hidden',
                        isActive
                          ? 'bg-white/12 text-white shadow-sm'
                          : 'hover:bg-white/6 text-sidebar-foreground/60 hover:text-white'
                      )}>
                        {/* Active left bar */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-r-full" />
                        )}
                        <item.icon className={cn(
                          'h-4 w-4 shrink-0 transition-all duration-200',
                          isActive
                            ? 'text-accent'
                            : 'text-sidebar-foreground/35 group-hover:text-sidebar-foreground/70 group-hover:scale-110'
                        )} />
                        <span className={cn(
                          'text-xs flex-1 font-semibold',
                          isActive ? 'font-bold' : ''
                        )}>
                          {item.label}
                        </span>
                        {showBadge && (
                          <Badge className="bg-emerald-500 text-white text-[9px] h-4 px-1.5 min-w-[18px] justify-center font-black">
                            {webOrders}
                          </Badge>
                        )}
                        {isActive && (
                          <ChevronRight className="h-3 w-3 text-white/30 shrink-0" />
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {/* AI status */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Gemini Conectado</span>
          </div>
          <p className="text-[9px] text-sidebar-foreground/40 leading-relaxed">
            Gemini 2.5 Flash · Chatbot + IA activos
          </p>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/50 hover:text-white hover:bg-white/5 gap-2.5 rounded-xl h-9 text-xs font-bold"
          onClick={() => router.push('/')}
        >
          <Home className="h-4 w-4" />
          Ir al Inicio
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-destructive/70 hover:text-destructive hover:bg-destructive/10 gap-2.5 rounded-xl h-9 text-xs font-bold"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
