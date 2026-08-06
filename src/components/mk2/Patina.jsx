import { useRef, useState } from 'react'
import { reduced } from '../../lib/gsap'

/* ── THE PATINA DIAL ────────────────────────────────────────────────────────
   Care advice is normally a list of instructions nobody reads. This makes it
   tangible: drag the dial from year 0 to year 10 and watch each surface
   actually age — brass drifting to umber, copper travelling rose → russet →
   verdigris, a sealed lacquer holding almost still, oiled wood deepening and
   warming.

   HOW IT WORKS. One number, --age (0..1), drives everything. Each surface
   declares a young and an old gradient; the swatch stacks them and the old
   one's opacity IS the age, so the two cross-fade continuously rather than
   snapping between states. No canvas, no images, no per-frame JS — the
   browser interpolates a single custom property.

   The rates are not uniform, because the materials are not: copper moves
   fastest and furthest, sealed barely moves at all, and that difference is
   the actual lesson the page is teaching.

   ACCESSIBILITY: a real <input type="range">, so it is keyboard-operable and
   announced correctly. The written care guidance below is never gated behind
   the dial — the toy is an illustration, never the only source of truth. */

/* young → old for each surface, plus how far each actually travels in ten
   years (1 = the full declared distance) */
const SURFACES = {
  brass: {
    label: 'Unlacquered brass',
    young: 'linear-gradient(135deg,#f4e3bd 0%,#daa520 28%,#c5973f 62%,#a0522d 100%)',
    old: 'linear-gradient(135deg,#a8905e 0%,#8a6d3e 30%,#6b5228 64%,#4a3a1e 100%)',
    rate: 0.85,
    reads: ['Bright, day one', 'Warming', 'Umber', 'Deep umber'],
  },
  copper: {
    label: 'Copper',
    young: 'linear-gradient(135deg,#f0b48a 0%,#cd853f 26%,#b87333 64%,#8b4513 100%)',
    old: 'linear-gradient(135deg,#8d6a4e 0%,#6f6a4a 34%,#4f6f5c 68%,#3d5f52 100%)',
    rate: 1,
    reads: ['Rose', 'Russet', 'Umber', 'Verdigris edge'],
  },
  sealed: {
    label: 'Sealed & lacquered',
    young: 'linear-gradient(135deg,#f6e6c2 0%,#daa520 30%,#cd853f 66%,#a8823f 100%)',
    old: 'linear-gradient(135deg,#eddcb8 0%,#dcc086 30%,#c19a55 66%,#9e7a3a 100%)',
    rate: 0.18,
    reads: ['As shipped', 'As shipped', 'A shade softer', 'A shade softer'],
  },
  wood: {
    label: 'Oiled solid wood',
    young: 'linear-gradient(135deg,#c7a579 0%,#a8814f 32%,#7c5634 68%,#5a3f26 100%)',
    old: 'linear-gradient(135deg,#a37c4f 0%,#7f5c33 32%,#573b20 68%,#2a2927 100%)',
    rate: 0.6,
    reads: ['Fresh oil', 'Settling', 'Deepening', 'Rich, even'],
  },
}

const ORDER = ['brass', 'copper', 'sealed', 'wood']

export default function Patina() {
  const [years, setYears] = useState(0)
  const liveRef = useRef(null)
  const age = years / 10

  const readFor = (k) => {
    const r = SURFACES[k].reads
    return r[Math.min(r.length - 1, Math.floor(age * r.length * 0.999))]
  }

  return (
    <section className="pat" aria-labelledby="pat-title">
      <div className="wrap">
        <div className="sec-head">
          <span className="idx">1.0.1</span>
          <span className="meta">Ten years, in ten seconds</span>
        </div>

        <div className="pat-head">
          <h2 className="pat-title" id="pat-title">Watch it age.</h2>
          <p className="pat-lede">
            Every surface we ship changes. Drag the dial to see how far each one
            travels in a decade left entirely alone — and how differently they
            move. None of this is damage; all of it is reversible except the
            one you choose to keep.
          </p>
        </div>

        {/* the dial */}
        <div className="pat-dial">
          <label className="pat-dial-label meta" htmlFor="pat-range">
            Years unattended
          </label>
          <div className="pat-dial-row">
            <input
              id="pat-range"
              className="pat-range"
              type="range"
              min="0"
              max="10"
              step="1"
              value={years}
              onChange={(e) => setYears(+e.target.value)}
              aria-describedby="pat-live"
            />
            <output className="pat-out" htmlFor="pat-range">
              <b>{years}</b><i>{years === 1 ? 'year' : 'years'}</i>
            </output>
          </div>
          <p className="sr-only" id="pat-live" ref={liveRef} aria-live="polite">
            {years} years unattended.
            {ORDER.map((k) => ` ${SURFACES[k].label}: ${readFor(k)}.`).join('')}
          </p>
        </div>

        {/* the surfaces */}
        <ul className="pat-grid">
          {ORDER.map((k) => {
            const s = SURFACES[k]
            /* each material ages at its own rate — that difference is the point */
            const local = Math.min(1, age * s.rate)
            return (
              <li className="pat-cell" key={k}>
                <div
                  className="pat-swatch"
                  style={{ '--age': local.toFixed(3) }}
                  aria-hidden="true"
                >
                  <span className="pat-young" style={{ backgroundImage: s.young }} />
                  <span className="pat-old" style={{ backgroundImage: s.old }} />
                  <span className="pat-sheen" />
                </div>
                <div className="pat-say">
                  <span className="pat-name">{s.label}</span>
                  <span className="pat-read meta">{readFor(k)}</span>
                </div>
              </li>
            )
          })}
        </ul>

        <p className="pat-foot">
          {reduced()
            ? 'Set the dial to compare each surface at any point in its first decade.'
            : 'Sealed finishes barely move. Copper moves furthest, and fastest. Both are working exactly as intended.'}
        </p>
      </div>
    </section>
  )
}
