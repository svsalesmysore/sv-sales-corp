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
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-4xl text-brand-dark mb-3">
            Product Categories
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            379 products across 46 categories — Lion power equipment &amp; GOWIN hand tools for every workshop
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] ?? Box
            return (
              <Link
                key={cat.id}
                href={`/products/${cat.id}`}
                className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-100 hover:border-brand-red/30 transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-brand-red/10 group-hover:bg-brand-red/20 rounded-xl flex items-center justify-center mb-3 transition-colors">
                  <Icon className="w-6 h-6 text-brand-red" />
                </div>
                <h3 className="font-semibold text-sm text-brand-dark mb-1 group-hover:text-brand-red transition-colors leading-tight">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-400">{cat.productCount} products</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
