'use client'

/**
 * Owner-only admin panel: stock tally, quotes inbox, sales log.
 * Stock counts live here ONLY — never shown on the public site.
 */
import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Lock, Boxes, Inbox, Receipt, Search, Save, Upload, Download, X, Plus,
  Check, RefreshCw, LogOut, AlertTriangle, Phone, Trash2, FileSpreadsheet,
} from 'lucide-react'
import { toast } from 'sonner'
import { allProducts } from '@/data/index'
import { cn } from '@/lib/utils'

/* ── local types (mirror src/lib/store.ts) ── */
interface StockEntry { key: string; productId: string; model: string; label: string; brand: string; categoryId: string; qty: number }
interface QuoteLine { productId: string; name: string; size?: string; qty: number; unit: string }
interface QuoteRecord {
  id: string; createdAt: string; name: string; company?: string; phone: string; email?: string
  message?: string; items: QuoteLine[]; uploaded: { name: string; qty: number }[]
  attachment?: string | null; status: 'new' | 'deal' | 'dismissed'; dealAt?: string
}
interface SaleLine { key: string; label: string; qty: number }
interface SaleRecord { id: string; at: string; source: 'quote' | 'manual'; quoteId?: string; customer?: string; lines: SaleLine[] }

/** Resolve a quote line to its stock key (family variants → productId::model). */
function resolveLine(l: QuoteLine): SaleLine {
  const p = allProducts.find((x) => x.id === l.productId)
  if (p?.variants?.length && l.size) {
    const v = p.variants.find((x) => x.option === l.size)
    if (v) return { key: `${p.id}::${v.model || v.option}`, label: `${p.name} — ${l.size}`, qty: l.qty }
  }
  return { key: l.productId, label: l.size ? `${l.name} — ${l.size}` : l.name, qty: l.qty }
}

