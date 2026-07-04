
import { create } from 'zustand';

export type NotificationType = 'pedido' | 'stock' | 'encuesta';

export interface Coupon {
  id:        string;
  code:      string;
  discount:  number;
  type:      'porcentaje' | 'monto';
  minCompra: number;
  expiry:    string;
  usos:      number;
  maxUsos:   number;
  activo:    boolean;
}

export type CampaignStatus = 'borrador' | 'programada' | 'activa' | 'finalizada';

export interface Campaign {
  id:          string;
  nombre:      string;
  tipo:        string;          // BlackFriday, CyberWow, Día de la Madre, etc.
  descuento:   number;          // % de descuento
  fechaInicio: string;          // YYYY-MM-DD
  fechaFin:    string;
  estado:      CampaignStatus;
  canales:     string[];        // ['Web', 'Redes Sociales', 'Email']
  categorias:  string[];        // categorías objetivo
  metaVentas:  number;          // meta de ventas en S/
  ventasReales:number;          // ventas atribuidas (mock + reales)
  copy:        string;          // mensaje de marketing
  emoji:       string;
}

export type ChatIntention = 'consulta' | 'compra' | 'reclamo' | 'otro';

export interface ChatMsg {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  startedAt: string;
  endedAt: string;
  messages: ChatMsg[];
  mainIntention: ChatIntention;
  escalated: boolean;
  resolved: boolean;
  leadCaptured: boolean;
  leadName?: string;
  leadPhone?: string;
  messagesCount: number;
}

export type ActivityModule = 'ventas' | 'clientes' | 'inventario' | 'proveedores' | 'consultas' | 'chatbot' | 'ia' | 'sistema';

