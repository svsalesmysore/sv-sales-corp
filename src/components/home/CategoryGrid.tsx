'use client'

import Link from 'next/link'
import {
  Droplets, Waves, Sprout, Droplet, Settings2, Crosshair, CircleDot,
  Container, Wind, Wrench, Gauge, Car, Disc3, PaintBucket, CircleDashed,
  Filter, Cable, Zap, Box,
  Construction, Scissors, PenTool, Hammer, Magnet, Axe, Ruler, Boxes
} from 'lucide-react'
import type { Category } from '@/data/types'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Droplets, Waves, Sprout, Droplet, Settings2, Crosshair, CircleDot,
  Container, Wind, Wrench, Gauge, Car, Disc3, PaintBucket, CircleDashed,
  Filter, Cable, Zap, Box,
  Construction, Scissors, PenTool, Hammer, Magnet, Axe, Ruler, Boxes,
}

interface Props {
  categories: Category[]
}

export default function CategoryGrid({ categories }: Props) {
  return (
    <section className="py-20 bg-surface">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-brand-red text-xs font-semibold uppercase tracking-[0.24em] mb-3">Full Catalog</p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-brand-dark tracking-tight mb-4">
            Browse by category
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            231 products across 46 categories — power equipment, hand tools &amp; garage essentials
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] ?? Box
            return (
              <Link
                key={cat.id}
                href={`/products/${cat.id}`}
                className="group bg-white rounded-2xl p-5 border border-slate-200/80 card-premium hover:border-brand-red/25 cursor-pointer"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-brand-red/10 to-brand-gold/10 group-hover:from-brand-red group-hover:to-brand-red-bright rounded-xl flex items-center justify-center mb-4 transition-all duration-300">
                  <Icon className="w-6 h-6 text-brand-red group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-sm text-brand-dark mb-1 group-hover:text-brand-red transition-colors leading-snug">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 tabular-nums">{cat.productCount} products</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
