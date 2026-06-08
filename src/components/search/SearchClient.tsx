'use client'

import { useState, useDeferredValue, useMemo } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { searchProducts, allProducts, categoriesWithCounts } from '@/data/index'
import ProductGrid from '@/components/products/ProductGrid'

export default function SearchClient() {
  const [query, setQuery]       = useState('')
  const [catFilter, setCat]     = useState<string>('all')
  const deferredQuery           = useDeferredValue(query)

  const results = useMemo(() => {
    const base = deferredQuery.trim().length > 1
      ? searchProducts(deferredQuery.trim())
      : allProducts
    return catFilter === 'all' ? base : base.filter((p) => p.categoryId === catFilter)
  }, [deferredQuery, catFilter])

  const clear = () => { setQuery(''); setCat('all') }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* search header */}
      <div className="bg-brand-dark py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-display font-bold text-4xl text-white mb-6 text-center">Search Products</h1>

          {/* search box */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools, tyres, equipment…"
              autoFocus
              className="w-full bg-white rounded-xl pl-12 pr-12 py-4 text-base text-brand-dark placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red/40 shadow-lg"
            />
            {query && (
              <button
                onClick={clear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* category filter pills */}
          <div className="flex gap-2 flex-wrap mt-4">
            <button
              onClick={() => setCat('all')}
              className={`text-sm rounded-full px-3 py-1.5 font-medium transition-colors ${
                catFilter === 'all'
                  ? 'bg-brand-red text-white'
                  : 'bg-white/10 text-brand-silver hover:bg-white/20'
              }`}
            >
              All
            </button>
            {categoriesWithCounts.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`text-sm rounded-full px-3 py-1.5 font-medium transition-colors ${
                  catFilter === c.id
                    ? 'bg-brand-red text-white'
                    : 'bg-white/10 text-brand-silver hover:bg-white/20'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* results */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            {query.trim().length > 1
              ? `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`
              : `Showing all ${results.length} products`}
            {catFilter !== 'all' && (
              <span className="ml-2 text-brand-red font-medium">
                in {categoriesWithCounts.find((c) => c.id === catFilter)?.name}
              </span>
            )}
          </p>
          {(query || catFilter !== 'all') && (
            <button onClick={clear} className="text-xs text-gray-400 hover:text-brand-red flex items-center gap-1 transition-colors">
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>

        <ProductGrid
          products={results}
          showCategory
          emptyMessage="No products match your search. Try different keywords."
        />
      </div>
    </div>
  )
}
