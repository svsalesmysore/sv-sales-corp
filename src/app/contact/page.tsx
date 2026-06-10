import type { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react'
import { BRAND } from '@/lib/brand'

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with S V Sales Corporation, Mysore — call, WhatsApp, or visit our showroom.`,
}

const contactCards = [
  {
    icon: Phone,
    title: 'Call Us',
    lines: [BRAND.phone, BRAND.mobile],
    action: { href: `tel:${BRAND.phone}`, label: 'Call now' },
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    lines: [`+${BRAND.whatsapp}`, 'Quick response guaranteed'],
    action: { href: `https://wa.me/${BRAND.whatsapp}`, label: 'Open WhatsApp' },
  },
  {
    icon: Mail,
    title: 'Email',
    lines: [BRAND.email, 'We reply within 24 hrs'],
    action: { href: `mailto:${BRAND.email}`, label: 'Send email' },
  },
  {
    icon: Clock,
    title: 'Working Hours',
    lines: ['Mon – Sat: 9 AM – 7 PM', 'Sunday: Closed'],
    action: null,
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* header */}
      <div className="relative bg-brand-dark py-20 px-4 overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_60%_90%_at_50%_0%,black,transparent)]" />
        <div aria-hidden className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[280px] rounded-full bg-brand-red/15 blur-[110px]" />
        <div className="relative container mx-auto text-center">
          <h1 className="font-display font-bold text-5xl sm:text-6xl tracking-tight mb-4">
            <span className="text-gradient-silver">Contact Us</span>
          </h1>
          <p className="text-brand-silver text-lg">We&apos;re here to help with quotes, orders, and technical questions</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {contactCards.map(({ icon: Icon, title, lines, action }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <div className="w-12 h-12 bg-brand-red/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-brand-red" />
              </div>
              <h3 className="font-semibold text-brand-dark mb-2">{title}</h3>
              {lines.map((l) => (
                <p key={l} className="text-gray-500 text-sm">{l}</p>
              ))}
              {action && (
                <a
                  href={action.href}
                  target={action.href.startsWith('http') ? '_blank' : undefined}
                  rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="inline-block mt-4 text-sm font-medium text-brand-red hover:underline"
                >
                  {action.label} →
                </a>
              )}
            </div>
          ))}
        </div>

        {/* address + map placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-start gap-3 mb-6">
              <MapPin className="w-5 h-5 text-brand-red mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-brand-dark mb-1">{BRAND.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{BRAND.address}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-500">
              <p className="font-medium text-brand-dark">Authorized Dealer for:</p>
              {BRAND.authorizedFor.map((b) => (
                <div key={b} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-red shrink-0" />
                  {b}
                </div>
              ))}
            </div>

            <a
              href={`https://wa.me/${BRAND.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Google Maps embed placeholder */}
          <div className="bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 min-h-[300px] flex items-center justify-center">
            <div className="text-center text-gray-400 px-6">
              <MapPin className="w-10 h-10 mx-auto mb-3 text-brand-red" />
              <p className="font-medium text-brand-dark mb-1">Srinivaspura 2nd Stage, Mysore</p>
              <p className="text-sm">#3, 1st Block, SBIIM Layout</p>
              <p className="text-sm">Mysore – 570 023, Karnataka</p>
              <a
                href="https://maps.google.com/?q=Srinivaspura+2nd+Stage+Mysore+Karnataka+India"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm text-brand-red hover:underline"
              >
                Open in Google Maps →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
