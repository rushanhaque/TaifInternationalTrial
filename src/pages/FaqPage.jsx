import { useRef, useState } from 'react'
import { gsap, reduced } from '../lib/gsap'
import { FAQS, BRAND } from '../data/site'
import { CharCascade, Dilate } from '../components/Reveal'
import Button from '../components/Button'

/* Inflating disclosure rows — opening grows the pill into a rounded panel,
   the answer dilates inside, and a droplet bead slides across (H4).
   Real buttons, aria-expanded/aria-controls (§10). */
function Row({ q, a, id }) {
  const [open, setOpen] = useState(false)
  const bead = useRef(null)
  const row = useRef(null)

  /* The panel opens on grid-template-rows 0fr → 1fr, driven purely by the
     `open` class. This used to tween `height` to 'auto' in GSAP, which meant
     every frame of every open reflowed the whole column beneath it — the one
     layout-thrashing animation left in the codebase. The grid technique
     needs no measurement, no JS per frame, and no fixed height, so it also
     stays correct when the answer rewraps at a different width.

     FAIL-OPEN: the row is readable with no JS — the button is still a real
     disclosure control and the panel is in the DOM. */
  function toggle() {
    const next = !open
    setOpen(next)
    if (reduced() || !bead.current || !row.current) return
    /* the bead is the only thing still tweened: pure transform, no layout */
    if (next) {
      gsap.fromTo(bead.current, { x: 0 }, {
        x: () => row.current.offsetWidth - 58, duration: 0.65, ease: 'fluid',
      })
    } else {
      gsap.to(bead.current, { x: 0, duration: 0.5, ease: 'fluid' })
    }
  }

  return (
    <div className={`faq-row ${open ? 'open' : ''}`} ref={row}>
      <button className="faq-q" aria-expanded={open} aria-controls={id} onClick={toggle}>
        <span>{q}</span>
        <span className="faq-bead" ref={bead} aria-hidden="true" />
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
        <p className="hero-kicker"><span className="idx">1.2</span> <span className="meta">FAQ</span></p>
        <CharCascade as="h1" className="mega">Asked, answered.</CharCascade>
        <Dilate>
          <p className="lede">
            Twelve questions, answered with numbers rather than adjectives.
            Anything else —{' '}{BRAND.email} replies within a working day.
          </p>
        </Dilate>
      </section>

      <section className="section alt">
        <div className="wrap faq-wrap">
          {FAQS.map((g, gi) => (
            <div key={g.group} className="faq-group">
              <div className="sec-head"><span className="idx">1.{gi + 1}</span><span className="meta">{g.group}</span></div>
              <div className="faq-list">
                {g.items.map((item, i) => (
                  <Row key={item.q} q={item.q} a={item.a} id={`faq-${gi}-${i}`} />
                ))}
              </div>
            </div>
          ))}
          <div style={{ marginTop: '2.4rem' }}>
            <Button to="/contact">Ask something else</Button>
          </div>
        </div>
      </section>
    </>
  )
}
