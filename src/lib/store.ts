/**
 * Server-side inventory ledger — Supabase (Postgres) backend.
 * All functions are async. Admin-only data: never exposed to public pages.
 */
import crypto from 'node:crypto'
import { supabaseAdmin } from './supabase-admin'
import catalog from '@/data/lion-catalog.json'

/* ── types ──────────────────────────────────────────────────── */
export interface StockEntry {
  key: string
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
  brand?: string
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

/* ── catalog helpers ────────────────────────────────────────── */
interface CatalogVariant { option: string; model?: string }
interface CatalogProduct {
  id: string; name: string; model?: string; brand?: string; categoryId: string
  variants?: CatalogVariant[]
}

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

/* ── stock ──────────────────────────────────────────────────── */
export async function getStock(): Promise<StockEntry[]> {
  const { data } = await supabaseAdmin.from('stock').select('key, qty')
  const saved: Record<string, number> = {}
  for (const row of data ?? []) saved[row.key] = row.qty
  return catalogEntries().map((e) => ({ ...e, qty: saved[e.key] ?? 0 }))
}

export async function setStock(updates: Record<string, number>) {
  const rows = Object.entries(updates).map(([key, qty]) => ({ key, qty: Math.trunc(qty) }))
  await supabaseAdmin.from('stock').upsert(rows, { onConflict: 'key' })
}

export async function decrementStock(lines: SaleLine[]) {
  for (const l of lines) {
    await supabaseAdmin.rpc('decrement_stock', {
      p_key: l.key,
      p_qty: Math.max(0, Math.trunc(l.qty)),
    })
  }
}

/* ── quotes ─────────────────────────────────────────────────── */
function rowToQuote(row: Record<string, unknown>): QuoteRecord {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    name: row.name as string,
    company: row.company as string | undefined,
    phone: row.phone as string,
    email: row.email as string | undefined,
    message: row.message as string | undefined,
    items: (row.items ?? []) as QuoteLine[],
    uploaded: (row.uploaded ?? []) as { name: string; qty: number }[],
    attachment: row.attachment as string | null,
    status: row.status as QuoteRecord['status'],
    dealAt: row.deal_at as string | undefined,
  }
}

export async function listQuotes(): Promise<QuoteRecord[]> {
  const { data } = await supabaseAdmin
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)
  return (data ?? []).map(rowToQuote)
}

export async function addQuote(
  q: Omit<QuoteRecord, 'id' | 'createdAt' | 'status'>,
): Promise<QuoteRecord> {
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  await supabaseAdmin.from('quotes').insert({
    id,
    created_at: createdAt,
    name: q.name,
    company: q.company ?? null,
    phone: q.phone,
    email: q.email ?? null,
    message: q.message ?? null,
    items: q.items,
    uploaded: q.uploaded,
    attachment: q.attachment ?? null,
    status: 'new',
  })
  return { ...q, id, createdAt, status: 'new' }
}

export async function updateQuoteStatus(
  id: string,
  status: QuoteRecord['status'],
): Promise<QuoteRecord | null> {
  const update: Record<string, unknown> = { status }
  if (status === 'deal') update.deal_at = new Date().toISOString()
  const { data } = await supabaseAdmin
    .from('quotes')
    .update(update)
    .eq('id', id)
    .select()
    .single()
  return data ? rowToQuote(data) : null
}

/* ── sales ──────────────────────────────────────────────────── */
function rowToSale(row: Record<string, unknown>): SaleRecord {
  return {
    id: row.id as string,
    at: row.at as string,
    source: row.source as 'quote' | 'manual',
    quoteId: row.quote_id as string | undefined,
    customer: row.customer as string | undefined,
    lines: (row.lines ?? []) as SaleLine[],
  }
}

export async function listSales(): Promise<SaleRecord[]> {
  const { data } = await supabaseAdmin
    .from('sales')
    .select('*')
    .order('at', { ascending: false })
  return (data ?? []).map(rowToSale)
}

export async function addSale(s: Omit<SaleRecord, 'id' | 'at'>): Promise<SaleRecord> {
  const id = crypto.randomUUID()
  const at = new Date().toISOString()
  await supabaseAdmin.from('sales').insert({
    id,
    at,
    source: s.source,
    quote_id: s.quoteId ?? null,
    customer: s.customer ?? null,
    lines: s.lines,
  })
  return { ...s, id, at }
}

/* ── admin auth ─────────────────────────────────────────────── */
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'svsales123'

export function adminToken(): string {
  return crypto.createHash('sha256').update(`sv-admin:${ADMIN_PASSWORD}`).digest('hex')
}

export function checkPassword(pw: string): boolean {
  return pw === ADMIN_PASSWORD
}
