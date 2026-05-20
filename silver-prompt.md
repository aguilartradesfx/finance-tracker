# Silver — Panel Financiero Privado

> Prompt para Claude Code. Entrega por fases con aprobación entre cada una. **Lee este archivo completo antes de escribir una sola línea de código.**

---

## 1 · CONTEXTO

Soy founder de **Bralto** (agencia de infraestructura digital y automatización en Costa Rica). Necesito un **panel financiero privado y standalone** — NO va dentro del admin de Bralto, porque ese tiene acceso compartido y este maneja datos sensibles personales y de la empresa.

**Propósito:** ver de un vistazo mi MRR, gastos, márgenes, riesgo de concentración, y decidir cuándo puedo escalar (contratar, prender ads).

**Datos que mezcla:** finanzas personales (renta, auto) + finanzas de Bralto (clientes, herramientas, marketing). Una sola vista con etiquetas/filtros para separar cuando lo necesite.

**Usuario único:** yo. No hay multi-tenant, no hay signup público.

**Nombre del proyecto:** `silver` — repo, carpeta, branding interno. Subdominio sugerido: `silver.bralto.app` o `silver.alebraltobor.com` (a definir en deploy).

---

## 2 · STACK TÉCNICO (NO NEGOCIABLE)

- **Next.js 15** (App Router, RSC donde tenga sentido)
- **TypeScript estricto** (`"strict": true`, no `any` salvo casos justificados)
- **Tailwind CSS v4**
- **Framer Motion** — solo para micro-interactions (fade-ins de 250–400ms, hover lifts sutiles). Nada llamativo.
- **Supabase** (Postgres + Auth + RLS)
- **shadcn/ui** como base de componentes — pero **customizados a fondo** para encajar con el design system de abajo. No queremos look "stock shadcn".
- **Recharts** para charts
- **react-hook-form + zod** para forms y validación
- **next/font** con Inter y Space Grotesk auto-hosted (no Google Fonts CDN en producción)
- **sonner** para toasts

No agregues nada más sin avisarme primero.

---

## 3 · DESIGN SYSTEM (EL CORAZÓN — RESPÉTALO AL 100%)

Adjunto el archivo **`design-reference.html`** como fuente visual de verdad. **Ábrelo en un browser y estúdialo antes de codear nada.** Cada decisión visual de abajo está reflejada ahí.

NO copies el HTML verbatim. Tradúcelo a componentes React/Tailwind bien arquitecturados. Pero la fidelidad visual debe ser idéntica.

### 3.1 · Paleta (grayscale total)

```css
/* Backgrounds */
--bg: #08080a;                              /* fondo base */
--glass: rgba(255, 255, 255, 0.04);         /* glass por defecto */
--glass-strong: rgba(255, 255, 255, 0.07);  /* glass elevado */
--glass-hover: rgba(255, 255, 255, 0.08);

/* Borders */
--border: rgba(255, 255, 255, 0.08);
--border-strong: rgba(255, 255, 255, 0.16);

/* Text */
--text: #fafafa;
--text-soft: rgba(255, 255, 255, 0.72);
--text-mute: rgba(255, 255, 255, 0.45);
--text-faint: rgba(255, 255, 255, 0.25);
--text-ghost: rgba(255, 255, 255, 0.12);

/* Silver scale (para gradients metálicos) */
--silver: #e4e4e7;
--silver-dim: #a1a1aa;
--silver-deep: #52525b;

/* Glows */
--glow-bright: rgba(255, 255, 255, 0.5);
--glow-soft: rgba(255, 255, 255, 0.18);
--glow-faint: rgba(255, 255, 255, 0.08);
```

**Regla absoluta:** NO uses colores cromáticos (violeta, cyan, verde, rojo, amber, etc.) en ningún elemento de UI. Solo escala de grises. La diferenciación se hace con:
- **Brillo/glow:** primario tiene white glow fuerte, secundario sin glow
- **Animación pulse:** únicamente en estados de alerta
- **Borde dashed:** para badges de alerta (`Riesgo`, `Aún no`)
- **Hollow ring vs sólido:** dots en card headers

### 3.2 · Tipografía

