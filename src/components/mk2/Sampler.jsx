import { useState, useEffect, useRef } from 'react'
import { Link } from '../../lib/router'

const SIGNATURE_ITEMS = [
  {
    id: 1,
    title: 'Lotus Wall Sconce',
    subtitle: 'Hand-Hammered Brass',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Minimalist Pedestal',
    subtitle: 'Solid Sheesham & Copper',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Sculptural Vessel',
    subtitle: 'Burnished Bronze',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'Geometric Tray',
    subtitle: 'Antique Patina',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop',
  }
]

const OTHER_PIECES = [
  {
    id: 'piece-1',
    name: 'Aurelia Brass Lamp',
    subtitle: 'Solid Hammered Brass',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop',
    gridPos: { row: 1, col: 1 },
    dx: -120,
    dy: -110
  },
  {
    id: 'piece-2',
    name: 'Verona Bronze Stand',
    subtitle: 'Hand-Buffed Finish',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    gridPos: { row: 2, col: 2 },
    dx: 0,
    dy: 0
  },
  {
    id: 'piece-3',
    name: 'Solstice Copper Bowl',
    subtitle: 'Flame-Oxidized Patina',
    image: 'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?q=80&w=800&auto=format&fit=crop',
    gridPos: { row: 1, col: 3 },
    dx: 120,
    dy: -110
  },
  {
    id: 'piece-4',
    name: 'Helios Brass Lantern',
    subtitle: 'Architectural Lighting',
    image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=800&auto=format&fit=crop',
    gridPos: { row: 2, col: 1 },
    dx: -130,
    dy: 0
  },
  {
    id: 'piece-5',
    name: 'Regent Cast Bench',
    subtitle: 'Heavy Foundry Iron',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
    gridPos: { row: 2, col: 3 },
    dx: 130,
    dy: 0
  },
  {
    id: 'piece-6',
    name: 'Celeste Copper Pitcher',
    subtitle: 'Raw Copper Craft',
    image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=800&auto=format&fit=crop',
    gridPos: { row: 3, col: 1 },
    dx: -120,
    dy: 100
  },
  {
    id: 'piece-7',
    name: 'Marbella Teak Table',
    subtitle: 'Architectural Salvage',
    image: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?q=80&w=800&auto=format&fit=crop',
    gridPos: { row: 3, col: 2 },
    dx: 0,
    dy: 120
  },
  {
    id: 'piece-8',
    name: 'Zenith Brass Inlay',
    subtitle: 'Precision Metalwork',
    image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=800&auto=format&fit=crop',
    gridPos: { row: 3, col: 3 },
    dx: 120,
    dy: 100
  },
  {
    id: 'piece-9',
    name: 'Kashmiri Carved Tray',
    subtitle: 'Walnut & Brass Trim',
    image: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=800&auto=format&fit=crop',
    gridPos: { row: 4, col: 1 },
    dx: -120,
    dy: 150
  },
  {
    id: 'piece-10',
    name: 'Antiqued Nickel Urn',
    subtitle: 'Spun Nickel Metalwork',
    image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?q=80&w=800&auto=format&fit=crop',
    gridPos: { row: 4, col: 2 },
    dx: 0,
    dy: 160
  },
  {
    id: 'piece-11',
    name: 'Solarium Lantern',
    subtitle: 'Clear Glass & Brass',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    gridPos: { row: 4, col: 3 },
    dx: 120,
    dy: 150
  }
]

export default function Sampler() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const sectionRef = useRef(null)
  const targetPRef = useRef(0)
  const currentPRef = useRef(0)
  const rafRef = useRef(null)

  const activeItem = SIGNATURE_ITEMS[activeIdx]

  useEffect(() => {
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
  }, [])

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

            {/* Surrounding Cards (Pieces floating into place around Signature Piece) */}
            {OTHER_PIECES.map((item, idx) => {
              const stagger = idx * 0.04
              const rawCardP = Math.min(1, Math.max(0, (p - 0.1 - stagger) / 0.6))
              const cardP = rawCardP * rawCardP * (3 - 2 * rawCardP)

              const opacity = cardP
              const scale = 0.5 + cardP * 0.5
              const translateX = (1 - cardP) * item.dx
              const translateY = (1 - cardP) * item.dy + afterTransitionOffsetY

              return (
                <Link
                  key={item.id}
                  to="/catalogue"
                  className="czoom-card"
                  style={{
                    gridRow: item.gridPos.row,
                    gridColumn: item.gridPos.col,
                    opacity,
                    transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                    pointerEvents: p > 0.4 ? 'auto' : 'none'
                  }}
                >
                  <img src={item.image} alt={item.name} className="czoom-card-img" />
                  <div className="czoom-card-meta">
                    <span className="czoom-card-sub">{item.subtitle}</span>
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
              {/* Full Card Big Image */}
              <img
                key={activeItem.id}
                src={activeItem.image}
                alt={activeItem.title}
                className="sig-card-bg-img"
              />

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

              {/* 4 Tiny Cards Floating at Bottom (Fades out after scroll transition) */}
              <div
                className="sig-card-content"
                style={{
                  opacity: initialContentOpacity,
                  pointerEvents: p > 0.5 ? 'none' : 'auto'
                }}
              >
                <div className="sig-thumb-row-floating">
                  {SIGNATURE_ITEMS.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`sig-thumb-card-floating ${idx === activeIdx ? 'is-active' : ''}`}
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveIdx(idx)
                      }}
                      tabIndex="0"
                      role="button"
                      aria-label={`View ${item.title}`}
                    >
                      <img src={item.image} alt={item.title} className="sig-thumb-img-floating" />
                    </div>
                  ))}
                </div>
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
