import { useRef, useState } from 'react'
import { PARTNERS, CASES, TESTIMONIALS } from '../data/site'
import { CharCascade, Dilate } from '../components/Reveal'
import Toggle from '../components/Toggle'
import Button from '../components/Button'

const CATS = ['All', 'Hospitality', 'Retail', 'Design', 'Architecture']

/* Before/after comparison — a real range input drives the reveal, so the
   handle is draggable, keyboard-operable and screen-reader friendly for free. */
function Compare({ label }) {
  const ref = useRef(null)
  const [v, setV] = useState(50)
  return (
    <div className="cmp" ref={ref} style={{ '--cmp': `${v}%` }}>
      <div className="cmp-pane cmp-before tone-wood">
        <span className="meta">Reference piece</span>
      </div>
      <div className="cmp-pane cmp-after tone-brass">
        <span className="meta">Taif finish</span>
      </div>
      <span className="cmp-line" aria-hidden="true" />
      <input
        type="range"
        min="0"
        max="100"
        value={v}
        aria-label={`Compare finish — ${label}`}
        onInput={(e) => setV(Number(e.target.value))}
      />
    </div>
  )
}

export default function PartnersPage() {
  const [cat, setCat] = useState('All')
  const partners = cat === 'All' ? PARTNERS : PARTNERS.filter((p) => p.cat === cat)

  return (
    <>
      <section className="page-hero wrap">
        <p className="hero-kicker"><span className="idx">0.9</span> <span className="meta">Partners</span></p>
        <CharCascade as="h1" className="mega">Their name on it.</CharCascade>
        <Dilate>
          <p className="lede">
            Hospitality groups, retailers, studios and architects who ship our metal
            and wood under their own brands. They stay because the second container
            matches the first.
          </p>
        </Dilate>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="partner-bar">
            <Toggle
              label="Filter partners"
              options={CATS.map((c) => ({ value: c, label: c }))}
              value={cat}
              onChange={setCat}
            />
          </div>
          <div className="chip-wall">
            {partners.map((p) => <span key={p.name} className="chip">{p.name} <span className="dim2">· {p.cat}</span></span>)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.9</span><span className="meta">Case studies</span></div>
          {CASES.map((c, i) => (
            <div key={c.client} className="grid case-block">
              <div className={i % 2 ? 'sp-6 st-7' : 'sp-6'}>
                <Compare label={c.client} />
              </div>
              <div className="sp-5 case-copy">
                <Dilate>
                  <span className="meta dim2">{c.cat} · {c.stat}</span>
                  <h3 className="d2">{c.client}</h3>
                  <p className="body"><strong>Brief.</strong> {c.brief}</p>
                  <p className="body"><strong>Result.</strong> {c.result}</p>
                </Dilate>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.9</span><span className="meta">In their words</span></div>
          <div className="grid">
            {TESTIMONIALS.map((tq, i) => (
              <Dilate key={tq.org} className="sp-4 quote-card" delay={i * 0.1}>
                <p className="d3">“{tq.quote}”</p>
                <p className="meta" style={{ marginTop: '1rem', color: 'var(--dim)' }}>{tq.who} · {tq.org}</p>
              </Dilate>
            ))}
          </div>
          <div style={{ marginTop: '2.2rem' }}>
            <Button to="/contact">Join them</Button>
          </div>
        </div>
      </section>
    </>
  )
}
