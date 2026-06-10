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

export default function ProductsBrowser() {
  const [tab, setTab] = useState<'category' | 'brand'>('category')

  return (
    <div className="container mx-auto px-4 py-12">
      {/* browse toggle */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm shadow-slate-200/60">
          <button
            onClick={() => setTab('category')}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer',
              tab === 'category' ? 'bg-gradient-to-b from-brand-red-bright to-brand-red text-white glow-red-soft' : 'text-slate-500 hover:text-brand-dark'
            )}
          >
            <LayoutGrid className="w-4 h-4" /> Browse by Product Category
          </button>
          <button
            onClick={() => setTab('brand')}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer',
              tab === 'brand' ? 'bg-gradient-to-b from-brand-red-bright to-brand-red text-white glow-red-soft' : 'text-slate-500 hover:text-brand-dark'
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
                className="group bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-brand-red/25 card-premium cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-red/10 to-brand-gold/10 group-hover:from-brand-red group-hover:to-brand-red-bright rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300">
                    <Icon className="w-7 h-7 text-brand-red group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-xl text-brand-dark group-hover:text-brand-red transition-colors mb-1 tracking-tight">
                      {cat.name}
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-2 line-clamp-2">{cat.description}</p>
                    <span className="text-xs font-semibold text-brand-red">{cat.productCount} products →</span>
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
              className="group relative bg-brand-dark rounded-3xl overflow-hidden card-premium cursor-pointer"
            >
              <div aria-hidden className="absolute -top-14 -right-14 w-44 h-44 rounded-full bg-brand-red/15 blur-[60px] group-hover:bg-brand-red/30 transition-colors duration-500" />
              <div className="relative h-28 flex items-center justify-center border-b border-white/[0.07]">
                <span className="font-display font-bold text-3xl text-white tracking-tight">{b.name}</span>
              </div>
              <div className="relative p-5">
                <p className="text-brand-silver text-sm leading-relaxed mb-3 line-clamp-3">{b.blurb}</p>
                <span className="text-xs font-semibold text-brand-gold">{b.productCount} products →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
