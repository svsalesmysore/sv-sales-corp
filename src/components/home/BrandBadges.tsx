import { Shield, Star, Award, Layers } from 'lucide-react'
import { BRAND } from '@/lib/brand'

const stats = [
  { icon: Star,   label: 'Products',          value: '231' },
  { icon: Layers, label: 'Categories',        value: '46' },
  { icon: Shield, label: 'Brands Carried',    value: '3' },
  { icon: Award,  label: 'Years in Business', value: '25+' },
]

export default function BrandBadges() {
  return (
    <section className="relative py-14 bg-brand-dark overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-grid-dark [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />
      <div className="relative container mx-auto px-4">
        {/* brand wordmarks */}
        <div className="text-center mb-10">
          <p className="text-brand-silver/80 text-xs uppercase tracking-[0.28em] mb-5">Authorized Dealer For</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
            {BRAND.authorizedFor.map((b) => (
              <span key={b} className="font-display font-bold text-xl sm:text-2xl text-white/40 hover:text-white/80 transition-colors duration-300 tracking-tight cursor-default">
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* stat tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="glass-panel rounded-2xl px-5 py-6 text-center card-premium">
              <Icon className="w-5 h-5 text-brand-gold mx-auto mb-3" />
              <div className="font-display font-bold text-3xl text-white tabular-nums">{value}</div>
              <div className="text-brand-silver text-xs mt-1 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
