# S V Sales Corporation Website — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a modern, interactive B2B website for S V Sales Corporation — a wholesale & retail dealer of automotive tools and tyres in Mysore — featuring 3D product viewing, a quote-request cart, and no pricing display.

**Architecture:** Next.js 14 App Router with TypeScript and Tailwind CSS. Product data lives in static TypeScript files covering all 198 catalogued products. Quote requests flow through a cart-style UI, then submit via a Next.js API route to Resend (email). 3D viewing is powered by Sketchfab iframe embeds for key products and Google Model Viewer for GLB files, with Pexels API images as the product photo source.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/UI, Framer Motion, Spline (hero 3D scene), Sketchfab (embedded 3D product models), Google Model Viewer, Resend (email API), Pexels API (images), Vercel (hosting)

---

## Product Catalogue — 198 Items, 14 Categories

From the PDF price list (DOC-20231223-WA0007), items are catalogued and mapped to these categories:

| # | Category | Key Items |
|---|---|---|
| 1 | Tyre Repair & Retreading | Radial patches (CT-10→CT-45), BP patches, buffing machines, rasps, curing rim, valve stems |
| 2 | Spanners & Wrenches | Open-end sets, ring sets, double-end (6×7→36×41), ring individual, adjustable, wheel spanner |
| 3 | Sockets & Drive Tools | Socket box 1/2", heavy-duty 3/4" sockets (36–55mm), 1/2" sockets (8–32mm), T-bars, L-rods |
| 4 | Pliers, Cutters & Screwdrivers | Cutting plier, nose plier, circlip plier, tin cutter, screwdrivers (S/M/L/XL) |
| 5 | Jacks & Lifting Equipment | Hydraulic jacks (12T/15T), trolley jack (3T), mechanical jacks (10T/15T/20T), trolley wheels |
| 6 | Pneumatic & Air Tools | Air filter/regulator, air hose, pneumatic tool 22000RPM, SS teflon hoses, pressure gauges |
| 7 | Grease & Lubrication | Grease pump 200L, grease gun, barrel pump, hand pump, grease hose |
| 8 | Welding Equipment | Welding cable, cutting torch, goggles, holder, hose, shield |
| 9 | Painting & Surface Finishing | Spray gun, Mahindra brushes, masking poly film, protective mask, tyre paint |
| 10 | Fastening & Clamping | C-clamps (3"→12"), stapler gun, stapler pins, pop rivet gun |
| 11 | Electrical & Fans | Ceiling fan, wall fan, industrial pedestal/exhaust fans, battery terminals, timing switch |
| 12 | Safety & Protective Gear | Hand gloves (TRP), protective cloth, protective mask, marking crayons |
| 13 | Sealing & Adhesives | Silicon sealant (black + gun), U-seal 54", polyester thread, Fevicol SR 998 |
| 14 | General Workshop Supplies | Tarpaulins (18×30ft, 40×40ft), pillow block bearings (207/208/209), love joy couplings |

---

## Phase 1 — Foundation & Product Data

### Task 1.1: Project Scaffold

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd /Users/abhi/Apps
npx create-next-app@latest SVSalesCorporation \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --no-turbopack
cd SVSalesCorporation
```

- [ ] **Step 2: Install core dependencies**

```bash
npm install @splinetool/react-spline framer-motion lucide-react resend
npm install @radix-ui/react-dialog @radix-ui/react-select
npm install clsx tailwind-merge class-variance-authority
npm install -D @types/node
```

- [ ] **Step 3: Install and initialise Shadcn/UI**

```bash
npx shadcn@latest init
# Theme: slate, CSS variables: yes
npx shadcn@latest add button badge card dialog sheet input label textarea select toast
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js 14 project with Tailwind and Shadcn/UI"
```

---

### Task 1.2: Brand Design System

**Files:**
- Create: `src/lib/brand.ts`
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Extend Tailwind with brand colors and display font**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red:    '#C0392B',
          dark:   '#1A1A2E',
          steel:  '#2C3E50',
          silver: '#BDC3C7',
          gold:   '#F39C12',
        },
      },
      fontFamily: {
        display: ['Rajdhani', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
```

- [ ] **Step 2: Add Google Fonts import to globals.css**

```css
/* src/app/globals.css  — add at top, before @tailwind directives */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap');
```

- [ ] **Step 3: Create brand constants**

```typescript
// src/lib/brand.ts
export const BRAND = {
  name:      'S V Sales Corporation',
  tagline:   'Authorized Dealer — Industrial & Garage Hand Tools, Tyre Retreading Accessories',
  address:   '#3, 1st Block, SBIIM Layout, Srinivaspura 2nd stage, Mysore – 570 023',
  phone:     '0821-2364833',
  mobile:    '9448044833',
  email:     'info@svsalescorporation.com',
  whatsapp:  '919448044833',
  authorizedFor: ['ELGI', 'Unipatch Rubber Ltd', 'Mysore Tubes', 'Taparia Hand Tools'],
} as const
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: brand design system — colors, Rajdhani font, brand constants"
```

---

### Task 1.3: Product Data Architecture

**Files:**
- Create: `src/data/types.ts`
- Create: `src/data/categories.ts`
- Create: `src/data/products/tyre-repair.ts`
- Create: `src/data/products/spanners-wrenches.ts`
- Create: `src/data/products/sockets-drives.ts`
- Create: `src/data/products/pliers-screwdrivers.ts`
- Create: `src/data/products/jacks-lifting.ts`
- Create: `src/data/products/pneumatic-air.ts`
- Create: `src/data/products/grease-lubrication.ts`
- Create: `src/data/products/welding.ts`
- Create: `src/data/products/painting-surface.ts`
- Create: `src/data/products/fastening-clamping.ts`
- Create: `src/data/products/electrical-fans.ts`
- Create: `src/data/products/safety-protective.ts`
- Create: `src/data/products/sealing-adhesives.ts`
- Create: `src/data/products/miscellaneous.ts`
- Create: `src/data/index.ts`

- [ ] **Step 1: Define shared TypeScript types**

```typescript
// src/data/types.ts
export type Unit = 'No' | 'Pair' | 'Set' | 'Pkt' | 'Mtr' | 'Ltr' | 'Roll' | 'Kg' | 'Box'

export interface Product {
  id: string
  name: string
  description: string
  categoryId: string
  subcategory?: string
  unit: Unit
  sketchfabModelId?: string   // Sketchfab public model UID — enables 3D iframe
  modelViewerSrc?: string     // URL to .glb/.gltf file for Google Model Viewer
  videoId?: string            // YouTube video ID for product demo
  imageQuery: string          // Search string for Pexels API
  tags: string[]
  specifications?: Record<string, string>
  brand?: string
  inStock: boolean
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string          // Lucide icon component name
  imageQuery: string    // Pexels search for category hero
  productCount: number  // populated at runtime by index.ts
}
```

- [ ] **Step 2: Define the 14 categories**

```typescript
// src/data/categories.ts
import type { Category } from './types'

export const categories: Category[] = [
  {
    id: 'tyre-repair',
    name: 'Tyre Repair & Retreading',
    description: 'Tyre patches, buffing machines, rasping tools, curing rims, and valve components for professional retreading workshops',
    icon: 'Circle',
    imageQuery: 'tyre repair retreading professional workshop',
    productCount: 0,
  },
  {
    id: 'spanners-wrenches',
    name: 'Spanners & Wrenches',
    description: 'Open-end, ring, double-end and adjustable spanners from 6mm to 41mm — individual and sets',
    icon: 'Wrench',
    imageQuery: 'spanner wrench set automotive tools chrome',
    productCount: 0,
  },
  {
    id: 'sockets-drives',
    name: 'Sockets & Drive Tools',
    description: '1/2" and 3/4" drive sockets, T-bars and L-rods for heavy-duty automotive work',
    icon: 'Settings2',
    imageQuery: 'socket set drive wrench automotive',
    productCount: 0,
  },
  {
    id: 'pliers-screwdrivers',
    name: 'Pliers, Cutters & Screwdrivers',
    description: 'Cutting, nose, and circlip pliers; tin cutters; and screwdrivers in all lengths',
    icon: 'Scissors',
    imageQuery: 'pliers screwdriver hand tools set',
    productCount: 0,
  },
  {
    id: 'jacks-lifting',
    name: 'Jacks & Lifting Equipment',
    description: 'Hydraulic bottle jacks (12–15T), trolley jacks (3T), mechanical jacks (10–20T), and trolley wheels',
    icon: 'ArrowUpCircle',
    imageQuery: 'hydraulic jack car lifting equipment garage',
    productCount: 0,
  },
  {
    id: 'pneumatic-air',
    name: 'Pneumatic & Air Tools',
    description: 'Air tools, compressor fittings, SS braided hoses, pressure gauges, and high-pressure washing sets',
    icon: 'Wind',
    imageQuery: 'pneumatic air tool compressor hose fitting',
    productCount: 0,
  },
  {
    id: 'grease-lubrication',
    name: 'Grease & Lubrication',
    description: 'Grease barrel pumps, grease gun pistols, hose pipes for workshop lubrication stations',
    icon: 'Droplets',
    imageQuery: 'grease gun pump barrel lubrication industrial',
    productCount: 0,
  },
  {
    id: 'welding',
    name: 'Welding Equipment',
    description: 'Cutting torches, welding cables, goggles, shields and all welding accessories',
    icon: 'Zap',
    imageQuery: 'welding torch equipment workshop industrial',
    productCount: 0,
  },
  {
    id: 'painting-surface',
    name: 'Painting & Surface Finishing',
    description: 'Spray guns, Mahindra brushes, poly films, tyre paint, and masking products for body shop use',
    icon: 'Paintbrush',
    imageQuery: 'automotive spray paint gun body shop',
    productCount: 0,
  },
  {
    id: 'fastening-clamping',
    name: 'Fastening & Clamping',
    description: 'C-clamps (3"–12"), stapler guns, rivet guns for workshop assembly and panel work',
    icon: 'Anchor',
    imageQuery: 'c clamp vice stapler rivet workshop',
    productCount: 0,
  },
  {
    id: 'electrical-fans',
    name: 'Electrical & Fans',
    description: 'Industrial pedestal, wall, and exhaust fans; battery terminals; timing switches',
    icon: 'Cpu',
    imageQuery: 'industrial fan workshop electrical ceiling',
    productCount: 0,
  },
  {
    id: 'safety-protective',
    name: 'Safety & Protective Gear',
    description: 'TRP gloves, protective cloth, masks, and marking crayons for workshop safety',
    icon: 'Shield',
    imageQuery: 'safety gloves protective gear workshop equipment',
    productCount: 0,
  },
  {
    id: 'sealing-adhesives',
    name: 'Sealing & Adhesives',
    description: 'Silicon sealant (black), sealant guns, U-seals, polyester thread, Fevicol SR 998',
    icon: 'Package',
    imageQuery: 'silicon sealant adhesive industrial sealing',
    productCount: 0,
  },
  {
    id: 'miscellaneous',
    name: 'General Workshop Supplies',
    description: 'Pillow block bearings, love joy couplings, tarpaulins, and general workshop consumables',
    icon: 'Box',
    imageQuery: 'workshop supplies industrial bearings tools',
    productCount: 0,
  },
]
```

