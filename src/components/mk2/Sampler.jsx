import { useState, useEffect, useRef } from 'react'
import { Link } from '../../lib/router'
import { getLenis } from '../../lib/useLenis'
import { reduced } from '../../lib/gsap'
import { useContent } from '../../lib/content'
import { productImg } from '../../data/images'

const SIGNATURE_ITEMS = [
  {
    id: 1,
    title: 'Lotus Wall Sconce',
    subtitle: 'Hand-Hammered Brass',
  },
  {
    id: 2,
    title: 'Minimalist Pedestal',
    subtitle: 'Solid Sheesham & Copper',
  },
  {
    id: 3,
    title: 'Sculptural Vessel',
    subtitle: 'Burnished Bronze',
  },
  {
    id: 4,
    title: 'Geometric Tray',
    subtitle: 'Antique Patina',
  }
]

/* The best-sellers grid is now a selection of real catalogue products, chosen
   in /admin → Best sellers and stored as slugs. Positions are derived rather
   than authored: the nine cells sit in three rows beneath the signature plate,
   and each card floats in from the direction of its own column, so the layout
   still works when fewer than nine are selected.

   The hardcoded eleven-piece list that used to live here was invented stock —
   names and photographs of pieces that are not in the catalogue. */
/* The signature plate occupies row 1, column 2, so the first two cards flank
   it — that top row is the arrangement this section has always had. Filling
   rows 2-4 only (which an earlier version did) left the plate stranded alone
   on row 1 with a gap either side.

   The ninth slot lands centred on row 4 rather than in the left corner, so a
   full selection ends on a deliberate capstone instead of a lopsided orphan. */
const CELLS = [
  { row: 1, col: 1 }, { row: 1, col: 3 },                    // flanking the plate
  { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 },
  { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 },
  { row: 4, col: 1 },                                        // left of centred tail
  { row: 4, col: 2 },                                        // centred tail
  { row: 4, col: 3 },                                        // right of centred tail
]

function layoutFor(index) {
  const { row, col } = CELLS[index % CELLS.length]
  return {
    row,
    col,
    /* drift in from the side the card lands on, and from further below the
       lower its row — the same choreography the authored offsets described */
    dx: (col - 2) * 125,
    dy: (row - 1) * 55 + 30,
  }
}

/* The pinned zoom is a desktop instrument. It needs a viewport wide enough to
   hold a 2.25× signature plate AND three columns of cards flying in from
   ±125px; at 375px those columns land at -83px and +458px, i.e. off both
   edges, and the plate fills the screen before the transition has begun. It
   cannot be tuned into that space — it has to become a different thing.

   So on a phone the section keeps its content and drops its mechanism: the
   signature plate sits still at the top, and the best sellers become a
   horizontal rail you flick through. Explicitly the fallback the brief asked
   for. Desktop is untouched — everything below branches on a media query. */
