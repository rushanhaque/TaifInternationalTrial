import { useCallback, useEffect, useRef, useState } from 'react'
import { coarse } from '../../lib/gsap'
import { asset } from '../../lib/asset'
import { CharCascade, SmoothReveal } from '../Reveal'
import Button from '../Button'

/* ── ONE OBJECT, TWELVE SURFACES ───────────────────────────────────────────
   The twelve photographs are the same goblet, shot from the same position
   under the same light, with only the finish changed. That is the whole
   design premise of this section:

   ▸ THE STAGE ANIMATES OPACITY AND NOTHING ELSE. Because the frames are
     pixel-aligned, a straight cross-dissolve reads as the metal itself
     transmuting — the object never appears to move or be replaced. Add a
     scale or a slide here and it collapses into an ordinary slideshow, so
     don't: the stillness is the effect.

   ▸ THE SWATCHES CROP TO THE BOWL. Each tile zooms to the same point on the
     same object, so the grid reads as a row of material samples rather than
     twelve thumbnails of one cup. Uniform framing is what makes the
     comparison legible.

   WEIGHT. Twelve stage frames are ~1.8 MB, so they are NOT all mounted.
   Only the current and outgoing frames exist in the DOM; the grid runs on
   520px thumbs (~283 KB for all twelve). Pointing at a swatch warms its
   stage frame before the click lands, and autoplay warms the next one, so
   the switch is nearly always served from cache. */

const F = (key, name, substrates, character) => ({
  key,
  name,
  substrates,
  character,
  img: asset(`/assets/finishes/${key}.webp`),
  thumb: asset(`/assets/finishes/${key}-thumb.webp`),
})

/* Ordered as a story rather than alphabetically: the two hand-aged finishes,
   then the bare-metal treatments, then the plated ones, then the surfaces
   that add something on top of the metal. */
const FINISHES = [
  F('brass-antique', 'Brass Antique', ['Brass'],
    'Raw brass aged forward by hand until it reads a century old, then stopped exactly where we want it.'),
  F('copper-antique', 'Copper Antique', ['Copper'],
    'The same ageing carried into copper, where the warmth falls to a deep red-brown that still moves in the light.'),
  F('shiny-polish', 'Shiny Polish', ['Brass', 'Copper', 'Steel'],
    'Cut back through every grade of abrasive until the metal gives a clean mirror with no cloud left in it.'),
  F('matte', 'Matte', ['Brass', 'Steel', 'Aluminium'],
    'The glare taken out entirely, leaving an even skin that shows the form instead of the reflection.'),
  F('nickel', 'Nickel', ['Brass', 'Steel', 'Zinc Alloy'],
    'Plated in a cool, bright nickel that holds off tarnish and fingerprints far longer than raw brass.'),
  F('silver-plated', 'Silver Plated', ['Brass', 'Copper'],
    'A bright silver layer with a blue-cool cast, buffed to keep its shine under daily handling.'),
  F('gold-plated', 'Gold Plated', ['Brass', 'Zinc Alloy'],
    'True gold laid over polished brass — the warmest and most reflective surface on the floor.'),
  F('rose-gold', 'Rose Gold', ['Brass', 'Copper'],
    'Copper held in the gold to pull the tone pink, kept light so it reads soft rather than red.'),
  F('patina', 'Patina', ['Brass', 'Copper'],
    'Oxidised in a controlled bath so the green bloom settles exactly where weather would have put it.'),
  F('rustic', 'Rustic', ['Iron', 'Brass'],
    'Worked rough on purpose: hammer marks, dark hollows and bright high points left as struck.'),
  F('enamel', 'Enamel', ['Brass', 'Copper'],
    'Vitreous colour fired over metal, glassy and unfading, with the engraving left standing beneath it.'),
  F('powder-coated', 'Powder Coated', ['Steel', 'Iron', 'Aluminium'],
    'An electrostatic coat baked to a hard, even shell — the most weatherproof finish on the floor.'),
]

const SPEED = 1600  // must match the fin-transmute animation in the stylesheet
const DWELL = 5600  // time the finished frame is held still before the next

/* Ask the browser for a stage frame without mounting it, so the crossfade
   has bytes to work with by the time the visitor commits to a swatch. */
const warm = (src) => { const i = new Image(); i.src = src }