```ts
// app/fonts.ts
import { Inter, Space_Grotesk } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space',
})
```

**Reglas de uso:**
- **Inter** — UI, body, descripciones, párrafos. Pesos 400/500/600.
- **Space Grotesk** — TODOS los números, títulos de cards, labels uppercase, valores en KPIs, badges. Pesos 500/600/700.
- **Letter spacing:** `-0.011em` global; `-0.025em` para números grandes; `0.08–0.1em` para labels uppercase.
- **Tabular nums siempre** para columnas de números: `font-variant-numeric: tabular-nums`.

### 3.3 · El efecto glassmorphism 3D

Cada card tiene esta receta exacta:

```css
.card {
  background: var(--glass);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.14),
    inset 0 -1px 0 rgba(0,0,0,0.15),
    0 1px 2px rgba(0,0,0,0.25),
    0 8px 24px -4px rgba(0,0,0,0.35),
    0 24px 64px -12px rgba(0,0,0,0.55);
  position: relative;
  overflow: hidden;
}

/* Top highlight (esto es lo que da el efecto biselado) */
.card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 100px;
  background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%);
  pointer-events: none;
  border-radius: 24px 24px 0 0;
}
```

**Border-radius:** 24px en cards principales, 16px en inputs/badges secundarios, 12px en buttons/icons, 100px en pills.

### 3.4 · Texto metálico (silvery gradient)

Para números hero ($2,963, $1,634, etc.):

```css
.silver-text {
  background: linear-gradient(135deg, #ffffff 0%, #e4e4e7 35%, #71717a 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.silver-text-bright {
  background: linear-gradient(135deg, #ffffff 0%, #ffffff 30%, #d4d4d8 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

Úsalo en: MRR hero, Neto, "$1,634" del veredicto, LTV/CAC highlight, último punto del chart (Agosto).

### 3.5 · Fondo (background system)

Tres capas, en este orden de stacking (z-index 0):

1. **Grid principal:** 48×48px, líneas `rgba(255, 255, 255, 0.025)`, enmascarado con `radial-gradient(ellipse 80% 60% at 50% 40%, black 0%, transparent 80%)`
2. **Grid fino:** 12×12px, líneas `rgba(255, 255, 255, 0.012)`, enmascarado con elipse más pequeña al centro
3. **Cuatro orbes blancos blureados:** `filter: blur(110px)`, opacidades entre 4–8%, posicionados en esquinas opuestas. Ver el HTML reference para coordenadas exactas.
4. **Grain overlay** (z-index 1): SVG noise filter, `opacity: 0.06`, `mix-blend-mode: overlay`

Todo el contenido va en z-index 2.

### 3.6 · Componentes clave (patrones)

**Card header:**
```
[dot indicator] Título · Space Grotesk 13px/500    Meta info · 11px/400 text-mute
─────────────── padding 18 22 14 ───────────────
```

**Dots de indicador:**
- Sólido: `bg-text` + glow fuerte (primario)
- Ring/hollow: borde 1.5px, transparente, animación `pulse-ring`
- Dim: `bg-silver-dim` sin glow (secundario)

**Pills:**
- Default: `bg-white/5`, `text-faint`, sin borde, padding 2×8px
- Alert: `bg-white/6`, `text-white`, `border-dashed border-white/25`, con dot pulse adentro

**Botones:**
- Primary: gradient `white/18 → white/8`, border `white/20`, hover con glow blanco
- Ghost: `bg-white/4`, border default, hover background más fuerte
- Icon: 38×38px, rounded-12px, border default

**Inputs:**
- Background `rgba(0,0,0,0.2)`, border `white/6`
- Hover/focus eleva el border a `white/18`
- Number/text inside es Space Grotesk 18px/600

**Slider:**
- Track: 6px height, `bg-white/6`, rounded-full
- Thumb: 22px, gradient `white → silver-dim`, border 2px del bg base, multi-shadow para sensación 3D

**Segmented control:**
- Container: `bg-black/30`, border `white/5`, padding 4px
- Active: `bg-white/10`, inset top highlight, inset shadow

### 3.7 · Animaciones (sutiles, no fancy)

```ts
// Defaults para Framer Motion
const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: 'easeOut' } }
const hoverLift = { whileHover: { y: -2, transition: { duration: 0.2 } } }
```

- Cards entran con fade+slide al cargar
- Hover en cards: leve lift de -2px
- Pulse animation solo en: dot de alerta, badge de notificación, badge "Aún no", concentración

**No uses:** spring animations exageradas, rotaciones, scale grandes, parallax. Mantén la estética seria/profesional.

---

## 4 · MODELO DE DATOS (SUPABASE)

```sql
-- Clientes (Bralto)
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  monthly_amount numeric(10,2) not null,
  tier text check (tier in ('anchor','high','mid','entry','custom')) not null,
  status text default 'active' check (status in ('active','paused','churned')) not null,
  category text,                    -- "real estate", "retail", "hospitality", etc.
  start_date date not null default current_date,
  churn_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Gastos fijos (mezcla personal + Bralto)
