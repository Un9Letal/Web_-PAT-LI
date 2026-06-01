
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shirt, Lock, Mail, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulación de autenticación
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 transform translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-accent/5 skew-x-12 transform -translate-x-1/4" />

      <div className="w-full max-w-md z-10">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex flex-col items-center gap-2 group">
            <div className="bg-primary p-4 rounded-2xl shadow-xl group-hover:scale-110 transition-transform duration-300">
              <Shirt className="h-10 w-10 text-accent" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-primary">PAT-LI TEXTILES</span>
          </Link>
        </div>

        <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-primary text-primary-foreground p-8 text-center">
            <CardTitle className="text-2xl font-bold">Panel Administrativo</CardTitle>
            <CardDescription className="text-primary-foreground/70">
              Ingresa tus credenciales para gestionar la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-300" />
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="admin@patli.pe" 
                    required 
                    className="pl-10 h-12 rounded-xl border-slate-100 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pass" className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Contraseña
                  </Label>
                  <Link href="#" className="text-[10px] font-bold text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-300" />
                  <Input 
                    id="pass"
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    className="pl-10 h-12 rounded-xl border-slate-100 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-primary text-white font-bold text-lg rounded-xl hover:bg-primary/90 shadow-lg gap-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>Iniciando Sesión <Loader2 className="h-5 w-5 animate-spin" /></>
                ) : (
                  <>Acceder al Sistema <ArrowRight className="h-5 w-5" /></>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center gap-2 text-slate-400">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Conexión Encriptada SSL</span>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center mt-8 text-sm text-slate-500">
          ¿No tienes acceso? <Link href="/contacto" className="text-primary font-bold hover:underline">Contacta a soporte</Link>
        </p>
      </div>
    </div>
  );
}
