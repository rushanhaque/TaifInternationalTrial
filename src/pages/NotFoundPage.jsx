import { useEffect, useRef } from 'react'
import { gsap, reduced } from '../lib/gsap'
import { Link } from '../lib/router'
import Button from '../components/Button'
import { FAMILIES, familySlug } from './CollectionPage'

/* ── NOT ON FILE ────────────────────────────────────────────────────────────
   A 404 that says "page not found" wastes the one moment it has. This one is
   a works docket for the thing the visitor asked for, pulled from the rack
   and stamped NOT ON FILE — the same language the enquiry cart and the
   contact page speak, so a wrong turn still sounds like the same company.

   It is also USEFUL, which most 404s are not: it prints the path they
   actually asked for, so a mistyped or stale link is visible rather than
   mysterious, and it offers every collection as a way back rather than a
   single home button. */

export default function NotFoundPage() {
  const stamp = useRef(null)
  const card = useRef(null)

  /* What they asked for, shown back to them. React escapes it, so it is text
     and never markup.

     decodeURI THROWS on a malformed escape — '/catalogue/%E0%A4' raises
     URIError — and an exception here would take down the very page whose job
     is to catch a bad address. Fall back to the raw path instead. */
  const asked = (() => {
    if (typeof window === 'undefined') return '/'
    const raw = window.location.pathname + window.location.search
    try { return decodeURI(raw).slice(0, 64) } catch (_) { return raw.slice(0, 64) }
  })()

  useEffect(() => {
    if (reduced()) return undefined
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      tl.from(card.current, { y: 18, opacity: 0, duration: 0.6, ease: 'power3.out' })
        .fromTo(stamp.current,
          { scale: 2.6, opacity: 0, rotate: -16 },
          { scale: 1, opacity: 0.85, rotate: -8, duration: 0.5, ease: 'power4.out' },
          0.35)
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="nf">
      <p className="idx">1.4</p>
      <h1 className="d1">This one was never made.</h1>
      <p className="lede nf-lede">
        No docket exists for that address — it may have moved, or it may never
        have been on the rack.
      </p>

      <div className="nf-card" ref={card}>
        <div className="nf-card-head">
          <span className="meta">Works order</span>
          <span className="nf-ref">TI/—— /NOT-FOUND</span>
        </div>
        <dl className="nf-rows">
          <div><dt className="meta">Requested</dt><dd className="nf-path">{asked}</dd></div>
          <div><dt className="meta">Status</dt><dd>No matching record</dd></div>
        </dl>
        <div className="nf-stamp" ref={stamp} aria-hidden="true">Not on file</div>
      </div>

      <p className="nf-say meta">On the rack right now</p>
      <ul className="nf-families">
        {FAMILIES.map((f) => (
          <li key={f}>
            <Link to={`/collections/${familySlug(f)}`}>{f}</Link>
          </li>
        ))}
      </ul>

      <div className="nf-cta">
        <Button to="/">Back to the start</Button>
        <Button to="/contact" variant="ghost">Ask for it</Button>
      </div>
    </section>
  )
}
