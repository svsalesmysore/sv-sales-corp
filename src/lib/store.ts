/**
 * Server-side inventory ledger — JSON files under data/ with atomic writes.
 * Local-first by design: works with `npm run dev`. Swap for a real DB when deploying.
 * NOTE: stock counts are ADMIN-ONLY; nothing here is exposed to public pages.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import catalog from '@/data/lion-catalog.json'

const DATA_DIR = path.join(process.cwd(), 'data')
const FILES = {
  stock: path.join(DATA_DIR, 'stock.json'),
  quotes: path.join(DATA_DIR, 'quotes.json'),
  sales: path.join(DATA_DIR, 'sales.json'),
}

/* ── types ──────────────────────────────────────────────────── */
export interface StockEntry {
  key: string          // productId, or `${productId}::${variantModel}` for families
  productId: string
  model: string
  label: string
  brand: string
  categoryId: string
  qty: number
}

export interface QuoteLine {
  productId: string
  name: string
  size?: string
  qty: number
  unit: string
}

export interface QuoteRecord {
  id: string
  createdAt: string
  name: string
  company?: string
  phone: string
  email?: string
  message?: string
  items: QuoteLine[]
  uploaded: { name: string; qty: number }[]
  attachment?: string | null
  status: 'new' | 'deal' | 'dismissed'
  dealAt?: string
}

export interface SaleLine { key: string; label: string; qty: number }
export interface SaleRecord {
  id: string
  at: string
  source: 'quote' | 'manual'
  quoteId?: string
  customer?: string
  lines: SaleLine[]
}

/* ── low-level json io ──────────────────────────────────────── */
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}
function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T
  } catch {
    return fallback
  }
}
function writeJson(file: string, data: unknown) {
  ensureDir()
  const tmp = `${file}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2))
  fs.renameSync(tmp, file)
}

/* ── stock ──────────────────────────────────────────────────── */
interface CatalogVariant { option: string; model?: string }
interface CatalogProduct {
  id: string; name: string; model?: string; brand?: string; categoryId: string
  variants?: CatalogVariant[]
}

/** Every sellable unit in the catalog (families expand to one entry per variant). */
function catalogEntries(): Omit<StockEntry, 'qty'>[] {
  const out: Omit<StockEntry, 'qty'>[] = []
  for (const p of catalog.products as unknown as CatalogProduct[]) {
    if (p.variants?.length) {
      for (const v of p.variants) {
        const model = v.model || v.option
        out.push({
          key: `${p.id}::${model}`,
          productId: p.id,
          model,
          label: `${p.name} — ${v.option}`,
          brand: p.brand ?? '',
          categoryId: p.categoryId,
        })
      }
    } else {
      out.push({
        key: p.id,
        productId: p.id,
        model: p.model ?? '',
        label: p.name,
        brand: p.brand ?? '',
        categoryId: p.categoryId,
      })
    }
  }
  return out
}

/** Stock list seeded from the catalog; existing quantities are preserved. */
export function getStock(): StockEntry[] {
  const saved = readJson<Record<string, number>>(FILES.stock, {})
  return catalogEntries().map((e) => ({ ...e, qty: saved[e.key] ?? 0 }))
}

export function setStock(updates: Record<string, number>) {
  const saved = readJson<Record<string, number>>(FILES.stock, {})
  for (const [k, v] of Object.entries(updates)) saved[k] = Math.trunc(v)
  writeJson(FILES.stock, saved)
}

/** Decrement (sale). Quantities may go negative — that signals an oversell to fix. */
export function decrementStock(lines: SaleLine[]) {
  const saved = readJson<Record<string, number>>(FILES.stock, {})
  for (const l of lines) saved[l.key] = (saved[l.key] ?? 0) - Math.max(0, Math.trunc(l.qty))
  writeJson(FILES.stock, saved)
}

/* ── quotes ─────────────────────────────────────────────────── */
export function listQuotes(): QuoteRecord[] {
  return readJson<QuoteRecord[]>(FILES.quotes, [])
}
export function addQuote(q: Omit<QuoteRecord, 'id' | 'createdAt' | 'status'>): QuoteRecord {
  const all = listQuotes()
  const rec: QuoteRecord = {
    ...q,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'new',
  }
  all.unshift(rec)
  writeJson(FILES.quotes, all.slice(0, 500)) // keep the latest 500
  return rec
}
export function updateQuoteStatus(id: string, status: QuoteRecord['status']) {
  const all = listQuotes()
  const q = all.find((x) => x.id === id)
  if (!q) return null
  q.status = status
  if (status === 'deal') q.dealAt = new Date().toISOString()
  writeJson(FILES.quotes, all)
  return q
}

/* ── sales ──────────────────────────────────────────────────── */
export function listSales(): SaleRecord[] {
  return readJson<SaleRecord[]>(FILES.sales, [])
}
export function addSale(s: Omit<SaleRecord, 'id' | 'at'>): SaleRecord {
  const all = listSales()
  const rec: SaleRecord = { ...s, id: crypto.randomUUID(), at: new Date().toISOString() }
  all.unshift(rec)
  writeJson(FILES.sales, all)
  return rec
}

/* ── admin auth (simple local password) ─────────────────────── */
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'svsales123'
export function adminToken(): string {
  return crypto.createHash('sha256').update(`sv-admin:${ADMIN_PASSWORD}`).digest('hex')
}
export function checkPassword(pw: string): boolean {
  return pw === ADMIN_PASSWORD
}
