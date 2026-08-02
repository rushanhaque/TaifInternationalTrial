import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reduced } from '../lib/gsap'
import { getLenis } from '../lib/useLenis'
import { BRAND } from '../data/site'
import { CharCascade, Dilate } from '../components/Reveal'

/* Sticky left index; the active section is marked by the Liquid Pill (E6). */
const SECTIONS = [
  { id: 'terms', label: 'Terms of trade' },
  { id: 'privacy', label: 'Privacy policy' },
]

export default function LegalPage() {
  const [active, setActive] = useState('terms')
  const listRef = useRef(null)
  const pillEl = useRef(null)

  useEffect(() => {
    const sts = SECTIONS.map((s) =>
      ScrollTrigger.create({
        trigger: `#${s.id}`,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle(self) { if (self.isActive) setActive(s.id) },
      })
    )
    return () => sts.forEach((st) => st.kill())
  }, [])

  useEffect(() => {
    const link = listRef.current?.querySelector(`a[href="#${active}"]`)
    if (!link) return
    gsap.to(pillEl.current, {
      y: link.offsetTop, height: link.offsetHeight, opacity: 1,
      duration: reduced() ? 0 : 0.5, ease: 'surge',
    })
  }, [active])

  return (
    <>
      <section className="page-hero wrap">
        <p className="hero-kicker"><span className="idx">1.3</span> <span className="meta">Legal</span></p>
        <CharCascade as="h1" className="mega">The fine print.</CharCascade>
      </section>

      <section className="section alt">
        <div className="wrap grid legal-grid">
          <nav className="sp-3 legal-index" aria-label="Legal contents" ref={listRef}>
            <span className="tg-pill legal-pill" ref={pillEl} aria-hidden="true" />
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={active === s.id ? 'on' : ''}
                onClick={(e) => {
                  const l = getLenis()
                  if (!l) return
                  e.preventDefault()
                  l.scrollTo(`#${s.id}`, { offset: -110 })
                }}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="sp-8 st-5 legal-body">
            <article id="terms">
              <h2 className="d2">Terms of trade</h2>
              {[
                ['Quotes & orders', 'Quotes are valid for 30 days and include tooling, unit price and a dated production slot. An order is confirmed on receipt of a signed quote and the agreed advance.'],
                ['Tolerances & variation', 'Dimensional tolerances are stated per drawing; unless agreed otherwise, hand-formed work holds ±0.5 mm and machined features ±0.2 mm. Grain, patina and hammer texture vary between pieces by nature — the approved physical sample, not the photograph, defines the acceptable range.'],
                ['Delivery', 'Goods ship FOB Nhava Sheva unless otherwise agreed. Risk passes per the agreed incoterm. Dated slots are commitments: if we miss one by more than five working days, the freight upgrade is at our cost.'],
                ['Claims', 'Visible defects must be notified within 14 days of receipt with photographs; a root-cause report and a replacement plan follow within five working days.'],
              ].map(([h, c]) => (
                <Dilate key={h}><h3 className="d3">{h}</h3><p className="body">{c}</p></Dilate>
              ))}
            </article>
            <article id="privacy">
              <h2 className="d2">Privacy policy</h2>
              {[
                ['What we collect', 'Contact details you send us, drawings and briefs you share, and standard server logs. No analytics trackers, no advertising pixels, no cookies beyond what the browser needs.'],
                ['How it is used', 'To quote, manufacture and ship your work, and for nothing else. Drawings are held under NDA by default and never shown to another client.'],
                ['Retention', 'Commercial records are kept for seven years to meet Indian tax law. Briefs that do not become orders are deleted after twelve months on request.'],
                ['Your rights', `Write to ${BRAND.email} to access, correct or erase your data. We reply within 30 days.`],
              ].map(([h, c]) => (
                <Dilate key={h}><h3 className="d3">{h}</h3><p className="body">{c}</p></Dilate>
              ))}
            </article>
          </div>
        </div>
      </section>
    </>
  )
}