- [ ] **Step 3: Create tyre-repair.ts product file (largest category)**

```typescript
// src/data/products/tyre-repair.ts
import type { Product } from '../types'

const CT_SIZES = ['CT-10','CT-12','CT-14','CT-20','CT-22','CT-24','CT-33','CT-35','CT-40','CT-42','CT-44','CT-45']
const BP_SIZES = ['BP-3','BP-4','BP-5','BP-6','BP-7']

export const tyreRepairProducts: Product[] = [
  // Buffing Machine Parts
  { id: 'buffing-blade', name: 'Buffing Blade', description: 'Industrial buffing blade for tyre surface preparation before retreading', categoryId: 'tyre-repair', subcategory: 'Buffing Machine Parts', unit: 'No', imageQuery: 'tyre buffing blade retreading wheel', tags: ['buffing','blade','retreading'], brand: 'Unipatch', inStock: true },
  { id: 'buffing-hub-flange', name: 'Buffing Expandable Hub Main Flange', description: 'Main flange for expandable hub buffing machine assembly', categoryId: 'tyre-repair', subcategory: 'Buffing Machine Parts', unit: 'No', imageQuery: 'tyre buffing machine component flange', tags: ['buffing','hub','flange'], brand: 'Unipatch', inStock: true },
  { id: 'buffing-hub-shaft', name: 'Buffing Expandable Hub Main Shaft', description: 'Drive shaft for expandable hub buffing machine', categoryId: 'tyre-repair', subcategory: 'Buffing Machine Parts', unit: 'No', imageQuery: 'tyre buffing machine shaft drive', tags: ['buffing','hub','shaft'], brand: 'Unipatch', inStock: true },
  { id: 'buffing-turn-table', name: 'Buffing Machine Turn Table Rings & Balls', description: 'Complete turn-table ring and ball bearing set for buffing machine rotation', categoryId: 'tyre-repair', subcategory: 'Buffing Machine Parts', unit: 'Set', imageQuery: 'buffing machine turntable bearings rings', tags: ['buffing','turntable','rings','balls'], brand: 'Unipatch', inStock: true },
  { id: 'buffing-expandable-barrel', name: 'Buffing / Building Machine Expandable Barrel', description: 'Expandable barrel for tyre building and buffing machines', categoryId: 'tyre-repair', subcategory: 'Buffing Machine Parts', unit: 'No', imageQuery: 'tyre building machine expandable barrel retreading', tags: ['building machine','barrel','expandable'], brand: 'Unipatch', inStock: true },
  { id: 'expandable-hub-rim-flap', name: 'Expandable Hub Rim Flap 20"', description: '20" expandable hub rim flap for retreading machine', categoryId: 'tyre-repair', subcategory: 'Buffing Machine Parts', unit: 'No', imageQuery: 'tyre retreading rim flap hub 20 inch', tags: ['rim flap','hub','20 inch'], brand: 'Unipatch', inStock: true },
  { id: 'piston-cum-wedge', name: 'Piston Cum Wedge', description: 'Piston and wedge assembly for tyre mounting and retreading equipment', categoryId: 'tyre-repair', subcategory: 'Retreading Equipment', unit: 'No', imageQuery: 'tyre retreading piston wedge component', tags: ['piston','wedge','retreading'], inStock: true },
  { id: 'curing-rim', name: 'Curing Rim 1000x20', description: 'Curing rim 1000×20 for the tyre vulcanization (retreading) process', categoryId: 'tyre-repair', subcategory: 'Retreading Equipment', unit: 'No', imageQuery: 'tyre curing rim retreading vulcanizing 1000x20', tags: ['curing','rim','retreading','vulcanizing'], inStock: true },
  { id: 'cutting-bag', name: 'Cutting Bag 10.00x20', description: 'Tyre cutting bag size 10.00×20 used in the retreading process', categoryId: 'tyre-repair', subcategory: 'Retreading Consumables', unit: 'No', imageQuery: 'tyre cutting bag retreading envelope', tags: ['cutting bag','retreading','10.00x20'], inStock: true },
  { id: 'cutting-envelope', name: 'Cutting Envelope 42x19', description: 'Retreading cutting envelope size 42×19', categoryId: 'tyre-repair', subcategory: 'Retreading Consumables', unit: 'No', imageQuery: 'tyre retreading cutting envelope', tags: ['cutting envelope','retreading','42x19'], inStock: true },
  // Rasping Tools
  { id: 'cup-rasp', name: 'Cup Rasp', description: 'Cup-shaped abrasive rasp for tyre surface roughening before patching', categoryId: 'tyre-repair', subcategory: 'Rasping Tools', unit: 'No', imageQuery: 'cup rasp abrasive tyre surface preparation', tags: ['rasp','cup','surface prep'], inStock: true },
  { id: 'radial-rasping-stone', name: 'Radial Rasping Stone', description: 'Abrasive stone for radial tyre surface preparation', categoryId: 'tyre-repair', subcategory: 'Rasping Tools', unit: 'No', imageQuery: 'rasping stone abrasive tyre repair', tags: ['rasping stone','radial','abrasive'], inStock: true },
  { id: 'rasp-head-assy', name: 'Rasp Head Assembly', description: 'Complete rasp head assembly for buffing/surface preparation machines', categoryId: 'tyre-repair', subcategory: 'Rasping Tools', unit: 'No', imageQuery: 'rasp head assembly machine tyre buffing', tags: ['rasp','head','assembly'], inStock: true },
  { id: 'rasp-wheel', name: 'Rasp Wheel', description: 'Circular rasp wheel for tyre surface preparation and retreading', categoryId: 'tyre-repair', subcategory: 'Rasping Tools', unit: 'No', imageQuery: 'rasp wheel circular tyre retreading', tags: ['rasp','wheel'], inStock: true },
  // Radial Tyre Patches — CT series
  ...CT_SIZES.map((size) => ({
    id: `radial-patch-${size.toLowerCase()}`,
    name: `Radial Tyre Patch ${size}`,
    description: `Radial tyre repair patch ${size} for professional tyre repairs — Unipatch brand`,
    categoryId: 'tyre-repair',
    subcategory: 'Radial Tyre Patches',
    unit: 'No' as const,
    imageQuery: 'radial tyre patch repair vulcanizing automotive',
    tags: ['patch','radial','tyre repair', size],
    brand: 'Unipatch',
    inStock: true,
  })),
  // BP series tyre patches
  ...BP_SIZES.map((size) => ({
    id: `tyre-patch-${size.toLowerCase()}`,
    name: `Tyre Patch ${size}`,
    description: `${size} tyre patch for bias and radial tube/tubeless tyre repairs`,
    categoryId: 'tyre-repair',
    subcategory: 'Bias Tyre Patches',
    unit: 'No' as const,
    imageQuery: 'tyre patch repair tube automotive bias',
    tags: ['patch','tyre repair', size],
    brand: 'Unipatch',
    inStock: true,
  })),
  // Tube patches
  { id: 'tube-patch-medium-oval',  name: 'Tube Patch Medium Oval',  description: 'Medium oval patch for inner tube repairs', categoryId: 'tyre-repair', subcategory: 'Tube Patches', unit: 'Pkt', imageQuery: 'inner tube patch repair oval', tags: ['tube','patch','oval'], brand: 'Unipatch', inStock: true },
  { id: 'tube-patch-medium-round', name: 'Tube Patch Medium Round', description: 'Medium round patch for inner tube repairs', categoryId: 'tyre-repair', subcategory: 'Tube Patches', unit: 'Pkt', imageQuery: 'inner tube patch repair round', tags: ['tube','patch','round'], brand: 'Unipatch', inStock: true },
  { id: 'tube-patch-small-oval',   name: 'Tube Patch Small Oval',   description: 'Small oval patch for minor inner tube repairs', categoryId: 'tyre-repair', subcategory: 'Tube Patches', unit: 'Pkt', imageQuery: 'inner tube patch small oval', tags: ['tube','patch','small','oval'], brand: 'Unipatch', inStock: true },
  { id: 'tube-patch-small-round',  name: 'Tube Patch Small Round',  description: 'Small round patch for minor inner tube repairs', categoryId: 'tyre-repair', subcategory: 'Tube Patches', unit: 'Pkt', imageQuery: 'inner tube patch small round', tags: ['tube','patch','small','round'], brand: 'Unipatch', inStock: true },
  // Tyre tools
  { id: 'tyre-beading-hammer',  name: 'Tyre Beading Removing Hammer', description: 'Specialized hammer for removing tyre bead from rims', categoryId: 'tyre-repair', subcategory: 'Tyre Tools', unit: 'No', imageQuery: 'tyre bead breaker hammer removal', tags: ['bead','hammer','removal'], inStock: true },
  { id: 'tyre-mounting-paste',  name: 'Tyre Mounting Paste',          description: 'Lubricating paste for tyre mounting and demounting', categoryId: 'tyre-repair', subcategory: 'Tyre Tools', unit: 'Kg', imageQuery: 'tyre mounting paste lubricant mounting compound', tags: ['mounting paste','lubricant'], inStock: true },
  { id: 'tyre-paint',           name: 'Tyre Paint',                    description: 'Professional tyre paint for sidewall finishing and retreaded tyre coating', categoryId: 'tyre-repair', subcategory: 'Tyre Tools', unit: 'Ltr', imageQuery: 'tyre paint black sidewall automotive finishing', tags: ['paint','tyre','sidewall'], inStock: true },
  { id: 'tubeless-mounting-spanner', name: 'Tubeless Tyre Mounting & Demounting Spanner', description: 'Complete spanner set for tubeless tyre mounting and demounting on rims', categoryId: 'tyre-repair', subcategory: 'Tyre Tools', unit: 'Set', imageQuery: 'tubeless tyre mounting tool spanner demount', tags: ['tubeless','mounting','spanner','demounting'], inStock: true },
  // Valve & Inflation
  { id: 'ttc-twin-connector',    name: 'TTC — Tyre Twin Connector',    description: 'Tyre twin connector for dual-wheel inflation systems on trucks', categoryId: 'tyre-repair', subcategory: 'Valve & Inflation', unit: 'No', imageQuery: 'tyre twin connector valve dual wheel inflation', tags: ['TTC','twin','connector','inflation'], inStock: true },
  { id: 'tubeless-valve-neck',   name: 'Tubeless Valve (Neck)',         description: 'Replacement tubeless valve stem/neck for tubeless tyres', categoryId: 'tyre-repair', subcategory: 'Valve & Inflation', unit: 'No', imageQuery: 'tubeless tyre valve stem neck replacement', tags: ['valve','tubeless','stem'], inStock: true },
  { id: 'tube-neck',             name: 'Tube Neck',                     description: 'Replacement valve neck for inner tubes', categoryId: 'tyre-repair', subcategory: 'Valve & Inflation', unit: 'No', imageQuery: 'inner tube valve neck replacement', tags: ['tube','neck','valve'], inStock: true },
  { id: 'short-core-valve-pin',  name: 'Short Core / Valve Pin',        description: 'Short core valve pin for tyre valve maintenance', categoryId: 'tyre-repair', subcategory: 'Valve & Inflation', unit: 'No', imageQuery: 'tyre valve core pin short replacement', tags: ['valve','core','pin'], inStock: true },
  { id: 'emergency-bend-neck',   name: 'Emergency Bend Neck',           description: 'Bent valve neck for difficult-to-access valve positions on trucks', categoryId: 'tyre-repair', subcategory: 'Valve & Inflation', unit: 'No', imageQuery: 'tyre valve bend neck emergency truck', tags: ['valve','bend','neck','emergency'], inStock: true },
  { id: 'hysem-stem-set',        name: 'Hysem Stem Set of 10 pcs',      description: 'Set of 10 Hysem valve stems for tubeless tyre fitment', categoryId: 'tyre-repair', subcategory: 'Valve & Inflation', unit: 'Set', imageQuery: 'hysem valve stem set tubeless tyre', tags: ['hysem','stem','valve','set'], inStock: true },
]
```

