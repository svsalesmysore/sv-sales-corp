'use client'

import { useState, useEffect, useMemo, useRef, useDeferredValue } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, Plus, Minus, ShoppingCart, Check } from 'lucide-react'
import { toast } from 'sonner'
import { searchProducts } from '@/data/index'
import { useQuoteCart } from '@/context/QuoteCartContext'
import { getProductImage, getFallbackImage } from '@/lib/image'
import { cn } from '@/lib/utils'
import type { Product } from '@/data/types'

/* ── single result row: size + quantity + add to quote ── */
function ResultRow({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem, isInCart } = useQuoteCart()
  const hasSizes = !!product.sizeOptions?.length
  const [size, setSize] = useState<string | undefined>(product.sizeOptions?.[0])
  const [qty, setQty] = useState(1)
  const [imgErr, setImgErr] = useState(false)
  const added = isInCart(product.id, hasSizes ? size : undefined)

  const img = imgErr ? getFallbackImage() : getProductImage(product.id)

  const add = () => {
    addItem(product, hasSizes ? size : undefined, qty)
    toast.success('Added to quote', {
      description: `${product.name}${hasSizes ? ` — ${size}` : ''} × ${qty}`,
      duration: 1800,
    })
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-red/30 hover:shadow-sm transition-all bg-white">
      <Link href={`/products/${product.categoryId}/${product.id}`} onClick={onClose} className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
        <Image src={img} alt={product.name} fill sizes="56px" className="object-cover" onError={() => setImgErr(true)} unoptimized />
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/products/${product.categoryId}/${product.id}`} onClick={onClose}>
          <p className="font-medium text-sm text-brand-dark leading-snug line-clamp-1 hover:text-brand-red">{product.name}</p>
        </Link>
        <p className="text-[11px] text-gray-400 capitalize">{product.brand} · {product.categoryId.replace(/-/g, ' ')}</p>

        {/* controls */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {hasSizes && (
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-brand-dark bg-white focus:outline-none focus:ring-1 focus:ring-brand-red/40 max-w-[150px]"
              aria-label={product.sizeLabel || 'Size'}
            >
              {product.sizeOptions!.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-6 h-7 flex items-center justify-center text-gray-500 hover:text-brand-red" aria-label="Decrease">
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-7 text-center text-xs font-semibold">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="w-6 h-7 flex items-center justify-center text-gray-500 hover:text-brand-red" aria-label="Increase">
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={add}
        className={cn(
          'shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all',
          added ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-brand-red text-white hover:bg-brand-red/80'
        )}
      >
        {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
        {added ? 'Added' : 'Add'}
      </button>
    </div>
  )
}

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    const q = deferred.trim()
    return q.length >= 2 ? searchProducts(q).slice(0, 40) : []
  }, [deferred])

  // focus input + lock scroll + Esc to close
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-brand-dark/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-3xl mx-auto mt-0 sm:mt-20 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-screen sm:max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        {/* search input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products — e.g. spray gun, vice, jack, compressor…"
            className="flex-1 text-base text-brand-dark placeholder-gray-300 focus:outline-none"
          />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0" aria-label="Close search">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* results */}
        <div className="overflow-y-auto p-4 space-y-2">
          {query.trim().length < 2 ? (
            <p className="text-center text-gray-400 text-sm py-12">Start typing to search 230+ products across Lion, GOWIN &amp; Elephant…</p>
          ) : results.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">No products match &ldquo;{query}&rdquo;. Try a different term.</p>
          ) : (
            <>
              <p className="text-xs text-gray-400 px-1">{results.length} result{results.length !== 1 ? 's' : ''}{results.length === 40 ? '+ (showing first 40)' : ''}</p>
              {results.map((p) => <ResultRow key={p.id} product={p} onClose={onClose} />)}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
