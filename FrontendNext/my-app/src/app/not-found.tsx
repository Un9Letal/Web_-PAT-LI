import Link from 'next/link';
import { Shirt, Home, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1e3a5f] to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute top-8 left-8 text-white/5 font-black text-[200px] leading-none select-none hidden lg:block">404</div>
      </div>

      <div className="text-center max-w-lg relative z-10">

        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
          <div className="p-2.5 bg-amber-400 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
            <Shirt className="h-6 w-6 text-[#1e3a5f]" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-black text-white tracking-tighter leading-none block">PAT-LI</span>
            <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">Textiles Flow</span>
          </div>
        </Link>

        {/* 404 badge */}
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Error 404</span>
        </div>

        {/* Main text */}
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
          Página no<br />
          <span className="text-amber-400">encontrada</span>
        </h1>

        <p className="text-white/50 text-base mb-2">
          Esta URL no existe en el sistema PAT-LI.
        </p>
        <p className="text-white/30 text-sm mb-10">
          Verifica la dirección o usa uno de los accesos rápidos.
        </p>

        {/* Quick links */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-amber-400 text-[#1e3a5f] font-black px-6 py-3 rounded-xl hover:bg-amber-300 transition-colors shadow-lg shadow-amber-500/20"
          >
            <Home className="h-4 w-4" /> Ir al Dashboard
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center gap-2 border border-white/10 bg-white/5 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" /> Ver Catálogo
          </Link>
        </div>

        {/* Back link */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver atrás
        </button>

        <p className="text-white/20 text-xs mt-10">PAT-LI Textiles · Ica, Perú · {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
