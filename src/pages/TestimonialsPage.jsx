import { CharCascade, Dilate, CardsReveal } from '../components/Reveal'
import Button from '../components/Button'
import { useContent } from '../lib/content'
import '../styles/mk2/page-editorial.css'

/* ── /testimonials — trade feedback ────────────────────────────────────────
   Moved onto the shared masthead and the token palette. The card colours
   were previously a gold pair (#9C7A44 / #C8A765) that appears nowhere in
   tokens.css — a leftover from an earlier brass scheme, sitting inside a
   burgundy house style. */

/* reviews are editable in /admin — see src/lib/content.jsx */

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
  const reviews = useContent('reviews')

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
            {reviews.map((t) => (
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

          <div className="sec-foot" style={{ display: 'flex', justifyContent: 'center' }}>
            <Button to="/contact">Get in touch</Button>
          </div>
        </div>
      </section>
    </>
  )
}
