import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, reduced } from '../../lib/gsap'
import { TIMELINE } from '../../data/site'

/* ── THE RAIL ───────────────────────────────────────────────────────────────
   1998 → 2026 as a single brass rail with a molten bead travelling down it.
   Each year lights as the bead reaches it and stays lit behind it, so the
   rail fills with metal as you read — the company's history literally being
   poured.

   This replaces a horizontal drag rail. A drag rail is a browsing gesture:
   good for a catalogue where order is arbitrary, wrong for a chronology
   where the order IS the content and nothing should be skippable. Reading
   downward is also how a timeline is read on paper.

   FAIL-OPEN: every year, heading and paragraph is real text at full opacity
   in the CSS resting state. Motion only adds the bead, the fill and the
   lighting — with no JS you get a plain, complete, legible chronology. */

export default function Timeline() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || reduced()) return undefined

    const ctx = gsap.context(() => {
      /* the rail fills from the top as the section passes */
      gsap.fromTo('.tl-fill',
        { scaleY: 0 },
        {
          scaleY: 1, ease: 'none',
          scrollTrigger: {
            trigger: '.tl-track',
            start: 'top 62%',
            end: 'bottom 78%',
            scrub: 0.55,
          },
        })

      /* the bead rides the same range, so it always sits at the fill's edge */
      gsap.fromTo('.tl-bead',
        { top: '0%' },
        {
          top: '100%', ease: 'none',
          scrollTrigger: {
            trigger: '.tl-track',
            start: 'top 62%',
            end: 'bottom 78%',
            scrub: 0.55,
          },
        })

      /* each entry lights as it arrives and stays lit — history accumulates */
      gsap.utils.toArray('.tl-row').forEach((row) => {
        ScrollTrigger.create({
          trigger: row,
          start: 'top 68%',
          onEnter: () => row.classList.add('is-lit'),
          onLeaveBack: () => row.classList.remove('is-lit'),
        })
        /* The year and its copy used to lift 22px out of opacity 0 as each
           row came up. Removed — text is static site-wide by request. The
           row still lights (`is-lit`, above) and the rail still fills, so
           the reader's position on the timeline is still marked; it is
           marked by the rail rather than by the words moving. */
      })

      ScrollTrigger.refresh()
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section className="tl" ref={rootRef} aria-labelledby="tl-title">
      <div className="wrap">
        <div className="sec-head">
          <span className="idx">0.8.1</span>
          <span className="meta">Since 1998</span>
        </div>
        <h2 className="tl-title" id="tl-title">Twenty-eight years, in order.</h2>

        <div className="tl-track">
          {/* the rail: an unlit channel, a brass fill, and the bead at its edge */}
          <div className="tl-rail" aria-hidden="true">
            <span className="tl-fill" />
            <span className="tl-bead" />
          </div>

          <ol className="tl-list">
            {TIMELINE.map((t) => (
              <li className="tl-row" key={t.year}>
                <span className="tl-node" aria-hidden="true" />
                <div className="tl-body">
                  <span className="tl-year">{t.year}</span>
                  <p className="tl-copy">{t.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
