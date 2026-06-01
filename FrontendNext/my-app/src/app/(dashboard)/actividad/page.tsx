"use client";

import { useAppStore, type ActivityModule } from '@/store/appStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, ShoppingBag, Users, Package, Truck, MessageCircle, Bot, Zap, Settings, Filter } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const MODULE_META: Record<ActivityModule, { label: string; icon: typeof Activity; color: string; bg: string }> = {
  ventas:      { label: 'Ventas',      icon: ShoppingBag,    color: 'text-emerald-600', bg: 'bg-emerald-100' },
  clientes:    { label: 'Clientes',    icon: Users,          color: 'text-blue-600',    bg: 'bg-blue-100'    },
  inventario:  { label: 'Inventario',  icon: Package,        color: 'text-amber-600',   bg: 'bg-amber-100'   },
  proveedores: { label: 'Proveedores', icon: Truck,          color: 'text-purple-600',  bg: 'bg-purple-100'  },
  consultas:   { label: 'Consultas',   icon: MessageCircle,  color: 'text-pink-600',    bg: 'bg-pink-100'    },
  chatbot:     { label: 'Chatbot',     icon: Bot,            color: 'text-indigo-600',  bg: 'bg-indigo-100'  },
  ia:          { label: 'IA Gemini',   icon: Zap,            color: 'text-violet-600',  bg: 'bg-violet-100'  },
  sistema:     { label: 'Sistema',     icon: Settings,       color: 'text-slate-600',   bg: 'bg-slate-100'   },
};

const ALL_MODULES: ActivityModule[] = ['ventas','clientes','inventario','proveedores','consultas','chatbot','ia','sistema'];

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return 'Ahora mismo';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} d`;
}

export default function ActividadPage() {
  const activityLog = useAppStore(s => s.activityLog);
  const [filter, setFilter] = useState<ActivityModule | 'todos'>('todos');

  const filtered = filter === 'todos'
    ? activityLog
    : activityLog.filter(e => e.module === filter);

  const countByModule = ALL_MODULES.map(m => ({
    module: m,
    count: activityLog.filter(e => e.module === m).length,
  })).filter(x => x.count > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-md">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="page-title">Historial de Actividad</h1>
          <p className="page-subtitle">Registro en tiempo real de todas las acciones del sistema</p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total acciones',     value: activityLog.length,                                                       grad: 'from-[#1e3a5f] to-[#2563eb]', valCls: 'text-slate-900' },
          { label: 'Ventas registradas', value: activityLog.filter(e => e.module === 'ventas').length,                   grad: 'from-emerald-400 to-teal-600', valCls: 'text-emerald-600' },
          { label: 'Acciones IA',        value: activityLog.filter(e => e.module === 'ia' || e.module === 'chatbot').length, grad: 'from-violet-500 to-purple-600', valCls: 'text-violet-600' },
          { label: 'Módulos activos',    value: countByModule.length,                                                     grad: 'from-cyan-500 to-blue-600', valCls: 'text-slate-900' },
        ].map((k, i) => (
          <div key={i} className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-gradient-to-b ${k.grad}`} />
            <div className="p-4 pl-5">
              <p className="section-label mb-1.5">{k.label}</p>
              <p className={`text-2xl font-black leading-none ${k.valCls}`}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('todos')}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-bold border transition-colors',
            filter === 'todos' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          )}
        >
          Todos ({activityLog.length})
        </button>
        {countByModule.map(({ module, count }) => {
          const meta = MODULE_META[module];
          const Icon = meta.icon;
          return (
            <button
              key={module}
              onClick={() => setFilter(module)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors',
                filter === module
                  ? `${meta.bg} ${meta.color} border-current`
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              <Icon className="h-3 w-3" />
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Activity feed */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-slate-400" />
            {filter === 'todos' ? `${filtered.length} eventos` : `${MODULE_META[filter].label} — ${filtered.length} eventos`}
          </CardTitle>
          <CardDescription>Ordenado por tiempo, más reciente primero</CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Activity className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No hay actividad registrada en este módulo.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-100" />
              <div className="space-y-1">
                {filtered.map((entry, i) => {
                  const meta = MODULE_META[entry.module];
                  const Icon = meta.icon;
                  return (
                    <div key={entry.id} className="flex items-start gap-4 pl-1 py-2.5 hover:bg-slate-50 rounded-xl transition-colors pr-2">
                      {/* Icon bubble */}
                      <div className={`w-8 h-8 rounded-full ${meta.bg} ${meta.color} flex items-center justify-center shrink-0 z-10 text-sm`}>
                        {entry.icon}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-800">{entry.action}</span>
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${meta.color} border-current bg-transparent`}>
                            {meta.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{entry.detail}</p>
                      </div>
                      {/* Time */}
                      <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap shrink-0 mt-0.5">
                        {timeAgo(entry.timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

