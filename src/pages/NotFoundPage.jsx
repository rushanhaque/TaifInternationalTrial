import { useEffect, useRef } from 'react'
import { gsap, reduced } from '../lib/gsap'
import { Link } from '../lib/router'
import Button from '../components/Button'
import { FAMILIES, familySlug } from '../lib/families'

/* ── NOT ON FILE ────────────────────────────────────────────────────────────
   A 404 that says "page not found" wastes the one moment it has. This one
   speaks the same works-docket language as the enquiry cart and the contact
   page, so a wrong turn still sounds like the same company — and it offers
   every collection as a way back rather than a single home button. */

export default function NotFoundPage() {
  const lede = useRef(null)

  useEffect(() => {
    if (reduced()) return undefined
    const ctx = gsap.context(() => {
      gsap.from(lede.current, { y: 18, opacity: 0, duration: 0.6, ease: 'power3.out' })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="nf">
      <h1 className="d1">This one was never made.</h1>
      <p className="lede nf-lede" ref={lede}>
        No docket exists for that address — it may have moved, or it may never
        have been on the rack.
      </p>

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
