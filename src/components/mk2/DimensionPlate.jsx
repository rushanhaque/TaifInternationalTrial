import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, reduced } from '../../lib/gsap'

/* ── THE DIMENSION PLATE ────────────────────────────────────────────────────
   The product page used to illustrate "Dimensions" with a decorative panel
   carrying the measurements as a caption. This draws them instead.

   Every figure on this plate comes from the piece's own `dims` string, so the
   drawing cannot drift from the catalogue — change the data and the geometry
   changes with it. Two views, one shared scale, so the elevation and the plan
   are honestly comparable to each other and across products: a coaster plate
   really is drawn smaller than a sideboard plate.

   WHAT IT SHOWS — the packing envelope, not the silhouette. We do not hold
   profile geometry for a raised bowl, so drawing a bowl-shaped outline would
   be an invention. The bounding box is both true and the number a buyer
   actually needs: it is what goes in the carton and onto the pallet.

   FAIL-OPEN: the SVG is complete and correct with no JS at all. The reveal
   only sets a dash offset and animates it back to zero, so if the trigger
   never fires the lines are simply already drawn. */

const NBSP = ' ' // thin space, for "280 mm"

/* 'Ø 280 × 95 mm' → round; '460 × 220 × 24 mm' → rectangular;
   'To drawing' and anything else unparseable → null, handled by the caller */
export function parseDims(raw) {
  if (!raw) return null
  const s = String(raw).split('·')[0].trim()
  const n = s.match(/\d+(?:\.\d+)?/g)
  if (!n) return null
  const v = n.map(Number)

  if (/Ø/.test(s) && v.length >= 2) {
    return { kind: 'round', w: v[0], d: v[0], h: v[1] }
  }
  if (v.length >= 3) return { kind: 'rect', w: v[0], d: v[1], h: v[2] }
  return null
}

/* a dimension line: extension ticks, arrowheads, and the figure on top */
function Dim({ x1, y1, x2, y2, label, side = 'below' }) {
  const vertical = x1 === x2
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  return (
    <g className="dp-dim">
      <line className="dp-dim-line" x1={x1} y1={y1} x2={x2} y2={y2} />
      {/* arrowheads, drawn as short strokes so they scale with the line */}
      <g className="dp-arrow">
        {vertical ? (
          <>
            <path d={`M${x1 - 4} ${y1 + 7} L${x1} ${y1} L${x1 + 4} ${y1 + 7}`} />
            <path d={`M${x2 - 4} ${y2 - 7} L${x2} ${y2} L${x2 + 4} ${y2 - 7}`} />
          </>
        ) : (
          <>
            <path d={`M${x1 + 7} ${y1 - 4} L${x1} ${y1} L${x1 + 7} ${y1 + 4}`} />
            <path d={`M${x2 - 7} ${y2 - 4} L${x2} ${y2} L${x2 - 7} ${y2 + 4}`} />
          </>
        )}
      </g>
      <text
        className="dp-fig"
        x={vertical ? mx + (side === 'right' ? 12 : -12) : mx}
        y={vertical ? my : my + (side === 'above' ? -10 : 20)}
        textAnchor={vertical ? (side === 'right' ? 'start' : 'end') : 'middle'}
        dominantBaseline={vertical ? 'middle' : 'auto'}
      >
        {label}
      </text>
    </g>
  )
}

