import { useCallback, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reduced } from '../lib/gsap'
import { useGSAP } from '@gsap/react'
import { COLLECTIONS } from '../data/site'
import { COLLECTION_IMGS } from '../data/images'
import { Link } from '../lib/router'
import { familySlug } from '../pages/CollectionPage'
import '../styles/mk2/collections-mosaic.css'

/* ── THE VITRINE — nine collections, one screen ───────────────────────────
   A 3×3 mosaic that behaves like a cabinet of glass shelves rather than a
   grid of cards. The hover is one gesture, not a stack of tricks:

     1. the plate's ROW and COLUMN swell while the other six recede, so the
        mosaic re-proportions around what you are looking at (animated
        flex-grow — smooth in every engine, unlike grid-template);
     2. the six you are not looking at settle into a dimmer state, so the
        one you are reading is the only lit object on the wall, and its
        caption unpacks from one line to three.

   Every moving part shares one duration and one curve, so the wall reads as
   a single object re-proportioning rather than nine cards reacting.
   Keyboard users get the identical state through :focus-within;
   `prefers-reduced-motion` collapses it to a plain, still mosaic. */

const ROWS = [COLLECTIONS.slice(0, 3), COLLECTIONS.slice(3, 6), COLLECTIONS.slice(6, 9)]

/* how much a hovered track takes, and what the other two are left with —
   the three tracks always sum to 3, so the mosaic never changes size */
const LEAD = 1.44
const REST = 0.78

export default function CollectionsMosaic() {
  const root = useRef(null)
  const [hot, setHot] = useState(null) // { r, c } | null

  const grow = (index, active) => (active === null ? 1 : index === active ? LEAD : REST)

  const enter = useCallback((r, c) => setHot({ r, c }), [])
  const leave = useCallback(() => setHot(null), [])

  useGSAP(() => {
    if (reduced()) return
    gsap.from(root.current.querySelectorAll('.cm-card'), {
      y: 46,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: { each: 0.055, from: 'start' },
      scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
    })
    gsap.from(root.current.querySelectorAll('.cm-head > *'), {
      y: 24,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: root.current, start: 'top 78%', once: true },
    })
    return () => ScrollTrigger.getAll().forEach((t) => t.trigger === root.current && t.kill())
  }, { scope: root })

  return (
    <section className="cm-section" ref={root} aria-labelledby="cm-title">
      <div className="cm-head">
        <span className="cm-kicker">Nine houses, one floor</span>
        {/* a section heading, not a page title — the homepage h1 is the
            wordmark in HeroBrand */}
        <h2 className="cm-title" id="cm-title">Browse our collections</h2>
      </div>

      <div
        className={`cm-wall ${hot ? 'is-hot' : ''}`}
        onMouseLeave={leave}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) leave() }}
      >
        {ROWS.map((row, r) => (
          <div className="cm-row" key={r} style={{ flexGrow: grow(r, hot?.r ?? null) }}>
            {row.map((c, i) => {
              const img = COLLECTION_IMGS[c.name]
              const live = hot?.r === r && hot?.c === i
              return (
                <article
                  key={c.no}
                  className={`cm-card ${live ? 'is-live' : ''}`}
                  style={{ flexGrow: grow(i, hot?.c ?? null) }}
                  onMouseEnter={() => enter(r, i)}
                  onFocus={() => enter(r, i)}
                >
                  <Link
                    to={`/collections/${familySlug(c.name)}`}
                    className="cm-link"
                    transition="slide-collection"
                    aria-label={`${c.name} — ${c.pitch}`}
                  >
                    <span className="cm-media" aria-hidden="true">
                      {img
                        ? <img src={img} alt="" className="cm-img" loading="lazy" decoding="async" />
                        : <span className="cm-img cm-img-fallback" />}
                      <span className="cm-duotone" />
                      <span className="cm-scrim" />
                    </span>

                    <span className="cm-body">
                      <span className="cm-no">{c.no}</span>
                      <span className="cm-name-mask">
                        <span className="cm-name">{c.name}</span>
                      </span>
                      <span className="cm-detail">
                        <span className="cm-detail-in">
                          <span className="cm-mat">{c.material}</span>
                          <span className="cm-pitch">{c.pitch}</span>
                        </span>
                      </span>
                    </span>
                  </Link>
                </article>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
