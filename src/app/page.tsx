import HeroSection from '@/components/home/HeroSection'
import CategoryGrid from '@/components/home/CategoryGrid'
import BrandBadges from '@/components/home/BrandBadges'
import { categoriesWithCounts } from '@/data/index'
import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import { BRAND } from '@/lib/brand'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandBadges />
      <CategoryGrid categories={categoriesWithCounts} />

      {/* CTA strip */}
      <section className="py-16 bg-brand-red">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
            Need a bulk quote?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
            Add products to your quote cart and we'll get back to you with wholesale pricing.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 bg-white text-brand-red hover:bg-white/90 px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Request a Quote <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={`https://wa.me/${BRAND.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white/10 px-6 py-3 rounded-xl font-semibold transition-all"
            >
              <Phone className="w-4 h-4" /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
