import HeroSection from '@/components/home/HeroSection'
import CategoryGrid from '@/components/home/CategoryGrid'
import BrandBadges from '@/components/home/BrandBadges'
import { categoriesWithCounts, brands } from '@/data/index'
import Link from 'next/link'
import { ArrowRight, Phone, MessageCircle } from 'lucide-react'
import { BRAND } from '@/lib/brand'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandBadges />
      <CategoryGrid categories={categoriesWithCounts} />

      {/* brand showcase */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-brand-red text-xs font-semibold uppercase tracking-[0.24em] mb-3">Our Brands</p>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-brand-dark tracking-tight">
              Three brands, one trusted source
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/products/brand/${b.id}`}
                className="group relative bg-brand-dark rounded-3xl p-8 overflow-hidden card-premium cursor-pointer"
              >
                <div aria-hidden className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-brand-red/15 blur-[70px] group-hover:bg-brand-red/30 transition-colors duration-500" />
                <div className="relative">
                  <h3 className="font-display font-bold text-3xl text-white tracking-tight mb-3">{b.name}</h3>
                  <p className="text-brand-silver text-sm leading-relaxed mb-6 line-clamp-3">{b.blurb}</p>
                  <span className="inline-flex items-center gap-2 text-brand-gold text-sm font-semibold">
                    {b.productCount} products
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="relative py-24 bg-brand-dark overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_60%_80%_at_50%_50%,black,transparent)]" />
        <div aria-hidden className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[560px] h-[300px] rounded-full bg-brand-red/20 blur-[120px]" />
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mb-5">
            <span className="text-gradient-silver">Need a bulk quote?</span>
          </h2>
          <p className="text-brand-silver text-lg mb-10 max-w-lg mx-auto">
            Add products to your quote cart and we&apos;ll get back to you with the best wholesale pricing — usually within 24 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/quote"
              className="group inline-flex items-center gap-2 bg-gradient-to-b from-brand-red-bright to-brand-red text-white px-8 py-4 rounded-2xl font-semibold glow-red hover:brightness-110 active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              Request a Quote
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
            <a
              href={`https://wa.me/${BRAND.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 glass-panel hover:bg-white/[0.10] text-white px-8 py-4 rounded-2xl font-semibold active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-green-400" /> WhatsApp Us
            </a>
          </div>
          <p className="mt-8 text-brand-silver/80 text-sm inline-flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" /> {BRAND.phone} / {BRAND.mobile}
          </p>
        </div>
      </section>
    </>
  )
}
