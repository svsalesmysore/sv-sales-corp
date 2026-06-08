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
}

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD';    payload: Product }
  | { type: 'REMOVE'; payload: string }   // product id
  | { type: 'UPDATE'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; payload: CartItem[] }

interface CartContextValue {
  items:       CartItem[]
  totalItems:  number
  addItem:     (product: Product) => void
  removeItem:  (id: string) => void
  updateQty:   (id: string, quantity: number) => void
  clearCart:   () => void
  isInCart:    (id: string) => boolean
}

/* ── reducer ─────────────────────────────────────────────────── */
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find((i) => i.product.id === action.payload.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === action.payload.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        }
      }
      return { items: [...state.items, { product: action.payload, quantity: 1 }] }
    }
    case 'REMOVE':
      return { items: state.items.filter((i) => i.product.id !== action.payload) }
    case 'UPDATE':
      return {
        items: state.items.map((i) =>
          i.product.id === action.payload.id
            ? { ...i, quantity: Math.max(1, action.payload.quantity) }
            : i
        ),
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

  /* hydrate from localStorage on mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: CartItem[] = JSON.parse(raw)
        dispatch({ type: 'HYDRATE', payload: parsed })
      }
    } catch {
      /* ignore parse errors */
    }
  }, [])

  /* persist on every change */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
  }, [state.items])

  const value: CartContextValue = {
    items:      state.items,
    totalItems: state.items.reduce((acc, i) => acc + i.quantity, 0),
    addItem:    (product) => dispatch({ type: 'ADD', payload: product }),
    removeItem: (id)      => dispatch({ type: 'REMOVE', payload: id }),
    updateQty:  (id, qty) => dispatch({ type: 'UPDATE', payload: { id, quantity: qty } }),
    clearCart:  ()        => dispatch({ type: 'CLEAR' }),
    isInCart:   (id)      => state.items.some((i) => i.product.id === id),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useQuoteCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useQuoteCart must be used inside <QuoteCartProvider>')
  return ctx
}
