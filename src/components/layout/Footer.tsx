import Link from 'next/link'
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react'
import { BRAND } from '@/lib/brand'

const categories = [
  { id: 'domestic-pressure-washer', name: 'Pressure Washers' },
  { id: 'impact-wrench',            name: 'Impact Wrenches' },
  { id: 'air-compressor',           name: 'Air Compressors' },
  { id: 'hydraulic-jack',           name: 'Hydraulic Jacks' },
  { id: 'gowin-vices',              name: 'Bench Vices' },
  { id: 'elp-conventional-guns',    name: 'Spray Guns' },
]

export default function Footer() {
  return (
    <footer className="relative bg-brand-dark border-t border-white/[0.08] overflow-hidden">
      <div aria-hidden className="absolute -top-32 right-0 w-[420px] h-[280px] rounded-full bg-brand-red/10 blur-[110px]" />
      <div className="relative container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-display font-bold text-2xl text-white tracking-tight mb-3">{BRAND.name}</h3>
            <p className="text-brand-silver text-sm mb-5 leading-relaxed">{BRAND.tagline}</p>
            <div className="flex flex-wrap gap-2">
              {BRAND.dealerFor.map((b) => (
                <span key={b} className="text-xs glass-panel text-brand-silver rounded-full px-3 py-1">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* categories */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Products</h4>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/products/${c.id}`} className="text-brand-silver text-sm hover:text-white transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/products" className="text-brand-gold text-sm hover:text-brand-gold/80 transition-colors flex items-center gap-1">
                  All Categories <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* quick links */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: '/about',   label: 'About Us' },
                { href: '/contact', label: 'Contact' },
                { href: '/quote',   label: 'Request a Quote' },
                { href: '/search',  label: 'Search Products' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-brand-silver text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-brand-silver text-sm">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-brand-red" />
                <span>{BRAND.address}</span>
              </li>
              <li>
                <a href={`tel:${BRAND.phone}`} className="flex items-center gap-2 text-brand-silver text-sm hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-brand-red" />
                  {BRAND.phone}
                </a>
              </li>
              <li>
                <a href={`tel:${BRAND.mobile}`} className="flex items-center gap-2 text-brand-silver text-sm hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-brand-red" />
                  {BRAND.mobile}
                </a>
              </li>
              <li>
                <a href={`mailto:${BRAND.email}`} className="flex items-center gap-2 text-brand-silver text-sm hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-brand-red" />
                  {BRAND.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${BRAND.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors mt-1"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4">
        <div className="container mx-auto px-4 text-center text-brand-silver text-xs">
          © {new Date().getFullYear()} {BRAND.name}, Mysore. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