- [ ] **Step 4: Create spanners-wrenches.ts**

```typescript
// src/data/products/spanners-wrenches.ts
import type { Product } from '../types'

const DE_SIZES = ['6x7','8x9','10x11','12x13','14x15','16x17','18x19','20x22','21x23','24x27','30x32','36x41']
const RING_SIZES = ['6x7','8x9','10x11','12x13','14x15','16x17','18x19','20x22','21x23','24x27','30x32','36x41']

export const spannersWrenchesProducts: Product[] = [
  { id: 'open-end-spanner-set', name: 'Open End Spanner Set (6×7 to 30×32)', description: 'Set of 11 open-end spanners, 6×7mm to 30×32mm — chrome vanadium steel, Taparia', categoryId: 'spanners-wrenches', subcategory: 'Spanner Sets', unit: 'Set', imageQuery: 'open end spanner set chrome vanadium taparia', tags: ['spanner','set','open end'], brand: 'Taparia', inStock: true },
  { id: 'ring-spanner-set', name: 'Ring Spanner Set (6×7 to 30×32)', description: 'Set of 11 ring/box-end spanners, 6×7mm to 30×32mm — drop-forged chrome vanadium, Taparia', categoryId: 'spanners-wrenches', subcategory: 'Spanner Sets', unit: 'Set', imageQuery: 'ring box end spanner set taparia chrome', tags: ['spanner','set','ring'], brand: 'Taparia', inStock: true },
  ...DE_SIZES.map((size) => ({
    id: `double-end-spanner-${size}`,
    name: `Double End Spanner ${size}mm`,
    description: `Drop-forged double open-end spanner ${size}mm — chrome vanadium, Taparia`,
    categoryId: 'spanners-wrenches',
    subcategory: 'Double End Spanners',
    unit: 'No' as const,
    imageQuery: 'double open end spanner chrome vanadium automotive',
    tags: ['spanner','double end', size],
    brand: 'Taparia',
    specifications: { Size: `${size}mm`, Type: 'Double Open End', Material: 'Chrome Vanadium' },
    inStock: true,
  })),
  ...RING_SIZES.map((size) => ({
    id: `ring-spanner-${size}`,
    name: `Ring Spanner ${size}mm`,
    description: `Drop-forged ring (box-end) spanner ${size}mm — chrome vanadium, Taparia`,
    categoryId: 'spanners-wrenches',
    subcategory: 'Ring Spanners',
    unit: 'No' as const,
    imageQuery: 'ring box end spanner chrome vanadium',
    tags: ['spanner','ring', size],
    brand: 'Taparia',
    specifications: { Size: `${size}mm`, Type: 'Ring / Box End', Material: 'Chrome Vanadium' },
    inStock: true,
  })),
  { id: 'adjustable-spanner',        name: 'Adjustable Spanner',              description: 'Heavy-duty adjustable crescent wrench for variable fastener sizes', categoryId: 'spanners-wrenches', subcategory: 'Adjustable Wrenches', unit: 'No', imageQuery: 'adjustable spanner crescent wrench heavy duty', tags: ['adjustable','spanner','crescent'], brand: 'Taparia', inStock: true },
  { id: 'pipe-wrench-14',             name: 'Pipe Wrench 14"',                  description: '14" pipe wrench for gripping and turning pipes and round stock', categoryId: 'spanners-wrenches', subcategory: 'Pipe Wrenches', unit: 'No', imageQuery: 'pipe wrench 14 inch heavy duty plumbing', tags: ['pipe wrench','14 inch'], inStock: true },
  { id: 'two-way-wheel-spanner',      name: 'Two Way Wheel Spanner 32×33',      description: 'Heavy-duty two-way wheel spanner 32×33mm for truck and HCV wheel nuts', categoryId: 'spanners-wrenches', subcategory: 'Wheel Spanners', unit: 'No', imageQuery: 'wheel nut spanner truck heavy vehicle 32mm', tags: ['wheel spanner','two-way','truck','32x33'], inStock: true },
  { id: 'allen-key-set',              name: 'Allen Key Set',                    description: 'Complete metric hex key (Allen wrench) set, chrome finish — Taparia', categoryId: 'spanners-wrenches', subcategory: 'Hex Keys', unit: 'Set', imageQuery: 'allen key hex wrench set metric chrome', tags: ['allen key','hex','set'], brand: 'Taparia', inStock: true },
]
```

- [ ] **Step 5: Create jacks-lifting.ts**

