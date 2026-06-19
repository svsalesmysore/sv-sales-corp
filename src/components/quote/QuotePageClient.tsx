'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ShoppingCart, Send, Phone, ArrowLeft, Search, Upload, FileText, Clock, MessageSquare, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useQuoteCart } from '@/context/QuoteCartContext'
import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/utils'
import { getProductImage, getFallbackImage } from '@/lib/image'
import UploadListPanel, { type UploadedItem } from './UploadListPanel'

interface FormData {
  name:    string
  company: string
  phone:   string
  email:   string
  message: string
}

const EMPTY_FORM: FormData = { name: '', company: '', phone: '', email: '', message: '' }
const UPLOAD_KEY = 'sv-sales-uploaded-list'

export default function QuotePageClient() {
  const { items, totalItems, removeItem, updateQty, clearCart } = useQuoteCart()
  const [form, setForm]       = useState<FormData>(EMPTY_FORM)
  const [submitting, setSub]  = useState(false)
  const [submitted, setSent]  = useState(false)
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([])
  const [attachment, setAttachment] = useState<string | null>(null)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)

  /* persist the uploaded list so it survives reloads */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(UPLOAD_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as { items?: UploadedItem[]; attachment?: string | null }
        if (saved.items?.length) setUploadedItems(saved.items)
        if (saved.attachment) setAttachment(saved.attachment)
      }
    } catch { /* ignore */ }
  }, [])
  useEffect(() => {
    localStorage.setItem(UPLOAD_KEY, JSON.stringify({ items: uploadedItems, attachment }))
  }, [uploadedItems, attachment])

  const hasAnything = items.length > 0 || uploadedItems.length > 0 || !!attachment

  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  /** Validate cart/uploaded list + required fields before sending. */
  const validate = (): boolean => {
    if (!hasAnything) {
      toast.error('Add products or upload your list first')
      return false
    }
    if (!form.name || !form.phone) {
      toast.error('Name and phone are required')
      return false
    }
    return true
  }

  const finishSubmit = () => {
    setSent(true)
    clearCart()
    setUploadedItems([])
    setAttachment(null)
    setAttachmentFile(null)
    localStorage.removeItem(UPLOAD_KEY)
  }

  /** Submit quote — saved to DB and emailed to the owner automatically. */
  const submitQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSub(true)
    try {
      // Read attachment as base64 if present
      let fileData: string | null = null
      let fileType: string | null = null
      if (attachmentFile) {
        const buf = await attachmentFile.arrayBuffer()
        const uint8 = new Uint8Array(buf)
        let binary = ''
        const chunkSize = 8192
        for (let i = 0; i < uint8.length; i += chunkSize) {
          binary += String.fromCharCode(...uint8.subarray(i, i + chunkSize))
        }
        fileData = btoa(binary)
        fileType = attachmentFile.type || 'application/octet-stream'
      }

      const r = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({
            productId: i.product.id, name: i.product.name,
            size: i.size, qty: i.quantity, unit: i.product.unit, brand: i.product.brand,
          })),
          uploaded: uploadedItems,
          attachment,
          fileData,
          fileType,
        }),
      })
      if (!r.ok) throw new Error('server error')
      toast.success('Quote sent!', { description: 'We\'ll get back to you shortly.' })
      finishSubmit()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSub(false)
    }
  }

  /* ── Empty state: two paths — browse, or upload your own list ── */
  if (!hasAnything && !submitted) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingCart className="w-10 h-10 text-brand-red" />
            </div>
            <h1 className="font-display font-bold text-3xl text-brand-dark tracking-tight mb-3">Start your quote</h1>
            <p className="text-slate-400 mb-6">Browse the catalog and add products — or skip browsing and upload the list you already have.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-b from-brand-red-bright to-brand-red text-white px-6 py-3 rounded-xl font-semibold glow-red-soft hover:brightness-110 active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Browse Products
            </Link>
          </div>

          <div className="flex items-center gap-3 mb-6" aria-hidden>
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs uppercase tracking-wider text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <UploadListPanel
            items={uploadedItems}
            onItemsChange={setUploadedItems}
            attachment={attachment}
            onAttachmentChange={setAttachment}
            onFileChange={setAttachmentFile}
          />
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
          <h1 className="font-display font-bold text-3xl text-brand-dark mb-3">Quote sent!</h1>
          <p className="text-gray-500 mb-2">
            Thank you, <span className="font-semibold">{form.name}</span>. Your quote has been received.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            We&apos;ll review your request and reply on <span className="font-medium">{form.phone}</span> with pricing within 24 hours.
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
          <p className="text-brand-silver tabular-nums">
            {totalItems} item{totalItems !== 1 ? 's' : ''} in your quote cart
            {uploadedItems.length > 0 && ` · ${uploadedItems.length} from your uploaded list`}
            {attachment && ' · 1 file to attach'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* left: cart items */}
          <div className="lg:col-span-3 space-y-3">
            {items.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-brand-dark text-lg">Selected Products</h2>
                <button onClick={clearCart} className="text-xs text-slate-400 hover:text-brand-red transition-colors cursor-pointer">
                  Clear all
                </button>
              </div>
            )}

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

            <Link href="/products" className="flex items-center gap-2 text-sm text-brand-red hover:underline pt-2 cursor-pointer">
              <ArrowLeft className="w-4 h-4" /> Add more products
            </Link>

            {/* upload your own list */}
            <div className="pt-4">
              <UploadListPanel
                compact
                items={uploadedItems}
                onItemsChange={setUploadedItems}
                attachment={attachment}
                onAttachmentChange={setAttachment}
                onFileChange={setAttachmentFile}
              />
            </div>
          </div>

          {/* right: contact form */}
          <div className="lg:col-span-2">
            <form onSubmit={submitQuote} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
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
                    : 'bg-gradient-to-b from-brand-red-bright to-brand-red shadow-lg shadow-brand-red/20 hover:brightness-110 hover:scale-[1.02] glow-red-soft'
                )}
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Sending…' : 'Send Quote'}
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">We&apos;ll reply within 24 hours with pricing</p>
            </form>
          </div>
        </div>
      </div>

      {/* ── How to Submit + FAQ ─────────────────────────────────── */}
      <div className="border-t border-slate-100 bg-white py-14 px-4">
        <div className="container mx-auto max-w-4xl">

          {/* Two paths */}
          <h2 className="font-display font-bold text-2xl text-brand-dark mb-2">How to Request a Quote</h2>
          <p className="text-slate-400 text-sm mb-8">Choose the path that works best for you.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
            {/* Path 1 */}
            <div className="rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-brand-red/10 flex items-center justify-center">
                  <Search className="w-4 h-4 text-brand-red" />
                </div>
                <h3 className="font-semibold text-brand-dark">Browse &amp; Add</h3>
              </div>
              <ol className="space-y-3">
                {[
                  { icon: Search,      text: 'Go to Products and browse the catalog' },
                  { icon: Package,     text: 'Click "Add to Quote" on products you need' },
                  { icon: ShoppingCart,text: 'Open your Quote Cart (top right)' },
                  { icon: Send,        text: 'Fill in your details and submit' },
                ].map(({ icon: Icon, text }, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-xs font-bold text-slate-400 flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Path 2 */}
            <div className="rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-brand-red/10 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-brand-red" />
                </div>
                <h3 className="font-semibold text-brand-dark">Upload Your List</h3>
              </div>
              <ol className="space-y-3">
                {[
                  { text: 'Download our product template (Excel)' },
                  { text: 'Fill in quantities for products you need' },
                  { text: 'Upload the file in the quote page' },
                  { text: 'Fill in your details and submit' },
                ].map(({ text }, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-xs font-bold text-slate-400 flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* FAQ */}
          <h2 className="font-display font-bold text-2xl text-brand-dark mb-6">Common Questions</h2>
          <div className="space-y-4">
            {[
              {
                icon: Package,
                q: 'Can I request multiple products at once?',
                a: 'Yes — add as many products as you need before submitting. There is no limit.',
              },
              {
                icon: FileText,
                q: 'What if I already have my own list?',
                a: 'Download our template, fill in the quantities, and upload it. We also accept your own Excel or CSV files.',
              },
              {
                icon: Clock,
                q: 'How long does it take to get pricing?',
                a: 'We reply within 24 hours with a full price quote on the phone number or email you provide.',
              },
              {
                icon: Phone,
                q: 'How will you contact me?',
                a: 'Primarily via WhatsApp or phone call on the number you provide. Email if you share one.',
              },
              {
                icon: MessageSquare,
                q: 'Can I add special requirements or notes?',
                a: 'Yes — use the "Additional Notes" field to mention delivery location, urgency, or any special requirements.',
              },
            ].map(({ icon: Icon, q, a }, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-brand-red" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-brand-dark mb-1">{q}</p>
                  <p className="text-sm text-slate-500">{a}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
