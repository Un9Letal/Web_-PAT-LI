# PAT-LI Textiles — Sistema Web con Chatbot Generativo

Sistema web integral con chatbot generativo (Google Gemini) para optimizar la gestión
de ventas de la empresa comercial **PAT-LI Textiles**, Ica – Perú.

> **Tesis 2026** — *Implementación de un sistema web con chatbot generativo para
> optimizar la gestión de ventas en la empresa comercial PAT-LI, Ica – 2026.*

---

## Tabla de contenidos

- [Descripción](#descripción)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Tecnologías](#tecnologías)
- [Requisitos previos](#requisitos-previos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Módulos del sistema](#módulos-del-sistema)
- [Funcionalidades con IA](#funcionalidades-con-ia)
- [Resultados de optimización](#resultados-de-optimización)

---

## Descripción

El sistema resuelve la atención manual y limitada de consultas en PAT-LI Textiles
mediante un **chatbot generativo** integrado a un catálogo digital y un panel
administrativo completo. Combina:

- **Tienda pública**: catálogo digital, carrito, pasarela de pago simulada,
  comprobante electrónico y asistente virtual 24/7.
- **Panel administrativo**: 16 módulos de gestión con inteligencia artificial
  aplicada a ventas, inventario, clientes, campañas y reportes.

---

## Estructura del proyecto

```
Tesis/
├── README.md                    ← este archivo
├── .gitignore                   ← reglas globales de exclusión
├── .env.example                 ← plantilla de variables de entorno
│
├── FrontendNext/my-app/         ← Aplicación Next.js 15 (App Router)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/        ← tienda: inicio, catálogo, nosotros, contacto
│   │   │   ├── (dashboard)/     ← panel admin: 16 módulos
│   │   │   └── api/             ← rutas API (chatbot, flujos de IA)
│   │   ├── ai/flows/            ← flujos Genkit + Gemini
│   │   ├── components/          ← UI reutilizable (shadcn/ui)
│   │   ├── store/               ← estado global (Zustand)
│   │   └── lib/                 ← utilidades (boleta, campañas, PDF)
│   └── package.json
│
├── backend/                     ← API Node.js + Express
│   ├── controllers/
│   ├── routes/
│   ├── config/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
│
└── database/
    └── sistema.sql              ← esquema de la base de datos MySQL
```

---

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 15 · React · TypeScript · Tailwind CSS · shadcn/ui |
| Estado | Zustand |
| Gráficos | Recharts |
| IA | Google Gemini 2.5 Flash vía Genkit |
| Backend | Node.js · Express |
| Base de datos | MySQL |
| Reportes | jsPDF · jspdf-autotable |
| Contenedores | Docker · Docker Compose |

---

## Requisitos previos

- **Node.js** 18 o superior
- **MySQL** 8 o superior
- Una **API key de Google Gemini** (gratuita en [Google AI Studio](https://aistudio.google.com))

---

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Tesis
```

### 2. Base de datos

```bash
mysql -u root -p < database/sistema.sql
```

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env     # editar con tus credenciales
npm start                # http://localhost:3000
```

Alternativa con Docker:

```bash
cd backend
docker-compose up -d
```

### 4. Frontend

```bash
cd FrontendNext/my-app
npm install
```

Crear el archivo `.env.local` con tus claves (ver `.env.example` en la raíz):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
GOOGLE_GENAI_API_KEY=AIzaSy...
GOOGLE_GENAI_API_KEY_2=AIzaSy...
```

Ejecutar:

```bash
npm run dev              # http://localhost:9002
```

---

## Variables de entorno

Consulta [`.env.example`](.env.example) en la raíz para la plantilla completa.

> **Importante:** el sistema soporta **dos claves de Gemini**. Cuando la primera
> agota su cuota diaria, conmuta automáticamente a la secundaria sin interrumpir
> el servicio.

---

## Módulos del sistema

### Tienda pública
| Módulo | Descripción |
|--------|-------------|
| Inicio | Landing con colecciones, testimonios y CTA |
| Catálogo | 57 productos, filtros, campañas activas con descuento |
| Quiz de Estilo IA | Recomienda un outfit completo comprable |
| Carrito | Cupones, descuentos de campaña, pago simulado |
| Comprobante | Boleta electrónica con RUC, IGV 18% y monto en letras |
| Chatbot | Asistente virtual con catálogo en tiempo real |

### Panel administrativo
| Módulo | Descripción |
|--------|-------------|
| Dashboard | KPIs, metas, análisis IA, asistente de ventas |
| Ventas | Transacciones, filtros, boletas legales, exportación |
| Productos / Inventario | Stock en tiempo real, predicción IA de agotamiento |
| Clientes / Leads | Segmentación y scoring con IA |
| Consultas | Bandeja unificada con respuestas automáticas |
| Chatbot IA | Métricas, intenciones, historial y tasa de resolución |
| Campañas | Generación IA por fechas especiales (Black Friday, CyberWow) |
| Descuentos | Cupones con validación y control de uso |
| Optimización | Panel comparativo antes/después con ROI |
| Reportes | Inteligencia de negocio con informe narrativo IA |

---

## Funcionalidades con IA

El sistema integra **20+ flujos de Google Gemini**:

- Chatbot de atención al cliente con catálogo en vivo
- Quiz de estilo personal y recomendación de outfits
- Segmentación automática de clientes
- Scoring y estrategia de conversión de leads
- Predicción de agotamiento de stock
- Generación de campañas de marketing
- Clasificación de devoluciones
- Análisis de sentimiento en encuestas
- Informes narrativos de inteligencia de negocio

---

## Resultados de optimización

Comparativa pre y post implementación del chatbot generativo:

| Indicador | Antes | Después | Mejora |
|-----------|-------|---------|--------|
| Tiempo de respuesta | ~4.2 horas | < 3 segundos | 99.98 % |
| Consultas atendidas / día | ~17 | 100+ | +488 % |
| Disponibilidad | 54 h/semana | 24/7 (168 h) | +211 % |
| Costo por consulta | S/ 8.50 | S/ 0.12 | −98.6 % |
| Leads captados / semana | ~2.5 | 8+ | +220 % |
| Tasa de conversión | 11.8 % | 14.3 %+ | +21 % |
| Satisfacción del cliente | 71 % | 94 % | +32 % |

El módulo **Optimización** del panel administrativo genera estos indicadores en
tiempo real y permite exportarlos en PDF y CSV.

---

## Autor

**Julian** — Tesis de titulación 2026
PAT-LI Textiles S.R.L. · Ica, Perú