```typescript
// src/data/products/jacks-lifting.ts
import type { Product } from '../types'

export const jacksLiftingProducts: Product[] = [
  { id: 'hydraulic-jack-12t', name: 'Hydraulic Jack 12 Ton', description: '12-ton hydraulic bottle jack — safety overload valve, sturdy base plate for heavy vehicles', categoryId: 'jacks-lifting', unit: 'No', imageQuery: 'hydraulic bottle jack 12 ton heavy duty garage', tags: ['jack','hydraulic','12 ton','lifting'], specifications: { Capacity: '12 Ton', Type: 'Hydraulic Bottle Jack' }, inStock: true },
  { id: 'hydraulic-jack-15t', name: 'Hydraulic Jack 15 Ton', description: '15-ton hydraulic bottle jack for trucks and industrial applications', categoryId: 'jacks-lifting', unit: 'No', imageQuery: 'hydraulic jack 15 ton truck industrial', tags: ['jack','hydraulic','15 ton'], specifications: { Capacity: '15 Ton', Type: 'Hydraulic Bottle Jack' }, inStock: true },
  { id: 'trolley-jack-3t',    name: 'Trolley Jack 3 Ton',    description: '3-ton hydraulic floor/trolley jack — low profile, rapid lift for cars and SUVs', categoryId: 'jacks-lifting', unit: 'No', imageQuery: 'floor trolley jack 3 ton hydraulic garage', tags: ['jack','trolley','floor jack','3 ton'], specifications: { Capacity: '3 Ton', Type: 'Hydraulic Floor Jack' }, inStock: true },
  { id: 'mechanical-jack-10t', name: 'Mechanical Jack 10 Ton', description: '10-ton mechanical screw jack for sustained heavy lifting', categoryId: 'jacks-lifting', unit: 'No', imageQuery: 'mechanical screw jack 10 ton heavy industrial', tags: ['jack','mechanical','10 ton'], specifications: { Capacity: '10 Ton', Type: 'Mechanical Screw Jack' }, inStock: true },
  { id: 'mechanical-jack-15t', name: 'Mechanical Jack 15 Ton', description: '15-ton mechanical screw jack for industrial and automotive use', categoryId: 'jacks-lifting', unit: 'No', imageQuery: 'mechanical screw jack heavy duty industrial', tags: ['jack','mechanical','15 ton'], specifications: { Capacity: '15 Ton', Type: 'Mechanical Screw Jack' }, inStock: true },
  { id: 'mechanical-jack-20t', name: 'Mechanical Jack 20 Ton', description: '20-ton heavy-duty mechanical screw jack for the largest loads', categoryId: 'jacks-lifting', unit: 'No', imageQuery: 'mechanical screw jack 20 ton heavy industrial', tags: ['jack','mechanical','20 ton'], specifications: { Capacity: '20 Ton', Type: 'Mechanical Screw Jack' }, inStock: true },
  { id: 'trolley-wheel-12',    name: 'Trolley Wheel 12"',     description: '12" heavy-duty workshop trolley wheel for material handling carts', categoryId: 'jacks-lifting', unit: 'No', imageQuery: 'trolley wheel 12 inch industrial workshop', tags: ['trolley','wheel','12 inch'], inStock: true },
  { id: 'trolley-wheel-6',     name: 'Trolley Wheel 6"',      description: '6" trolley wheel for tool carts and light workshop trolleys', categoryId: 'jacks-lifting', unit: 'No', imageQuery: 'trolley wheel 6 inch cart workshop', tags: ['trolley','wheel','6 inch'], inStock: true },
]
```

- [ ] **Step 6: Create remaining 11 product data files**

Follow the same pattern. Here are the key items per file:

`src/data/products/sockets-drives.ts` — Socket Box 1/2" Drive; Heavy Duty Sockets 36/41/46/50/55mm 3/4" Drive; Socket 1/2" Sq Drive 8mm–32mm (individual, 19 sizes); T Bar 1/2" Drive; T Bar 3/4" Drive; L Rod 1/2" Drive 300mm; L Rod 3/4" Drive 500mm; L Rod 1/2" Sq Drive 300mm; L Rod 3/4" Sq Drive 450mm

`src/data/products/pliers-screwdrivers.ts` — Cutting Plier; Nose Plier; Circlip Plier (inner+outer); Screw Driver Small/Medium/Long/Extr Long; Tin Cutter 14"; Long Knife

`src/data/products/pneumatic-air.ts` — Air Filter Cum Regulator 1/2"; Air Hose Pipe 8mm; Air Tool/Pneumatic Tool 22000RPM; Compressor Safety Valve; Quick Coupler; Car Washer 12mm PVC; SS Wire Braided Teflon Hose (500/1000/1500/2000/2500/3000mm); High Pressure Car Washing Hose with End Coupling; Pressure Gauge; 65 PSI Pressure Relief Valve; 95 PSI Pressure Relief Valve; Tyre Pressure Gauge (Wall Mounting)

`src/data/products/grease-lubrication.ts` — Grease Bare Pump 200 Ltr; Grease Gun Pistol; Grease Hose Pipe; Barrel Pump 200 Ltr; Hand Pump Plastic; Fevicol SR 998

`src/data/products/welding.ts` — Welding Cable; Welding Cutting Torch; Welding Goggles; Welding Holder; Welding Hose; Welding Shield

`src/data/products/painting-surface.ts` — Painting Brush 2"/3"/4" (Mahindra); Painting Spray Gun; Painting Mask; Painting Poly Film; Coating Brush; Tyre Paint; Silicon Sealant Black

`src/data/products/fastening-clamping.ts` — Stapler Gun/Gun Tacker; Stapler Pin 23/12; Pop Rivet Gun; Silicon Sealant Gun; C Clamp 3"/4"/6"/8"/10"/12"

`src/data/products/electrical-fans.ts` — Battery Terminals; Delux Spotter Timing Switch; Ceiling Fan; Wall Mounting Fan; Industrial Pedestal Fan; Industrial Wall Mounting Fan; Industrial Exhaust Fan

`src/data/products/safety-protective.ts` — Hand Gloves for TRP; Protective Cloth; Protective Mask; Marking Crayons; Welding Goggles

`src/data/products/sealing-adhesives.ts` — Silicon Sealant Black; U Seal 54"; Polyester Thread Black; Fevicol SR 998

`src/data/products/miscellaneous.ts` — Pillow Block Bearing 207/208/209; Love Joy Coupling Spanner; Love Joy Coupling 110; Tarpaulin 18×30 Feet; Tarpaulin 40×40 Feet

Each entry uses the same `Product` interface from `types.ts` — all fields as shown in Step 3 and 4 above.

- [ ] **Step 7: Create central data index**

```typescript
// src/data/index.ts
import { tyreRepairProducts }      from './products/tyre-repair'
import { spannersWrenchesProducts } from './products/spanners-wrenches'
import { socketsDriverProducts }    from './products/sockets-drives'
import { pliersScewdriverProducts } from './products/pliers-screwdrivers'
import { jacksLiftingProducts }     from './products/jacks-lifting'
import { pneumaticAirProducts }     from './products/pneumatic-air'
import { greaseLubricationProducts }from './products/grease-lubrication'
import { weldingProducts }          from './products/welding'
import { paintingSurfaceProducts }  from './products/painting-surface'
import { fasteningClampingProducts }from './products/fastening-clamping'
import { electricalFansProducts }   from './products/electrical-fans'
import { safetyProtectiveProducts } from './products/safety-protective'
import { sealingAdhesivesProducts } from './products/sealing-adhesives'
import { miscellaneousProducts }    from './products/miscellaneous'
import { categories }               from './categories'
import type { Product, Category }   from './types'

export const allProducts: Product[] = [
  ...tyreRepairProducts, ...spannersWrenchesProducts, ...socketsDriverProducts,
  ...pliersScewdriverProducts, ...jacksLiftingProducts, ...pneumaticAirProducts,
  ...greaseLubricationProducts, ...weldingProducts, ...paintingSurfaceProducts,
  ...fasteningClampingProducts, ...electricalFansProducts, ...safetyProtectiveProducts,
  ...sealingAdhesivesProducts, ...miscellaneousProducts,
]

export const categoriesWithCounts: Category[] = categories.map((cat) => ({
  ...cat,
  productCount: allProducts.filter((p) => p.categoryId === cat.id).length,
}))

export const getProductById      = (id: string)           => allProducts.find((p) => p.id === id)
export const getProductsByCategory = (catId: string)      => allProducts.filter((p) => p.categoryId === catId)
export const searchProducts      = (query: string) => {
  const q = query.toLowerCase()
  return allProducts.filter(
    (p) => p.name.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))
  )
}

export { categories }
export type { Product, Category }
```

- [ ] **Step 8: Verify type-checking passes**

```bash
npx tsc --noEmit
# Expected: no errors
```

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: complete 198-product data layer across 14 categories"
```

---

## Phase 2 — Layout, Navigation & Quote Cart Context

### Task 2.1: Quote Cart Context (needed by Header)

**Files:**
- Create: `src/context/QuoteCartContext.tsx`

- [ ] **Step 1: Create cart context with localStorage hydration**

```tsx
// src/context/QuoteCartContext.tsx
'use client'
import { createContext, useContext, useReducer, useEffect } from 'react'
import type { Product } from '@/data/types'

export interface QuoteCartItem { product: Product; quantity: number }

type State = { items: QuoteCartItem[] }
type Action =
  | { type: 'ADD';        product: Product }
  | { type: 'REMOVE';     productId: string }
  | { type: 'UPDATE_QTY'; productId: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE';    items: QuoteCartItem[] }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD': {
      const exists = state.items.find((i) => i.product.id === action.product.id)
      if (exists) return { items: state.items.map((i) => i.product.id === action.product.id ? { ...i, quantity: i.quantity + 1 } : i) }
      return { items: [...state.items, { product: action.product, quantity: 1 }] }
    }
    case 'REMOVE':     return { items: state.items.filter((i) => i.product.id !== action.productId) }
    case 'UPDATE_QTY': {
      if (action.quantity <= 0) return { items: state.items.filter((i) => i.product.id !== action.productId) }
      return { items: state.items.map((i) => i.product.id === action.productId ? { ...i, quantity: action.quantity } : i) }
    }
    case 'CLEAR':   return { items: [] }
    case 'HYDRATE': return { items: action.items }
    default: return state
  }
}

