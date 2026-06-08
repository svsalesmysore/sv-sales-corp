import ProductCard from './ProductCard'
import type { Product } from '@/data/types'

interface Props {
  products: Product[]
  showCategory?: boolean
  emptyMessage?: string
}

export default function ProductGrid({ products, showCategory = false, emptyMessage = 'No products found.' }: Props) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} showCategory={showCategory} />
      ))}
    </div>
  )
}