create table fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  monthly_amount numeric(10,2) not null,
  category text check (category in ('infrastructure','tools','personal','team','marketing','other')) not null,
  scope text check (scope in ('personal','bralto','both')) not null default 'bralto',
  active boolean default true,
  notes text,
  created_at timestamptz default now()
);

-- Metas mensuales
create table monthly_goals (
  id uuid primary key default gen_random_uuid(),
  month date not null unique,        -- siempre día 1
  mrr_target numeric(10,2) not null,
  new_clients_target int default 0,
  ad_spend_budget numeric(10,2) default 0,
  narrative text,                    -- "LinkedIn Agent en producción"
  notes text,
  created_at timestamptz default now()
);

-- Snapshots mensuales (histórico)
create table monthly_snapshots (
  id uuid primary key default gen_random_uuid(),
  month date not null unique,
  mrr_actual numeric(10,2) not null,
  expenses_actual numeric(10,2) not null,
  ad_spend_actual numeric(10,2) default 0,
  new_clients_actual int default 0,
  churned_clients_actual int default 0,
  notes text,
  created_at timestamptz default now()
);

-- Campañas de ads
create table ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  platform text check (platform in ('meta','linkedin','google','other')) not null,
  name text not null,
  start_date date not null,
  end_date date,
  total_spend numeric(10,2) default 0,
  leads_generated int default 0,
  clients_closed int default 0,
  mrr_generated numeric(10,2) default 0,
  active boolean default true,
  created_at timestamptz default now()
);
```

**RLS:** Habilitar en todas las tablas. Solo el usuario autenticado (yo) tiene acceso. Policy simple: `auth.uid() = '<my-user-id>'` o usar tabla `allowed_users`.

---

## 5 · DATOS INICIALES (SEED)

```ts
// Clientes
const clients = [
  { name: 'American Outlet', monthly_amount: 950, tier: 'anchor', category: 'retail' },
  { name: 'Ecoviva Desarrollos', monthly_amount: 375, tier: 'high', category: 'real estate' },
  { name: 'AO Liquidators', monthly_amount: 375, tier: 'high', category: 'retail' },
  { name: 'AO Warehouse', monthly_amount: 375, tier: 'high', category: 'retail' },
  { name: 'Nanku', monthly_amount: 270, tier: 'mid', category: 'hospitality' },
  { name: 'Hidasol', monthly_amount: 270, tier: 'mid', category: 'graphic solutions' },
  { name: 'Aleconomies', monthly_amount: 87, tier: 'entry' },
  { name: 'Travelcore', monthly_amount: 87, tier: 'entry' },
  { name: 'Zenius', monthly_amount: 87, tier: 'entry' },
  { name: 'Natural Lodge', monthly_amount: 87, tier: 'entry', category: 'hospitality' },
]

