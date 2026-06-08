'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Check, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { useQuoteCart } from '@/context/QuoteCartContext'
import { cn } from '@/lib/utils'
import { getProductImage, getFallbackImage } from '@/lib/image'
import type { Product } from '@/data/types'

interface Props {
  product: Product
  showCategory?: boolean
}

export default function ProductCard({ product, showCategory = false }: Props) {
  const { addItem, isInCart } = useQuoteCart()
  const [imgError, setImgError] = useState(false)
  const inCart = isInCart(product.id)

  const imageUrl = imgError
    ? getFallbackImage()
    : getProductImage(product.id)

  const handleAddToQuote = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!inCart) {
      addItem(product)
      toast.success(`Added to quote`, {
        description: product.name,
        duration: 2000,
      })
    }
  }

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-brand-red/30 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden">
      {/* image */}
      <Link href={`/products/${product.categoryId}/${product.id}`} className="block relative">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            unoptimized
          />
          {/* hover overlay */}
          <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/20 transition-colors flex items-center justify-center">
            <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </Link>

      {/* body */}
      <div className="p-4">
        {showCategory && (
          <Link href={`/products/${product.categoryId}`} className="text-xs text-brand-red font-medium uppercase tracking-wider hover:underline">
            {product.categoryId.replace(/-/g, ' ')}
          </Link>
        )}
        <Link href={`/products/${product.categoryId}/${product.id}`}>
          <h3 className="font-semibold text-brand-dark text-sm mt-1 mb-1 leading-snug group-hover:text-brand-red transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-400 text-xs line-clamp-2 mb-3 leading-relaxed">
          {product.description}
        </p>

        {/* tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">
              {tag}
            </span>
          ))}
          {product.brand && (
            <span className="text-[10px] bg-brand-red/10 text-brand-red rounded px-1.5 py-0.5">
              {product.brand}
            </span>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Per {product.unit}</span>
          <button
            onClick={handleAddToQuote}
            disabled={inCart}
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all',
              inCart
                ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
                : 'bg-brand-red text-white hover:bg-brand-red/80 hover:scale-105'
            )}
          >
            {inCart ? (
              <><Check className="w-3 h-3" /> In Quote</>
            ) : (
              <><ShoppingCart className="w-3 h-3" /> Add to Quote</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
