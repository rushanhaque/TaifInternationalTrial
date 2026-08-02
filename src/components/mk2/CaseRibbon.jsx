import { Fragment, useEffect, useId, useRef, useState } from 'react'
import { gsap, reduced } from '../../lib/gsap'
import { CASES } from '../../data/site'
import Button from '../Button'

/* MK2 · Case Ribbon — three wide, stat-first cards.

   A buyer scans the number before the sentence, so the numeral is the hero and
   the prose is support. The outcome line is held back behind the brief and
   released on hover (fine pointer) or tap (the toggle button), which keeps the
   closed state legible at a glance and rewards the second look. */

/* Brass → copper → walnut, so the three cards read as three different
   materials off the same floor rather than one card printed three times. */
const TONES = ['brass', 'copper', 'walnut']

/* Stats arrive as "2,800 sets · 16 weeks". Split on the separator, then split
   each half into numeral + unit so the numeral can carry display type while the
   unit drops to small caps. Anything that does not parse falls through whole —
   the card must never lose a character of real data to a regex. */
function parseStat(stat) {
  return String(stat)
    .split(/[·•/|]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((part) => {
      const m = part.match(/^([\d][\d.,]*%?)\s*(.*)$/)
      return m ? { value: m[1], unit: m[2] } : { value: part, unit: '' }
    })
}

export default function CaseRibbon() {
  const rootRef = useRef(null)
  const uid = useId()
  const [pinned, setPinned] = useState(() => CASES.map(() => false))
  const [hovered, setHovered] = useState(-1)

  /* Reduced motion gets the finished state, not a stripped one: every outcome
     is open on arrival and aria-expanded tells the truth about it. */
  useEffect(() => {
    if (reduced()) setPinned(CASES.map(() => true))
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const cards = gsap.utils.toArray('.cr-card', root)
      const stats = gsap.utils.toArray('.cr-stat', root)

      /* One trigger, two staggers: the cards lift in, then each stat rises out
         of its own mask a beat later so the number lands last. */
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 78%', once: true },
      })
      tl.from(cards, {
        y: 34,
        opacity: 0,
        duration: 0.95,
        ease: 'atelys',
        stagger: 0.12,
      }).from(
        stats,
        {
          yPercent: 48,
          opacity: 0,
          duration: 0.85,
          ease: 'atelys',
          stagger: 0.12,
        },
        0.18,
      )
    })

    return () => mm.revert()
  }, [])

  if (!CASES.length) return null

  const total = String(CASES.length).padStart(2, '0')
  const toggle = (i) => setPinned((p) => p.map((v, k) => (k === i ? !v : v)))
  /* Touch never sets `hovered`; a tap must not leave a card stuck open. */
  const enter = (e, i) => { if (e.pointerType !== 'touch') setHovered(i) }
  const leave = (e, i) => { if (e.pointerType !== 'touch') setHovered((h) => (h === i ? -1 : h)) }

  return (
    <section className="section cr" aria-labelledby={`${uid}-title`} ref={rootRef}>
      <div className="wrap">
        <div className="sec-head">
          <p className="meta">Selected work · {total} orders</p>
        </div>

        <div className="grid cr-intro">
          <h2 className="d1 sp-7" id={`${uid}-title`}>
            Three orders that were not straightforward.
          </h2>
          <p className="lede sp-5 cr-lede">
            The figure is what the buyer signed for. Open a card for what actually
            left the floor.
          </p>
        </div>

        <ol className="cr-list">
          {CASES.map((c, i) => {
            const parts = parseStat(c.stat)
            const isOpen = pinned[i] || hovered === i
            const rid = `${uid}-res-${i}`

            return (
              <li
                key={c.client}
                className={`cr-card${isOpen ? ' is-open' : ''}`}
                data-tone={TONES[i % TONES.length]}
                onPointerEnter={(e) => enter(e, i)}
                onPointerLeave={(e) => leave(e, i)}
              >
                <span className="cr-rail" aria-hidden="true" />
                <article className="cr-in">
                  <header className="cr-top">
                    <span className="chip cr-cat">{c.cat}</span>
                    <h3 className="cr-client">{c.client}</h3>
                    <span className="idx cr-no" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')} / {total}
                    </span>
                  </header>

                  <div className="cr-statcol">
                    <p className="cr-stat-mask">
                      <span className="cr-stat">
                        {parts.map((p, k) => (
                          <Fragment key={`${k}-${p.value}`}>
                            {k > 0 && <span className="cr-sep" aria-hidden="true" />}
                            <span className="cr-part">
                              <span className="cr-val">{p.value}</span>
                              {p.unit && <span className="cr-unit">{p.unit}</span>}
                            </span>
                          </Fragment>
                        ))}
                      </span>
                    </p>
                    <p className="meta cr-statlabel">Contracted figure</p>
                  </div>

                  <div className="cr-text">
                    <p className="body cr-brief">{c.brief}</p>

                    <div className="cr-foot">
                      <button
                        type="button"
                        className="cr-toggle"
                        aria-expanded={isOpen}
                        aria-controls={rid}
                        onClick={() => toggle(i)}
                      >
                        <span className="cr-mark" aria-hidden="true" />
                        <span className="cr-toggle-label">Outcome</span>
                        <span className="sr-only">for {c.client}</span>
                        <svg className="cr-chev" viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
                          <path
                            d="M2.6 4.6 6 8l3.4-3.4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      {/* the brass rule draws across this track as the card opens */}
                      <span className="cr-track" aria-hidden="true">
                        <i className="cr-rule" />
                      </span>
                    </div>

                    {/* Space is reserved at all times — the reveal moves transform
                        and clip-path only, so nothing below it ever reflows. */}
                    <div className="cr-res" id={rid}>
                      <p className="body cr-result">{c.result}</p>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ol>

        <div className="cr-tail">
          <p className="cr-tail-note">
            Every figure here has a purchase order behind it. We will put you on a
            call with the buyer.
          </p>
          <Button to="/contact" small>Ask for a reference</Button>
        </div>
      </div>
    </section>
  )
}
