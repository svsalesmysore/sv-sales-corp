import type { Metadata } from 'next'
import './globals.css'
import { QuoteCartProvider } from '@/context/QuoteCartContext'
import { Toaster } from '@/components/ui/sonner'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AuthHandler from '@/components/AuthHandler'
import { BRAND } from '@/lib/brand'

export const metadata: Metadata = {
  title: {
    default: BRAND.name,
    template: `%s | ${BRAND.name}`,
  },
  description: `${BRAND.tagline} — Mysore, Karnataka`,
  keywords: ['Lion Pneumatic Tools', 'pressure washer', 'air compressor', 'impact wrench', 'hydraulic jack', 'foam cannon', 'Mysore', 'dealer'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white text-gray-900 antialiased">
        <QuoteCartProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <Footer />
          </div>
          <AuthHandler />
          <Toaster richColors position="bottom-right" />
        </QuoteCartProvider>
      </body>
    </html>
  )
}
