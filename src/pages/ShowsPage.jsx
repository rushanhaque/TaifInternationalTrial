import { CharCascade, Dilate, CardsReveal } from '../components/Reveal'
import Button from '../components/Button'
import SignatureScroll from '../components/SignatureScroll'
import '../styles/mk2/page-editorial.css'

/* ── /shows — exhibitions and the Moradabad showroom ───────────────────────
   Rebuilt onto the shared page furniture (.page-hero / .section / .wrap) and
   the design tokens. It previously carried its own inline white ground and
   burgundy type, which meant the whole page inverted to unreadable the
   moment the theme toggle was used. */

const ATELIER_IMAGES = [
  { id: 1, img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop', alt: 'Finishing bench in the Moradabad atelier' },
  { id: 2, img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop', alt: 'Showroom display of finished metalware' },
  { id: 3, img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop', alt: 'Seasoned timber stacked in the wood shop' },
  { id: 4, img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop', alt: 'Hand-hammered vessels awaiting patina' },
  { id: 5, img: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1200&auto=format&fit=crop', alt: 'Buyer viewing room at the Saharanpur floor' },
  { id: 6, img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200&auto=format&fit=crop', alt: 'Finished pieces staged for packing' },
]

const EXHIBITION_CARDS = [
  { id: 1, title: 'IHGF Delhi Fair', category: 'International exposition', date: 'Autumn 2026', location: 'Greater Noida, Delhi NCR', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop' },
  { id: 2, title: 'Ambiente Frankfurt', category: 'Global home & living', date: 'Spring 2027', location: 'Frankfurt, Germany', img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop' },
  { id: 3, title: 'High Point Market', category: 'North American showcase', date: 'Spring 2027', location: 'North Carolina, USA', img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1200&auto=format&fit=crop' },
  { id: 4, title: 'Maison & Objet', category: 'Design & decoration', date: 'Autumn 2027', location: 'Paris, France', img: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=1200&auto=format&fit=crop' },
]

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

          <SignatureScroll />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 'clamp(3.5rem, 7vw, 5.5rem)' }}>
        <div className="wrap">
          <div className="ed-block-head">
            <h2 className="d2">Exhibitions &amp; Events</h2>
            <span className="meta">Where to find us</span>
          </div>

          <CardsReveal className="shows-events-grid" selector=":scope > .shows-event">
            {EXHIBITION_CARDS.map((event) => (
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