// Gastos
const expenses = [
  { name: 'Renta', monthly_amount: 700, category: 'personal', scope: 'personal' },
  { name: 'Auto', monthly_amount: 400, category: 'personal', scope: 'personal' },
  { name: 'GHL', monthly_amount: 497, category: 'infrastructure', scope: 'bralto' },
  { name: 'Claude', monthly_amount: 105, category: 'tools', scope: 'both' },
  { name: 'Zoom', monthly_amount: 20, category: 'tools', scope: 'bralto' },
  { name: 'Higgsfield', monthly_amount: 100, category: 'tools', scope: 'bralto' },
  { name: 'LinkedIn Agent', monthly_amount: 275, category: 'marketing', scope: 'bralto' },
]
```

---

## 6 · MÓDULOS / PÁGINAS

### 6.1 · `/` — Overview (la página principal del HTML reference)

Replica fielmente el layout del HTML adjunto:

1. **Top bar flotante** (glass) con: logo $, "Finanzas · fecha actual", search bar con `⌘K`, icon buttons (notificaciones con badge pulse, settings), botón primary "Nuevo cliente"
2. **Hero row** (3 cards): MRR grande con sparkline de 12 barras, Gastos, Neto
3. **Metrics row** (4 cards): Margen, Concentración (con alert), Clientes activos, Ticket promedio
4. **Two-column**: Top 5 clientes | Distribución por tier
5. **Hire calculator card** (full width): slider + segmented + verdict con headline metálico
6. **Proyección card** (full width): tabla editable inline + chart SVG con gradient stroke
7. **Ad ROI card** (full width): 4 inputs + 6 outputs (uno highlighted)

### 6.2 · `/clientes` — CRUD de clientes

- Tabla full con todas las columnas + filtros por tier/status/category
- Botón "+ Nuevo cliente" → dialog con form (react-hook-form + zod)
- Click en fila → drawer/dialog de edición
- Soft delete: cambia `status` a `churned`, no borra
- Indicador visual: dot blanco con glow al lado de clientes del tier `anchor`

### 6.3 · `/gastos` — CRUD de gastos

- Lista agrupada por categoría
- Sub-filtro por scope (personal / bralto / ambos)
- Toggle de "activo/inactivo" para simular escenarios
- Totales al final con desglose por scope (cuánto es personal, cuánto Bralto)
- Mismo patrón de add/edit que clientes

### 6.4 · `/contratacion` — Calculadora dedicada

- Versión expandida del calculador del overview
- Comparativa lado a lado: Planilla vs Servicios Profesionales vs Contractor
- Tabla de escenarios: ¿qué pasa si el sueldo es $800, $1,200, $1,800?
- Para cada escenario muestra: costo total, MRR necesario, gap, # clientes necesarios

**Fórmulas (en `lib/silver/calculations.ts` como funciones puras):**

```typescript
type HireType = 'payroll' | 'services' | 'contractor'

export function calculateTotalCost(salary: number, type: HireType): number {
  const multipliers = { payroll: 1.40, services: 1.00, contractor: 1.00 }
  return salary * multipliers[type]
}

export function calculateRequiredMRR(currentExpenses: number, hireCost: number, targetMargin = 0.30): number {
  return (currentExpenses + hireCost) / (1 - targetMargin)
}

export function calculateGap(requiredMRR: number, currentMRR: number): number {
  return Math.max(0, requiredMRR - currentMRR)
}

export function calculateHireStatus(gap: number): 'ready' | 'close' | 'far' {
  if (gap === 0) return 'ready'
  if (gap < 500) return 'close'
  return 'far'
}
```

### 6.5 · `/proyeccion` — Tabla editable + chart

- Tabla tipo spreadsheet con columnas editables inline (Meta MRR, Clientes, Ad spend, Narrativa)
- Cálculo automático del margen proyectado
- Chart de línea con gradient silver y punto de break-even
- Botón "Guardar cambios" + auto-save con debounce

### 6.6 · `/anuncios` — ROI calculator + tracking de campañas

- Calculator del overview, expandido con más inputs (segmento, geo, etc.)
- Lista de campañas activas con performance real vs proyectada
- Si una campaña termina, queda archivada con sus métricas finales

### 6.7 · `/historico` — Snapshots

- Botón "Tomar snapshot del mes actual" → guarda `monthly_snapshots`
- Tabla con todos los snapshots pasados (mes a mes)
- Chart de evolución de MRR con marcadores de eventos (clientes ganados/perdidos)

---

## 7 · FÓRMULAS FINANCIERAS (`lib/silver/calculations.ts`)

Todas como funciones puras, con tests en `__tests__/calculations.test.ts`. Usá Vitest.

```typescript
// Core
export function calculateMRR(clients: Client[]): number
export function calculateExpenses(expenses: Expense[], scope?: 'personal' | 'bralto' | 'all'): number
export function calculateNet(mrr: number, expenses: number): number
export function calculateMargin(net: number, mrr: number): number

