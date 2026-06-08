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
    <div className="min-h-screen bg-gray-50">
      {/* breadcrumb + header */}
      <div className="bg-brand-dark py-12 px-4">
        <div className="container mx-auto">
          <nav className="flex items-center gap-1 text-sm text-brand-silver mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/products" className="hover:text-white transition-colors">Products</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{cat.name}</span>
          </nav>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-2">{cat.name}</h1>
          <p className="text-brand-silver text-base max-w-2xl">{cat.description}</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-brand-red/20 border border-brand-red/40 rounded-full px-3 py-1 text-sm text-white">
            {products.length} products
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <ProductGrid products={products} />
      </div>

      {/* other categories */}
      <div className="border-t bg-white py-8">
        <div className="container mx-auto px-4">
          <p className="text-sm font-medium text-gray-500 mb-4">Other Categories</p>
          <div className="flex flex-wrap gap-2">
            {categoriesWithCounts
              .filter((c) => c.id !== category)
              .map((c) => (
                <Link
                  key={c.id}
                  href={`/products/${c.id}`}
                  className="text-sm bg-gray-100 hover:bg-brand-red/10 hover:text-brand-red text-gray-600 rounded-full px-3 py-1.5 transition-colors"
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
