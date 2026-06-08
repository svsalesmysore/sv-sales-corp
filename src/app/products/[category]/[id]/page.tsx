import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductById, getProductsByCategory, allProducts, categoriesWithCounts } from '@/data/index'
import ProductDetailClient from '@/components/product/ProductDetailClient'

interface Props {
  params: Promise<{ category: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = getProductById(id)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.name,
    description: product.description,
  }
}

export function generateStaticParams() {
  return allProducts.map((p) => ({ category: p.categoryId, id: p.id }))
}

export default async function ProductDetailPage({ params }: Props) {
  const { category, id } = await params
  const product = getProductById(id)
  if (!product || product.categoryId !== category) notFound()

  const cat           = categoriesWithCounts.find((c) => c.id === category)
  const related       = getProductsByCategory(category).filter((p) => p.id !== id)
  const categoryName  = cat?.name ?? category

  return (
    <ProductDetailClient
      product={product}
      categoryName={categoryName}
      relatedProducts={related}
    />
  )
}
