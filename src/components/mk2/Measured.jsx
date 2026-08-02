import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { FIGURES } from '../../data/site'

/* Measured — the numbers band. Four figures an export buyer scans before he
   reads a word of prose, set as an odometer that rolls once and then sits
   still.

   ROLL MECHANIC. Every digit is a 3-deep strip — two ghost numerals stacked
   above the real one — inside a one-line overflow mask. The strip's RESTING
   position is pure layout, not transform: the mask is a column flexbox with
   justify-content:flex-end, so the last row (the real digit) is pinned to the
   window and the ghosts overflow upward out of sight. Two things fall out of
   that. Markup is correct with JS dead or refused, and GSAP has a clean
   transform slate — a fromTo on yPercent has no CSS translate to fight with,
   which is exactly the bug you get if you park the resting state on a
   percentage translateY. */
const ROWS = 3
/* strip pushed down far enough to show ghost 0; the tween walks it back to 0 */
const START_Y = (100 * (ROWS - 1)) / ROWS

/* A category tag per cell, keyed on the unit rather than on array position so
   re-ordering or editing FIGURES cannot silently mislabel a number. Anything
   unrecognised falls back to a plain index. */
const TAGS = {
  artisans: 'Workshop floor',
  '% MC': 'Seasoning',
  countries: 'Export reach',
  '% on time': 'Dispatch',
}

/* The two numerals that pass the window on the way up to d. */
const ghostsFor = (d) => [(d + 8) % 10, (d + 9) % 10]

function numerals(value) {
  return [...value].map((ch, i) => {
    if (ch >= '0' && ch <= '9') {
      const d = Number(ch)
      return (
        <span className="mk-ms-col" key={i}>
          <span className="mk-ms-strip">
            {ghostsFor(d).map((g, j) => (
              <span className="mk-ms-gh" key={j}>{g}</span>
            ))}
            <span className="mk-ms-gl">{ch}</span>
          </span>
        </span>
      )
    }
    /* dash, dot, anything else: fades in place. Rolling punctuation on a
       digit wheel looks like a rendering fault, not a mechanism. */
    return (
      <span className={ch === '.' ? 'mk-ms-sep is-dot' : 'mk-ms-sep'} key={i}>
        {ch}
      </span>
    )
  })
}

export default function Measured() {
  const root = useRef(null)

  useEffect(() => {
    const el = root.current
    if (!el) return

    const mm = gsap.matchMedia()

    /* Every hidden state is seeded here, inside the motion-safe branch. Under
       prefers-reduced-motion nothing in this block runs: the band renders at
       its finished values, complete and static. */
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const cells = gsap.utils.toArray(el.querySelectorAll('.mk-ms-cell'))
      const scale = el.querySelector('.mk-ms-scale')

      const tl = gsap.timeline({
        defaults: { ease: 'atelys' },
        scrollTrigger: { trigger: el, start: 'top 78%', once: true },
      })

      cells.forEach((cell, c) => {
        /* absolute positions, so cells arrive left to right across the band
           while the digits inside each cell arrive left to right in turn */
        const at = c * 0.09
        const hr = cell.querySelector('.mk-ms-hr')
        const vr = cell.querySelector('.mk-ms-vr')
        const tag = cell.querySelector('.mk-ms-tag')
        const strips = cell.querySelectorAll('.mk-ms-strip')
        const seps = cell.querySelectorAll('.mk-ms-sep')
        const tail = cell.querySelectorAll('.mk-ms-unit, .mk-ms-label')

        tl.fromTo(hr, { scaleX: 0 }, { scaleX: 1, duration: 0.72, ease: 'fluid' }, at)
          .fromTo(vr, { scaleY: 0 }, { scaleY: 1, duration: 0.62, ease: 'fluid' }, at + 0.1)
          .fromTo(tag, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 }, at + 0.06)
          /* 'viscous' — slow to break away, long settle. A digit wheel has
             mass; an overshoot ease would make it read as a bounce. */
          .fromTo(
            strips,
            { yPercent: START_Y },
            { yPercent: 0, duration: 1.05, ease: 'viscous', stagger: 0.06 },
            at + 0.12
          )
          .fromTo(seps, { opacity: 0, y: '0.16em' }, { opacity: 1, y: 0, duration: 0.6 }, at + 0.32)
          .fromTo(tail, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, at + 0.38)
      })

      if (scale) {
        /* the ruler unrolls left to right — clip-path rather than scaleX so
           the tick spacing never stretches */
        tl.fromTo(
          scale,
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 1.15, ease: 'fluid' },
          0.3
        )
      }

      return () => {
        tl.scrollTrigger?.kill()
        tl.kill()
      }
    })

    return () => mm.revert()
  }, [])

  return (
    <section className="section mk-ms" ref={root} aria-labelledby="mk-ms-h">
      <div className="wrap">
        <div className="sec-head">
          <span className="idx">03</span>
          <h2 className="meta mk-ms-h" id="mk-ms-h">Measured</h2>
        </div>

        <p className="lede mk-ms-lede">
          Measured on the floor, not estimated in a brochure. Every figure here has
          a record behind it, and the record ships inside the container.
        </p>

        <ol className="mk-ms-row" role="list">
          {FIGURES.map((f, i) => (
            <li className="mk-ms-cell" key={f.unit || i}>
              <span className="mk-ms-hr" aria-hidden="true" />
              <span className="mk-ms-vr" aria-hidden="true" />

              <span className="meta mk-ms-tag">
                {TAGS[f.unit] || String(i + 1).padStart(2, '0')}
              </span>

              {/* role="img" + aria-label: the strips are a mechanism, not text.
                  Screen readers get the figure once, cleanly. */}
              <span className="mk-ms-val" role="img" aria-label={`${f.value} ${f.unit}`}>
                {numerals(f.value)}
              </span>

              <span className="meta mk-ms-unit" aria-hidden="true">{f.unit}</span>
              <span className="mk-ms-label">{f.label}</span>
            </li>
          ))}
        </ol>

        <div className="mk-ms-scale" aria-hidden="true" />

        <p className="mk-ms-note">
          Verified for the twelve months to June 2026. Mill certificates, kiln logs
          and dispatch records are available on request — we do not publish a number
          we cannot show you the paper for.
        </p>
      </div>
    </section>
  )
}
