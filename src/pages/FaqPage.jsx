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
  const panel = useRef(null)
  const bead = useRef(null)
  const row = useRef(null)

  function toggle() {
    const next = !open
    setOpen(next)
    if (reduced()) {
      panel.current.style.height = next ? 'auto' : '0'
      return
    }
    if (next) {
      row.current.classList.add('open')
      gsap.to(panel.current, { height: 'auto', duration: 0.55, ease: 'surge' })
      gsap.fromTo(
        panel.current.firstChild,
        { scale: 0.96, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, delay: 0.12, ease: 'surge' }
      )
      gsap.fromTo(bead.current, { x: 0 }, {
        x: () => row.current.offsetWidth - 58, duration: 0.65, ease: 'fluid',
      })
    } else {
      row.current.classList.remove('open')
      gsap.to(panel.current, { height: 0, duration: 0.45, ease: 'fluid' })
      gsap.to(bead.current, { x: 0, duration: 0.5, ease: 'fluid' })
    }
  }

  return (
    <div className={`faq-row ${open ? 'open' : ''}`} ref={row}>
      <button className="faq-q" aria-expanded={open} aria-controls={id} onClick={toggle}>
        <span>{q}</span>
        <span className="faq-bead" ref={bead} aria-hidden="true" />
      </button>
      <div className="faq-a" id={id} role="region" ref={panel} style={{ height: 0 }}>
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
