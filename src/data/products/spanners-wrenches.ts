import type { Product } from '../types'

const DE_SIZES = ['6x7','8x9','10x11','12x13','14x15','16x17','18x19','20x22','21x23','24x27','30x32','36x41']
const RING_SIZES = ['6x7','8x9','10x11','12x13','14x15','16x17','18x19','20x22','21x23','24x27','30x32','36x41']

export const spannersWrenchesProducts: Product[] = [
  { id: 'open-end-spanner-set', name: 'Open End Spanner Set (6×7 to 30×32)', description: 'Set of 11 open-end spanners 6×7 to 30×32mm — chrome vanadium, Taparia', categoryId: 'spanners-wrenches', subcategory: 'Spanner Sets', unit: 'Set', imageQuery: 'open end spanner set chrome vanadium', tags: ['spanner','set','open end'], brand: 'Taparia', inStock: true },
  { id: 'ring-spanner-set', name: 'Ring Spanner Set (6×7 to 30×32)', description: 'Set of 11 ring spanners 6×7 to 30×32mm — drop-forged, Taparia', categoryId: 'spanners-wrenches', subcategory: 'Spanner Sets', unit: 'Set', imageQuery: 'ring spanner set taparia chrome', tags: ['spanner','set','ring'], brand: 'Taparia', inStock: true },
  ...DE_SIZES.map((size) => ({
    id: `double-end-spanner-${size}`,
    name: `Double End Spanner ${size}mm`,
    description: `Drop-forged double open-end spanner ${size}mm — chrome vanadium, Taparia`,
    categoryId: 'spanners-wrenches',
    subcategory: 'Double End Spanners',
    unit: 'No' as const,
    imageQuery: 'double open end spanner chrome vanadium',
    tags: ['spanner','double end', size],
    brand: 'Taparia',
    specifications: { Size: `${size}mm`, Type: 'Double Open End', Material: 'Chrome Vanadium' },
    inStock: true,
  })),
  ...RING_SIZES.map((size) => ({
    id: `ring-spanner-${size}`,
    name: `Ring Spanner ${size}mm`,
    description: `Drop-forged ring spanner ${size}mm — chrome vanadium, Taparia`,
    categoryId: 'spanners-wrenches',
    subcategory: 'Ring Spanners',
    unit: 'No' as const,
    imageQuery: 'ring box end spanner chrome vanadium',
    tags: ['spanner','ring', size],
    brand: 'Taparia',
    specifications: { Size: `${size}mm`, Type: 'Ring / Box End', Material: 'Chrome Vanadium' },
    inStock: true,
  })),
  { id: 'adjustable-spanner', name: 'Adjustable Spanner', description: 'Heavy-duty adjustable crescent wrench', categoryId: 'spanners-wrenches', subcategory: 'Adjustable Wrenches', unit: 'No', imageQuery: 'adjustable spanner crescent wrench', tags: ['adjustable','spanner'], brand: 'Taparia', inStock: true },
  { id: 'pipe-wrench-14', name: 'Pipe Wrench 14"', description: '14" pipe wrench for gripping pipes and round stock', categoryId: 'spanners-wrenches', subcategory: 'Pipe Wrenches', unit: 'No', imageQuery: 'pipe wrench 14 inch heavy duty', tags: ['pipe wrench','14 inch'], inStock: true },
  { id: 'two-way-wheel-spanner', name: 'Two Way Wheel Spanner 32×33', description: 'Heavy-duty two-way wheel spanner 32×33mm for truck wheel nuts', categoryId: 'spanners-wrenches', subcategory: 'Wheel Spanners', unit: 'No', imageQuery: 'wheel nut spanner truck heavy vehicle', tags: ['wheel spanner','two-way','truck'], inStock: true },
  { id: 'allen-key-set', name: 'Allen Key Set', description: 'Complete metric hex key set — chrome finish, Taparia', categoryId: 'spanners-wrenches', subcategory: 'Hex Keys', unit: 'Set', imageQuery: 'allen key hex wrench set metric', tags: ['allen key','hex','set'], brand: 'Taparia', inStock: true },
]
