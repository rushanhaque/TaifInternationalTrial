import { useRef, useState } from 'react'
import { gsap, reduced } from '../lib/gsap'
import { FAQS, BRAND } from '../data/site'
import { CharCascade, Dilate } from '../components/Reveal'
import Button from '../components/Button'

/* Inflating disclosure rows — opening grows the pill into a rounded panel,
   the answer dilates inside, and a droplet bead slides across (H4).
   Real buttons, aria-expanded/aria-controls (§10). */
/* Clean, static disclosure rows — opening expands the answer panel cleanly.
   Real buttons, aria-expanded/aria-controls. */
function Row({ q, a, id }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`faq-row ${open ? 'open' : ''}`}>
      <button className="faq-q" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <span className="faq-toggle-icon" aria-hidden="true" style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--brass)', transition: 'color 0.25s ease' }}>
          {open ? '−' : '+'}
        </span>
      </button>
      <div className="faq-a" id={id} role="region">
        <div className="faq-a-inner"><p className="body">{a}</p></div>
      </div>
    </div>
  )
}

export default function FaqPage() {
  return (
    <>
      <section className="page-hero wrap">
        <CharCascade as="h1" className="mega">Asked, answered.</CharCascade>
      </section>

      <section className="section alt">
        <div className="wrap faq-wrap">
          {FAQS.map((g, gi) => (
            <div key={g.group} className="faq-group">
              <div className="sec-head"><span className="meta">{g.group}</span></div>
              <div className="faq-list">
                {g.items.map((item, i) => (
                  <Row key={item.q} q={item.q} a={item.a} id={`faq-${gi}-${i}`} />
                ))}
              </div>
            </div>
          ))}
          <div className="sec-foot" style={{ display: 'flex', justifyContent: 'center' }}>
            <Button to="/contact">Ask something else</Button>
          </div>
        </div>
      </section>
    </>
  )
}
