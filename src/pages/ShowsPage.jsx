import { CharCascade, Dilate, CardsReveal } from '../components/Reveal'
import Button from '../components/Button'
import SignatureScroll from '../components/SignatureScroll'
import { useContent } from '../lib/content'
import '../styles/mk2/page-editorial.css'

/* ── /shows — exhibitions and the Moradabad showroom ───────────────────────
   Rebuilt onto the shared page furniture (.page-hero / .section / .wrap) and
   the design tokens. It previously carried its own inline white ground and
   burgundy type, which meant the whole page inverted to unreadable the
   moment the theme toggle was used. */

/* the atelier plates and the trade-show cards are editable in /admin — they
   live in the content store now rather than as constants here */

/* a drawn pin — the emoji it replaces rendered as a colour glyph and ignored
   the surrounding type colour in both themes */
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  )
}

export default function ShowsPage() {
  const atelier = useContent('atelier')
  const exhibitions = useContent('exhibitions')

  return (
    <>
      <section className="page-hero wrap">
        <div className="hero-kicker">
          <span className="meta">Exhibitions &amp; locations</span>
        </div>
        <CharCascade as="h1" className="mega">Shows and Showroom</CharCascade>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="ed-block-head">
            <h2 className="d2">Ateliers</h2>
            <span className="meta">Moradabad · Saharanpur</span>
          </div>

          <SignatureScroll slides={atelier} />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 'clamp(3.5rem, 7vw, 5.5rem)' }}>
        <div className="wrap">
          <div className="ed-block-head">
            <h2 className="d2">Exhibitions &amp; Events</h2>
            <span className="meta">Where to find us</span>
          </div>

          <CardsReveal className="shows-events-grid" selector=":scope > .shows-event">
            {exhibitions.map((event) => (
              <article key={event.id} className="shows-event">
                <div className="shows-event-media">
                  <img src={event.img} alt="" loading="lazy" decoding="async" />
                  <span className="shows-event-date">{event.date}</span>
                </div>
                <div className="shows-event-body">
                  <div className="shows-event-top">
                    <h3 className="shows-event-title">{event.title}</h3>
                    <span className="meta shows-event-cat">{event.category}</span>
                  </div>
                  <p className="shows-event-loc">
                    <PinIcon />
                    {event.location}
                  </p>
                </div>
              </article>
            ))}
          </CardsReveal>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="shows-cta">
            <h2>Book an in-person showroom visit</h2>
            <p className="lede">
              Private buyer viewings, custom material sampling and guided atelier
              walk-throughs, available to trade partners.
            </p>
            <Button to="/contact">Contact the atelier team</Button>
          </div>
        </div>
      </section>
    </>
  )
}
