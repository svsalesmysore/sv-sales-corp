'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import { BRAND } from '@/lib/brand'

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-brand-dark via-brand-steel to-brand-dark animate-pulse" />
  ),
})

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-brand-dark">
      {/* Spline 3D background */}
      <div className="absolute inset-0 opacity-60">
        <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
      </div>

      {/* gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 via-brand-dark/60 to-transparent" />

      {/* content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-brand-red/20 border border-brand-red/40 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-brand-red rounded-full animate-pulse" />
            <span className="text-brand-silver text-sm">Authorized Dealer — ELGI · Unipatch · Taparia</span>
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6">
            S V Sales<br />
            <span className="text-brand-red">Corporation</span>
          </h1>

          <p className="text-brand-silver text-lg sm:text-xl mb-8 leading-relaxed max-w-xl">
            Mysore's trusted wholesale &amp; retail dealer for industrial and garage hand tools,
            tyre retreading accessories, and automotive equipment.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red/80 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-brand-red/30"
            >
              Browse Catalog <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:bg-white/10"
            >
              Request Quote
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-2 text-brand-silver text-sm">
            <Phone className="w-4 h-4 text-brand-red" />
            <span>{BRAND.phone} / {BRAND.mobile}</span>
            <span className="text-white/30 mx-2">·</span>
            <span>{BRAND.address}</span>
          </div>
        </div>
      </div>

      {/* bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
