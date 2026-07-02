"use client";

import { useState, useEffect } from 'react';
import {
  Bell, Search, User, Menu, LogOut, Settings,
  ShoppingCart, Package, Star, X, CheckCheck, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

const NOTIF_STYLES = {
  pedido:   { icon: ShoppingCart, bg: 'bg-emerald-100', color: 'text-emerald-600', dot: 'bg-emerald-500' },
  stock:    { icon: Package,      bg: 'bg-amber-100',   color: 'text-amber-600',   dot: 'bg-amber-500'   },
  encuesta: { icon: Star,         bg: 'bg-red-100',     color: 'text-red-600',     dot: 'bg-red-500'     },
};

const BREADCRUMBS: Record<string, string> = {
  '/dashboard':             'Dashboard',
  '/ventas':                'Ventas',
  '/productos':             'Productos',
  '/clientes':              'Clientes',
  '/clientes-potenciales':  'Leads',
  '/consultas':             'Consultas',
  '/chatbot':               'Chatbot IA',
  '/inventario':            'Inventario',
  '/proveedores':           'Proveedores',
  '/reportes':              'Reportes',
  '/satisfaccion':          'Satisfacción',
  '/devoluciones':          'Devoluciones',
  '/descuentos':            'Descuentos',
  '/campanias':             'Campañas',
  '/optimizacion':          'Optimización',
  '/actividad':             'Actividad',
  '/ajustes':               'Configuración',
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return 'Ahora';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  return `Hace ${Math.floor(diff / 3600)} h`;
}

export function Header() {
  const router             = useRouter();
  const pathname           = usePathname();
  const notifications      = useAppStore((s) => s.notifications);
  const markAllRead        = useAppStore((s) => s.markAllRead);
  const clearNotification  = useAppStore((s) => s.clearNotification);

  const unread = notifications.filter((n) => !n.read).length;
  const currentPage = BREADCRUMBS[pathname] ?? 'Panel';

  const [aiStatus, setAiStatus]   = useState<'online' | 'lento' | 'checking'>('checking');
  const [aiLatency, setAiLatency] = useState<number | null>(null);

  useEffect(() => {
    const check = async () => {
      const start = Date.now();
      try {
        await fetch('/api/ai/admin-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'ping' }),
          signal: AbortSignal.timeout(6000),
        });
        const ms = Date.now() - start;
        setAiLatency(ms);
        setAiStatus(ms < 3000 ? 'online' : 'lento');
      } catch {
        setAiStatus('lento');
        setAiLatency(null);
      }
    };
    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    toast({ title: 'Saliendo del panel...', description: 'Sesión finalizada.' });
    setTimeout(() => router.push('/'), 1000);
  };

  return (
    <header className="h-14 border-b border-slate-100 bg-white/95 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-40 shadow-sm">

      {/* Left: mobile menu + page title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 shrink-0">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Page title as breadcrumb */}
        <div className="hidden sm:flex items-center gap-1.5 text-sm min-w-0">
          <span className="text-slate-400 font-medium shrink-0">PAT-LI</span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-700 truncate">{currentPage}</span>
        </div>

        {/* Search */}
        <div className="relative ml-4 hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="pl-8 h-8 w-52 bg-slate-50 border-slate-200 focus:bg-white text-sm rounded-xl"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-300 font-mono hidden lg:block">⌘K</span>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5">

        {/* AI Status */}
        <div className={cn(
          'hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all duration-300',
          aiStatus === 'online'   ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          aiStatus === 'lento'    ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-slate-50 text-slate-400 border-slate-200'
        )}>
          <Zap className="h-3 w-3" />
          <span className="relative flex h-1.5 w-1.5">
            <span className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-60',
              aiStatus === 'online' ? 'bg-emerald-400' : aiStatus === 'lento' ? 'bg-amber-400' : 'bg-slate-400'
            )} />
            <span className={cn(
              'relative inline-flex h-1.5 w-1.5 rounded-full',
              aiStatus === 'online' ? 'bg-emerald-500' : aiStatus === 'lento' ? 'bg-amber-500' : 'bg-slate-400'
            )} />
          </span>
          {aiStatus === 'checking' ? 'IA…' : aiStatus === 'online' ? `${aiLatency}ms` : 'IA lenta'}
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
              {unread > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              ) : (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full" />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-[340px] p-0 shadow-xl rounded-2xl border-slate-100">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">Notificaciones</span>
                {unread > 0 && <Badge className="bg-red-500 text-white text-[9px] h-4 px-1.5 font-black">{unread}</Badge>}
              </div>
              {unread > 0 && (
                <Button
                  variant="ghost" size="sm"
                  className="h-6 text-[10px] gap-1 text-primary hover:text-primary px-2"
                  onClick={(e) => { e.preventDefault(); markAllRead(); }}
                >
                  <CheckCheck className="h-3 w-3" /> Leer todo
                </Button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  <Bell className="h-6 w-6 mx-auto mb-2 opacity-30" />
                  <p>Sin notificaciones</p>
                </div>
              ) : (
                notifications.slice(0, 12).map((n) => {
                  const style = NOTIF_STYLES[n.type];
                  const Icon  = style.icon;
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50/80 transition-colors group',
                        !n.read && 'bg-blue-50/30'
                      )}
                    >
                      <div className={`p-1.5 rounded-lg ${style.bg} ${style.color} shrink-0 mt-0.5`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {!n.read && <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />}
                          <p className="text-xs font-bold text-slate-800 truncate">{n.title}</p>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">{n.message}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{timeAgo(n.timestamp)}</p>
                      </div>
                      <Button
                        variant="ghost" size="icon"
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-slate-600 shrink-0"
                        onClick={(e) => { e.preventDefault(); clearNotification(n.id); }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
                <button
                  className="text-[10px] text-slate-400 hover:text-red-500 transition-colors"
                  onClick={() => notifications.forEach(n => clearNotification(n.id))}
                >
                  Limpiar todo
                </button>
                <button
                  className="text-[10px] text-primary font-bold hover:underline"
                  onClick={() => router.push('/ventas')}
                >
                  Ver ventas →
                </button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-1 h-8 rounded-xl hover:bg-slate-100">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold leading-none">Admin PAT-LI</span>
                <span className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">Administrador</span>
              </div>
              <Avatar className="h-7 w-7 border-2 border-primary/20">
                <AvatarImage src="https://picsum.photos/seed/admin/32/32" />
                <AvatarFallback className="text-[10px]"><User /></AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-2xl shadow-xl border-slate-100">
            <DropdownMenuLabel className="text-xs">Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/ajustes')} className="text-xs gap-2">
              <Settings className="h-3.5 w-3.5" /> Perfil y Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive text-xs gap-2" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5" /> Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
