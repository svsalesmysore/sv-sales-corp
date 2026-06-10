import type { Metadata } from 'next'
import { Shield, Award, Users, MapPin, Star } from 'lucide-react'
import { BRAND } from '@/lib/brand'

export const metadata: Metadata = {
  title: 'About Us',
  description: `Learn about S V Sales Corporation — Mysore's authorized dealer for Lion Pneumatic Tools, pressure washers and garage equipment since 1999.`,
}

const milestones = [
  { year: '1999', title: 'Founded', desc: 'Established in Mysore as a specialized automotive tools & equipment dealer' },
  { year: '2008', title: 'Cleaning Equipment', desc: 'Expanded into high-pressure washers and car-care equipment' },
  { year: '2015', title: 'Pneumatic Range', desc: 'Added pneumatic impact wrenches, air compressors and garage tools' },
  { year: '2020', title: 'Lion Dealership', desc: 'Became authorized dealer for the Lion Pneumatic Tools range' },
  { year: '2026', title: '145 Products', desc: 'Full Lion catalogue — 145 products across 18 categories' },
]

const values = [
  { icon: Shield, title: 'Quality Assured', desc: 'Genuine Lion products, built for professional garage and industrial use' },
  { icon: Award,  title: 'Authorized Dealer', desc: 'Official dealer for the complete Lion Pneumatic Tools range' },
  { icon: Users,  title: 'Wholesale & Retail', desc: 'Competitive pricing for individual buyers and bulk workshop orders' },
  { icon: Star,   title: 'Expert Guidance', desc: '25+ years of experience helping workshops choose the right equipment' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* hero */}
      <div className="bg-brand-dark py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="font-display font-bold text-5xl text-white mb-4">{BRAND.name}</h1>
          <p className="text-brand-silver text-xl leading-relaxed">{BRAND.tagline}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {BRAND.authorizedFor.map((b) => (
              <span key={b} className="bg-brand-red/20 border border-brand-red/40 text-white rounded-full px-4 py-1.5 text-sm">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-display font-bold text-3xl text-center text-brand-dark mb-10">Why Choose Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                <div className="w-12 h-12 bg-brand-red/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-brand-red" />
                </div>
                <h3 className="font-semibold text-brand-dark mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* timeline */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display font-bold text-3xl text-center text-brand-dark mb-10">Our Journey</h2>
          <div className="space-y-6">
            {milestones.map((m) => (
              <div key={m.year} className="flex gap-6">
                <div className="shrink-0 text-right w-16">
                  <span className="font-display font-bold text-brand-red text-lg">{m.year}</span>
                </div>
                <div className="relative pl-6 border-l-2 border-gray-200 pb-6 last:pb-0">
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-brand-red border-2 border-white" />
                  <h3 className="font-semibold text-brand-dark mb-1">{m.title}</h3>
                  <p className="text-gray-500 text-sm">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* address */}
      <section className="py-12 bg-brand-dark">
        <div className="container mx-auto px-4 text-center">
          <MapPin className="w-8 h-8 text-brand-red mx-auto mb-3" />
          <p className="text-white font-medium mb-1">{BRAND.name}</p>
          <p className="text-brand-silver">{BRAND.address}</p>
        </div>
      </section>
    </div>
  )
}
