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
  const hasSizes = !!product.sizeOptions?.length
  const [size, setSize] = useState<string>('')          // unselected by default — must confirm
  const needsSize = hasSizes && !size
  const inCart = isInCart(product.id, hasSizes ? size : undefined)

  const imageUrl = imgError
    ? getFallbackImage()
    : getProductImage(product.id)

  const handleAddToQuote = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (needsSize) { toast.error(`Please select a ${product.sizeLabel || 'size'}`); return }
    if (!inCart) {
      addItem(product, hasSizes ? size : undefined)
      toast.success(`Added to quote`, {
        description: hasSizes ? `${product.name} — ${size}` : product.name,
        duration: 2000,
      })
    }
  }

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-brand-red/25 card-premium overflow-hidden flex flex-col">
      {/* image */}
      <Link href={`/products/${product.categoryId}/${product.id}`} className="block relative cursor-pointer">
        <div className="relative aspect-[4/3] overflow-hidden bg-white">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-4 group-hover:scale-[1.06] transition-transform duration-500 ease-out"
            onError={() => setImgError(true)}
            unoptimized
          />
          {/* hover veil */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/0 to-transparent group-hover:from-brand-dark/10 transition-all duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 inline-flex items-center gap-1.5 bg-brand-dark/85 backdrop-blur text-white text-xs font-medium rounded-full px-3.5 py-1.5">
              <Eye className="w-3.5 h-3.5" /> View details
            </span>
          </div>
          {/* brand chip */}
          {product.brand && (
            <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider bg-brand-dark/85 backdrop-blur text-white rounded-full px-2.5 py-1">
              {product.brand}
            </span>
          )}
        </div>
      </Link>

      {/* body */}
      <div className="p-4 pt-3 border-t border-slate-100 flex flex-col flex-1">
        {showCategory && (
          <Link href={`/products/${product.categoryId}`} className="text-[10px] text-brand-red font-semibold uppercase tracking-wider hover:underline cursor-pointer">
            {product.categoryId.replace(/-/g, ' ')}
          </Link>
        )}
        <Link href={`/products/${product.categoryId}/${product.id}`} className="cursor-pointer">
          <h3 className="font-semibold text-brand-dark text-sm mt-1 mb-1 leading-snug group-hover:text-brand-red transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-slate-400 text-xs line-clamp-2 mb-3 leading-relaxed">
          {product.description}
        </p>

        {/* size selector */}
        {hasSizes && (
          <div className="mb-3">
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1">
              {product.sizeLabel || 'Size'}
            </label>
            <select
              value={size}
              onChange={(e) => { e.stopPropagation(); setSize(e.target.value) }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'w-full text-xs border rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red bg-white transition-colors cursor-pointer',
                needsSize ? 'border-brand-red/40 text-slate-500' : 'border-slate-200 text-brand-dark'
              )}
            >
              <option value="" disabled>Select {product.sizeLabel || 'size'}…</option>
              {product.sizeOptions!.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}

        {/* footer */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-xs text-slate-400">Per {product.unit}</span>
          <button
            onClick={handleAddToQuote}
            disabled={inCart}
            className={cn(
              'flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer',
              inCart
                ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
                : needsSize
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-gradient-to-b from-brand-red-bright to-brand-red text-white glow-red-soft hover:brightness-110 active:scale-[0.97]'
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
