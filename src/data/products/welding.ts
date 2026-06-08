import type { Product } from '../types'

export const weldingProducts: Product[] = [
  { id: 'welding-cable', name: 'Welding Cable', description: 'Heavy-duty welding cable (per metre)', categoryId: 'welding', unit: 'Mtr', imageQuery: 'welding cable heavy duty electrical', tags: ['welding','cable'], inStock: true },
  { id: 'welding-cutting-torch', name: 'Welding Cutting Torch', description: 'Oxy-fuel cutting torch for metal cutting', categoryId: 'welding', unit: 'No', imageQuery: 'welding cutting torch oxy fuel metal', tags: ['welding','cutting torch','oxy-fuel'], inStock: true },
  { id: 'welding-goggles', name: 'Welding Goggles', description: 'Protective goggles for welding and cutting operations', categoryId: 'welding', unit: 'No', imageQuery: 'welding goggles protective eyewear safety', tags: ['welding','goggles','safety'], inStock: true },
  { id: 'welding-holder', name: 'Welding Holder', description: 'Electrode holder for arc welding', categoryId: 'welding', unit: 'No', imageQuery: 'welding electrode holder arc welding', tags: ['welding','electrode holder'], inStock: true },
  { id: 'welding-hose', name: 'Welding Hose', description: 'Gas welding hose (per metre) for oxy-fuel setups', categoryId: 'welding', unit: 'Mtr', imageQuery: 'welding gas hose oxygen acetylene', tags: ['welding','hose','gas'], inStock: true },
  { id: 'welding-shield', name: 'Welding Shield', description: 'Hand-held face shield for welding protection', categoryId: 'welding', unit: 'No', imageQuery: 'welding face shield hand held protective', tags: ['welding','shield','face protection'], inStock: true },
]