export interface ActivityEntry {
  id:        string;
  module:    ActivityModule;
  action:    string;
  detail:    string;
  timestamp: string;
  icon:      string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export type SaleItem = {
  id: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
};

export interface CompletedSale {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
  paymentMethod: string;
  itemsDescription: string;
}

export interface SurveyResponse {
  id: string;
  saleId: string;
  date: string;
  rating: number; // 1–5
  comment: string;
}

export interface Producto {
  id: string;      // same as catalog slug id
  name: string;
  category: string;
  price: number;
  stock: number;
}

const initialProducts: Producto[] = [
  // ── CABALLEROS ──
  { id: 'polo-pima-blanco',        name: 'Polo Algodón Pima Premium Blanco',   category: 'Caballeros', price: 45,  stock: 42 },
  { id: 'polo-pima-negro',         name: 'Polo Pima Cuello V Negro',            category: 'Caballeros', price: 48,  stock: 18 },
  { id: 'polo-pima-azul',          name: 'Polo Pima Classic Azul Marino',       category: 'Caballeros', price: 45,  stock: 22 },
  { id: 'polo-oversize-gris',      name: 'Polo Oversize Básico Gris',           category: 'Caballeros', price: 55,  stock: 14 },
  { id: 'polo-rayas-nautico',      name: 'Polo Rayas Náutico Azul/Blanco',      category: 'Caballeros', price: 52,  stock: 25 },
  { id: 'camisa-lino-caballero',   name: 'Camisa Lino Manga Larga Beige',       category: 'Caballeros', price: 85,  stock: 12 },
  { id: 'camisa-oxford-cuadros',   name: 'Camisa Oxford Cuadros Slim',          category: 'Caballeros', price: 78,  stock: 10 },
  { id: 'jean-skinny-azul',        name: 'Jean Skinny Azul Ica',                category: 'Caballeros', price: 95,  stock: 15 },
  { id: 'jean-slim-oscuro',        name: 'Jean Slim Fit Azul Oscuro',           category: 'Caballeros', price: 105, stock: 11 },
  { id: 'pantalon-drill-camel',    name: 'Pantalón Drill Camel Clásico',        category: 'Caballeros', price: 88,  stock: 16 },
  { id: 'short-cargo-beige',       name: 'Short Cargo Multi-bolsillos Beige',   category: 'Caballeros', price: 62,  stock: 20 },
  { id: 'casaca-bomber-negra',     name: 'Casaca Bomber Premium Negra',         category: 'Caballeros', price: 195, stock: 7  },
  { id: 'jogger-gris-caballero',   name: 'Jogger Cómodo Algodón Gris',          category: 'Caballeros', price: 72,  stock: 18 },
  // ── DAMAS ──
  { id: 'vestido-lino-floral',     name: 'Vestido Lino Floral Verano',          category: 'Damas',      price: 85,  stock: 8  },
  { id: 'vestido-midi-elegante',   name: 'Vestido Midi Elegante Crema',         category: 'Damas',      price: 120, stock: 9  },
  { id: 'vestido-mini-estampado',  name: 'Vestido Mini Estampado Verano',       category: 'Damas',      price: 75,  stock: 11 },
  { id: 'vestido-maxi-boho',       name: 'Vestido Maxi Boho Turquesa',          category: 'Damas',      price: 135, stock: 6  },
  { id: 'blusa-seda-elegante',     name: 'Blusa Seda Elegante Marfil',          category: 'Damas',      price: 65,  stock: 10 },
  { id: 'blusa-floral-manga-corta',name: 'Blusa Floral Manga Corta Rosa',       category: 'Damas',      price: 58,  stock: 14 },
  { id: 'blusa-sin-mangas-premium',name: 'Blusa Sin Mangas Premium Coral',      category: 'Damas',      price: 55,  stock: 16 },
  { id: 'falda-plisada-colores',   name: 'Falda Plisada Midi Colores',          category: 'Damas',      price: 68,  stock: 13 },
  { id: 'conjunto-top-pantalon',   name: 'Conjunto Top + Pantalón Lino',        category: 'Damas',      price: 155, stock: 5  },
  { id: 'jumpsuit-casual-verde',   name: 'Jumpsuit Casual Lino Verde',          category: 'Damas',      price: 145, stock: 6  },
  { id: 'blazer-entallado-negro',  name: 'Blazer Entallado Elegante Negro',     category: 'Damas',      price: 185, stock: 7  },
  { id: 'pantalon-palazzo-blanco', name: 'Pantalón Palazzo Fluido Blanco',      category: 'Damas',      price: 92,  stock: 10 },
  { id: 'casaca-cuero-dama',       name: 'Casaca Cuero Sintético Mujer',        category: 'Damas',      price: 180, stock: 4  },
  // ── NIÑOS ──
  { id: 'conjunto-algodon-kids',     name: 'Conjunto Algodón Kids Azul',        category: 'Niños',      price: 55,  stock: 20 },
  { id: 'polera-capucha-junior',     name: 'Polera con Capucha Junior',         category: 'Niños',      price: 49,  stock: 18 },
  { id: 'vestidito-floral-nina',     name: 'Vestidito Floral Niña Rosa',        category: 'Niños',      price: 52,  stock: 15 },
  { id: 'jean-jogger-nino',          name: 'Jean Jogger Niño Azul',             category: 'Niños',      price: 58,  stock: 12 },
  { id: 'set-verano-ninos',          name: 'Set Verano 2 Piezas Colores',       category: 'Niños',      price: 65,  stock: 10 },
  { id: 'polito-cuello-ninos',       name: 'Polito Cuello Redondo Pima Kids',   category: 'Niños',      price: 35,  stock: 30 },
  { id: 'vestidito-lunares-rosa',    name: 'Vestidito Lunares Rosa Niña',       category: 'Niños',      price: 48,  stock: 14 },
  { id: 'conjunto-deportivo-junior', name: 'Conjunto Deportivo Junior',         category: 'Niños',      price: 72,  stock: 11 },
  // ── BEBÉS ──
  { id: 'mameluco-algodon-bebe',  name: 'Mameluco Algodón Suave Bebé',          category: 'Bebés',      price: 38,  stock: 25 },
  { id: 'set-bodies-bebe',        name: 'Set Bodies x3 Unisex Bebé',            category: 'Bebés',      price: 55,  stock: 20 },
  { id: 'pijama-bebe-estampada',  name: 'Pijama Bebé Estampado Ositos',         category: 'Bebés',      price: 42,  stock: 18 },
  { id: 'set-patitos-bebe',       name: 'Set Completo Patitos Amarillo',         category: 'Bebés',      price: 68,  stock: 15 },
  { id: 'gorrito-punto-bebe',     name: 'Gorrito de Punto Recién Nacido',        category: 'Bebés',      price: 22,  stock: 30 },
  { id: 'ajuar-bebe-completo',    name: 'Ajuar Bebé Completo 5 Piezas',          category: 'Bebés',      price: 95,  stock: 8  },
  // ── DEPORTIVO ──
  { id: 'polo-running-hombre',        name: 'Polo Running Dri-Fit Hombre',      category: 'Deportivo',  price: 58,  stock: 30 },
  { id: 'leggings-deportivos-mujer',  name: 'Leggings Deportivos Mujer Negro',  category: 'Deportivo',  price: 65,  stock: 22 },
  { id: 'short-deportivo-hombre',     name: 'Short Deportivo Secado Rápido',    category: 'Deportivo',  price: 48,  stock: 25 },
  { id: 'chaqueta-cortaviento',       name: 'Chaqueta Cortaviento Unisex',      category: 'Deportivo',  price: 115, stock: 10 },
  { id: 'sudadera-hoodie-gris',       name: 'Sudadera Hoodie Cómoda Gris',      category: 'Deportivo',  price: 88,  stock: 15 },
  { id: 'camiseta-gym-mujer',         name: 'Camiseta Gym Tank Top Mujer',      category: 'Deportivo',  price: 42,  stock: 28 },
  { id: 'conjunto-yoga-mujer',        name: 'Conjunto Yoga 2 Piezas Mujer',     category: 'Deportivo',  price: 115, stock: 12 },
  { id: 'polo-deportivo-ninos',       name: 'Polo Deportivo Niños Colores',     category: 'Deportivo',  price: 38,  stock: 20 },
  // ── ACCESORIOS ──
  { id: 'correa-cuero-marron',    name: 'Correa Cuero Legítimo Marrón',         category: 'Accesorios', price: 35,  stock: 20 },
  { id: 'bufanda-lana-premium',   name: 'Bufanda Lana Premium Multicolor',      category: 'Accesorios', price: 28,  stock: 18 },
  { id: 'gorro-tejido-invierno',  name: 'Gorro Tejido Lana Invierno',           category: 'Accesorios', price: 22,  stock: 25 },
  { id: 'bolso-tote-canvas',      name: 'Bolso Tote Canvas Mujer',              category: 'Accesorios', price: 55,  stock: 15 },
  { id: 'medias-pack-x3',         name: 'Medias Pack x3 Algodón Pima',          category: 'Accesorios', price: 25,  stock: 120 },
  { id: 'billetera-cuero-hombre', name: 'Billetera Cuero Slim Hombre',          category: 'Accesorios', price: 45,  stock: 22 },
  { id: 'gafas-sol-uv400',        name: 'Gafas de Sol UV400 Unisex',            category: 'Accesorios', price: 38,  stock: 14 },
  { id: 'panuelo-seda-mujer',     name: 'Pañuelo Seda Estampado Mujer',         category: 'Accesorios', price: 32,  stock: 16 },
  { id: 'mochila-casual-unisex',  name: 'Mochila Casual Lona Unisex',           category: 'Accesorios', price: 72,  stock: 10 },
  { id: 'gorra-visera-patli',     name: 'Gorra Visera PAT-LI Colección',        category: 'Accesorios', price: 28,  stock: 30 },
];

interface AppStore {
  completedSales: CompletedSale[];
  surveyResponses: SurveyResponse[];
  products: Producto[];
  notifications: AppNotification[];
  activityLog: ActivityEntry[];
  monthlyGoal: number;
  coupons: Coupon[];
  chatConversations: ChatConversation[];
  addChatConversation: (conv: ChatConversation) => void;
  addSale: (sale: CompletedSale) => void;
  addSurveyResponse: (response: SurveyResponse) => void;
  updateStock: (items: SaleItem[]) => void;
  updateProduct: (product: Producto) => void;
  addProduct: (product: Producto) => void;
  deleteProduct: (id: string) => void;
  markAllRead: () => void;
  clearNotification: (id: string) => void;
  setMonthlyGoal: (goal: number) => void;
  addActivity: (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usos'>) => void;
  toggleCoupon: (id: string) => void;
  deleteCoupon: (id: string) => void;
  useCoupon: (code: string) => Coupon | null;
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id' | 'ventasReales'>) => void;
  updateCampaignStatus: (id: string, estado: CampaignStatus) => void;
  deleteCampaign: (id: string) => void;
  attributeSaleToCampaigns: (saleTotal: number, categories: string[]) => void;
}

const makeId = () => Math.random().toString(36).slice(2, 9);
const now = () => new Date().toISOString();

const SEED_ACTIVITY: ActivityEntry[] = [
  { id: 'a1', module: 'sistema',     action: 'Sistema iniciado',              detail: 'Panel PAT-LI cargado correctamente',        timestamp: new Date(Date.now() - 25*60000).toISOString(), icon: '🚀' },
  { id: 'a2', module: 'inventario',  action: 'Stock actualizado',             detail: 'Sincronización con almacén principal',       timestamp: new Date(Date.now() - 20*60000).toISOString(), icon: '📦' },
  { id: 'a3', module: 'clientes',    action: 'Segmentación IA ejecutada',     detail: '5 clientes analizados por Gemini',           timestamp: new Date(Date.now() - 15*60000).toISOString(), icon: '🤖' },
  { id: 'a4', module: 'consultas',   action: 'Respuesta IA generada',         detail: 'Consulta de María García respondida',        timestamp: new Date(Date.now() - 10*60000).toISOString(), icon: '💬' },
  { id: 'a5', module: 'proveedores', action: 'Orden generada con IA',         detail: 'Orden enviada a Textiles Gamarra S.A.',      timestamp: new Date(Date.now() -  5*60000).toISOString(), icon: '🚚' },
];

const INITIAL_COUPONS: Coupon[] = [
  { id: 'cup1', code: 'PATLI10',    discount: 10, type: 'porcentaje', minCompra: 50,  expiry: '2026-12-31', usos: 3,  maxUsos: 50, activo: true  },
  { id: 'cup2', code: 'VERANO20',   discount: 20, type: 'porcentaje', minCompra: 100, expiry: '2026-06-30', usos: 1,  maxUsos: 30, activo: true  },
  { id: 'cup3', code: 'DESC15SOL',  discount: 15, type: 'monto',      minCompra: 80,  expiry: '2026-07-31', usos: 0,  maxUsos: 20, activo: true  },
  { id: 'cup4', code: 'BIENVENIDA', discount: 5,  type: 'porcentaje', minCompra: 0,   expiry: '2026-09-30', usos: 12, maxUsos: 100, activo: true },
  { id: 'cup5', code: 'EXPIRADO',   discount: 30, type: 'porcentaje', minCompra: 200, expiry: '2025-01-01', usos: 5,  maxUsos: 10, activo: false },
];

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp1', nombre: 'Black Friday 2026', tipo: 'Black Friday', descuento: 40,
    fechaInicio: '2026-11-27', fechaFin: '2026-11-30', estado: 'programada',
    canales: ['Web', 'Redes Sociales', 'Email'], categorias: ['Caballeros', 'Damas', 'Deportivo'],
    metaVentas: 25000, ventasReales: 0,
    copy: '¡El Black Friday llegó a PAT-LI! 40% OFF en toda la colección. Algodón pima premium a precios irrepetibles. Solo por 3 días. 🔥',
    emoji: '🛍️',
  },
  {
    id: 'camp2', nombre: 'CyberWow Verano', tipo: 'CyberWow', descuento: 30,
    fechaInicio: '2026-07-15', fechaFin: '2026-07-18', estado: 'finalizada',
    canales: ['Web', 'Email'], categorias: ['Damas', 'Accesorios'],
    metaVentas: 15000, ventasReales: 18420,
    copy: 'CyberWow PAT-LI: 30% de descuento en moda femenina y accesorios. Renueva tu guardarropa con la mejor calidad iqueña. 💜',
    emoji: '💻',
  },
  {
    id: 'camp3', nombre: 'Día de la Madre', tipo: 'Día de la Madre', descuento: 25,
    fechaInicio: '2026-05-01', fechaFin: '2026-05-11', estado: 'activa',
    canales: ['Web', 'Redes Sociales'], categorias: ['Damas', 'Accesorios'],
    metaVentas: 12000, ventasReales: 8750,
    copy: 'Regala elegancia esta fecha especial. 25% OFF en prendas y accesorios para mamá. Porque ella merece lo mejor. 💐',
    emoji: '🌷',
  },
];

