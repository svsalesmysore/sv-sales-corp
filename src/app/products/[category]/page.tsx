import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getProductsByCategory, categoriesWithCounts } from '@/data/index'
import ProductGrid from '@/components/products/ProductGrid'

interface Props {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const cat = categoriesWithCounts.find((c) => c.id === category)
  if (!cat) return { title: 'Category Not Found' }
  return {
    title: cat.name,
    description: cat.description,
  }
}

export function generateStaticParams() {
  return categoriesWithCounts.map((c) => ({ category: c.id }))
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const cat      = categoriesWithCounts.find((c) => c.id === category)
  if (!cat) notFound()

  const products = getProductsByCategory(category)

  return (
    <div className="min-h-screen bg-surface">
      {/* breadcrumb + header */}
      <div className="relative bg-brand-dark py-14 px-4 overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_60%_100%_at_30%_0%,black,transparent)]" />
        <div aria-hidden className="absolute -top-20 -right-20 w-[380px] h-[240px] rounded-full bg-brand-red/12 blur-[100px]" />
        <div className="relative container mx-auto">
          <nav className="flex items-center gap-1 text-sm text-brand-silver mb-5">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/products" className="hover:text-white transition-colors">Products</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{cat.name}</span>
          </nav>
          <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mb-3">
            <span className="text-gradient-silver">{cat.name}</span>
          </h1>
          <p className="text-brand-silver text-base max-w-2xl">{cat.description}</p>
          <div className="mt-4 inline-flex items-center gap-2 glass-panel rounded-full px-3.5 py-1.5 text-sm text-white tabular-nums">
            {products.length} products
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <ProductGrid products={products} />
      </div>

      {/* other categories */}
      <div className="border-t border-slate-100 bg-white py-10">
        <div className="container mx-auto px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-4">Other Categories</p>
          <div className="flex flex-wrap gap-2">
            {categoriesWithCounts
              .filter((c) => c.id !== category)
              .map((c) => (
                <Link
                  key={c.id}
                  href={`/products/${c.id}`}
                  className="text-sm bg-slate-100 hover:bg-brand-red hover:text-white text-slate-600 rounded-full px-3.5 py-1.5 transition-all duration-200 cursor-pointer"
                >
                  {c.name}
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
