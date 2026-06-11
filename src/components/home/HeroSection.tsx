'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Phone, ShieldCheck, Truck, BadgeCheck } from 'lucide-react'
import { BRAND } from '@/lib/brand'

const HERO_PRODUCTS = [
  { id: 'li-2000', name: 'High Pressure Washer' },
  { id: 'lij-2', name: 'Hydraulic Trolley Jack' },
  { id: 'a-101', name: 'Bench Vice' },
  { id: 'elp-w-101', name: 'Professional Spray Gun' },
]

export default function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-brand-dark">
      {/* layered cinematic background */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-ink via-brand-dark to-brand-dark" />
      <div className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]" />
      {/* ambient glow orbs */}
      <div aria-hidden className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-brand-red/20 blur-[140px] animate-float-slow" />
      <div aria-hidden className="absolute top-1/3 -right-40 w-[420px] h-[420px] rounded-full bg-brand-gold/10 blur-[130px] animate-float-slow [animation-delay:3s]" />
      <div aria-hidden className="absolute bottom-0 left-1/3 w-[360px] h-[300px] rounded-full bg-sky-700/10 blur-[120px]" />

      {/* content */}
      <div className="relative z-10 container mx-auto px-4 py-24 lg:py-28">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          {/* left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 glass-panel rounded-full px-4 py-1.5 mb-7 animate-fade-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red-bright opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red-bright" />
              </span>
              <span className="text-brand-silver text-sm">Dealer — Lion · GOWIN · Elephant</span>
            </div>

            <h1 className="font-display font-bold text-5xl sm:text-6xl xl:text-7xl leading-[1.04] tracking-tight mb-6 animate-fade-up delay-75">
              <span className="text-gradient-silver">Professional tools,</span>
              <br />
              <span className="text-gradient-red">wholesale pricing.</span>
            </h1>

            <p className="text-brand-silver text-lg sm:text-xl mb-9 leading-relaxed max-w-xl animate-fade-up delay-150">
              Mysore&apos;s trusted source for pressure washers, pneumatic tools, compressors,
              vices, jacks and garage equipment — 230+ products from three leading brands.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-up delay-225">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 bg-gradient-to-b from-brand-red-bright to-brand-red text-white px-7 py-3.5 rounded-2xl font-semibold text-base glow-red hover:brightness-110 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                Browse Catalog
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 glass-panel hover:bg-white/[0.10] text-white px-7 py-3.5 rounded-2xl font-semibold text-base active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                Request Quote
              </Link>
            </div>

            {/* trust strip */}
            <div className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-brand-silver animate-fade-up delay-300">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-brand-gold" /> Genuine products</span>
              <span className="inline-flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-brand-gold" /> 25+ years in business</span>
              <span className="inline-flex items-center gap-2"><Truck className="w-4 h-4 text-brand-gold" /> Wholesale &amp; retail</span>
              <a href={`tel:${BRAND.phone}`} className="inline-flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-brand-red-bright" /> {BRAND.mobile}
              </a>
            </div>
          </div>

          {/* right: floating product showcase */}
          <div className="hidden lg:grid grid-cols-2 gap-5 animate-fade-in delay-300" aria-hidden>
            {HERO_PRODUCTS.map((p, i) => (
              <div
                key={p.id}
                className={`glass-panel rounded-3xl p-5 card-premium ${i % 2 === 1 ? 'translate-y-8' : ''}`}
              >
                <div className="relative aspect-square rounded-2xl bg-white overflow-hidden mb-3">
                  <Image
                    src={`/products/${p.id}.jpg`}
                    alt={p.name}
                    fill
                    sizes="220px"
                    className="object-contain p-3"
                    unoptimized
                  />
                </div>
                <p className="text-white/90 text-sm font-medium">{p.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* bottom fade into page */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-surface to-transparent" />
    </section>
  )
}