export const useAppStore = create<AppStore>((set, get) => ({
  completedSales: [],
  surveyResponses: [],
  products: initialProducts,
  notifications: [],
  activityLog: SEED_ACTIVITY,
  monthlyGoal: 30000,
  coupons: INITIAL_COUPONS,
  chatConversations: [],
  campaigns: INITIAL_CAMPAIGNS,

  addChatConversation: (conv) =>
    set((state) => ({
      chatConversations: [conv, ...state.chatConversations].slice(0, 200),
      activityLog: [
        {
          id: makeId(),
          module: 'chatbot' as ActivityModule,
          action: conv.escalated ? 'Conversación escalada a humano' : conv.leadCaptured ? 'Lead capturado por chatbot' : 'Conversación resuelta',
          detail: `${conv.id} · ${conv.messagesCount} mensajes · Intención: ${conv.mainIntention}${conv.leadPhone ? ` · Tel: ${conv.leadPhone}` : ''}`,
          timestamp: now(),
          icon: conv.escalated ? '📞' : conv.leadCaptured ? '🎯' : '💬',
        },
        ...state.activityLog,
      ].slice(0, 100),
    })),

  addSale: (sale) =>
    set((state) => ({
      completedSales: [sale, ...state.completedSales],
      notifications: [
        {
          id: makeId(),
          type: 'pedido',
          title: `Nuevo pedido web · ${sale.id}`,
          message: `S/ ${sale.total.toFixed(2)} — ${sale.itemsDescription.slice(0, 60)}`,
          timestamp: now(),
          read: false,
        },
        ...state.notifications,
      ],
      activityLog: [
        {
          id: makeId(),
          module: 'ventas' as ActivityModule,
          action: 'Venta completada vía catálogo',
          detail: `${sale.id} · S/ ${sale.total.toFixed(2)} · ${sale.paymentMethod}`,
          timestamp: now(),
          icon: '🛍️',
        },
        ...state.activityLog,
      ].slice(0, 100),
    })),

  addSurveyResponse: (response) =>
    set((state) => {
      const newNotifs: AppNotification[] = response.rating <= 2
        ? [{
            id: makeId(),
            type: 'encuesta',
            title: `Reseña negativa · ${response.rating}★`,
            message: response.comment.slice(0, 80) || 'Sin comentario',
            timestamp: now(),
            read: false,
          }]
        : [];
      return {
        surveyResponses: [response, ...state.surveyResponses],
        notifications: [...newNotifs, ...state.notifications],
      };
    }),

  updateStock: (items) =>
    set((state) => {
      const updatedProducts = state.products.map((p) => {
        const sold = items.find((i) => i.id === p.id);
        if (!sold) return p;
        return { ...p, stock: Math.max(0, p.stock - sold.quantity) };
      });

      const stockAlerts: AppNotification[] = updatedProducts
        .filter((p) => {
          const prev = state.products.find((x) => x.id === p.id);
          return prev && prev.stock >= 5 && p.stock < 5 && p.stock > 0;
        })
        .map((p) => ({
          id: makeId(),
          type: 'stock' as NotificationType,
          title: `Stock crítico · ${p.name}`,
          message: `Solo quedan ${p.stock} unidades. Considera reabastecer pronto.`,
          timestamp: now(),
          read: false,
        }));

      return {
        products: updatedProducts,
        notifications: [...stockAlerts, ...state.notifications],
      };
    }),

  updateProduct: (product) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === product.id ? product : p)),
    })),

  addProduct: (product) =>
    set((state) => ({ products: [...state.products, product] })),

  deleteProduct: (id) =>
    set((state) => ({ products: state.products.filter((p) => p.id !== id) })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  clearNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  setMonthlyGoal: (goal) => set({ monthlyGoal: goal }),

  addActivity: (entry) =>
    set((state) => ({
      activityLog: [
        { ...entry, id: makeId(), timestamp: now() },
        ...state.activityLog,
      ].slice(0, 100),
    })),

  addCoupon: (coupon) =>
    set((state) => ({
      coupons: [...state.coupons, { ...coupon, id: makeId(), usos: 0 }],
    })),

  toggleCoupon: (id) =>
    set((state) => ({
      coupons: state.coupons.map((c) => c.id === id ? { ...c, activo: !c.activo } : c),
    })),

  deleteCoupon: (id) =>
    set((state) => ({
      coupons: state.coupons.filter((c) => c.id !== id),
    })),

  useCoupon: (code: string): Coupon | null => {
    const today = new Date().toISOString().split('T')[0];
    const coupon = get().coupons.find(
      (c) => c.code.toUpperCase() === code.toUpperCase() && c.activo && c.expiry >= today && c.usos < c.maxUsos
    ) ?? null;
    if (coupon) {
      set((s) => ({
        coupons: s.coupons.map((c) => c.id === coupon.id ? { ...c, usos: c.usos + 1 } : c),
      }));
    }
    return coupon;
  },

  addCampaign: (campaign) =>
    set((state) => ({
      campaigns: [{ ...campaign, id: makeId(), ventasReales: 0 }, ...state.campaigns],
      activityLog: [
        {
          id: makeId(),
          module: 'ventas' as ActivityModule,
          action: 'Campaña creada',
          detail: `${campaign.nombre} · ${campaign.descuento}% OFF · ${campaign.tipo}`,
          timestamp: now(),
          icon: '📣',
        },
        ...state.activityLog,
      ].slice(0, 100),
    })),

  updateCampaignStatus: (id, estado) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) => c.id === id ? { ...c, estado } : c),
    })),

  deleteCampaign: (id) =>
    set((state) => ({
      campaigns: state.campaigns.filter((c) => c.id !== id),
    })),

  // Atribuye una venta a la mejor campaña activa cuyas categorías coincidan
  attributeSaleToCampaigns: (saleTotal, categories) =>
    set((state) => {
      const activas = state.campaigns.filter(
        (c) => c.estado === 'activa' && c.categorias.some((cat) => categories.includes(cat))
      );
      if (activas.length === 0) return {};
      // Atribuir a la campaña activa de mayor descuento (evita doble conteo)
      const best = activas.reduce((b, c) => (c.descuento > b.descuento ? c : b));
      return {
        campaigns: state.campaigns.map((c) =>
          c.id === best.id ? { ...c, ventasReales: c.ventasReales + saleTotal } : c
        ),
        activityLog: [
          {
            id: makeId(),
            module: 'ventas' as ActivityModule,
            action: 'Venta atribuida a campaña',
            detail: `${best.nombre} · +S/ ${saleTotal.toFixed(2)} (${best.descuento}% OFF aplicado)`,
            timestamp: now(),
            icon: '📣',
          },
          ...state.activityLog,
        ].slice(0, 100),
      };
    }),
}));
