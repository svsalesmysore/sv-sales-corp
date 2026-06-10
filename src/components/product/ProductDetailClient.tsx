'use client'

import { useState } from 'react'
import { ShoppingCart, Check, ChevronRight, Tag, Package } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useQuoteCart } from '@/context/QuoteCartContext'
import { cn } from '@/lib/utils'
import type { Product } from '@/data/types'
import ProductViewer3D from './ProductViewer3D'

interface Props {
  product: Product
  categoryName: string
  relatedProducts: Product[]
}

export default function ProductDetailClient({ product, categoryName, relatedProducts }: Props) {
  const { addItem, isInCart } = useQuoteCart()
  const hasSizes = !!product.sizeOptions?.length
  const [size, setSize] = useState<string>('')          // unselected by default — must confirm
  const needsSize = hasSizes && !size
  const inCart = isInCart(product.id, hasSizes ? size : undefined)

  // specs for the selected variant (family) merged over common specs
  const activeVariant = product.variants?.find((v) => v.option === size)
  const activeSpecs = { ...(product.specifications || {}), ...(activeVariant?.specifications || {}) }

  const handleAdd = () => {
    if (needsSize) { toast.error(`Please select a ${product.sizeLabel || 'size'}`); return }
    if (!inCart) {
      addItem(product, hasSizes ? size : undefined)
      toast.success('Added to quote cart', { description: hasSizes ? `${product.name} — ${size}` : product.name })
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* breadcrumb */}
      <div className="relative bg-brand-dark py-6 px-4 overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-grid-dark opacity-60" />
        <div className="relative container mx-auto">
          <nav className="flex items-center gap-1 text-sm text-brand-silver">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/products" className="hover:text-white transition-colors">Products</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/products/${product.categoryId}`} className="hover:text-white transition-colors">
              {categoryName}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* viewer */}
          <div>
            <ProductViewer3D
              productName={product.name}
              productId={product.id}
              sketchfabModelId={product.sketchfabModelId}
            />
          </div>

          {/* details */}
          <div>
            {product.brand && (
              <span className="inline-block text-xs font-semibold text-brand-red uppercase tracking-wider bg-brand-red/10 rounded-full px-3 py-1 mb-3">
                {product.brand}
              </span>
            )}

            <h1 className="font-display font-bold text-3xl sm:text-4xl text-brand-dark mb-3 leading-tight">
              {product.name}
            </h1>

            <p className="text-gray-500 text-base leading-relaxed mb-6">{product.description}</p>

            {/* meta */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <Package className="w-4 h-4 text-brand-red" />
                <span className="text-gray-500">Unit:</span>
                <span className="font-medium text-brand-dark">{product.unit}</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <Tag className="w-4 h-4 text-brand-red" />
                <span className="text-gray-500">Category:</span>
                <Link href={`/products/${product.categoryId}`} className="font-medium text-brand-red hover:underline">
                  {categoryName}
                </Link>
              </div>
            </div>

            {/* size / variant selector */}
            {hasSizes && (
              <div className="mb-6">
                <h3 className="font-semibold text-brand-dark text-sm mb-2 uppercase tracking-wider">
                  {product.sizeLabel || 'Size'}
                  <span className="ml-2 text-gray-400 font-normal normal-case">({product.sizeOptions!.length} options)</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizeOptions!.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSize(opt)}
                      className={cn(
                        'text-sm rounded-xl px-3.5 py-2 border font-medium transition-all duration-200 cursor-pointer active:scale-[0.97]',
                        size === opt
                          ? 'bg-gradient-to-b from-brand-red-bright to-brand-red text-white border-transparent glow-red-soft'
                          : 'bg-white text-brand-dark border-slate-200 hover:border-brand-red/50'
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* specifications (for selected variant) */}
            {Object.keys(activeSpecs).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <h3 className="font-semibold text-brand-dark text-sm mb-3 uppercase tracking-wider">Specifications</h3>
                <dl className="grid grid-cols-2 gap-2">
                  {Object.entries(activeSpecs).map(([k, v]) => (
                    <div key={k} className="bg-gray-50 rounded-lg px-3 py-2">
                      <dt className="text-xs text-gray-400">{k}</dt>
                      <dd className="text-sm font-medium text-brand-dark mt-0.5">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {product.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-500 rounded-full px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>

            {/* add to quote */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-4">
                ✦ We don&apos;t display prices online. Add to your quote cart and we&apos;ll send you the best bulk pricing.
              </p>
              {needsSize && (
                <p className="text-xs text-brand-red mb-2 font-medium">
                  ↑ Please select a {product.sizeLabel || 'size'} above to continue.
                </p>
              )}
              <button
                onClick={handleAdd}
                disabled={inCart}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-base transition-all',
                  inCart
                    ? 'bg-green-50 text-green-600 border-2 border-green-200 cursor-default'
                    : needsSize
                    ? 'bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed'
                    : 'bg-gradient-to-b from-brand-red-bright to-brand-red text-white glow-red hover:brightness-110 active:scale-[0.98] cursor-pointer'
                )}
              >
                {inCart ? (
                  <><Check className="w-5 h-5" /> Added to Quote Cart</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> Add to Quote Cart</>
                )}
              </button>
              {inCart && (
                <Link href="/quote" className="block text-center text-sm text-brand-red mt-3 hover:underline">
                  View Quote Cart &rarr;
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display font-bold text-2xl text-brand-dark mb-6">More in {categoryName}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.categoryId}/${p.id}`}
                  className="bg-white rounded-xl border border-gray-100 hover:border-brand-red/30 p-4 text-sm hover:shadow-md transition-all"
                >
                  <div className="font-medium text-brand-dark mb-1 line-clamp-2">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.unit}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
