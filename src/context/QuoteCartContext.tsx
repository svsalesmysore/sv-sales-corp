'use client'

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react'
import type { Product } from '@/data/types'

/* ── types ──────────────────────────────────────────────────── */
export interface CartItem {
  product: Product
  quantity: number
  size?: string          // selected size/variant option, if any
}

interface CartState {
  items: CartItem[]
}

/** Unique line key per product + chosen size (same product in two sizes = two lines). */
const lineKey = (id: string, size?: string) => `${id}__${size ?? ''}`

type CartAction =
  | { type: 'ADD';    payload: { product: Product; size?: string; qty?: number } }
  | { type: 'REMOVE'; payload: { id: string; size?: string } }
  | { type: 'UPDATE'; payload: { id: string; size?: string; quantity: number } }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; payload: CartItem[] }

interface CartContextValue {
  items:       CartItem[]
  totalItems:  number
  addItem:     (product: Product, size?: string, qty?: number) => void
  removeItem:  (id: string, size?: string) => void
  updateQty:   (id: string, size: string | undefined, quantity: number) => void
  clearCart:   () => void
  isInCart:    (id: string, size?: string) => boolean
}

/* ── reducer ─────────────────────────────────────────────────── */
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const { product, size, qty = 1 } = action.payload
      const key = lineKey(product.id, size)
      const existing = state.items.find((i) => lineKey(i.product.id, i.size) === key)
      if (existing) {
        return {
          items: state.items.map((i) =>
            lineKey(i.product.id, i.size) === key ? { ...i, quantity: i.quantity + qty } : i
          ),
        }
      }
      return { items: [...state.items, { product, quantity: qty, size }] }
    }
    case 'REMOVE': {
      const key = lineKey(action.payload.id, action.payload.size)
      return { items: state.items.filter((i) => lineKey(i.product.id, i.size) !== key) }
    }
    case 'UPDATE': {
      const key = lineKey(action.payload.id, action.payload.size)
      return {
        items: state.items.map((i) =>
          lineKey(i.product.id, i.size) === key
            ? { ...i, quantity: Math.max(1, action.payload.quantity) }
            : i
        ),
      }
    }
    case 'CLEAR':
      return { items: [] }
    case 'HYDRATE':
      return { items: action.payload }
    default:
      return state
  }
}

/* ── context ─────────────────────────────────────────────────── */
const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'sv-sales-quote-cart'

export function QuoteCartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) as CartItem[] })
    } catch {
      /* ignore parse errors */
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
  }, [state.items])

  const value: CartContextValue = {
    items:      state.items,
    totalItems: state.items.reduce((acc, i) => acc + i.quantity, 0),
    addItem:    (product, size, qty = 1) => dispatch({ type: 'ADD', payload: { product, size, qty } }),
    removeItem: (id, size)      => dispatch({ type: 'REMOVE', payload: { id, size } }),
    updateQty:  (id, size, qty) => dispatch({ type: 'UPDATE', payload: { id, size, quantity: qty } }),
    clearCart:  ()              => dispatch({ type: 'CLEAR' }),
    isInCart:   (id, size)      => state.items.some((i) => lineKey(i.product.id, i.size) === lineKey(id, size)),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useQuoteCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useQuoteCart must be used inside <QuoteCartProvider>')
  return ctx
}
