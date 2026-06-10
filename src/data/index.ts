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

/* ── brands ──────────────────────────────────────────────────── */
export interface Brand {
  id: string          // slug used in URLs
  name: string        // display name (matches Product.brand)
  blurb: string
  productCount: number
}

const BRAND_META: Record<string, { name: string; blurb: string }> = {
  lion:     { name: 'Lion',     blurb: 'Pneumatic tools, pressure washers, compressors, jacks & garage equipment' },
  gowin:    { name: 'GOWIN',    blurb: 'Vices, clamps, pliers, hammers, pullers & quality hand tools' },
  elephant: { name: 'Elephant', blurb: 'Painter spray guns, paint equipment, couplers & pneumatic accessories' },
}

export const brandSlug = (brand?: string): string => (brand ?? '').toLowerCase()

export const brands: Brand[] = Object.entries(BRAND_META).map(([id, m]) => ({
  id,
  name: m.name,
  blurb: m.blurb,
  productCount: allProducts.filter((p) => brandSlug(p.brand) === id).length,
}))

export const getProductsByBrand = (brandId: string): Product[] =>
  allProducts.filter((p) => brandSlug(p.brand) === brandId)

/** Categories that contain at least one product of the given brand, with per-brand counts. */
export const categoriesForBrand = (brandId: string): Category[] =>
  categoriesWithCounts
    .map((cat) => ({
      ...cat,
      productCount: allProducts.filter(
        (p) => p.categoryId === cat.id && brandSlug(p.brand) === brandId,
      ).length,
    }))
    .filter((cat) => cat.productCount > 0)

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
