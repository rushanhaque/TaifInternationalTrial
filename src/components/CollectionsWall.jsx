import { useLayoutEffect, useRef } from 'react'
import { gsap, reduced } from '../lib/gsap'
import { Link } from '../lib/router'
import { COLLECTIONS } from '../data/site'
import { COLLECTION_PAGE_IMGS } from '../data/images'
import { familySlug } from '../lib/families'

/* ── THE INDEX ──────────────────────────────────────────────────────────────
   All nine families as large plates, three to a row, captions underneath.

   There is almost nothing to this component and that is deliberate. The
   version before it ran a pointer-tracked light rig, a per-bay parallax and a
   shared label that swapped on hover — a lot of machinery in service of a
   dark wall you could not read the photographs through. Every one of those
   moving parts is gone. The layout is CSS grid, the hover is CSS, and the
   only script left is the entrance stagger.

   collections-wall.css carries the note on why the caption sits below the
   plate rather than on it. */

/* Six photographs cover nine families, so three of them appear twice. Each
   card crops its plate to a different point — better composition, and the
   reason the repeats do not announce themselves. */
const FOCUS = [
  '50% 42%', '58% 50%', '44% 46%',
  '50% 38%', '52% 56%', '46% 44%',
  '62% 48%', '40% 52%', '56% 40%',
]

export default function CollectionsWall() {
  const rootRef = useRef(null)

  /* The entrance: plates rise and fade in, three at a time. gsap.context
     scopes the selectors to this subtree and reverts its inline styles on
     unmount.

     FAIL OPEN. GSAP runs on rAF, which a hidden tab stops — loading this page
     in a background tab would otherwise leave nine invisible cards until it
     was looked at. If the document is not visible there is nothing to reveal,
     so the grid simply renders. */
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || reduced() || document.hidden) return

    const ctx = gsap.context(() => {
      gsap.from('.cw-card', {
        opacity: 0,
        y: 26,
        duration: 0.95,
        ease: 'atelys',
        stagger: { each: 0.07 },
        delay: 0.1,
        clearProps: 'opacity,transform',
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section className="cw" ref={rootRef}>
      <div className="wrap">
        {/* ── the title block ── */}
        <div className="cw-title">
          <div className="cw-title-kicker">
            <span className="meta">The collections</span>
          </div>

          <h1 className="mega">{`${COLLECTIONS.length} families, one bench.`}</h1>

          <p className="lede cw-title-lede">
            Everything the workshop makes, filed by family. Each one opens onto
            its own room of work — the pieces, the materials they are raised
            from, and the numbers a buyer actually needs.
          </p>

          <dl className="cw-specs">
            <div className="cw-spec"><dt>Families</dt><dd>{String(COLLECTIONS.length).padStart(2, '0')}</dd></div>
            <div className="cw-spec"><dt>Floors</dt><dd>Metal · Timber</dd></div>
            <div className="cw-spec"><dt>Finishing</dt><dd>In house</dd></div>
            <div className="cw-spec"><dt>Bespoke</dt><dd>To drawing</dd></div>
          </dl>
        </div>

        {/* ── the plates ── */}
        <ul className="cw-grid">
          {COLLECTIONS.map((c, i) => (
            <li key={c.no}>
              <Link
                to={`/collections/${familySlug(c.name)}`}
                className="cw-card"
                aria-label={`${c.name} — open the collection`}
              >
                <span className="cw-frame">
                  <img
                    className="cw-img"
                    src={COLLECTION_PAGE_IMGS[c.name]}
                    alt=""
                    style={{ '--focus': FOCUS[i] }}
                    loading={i < 3 ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable="false"
                  />
                </span>

                <span className="cw-cap">
                  <span className="cw-cap-top">
                    <span className="cw-no">{c.no}</span>
                    <span className="cw-arrow" aria-hidden="true">
                      <svg viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </span>

                  <span className="cw-name">{c.name}</span>
                  <span className="cw-mat">{c.material}</span>
                  <span className="cw-pitch">{c.pitch}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
