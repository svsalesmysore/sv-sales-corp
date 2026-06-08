'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ShoppingCart, Send, Phone, ArrowLeft } from 'lucide-react'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      toast.error('Your quote cart is empty')
      return
    }
    if (!form.name || !form.phone) {
      toast.error('Name and phone are required')
      return
    }
    setSub(true)

    // Build quote payload
    const payload = {
      ...form,
      items: items.map((i) => ({
        product: i.product.name,
        category: i.product.categoryId,
        unit: i.product.unit,
        quantity: i.quantity,
      })),
      submittedAt: new Date().toISOString(),
    }

    // LOCAL: log to console; replace with Resend API call when deploying
    console.log('📋 Quote Request Submitted:', JSON.stringify(payload, null, 2))

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800))

    setSub(false)
    setSent(true)
    clearCart()
    toast.success('Quote request submitted!', {
      description: `We'll contact you on ${form.phone} shortly.`,
    })
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
          <h1 className="font-display font-bold text-3xl text-brand-dark mb-3">Quote Submitted!</h1>
          <p className="text-gray-500 mb-2">
            Thank you, <span className="font-semibold">{form.name}</span>. We&apos;ve received your quote request.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            We&apos;ll contact you on {form.phone} with pricing details shortly.
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
    <div className="min-h-screen bg-gray-50">
      {/* header */}
      <div className="bg-brand-dark py-12 px-4">
        <div className="container mx-auto">
          <h1 className="font-display font-bold text-4xl text-white mb-2">Request a Quote</h1>
          <p className="text-brand-silver">{totalItems} item{totalItems !== 1 ? 's' : ''} in your quote cart</p>
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
                ? getFallbackImage(120, 90)
                : getProductImage(item.product.imageQuery, item.product.id, 120, 90)

              return (
                <div key={item.product.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4">
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
                    <p className="text-xs text-gray-400 capitalize">{item.product.categoryId.replace(/-/g, ' ')} · Per {item.product.unit}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => updateQty(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.product.id)}
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
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
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

              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all mt-5',
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-brand-red hover:bg-brand-red/80 shadow-lg shadow-brand-red/20 hover:scale-[1.02]'
                )}
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Submitting…' : 'Submit Quote Request'}
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
