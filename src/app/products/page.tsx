import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Droplets, Waves, Sprout, Droplet, Settings2, Crosshair, CircleDot,
  Container, Wind, Wrench, Gauge, Car, Disc3, PaintBucket, CircleDashed,
  Filter, Cable, Zap, Box,
  Construction, Scissors, PenTool, Hammer, Magnet, Axe, Ruler, Boxes
} from 'lucide-react'
import { categoriesWithCounts } from '@/data/index'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse 379 products across 46 categories — Lion Pneumatic Tools & GOWIN hand tools at S V Sales Corporation, Mysore.',
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Droplets, Waves, Sprout, Droplet, Settings2, Crosshair, CircleDot,
  Container, Wind, Wrench, Gauge, Car, Disc3, PaintBucket, CircleDashed,
  Filter, Cable, Zap, Box,
  Construction, Scissors, PenTool, Hammer, Magnet, Axe, Ruler, Boxes,
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* header */}
      <div className="bg-brand-dark py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="font-display font-bold text-5xl text-white mb-3">Product Catalog</h1>
          <p className="text-brand-silver text-lg max-w-xl mx-auto">
            379 products across 46 categories — Lion pressure washers &amp; pneumatic tools plus GOWIN vices, hand tools &amp; garage equipment
          </p>
        </div>
      </div>

      {/* category grid */}
      <div className="container mx-auto px-4 py-12">
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
                    <p className="text-gray-400 text-sm leading-relaxed mb-2 line-clamp-2">
                      {cat.description}
                    </p>
                    <span className="text-xs font-medium text-brand-red">
                      {cat.productCount} products →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
