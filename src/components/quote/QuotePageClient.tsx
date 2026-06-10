'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ShoppingCart, Send, Phone, ArrowLeft, MessageCircle, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { useQuoteCart } from '@/context/QuoteCartContext'
import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/utils'
import { getProductImage, getFallbackImage } from '@/lib/image'

interface FormData {
  name:    string
  company: string
  phone:   string
  email:   string
  message: string
}

const EMPTY_FORM: FormData = { name: '', company: '', phone: '', email: '', message: '' }

export default function QuotePageClient() {
  const { items, totalItems, removeItem, updateQty, clearCart } = useQuoteCart()
  const [form, setForm]       = useState<FormData>(EMPTY_FORM)
  const [submitting, setSub]  = useState(false)
  const [submitted, setSent]  = useState(false)
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})

  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  /** Validate the cart + required fields before sending. */
  const validate = (): boolean => {
    if (items.length === 0) {
      toast.error('Your quote cart is empty')
      return false
    }
    if (!form.name || !form.phone) {
      toast.error('Name and phone are required')
      return false
    }
    return true
  }

  /** Build the plain-text quote message shared by WhatsApp and email. */
  const buildQuoteText = (): string => {
    const lines = items.map(
      (i, idx) => `${idx + 1}. ${i.product.name}${i.size ? ` — ${i.product.sizeLabel || 'Size'}: ${i.size}` : ''} — Qty: ${i.quantity} ${i.product.unit}`,
    )
    return [
      '*New Quote Request — S V Sales Corporation*',
      '',
      `Name: ${form.name}`,
      form.company ? `Company: ${form.company}` : '',
      `Phone: ${form.phone}`,
      form.email ? `Email: ${form.email}` : '',
      form.message ? `Notes: ${form.message}` : '',
      '',
      `Products (${items.length}):`,
      ...lines,
    ]
      .filter(Boolean)
      .join('\n')
  }

  const finishSubmit = () => {
    setSent(true)
    clearCart()
  }

  /** Primary: open WhatsApp pre-filled with the quote, addressed to the business. */
  const submitWhatsApp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSub(true)
    const text = encodeURIComponent(buildQuoteText())
    window.open(`https://wa.me/${BRAND.whatsapp}?text=${text}`, '_blank', 'noopener,noreferrer')
    toast.success('Opening WhatsApp…', { description: 'Tap send to deliver your quote.' })
    setSub(false)
    finishSubmit()
  }

  /**
   * Fallback: open the customer's email client pre-filled to the business inbox.
   * (For fully-automatic email — no customer action — add a Resend API route and
   * POST `buildQuoteText()` to it once the site is deployed.)
   */
  const submitEmail = () => {
    if (!validate()) return
    const subject = encodeURIComponent(`New Quote Request — ${form.name}`)
    const body = encodeURIComponent(buildQuoteText().replace(/\*/g, ''))
    window.location.href = `mailto:${BRAND.email}?subject=${subject}&body=${body}`
    toast.success('Opening your email app…', { description: 'Send the email to deliver your quote.' })
    finishSubmit()
  }

  /* ── Empty state ── */
  if (items.length === 0 && !submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShoppingCart className="w-10 h-10 text-brand-red" />
          </div>
          <h1 className="font-display font-bold text-3xl text-brand-dark mb-3">Your quote cart is empty</h1>
          <p className="text-gray-400 mb-8">Browse our catalog and add products to request a quote.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-brand-red text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-red/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Browse Products
          </Link>
        </div>
      </div>
    )
  }

  /* ── Success state ── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Send className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-display font-bold text-3xl text-brand-dark mb-3">Almost done!</h1>
          <p className="text-gray-500 mb-2">
            Thank you, <span className="font-semibold">{form.name}</span>. Your quote has been prepared.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Please tap <span className="font-medium">Send</span> in the WhatsApp (or email) window that just
            opened to deliver it. We&apos;ll reply on {form.phone} with pricing shortly.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/products" className="inline-flex items-center gap-2 bg-brand-red text-white px-5 py-2.5 rounded-xl font-medium hover:bg-brand-red/80 transition-colors">
              Continue Browsing
            </Link>
            <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              <Phone className="w-4 h-4" /> WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* header */}
      <div className="relative bg-brand-dark py-14 px-4 overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-grid-dark [mask-image:radial-gradient(ellipse_60%_100%_at_30%_0%,black,transparent)]" />
        <div aria-hidden className="absolute -top-20 -right-20 w-[380px] h-[240px] rounded-full bg-brand-red/12 blur-[100px]" />
        <div className="relative container mx-auto">
          <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mb-3">
            <span className="text-gradient-silver">Request a Quote</span>
          </h1>
          <p className="text-brand-silver tabular-nums">{totalItems} item{totalItems !== 1 ? 's' : ''} in your quote cart</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* left: cart items */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-brand-dark text-lg">Selected Products</h2>
              <button onClick={clearCart} className="text-xs text-gray-400 hover:text-brand-red transition-colors">
                Clear all
              </button>
            </div>

            {items.map((item) => {
              const imgErr = imgErrors[item.product.id]
              const imgUrl = imgErr
                ? getFallbackImage()
                : getProductImage(item.product.id)

              return (
                <div key={`${item.product.id}__${item.size ?? ''}`} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4">
                  <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image
                      src={imgUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      onError={() => setImgErrors((e) => ({ ...e, [item.product.id]: true }))}
                      unoptimized
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-brand-dark line-clamp-2 mb-1">{item.product.name}</p>
                    {item.size && (
                      <p className="text-xs text-brand-red font-medium mb-0.5">{item.product.sizeLabel || 'Size'}: {item.size}</p>
                    )}
                    <p className="text-xs text-gray-400 capitalize">{item.product.categoryId.replace(/-/g, ' ')} · Per {item.product.unit}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => updateQty(item.product.id, item.size, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.product.id, item.size, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.product.id, item.size)}
                      className="ml-2 w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-brand-red hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}

            <Link href="/products" className="flex items-center gap-2 text-sm text-brand-red hover:underline pt-2">
              <ArrowLeft className="w-4 h-4" /> Add more products
            </Link>
          </div>

          {/* right: contact form */}
          <div className="lg:col-span-2">
            <form onSubmit={submitWhatsApp} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
              <h2 className="font-semibold text-brand-dark text-lg mb-5">Your Details</h2>

              <div className="space-y-4">
                {[
                  { name: 'name',    label: 'Full Name *',    type: 'text',  placeholder: 'Your name' },
                  { name: 'company', label: 'Company / Shop', type: 'text',  placeholder: 'Optional' },
                  { name: 'phone',   label: 'Phone / WhatsApp *', type: 'tel', placeholder: '+91 99999 99999' },
                  { name: 'email',   label: 'Email',          type: 'email', placeholder: 'Optional' },
                ].map(({ name, label, type, placeholder }) => (
                  <div key={name}>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
                    <input
                      type={type}
                      name={name}
                      value={form[name as keyof FormData]}
                      onChange={handleField}
                      placeholder={placeholder}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-brand-dark placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Additional Notes</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleField}
                    rows={3}
                    placeholder="Delivery location, urgency, special requirements..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-brand-dark placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition resize-none"
                  />
                </div>
              </div>

              {/* Primary: WhatsApp */}
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all mt-5',
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 hover:scale-[1.02]'
                )}
              >
                <MessageCircle className="w-4 h-4" />
                {submitting ? 'Opening WhatsApp…' : 'Send Quote via WhatsApp'}
              </button>

              {/* Fallback: Email */}
              <button
                type="button"
                onClick={submitEmail}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-gray-600 border border-gray-200 hover:border-brand-red hover:text-brand-red transition-all mt-3"
              >
                <Mail className="w-4 h-4" />
                Email the Quote Instead
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                We&apos;ll reply within 24 hours with pricing
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
