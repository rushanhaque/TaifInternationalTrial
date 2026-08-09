import { CharCascade, Dilate, CardsReveal } from '../components/Reveal'
import Button from '../components/Button'
import '../styles/mk2/page-editorial.css'

/* ── /testimonials — trade feedback ────────────────────────────────────────
   Moved onto the shared masthead and the token palette. The card colours
   were previously a gold pair (#9C7A44 / #C8A765) that appears nowhere in
   tokens.css — a leftover from an earlier brass scheme, sitting inside a
   burgundy house style. */

const TESTIMONIALS = [
  {
    id: 1, category: 'Verified order', stars: 5,
    quote: 'They send a moisture reading with the sample. Nobody else in this category has ever done that unprompted.',
    client: 'Meridian Living', role: 'Head of Product',
    tag: '300 pcs · 0 returns', location: 'Frankfurt, Germany',
  },
  {
    id: 2, category: 'Inlay project', stars: 5,
    quote: 'The brass inlay is the reason we moved. Four suppliers promised flush finish; only Taif delivered it.',
    client: 'Atelier Kade', role: 'Founding Partner',
    tag: '36 SKUs · 0.5% defects', location: 'Paris, France',
  },
  {
    id: 3, category: 'Hotel spec', stars: 5,
    quote: 'Four properties, one patina, zero visible variation. Housekeeping notices these things before we do.',
    client: 'Halcyon Hotels', role: 'Procurement Director',
    tag: 'Global boutique suites', location: 'Dubai, UAE',
  },
  {
    id: 4, category: 'Architectural', stars: 5,
    quote: 'Precision hand-carved teak paired with solid unlacquered brass. Flawless craftsmanship from Moradabad.',
    client: 'Studio Moradabad', role: 'Lead Architect',
    tag: 'Kiln-dried hardwood', location: 'London, UK',
  },
  {
    id: 5, category: 'Export line', stars: 5,
    quote: 'Every container arrives with mill certificates and batch reports inside. Incredible consistency quarter after quarter.',
    client: 'Oberoi Spaces', role: 'Global Trade VP',
    tag: '4 container shipments', location: 'Toronto, Canada',
  },
  {
    id: 6, category: 'Retail collection', stars: 5,
    quote: 'Our customers immediately touch the unlacquered brass finish. It patinas beautifully over time.',
    client: 'Vanguard Home', role: 'Creative Director',
    tag: '1,200 units delivered', location: 'New York, USA',
  },
]

/* the rating is read out once, in words, rather than as six repeated glyphs
   that a screen reader would announce star by star */
function Stars({ n }) {
  return (
    <span className="tm-stars" role="img" aria-label={`${n} out of 5`}>
      <span aria-hidden="true">{'★'.repeat(n)}</span>
    </span>
  )
}

export default function TestimonialsPage() {
  return (
    <>
      <section className="page-hero wrap">
        <div className="hero-kicker">
          <span className="meta">Trade feedback &amp; verification</span>
        </div>
        <CharCascade as="h1" className="mega">Testimonials</CharCascade>
      </section>

      <section className="section alt">
        <div className="wrap">
          <CardsReveal as="ul" className="tm-grid" selector=":scope > .tm-card" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {TESTIMONIALS.map((t) => (
              <li key={t.id} className="pl-card tm-card">
                <div>
                  <div className="tm-card-head">
                    <span className="tm-cat">{t.category}</span>
                    <Stars n={t.stars} />
                  </div>
                  <blockquote className="tm-quote">“{t.quote}”</blockquote>
                </div>

                <div className="tm-card-foot">
                  <div>
                    <p className="tm-client">{t.client}</p>
                    <p className="tm-role">{t.role} · {t.location}</p>
                  </div>
                </div>
              </li>
            ))}
          </CardsReveal>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'clamp(2.5rem, 5vw, 4rem)' }}>
            <Button to="/contact">Get in touch</Button>
          </div>
        </div>
      </section>
    </>
  )
}