const fmtDate = (iso: string) => new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState<'stock' | 'quotes' | 'sales'>('stock')

  const [stock, setStockList] = useState<StockEntry[]>([])
  const [dirty, setDirty] = useState<Record<string, number>>({})
  const [stockQuery, setStockQuery] = useState('')

  const [quotes, setQuotes] = useState<QuoteRecord[]>([])
  const [sales, setSales] = useState<SaleRecord[]>([])

  /* deal/manual-sale dialog */
  const [dealQuote, setDealQuote] = useState<QuoteRecord | null>(null)
  const [manualOpen, setManualOpen] = useState(false)
  const [dealLines, setDealLines] = useState<SaleLine[]>([])
  const [dealCustomer, setDealCustomer] = useState('')
  const [pickerQuery, setPickerQuery] = useState('')

  /* ── data loading ── */
  const loadAll = useCallback(async () => {
    const [s, q, sl] = await Promise.all([
      fetch('/api/admin/stock').then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
      fetch('/api/quotes').then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
      fetch('/api/admin/sales').then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
    ])
    setStockList(s.stock); setQuotes(q.quotes); setSales(sl.sales)
  }, [])

  useEffect(() => {
    fetch('/api/admin/stock').then(async (r) => {
      if (r.ok) { setAuthed(true); loadAll() } else setAuthed(false)
    }).catch(() => setAuthed(false))
  }, [loadAll])

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    const r = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
    if (r.ok) { setAuthed(true); loadAll(); toast.success('Welcome back') }
    else toast.error('Wrong password')
  }
  const logout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    setAuthed(false)
  }

  /* ── stock helpers ── */
  const visibleStock = useMemo(() => {
    const q = stockQuery.trim().toLowerCase()
    if (!q) return stock
    return stock.filter((s) =>
      s.label.toLowerCase().includes(q) || s.model.toLowerCase().includes(q) ||
      s.brand.toLowerCase().includes(q) || s.categoryId.includes(q))
  }, [stock, stockQuery])

  const effQty = (s: StockEntry) => (s.key in dirty ? dirty[s.key] : s.qty)

  const saveStock = async () => {
    if (!Object.keys(dirty).length) return
    const r = await fetch('/api/admin/stock', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ updates: dirty }) })
    if (r.ok) {
      toast.success(`Saved ${Object.keys(dirty).length} change${Object.keys(dirty).length !== 1 ? 's' : ''}`)
      setDirty({}); loadAll()
    } else toast.error('Save failed')
  }

  const exportCsv = () => {
    const rows = [['Model', 'Product', 'Brand', 'Category', 'Stock'],
      ...stock.map((s) => [s.model, s.label, s.brand, s.categoryId, String(effQty(s))])]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'sv-sales-stock.csv'
    a.click()
  }

  const importFile = async (file: File) => {
    try {
      const XLSX = await import('xlsx')
      const wb = XLSX.read(await file.arrayBuffer())
      const rows = XLSX.utils.sheet_to_json<(string | number)[]>(wb.Sheets[wb.SheetNames[0]], { header: 1 })
      const byModel = new Map(stock.filter((s) => s.model).map((s) => [s.model.toLowerCase(), s.key]))
      const byLabel = new Map(stock.map((s) => [s.label.toLowerCase(), s.key]))
      const updates: Record<string, number> = {}
      let missed = 0
      for (const row of rows) {
        const cells = (row ?? []).map((c) => String(c ?? '').trim())
        const name = cells[0]; const qty = Number(cells.find((c, i) => i > 0 && /^-?\d+$/.test(c)))
        if (!name || !Number.isFinite(qty)) continue
        const key = byModel.get(name.toLowerCase()) ?? byLabel.get(name.toLowerCase())
        if (key) updates[key] = qty
        else missed++
      }
      if (!Object.keys(updates).length) { toast.error('No rows matched. Use Model or full Product name in column 1, qty in column 2.'); return }
      setDirty((d) => ({ ...d, ...updates }))
      toast.success(`Imported ${Object.keys(updates).length} rows${missed ? ` (${missed} unmatched)` : ''} — review & Save`)
    } catch { toast.error('Could not read the file') }
  }

  /* ── deal dialog ── */
  const openDeal = (q: QuoteRecord) => {
    setDealQuote(q); setManualOpen(false)
    setDealCustomer(q.name)
    setDealLines(q.items.map(resolveLine))
    setPickerQuery('')
  }
  const openManual = () => {
    setManualOpen(true); setDealQuote(null)
    setDealCustomer(''); setDealLines([]); setPickerQuery('')
  }
  const closeDialog = () => { setDealQuote(null); setManualOpen(false) }

  const pickerResults = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase()
    if (q.length < 2) return []
    return stock.filter((s) => s.label.toLowerCase().includes(q) || s.model.toLowerCase().includes(q)).slice(0, 8)
  }, [pickerQuery, stock])

  const confirmDeal = async () => {
    const lines = dealLines.filter((l) => l.qty > 0)
    if (!lines.length) { toast.error('Add at least one line'); return }
    const r = await fetch('/api/admin/deal', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines, quoteId: dealQuote?.id, customer: dealCustomer || undefined }),
    })
    if (r.ok) {
      toast.success(dealQuote ? 'Deal confirmed — stock updated' : 'Sale recorded — stock updated')
      closeDialog(); loadAll()
    } else toast.error('Failed to record')
  }

  const dismissQuote = async (id: string, status: 'dismissed' | 'new') => {
    await fetch('/api/quotes', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    loadAll()
  }

  /* ── render ── */
  if (authed === null) return <div className="min-h-screen bg-surface flex items-center justify-center text-slate-400">Loading…</div>

  if (!authed) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
        <form onSubmit={login} className="glass-panel rounded-3xl p-8 w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-brand-red-bright to-brand-red rounded-2xl flex items-center justify-center mx-auto mb-5 glow-red-soft">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white mb-1">Admin</h1>
          <p className="text-brand-silver text-sm mb-6">Stock tally &amp; quote management</p>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password" autoFocus
            className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-red/50 mb-4"
          />
          <button type="submit" className="w-full bg-gradient-to-b from-brand-red-bright to-brand-red text-white font-semibold py-3 rounded-xl glow-red-soft hover:brightness-110 transition-all cursor-pointer">
            Sign in
          </button>
        </form>
      </div>
    )
  }

  const newQuotes = quotes.filter((q) => q.status === 'new')

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* admin bar */}
      <div className="bg-brand-dark px-4 py-5">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="font-display font-bold text-2xl text-white tracking-tight">Admin — Stock &amp; Quotes</h1>
          <div className="flex items-center gap-2">
            <button onClick={loadAll} className="text-brand-silver hover:text-white p-2 cursor-pointer" aria-label="Refresh"><RefreshCw className="w-4 h-4" /></button>
            <button onClick={logout} className="flex items-center gap-1.5 text-brand-silver hover:text-white text-sm px-3 py-1.5 hairline rounded-lg cursor-pointer"><LogOut className="w-3.5 h-3.5" /> Logout</button>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="container mx-auto px-4 mt-6">
        <div className="inline-flex bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm mb-6">
          {([
            { id: 'stock', label: 'Stock', icon: Boxes, badge: 0 },
            { id: 'quotes', label: 'Quotes', icon: Inbox, badge: newQuotes.length },
            { id: 'sales', label: 'Sales', icon: Receipt, badge: 0 },
          ] as const).map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => setTab(id)}
              className={cn('relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer',
                tab === id ? 'bg-gradient-to-b from-brand-red-bright to-brand-red text-white' : 'text-slate-500 hover:text-brand-dark')}>
              <Icon className="w-4 h-4" /> {label}
              {badge > 0 && <span className="ml-1 bg-brand-gold text-brand-dark text-[10px] font-bold rounded-full px-1.5 py-0.5 tabular-nums">{badge}</span>}
            </button>
          ))}
        </div>

        {/* ── STOCK ── */}
        {tab === 'stock' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input value={stockQuery} onChange={(e) => setStockQuery(e.target.value)} placeholder="Search product, model, brand…"
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30" />
              </div>
              <a href="/SV-Sales-Stock-Count-Template.xlsx" download
                className="flex items-center gap-1.5 text-sm font-medium text-brand-red border border-brand-red/30 bg-brand-red/5 rounded-xl px-3.5 py-2 hover:bg-brand-red/10 cursor-pointer">
                <FileSpreadsheet className="w-4 h-4" /> Blank Template
              </a>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl px-3.5 py-2 hover:border-brand-red/40 cursor-pointer">
                <Upload className="w-4 h-4" /> Import Excel/CSV
                <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importFile(f); e.currentTarget.value = '' }} />
              </label>
              <button onClick={exportCsv} className="flex items-center gap-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl px-3.5 py-2 hover:border-brand-red/40 cursor-pointer">
                <Download className="w-4 h-4" /> Export
              </button>
              <button onClick={saveStock} disabled={!Object.keys(dirty).length}
                className={cn('flex items-center gap-1.5 text-sm font-semibold rounded-xl px-4 py-2 transition-all',
                  Object.keys(dirty).length ? 'bg-gradient-to-b from-brand-red-bright to-brand-red text-white glow-red-soft cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-not-allowed')}>
                <Save className="w-4 h-4" /> Save{Object.keys(dirty).length ? ` (${Object.keys(dirty).length})` : ''}
              </button>
            </div>
            <div className="max-h-[62vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Product</th>
                    <th className="px-4 py-2.5 font-semibold">Model</th>
                    <th className="px-4 py-2.5 font-semibold hidden md:table-cell">Brand</th>
                    <th className="px-4 py-2.5 font-semibold text-right w-32">In Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleStock.map((s) => {
                    const q = effQty(s)
                    return (
                      <tr key={s.key} className={cn('border-t border-slate-50', q < 0 && 'bg-red-50', q === 0 && 'bg-amber-50/50')}>
                        <td className="px-4 py-2 text-brand-dark">{s.label}</td>
                        <td className="px-4 py-2 text-slate-400 font-mono text-xs">{s.model}</td>
                        <td className="px-4 py-2 text-slate-400 hidden md:table-cell">{s.brand}</td>
                        <td className="px-4 py-2 text-right">
                          <span className="inline-flex items-center gap-1.5">
                            {q < 0 && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                            <input type="number" value={q}
                              onChange={(e) => setDirty((d) => ({ ...d, [s.key]: Math.trunc(Number(e.target.value) || 0) }))}
                              className={cn('w-20 text-right border rounded-lg px-2 py-1 tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-red/30',
                                s.key in dirty ? 'border-brand-red/50 bg-brand-red/5' : 'border-slate-200')} />
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {!visibleStock.length && <p className="text-center text-slate-400 py-12">No matching products</p>}
            </div>
          </div>
        )}

        {/* ── QUOTES ── */}
        {tab === 'quotes' && (
          <div className="space-y-3">
            {!quotes.length && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
                No quote requests yet. They&apos;ll appear here when customers submit from the website.
              </div>
            )}
            {quotes.map((q) => (
              <div key={q.id} className={cn('bg-white rounded-2xl border p-5', q.status === 'deal' ? 'border-green-200' : q.status === 'dismissed' ? 'border-slate-100 opacity-60' : 'border-slate-200/80')}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-brand-dark">{q.name}</span>
                      {q.company && <span className="text-slate-400 text-sm">· {q.company}</span>}
                      <span className={cn('text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5',
                        q.status === 'deal' ? 'bg-green-100 text-green-700' : q.status === 'dismissed' ? 'bg-slate-100 text-slate-500' : 'bg-brand-gold/20 text-amber-700')}>
                        {q.status === 'deal' ? 'Deal ✓' : q.status === 'dismissed' ? 'Dismissed' : 'New'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" /> {q.phone}</span>
                      {q.email && <span>· {q.email}</span>}
                      <span>· {fmtDate(q.createdAt)}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {q.status === 'new' && (
                      <>
                        <button onClick={() => openDeal(q)} className="flex items-center gap-1.5 bg-gradient-to-b from-brand-red-bright to-brand-red text-white text-xs font-semibold px-3.5 py-2 rounded-xl glow-red-soft hover:brightness-110 cursor-pointer">
                          <Check className="w-3.5 h-3.5" /> Convert to Deal
                        </button>
                        <button onClick={() => dismissQuote(q.id, 'dismissed')} className="text-xs text-slate-400 border border-slate-200 rounded-xl px-3 py-2 hover:text-brand-red hover:border-brand-red/40 cursor-pointer">
                          Dismiss
                        </button>
                      </>
                    )}
                    {q.status === 'dismissed' && (
                      <button onClick={() => dismissQuote(q.id, 'new')} className="text-xs text-slate-400 border border-slate-200 rounded-xl px-3 py-2 hover:text-brand-dark cursor-pointer">Restore</button>
                    )}
                  </div>
                </div>
                <ul className="mt-3 text-sm text-slate-600 space-y-0.5">
                  {q.items.map((it, i) => (
                    <li key={i} className="tabular-nums">• {it.name}{it.size ? ` — ${it.size}` : ''} × {it.qty}</li>
                  ))}
                  {q.uploaded.map((u, i) => (
                    <li key={`u${i}`} className="tabular-nums text-slate-400">• {u.name} × {u.qty} <span className="text-[10px] uppercase">(uploaded list)</span></li>
                  ))}
                  {q.attachment && <li className="text-amber-600 text-xs">📎 customer file: {q.attachment}</li>}
                  {q.message && <li className="text-slate-400 text-xs italic">&ldquo;{q.message}&rdquo;</li>}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* ── SALES ── */}
        {tab === 'sales' && (
          <div className="space-y-3">
            <button onClick={openManual} className="flex items-center gap-1.5 bg-gradient-to-b from-brand-red-bright to-brand-red text-white text-sm font-semibold px-4 py-2.5 rounded-xl glow-red-soft hover:brightness-110 cursor-pointer">
              <Plus className="w-4 h-4" /> Record Manual Sale (walk-in / phone)
            </button>
            {!sales.length && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
                No sales recorded yet. Confirming a quote as a deal — or a manual sale — will appear here.
              </div>
            )}
            {sales.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-200/80 p-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-semibold text-brand-dark">{s.customer || 'Walk-in'}</span>
                  <span className="text-xs text-slate-400">{fmtDate(s.at)} · {s.source === 'quote' ? 'from quote' : 'manual'}</span>
                </div>
                <ul className="mt-2 text-sm text-slate-600 space-y-0.5">
                  {s.lines.map((l, i) => <li key={i} className="tabular-nums">• {l.label} × {l.qty}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── deal / manual-sale dialog ── */}
      {(dealQuote || manualOpen) && (
        <div className="fixed inset-0 z-[70] bg-brand-dark/70 backdrop-blur-md flex items-center justify-center px-4" onClick={closeDialog}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display font-bold text-xl text-brand-dark">
                {dealQuote ? 'Confirm Deal' : 'Record Manual Sale'}
              </h2>
              <button onClick={closeDialog} className="text-slate-300 hover:text-slate-500 cursor-pointer" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Adjust final quantities — stock reduces by exactly these lines.</p>

            <label className="block text-xs font-medium text-slate-500 mb-1">Customer</label>
            <input value={dealCustomer} onChange={(e) => setDealCustomer(e.target.value)} placeholder="Customer name"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-brand-red/30" />

            {/* lines */}
            <div className="space-y-2 mb-4">
              {dealLines.map((l, i) => (
                <div key={`${l.key}-${i}`} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                  <span className="flex-1 text-sm text-brand-dark">{l.label}</span>
                  <input type="number" min={0} value={l.qty}
                    onChange={(e) => setDealLines((ls) => ls.map((x, j) => j === i ? { ...x, qty: Math.max(0, Math.trunc(Number(e.target.value) || 0)) } : x))}
                    className="w-16 text-center text-sm border border-slate-200 rounded-lg py-1 tabular-nums focus:outline-none focus:ring-1 focus:ring-brand-red/40" />
                  <button onClick={() => setDealLines((ls) => ls.filter((_, j) => j !== i))} className="text-slate-300 hover:text-brand-red cursor-pointer" aria-label="Remove line">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {!dealLines.length && <p className="text-center text-slate-300 text-sm py-3">No lines yet — add products below</p>}
            </div>

            {/* uploaded-list reminders */}
            {dealQuote && dealQuote.uploaded.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 mb-1">From customer&apos;s uploaded list — match below if sold:</p>
                <ul className="text-xs text-amber-800 space-y-0.5">
                  {dealQuote.uploaded.map((u, i) => <li key={i}>• {u.name} × {u.qty}</li>)}
                </ul>
              </div>
            )}

            {/* product picker */}
            <label className="block text-xs font-medium text-slate-500 mb-1">Add product line</label>
            <div className="relative mb-5">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-300" />
              <input value={pickerQuery} onChange={(e) => setPickerQuery(e.target.value)} placeholder="Search by name or model…"
                className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30" />
              {pickerResults.length > 0 && (
                <div className="absolute z-10 inset-x-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                  {pickerResults.map((s) => (
                    <button key={s.key}
                      onClick={() => { setDealLines((ls) => [...ls, { key: s.key, label: s.label, qty: 1 }]); setPickerQuery('') }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer flex justify-between gap-2">
                      <span className="text-brand-dark">{s.label}</span>
                      <span className="text-slate-300 text-xs tabular-nums shrink-0">stock: {s.qty}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={confirmDeal}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-brand-red-bright to-brand-red text-white font-semibold py-3 rounded-xl glow-red hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer">
              <Check className="w-4 h-4" />
              {dealQuote ? 'Confirm Deal & Reduce Stock' : 'Record Sale & Reduce Stock'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
