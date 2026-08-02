import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reduced } from '../../lib/gsap'
import { MATERIALS } from '../../data/site'

/* ── THE COMPARISON RIG ─────────────────────────────────────────────────────
   Six materials, eighteen figures — and until now they sat as eighteen
   unrelated numbers. A buyer cannot feel the difference between 8.94 and
   2.65 g/cm³ by reading it; they can see it instantly as two bars.

   Every figure is normalised against the largest value FOR ITS OWN UNIT,
   and the metal floor and the wood floor are scaled separately, because
   comparing a melting point to a Janka rating would be meaningless. Each
   unit therefore gets its own honest scale, and the bar lengths are
   directly comparable down a column.

   Bars grow from the left on scroll. Hovering or focusing a row lifts that
   material and dims the rest, so a single comparison can be isolated.

   FAIL-OPEN: the numbers are real text in the DOM at full opacity. Only the
   bar's scaleX is animated, so if motion never runs the figures still read
   — you lose the comparison, never the data. */

const FLOORS = [
  { key: 'Metal', label: 'The metal floor', note: 'Moradabad' },
  { key: 'Wood', label: 'The wood floor', note: 'Saharanpur' },
]

/* HV and HB are both hardness scales and read alike at these values. Left on
   separate scales, aluminium's 60 HB normalised to 1.0 inside its own
   single-member group and drew a FULL bar — implying it was as hard as
   brass at 110 HV, which is simply false. Folding them into one metric is
   the honest reading. */
const UNIT_ALIAS = { HV: 'hardness', HB: 'hardness' }
const metricOf = (u) => UNIT_ALIAS[u] || u

/* strip everything but the number so '8–10' and '1660' both compare */
const num = (v) => {
  const m = String(v).match(/[\d.]+/g)
  if (!m) return 0
  return m.length > 1 ? (parseFloat(m[0]) + parseFloat(m[1])) / 2 : parseFloat(m[0])
}

export default function MaterialRig() {
  const rootRef = useRef(null)
  const [lit, setLit] = useState(null)

  /* per floor, per unit: the largest value, so each metric gets its own scale */
  const scales = useMemo(() => {
    const out = {}
    FLOORS.forEach(({ key }) => {
      const mats = MATERIALS.filter((m) => m.kind === key)
      const byUnit = {}
      const counts = {}
      mats.forEach((m) => m.figs.forEach((f) => {
        const k = metricOf(f.u)
        byUnit[k] = Math.max(byUnit[k] || 0, num(f.v))
        counts[k] = (counts[k] || 0) + 1
      }))
      out[key] = { max: byUnit, counts }
    })
    return out
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root || reduced()) return undefined
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.rig-row').forEach((row) => {
        gsap.fromTo(row.querySelectorAll('.rig-fill'),
          { scaleX: 0 },
          {
            scaleX: 1, duration: 1.15, ease: 'atelys', stagger: 0.06,
            scrollTrigger: { trigger: row, start: 'top 88%', once: true },
          })
        gsap.from(row.querySelectorAll('.rig-name, .rig-val'), {
          y: 14, opacity: 0, duration: 0.7, ease: 'fluid', stagger: 0.04,
          scrollTrigger: { trigger: row, start: 'top 88%', once: true },
        })
      })
      ScrollTrigger.refresh()
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="rig" ref={rootRef} aria-labelledby="rig-title">
      <div className="wrap">
        <div className="sec-head">
          <span className="idx">0.7.2</span>
          <span className="meta">Measured against each other</span>
        </div>

        <h2 className="rig-title" id="rig-title">The numbers, side by side.</h2>
        <p className="rig-lede">
          Each metric is scaled against the highest value on its own floor, so
          the bars are directly comparable down a column. Metal and wood are
          measured separately — a melting point and a Janka rating share no
          scale worth drawing.
        </p>

        {FLOORS.map(({ key, label, note }) => {
          const mats = MATERIALS.filter((m) => m.kind === key)
          if (!mats.length) return null
          return (
            <div className="rig-floor" key={key}>
              <div className="rig-floor-head">
                <span className="rig-floor-mark" aria-hidden="true" />
                <h3 className="rig-floor-name">{label}</h3>
                <span className="meta rig-floor-note">{note}</span>
              </div>

              <ul className="rig-list" onMouseLeave={() => setLit(null)}>
                {mats.map((m) => (
                  <li
                    key={m.name}
                    className={`rig-row ${lit && lit !== m.name ? 'is-dim' : ''} ${lit === m.name ? 'is-lit' : ''}`}
                    onMouseEnter={() => setLit(m.name)}
                    onFocus={() => setLit(m.name)}
                    onBlur={() => setLit(null)}
                    tabIndex={0}
                  >
                    <div className="rig-id">
                      <span className={`rig-chip tone-${m.tone}`} aria-hidden="true" />
                      <span className="rig-name">{m.name}</span>
                      <span className="meta rig-meta">{m.meta}</span>
                    </div>

                    <div className="rig-bars">
                      {m.figs.map((f) => {
                        const k = metricOf(f.u)
                        const max = scales[key].max[k] || 1
                        /* a bar implies a comparison. If this metric appears
                           on only one material, there is nothing to compare
                           it against, so show the figure and draw no bar
                           rather than a misleading full one. */
                        const comparable = (scales[key].counts[k] || 0) > 1
                        const pct = Math.max(0.06, num(f.v) / max)
                        return (
                          <div className="rig-bar" key={f.u}>
                            {comparable ? (
                              <div className="rig-track" aria-hidden="true">
                                <span className="rig-fill" style={{ '--pct': pct.toFixed(3) }} />
                              </div>
                            ) : (
                              <div className="rig-track is-solo" aria-hidden="true" />
                            )}
                            <span className="rig-val">
                              <b>{f.v}</b><i>{f.u}</i>
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
