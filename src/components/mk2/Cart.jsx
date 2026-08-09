import { useEffect, useRef } from 'react'
import { gsap, reduced } from '../../lib/gsap'
import { useCart, enquiryText } from '../../lib/cart'
import { productPlate } from '../../data/images'
import { BRAND } from '../../data/site'

/* ── the enquiry cart ───────────────────────────────────────────────────────
   A brass tab that only exists once there is something in it, and a pane that
   slides out of the right edge carrying the list.

   It is styled as a WORKS DOCKET rather than a shopping basket, because that
   is what it is: no prices, no quantities, no checkout. Numbered lines, plate
   numbers, tabular figures, and two ways to send the whole set at once.

   FAIL-OPEN: the pane's resting state in CSS is closed-and-off-screen via
   transform only, so if the script never runs nothing is stranded on top of
   the page. The tab simply never mounts when the cart is empty. */

const waNumber = BRAND.phone.replace(/\D/g, '')

export default function Cart() {
  const { items, count, remove, clear, open, setOpen } = useCart()
  const paneRef = useRef(null)
  const tabRef = useRef(null)
  const prevCount = useRef(0)

  /* the tab springs when an item lands — the only feedback that the hover
     button did anything, since the pane stays shut */
  useEffect(() => {
    if (count > prevCount.current && tabRef.current && !reduced()) {
      gsap.fromTo(tabRef.current,
        { scale: 0.82 },
        { scale: 1, duration: 0.62, ease: 'elastic.out(1, 0.42)' })
    }
    prevCount.current = count
  }, [count])

  /* Esc closes; focus moves into the pane when it opens */
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    const t = setTimeout(() => paneRef.current?.querySelector('.ct-close')?.focus(), 60)
    return () => { document.removeEventListener('keydown', onKey); clearTimeout(t) }
  }, [open, setOpen])

  if (!count) return null

  const text = enquiryText(items)
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`
  const mailHref =
    `mailto:${BRAND.email}` +
    `?subject=${encodeURIComponent(`Enquiry — ${count} ${count === 1 ? 'piece' : 'pieces'}`)}` +
    `&body=${encodeURIComponent(text)}`

  return (
    <>
      <button
        type="button"
        className="ct-tab"
        ref={tabRef}
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="cart-pane"
        aria-label={`View Cart (${count} items)`}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 01-8 0"></path>
        </svg>
        <span className="ct-tab-n">{count}</span>
      </button>

      <div
        className={`ct-scrim ${open ? 'is-open' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="cart-pane"
        className={`ct-pane ${open ? 'is-open' : ''}`}
        ref={paneRef}
        aria-label="Cart list"
        aria-hidden={!open}
      >
        <header className="ct-head">
          <div>
            <span className="meta ct-kicker">Works docket</span>
            <h2 className="ct-title">Cart</h2>
          </div>
          <button
            type="button"
            className="ct-close"
            onClick={() => setOpen(false)}
            aria-label="Close cart list"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <ol className="ct-list">
          {items.map((p, i) => (
            <li className="ct-row" key={p.slug}>
              <span className="ct-row-n meta" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="ct-thumb">
                <img src={productPlate(p.slug)} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="ct-row-say">
                <span className="ct-row-name">{p.name}</span>
                <span className="ct-row-mat meta">{p.category} · {p.material}</span>
                <span className="ct-row-figs meta">MOQ {p.moq} · {p.lead}</span>
              </span>
              <button
                type="button"
                className="ct-drop"
                onClick={() => remove(p.slug)}
                aria-label={`Remove ${p.name} from the cart`}
              >
                <span aria-hidden="true">Remove</span>
              </button>
            </li>
          ))}
        </ol>

        <footer className="ct-foot">
          <div className="ct-sum meta">
            <span>{String(count).padStart(2, '0')} {count === 1 ? 'piece' : 'pieces'}</span>
            <button type="button" className="ct-clear" onClick={clear}>Clear all</button>
          </div>

          <div className="ct-send">
            <a
              className="ct-btn ct-wa"
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="ct-btn-label">Send on WhatsApp</span>
              <span className="ct-btn-go" aria-hidden="true">↗</span>
            </a>
            <a className="ct-btn ct-mail" href={mailHref}>
              <span className="ct-btn-label">Send by email</span>
              <span className="ct-btn-go" aria-hidden="true">↗</span>
            </a>
          </div>
        </footer>
      </aside>
    </>
  )
}
