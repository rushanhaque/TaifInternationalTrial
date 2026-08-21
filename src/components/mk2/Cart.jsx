import { useEffect, useRef, useState } from 'react'
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

/* The send buttons used to end in a "↗" character, which several mobile
   browsers substitute with their own blue emoji glyph — so the button read as
   a stray arrow sticker rather than the channel it opens. These are drawn
   inline instead, inheriting currentColor, so they match the label. */
const waGlyph = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const mailGlyph = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

export default function Cart() {
  const { items, count, remove, clear, open, setOpen } = useCart()
  const paneRef = useRef(null)
  const tabRef = useRef(null)
  const prevCount = useRef(0)
  const [copied, setCopied] = useState(false)

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

  /* A mailto: link is silent when the visitor has no mail client registered —
     which is most people on desktop webmail. The link still fires, so we
     cannot detect the failure; instead the enquiry goes to the clipboard on
     the way out and the address is named underneath. If the mail app opened,
     the copy is harmless; if it did not, nothing is lost. */
  function onMailClick() {
    navigator.clipboard?.writeText(`${BRAND.email}\n\n${text}`).then(
      () => setCopied(true),
      () => {}
    )
  }

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
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>
        </header>

        <ol className="ct-list">
          {items.map((p, i) => (
            <li className="ct-row" key={p.slug}>
              <span className="ct-row-n meta" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="ct-thumb">
                {/* a cart row is a 60px square — the thumbnail is the
                    right image here, not a fallback for one */}
                <img src={p.imageThumb || p.image || productPlate(p.slug)} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="ct-row-say">
                <span className="ct-row-name">{p.name}</span>
                <span className="ct-row-mat meta">{p.category} · {p.material}</span>
                <span className="ct-row-figs meta">{p.lead}</span>
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
              <span className="ct-btn-go">{waGlyph}</span>
            </a>
            <a className="ct-btn ct-mail" href={mailHref} onClick={onMailClick}>
              <span className="ct-btn-label">Send by email</span>
              <span className="ct-btn-go">{mailGlyph}</span>
            </a>
            {copied && (
              <p className="ct-copied meta" role="status">
                Copied. If your mail app did not open, send to {BRAND.email}
              </p>
            )}
          </div>
        </footer>
      </aside>
    </>
  )
}
