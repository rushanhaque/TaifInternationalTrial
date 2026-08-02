import { createContext, useCallback, useContext, useMemo, useState } from 'react'

/* ── the enquiry cart ───────────────────────────────────────────────────────
   Deliberately IN-MEMORY ONLY. No localStorage, no sessionStorage: a refresh
   empties it, which is what was asked for and is also the honest behaviour
   for an enquiry basket — a buyer should never come back tomorrow to a stale
   list they have forgotten assembling.

   This is an ENQUIRY cart, not a checkout: there is no price, no quantity
   ladder and no payment. It gathers pieces so a buyer can hand the whole set
   to us in one message. */

const CartCtx = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)

  const add = useCallback((piece) => {
    setItems((cur) => (cur.some((p) => p.slug === piece.slug) ? cur : [...cur, piece]))
  }, [])

  const remove = useCallback((slug) => {
    setItems((cur) => cur.filter((p) => p.slug !== slug))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const has = useCallback((slug) => items.some((p) => p.slug === slug), [items])

  const value = useMemo(
    () => ({ items, add, remove, clear, has, open, setOpen, count: items.length }),
    [items, add, remove, clear, has, open]
  )

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) {
    /* a no-op cart rather than a crash: a component rendered outside the
       provider should degrade, not take the page down */
    return {
      items: [], count: 0, open: false,
      add() {}, remove() {}, clear() {}, has: () => false, setOpen() {},
    }
  }
  return ctx
}

/* ── the enquiry message ────────────────────────────────────────────────────
   One composer for both channels so WhatsApp and email can never drift out of
   sync. Plain text, numbered, with the figures we would otherwise have to ask
   for in a reply. */
export function enquiryText(items) {
  const lines = items.map((p, i) =>
    `${i + 1}. ${p.name} — ${p.category} · ${p.material} · MOQ ${p.moq} · lead ${p.lead}`
  )
  return [
    'TAIF INTERNATIONAL — enquiry',
    '',
    `I would like pricing and availability on ${items.length} ${items.length === 1 ? 'piece' : 'pieces'}:`,
    '',
    ...lines,
    '',
    'Please include unit price at the stated MOQ, finish options and FOB terms.',
  ].join('\n')
}
