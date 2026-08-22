import { useCallback, useEffect, useRef, useState } from 'react'
import { coarse, reduced } from '../../lib/gsap'
import { asset } from '../../lib/asset'
import { CharCascade, SmoothReveal } from '../Reveal'
import Button from '../Button'

/* ── FINISHES, AT A GLANCE ─────────────────────────────────────────────────
   Same crossfade mechanism as SlatShow: the incoming image stacks above the
   outgoing one and fades up over 700ms, so the swap never dips through the
   background. Autoplay advances every 5 s; hover/focus pauses it; clicking a
   selector row or a dot/arrow jumps to that finish. */

const FINISHES = [
  {
    key: 'antique', name: 'Antique',
    img: asset('/assets/finishes/antique.webp'),
    substrates: ['Brass', 'Copper', 'Iron'],
    character: 'Aged forward by hand until it reads a century old, then stopped exactly where we want it.',
  },
  {
    key: 'nickel', name: 'Nickel',
    img: asset('/assets/finishes/nickel.webp'),
    substrates: ['Brass', 'Steel', 'Zinc Alloy'],
    character: 'Plated in a cool, bright nickel that resists tarnish and fingerprints far longer than raw brass.',
  },
  {
    key: 'oiled-rubbed-bronze', name: 'Oiled Rubbed Bronze',
    img: asset('/assets/finishes/oiled-rubbed-bronze.webp'),
    substrates: ['Brass', 'Zinc Alloy'],
    character: 'A dark, worked bronze with warm highlights left standing on the raised detail — hand-rubbed, not sprayed flat.',
  },
  {
    key: 'powder-coated', name: 'Powder Coated',
    img: asset('/assets/finishes/powder-coated.webp'),
    substrates: ['Steel', 'Iron', 'Aluminium'],
    character: 'An electrostatic coat baked to a hard, even shell — the most weatherproof finish on the floor.',
  },
]

const SPEED = 1400
const DWELL = 5000

export default function FinishesShowcase() {
  const isTouch = useRef(coarse()).current
  const [current, setCurrent] = useState(0)
  const [outgoing, setOutgoing] = useState(null)
  const [paused, setPaused] = useState(false)
  const settle = useRef(null)

  const go = useCallback((next) => {
    if (next === current) return
    if (!reduced()) setOutgoing(current)
    setCurrent(next)
  }, [current])

  useEffect(() => {
    if (outgoing === null) return undefined
    clearTimeout(settle.current)
    settle.current = setTimeout(() => setOutgoing(null), SPEED)
    return () => clearTimeout(settle.current)
  }, [outgoing, current])

  const next = useCallback(() => go((current + 1) % FINISHES.length), [current, go])
  const prev = useCallback(() => go((current - 1 + FINISHES.length) % FINISHES.length), [current, go])

  useEffect(() => {
    if (paused) return undefined
    const t = setTimeout(next, DWELL)
    return () => clearTimeout(t)
  }, [next, paused])

  const shown = FINISHES[current]

  return (
    <section className="fin section" id="finishes">
      <div className="wrap">
        <div className="sec-head">
          <CharCascade as="span" className="meta">Finishes we offer</CharCascade>
        </div>

        <div className="fin-grid">
          {/* ── the window ── */}
          <article
            className="fin-hero"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <span className="fin-hero-media" aria-hidden="true">
              {FINISHES.map((f, i) => (
                <img
                  key={f.key}
                  src={f.img}
                  alt=""
                  decoding="async"
                  className={`fin-hero-img${i === current ? ' is-on' : ''}${i === outgoing ? ' is-out' : ''}`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              ))}
            </span>

            <div className="fin-hero-body">
              <div className="fin-hero-copy" key={current}>
                <span className="fin-hero-eyebrow meta">Selected finish</span>
                <h3 className="fin-hero-name">{shown.name}</h3>
                <p className="fin-hero-note">{shown.character}</p>
                <ul className="fin-hero-subs">
                  {shown.substrates.map((s) => <li key={s}>{s}</li>)}
                </ul>
              </div>
            </div>

          </article>

          {/* ── the selector ── */}
          <ul className="fin-list" role="listbox" aria-label="Choose a finish">
            {FINISHES.map((f, i) => (
              <li key={f.key}>
                <button
                  type="button"
                  className={`fin-row${i === current ? ' is-active' : ''}`}
                  role="option"
                  aria-selected={i === current}
                  onClick={() => go(i)}
                  onPointerEnter={() => { if (!isTouch) { setPaused(true); go(i) } }}
                  onPointerLeave={() => { if (!isTouch) setPaused(false) }}
                >
                  <span className="fin-swatch">
                    <img src={f.img} alt="" loading="lazy" decoding="async" />
                  </span>
                  <span className="fin-row-body">
                    <span className="fin-row-name">{f.name}</span>
                    <span className="fin-row-note">{f.character}</span>
                  </span>
                  <span className="fin-row-mark" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <SmoothReveal as="div" className="fin-foot">
          <Button to="/care" variant="ghost">See care guidance for every finish</Button>
        </SmoothReveal>
      </div>
    </section>
  )
}
