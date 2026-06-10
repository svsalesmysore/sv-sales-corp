import { Shield, Star, Award } from 'lucide-react'
import { BRAND } from '@/lib/brand'

const stats = [
  { icon: Star,   label: 'Products',           value: '360' },
  { icon: Shield, label: 'Categories',          value: '43' },
  { icon: Award,  label: 'Years in Business',   value: '25+' },
]

export default function BrandBadges() {
  return (
    <section className="py-12 bg-brand-dark border-y border-white/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-brand-silver text-sm uppercase tracking-widest mb-2">Authorized Dealer for</p>
          <div className="flex flex-wrap justify-center gap-3">
            {BRAND.authorizedFor.map((b) => (
              <span key={b} className="bg-brand-red/20 border border-brand-red/40 text-white rounded-full px-4 py-1.5 text-sm font-medium">
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <div className="w-10 h-10 bg-brand-red/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Icon className="w-5 h-5 text-brand-red" />
              </div>
              <div className="font-display font-bold text-2xl text-white">{value}</div>
              <div className="text-brand-silver text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
