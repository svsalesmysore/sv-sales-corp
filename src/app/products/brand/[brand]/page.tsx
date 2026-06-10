import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { brands, getProductsByBrand, categoriesForBrand } from '@/data/index'
import ProductGrid from '@/components/products/ProductGrid'

interface Props {
  params: Promise<{ brand: string }>
}

export function generateStaticParams() {
  return brands.map((b) => ({ brand: b.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params
  const b = brands.find((x) => x.id === brand)
  if (!b) return { title: 'Brand Not Found' }
  return { title: `${b.name} Products`, description: `${b.name} — ${b.blurb}. ${b.productCount} products at S V Sales Corporation.` }
}

export default async function BrandPage({ params }: Props) {
  const { brand } = await params
  const b = brands.find((x) => x.id === brand)
  if (!b) notFound()

  const cats = categoriesForBrand(brand)
  const all = getProductsByBrand(brand)

  return (
    <div className="min-h-screen bg-surface">
      {/* header */}
      <div className="relative bg-brand-dark py-14 px-4 overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_60%_100%_at_30%_0%,black,transparent)]" />
        <div aria-hidden className="absolute -top-20 -right-20 w-[380px] h-[240px] rounded-full bg-brand-gold/10 blur-[100px]" />
        <div className="relative container mx-auto">
          <nav className="flex items-center gap-1 text-sm text-brand-silver mb-5">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/products" className="hover:text-white transition-colors">Products</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{b.name}</span>
          </nav>
          <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mb-3">
            <span className="text-gradient-silver">{b.name}</span>
          </h1>
          <p className="text-brand-silver text-base max-w-2xl">{b.blurb}</p>
          <div className="mt-4 inline-flex items-center gap-2 glass-panel rounded-full px-3.5 py-1.5 text-sm text-white tabular-nums">
            {all.length} products · {cats.length} categories
          </div>
        </div>
      </div>

      {/* per-category sections */}
      <div className="container mx-auto px-4 py-10 space-y-12">
        {cats.map((cat) => {
          const items = all.filter((p) => p.categoryId === cat.id)
          return (
            <section key={cat.id}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-2xl text-brand-dark">{cat.name}</h2>
                <Link href={`/products/${cat.id}`} className="text-sm text-brand-red hover:underline">
                  View category →
                </Link>
              </div>
              <ProductGrid products={items} />
            </section>
          )
        })}
      </div>

      {/* other brands */}
      <div className="border-t bg-white py-8">
        <div className="container mx-auto px-4">
          <p className="text-sm font-medium text-gray-500 mb-4">Other Brands</p>
          <div className="flex flex-wrap gap-2">
            {brands.filter((x) => x.id !== brand).map((x) => (
              <Link
                key={x.id}
                href={`/products/brand/${x.id}`}
                className="text-sm bg-gray-100 hover:bg-brand-red/10 hover:text-brand-red text-gray-600 rounded-full px-3 py-1.5 transition-colors"
              >
                {x.name} ({x.productCount})
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
