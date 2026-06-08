import type { Product } from '../types'

const CLAMP_SIZES = ['3"','4"','6"','8"','10"','12"']

export const fasteningClampingProducts: Product[] = [
  { id: 'stapler-gun', name: 'Stapler Gun / Gun Tacker', description: 'Heavy-duty stapler gun (gun tacker) for upholstery and workshop use', categoryId: 'fastening-clamping', unit: 'No', imageQuery: 'stapler gun tacker heavy duty workshop', tags: ['stapler','gun tacker'], inStock: true },
  { id: 'stapler-pin-23-12', name: 'Stapler Pin 23/12', description: 'Stapler pins 23/12 for gun tacker (packet)', categoryId: 'fastening-clamping', unit: 'Pkt', imageQuery: 'stapler pins 23/12 gun tacker', tags: ['stapler pin','23/12'], inStock: true },
  { id: 'pop-rivet-gun', name: 'Pop Rivet Gun', description: 'Hand pop rivet gun for sheet metal and bodywork', categoryId: 'fastening-clamping', unit: 'No', imageQuery: 'pop rivet gun hand sheet metal', tags: ['rivet gun','pop rivet'], inStock: true },
  { id: 'silicon-sealant-gun', name: 'Silicon Sealant Gun', description: 'Caulking gun for silicon sealant application', categoryId: 'fastening-clamping', unit: 'No', imageQuery: 'silicon sealant caulking gun application', tags: ['sealant gun','caulking','silicon'], inStock: true },
  ...CLAMP_SIZES.map((size) => ({
    id: `c-clamp-${size.replace('"','in')}`,
    name: `C Clamp ${size}`,
    description: `${size} C-clamp for workshop holding and assembly operations`,
    categoryId: 'fastening-clamping',
    subcategory: 'C-Clamps',
    unit: 'No' as const,
    imageQuery: 'c clamp workshop holding assembly',
    tags: ['c clamp', size],
    specifications: { Size: size, Type: 'C-Clamp' },
    inStock: true,
  })),
]
