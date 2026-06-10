'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Droplets, Waves, Sprout, Droplet, Settings2, Crosshair, CircleDot,
  Container, Wind, Wrench, Gauge, Car, Disc3, PaintBucket, CircleDashed,
  Filter, Cable, Zap, Box, Construction, Scissors, PenTool, Hammer, Magnet, Axe, Ruler, Boxes,
  LayoutGrid, Building2,
} from 'lucide-react'
import { categoriesWithCounts, brands } from '@/data/index'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Droplets, Waves, Sprout, Droplet, Settings2, Crosshair, CircleDot,
  Container, Wind, Wrench, Gauge, Car, Disc3, PaintBucket, CircleDashed,
  Filter, Cable, Zap, Box, Construction, Scissors, PenTool, Hammer, Magnet, Axe, Ruler, Boxes,
}

const BRAND_ACCENT: Record<string, string> = {
  lion: 'from-brand-red/10 to-brand-gold/10',
  gowin: 'from-yellow-100 to-amber-50',
  elephant: 'from-orange-100 to-gray-100',
}

export default function ProductsBrowser() {
  const [tab, setTab] = useState<'category' | 'brand'>('category')

  return (
    <div className="container mx-auto px-4 py-12">
      {/* browse toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setTab('category')}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors',
              tab === 'category' ? 'bg-brand-red text-white' : 'text-gray-600 hover:text-brand-dark'
            )}
          >
            <LayoutGrid className="w-4 h-4" /> Browse by Product Category
          </button>
          <button
            onClick={() => setTab('brand')}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors',
              tab === 'brand' ? 'bg-brand-red text-white' : 'text-gray-600 hover:text-brand-dark'
            )}
          >
            <Building2 className="w-4 h-4" /> Browse by Product Brand
          </button>
        </div>
      </div>

      {/* ── by category ── */}
      {tab === 'category' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesWithCounts.map((cat) => {
            const Icon = iconMap[cat.icon] ?? Box
            return (
              <Link
                key={cat.id}
                href={`/products/${cat.id}`}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-brand-red/30 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-brand-red/10 group-hover:bg-brand-red/20 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-7 h-7 text-brand-red" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-xl text-brand-dark group-hover:text-brand-red transition-colors mb-1">
                      {cat.name}
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed mb-2 line-clamp-2">{cat.description}</p>
                    <span className="text-xs font-medium text-brand-red">{cat.productCount} products →</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* ── by brand ── */}
      {tab === 'brand' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/products/brand/${b.id}`}
              className="group bg-white rounded-2xl border border-gray-100 hover:border-brand-red/30 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden"
            >
              <div className={cn('h-28 bg-gradient-to-br flex items-center justify-center', BRAND_ACCENT[b.id] || 'from-gray-100 to-gray-50')}>
                <span className="font-display font-bold text-3xl text-brand-dark">{b.name}</span>
              </div>
              <div className="p-5">
                <p className="text-gray-500 text-sm leading-relaxed mb-3 line-clamp-3">{b.blurb}</p>
                <span className="text-xs font-medium text-brand-red">{b.productCount} products →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
