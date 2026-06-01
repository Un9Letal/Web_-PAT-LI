
"use client";

import { useState, useEffect } from 'react';
import {
  Settings, Bell, Lock, User, Bot,
  ShieldCheck, Download, Camera, Save, Key,
  Wifi, Database, Cpu, CheckCircle2, AlertCircle,
  Package, ShoppingCart, Users, ClipboardList
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/appStore';
import { jsPDF } from 'jspdf';

// ─── Datos del sistema ──────────────────────────────────────────────
const SYSTEM_VERSION = '2.1.4';
const BUILD_DATE = '2025-05-21';
const GEMINI_MODEL = 'gemini-2.0-flash';
const TOTAL_TOKEN_LIMIT = 1_000_000;

export default function AjustesPage() {
  const completedSales  = useAppStore((s) => s.completedSales);
  const surveyResponses = useAppStore((s) => s.surveyResponses);

  // ── Perfil ──
  const [nombre, setNombre]   = useState('Admin PAT-LI');
  const [correo, setCorreo]   = useState('admin@patli.pe');
  const [telefono, setTelefono] = useState('+51 987 654 321');

  // ── Tienda ──
  const [sede, setSede]       = useState('PAT-LI Textiles - Ica Principal');
  const [ruc, setRuc]         = useState('20123456789');
  const [direccion, setDireccion] = useState('Calle Lima 123, Ica, Perú');
  const [correoTienda, setCorreoTienda] = useState('ventas.ica@patli.pe');
  const [telefonoTienda, setTelefonoTienda] = useState('+51 056 212121');

  // ── Chatbot ──
  const [tono, setTono]             = useState<'Profesional' | 'Amigable' | 'Conciso'>('Profesional');
  const [autoaprendizaje, setAutoaprendizaje] = useState(true);
  const [umbral, setUmbral]         = useState(85);

  // ── Notificaciones ──
  const [notifPedidos,   setNotifPedidos]   = useState(true);
  const [notifStock,     setNotifStock]     = useState(true);
  const [notifLeads,     setNotifLeads]     = useState(false);
  const [notifEncuestas, setNotifEncuestas] = useState(true);
  const [notifEmail,     setNotifEmail]     = useState(false);
  const [notifSonido,    setNotifSonido]    = useState(true);

  // ── Seguridad ──
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd]         = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [twoFa, setTwoFa]           = useState(false);

  // ── Tokens simulados ──
  const [tokensUsed, setTokensUsed] = useState(0);
  useEffect(() => {
    const base = 38_400 + completedSales.length * 220 + surveyResponses.length * 80;
    setTokensUsed(base);
  }, [completedSales.length, surveyResponses.length]);

  const tokenPct = Math.min(Math.round((tokensUsed / TOTAL_TOKEN_LIMIT) * 100), 100);

  // ── Handlers ──
  const handleSavePerfil = () => {
    toast({ title: '✅ Perfil actualizado', description: `Bienvenido, ${nombre}.` });
  };

  const handleSaveTienda = () => {
    toast({ title: '✅ Tienda actualizada', description: `Sede: ${sede}` });
  };

  const handleSaveChatbot = () => {
    toast({ title: '🤖 Chatbot actualizado', description: `Tono: ${tono} · Umbral: ${umbral}%` });
  };

  const handleSaveNotif = () => {
    toast({ title: '🔔 Notificaciones guardadas', description: 'Preferencias de alertas actualizadas.' });
  };

  const handleCambioPwd = () => {
    if (!currentPwd) {
      toast({ title: 'Error', description: 'Ingresa tu contraseña actual.', variant: 'destructive' });
      return;
    }
    if (newPwd.length < 8) {
      toast({ title: 'Error', description: 'La nueva contraseña debe tener al menos 8 caracteres.', variant: 'destructive' });
      return;
    }
    if (newPwd !== confirmPwd) {
      toast({ title: 'Error', description: 'Las contraseñas no coinciden.', variant: 'destructive' });
      return;
    }
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    toast({ title: '🔒 Contraseña actualizada', description: 'Tu contraseña ha sido cambiada exitosamente.' });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 95);
    doc.text('PAT-LI TEXTILES - CONFIGURACION', 20, 20);
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Exportado: ${new Date().toLocaleDateString('es-PE')}`, 20, 30);
    doc.setDrawColor(245, 158, 11);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(15); doc.setTextColor(0, 0, 0);
    doc.text('Perfil', 20, 45);
    doc.setFontSize(10);
    doc.text(`Nombre: ${nombre}`, 20, 53);
    doc.text(`Correo: ${correo}`, 20, 59);
    doc.text(`Teléfono: ${telefono}`, 20, 65);

    doc.setFontSize(15);
    doc.text('Tienda', 20, 78);
    doc.setFontSize(10);
    doc.text(`Sede: ${sede}`, 20, 86);
    doc.text(`RUC: ${ruc}`, 20, 92);
    doc.text(`Dirección: ${direccion}`, 20, 98);

    doc.setFontSize(15);
    doc.text('Chatbot IA', 20, 112);
    doc.setFontSize(10);
    doc.text(`Tono: ${tono}`, 20, 120);
    doc.text(`Autoaprendizaje: ${autoaprendizaje ? 'Activo' : 'Inactivo'}`, 20, 126);
    doc.text(`Umbral: ${umbral}%`, 20, 132);

    doc.setFontSize(15);
    doc.text('Sistema', 20, 146);
    doc.setFontSize(10);
    doc.text(`Versión: ${SYSTEM_VERSION} (build ${BUILD_DATE})`, 20, 154);
    doc.text(`Modelo IA: ${GEMINI_MODEL}`, 20, 160);
    doc.text(`Tokens usados: ${tokensUsed.toLocaleString()} / ${TOTAL_TOKEN_LIMIT.toLocaleString()}`, 20, 166);

    doc.setFontSize(9); doc.setTextColor(150, 150, 150);
    doc.text('Documento generado por PAT-LI Flow — uso interno.', 20, 280);
    doc.save('configuracion_patli.pdf');
    toast({ title: 'PDF descargado', description: 'Archivo guardado en tu dispositivo.' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Configuración del Sistema</h1>
          <p className="page-subtitle">Gestiona preferencias de la plataforma y del asistente IA</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleDownloadPDF}>
          <Download className="h-4 w-4" /> Exportar Resumen PDF
        </Button>
      </div>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="bg-white border mb-8 p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="perfil"        className="gap-2"><User size={14} />    Mi Perfil</TabsTrigger>
          <TabsTrigger value="general"       className="gap-2"><Settings size={14} /> Tienda</TabsTrigger>
          <TabsTrigger value="chatbot"       className="gap-2"><Bot size={14} />     IA Chatbot</TabsTrigger>
          <TabsTrigger value="notificaciones" className="gap-2"><Bell size={14} />   Notificaciones</TabsTrigger>
          <TabsTrigger value="seguridad"     className="gap-2"><Lock size={14} />    Seguridad</TabsTrigger>
          <TabsTrigger value="sistema"       className="gap-2"><Database size={14} /> Sistema</TabsTrigger>
        </TabsList>

        {/* ── PERFIL ── */}
        <TabsContent value="perfil" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold mb-1">Información Personal</h3>
              <p className="text-sm text-slate-500">Actualiza tu foto y datos de contacto.</p>
            </div>
            <Card className="md:col-span-2 border-none shadow-sm">
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-slate-50">
                      <AvatarImage src="https://picsum.photos/seed/admin/100/100" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <Button size="icon" variant="secondary" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-lg">
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold">{nombre}</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Rol: Super Admin</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline">Cambiar Foto</Button>
                      <Button size="sm" variant="ghost" className="text-destructive">Eliminar</Button>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre Completo</Label>
                    <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Correo Electrónico</Label>
                    <Input value={correo} onChange={(e) => setCorreo(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Idioma</Label>
                    <Input value="Español (Perú)" readOnly className="bg-slate-50 text-slate-400" />
                  </div>
                </div>
                <div className="pt-2">
                  <Button className="bg-primary gap-2" onClick={handleSavePerfil}>
                    <Save className="h-4 w-4" /> Guardar Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TIENDA ── */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold mb-1">Información de la Tienda</h3>
              <p className="text-sm text-slate-500">Configuración básica de la sede principal.</p>
            </div>
            <Card className="md:col-span-2 border-none shadow-sm">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre de la Sede</Label>
                    <Input value={sede} onChange={(e) => setSede(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>RUC</Label>
                    <Input value={ruc} onChange={(e) => setRuc(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Dirección Física</Label>
                  <Input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Correo de Contacto</Label>
                    <Input value={correoTienda} onChange={(e) => setCorreoTienda(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono Central</Label>
                    <Input value={telefonoTienda} onChange={(e) => setTelefonoTienda(e.target.value)} />
                  </div>
                </div>
                <Button className="bg-primary gap-2" onClick={handleSaveTienda}>
                  <Save className="h-4 w-4" /> Guardar Cambios
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── CHATBOT ── */}
        <TabsContent value="chatbot" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold mb-1">Modelo Genkit IA</h3>
              <p className="text-sm text-slate-500">Parámetros de respuesta y comportamiento del bot.</p>
            </div>
            <Card className="md:col-span-2 border-none shadow-sm">
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label>Tono de Respuesta</Label>
                  <div className="flex gap-2">
                    {(['Profesional', 'Amigable', 'Conciso'] as const).map((t) => (
                      <Button
                        key={t}
                        variant="outline"
                        size="sm"
                        className={tono === t ? 'bg-primary/10 text-primary border-primary font-bold' : ''}
                        onClick={() => setTono(t)}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo de Autoaprendizaje</Label>
                    <p className="text-xs text-slate-500">Permite que el bot aprenda de interacciones pasadas.</p>
                  </div>
                  <Switch checked={autoaprendizaje} onCheckedChange={setAutoaprendizaje} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Umbral de Confianza para Derivación</Label>
                    <span className="text-sm font-bold text-primary">{umbral}%</span>
                  </div>
                  <p className="text-xs text-slate-500">Porcentaje mínimo antes de derivar a un humano.</p>
                  <input
                    type="range" min={50} max={99} value={umbral}
                    onChange={(e) => setUmbral(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>50% (permisivo)</span><span>99% (estricto)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modelo activo</Label>
                    <p className="text-xs text-slate-500">{GEMINI_MODEL} · Google AI</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">Conectado</Badge>
                </div>

                <Button className="w-full bg-secondary gap-2" onClick={handleSaveChatbot}>
                  <Save className="h-4 w-4" /> Actualizar Configuración
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── NOTIFICACIONES ── */}
        <TabsContent value="notificaciones" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold mb-1">Alertas y Avisos</h3>
              <p className="text-sm text-slate-500">Elige qué eventos generan notificaciones en el panel.</p>
            </div>
            <div className="md:col-span-2 space-y-4">
              {/* Alertas de eventos */}
              <Card className="border-none shadow-sm">
                <CardContent className="pt-6 space-y-5">
                  <h4 className="font-bold text-sm text-slate-700 uppercase tracking-widest">Eventos del Sistema</h4>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-50 rounded-lg"><ShoppingCart className="h-4 w-4 text-teal-600" /></div>
                      <div>
                        <Label className="font-semibold">Nuevos pedidos web</Label>
                        <p className="text-xs text-slate-500">Toast cuando un cliente compra en el catálogo digital.</p>
                      </div>
                    </div>
                    <Switch checked={notifPedidos} onCheckedChange={setNotifPedidos} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 rounded-lg"><Package className="h-4 w-4 text-red-500" /></div>
                      <div>
                        <Label className="font-semibold">Alertas de stock crítico</Label>
                        <p className="text-xs text-slate-500">Avisa cuando un producto tiene cantidad ≥ 3 en un pedido.</p>
                      </div>
                    </div>
                    <Switch checked={notifStock} onCheckedChange={setNotifStock} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg"><Users className="h-4 w-4 text-blue-500" /></div>
                      <div>
                        <Label className="font-semibold">Nuevos leads registrados</Label>
                        <p className="text-xs text-slate-500">Notifica cuando un cliente potencial deja sus datos.</p>
                      </div>
                    </div>
                    <Switch checked={notifLeads} onCheckedChange={setNotifLeads} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 rounded-lg"><ClipboardList className="h-4 w-4 text-amber-500" /></div>
                      <div>
                        <Label className="font-semibold">Encuestas completadas</Label>
                        <p className="text-xs text-slate-500">Toast cuando un cliente envía una valoración de satisfacción.</p>
                      </div>
                    </div>
                    <Switch checked={notifEncuestas} onCheckedChange={setNotifEncuestas} />
                  </div>
                </CardContent>
              </Card>

              {/* Canales de entrega */}
              <Card className="border-none shadow-sm">
                <CardContent className="pt-6 space-y-5">
                  <h4 className="font-bold text-sm text-slate-700 uppercase tracking-widest">Canal de Entrega</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-semibold">Notificaciones por correo</Label>
                      <p className="text-xs text-slate-500">Envía un resumen diario a {correo}</p>
                    </div>
                    <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-semibold">Sonido de alerta</Label>
                      <p className="text-xs text-slate-500">Reproduce un tono al recibir nuevos pedidos.</p>
                    </div>
                    <Switch checked={notifSonido} onCheckedChange={setNotifSonido} />
                  </div>
                </CardContent>
              </Card>

              <Button className="bg-primary gap-2 w-full md:w-auto" onClick={handleSaveNotif}>
                <Save className="h-4 w-4" /> Guardar Preferencias
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── SEGURIDAD ── */}
        <TabsContent value="seguridad" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold mb-1">Acceso y Privacidad</h3>
              <p className="text-sm text-slate-500">Protege tu cuenta y gestiona los permisos.</p>
            </div>
            <Card className="md:col-span-2 border-none shadow-sm">
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-sm flex items-center gap-2"><Key size={16} /> Cambiar Contraseña</h4>
                  <div className="space-y-2">
                    <Label>Contraseña Actual</Label>
                    <Input type="password" placeholder="••••••••" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nueva Contraseña</Label>
                      <Input type="password" placeholder="••••••••" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmar Contraseña</Label>
                      <Input type="password" placeholder="••••••••" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
                    </div>
                  </div>
                  {newPwd.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="page-subtitle">Seguridad</span>
                        <span className={newPwd.length >= 12 ? 'text-green-600' : newPwd.length >= 8 ? 'text-amber-600' : 'text-red-500'}>
                          {newPwd.length >= 12 ? 'Fuerte' : newPwd.length >= 8 ? 'Media' : 'Débil'}
                        </span>
                      </div>
                      <Progress
                        value={newPwd.length >= 12 ? 100 : newPwd.length >= 8 ? 60 : 25}
                        className="h-1.5"
                      />
                    </div>
                  )}
                  <Button variant="outline" onClick={handleCambioPwd}>Actualizar Contraseña</Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticación de Dos Factores (2FA)</Label>
                    <p className="text-xs text-slate-500">Añade una capa extra de seguridad al iniciar sesión.</p>
                  </div>
                  <Switch checked={twoFa} onCheckedChange={(v) => {
                    setTwoFa(v);
                    toast({ title: v ? '🔐 2FA activado' : '2FA desactivado', description: v ? 'Tu cuenta ahora requiere verificación adicional.' : 'Verificación en dos pasos deshabilitada.' });
                  }} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sesiones Activas</Label>
                    <p className="text-xs text-slate-500">Cerrar sesión en todos los dispositivos conectados.</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive font-bold" onClick={() => toast({ title: 'Sesiones cerradas', description: 'Todos los dispositivos han sido desconectados.', variant: 'destructive' })}>
                    Cerrar Todo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── SISTEMA ── */}
        <TabsContent value="sistema" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold mb-1">Datos del Sistema</h3>
              <p className="text-sm text-slate-500">Información técnica de la plataforma PAT-LI Flow.</p>
            </div>
            <div className="md:col-span-2 space-y-4">

              {/* Versión */}
              <Card className="border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Cpu className="h-5 w-5 text-primary" />
                    <h4 className="font-bold">Versión de la Plataforma</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <span className="page-subtitle">Versión actual</span>
                    <span className="font-mono font-bold">v{SYSTEM_VERSION}</span>
                    <span className="page-subtitle">Fecha de build</span>
                    <span className="font-mono">{BUILD_DATE}</span>
                    <span className="page-subtitle">Framework</span>
                    <span className="font-mono">Next.js 15 · React 19</span>
                    <span className="page-subtitle">Base de datos</span>
                    <span className="font-mono">MySQL 8 · Express</span>
                    <span className="page-subtitle">Estado general</span>
                    <span className="flex items-center gap-1 text-green-600 font-semibold">
                      <CheckCircle2 className="h-4 w-4" /> Operativo
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Estado API Gemini */}
              <Card className="border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Wifi className="h-5 w-5 text-secondary" />
                    <h4 className="font-bold">Estado API — Google Gemini</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <span className="page-subtitle">Modelo</span>
                    <span className="font-mono font-bold">{GEMINI_MODEL}</span>
                    <span className="page-subtitle">Proveedor</span>
                    <span className="font-mono">Google AI (Genkit)</span>
                    <span className="page-subtitle">Plan</span>
                    <span className="font-mono">Free Tier</span>
                    <span className="page-subtitle">Conexión</span>
                    <span className="flex items-center gap-1 text-green-600 font-semibold">
                      <CheckCircle2 className="h-4 w-4" /> Activa
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Tokens simulados */}
              <Card className="border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Database className="h-5 w-5 text-amber-500" />
                    <h4 className="font-bold">Uso de Tokens (estimado)</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="page-subtitle">Tokens utilizados</span>
                      <span className="font-mono font-bold">{tokensUsed.toLocaleString()}</span>
                    </div>
                    <Progress value={tokenPct} className="h-3" />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{tokenPct}% del límite mensual</span>
                      <span>{TOTAL_TOKEN_LIMIT.toLocaleString()} tokens / mes</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-lg font-bold text-primary">{completedSales.length}</p>
                        <p className="text-xs text-slate-500">Pedidos procesados</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-lg font-bold text-secondary">{surveyResponses.length}</p>
                        <p className="text-xs text-slate-500">Encuestas analizadas</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className={`text-lg font-bold ${tokenPct < 70 ? 'text-green-600' : tokenPct < 90 ? 'text-amber-500' : 'text-red-500'}`}>
                          {tokenPct < 70 ? 'OK' : tokenPct < 90 ? 'Moderado' : 'Alto'}
                        </p>
                        <p className="text-xs text-slate-500">Nivel de uso</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}

