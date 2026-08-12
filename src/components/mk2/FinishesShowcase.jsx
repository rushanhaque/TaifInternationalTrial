import { useRef, useState } from 'react'
import { coarse } from '../../lib/gsap'
import { CharCascade, SmoothReveal } from '../Reveal'
import Button from '../Button'

/* ── FINISHES, AT A GLANCE ─────────────────────────────────────────────────
   An interactive swatch selector, not a static gallery. The big card on the
   left is a single window that shows whichever finish the small list on the
   right is pointing at — the four photographs sit stacked and pre-loaded
   underneath each other, and only their opacity moves, so swapping between
   them reads as the SAME piece changing its surface rather than as one
   photo being replaced by an unrelated one.

   TWO INPUTS, ONE STATE MACHINE.
   · `active` is the persistent choice — what the window shows at rest, and
     which row carries the highlighted "this is selected" treatment. It
     starts on Antique, the house default, and only a CLICK ever moves it.
   · `preview` is a transient, hover-only look-ahead. It exists on desktop
     alone: resting a pointer or keyboard focus on a row shows that finish
     without committing to it, and leaving the row snaps back to `active`.

   MOBILE HAS NO HOVER, SO IT ONLY EVER USES THE FIRST HALF OF THAT MACHINE.
   coarse() is read once at mount (matches the pattern DragRail already uses
   for the same touch/mouse fork) and gates the pointerenter/leave handlers
   entirely — a tap fires the click handler either way, so touch reduces
   cleanly to "tap a row, it becomes the selection," exactly the click
   effect asked for in place of hover. */

const FINISHES = [
  {
    key: 'antique', name: 'Antique',
    img: '/assets/finishes/antique.png',
    substrates: ['Brass', 'Copper', 'Iron'],
    character: 'Aged forward by hand until it reads a century old, then stopped exactly where we want it.',
  },
  {
    key: 'nickel', name: 'Nickel',
    img: '/assets/finishes/nickel.png',
    substrates: ['Brass', 'Steel', 'Zinc Alloy'],
    character: 'Plated in a cool, bright nickel that resists tarnish and fingerprints far longer than raw brass.',
  },
  {
    key: 'oiled-rubbed-bronze', name: 'Oiled Rubbed Bronze',
    img: '/assets/finishes/oiled-rubbed-bronze.png',
    substrates: ['Brass', 'Zinc Alloy'],
    character: 'A dark, worked bronze with warm highlights left standing on the raised detail — hand-rubbed, not sprayed flat.',
  },
  {
    key: 'powder-coated', name: 'Powder Coated',
    img: '/assets/finishes/powder-coated.png',
    substrates: ['Steel', 'Iron', 'Aluminium'],
    character: 'An electrostatic coat baked to a hard, even shell — the most weatherproof finish on the floor, built for daily handling.',
  },
]

const DEFAULT_KEY = 'antique'

export default function FinishesShowcase() {
  const isTouch = useRef(coarse()).current
  const [active, setActive] = useState(DEFAULT_KEY)
  const [preview, setPreview] = useState(null)

  const shownKey = preview || active
  const shown = FINISHES.find((f) => f.key === shownKey)

  const look = (key) => { if (!isTouch) setPreview(key) }
  const unlook = () => { if (!isTouch) setPreview(null) }

  return (
    <section className="fin section" id="finishes">
      <div className="wrap">
        <div className="sec-head">
          <CharCascade as="span" className="meta">Finishes we offer</CharCascade>
        </div>

        <div className="fin-grid">
          {/* ── the window ── */}
          <article className="fin-hero">
            <span className="fin-hero-media" aria-hidden="true">
              {FINISHES.map((f) => (
                <img
                  key={f.key}
                  src={f.img}
                  alt=""
                  className={`fin-hero-img${f.key === shownKey ? ' is-shown' : ''}`}
                  loading={f.key === DEFAULT_KEY ? 'eager' : 'lazy'}
                  decoding="async"
                />
              ))}
              <span className="fin-hero-scrim" />
            </span>
            <div className="fin-hero-body">
              <span className="fin-hero-eyebrow meta">
                {shownKey === active ? 'Selected finish' : 'Previewing'}
              </span>
              {/* keyed so the name swap gets its own fade rather than
                  jump-cutting under the crossfading photo behind it. Just
                  the name now — the character copy and substrate tags read
                  as a caption competing with the photo itself, and the same
                  copy is already on each row of the selector below. */}
              <div className="fin-hero-copy" key={shownKey}>
                <h3 className="fin-hero-name">{shown.name}</h3>
              </div>
            </div>
          </article>

          {/* ── the selector ── */}
          <ul className="fin-list" role="listbox" aria-label="Choose a finish to preview">
            {FINISHES.map((f) => (
              <li key={f.key}>
                <button
                  type="button"
                  className={`fin-row${f.key === active ? ' is-active' : ''}`}
                  role="option"
                  aria-selected={f.key === active}
                  onPointerEnter={() => look(f.key)}
                  onPointerLeave={unlook}
                  onFocus={() => look(f.key)}
                  onBlur={unlook}
                  onClick={() => setActive(f.key)}
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
