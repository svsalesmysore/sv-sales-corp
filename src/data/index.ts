// src/data/index.ts — Lion Pneumatic Tools catalogue (dealer: S V Sales Corporation)
import catalog from './lion-catalog.json'
import type { Product, Category } from './types'

interface CatalogCategory {
  id: string
  name: string
  description: string
  icon: string
}

const rawCategories = catalog.categories as CatalogCategory[]
export const allProducts: Product[] = catalog.products as unknown as Product[]

export const categories: Category[] = rawCategories.map((c) => ({
  ...c,
  productCount: 0,
}))

export const categoriesWithCounts: Category[] = categories.map((cat) => ({
  ...cat,
  productCount: allProducts.filter((p) => p.categoryId === cat.id).length,
}))

export const getProductById = (id: string): Product | undefined =>
  allProducts.find((p) => p.id === id)

export const getProductsByCategory = (catId: string): Product[] =>
  allProducts.filter((p) => p.categoryId === catId)

export const searchProducts = (query: string): Product[] => {
  const q = query.toLowerCase()
  return allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      (p.model ?? '').toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  )
}

export type { Product, Category }