const Ctx = createContext<{
  items:          QuoteCartItem[]
  addItem:        (p: Product) => void
  removeItem:     (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart:      () => void
  isInCart:       (id: string) => boolean
} | null>(null)

export function QuoteCartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] })

  useEffect(() => {
    const saved = localStorage.getItem('sv-quote-cart')
    if (saved) { try { dispatch({ type: 'HYDRATE', items: JSON.parse(saved) }) } catch {} }
  }, [])

  useEffect(() => { localStorage.setItem('sv-quote-cart', JSON.stringify(state.items)) }, [state.items])

  return (
    <Ctx.Provider value={{
      items:          state.items,
      addItem:        (p)       => dispatch({ type: 'ADD', product: p }),
      removeItem:     (id)      => dispatch({ type: 'REMOVE', productId: id }),
      updateQuantity: (id, qty) => dispatch({ type: 'UPDATE_QTY', productId: id, quantity: qty }),
      clearCart:      ()        => dispatch({ type: 'CLEAR' }),
      isInCart:       (id)      => state.items.some((i) => i.product.id === id),
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useQuoteCart() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useQuoteCart must be inside QuoteCartProvider')
  return ctx
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: quote cart context — add/remove/update qty, localStorage persistence"
```

---

### Task 2.2: Header, Footer & Root Layout

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Footer.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create Header with sticky nav and cart badge**

```tsx
// src/components/layout/Header.tsx
'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ShoppingCart, Search, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BRAND } from '@/lib/brand'
import { useQuoteCart } from '@/context/QuoteCartContext'
import { categoriesWithCounts } from '@/data'

export function Header() {
  const [open, setOpen] = useState(false)
  const { items } = useQuoteCart()

  return (
    <header className="sticky top-0 z-50 bg-brand-dark text-white shadow-lg">
      {/* Top bar */}
      <div className="bg-brand-red py-1 px-4 text-xs flex justify-between">
        <span>Authorized Distributor: ELGI · Unipatch Rubber · Taparia · Mysore Tubes</span>
        <a href={`tel:${BRAND.phone}`} className="flex items-center gap-1 hover:underline">
          <Phone size={11} /> {BRAND.phone}
        </a>
      </div>
      {/* Main row */}
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-bold">
          <span className="text-brand-red">SV</span> Sales Corporation
        </Link>
        <div className="hidden lg:flex items-center gap-6 text-sm">
          <Link href="/products" className="hover:text-brand-gold">Products</Link>
          <Link href="/about"    className="hover:text-brand-gold">About</Link>
          <Link href="/contact"  className="hover:text-brand-gold">Contact</Link>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="text-white hover:text-brand-gold">
            <Link href="/search"><Search size={19} /></Link>
          </Button>
          <Button asChild variant="outline" className="border-brand-red text-white hover:bg-brand-red relative">
            <Link href="/quote">
              <ShoppingCart size={17} className="mr-2" />
              Quote Cart
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-gold text-brand-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden text-white" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </Button>
        </div>
      </nav>
      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden bg-brand-steel px-4 pb-4 text-sm">
          <Link href="/products" className="block py-2 hover:text-brand-gold" onClick={() => setOpen(false)}>All Products</Link>
          {categoriesWithCounts.map((c) => (
            <Link key={c.id} href={`/products/${c.id}`} className="block py-1 pl-4 text-brand-silver hover:text-white" onClick={() => setOpen(false)}>
              {c.name}
            </Link>
          ))}
          <Link href="/about"   className="block py-2 hover:text-brand-gold" onClick={() => setOpen(false)}>About</Link>
          <Link href="/contact" className="block py-2 hover:text-brand-gold" onClick={() => setOpen(false)}>Contact</Link>
        </div>
      )}
    </header>
  )
}
```

- [ ] **Step 2: Create Footer**

```tsx
// src/components/layout/Footer.tsx
import Link from 'next/link'
import { Phone, MapPin } from 'lucide-react'
import { BRAND } from '@/lib/brand'
import { categoriesWithCounts } from '@/data'

export function Footer() {
  return (
    <footer className="bg-brand-dark text-brand-silver mt-16">
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-display text-xl font-bold text-white mb-3">
            <span className="text-brand-red">SV</span> Sales Corporation
          </h3>
          <p className="text-sm mb-4">{BRAND.tagline}</p>
          <div className="flex flex-wrap gap-2">
            {BRAND.authorizedFor.map((b) => (
              <span key={b} className="text-xs border border-brand-silver/40 px-2 py-0.5 rounded">{b}</span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Categories</h4>
          <ul className="space-y-1 text-sm">
            {categoriesWithCounts.slice(0, 7).map((c) => (
              <li key={c.id}><Link href={`/products/${c.id}`} className="hover:text-white">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3 mt-6 md:mt-0">More</h4>
          <ul className="space-y-1 text-sm">
            {categoriesWithCounts.slice(7).map((c) => (
              <li key={c.id}><Link href={`/products/${c.id}`} className="hover:text-white">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Contact</h4>
          <address className="not-italic space-y-2 text-sm">
            <div className="flex gap-2 items-start"><MapPin size={14} className="mt-0.5 shrink-0" />{BRAND.address}</div>
            <div className="flex gap-2"><Phone size={14} /><a href={`tel:${BRAND.phone}`} className="hover:text-white">{BRAND.phone}</a></div>
            <div className="flex gap-2"><Phone size={14} /><a href={`tel:${BRAND.mobile}`} className="hover:text-white">{BRAND.mobile}</a></div>
          </address>
          <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 bg-green-600 text-white text-sm px-4 py-2 rounded-full hover:bg-green-700">
            💬 WhatsApp Us
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 text-center py-4 text-xs text-gray-500">
        © {new Date().getFullYear()} S V Sales Corporation, Mysore. All rights reserved.
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Update root layout**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header }           from '@/components/layout/Header'
import { Footer }           from '@/components/layout/Footer'
import { QuoteCartProvider } from '@/context/QuoteCartContext'
import { Toaster }          from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'S V Sales Corporation — Industrial & Automotive Tools, Mysore',
  description: 'Authorized dealer of industrial garage hand tools, tyre retreading tools and accessories in Mysore. ELGI, Unipatch, Taparia, Mysore Tubes.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QuoteCartProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
        </QuoteCartProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Verify dev server starts**

```bash
npm run dev
# Expected: Ready on http://localhost:3000
# Open browser, verify header and footer render with no errors
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: header (sticky, mobile drawer, cart badge), footer, root layout"
```

---

## Phase 3 — Home Page (3D Hero + Category Grid)

### Task 3.1: Hero, Category Grid & Brand Badges

**Files:**
- Create: `src/components/home/HeroSection.tsx`
- Create: `src/components/home/CategoryGrid.tsx`
- Create: `src/components/home/BrandBadges.tsx`
- Create: `src/app/page.tsx`

- [ ] **Step 1: Create hero section with Spline 3D background**

```tsx
// src/components/home/HeroSection.tsx
'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Package, ShieldCheck, Award } from 'lucide-react'

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-br from-brand-steel to-brand-dark" />,
})

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] bg-brand-dark flex items-center overflow-hidden">
      {/* Spline 3D scene — rotating industrial tools backdrop */}
      {/* Replace the scene URL with your own Spline scene. Free scenes at spline.design */}
      <div className="absolute inset-0 opacity-35 pointer-events-none">
        <Spline scene="https://prod.spline.design/6Wq1Q7YO2-xomt4f/scene.splinecode" />
      </div>
      {/* Dark gradient so text remains readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/85 to-transparent" />

      <div className="relative container mx-auto px-4 py-24">
        <div className="max-w-2xl">
          <span className="inline-block bg-brand-red text-white text-sm font-medium px-3 py-1 rounded-full mb-5">
            Mysore's Trusted Industrial Tool Supplier
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            S V Sales<br /><span className="text-brand-red">Corporation</span>
          </h1>
          <p className="text-brand-silver text-lg mb-8 max-w-xl leading-relaxed">
            Wholesale & retail dealer for industrial garage hand tools, tyre retreading accessories, and automotive equipment. 198+ products. 4 authorized brands.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-brand-red hover:bg-red-700 text-white font-semibold">
              <Link href="/products">Browse Catalogue <ArrowRight className="ml-2" size={18} /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/50 text-white hover:bg-white/10">
              <Link href="/quote">Request Quotation</Link>
            </Button>
          </div>
          {/* Stats row */}
          <div className="flex gap-10 mt-14">
            {[
              { icon: Package,     value: '198+', label: 'Products'        },
              { icon: ShieldCheck, value: '4',    label: 'Authorized Brands'},
              { icon: Award,       value: '25+',  label: 'Years Experience' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label}>
                <Icon className="text-brand-red mb-1" size={20} />
                <div className="text-white font-bold text-2xl font-display">{value}</div>
                <div className="text-brand-silver text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create Category Grid**

```tsx
// src/components/home/CategoryGrid.tsx
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { categoriesWithCounts } from '@/data'

export function CategoryGrid() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="font-display text-4xl font-bold text-brand-dark mb-3">Product Categories</h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          Complete range of industrial and automotive tools — organized for fast browsing
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {categoriesWithCounts.map((cat) => {
          const Icon = (Icons as Record<string, React.FC<{ size?: number; className?: string }>>)[cat.icon] ?? Icons.Box
          return (
            <Link key={cat.id} href={`/products/${cat.id}`}
              className="group bg-white border border-gray-100 rounded-xl p-5 text-center hover:border-brand-red hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-red/20 transition-colors">
                <Icon size={22} className="text-brand-red" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1 leading-tight">{cat.name}</h3>
              <p className="text-xs text-gray-400">{cat.productCount} products</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create Brand Badges strip**

```tsx
// src/components/home/BrandBadges.tsx
import { ShieldCheck } from 'lucide-react'
import { BRAND } from '@/lib/brand'

export function BrandBadges() {
  return (
    <section className="bg-gray-50 py-8 border-y border-gray-100">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-center gap-4">
        <span className="flex items-center gap-2 text-gray-500 text-sm font-medium">
          <ShieldCheck className="text-brand-red" size={18} /> Authorized Distributor for:
        </span>
        {BRAND.authorizedFor.map((b) => (
          <div key={b} className="bg-white border border-gray-200 shadow-sm rounded-lg px-6 py-3 font-bold text-brand-dark text-sm">
            {b}
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Assemble home page**

```tsx
// src/app/page.tsx
import { HeroSection }   from '@/components/home/HeroSection'
import { BrandBadges }   from '@/components/home/BrandBadges'
import { CategoryGrid }  from '@/components/home/CategoryGrid'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandBadges />
      <CategoryGrid />
    </>
  )
}
```

- [ ] **Step 5: Check in browser at localhost:3000 — hero, badges, category grid should render**

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: home page — Spline 3D hero, brand badges, category grid"
```

---

## Phase 4 — Product Listing, Category & Detail Pages

### Task 4.1: ProductCard Component

**Files:**
- Create: `src/components/products/ProductCard.tsx`

- [ ] **Step 1: Create ProductCard with Add-to-Quote button**

```tsx
// src/components/products/ProductCard.tsx
'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Check, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge }  from '@/components/ui/badge'
import { useQuoteCart } from '@/context/QuoteCartContext'
import type { Product } from '@/data/types'

function imageUrl(query: string) {
  // Unsplash Source API — free, no key needed (rate-limited, replace with Pexels in Phase 6)
  return `https://source.unsplash.com/400x300/?${encodeURIComponent(query)}`
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem, isInCart } = useQuoteCart()
  const inCart = isInCart(product.id)

  return (
    <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-brand-red/30 transition-all">
      <div className="relative h-44 bg-gray-50 overflow-hidden">
        <Image src={imageUrl(product.imageQuery)} alt={product.name} fill
          className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width:640px) 50vw, 25vw" />
        {product.sketchfabModelId && (
          <Badge className="absolute top-2 right-2 bg-brand-dark/80 text-white text-xs">3D</Badge>
        )}
      </div>
      <div className="p-4">
        {product.subcategory && <p className="text-xs text-brand-red font-medium mb-1">{product.subcategory}</p>}
        <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild className="flex-1 text-xs">
            <Link href={`/products/${product.categoryId}/${product.id}`}>
              <Eye size={13} className="mr-1" /> Details
            </Link>
          </Button>
          <Button size="sm" onClick={() => addItem(product)}
            className={`flex-1 text-xs text-white ${inCart ? 'bg-green-600 hover:bg-green-700' : 'bg-brand-red hover:bg-red-700'}`}>
            {inCart
              ? <><Check size={13} className="mr-1" /> Added</>
              : <><ShoppingCart size={13} className="mr-1" /> Quote</>}
          </Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: ProductCard with 3D badge and add-to-quote button"
```

---

### Task 4.2: Products & Category Pages

**Files:**
- Create: `src/app/products/page.tsx`
- Create: `src/app/products/[categoryId]/page.tsx`
- Create: `src/components/products/ProductGrid.tsx`

- [ ] **Step 1: Create ProductGrid**

```tsx
// src/components/products/ProductGrid.tsx
import { ProductCard } from './ProductCard'
import type { Product } from '@/data/types'

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) return <p className="text-gray-500 py-10 text-center">No products found.</p>
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
```

- [ ] **Step 2: Create All Products page (shows category grid + all products)**

```tsx
// src/app/products/page.tsx
import { allProducts, categoriesWithCounts } from '@/data'
import { ProductGrid } from '@/components/products/ProductGrid'
import Link from 'next/link'

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-display text-4xl font-bold mb-2">All Products</h1>
      <p className="text-gray-500 mb-8">{allProducts.length} products across {categoriesWithCounts.length} categories</p>
      {categoriesWithCounts.map((cat) => {
        const items = allProducts.filter((p) => p.categoryId === cat.id)
        if (items.length === 0) return null
        return (
          <section key={cat.id} className="mb-14">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-bold">{cat.name}</h2>
              <Link href={`/products/${cat.id}`} className="text-sm text-brand-red hover:underline">
                View all {cat.productCount} →
              </Link>
            </div>
            <ProductGrid products={items.slice(0, 8)} />
          </section>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Create Category page with full listing**

```tsx
// src/app/products/[categoryId]/page.tsx
import { notFound } from 'next/navigation'
import { categoriesWithCounts, getProductsByCategory } from '@/data'
import { ProductGrid } from '@/components/products/ProductGrid'
import Link from 'next/link'
import * as Icons from 'lucide-react'

export async function generateStaticParams() {
  return categoriesWithCounts.map((c) => ({ categoryId: c.id }))
}

export default function CategoryPage({ params }: { params: { categoryId: string } }) {
  const category = categoriesWithCounts.find((c) => c.id === params.categoryId)
  if (!category) notFound()
  const products = getProductsByCategory(params.categoryId)
  const Icon = (Icons as Record<string, React.FC<{ size?: number; className?: string }>>)[category.icon] ?? Icons.Box

  return (
    <>
      <div className="bg-brand-dark text-white py-12">
        <div className="container mx-auto px-4 flex items-center gap-5">
          <div className="w-16 h-16 bg-brand-red/20 rounded-full flex items-center justify-center">
            <Icon size={30} className="text-brand-red" />
          </div>
          <div>
            <nav className="text-xs text-brand-silver mb-1">
              <Link href="/" className="hover:text-white">Home</Link> › <Link href="/products" className="hover:text-white">Products</Link> › {category.name}
            </nav>
            <h1 className="font-display text-3xl font-bold">{category.name}</h1>
            <p className="text-brand-silver text-sm mt-1">{category.description}</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-10">
        <p className="text-gray-500 text-sm mb-6">{products.length} products</p>
        <ProductGrid products={products} />
      </div>
    </>
  )
}
```

- [ ] **Step 4: Verify in browser — browse /products and /products/tyre-repair**

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: products listing and category pages with full product grids"
```

---

### Task 4.3: Product Detail Page with 3D Viewer

**Files:**
- Create: `src/components/product/ProductViewer3D.tsx`
- Create: `src/components/product/ProductDetailClient.tsx`
- Create: `src/app/products/[categoryId]/[productId]/page.tsx`

- [ ] **Step 1: Create 3D viewer (Sketchfab iframe + Google Model Viewer fallback)**

```tsx
// src/components/product/ProductViewer3D.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Box, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  sketchfabModelId?: string
  modelViewerSrc?: string
  productName: string
  imageUrl: string
}

export function ProductViewer3D({ sketchfabModelId, productName, imageUrl }: Props) {
  const has3D = Boolean(sketchfabModelId)
  const [mode, setMode] = useState<'photo' | '3d'>('photo')

  return (
    <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square">
      {has3D && (
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <Button size="sm" variant={mode === 'photo' ? 'default' : 'outline'} className="text-xs" onClick={() => setMode('photo')}>
            <ImageIcon size={13} className="mr-1" /> Photo
          </Button>
          <Button size="sm" onClick={() => setMode('3d')}
            className={`text-xs ${mode === '3d' ? 'bg-brand-dark text-white' : 'border'}`}>
            <Box size={13} className="mr-1" /> 3D View
          </Button>
        </div>
      )}

      {mode === 'photo' || !has3D ? (
        <Image src={imageUrl} alt={productName} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
      ) : (
        <iframe
          title={`3D model — ${productName}`}
          src={`https://sketchfab.com/models/${sketchfabModelId}/embed?autostart=1&ui_hint=0`}
          className="w-full h-full"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create ProductDetailClient**

```tsx
// src/components/product/ProductDetailClient.tsx
'use client'
import Link from 'next/link'
import { ChevronRight, ShoppingCart, Check, Package, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge }  from '@/components/ui/badge'
import { ProductViewer3D } from './ProductViewer3D'
import { useQuoteCart }    from '@/context/QuoteCartContext'
import { useToast }        from '@/components/ui/use-toast'
import type { Product, Category } from '@/data/types'

function imageUrl(query: string) {
  return `https://source.unsplash.com/600x600/?${encodeURIComponent(query)}`
}

export function ProductDetailClient({ product, category }: { product: Product; category: Category }) {
  const { addItem, isInCart } = useQuoteCart()
  const { toast } = useToast()
  const inCart = isInCart(product.id)

  function handleAdd() {
    addItem(product)
    toast({ title: 'Added to Quote Cart', description: `${product.name} — visit Quote Cart to submit your request.` })
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-8 flex-wrap">
        <Link href="/" className="hover:text-brand-red">Home</Link><ChevronRight size={14} />
        <Link href="/products" className="hover:text-brand-red">Products</Link><ChevronRight size={14} />
        <Link href={`/products/${category.id}`} className="hover:text-brand-red">{category.name}</Link><ChevronRight size={14} />
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <ProductViewer3D
          sketchfabModelId={product.sketchfabModelId}
          productName={product.name}
          imageUrl={imageUrl(product.imageQuery)}
        />

        <div>
          {product.subcategory && (
            <Badge variant="outline" className="text-brand-red border-brand-red/40 mb-3">{product.subcategory}</Badge>
          )}
          <h1 className="font-display text-3xl font-bold text-brand-dark mb-4 leading-tight">{product.name}</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-4 mb-6 text-sm">
            <span className="flex items-center gap-1.5 text-gray-500">
              <Package size={15} /> Unit: <strong>{product.unit}</strong>
            </span>
            {product.brand && <Badge className="bg-brand-dark text-white">{product.brand}</Badge>}
          </div>

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-sm mb-3 text-gray-700">Specifications</h3>
              <dl className="grid grid-cols-2 gap-y-2">
                {Object.entries(product.specifications).map(([k, v]) => (
                  <div key={k}><dt className="text-xs text-gray-400">{k}</dt><dd className="text-sm font-medium">{v}</dd></div>
                ))}
              </dl>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
            <strong>Price on Request</strong> — Add to cart, set quantity, and submit your quote request. We respond within 24 hours.
          </div>

          <div className="flex gap-3">
            <Button size="lg" onClick={handleAdd}
              className={`flex-1 text-white ${inCart ? 'bg-green-600 hover:bg-green-700' : 'bg-brand-red hover:bg-red-700'}`}>
              {inCart ? <><Check className="mr-2" size={18} /> In Quote Cart</> : <><ShoppingCart className="mr-2" size={18} /> Add to Quote Cart</>}
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/quote">View Cart</Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            {product.tags.map((t) => (
              <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create Product Detail page route**

```tsx
// src/app/products/[categoryId]/[productId]/page.tsx
import { notFound } from 'next/navigation'
import { allProducts, categoriesWithCounts, getProductById } from '@/data'
import { ProductDetailClient } from '@/components/product/ProductDetailClient'

export async function generateStaticParams() {
  return allProducts.map((p) => ({ categoryId: p.categoryId, productId: p.id }))
}

export default function ProductDetailPage({ params }: { params: { categoryId: string; productId: string } }) {
  const product  = getProductById(params.productId)
  if (!product || product.categoryId !== params.categoryId) notFound()
  const category = categoriesWithCounts.find((c) => c.id === params.categoryId)!
  return <ProductDetailClient product={product} category={category} />
}
```

- [ ] **Step 4: Verify in browser — click through to a product detail and toggle 3D/Photo**

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: product detail page with Sketchfab 3D iframe viewer toggle"
```

---

## Phase 5 — Quote Request System

### Task 5.1: Quote Cart Page & Email API

**Files:**
- Create: `src/app/quote/page.tsx`
- Create: `src/components/quote/QuotePageClient.tsx`
- Create: `src/app/api/quote/route.ts`
- Create: `.env.local`

- [ ] **Step 1: Create Quote page shell**

```tsx
// src/app/quote/page.tsx
import { QuotePageClient } from '@/components/quote/QuotePageClient'
export default function QuotePage() { return <QuotePageClient /> }
```

- [ ] **Step 2: Create QuotePageClient with 2-step flow (cart review → contact form)**

```tsx
// src/components/quote/QuotePageClient.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Trash2, Plus, Minus, ArrowLeft, Send, ArrowRight } from 'lucide-react'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useQuoteCart } from '@/context/QuoteCartContext'
import { useToast }     from '@/components/ui/use-toast'

interface FormData { name: string; company: string; email: string; phone: string; address: string; notes: string }

export function QuotePageClient() {
  const { items, removeItem, updateQuantity, clearCart } = useQuoteCart()
  const { toast } = useToast()
  const [step,       setStep]       = useState<'cart'|'form'|'success'>('cart')
  const [submitting, setSubmitting] = useState(false)
  const [form,       setForm]       = useState<FormData>({ name:'', company:'', email:'', phone:'', address:'', notes:'' })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items }),
      })
      if (!res.ok) throw new Error()
      clearCart()
      setStep('success')
    } catch {
      toast({ title: 'Submission failed', description: 'Please call or WhatsApp us directly.', variant: 'destructive' })
    }
    setSubmitting(false)
  }

  if (step === 'success') return (
    <div className="container mx-auto px-4 py-20 text-center max-w-md">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Send className="text-green-600" size={34} />
      </div>
      <h1 className="font-display text-3xl font-bold mb-3">Quote Request Sent!</h1>
      <p className="text-gray-500 mb-6">We'll respond within 24 business hours with pricing and availability.</p>
      <Button asChild className="bg-brand-red hover:bg-red-700 text-white">
        <Link href="/products">Continue Browsing</Link>
      </Button>
    </div>
  )

  if (items.length === 0) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold mb-3">Your Quote Cart is Empty</h1>
      <p className="text-gray-500 mb-6">Browse products and add items to get started.</p>
      <Button asChild className="bg-brand-red hover:bg-red-700 text-white"><Link href="/products">Browse Products</Link></Button>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Link href="/products" className="flex items-center gap-2 text-sm text-gray-400 hover:text-brand-red mb-6">
        <ArrowLeft size={15} /> Continue Shopping
      </Link>
      <h1 className="font-display text-3xl font-bold mb-2">{step === 'cart' ? 'Review Quote Cart' : 'Your Details'}</h1>
      <p className="text-gray-400 text-sm mb-8">{step === 'cart' ? `${items.length} item${items.length > 1 ? 's' : ''} selected` : 'We need a few details to prepare your quote'}</p>

      {step === 'cart' ? (
        <>
          <div className="space-y-3 mb-8">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-4 bg-white border rounded-xl p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-gray-400">Unit: {product.unit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(product.id, quantity - 1)}><Minus size={11} /></Button>
                  <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(product.id, quantity + 1)}><Plus size={11} /></Button>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => removeItem(product.id)}>
                  <Trash2 size={13} />
                </Button>
              </div>
            ))}
          </div>
          <Button size="lg" onClick={() => setStep('form')} className="bg-brand-red hover:bg-red-700 text-white">
            Proceed <ArrowRight size={16} className="ml-2" />
          </Button>
        </>
      ) : (
        <form onSubmit={submit} className="space-y-4 max-w-lg">
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="name">Full Name *</Label><Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label htmlFor="company">Company / Workshop</Label><Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
          </div>
          <div><Label htmlFor="email">Email *</Label><Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><Label htmlFor="phone">Phone / WhatsApp *</Label><Input id="phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label htmlFor="address">Delivery Address</Label><Textarea id="address" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div><Label htmlFor="notes">Notes</Label><Textarea id="notes" rows={3} placeholder="Delivery timeline, specific brand requirements, etc." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setStep('cart')}>Back</Button>
            <Button type="submit" disabled={submitting} className="flex-1 bg-brand-red hover:bg-red-700 text-white">
              {submitting ? 'Submitting…' : 'Submit Quote Request'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create email API route with Resend**

```typescript
// src/app/api/quote/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { name, company, email, phone, address, notes, items } = await req.json()

  const rows = (items as Array<{ product: { name: string; unit: string }; quantity: number }>)
    .map((i) => `<tr><td style="padding:6px 10px;border:1px solid #eee">${i.product.name}</td><td style="padding:6px 10px;border:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:6px 10px;border:1px solid #eee">${i.product.unit}</td></tr>`)
    .join('')

  const html = `
    <h2 style="color:#C0392B">New Quote Request — S V Sales Corporation</h2>
    <p><b>Name:</b> ${name}</p>
    <p><b>Company:</b> ${company || '—'}</p>
    <p><b>Email:</b> <a href="mailto:${email}">${email}</a></p>
    <p><b>Phone:</b> ${phone}</p>
    <p><b>Address:</b> ${address || '—'}</p>
    <h3>Requested Items</h3>
    <table style="border-collapse:collapse;width:100%">
      <thead><tr style="background:#f5f5f5"><th style="padding:6px 10px;border:1px solid #eee;text-align:left">Product</th><th style="padding:6px 10px;border:1px solid #eee">Qty</th><th style="padding:6px 10px;border:1px solid #eee">Unit</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p><b>Notes:</b> ${notes || '—'}</p>
  `

  try {
    await resend.emails.send({
      from:    'quotes@svsalescorporation.com',
      to:      ['info@svsalescorporation.com'],
      replyTo: email,
      subject: `Quote Request from ${name}${company ? ` — ${company}` : ''}`,
      html,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'send failed' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Create .env.local (do not commit)**

```
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_PEXELS_API_KEY=xxxxxxxxxxxxxxxxxx
```

Add `.env.local` to `.gitignore` if not already present.

- [ ] **Step 5: Test full quote flow in browser**

1. Add 3 products to cart from different category pages
2. Go to /quote
3. Adjust quantities, remove one item
4. Proceed → fill form → Submit
5. Expected: "Quote Request Sent!" screen appears

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: 2-step quote cart (review + contact form) and Resend email API route"
```

---

## Phase 6 — Search, About & Contact Pages

### Task 6.1: Search Page

**Files:**
- Create: `src/app/search/page.tsx`

- [ ] **Step 1: Create client-side search with debounce**

```tsx
// src/app/search/page.tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { searchProducts } from '@/data'
import { ProductGrid }   from '@/components/products/ProductGrid'
import type { Product }  from '@/data/types'

export default function SearchPage() {
  const [q,       setQ]       = useState('')
  const [results, setResults] = useState<Product[]>([])
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    clearTimeout(timer.current)
    if (q.length < 2) { setResults([]); return }
    timer.current = setTimeout(() => setResults(searchProducts(q)), 250)
    return () => clearTimeout(timer.current)
  }, [q])

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-6">Search Products</h1>
      <div className="relative max-w-xl mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <Input autoFocus placeholder="Search spanners, jacks, tyre patches…" className="pl-10 text-base"
          value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {q.length >= 2 && <p className="text-sm text-gray-400 mb-4">{results.length} result{results.length !== 1 ? 's' : ''} for "{q}"</p>}
      <ProductGrid products={results} />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: debounced client-side search across all 198 products"
```

---

### Task 6.2: About & Contact Pages

**Files:**
- Create: `src/app/about/page.tsx`
- Create: `src/app/contact/page.tsx`

- [ ] **Step 1: Create About page**

```tsx
// src/app/about/page.tsx
import { BRAND } from '@/lib/brand'
import { ShieldCheck, Package, MapPin, Award } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="font-display text-5xl font-bold text-brand-dark mb-4">About Us</h1>
      <p className="text-xl text-gray-500 mb-12 max-w-2xl">
        S V Sales Corporation is Mysore's trusted wholesale and retail supplier for industrial hand tools, tyre retreading accessories, and automotive equipment.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-16">
        {[
          { icon: Package,     value: '198+', label: 'Products in Catalogue' },
          { icon: ShieldCheck, value: '4',    label: 'Authorized Brands' },
          { icon: MapPin,      value: 'Mysore', label: 'Based in Karnataka' },
          { icon: Award,       value: '25+',  label: 'Years of Experience' },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="text-center bg-gray-50 rounded-xl p-6">
            <Icon className="text-brand-red mx-auto mb-3" size={26} />
            <div className="font-display font-bold text-2xl text-brand-dark">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-2xl font-bold mb-5">Authorized Distributor For</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
        {BRAND.authorizedFor.map((b) => (
          <div key={b} className="bg-white border-2 border-gray-100 rounded-xl p-6 text-center font-bold text-brand-dark hover:border-brand-red transition-colors cursor-default">
            {b}
          </div>
        ))}
      </div>

      <h2 className="font-display text-2xl font-bold mb-3">Our Location</h2>
      <address className="not-italic text-gray-500 mb-5">{BRAND.address}</address>
      {/* Replace pb parameter with actual coordinates of SBIIM Layout, Mysore */}
      <iframe
        title="S V Sales Corporation — Mysore"
        src="https://maps.google.com/maps?q=SBIIM+Layout+Srinivaspura+Mysore&output=embed"
        className="w-full h-64 rounded-xl border"
        loading="lazy"
        allowFullScreen
      />
    </div>
  )
}
```

- [ ] **Step 2: Create Contact page**

```tsx
// src/app/contact/page.tsx
import { Phone, MapPin, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BRAND }  from '@/lib/brand'

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <h1 className="font-display text-5xl font-bold text-brand-dark mb-4">Contact Us</h1>
      <p className="text-gray-500 mb-10">Reach out for quotes, bulk orders, or product enquiries. We're available Monday–Saturday, 9 AM – 6 PM.</p>

      <div className="space-y-5 mb-10">
        <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-5">
          <Phone className="text-brand-red mt-0.5 shrink-0" size={22} />
          <div>
            <p className="font-semibold mb-1">Call or WhatsApp</p>
            <a href={`tel:${BRAND.phone}`}  className="block text-brand-red hover:underline">{BRAND.phone}</a>
            <a href={`tel:${BRAND.mobile}`} className="block text-brand-red hover:underline">{BRAND.mobile}</a>
          </div>
        </div>
        <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-5">
          <MapPin className="text-brand-red mt-0.5 shrink-0" size={22} />
          <div>
            <p className="font-semibold mb-1">Visit Us</p>
            <p className="text-gray-600 text-sm">{BRAND.address}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button asChild size="lg" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
          <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2" size={18} /> WhatsApp
          </a>
        </Button>
        <Button asChild size="lg" variant="outline" className="flex-1">
          <a href={`tel:${BRAND.mobile}`}><Phone className="mr-2" size={18} /> Call Now</a>
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: about page (authorized brands, map) and contact page (WhatsApp + call)"
```

---

## Phase 7 — Sketchfab 3D Model Mapping & Pexels Images

### Task 7.1: Sketchfab 3D Model IDs

**Files:**
- Create: `src/lib/sketchfab-models.ts`
- Modify: Selected product files to add `sketchfabModelId`

- [ ] **Step 1: Research and map Sketchfab public model UIDs**

Go to [sketchfab.com/search](https://sketchfab.com/search) and search for each tool type. Pick a publicly embedded, freely viewable model. Copy the model UID from the URL: `sketchfab.com/3d-models/<name>-<UID>`.

```typescript
// src/lib/sketchfab-models.ts
// Manually verified public Sketchfab model UIDs — check each URL is still live
// Format: sketchfab.com/3d-models/<slug>-<UID>
export const SKETCHFAB_MODELS: Record<string, string> = {
  // Research and fill in real UIDs from sketchfab.com/search for each tool type:
  'hydraulic-floor-jack':  'REPLACE_WITH_REAL_UID',
  'socket-wrench-set':     'REPLACE_WITH_REAL_UID',
  'open-end-spanner':      'REPLACE_WITH_REAL_UID',
  'grease-gun':            'REPLACE_WITH_REAL_UID',
  'welding-torch':         'REPLACE_WITH_REAL_UID',
  'spray-paint-gun':       'REPLACE_WITH_REAL_UID',
  'c-clamp':               'REPLACE_WITH_REAL_UID',
  'trolley-jack':          'REPLACE_WITH_REAL_UID',
}
```

- [ ] **Step 2: Update product entries for the ~10 products that have 3D models**

In `src/data/products/jacks-lifting.ts`, add to `hydraulic-jack-12t`:
```typescript
sketchfabModelId: SKETCHFAB_MODELS['hydraulic-floor-jack'],
```

Apply the same pattern to: `trolley-jack-3t` (`trolley-jack`), `open-end-spanner-set` (`open-end-spanner`), `ring-spanner-set` (`socket-wrench-set`), `grease-gun-pistol` (`grease-gun`), `welding-cutting-torch` (`welding-torch`), `painting-spray-gun` (`spray-paint-gun`).

- [ ] **Step 3: Verify the 3D viewer works on one product detail page**

Navigate to `/products/jacks-lifting/hydraulic-jack-12t`. Click "3D View". The Sketchfab iframe should load and be interactive.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: wire Sketchfab 3D model IDs into key product entries"
```

---

### Task 7.2: Replace Unsplash with Pexels API Images

**Files:**
- Create: `src/lib/images.ts`
- Modify: `src/components/products/ProductCard.tsx`
- Modify: `src/components/product/ProductDetailClient.tsx`

- [ ] **Step 1: Create Pexels image fetcher**

```typescript
// src/lib/images.ts
const KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY

interface Photo { src: { medium: string; large: string } }

const cache = new Map<string, string>()
const FALLBACK = 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80'

export async function fetchPexelsImage(query: string): Promise<string> {
  if (cache.has(query)) return cache.get(query)!
  if (!KEY) return FALLBACK
  try {
    const res  = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=square`, { headers: { Authorization: KEY } })
    const data = await res.json()
    const url  = (data.photos as Photo[])[0]?.src?.medium ?? FALLBACK
    cache.set(query, url)
    return url
  } catch { return FALLBACK }
}
```

- [ ] **Step 2: Pre-fetch images server-side in category pages**

In `src/app/products/[categoryId]/page.tsx`, before rendering, fetch images for all products in parallel and pass the map down:

```typescript
// At the top of the page function, add:
const imageMap = Object.fromEntries(
  await Promise.all(
    products.map(async (p) => [p.id, await fetchPexelsImage(p.imageQuery)] as const)
  )
)
// Pass imageMap to ProductGrid as a prop
```

- [ ] **Step 3: Update ProductCard to accept an optional imageUrl prop**

```tsx
// src/components/products/ProductCard.tsx — add imageUrl prop
export function ProductCard({ product, imageUrl }: { product: Product; imageUrl?: string }) {
  const src = imageUrl ?? `https://source.unsplash.com/400x300/?${encodeURIComponent(product.imageQuery)}`
  // ... rest unchanged
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: Pexels API image pipeline with Unsplash fallback"
```

---

## Phase 8 — Deployment to Vercel

### Task 8.1: Final Build & Deploy

**Files:**
- Create: `.env.local` (not committed)
- No code changes — verification step

- [ ] **Step 1: Run full production build locally**

```bash
npm run build
# Expected: ✓ Compiled successfully
# Expected: All 198 static product pages generated
```

Fix any TypeScript or build errors before proceeding.

- [ ] **Step 2: Install Vercel CLI and deploy**

```bash
npm i -g vercel
vercel --prod
```

Follow prompts: link to new project, default settings.

- [ ] **Step 3: Set environment variables in Vercel dashboard**

Go to Project Settings → Environment Variables and add:
- `RESEND_API_KEY` = your Resend API key
- `NEXT_PUBLIC_PEXELS_API_KEY` = your Pexels API key

Redeploy after adding vars:
```bash
vercel --prod
```

- [ ] **Step 4: Get API keys**

| Service | URL | Free Tier |
|---|---|---|
| Resend (email) | resend.com | 3,000 emails/month |
| Pexels (images) | pexels.com/api | 200 req/hour |
| Sketchfab (3D) | sketchfab.com | Free public embeds |
| Spline (3D hero) | spline.design | Free tier |
| Vercel (hosting) | vercel.com | Free hobby tier |

- [ ] **Step 5: Smoke test live URL**

1. Browse `/products` — category grid loads
2. Click a product — detail page loads, 3D badge shows
3. Add 2 products to quote cart — badge shows count
4. Go to `/quote` — items appear with quantity controls
5. Submit form — confirmation screen appears, email arrives at `info@svsalescorporation.com`
6. Test on mobile — layout is responsive

- [ ] **Step 6: Final commit**

```bash
git add -A && git commit -m "feat: production deployment — SV Sales Corporation website live on Vercel"
```

---

## Deliverables Summary

| Phase | What Ships |
|---|---|
| 1 | 198 products in typed TS data files, 14 categories, brand constants |
| 2 | Quote cart context (localStorage), sticky header, footer, root layout |
| 3 | Home page — Spline 3D hero, brand badges, category grid |
| 4 | Product listing, category pages, product detail with Sketchfab 3D viewer |
| 5 | 2-step quote cart + contact form + Resend email API |
| 6 | Search page (debounced), About page, Contact page with WhatsApp |
| 7 | Sketchfab 3D model IDs wired to ~10 key products; Pexels image pipeline |
| 8 | Vercel deployment, env var setup, smoke tested |

## Questions Deferred to You Before Starting

These need confirmation before implementation begins:

1. **Company email** — What is the actual email address where quotes should be delivered? (Currently placeholder: `info@svsalescorporation.com`)
2. **Domain** — Do you have a domain? If not, the site will live on `sv-sales-corporation.vercel.app` initially.
3. **Spline 3D scene** — The hero needs a 3D scene. A free generic "industrial tools" scene from spline.design will be used unless you want a custom one.
4. **Logo** — Is there a logo file (PNG/SVG)? If not, a text logo with the existing SVSC red-on-dark treatment is used.
5. **Google Maps coordinates** — The about page map iframe will show Srinivaspura 2nd Stage, Mysore. Confirm the pin location is correct.
6. **WhatsApp number** — Confirm `9448044833` is the WhatsApp-enabled number.
