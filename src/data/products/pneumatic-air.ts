import type { Product } from '../types'

const HOSE_LENGTHS = ['500mm','1000mm','1500mm','2000mm','2500mm','3000mm']

export const pneumaticAirProducts: Product[] = [
  { id: 'air-filter-regulator', name: 'Air Filter Cum Regulator 1/2"', description: '1/2" air filter and regulator combo for compressor lines', categoryId: 'pneumatic-air', subcategory: 'Air Fittings', unit: 'No', imageQuery: 'air filter regulator compressor 1/2 inch', tags: ['air filter','regulator','compressor'], inStock: true },
  { id: 'air-hose-pipe-8mm', name: 'Air Hose Pipe 8mm', description: '8mm pneumatic air hose pipe (per meter)', categoryId: 'pneumatic-air', subcategory: 'Hoses & Pipes', unit: 'Mtr', imageQuery: 'air hose pipe pneumatic 8mm', tags: ['air hose','8mm'], inStock: true },
  { id: 'pneumatic-tool-22000', name: 'Air Tool / Pneumatic Tool 22000 RPM', description: 'High-speed pneumatic tool 22000 RPM for buffing and polishing', categoryId: 'pneumatic-air', subcategory: 'Air Tools', unit: 'No', imageQuery: 'pneumatic air tool 22000 rpm polishing', tags: ['pneumatic','air tool','22000 rpm'], inStock: true },
  { id: 'compressor-safety-valve', name: 'Compressor Safety Valve', description: 'Safety relief valve for air compressors', categoryId: 'pneumatic-air', subcategory: 'Air Fittings', unit: 'No', imageQuery: 'compressor safety relief valve', tags: ['safety valve','compressor'], inStock: true },
  { id: 'quick-coupler', name: 'Quick Coupler', description: 'Quick-connect air line coupler for pneumatic tools', categoryId: 'pneumatic-air', subcategory: 'Air Fittings', unit: 'No', imageQuery: 'quick coupler air line connector pneumatic', tags: ['quick coupler','connector'], inStock: true },
  { id: 'car-washer-12mm', name: 'Car Washer 12mm PVC', description: '12mm PVC car wash gun with spray nozzle', categoryId: 'pneumatic-air', subcategory: 'Washing', unit: 'No', imageQuery: 'car wash spray gun 12mm PVC', tags: ['car wash','spray','12mm'], inStock: true },
  ...HOSE_LENGTHS.map((len) => ({
    id: `ss-teflon-hose-${len}`,
    name: `S.S Wire Braided Teflon Hose ${len}`,
    description: `Stainless steel wire braided PTFE/Teflon hose ${len} for high-pressure applications`,
    categoryId: 'pneumatic-air',
    subcategory: 'SS Teflon Hoses',
    unit: 'No' as const,
    imageQuery: 'stainless steel braided teflon hose high pressure',
    tags: ['SS hose','teflon','braided', len],
    specifications: { Length: len, Material: 'SS Braided PTFE' },
    inStock: true,
  })),
  { id: 'high-pressure-wash-hose', name: 'High Pressure Car Washing Hose with End Coupling', description: 'Complete high-pressure washing hose set with end couplings', categoryId: 'pneumatic-air', subcategory: 'Washing', unit: 'No', imageQuery: 'high pressure car wash hose coupling', tags: ['pressure wash','hose','coupling'], inStock: true },
  { id: 'pressure-gauge', name: 'Pressure Gauge', description: 'Dial pressure gauge for compressor and pneumatic system monitoring', categoryId: 'pneumatic-air', subcategory: 'Gauges', unit: 'No', imageQuery: 'pressure gauge dial compressor industrial', tags: ['pressure gauge','dial'], inStock: true },
  { id: 'pressure-relief-65psi', name: '65 PSI Pressure Relief Valve', description: '65 PSI pressure relief/safety valve for air systems', categoryId: 'pneumatic-air', subcategory: 'Safety Valves', unit: 'No', imageQuery: 'pressure relief valve 65 psi safety', tags: ['relief valve','65 psi'], inStock: true },
  { id: 'pressure-relief-95psi', name: '95 PSI Pressure Relief Valve', description: '95 PSI pressure relief valve for air systems', categoryId: 'pneumatic-air', subcategory: 'Safety Valves', unit: 'No', imageQuery: 'pressure relief valve 95 psi safety', tags: ['relief valve','95 psi'], inStock: true },
  { id: 'tyre-pressure-gauge-wall', name: 'Tyre Pressure Gauge (Wall Mounting)', description: 'Wall-mount tyre pressure gauge for workshop use', categoryId: 'pneumatic-air', subcategory: 'Gauges', unit: 'No', imageQuery: 'tyre pressure gauge wall mount workshop', tags: ['tyre pressure','gauge','wall mount'], inStock: true },
]