export default function FinishesShowcase() {
  const isTouch = useRef(coarse()).current
  const [current, setCurrent] = useState(0)
  const [outgoing, setOutgoing] = useState(null)
  const [switching, setSwitching] = useState(false)
  const [paused, setPaused] = useState(false)
  const settle = useRef(null)
  const tabs = useRef([])

  const go = useCallback((next) => {
    setCurrent((c) => {
      if (next === c) return c
      setOutgoing(c)
      return next
    })
  }, [])

  /* Retire the outgoing frame once it is fully hidden — keeping it mounted
     any longer holds a second full-size decode in memory for nothing. */
  useEffect(() => {
    if (outgoing === null) return undefined
    setSwitching(true)
    clearTimeout(settle.current)
    settle.current = setTimeout(() => { setOutgoing(null); setSwitching(false) }, SPEED)
    return () => clearTimeout(settle.current)
  }, [outgoing, current])

  const next = useCallback(() => go((current + 1) % FINISHES.length), [current, go])

  useEffect(() => {
    if (paused) return undefined
    const t = setTimeout(next, DWELL)
    return () => clearTimeout(t)
  }, [next, paused])

  /* Warm whatever is coming next: the autoplay successor always, and on a
     touch device the neighbours too, since there is no hover to warm them. */
  useEffect(() => {
    warm(FINISHES[(current + 1) % FINISHES.length].img)
  }, [current])

  const onKeyDown = (e) => {
    const n = FINISHES.length
    let to = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = (current + 1) % n
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = (current - 1 + n) % n
    else if (e.key === 'Home') to = 0
    else if (e.key === 'End') to = n - 1
    if (to === null) return
    e.preventDefault()
    go(to)
    tabs.current[to]?.focus()
  }

  const shown = FINISHES[current]
  /* current first so it paints under the incoming frame, never over it */
  const mounted = outgoing === null || outgoing === current
    ? [current]
    : [outgoing, current]

  return (
    <section className="fin section" id="finishes" aria-labelledby="fin-title">
      <div className="wrap">
        <div className="sec-head">
          <CharCascade as="span" className="meta" id="fin-title">Finishes we offer</CharCascade>
        </div>
        <p className="fin-lede">
          One object, twelve surfaces. Every finish below is the same piece —
          refinished, re-shot, and left in exactly the same light.
        </p>

        <div className="fin-layout">
          {/* ── the stage ── */}
          <div
            className="fin-stage"
            role="tabpanel"
            id="fin-panel"
            aria-live="polite"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <span className="fin-frames" aria-hidden="true">
              {mounted.map((i) => (
                <img
                  key={FINISHES[i].key}
                  src={FINISHES[i].img}
                  alt=""
                  decoding="async"
                  fetchpriority={i === current ? 'high' : 'low'}
                  className={`fin-frame${i === current ? ' is-on' : ' is-out'}`}
                />
              ))}
            </span>
            <span className={`fin-vignette${switching ? ' is-on' : ''}`} aria-hidden="true" />
            <span className="fin-scrim" aria-hidden="true" />

            <div className="fin-cap">
              <span className="fin-cap-idx meta">
                {String(current + 1).padStart(2, '0')} / {String(FINISHES.length).padStart(2, '0')}
              </span>
              <h3 className="fin-cap-name">{shown.name}</h3>
              <p className="fin-cap-note">{shown.character}</p>
            </div>
          </div>

          {/* ── the swatch wall ── */}
          <div
            className="fin-grid"
            role="tablist"
            aria-label="Choose a finish"
            aria-orientation="horizontal"
            onKeyDown={onKeyDown}
            onMouseLeave={() => setPaused(false)}
          >
            {FINISHES.map((f, i) => (
              <button
                key={f.key}
                type="button"
                ref={(el) => { tabs.current[i] = el }}
                className={`fin-sw${i === current ? ' is-on' : ''}`}
                role="tab"
                id={`fin-tab-${f.key}`}
                aria-selected={i === current}
                aria-controls="fin-panel"
                tabIndex={i === current ? 0 : -1}
                onClick={() => go(i)}
                onPointerEnter={() => {
                  warm(f.img)
                  if (!isTouch) { setPaused(true); go(i) }
                }}
                onFocus={() => { warm(f.img); setPaused(true); go(i) }}
              >
                <span className="fin-sw-tile">
                  <img src={f.thumb} alt="" loading="lazy" decoding="async" />
                  {/* the name sits on the tile, so it needs its own floor to
                      stay legible over gold as well as over patina */}
                  <span className="fin-sw-veil" aria-hidden="true" />
                  <span className="fin-sw-name">{f.name}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <SmoothReveal as="div" className="fin-foot">
          <Button to="/care" variant="ghost">See care guidance for every finish</Button>
        </SmoothReveal>
      </div>
    </section>
  )
}