// Risk
export function calculateConcentrationRisk(clients: Client[]): {
  topClient: Client | null
  percentage: number
  level: 'safe' | 'warning' | 'danger'  // <20, 20-25, >25
}

// Stats
export function calculateAvgTicket(clients: Client[]): number
export function calculateMedianTicket(clients: Client[]): number
export function getTierBreakdown(clients: Client[]): TierBreakdown[]

// Hire (ver arriba)

// Ads ROI
export function calculateAdROI(input: {
  budget: number
  cpl: number
  closeRate: number
  avgTicket: number
  retentionMonths: number
}): {
  leads: number
  clients: number
  cac: number
  ltv: number
  ltvCacRatio: number
  paybackMonths: number
  mrrAtMonth3: number
  ratioLevel: 'excellent' | 'good' | 'warning' | 'bad'
}
```

**REGLA:** Toda lógica financiera vive acá. Los componentes solo renderizan. Esto permite testing unitario y reuso futuro (n8n, scripts, etc.).

---

## 8 · ESTRUCTURA DE ARCHIVOS

```
silver/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx              # magic link form
│   ├── (app)/
│   │   ├── layout.tsx                  # top bar global
│   │   ├── page.tsx                    # overview / dashboard
│   │   ├── clientes/page.tsx
│   │   ├── gastos/page.tsx
│   │   ├── contratacion/page.tsx
│   │   ├── proyeccion/page.tsx
│   │   ├── anuncios/page.tsx
│   │   └── historico/page.tsx
│   ├── api/                            # solo si hace falta para webhooks
│   ├── fonts.ts
│   ├── globals.css                     # CSS vars del design system
│   └── layout.tsx
├── components/
│   ├── ui/                             # shadcn customizados
│   ├── silver/
│   │   ├── background.tsx              # orbs + grids + grain
│   │   ├── card.tsx                    # glass card base
│   │   ├── topbar.tsx
│   │   ├── kpi-hero.tsx                # hero card grande con sparkline
│   │   ├── kpi-metric.tsx              # metric card secundario
│   │   ├── client-row.tsx
│   │   ├── tier-bar.tsx
│   │   ├── hire-calculator.tsx
│   │   ├── ad-roi-calculator.tsx
│   │   ├── projection-table.tsx
│   │   ├── projection-chart.tsx
│   │   ├── silver-text.tsx             # wrapper para el efecto metálico
│   │   ├── pulse-dot.tsx
│   │   └── ...
├── lib/
│   ├── silver/
│   │   ├── calculations.ts
│   │   ├── queries.ts                  # Supabase queries
│   │   ├── mutations.ts                # Supabase mutations
│   │   ├── types.ts
│   │   └── __tests__/
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
├── supabase/
│   ├── migrations/
│   │   ├── 20260515_initial_schema.sql
│   │   └── 20260515_seed.sql
│   └── config.toml
├── public/
├── design-reference.html               # el archivo que adjunto, NO TOCAR
├── .env.local.example
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 9 · AUTH (SIMPLE)

- **Magic link** vía Supabase Auth
- Login page minimalista (mismo design system, una card glass centrada con input de email + botón)
- Middleware que redirige `/login` si no hay sesión
- Whitelist de un solo email: el mío (configurable por env var `ALLOWED_EMAIL`)
- Si alguien intenta loguearse con otro email → error genérico "Acceso no autorizado"

---

## 10 · UX REQUIREMENTS

