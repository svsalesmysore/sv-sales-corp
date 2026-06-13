'use client'

import { useRef, useState, type DragEvent } from 'react'
import { Upload, FileSpreadsheet, FileText, Paperclip, X, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export interface UploadedItem {
  name: string
  qty: number
}

interface Props {
  items: UploadedItem[]
  onItemsChange: (items: UploadedItem[]) => void
  attachment: string | null
  onAttachmentChange: (name: string | null) => void
  onFileChange?: (file: File | null) => void
  compact?: boolean
}

const HEADER_WORDS = new Set(['item', 'items', 'product', 'products', 'name', 'description', 'particulars', 'sr', 'sl', 'no', 's.no', 'sno'])
const QTY_KEYS   = new Set(['qty', 'quantity', 'count', 'nos', 'pcs', 'pieces', 'required', 'req', 'order'])
const NAME_KEYS  = new Set(['description', 'name', 'product', 'item', 'particulars', 'article', 'particular', 'productname', 'itemname', 'productdescription', 'itemdescription'])

/** "Spanner set x 2" / "Spanner set - 2" / "Spanner set, 2" → { name, qty } */
function parseLine(line: string): UploadedItem | null {
  const s = line.trim()
  if (!s) return null
  const m = s.match(/^(.*?)[\s,;–-]*(?:[x×*]\s*)?(\d{1,4})\s*$/)
  if (m && m[1].trim().length > 1) {
    return { name: m[1].trim().replace(/[,;–-]+$/, '').trim(), qty: Math.max(1, parseInt(m[2], 10)) }
  }
  return { name: s, qty: 1 }
}

function norm(s: string) { return s.toLowerCase().replace(/[.\s_]/g, '') }

function rowsToItems(rows: (string | number | undefined | null)[][]): UploadedItem[] {
  const out: UploadedItem[] = []

  // Scan first 5 rows for a header that contains a qty column
  let qtyCol = -1, nameCol = -1, dataStart = 0
  for (let r = 0; r < Math.min(5, rows.length); r++) {
    const cells = (rows[r] ?? []).map((c) => norm(String(c ?? '')))
    const qi = cells.findIndex((c) => QTY_KEYS.has(c))
    if (qi !== -1) {
      qtyCol = qi
      dataStart = r + 1
      const ni = cells.findIndex((c) => NAME_KEYS.has(c))
      // fall back to first long text column that isn't the qty col
      nameCol = ni !== -1 ? ni : cells.findIndex((c, i) => i !== qi && c.length > 2 && !/^\d+$/.test(c))
      break
    }
  }

  for (let r = dataStart; r < rows.length; r++) {
    const raw = rows[r] ?? []

    if (qtyCol !== -1) {
      // Header-guided: only rows where the qty column has a positive integer
      const qtyRaw = String(raw[qtyCol] ?? '').trim()
      const qty = parseInt(qtyRaw, 10)
      if (!qtyRaw || isNaN(qty) || qty <= 0) continue

      // Name: use detected name column, otherwise pick the longest text cell in the row
      let name = nameCol !== -1 ? String(raw[nameCol] ?? '').trim() : ''
      if (!name) {
        name = (raw as (string | number | undefined | null)[])
          .filter((_, i) => i !== qtyCol)
          .map((c) => String(c ?? '').trim())
          .filter((c) => c.length > 2 && !/^\d+\.?$/.test(c))
          .sort((a, b) => b.length - a.length)[0] ?? ''
      }
      if (!name || name.length < 2) continue
      out.push({ name, qty })
    } else {
      // No header detected — fallback: only rows with an explicit number cell
      const cells = raw.map((c) => String(c ?? '').trim()).filter(Boolean)
      if (!cells.length) continue
      if (cells.length > 1 && /^\d{1,3}\.?$/.test(cells[0])) cells.shift()
      if (!cells.length) continue
      const name = cells[0]
      if (HEADER_WORDS.has(name.toLowerCase().replace(/[.:]/g, ''))) continue
      if (name.length < 2) continue
      const qtyCell = cells.slice(1).find((c) => /^\d{1,4}$/.test(c))
      if (!qtyCell) continue  // no qty found → skip row
      out.push({ name, qty: Math.max(1, parseInt(qtyCell, 10)) })
    }
  }
  return out
}

export default function UploadListPanel({ items, onItemsChange, attachment, onAttachmentChange, onFileChange, compact = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [parsing, setParsing] = useState(false)

  const handleFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    setParsing(true)
    try {
      if (ext === 'csv' || ext === 'txt') {
        const text = await file.text()
        const parsed =
          ext === 'csv'
            ? rowsToItems(text.split(/\r?\n/).map((l) => l.split(/[,;\t]/)))
            : (text.split(/\r?\n/).map(parseLine).filter(Boolean) as UploadedItem[])
        if (!parsed.length) { toast.error('No items found in the file'); return }
        onItemsChange([...items, ...parsed])
        toast.success(`Imported ${parsed.length} item${parsed.length !== 1 ? 's' : ''} from ${file.name}`)
      } else if (ext === 'xlsx' || ext === 'xls') {
        const XLSX = await import('xlsx')
        const wb = XLSX.read(await file.arrayBuffer())
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1 })
        const parsed = rowsToItems(rows)
        if (!parsed.length) { toast.error('No items found in the sheet'); return }
        onItemsChange([...items, ...parsed])
        toast.success(`Imported ${parsed.length} item${parsed.length !== 1 ? 's' : ''} from ${file.name}`)
      } else if (['jpg', 'jpeg', 'png', 'webp', 'heic', 'pdf'].includes(ext)) {
        onAttachmentChange(file.name)
        onFileChange?.(file)
        toast.success('File attached', { description: 'It will be sent with your quote.' })
      } else {
        toast.error('Unsupported file', { description: 'Use Excel, CSV, TXT, a photo, or a PDF.' })
      }
    } catch {
      toast.error('Could not read the file')
    } finally {
      setParsing(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  const updateQty = (idx: number, qty: number) =>
    onItemsChange(items.map((it, i) => (i === idx ? { ...it, qty: Math.max(1, qty) } : it)))
  const removeItem = (idx: number) => onItemsChange(items.filter((_, i) => i !== idx))

  const downloadTemplate = async () => {
    const res = await fetch('/api/quote-template')
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'sv-sales-quote-template.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-brand-dark text-sm flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-brand-red" />
          {compact ? 'Have your own list?' : 'Upload your product list'}
        </h3>
        {items.length > 0 && (
          <button onClick={() => onItemsChange([])} className="text-xs text-slate-400 hover:text-brand-red transition-colors cursor-pointer">
            Clear list
          </button>
        )}
      </div>

      {/* drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'w-full rounded-xl border-2 border-dashed px-4 py-6 text-center transition-all duration-200 cursor-pointer',
          dragOver ? 'border-brand-red bg-brand-red/5' : 'border-slate-200 hover:border-brand-red/40 hover:bg-slate-50'
        )}
      >
        <Upload className={cn('w-6 h-6 mx-auto mb-2', dragOver ? 'text-brand-red' : 'text-slate-400')} />
        <p className="text-sm font-medium text-brand-dark">
          {parsing ? 'Reading file…' : 'Drop your list here or click to upload'}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Excel / CSV / TXT — items import automatically. PDF / photos — attached directly to your quote.
        </p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv,.txt,.pdf,image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {/* template download */}
      <p className="text-xs text-slate-400 mt-2 text-center">
        Don&apos;t have a list?{' '}
        <button
          type="button"
          onClick={downloadTemplate}
          className="text-brand-red hover:underline cursor-pointer"
        >
          Download our template
        </button>
        {' '}— fill in the Qty column and upload.
      </p>

      {/* attachment chip */}
      {attachment && (
        <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <Paperclip className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="text-xs text-amber-800 flex-1 truncate">
            <span className="font-medium">{attachment}</span> — will be sent with your quote email
          </span>
          <button onClick={() => { onAttachmentChange(null); onFileChange?.(null) }} className="text-amber-500 hover:text-amber-700 cursor-pointer" aria-label="Remove attachment note">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* parsed items */}
      {items.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <FileText className="w-3 h-3" /> Imported items ({items.length}) — included in your quote
          </p>
          <ul className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {items.map((it, idx) => (
              <li key={`${it.name}-${idx}`} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5">
                <span className="flex-1 text-sm text-brand-dark truncate">{it.name}</span>
                <input
                  type="number"
                  min={1}
                  value={it.qty}
                  onChange={(e) => updateQty(idx, parseInt(e.target.value || '1', 10))}
                  className="w-14 text-xs text-center border border-slate-200 rounded-lg py-1 tabular-nums focus:outline-none focus:ring-1 focus:ring-brand-red/40"
                  aria-label={`Quantity for ${it.name}`}
                />
                <button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-brand-red transition-colors cursor-pointer" aria-label={`Remove ${it.name}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
