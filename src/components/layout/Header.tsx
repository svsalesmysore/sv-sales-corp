'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ShoppingCart, Phone, Wrench, Search } from 'lucide-react'
import { useQuoteCart } from '@/context/QuoteCartContext'
import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/utils'
import SearchOverlay from '@/components/search/SearchOverlay'

const navLinks = [
  { href: '/',         label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/about',    label: 'About' },
  { href: '/contact',  label: 'Contact' },
]

export default function Header() {
  const pathname   = usePathname()
  const { totalItems } = useQuoteCart()
  const [menuOpen, setMenuOpen]   = useState(false)
  const [scrolled, setScrolled]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ⌘K / Ctrl+K opens search */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled ? 'glass-dark shadow-xl shadow-black/25' : 'bg-brand-dark'
      )}
    >
      {/* top bar */}
      <div className="border-b border-white/[0.06] text-xs py-1.5 hidden sm:block">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <span className="text-brand-silver">
            Authorized Dealer — <span className="text-white/90">Lion</span> · <span className="text-white/90">GOWIN</span> · <span className="text-white/90">Elephant</span> · Mysore, Karnataka
          </span>
          <a href={`tel:${BRAND.phone}`} className="flex items-center gap-1.5 text-brand-silver hover:text-brand-gold transition-colors">
            <Phone className="w-3 h-3" />
            {BRAND.phone} / {BRAND.mobile}
          </a>
        </div>
      </div>

      {/* main nav */}
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* logo */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-red-bright to-brand-red rounded-xl flex items-center justify-center glow-red-soft group-hover:scale-105 transition-transform duration-200">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-display font-bold text-lg leading-tight tracking-tight">S V Sales</div>
              <div className="text-brand-silver text-[11px] leading-tight tracking-[0.18em] uppercase">Corporation</div>
            </div>
          </Link>

          {/* desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                  pathname === link.href
                    ? 'text-white after:absolute after:left-4 after:right-4 after:-bottom-[1px] after:h-[2px] after:rounded-full after:bg-gradient-to-r after:from-brand-red-bright after:to-brand-gold'
                    : 'text-brand-silver hover:text-white hover:bg-white/[0.06]'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* right side */}
          <div className="flex items-center gap-2.5">
            {/* search products */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 text-brand-silver hover:text-white hairline hover:border-white/25 bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
              aria-label="Search products"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden lg:inline text-[10px] text-brand-silver/70 bg-white/[0.06] rounded px-1.5 py-0.5 border border-white/10">⌘K</kbd>
            </button>

            {/* quote cart */}
            <Link
              href="/quote"
              className="relative flex items-center gap-2 bg-gradient-to-b from-brand-red-bright to-brand-red hover:brightness-110 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 glow-red-soft cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Quote</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-gold text-brand-dark text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* mobile menu toggle */}
            <button
              className="md:hidden text-brand-silver hover:text-white p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 py-3 space-y-1">
            <button
              onClick={() => { setMenuOpen(false); setSearchOpen(true) }}
              className="w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-brand-silver hover:text-white hover:bg-white/10"
            >
              <Search className="w-4 h-4" /> Search Products
            </button>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'block px-4 py-2.5 rounded-md text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-brand-red text-white'
                    : 'text-brand-silver hover:text-white hover:bg-white/10'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/10 mt-2 pt-2 px-4">
              <a href={`tel:${BRAND.phone}`} className="text-brand-silver text-xs flex items-center gap-1">
                <Phone className="w-3 h-3" /> {BRAND.phone}
              </a>
            </div>
          </div>
        )}
      </nav>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