const MOBILE = '(max-width: 768px)'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE).matches
  )
  useEffect(() => {
    const mq = window.matchMedia(MOBILE)
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return isMobile
}

export default function Sampler() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const sectionRef = useRef(null)
  const targetPRef = useRef(0)
  const currentPRef = useRef(0)
  const rafRef = useRef(null)
  const isMobile = useIsMobile()

  const activeItem = SIGNATURE_ITEMS[activeIdx]

  /* Resolve the chosen slugs against the live catalogue. A slug that no longer
     matches a product — deleted, or renamed in the Products tab — is dropped
     rather than rendered as a blank card, and empty slots are skipped, so the
     grid closes up around whatever is genuinely selected. */
  const bestSellers = useContent('bestSellers')
  const products = useContent('products')
  const pieces = (bestSellers || [])
    .map((slug) => products.find((pr) => pr.slug === slug))
    .filter(Boolean)

  /* Clicking the signature plate runs the whole transition for you: it scrolls
     to the exact offset where p reaches 1, which is the end of the section's
     scroll travel, leaving the best-sellers grid fully settled and every card
     landed. Without this the only way through was to keep wheeling.

     Lenis owns the scroll position when it is running, so ask it rather than
     window.scrollTo — the two fight each other otherwise. */
  const skipToBestSellers = () => {
    const sec = sectionRef.current
    if (!sec) return
    const maxScroll = sec.offsetHeight - window.innerHeight
    if (maxScroll <= 0) return
    const target = sec.offsetTop + maxScroll

    const lenis = getLenis()
    if (lenis) lenis.scrollTo(target, { duration: 1.1 })
    else window.scrollTo({ top: target, behavior: reduced() ? 'auto' : 'smooth' })
  }

  useEffect(() => {
    /* no pin, no scrub, no rAF loop on a phone — the mobile branch renders a
       static plate and a rail, so this machinery would only burn frames */
    if (isMobile) return

    const handleScroll = () => {
      const sec = sectionRef.current
      if (!sec) return
      const rect = sec.getBoundingClientRect()
      const maxScroll = sec.offsetHeight - window.innerHeight
      if (maxScroll <= 0) return
      const raw = -rect.top / maxScroll
      targetPRef.current = Math.min(1, Math.max(0, raw))
    }

    const updateLoop = () => {
      const diff = targetPRef.current - currentPRef.current
      if (Math.abs(diff) > 0.0005) {
        currentPRef.current += diff * 0.40
        setProgress(currentPRef.current)
      }
      rafRef.current = requestAnimationFrame(updateLoop)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    rafRef.current = requestAnimationFrame(updateLoop)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isMobile])

  // heroScale shrinks from 2.25x down to 1.0x as user scrolls
  const p = progress
  const heroScale = Math.max(1, 2.25 - p * 1.25)
  const heroOffsetY = (1 - p) * 135
  /* how far the settled grid drifts down at the end of the scroll. Was 140px,
     which pushed the bottom cards and the CTA toward the sticky's lower edge —
     right where the next (Craft) section approaches — so the two read as
     overlapping. Kept small so the grid stays centred, clear of the boundary. */
  const afterTransitionOffsetY = p * 48

  // Opacities for transition swap:
  // initialContentOpacity: Signature Piece title + 4 tiny cards fade out as user scrolls
  // finalNameOpacity: Atelier's Lamp title fades in when scroll transition completes
  const initialContentOpacity = Math.max(0, 1 - p * 1.8)
  const finalNameOpacity = Math.min(1, Math.max(0, (p - 0.45) * 2.2))

  if (isMobile) {
    return (
      <section className="czoom-section is-mobile" ref={sectionRef}>
        <div className="mrail-head">
          <h2 className="mrail-title">Signature Piece</h2>
        </div>

        {/* the plate, still — tap a thumbnail to change it */}
        <div className="mrail-sig">
          <img src={activeItem.image} alt={activeItem.title} className="mrail-sig-img" />
          <div className="mrail-sig-scrim" />
          <div className="mrail-sig-meta">
            <span className="mrail-sig-sub">{activeItem.subtitle}</span>
            <h3 className="mrail-sig-name">{activeItem.title}</h3>
          </div>
        </div>

        <div className="mrail-thumbs-head">Best Sellers</div>
        <div className="mrail-thumbs">
          {SIGNATURE_ITEMS.map((item, idx) => (
            <button
              type="button"
              key={item.id}
              className={`mrail-thumb ${idx === activeIdx ? 'is-active' : ''}`}
              onClick={() => setActiveIdx(idx)}
              aria-label={`View ${item.title}`}
              aria-pressed={idx === activeIdx}
            >
              <img src={item.image} alt="" />
            </button>
          ))}
        </div>



        <div className="mrail-cta">
          <Link to="/contact" className="czoom-schedule-btn">
            <span>Schedule a Discussion</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="czoom-section" ref={sectionRef}>
      <div className="czoom-sticky">
        {/* Floating Top Section Heading 'BEST SELLERS' (fades in after transition) */}
        <div
          className="czoom-bestsellers-header"
          style={{
            opacity: finalNameOpacity,
            transform: `translate(-50%, ${Math.max(0, (1 - p) * 20)}px)`,
            pointerEvents: p > 0.5 ? 'auto' : 'none'
          }}
        >
          <h2 className="czoom-bestsellers-title">Best Sellers</h2>
        </div>

        <div className="czoom-container">
          <div className="czoom-grid">

            {/* Best sellers, floating into place around the signature plate */}
            {pieces.map((item, idx) => {
              const { row, col, dx, dy } = layoutFor(idx)
              const stagger = idx * 0.04
              const rawCardP = Math.min(1, Math.max(0, (p - 0.1 - stagger) / 0.6))
              const cardP = rawCardP * rawCardP * (3 - 2 * rawCardP)

              const opacity = cardP
              const scale = 0.5 + cardP * 0.5
              const translateX = (1 - cardP) * dx
              const translateY = (1 - cardP) * dy + afterTransitionOffsetY

              return (
                <Link
                  key={item.slug}
                  to={`/catalogue/${item.slug}`}
                  className="czoom-card"
                  style={{
                    gridRow: row,
                    gridColumn: col,
                    opacity,
                    transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                    pointerEvents: p > 0.4 ? 'auto' : 'none'
                  }}
                >
                  <img src={item.image || productImg(item.slug)} alt={item.name} className="czoom-card-img" />
                  <div className="czoom-card-meta">
                    <span className="czoom-card-sub">{item.material}</span>
                    <h3 className="czoom-card-name">{item.name}</h3>
                  </div>
                </Link>
              )
            })}

            {/* Center Hero Card — SIGNATURE PIECE CARD */}
            <div
              className="czoom-hero-card sig-full-card"
              style={{
                gridRow: 1,
                gridColumn: 2,
                transform: `translate3d(0, ${heroOffsetY + afterTransitionOffsetY}px, 0) scale(${heroScale})`,
                zIndex: p < 0.5 ? 12 : 2
              }}
            >
              {/* Click anywhere on the plate to run the transition. It sits
                  under the thumbnails and the settled caption in the stack, so
                  it never swallows their clicks, and it retires once the grid
                  has landed — past that point the plate is just a card. */}
              {p < 0.5 && (
                <button
                  type="button"
                  className="sig-skip"
                  onClick={skipToBestSellers}
                  aria-label="Skip to the best sellers"
                />
              )}
              {/* Removed signature piece cover image */}

              {/* Vignette Overlay */}
              <div className="sig-card-overlay" />

              {/* Top Center Title (Fades out after scroll transition) */}
              <div
                className="sig-header-floating"
                style={{
                  opacity: initialContentOpacity,
                  pointerEvents: p > 0.5 ? 'none' : 'auto'
                }}
              >
                <h2 className="sig-title">Signature Piece</h2>
              </div>



              {/* Actual Product Name "Atelier's Lamp" (Fades in when scroll transition is done) */}
              <div
                className="czoom-card-meta"
                style={{
                  position: 'absolute',
                  bottom: '1.25rem',
                  left: '1.25rem',
                  right: '1.25rem',
                  opacity: finalNameOpacity,
                  pointerEvents: p > 0.5 ? 'auto' : 'none',
                  zIndex: 6
                }}
              >
                <span className="czoom-card-sub">SIGNATURE SPECIFICATION</span>
                <h3 className="czoom-card-name" style={{ fontSize: 'clamp(1.1rem, 1.6vw, 1.5rem)' }}>
                  Atelier's Lamp
                </h3>
              </div>
            </div>

          </div>

          {/* Big Action Button below all cards at bottom center */}
          <div
            className="czoom-bottom-cta-wrap"
            style={{
              opacity: finalNameOpacity,
              transform: `translate3d(0, ${afterTransitionOffsetY}px, 0)`,
              pointerEvents: p > 0.5 ? 'auto' : 'none'
            }}
          >
            <Link to="/contact" className="czoom-schedule-btn">
              <span>Schedule a Discussion</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
