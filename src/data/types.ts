// src/data/types.ts
export type Unit = 'No' | 'Pair' | 'Set' | 'Pkt' | 'Mtr' | 'Ltr' | 'Roll' | 'Kg' | 'Box'

export interface Product {
  id: string
  model?: string
  name: string
  description: string
  categoryId: string
  subcategory?: string
  unit: Unit
  sketchfabModelId?: string
  imageQuery?: string
  tags: string[]
  specifications?: Record<string, string>
  brand?: string
  inStock: boolean
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  imageQuery?: string
  productCount: number
}
