import type { Metadata } from 'next'
import ProductsBrowser from '@/components/products/ProductsBrowser'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse 231 products across 46 categories and 3 brands — Lion, GOWIN & Elephant tools at S V Sales Corporation, Mysore.',
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* header */}
      <div className="relative bg-brand-dark py-20 px-4 overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_60%_90%_at_50%_0%,black,transparent)]" />
        <div aria-hidden className="absolute -top-24 left-1/2 -translate-x-1/2 w-[560px] h-[280px] rounded-full bg-brand-red/15 blur-[110px]" />
        <div className="relative container mx-auto text-center">
          <p className="text-brand-gold text-xs font-semibold uppercase tracking-[0.28em] mb-4">Lion · GOWIN · Elephant</p>
          <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight mb-4">
            <span className="text-gradient-silver">Product Catalog</span>
          </h1>
          <p className="text-brand-silver text-lg max-w-xl mx-auto">
            231 products across 46 categories — pressure washers, pneumatic tools, vices &amp; garage equipment
          </p>
        </div>
      </div>

      <ProductsBrowser />
    </div>
  )
}
