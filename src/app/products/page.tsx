import type { Metadata } from 'next'
import ProductsBrowser from '@/components/products/ProductsBrowser'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse 231 products across 46 categories and 3 brands — Lion, GOWIN & Elephant tools at S V Sales Corporation, Mysore.',
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* header */}
      <div className="bg-brand-dark py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="font-display font-bold text-5xl text-white mb-3">Product Catalog</h1>
          <p className="text-brand-silver text-lg max-w-xl mx-auto">
            231 products across 46 categories — Lion, GOWIN &amp; Elephant tools, pressure washers &amp; garage equipment
          </p>
        </div>
      </div>

      <ProductsBrowser />
    </div>
  )
}
