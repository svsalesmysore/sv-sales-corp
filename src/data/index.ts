// src/data/index.ts
import { tyreRepairProducts }        from './products/tyre-repair'
import { spannersWrenchesProducts }  from './products/spanners-wrenches'
import { socketsDriverProducts }     from './products/sockets-drives'
import { pliersScewdriverProducts }  from './products/pliers-screwdrivers'
import { jacksLiftingProducts }      from './products/jacks-lifting'
import { pneumaticAirProducts }      from './products/pneumatic-air'
import { greaseLubricationProducts } from './products/grease-lubrication'
import { weldingProducts }           from './products/welding'
import { paintingSurfaceProducts }   from './products/painting-surface'
import { fasteningClampingProducts } from './products/fastening-clamping'
import { electricalFansProducts }    from './products/electrical-fans'
import { safetyProtectiveProducts }  from './products/safety-protective'
import { sealingAdhesivesProducts }  from './products/sealing-adhesives'
import { miscellaneousProducts }     from './products/miscellaneous'
import { categories }                from './categories'
import type { Product, Category }    from './types'

export const allProducts: Product[] = [
  ...tyreRepairProducts,
  ...spannersWrenchesProducts,
  ...socketsDriverProducts,
  ...pliersScewdriverProducts,
  ...jacksLiftingProducts,
  ...pneumaticAirProducts,
  ...greaseLubricationProducts,
  ...weldingProducts,
  ...paintingSurfaceProducts,
  ...fasteningClampingProducts,
  ...electricalFansProducts,
  ...safetyProtectiveProducts,
  ...sealingAdhesivesProducts,
  ...miscellaneousProducts,
]

export const categoriesWithCounts: Category[] = categories.map((cat) => ({
  ...cat,
  productCount: allProducts.filter((p) => p.categoryId === cat.id).length,
}))

export const getProductById        = (id: string): Product | undefined =>
  allProducts.find((p) => p.id === id)

export const getProductsByCategory = (catId: string): Product[] =>
  allProducts.filter((p) => p.categoryId === catId)

export const searchProducts        = (query: string): Product[] => {
  const q = query.toLowerCase()
  return allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  )
}

export { categories }
export type { Product, Category }
