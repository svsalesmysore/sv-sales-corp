import type { Product } from '../types'

export const safetyProtectiveProducts: Product[] = [
  { id: 'hand-gloves-trp', name: 'Hand Gloves for TRP', description: 'Protective hand gloves for tyre retreading process (TRP) workers', categoryId: 'safety-protective', unit: 'Pair', imageQuery: 'protective work gloves industrial workshop TRP', tags: ['gloves','protective','TRP'], inStock: true },
  { id: 'protective-cloth', name: 'Protective Cloth', description: 'Protective cloth/apron for workshop use', categoryId: 'safety-protective', unit: 'No', imageQuery: 'protective cloth apron workshop safety', tags: ['protective','cloth','apron'], inStock: true },
  { id: 'protective-mask', name: 'Protective Mask', description: 'Dust and particle protective mask for workshop use', categoryId: 'safety-protective', unit: 'No', imageQuery: 'protective mask dust particle workshop safety', tags: ['mask','protective','dust'], inStock: true },
  { id: 'marking-crayons', name: 'Marking Crayons', description: 'Industrial marking crayons for metal and rubber marking', categoryId: 'safety-protective', unit: 'No', imageQuery: 'marking crayons industrial metal rubber', tags: ['marking','crayons','industrial'], inStock: true },
]