1. **Desktop-first** (uso MacBook Pro 16"). Mobile decente pero no priority.
2. **Loading states con skeleton** glass (cards vacías con shimmer sutil grayscale)
3. **Optimistic updates** en mutaciones
4. **Toasts sonner** con estilo del design system (glass, grayscale)
5. **Atajos de teclado:**
   - `⌘K` → command palette para saltar entre páginas/acciones
   - `N` → nuevo cliente (en `/clientes`) o nuevo gasto (en `/gastos`)
   - `E` → editar fila seleccionada
   - `/` → focus en search
6. **Números siempre formateados:** `$2,963.00` con separadores de miles, máximo 2 decimales
7. **Fechas en español:** "15 de mayo, 2026" o "Vie 15 · May"
8. **Empty states:** glass cards con icono outline + texto + CTA

---

## 11 · ENTREGABLES Y FASES

Quiero esto **por fases con aprobación entre cada una**. NO me hagas todo de un solo viaje.

### Fase 1 — Foundation
- Setup Next.js + Tailwind + Supabase + fonts
- Migraciones SQL + seed
- `lib/silver/calculations.ts` con todas las fórmulas + tests Vitest pasando
- `lib/silver/types.ts` con todos los types
- Auth con magic link funcionando + middleware
- `globals.css` con TODAS las CSS vars del design system
- `components/silver/background.tsx` con orbs + grids + grain
- `components/silver/card.tsx` con el glass effect exacto

→ **Mostrame screenshot del home con solo el background y una card de prueba.** Espera mi OK.

### Fase 2 — Overview (la página principal)
- Topbar completo
- Hero row con datos reales
- Metrics row con alert state funcional
- Top clientes + Distribución por tier (read-only)
- Hire calculator interactivo (slider funcional, segmented control, verdict reactivo)
- Proyección con chart
- Ad ROI calculator interactivo

→ **Mostrame el `/` completo.** Compara visualmente con el `design-reference.html`. Si hay drift, lo corregís antes de seguir. Espera mi OK.

### Fase 3 — CRUDs
- `/clientes` completo (tabla, filtros, add, edit, churn)
- `/gastos` completo (lista por categoría, toggle activo, scope filter)
- Toasts + optimistic updates funcionando

→ Validamos.

### Fase 4 — Calculadoras dedicadas
- `/contratacion` con tabla comparativa de escenarios
- `/anuncios` con tracking de campañas + lista activa

→ Validamos.

### Fase 5 — Proyección + Histórico
- `/proyeccion` con tabla editable inline + auto-save
- `/historico` con snapshots + chart de evolución
- Command palette `⌘K`
- Atajos de teclado

→ Cierre del v1.

---

## 12 · RESTRICCIONES Y CRITERIO

- **NO inventes datos.** Si algo necesita input mío que no te di, preguntá.
- **NO agregues features que no pedí.** Si ves una oportunidad, sugerímela aparte como "nice to have v1.1" — no la metas sin permiso.
- **Code review mental antes de cada entrega:** ¿pasa `tsc --noEmit`? ¿pasa `eslint`? ¿pasa `vitest`? ¿es responsive razonable?
- **Commits semánticos:** `feat(silver):`, `fix(silver):`, `chore(silver):`, `refactor(silver):`
- **Comentarios solo donde la lógica no sea obvia.** No comentes lo que el código ya dice.
- **NO uses colores cromáticos.** Si te pica meter un verde para "positivo" o rojo para "alerta", aguantátela y usá los recursos del design system (brillo, animación, dashed borders).
- **Server Components por defecto.** Solo `'use client'` donde hace falta (interactividad real).

---

## 13 · CRITERIO DE ÉXITO

Cuando termines, debería poder:

1. Abrir `silver.<mi-dominio>` y autenticarme con magic link en menos de 30 segundos
2. Ver mi situación financiera completa en el `/` en menos de 5 segundos de scroll
3. Agregar un cliente nuevo en menos de 20 segundos
4. Mover un slider y ver cuánto MRR me falta para contratar — en tiempo real
5. Editar metas de proyección inline en una tabla tipo spreadsheet
6. Cerrar el laptop con la sensación de que esto es **mío**, no un template SaaS más

Y visualmente, debería verse **idéntico** al `design-reference.html` adjunto. Si en algún momento dudás entre fidelidad visual y "lo más limpio en código", priorizá la fidelidad visual.

---

Listo. Arrancá con la **Fase 1**.