export default function DimensionPlate({ dims, name }) {
  const root = useRef(null)
  const box = parseDims(dims)

  useEffect(() => {
    if (!root.current || !box || reduced()) return
    const ctx = gsap.context(() => {
      const lines = root.current.querySelectorAll('.dp-dim-line')
      const figs = root.current.querySelectorAll('.dp-fig, .dp-arrow')
      const shells = root.current.querySelectorAll('.dp-shell')

      /* dash is applied HERE, never in CSS — so a page with no JS, or a
         trigger that never fires, still shows finished lines */
      lines.forEach((l) => {
        const len = l.getTotalLength ? l.getTotalLength() : 200
        gsap.set(l, { strokeDasharray: len, strokeDashoffset: len })
      })
      gsap.set(figs, { opacity: 0 })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top 78%', once: true },
      })
      tl.from(shells, { opacity: 0, scale: 0.97, duration: 0.7, ease: 'power2.out', stagger: 0.1, transformOrigin: '50% 50%' })
        .to(lines, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut', stagger: 0.07 }, 0.25)
        .to(figs, { opacity: 1, duration: 0.4, ease: 'power1.out', stagger: 0.04 }, '-=0.25')
    }, root)
    return () => ctx.revert()
  }, [dims])

  /* bespoke pieces carry no envelope — say so rather than invent one */
  if (!box) {
    return (
      <div className="dp dp-none" ref={root}>
        <p className="dp-none-fig">To drawing</p>
        <p className="dp-none-say">
          A commissioned piece has no standard envelope. Dimensions are fixed
          against your drawing at sampling, and the approved sample becomes the
          measured reference for every unit after it.
        </p>
      </div>
    )
  }

  /* ── layout ──
     Both views share ONE scale, so the drawing is internally consistent and
     comparable between products rather than fitted to the frame each time. */
  const VW = 980
  const VH = 460
  const PAD_L = 30
  const PAD_R = 92    // room for the height / depth figures
  const PAD_T = 34
  const PAD_B = 58    // room for the width figure
  const GAP = 104

  const availW = VW - PAD_L - PAD_R - GAP
  const availH = VH - PAD_T - PAD_B
  const s = Math.min(availW / (box.w * 2), availH / Math.max(box.h, box.d))

  const ew = box.w * s
  const eh = box.h * s
  const pd = box.d * s

  const yMid = PAD_T + availH / 2
  const eX = PAD_L
  const eY = yMid - eh / 2
  const pX = PAD_L + ew + GAP
  const pY = yMid - pd / 2

  const mm = (v) => `${v}${NBSP}mm`
  const round = box.kind === 'round'

  /* a 100 mm bar, so the reader can trust the scale rather than take it */
  const barW = 100 * s

  return (
    <div className="dp" ref={root}>
      <svg
        className="dp-svg"
        viewBox={`0 0 ${VW} ${VH}`}
        role="img"
        aria-label={`Scale drawing of ${name}: ${round ? 'diameter' : 'width'} ${box.w} millimetres, depth ${box.d}, height ${box.h}.`}
      >
        {/* ── elevation ── */}
        <g className="dp-view">
          <text className="dp-cap" x={eX} y={PAD_T - 14}>Elevation</text>
          <rect className="dp-shell" x={eX} y={eY} width={ew} height={eh} rx="2" />
          {/* a centre line reads instantly as a drawing rather than a box */}
          <line className="dp-centre" x1={eX + ew / 2} y1={eY - 12} x2={eX + ew / 2} y2={eY + eh + 12} />

          <line className="dp-ext" x1={eX} y1={eY + eh} x2={eX} y2={eY + eh + 26} />
          <line className="dp-ext" x1={eX + ew} y1={eY + eh} x2={eX + ew} y2={eY + eh + 26} />
          <Dim x1={eX} y1={eY + eh + 20} x2={eX + ew} y2={eY + eh + 20}
            label={round ? `Ø ${mm(box.w)}` : mm(box.w)} />

          <line className="dp-ext" x1={eX + ew} y1={eY} x2={eX + ew + 26} y2={eY} />
          <line className="dp-ext" x1={eX + ew} y1={eY + eh} x2={eX + ew + 26} y2={eY + eh} />
          <Dim x1={eX + ew + 20} y1={eY} x2={eX + ew + 20} y2={eY + eh}
            label={mm(box.h)} side="right" />
        </g>

        {/* ── plan ── */}
        <g className="dp-view">
          <text className="dp-cap" x={pX} y={PAD_T - 14}>Plan</text>
          {round ? (
            <circle className="dp-shell" cx={pX + ew / 2} cy={yMid} r={ew / 2} />
          ) : (
            <rect className="dp-shell" x={pX} y={pY} width={ew} height={pd} rx="2" />
          )}
          <line className="dp-centre" x1={pX + ew / 2} y1={pY - 12} x2={pX + ew / 2} y2={pY + pd + 12} />
          <line className="dp-centre" x1={pX - 12} y1={yMid} x2={pX + ew + 12} y2={yMid} />

          <line className="dp-ext" x1={pX + ew} y1={pY} x2={pX + ew + 26} y2={pY} />
          <line className="dp-ext" x1={pX + ew} y1={pY + pd} x2={pX + ew + 26} y2={pY + pd} />
          <Dim x1={pX + ew + 20} y1={pY} x2={pX + ew + 20} y2={pY + pd}
            label={round ? `Ø ${mm(box.d)}` : mm(box.d)} side="right" />
        </g>

        {/* ── the scale bar ── */}
        <g className="dp-scale">
          <line className="dp-scale-bar" x1={PAD_L} y1={VH - 16} x2={PAD_L + barW} y2={VH - 16} />
          <line className="dp-scale-tick" x1={PAD_L} y1={VH - 21} x2={PAD_L} y2={VH - 11} />
          <line className="dp-scale-tick" x1={PAD_L + barW} y1={VH - 21} x2={PAD_L + barW} y2={VH - 11} />
          <text className="dp-scale-fig" x={PAD_L + barW + 10} y={VH - 12}>100 mm</text>
        </g>
      </svg>

      <p className="dp-note meta">
        Packing envelope · drawn to scale from the stated figures
      </p>
    </div>
  )
}
