import { LOCATIONS, BRAND } from '../data/site'
import { CharCascade, Dilate } from '../components/Reveal'
import WorksOrder from '../components/mk2/WorksOrder'
import Slab from '../components/Slab'
import GradualBlur from '../components/reactbits/GradualBlur'

export default function ContactPage() {
  return (
    <div style={{ position: 'relative' }}>
      <section className="page-hero wrap">
        <p className="hero-kicker"><span className="idx">1.1</span> <span className="meta">Contact</span></p>
        <CharCascade as="h1" className="mega">Start the sample.</CharCascade>
        <Dilate>
          <p className="lede">
            Send a drawing, a photograph or a piece you already sell. A priced quote —
            tooling, MOQ and a dated production slot — returns within five working days.
          </p>
        </Dilate>
      </section>

      <section className="section alt">
        <div className="wrap grid">
          <div className="sp-7">
            <WorksOrder />
          </div>
          <div className="sp-4 st-8 contact-direct">
            <Dilate delay={0.1}>
              <h3 className="meta" style={{ color: 'var(--dim)' }}>Direct</h3>
              <a className="d3 direct-link" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
              <a className="d3 direct-link" href={`tel:${BRAND.phone.replace(/\s/g, '')}`}>{BRAND.phone}</a>
              <p className="body dim" style={{ marginTop: '1rem' }}>Mon–Sat, 09:00–18:00 IST. Replies in English, हिन्दी, اردو.</p>
            </Dilate>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head"><span className="idx">1.1</span><span className="meta">Locations</span></div>
          <div className="grid">
            {LOCATIONS.map((l, i) => (
              <Dilate key={l.name} className="sp-4 loc-card" delay={i * 0.08}>
                <span className="meta dim2">{l.meta}</span>
                <h3 className="d3">{l.name}</h3>
                {l.lines.map((line) => <p key={line} className="body">{line}</p>)}
              </Dilate>
            ))}
          </div>
          <div style={{ marginTop: '1.6rem' }}>
            <Slab tone="wood" ratio="21/6" label="MORADABAD · 28.84° N, 78.77° E" meta="Industrial Estate" />
          </div>
        </div>
      </section>

      {/* Sticky container that sticks to the bottom of the viewport until this wrapper div ends (just before the footer) */}
      <div style={{ position: 'sticky', bottom: 0, height: 0, zIndex: 100, pointerEvents: 'none' }}>
        <GradualBlur
          target="parent"
          position="bottom"
          height="12rem"
          strength={2}
          divCount={8}
          curve="bezier"
          exponential={true}
          opacity={1}
          style={{ position: 'absolute', bottom: 0, background: 'linear-gradient(to bottom, transparent, rgba(180, 112, 60, 0.15) 90%)' }}
        />
      </div>
    </div>
  )
}
