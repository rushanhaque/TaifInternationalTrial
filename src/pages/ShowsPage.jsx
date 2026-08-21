import { CharCascade, Dilate, CardsReveal } from '../components/Reveal'
import Button from '../components/Button'
import SignatureScroll from '../components/SignatureScroll'
import { useContent } from '../lib/content'
import { useDarkMode } from '../lib/hooks'
import { Link } from '../lib/router'
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

function ComingSoonOverlay({ dark }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 90,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      background: dark ? 'rgba(42,19,6,0.55)' : 'rgba(255,255,255,0.40)',
      pointerEvents: 'all',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2.5rem 3rem',
        borderRadius: '1.2rem',
        background: dark ? 'rgba(74,36,16,0.70)' : 'rgba(255,255,255,0.65)',
        border: '1px solid rgba(122,59,29,0.18)',
        boxShadow: '0 8px 48px rgba(42,19,6,0.12)',
        maxWidth: '420px',
        width: '90%',
      }}>
        <p style={{
          fontFamily: 'var(--font-accent)',
          fontSize: '0.68rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--brass)',
          marginBottom: '1rem',
        }}>Coming Soon</p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
          color: dark ? '#FFFFFF' : 'var(--graphite)',
          marginBottom: '0.75rem',
          lineHeight: 1.2,
        }}>We&rsquo;re working on this.</h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.95rem',
          color: dark ? 'rgba(255,255,255,0.72)' : 'var(--graphite-2)',
          lineHeight: 1.65,
          marginBottom: '1.75rem',
        }}>
          Our Shows &amp; Exhibitions page is being updated.<br />
          Check back soon — or get in touch directly.
        </p>
        <Link
          to="/contact"
          style={{
            display: 'inline-block',
            padding: '0.65rem 1.6rem',
            borderRadius: 'var(--r-pill)',
            background: 'var(--brass)',
            color: '#FFFFFF',
            fontFamily: 'var(--font-accent)',
            fontSize: '0.7rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Get in touch
        </Link>
      </div>
    </div>
  )
}

export default function ShowsPage() {
  const atelier = useContent('atelier')
  const exhibitions = useContent('exhibitions')
  const dark = useDarkMode()

  return (
    <div style={{ position: 'relative' }}>
      <ComingSoonOverlay dark={dark} />

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

      <section className="section">
        <div className="wrap">
          <div className="ed-block-head">
            <h2 className="d2">Exhibitions &amp; Events</h2>
            <span className="meta">Where to find us</span>
          </div>

          <CardsReveal className="shows-events-grid" selector=":scope > .shows-event">
            {exhibitions.map((event) => (
              <article key={event.id} className="shows-event">
                <div className="shows-event-media">
                  <img src={event.imgThumb || event.img} alt="" loading="lazy" decoding="async" />
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
    </div>
  )
}
