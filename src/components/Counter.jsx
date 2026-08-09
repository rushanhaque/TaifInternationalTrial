import { useEffect, useMemo, useRef } from 'react'
import { gsap, reduced } from '../lib/gsap'

/* E13 Fluid Fill Numerals — the figure is present from the start, outlined;
   a liquid level with a wobbling surface rises inside the glyphs. No counting. */
let uid = 0

function waveD(p, t) {
  const y = 1 - p
  const a = 0.06 * (1 - p) + 0.006
  let d = `M0,1 L0,${gsap.utils.clamp(0, 1, y + Math.sin(t) * a).toFixed(4)}`
  for (let i = 1; i <= 4; i++) {
    const x = i / 4
    const cx = (i - 0.5) / 4
    const yy = gsap.utils.clamp(0, 1, y + Math.sin(t + x * 6.5) * a)
    const cy = gsap.utils.clamp(0, 1, y + Math.sin(t + cx * 6.5) * a * 1.5)
    d += ` Q${cx.toFixed(4)},${cy.toFixed(4)} ${x.toFixed(4)},${yy.toFixed(4)}`
  }
  return d + ' L1,1 Z'
}

export default function Counter({ value, unit, label, smaller = false }) {
  const id = useMemo(() => `fn-${++uid}`, [])
  const still = reduced()
  const fill = useRef(null)
  const path = useRef(null)
  const root = useRef(null)

  useEffect(() => {
    if (still) return
    const prox = { p: 0 }
    const tw = gsap.to(prox, {
      p: 1, duration: 1.4, ease: 'viscous',
      scrollTrigger: { trigger: root.current, start: 'top 90%', once: true },
      onUpdate() { if (path.current) path.current.setAttribute('d', waveD(prox.p, performance.now() / 260)) },
      onComplete() { if (fill.current) { fill.current.style.clipPath = 'none'; fill.current.style.webkitClipPath = 'none' } },
    })
    return () => { tw.scrollTrigger?.kill(); tw.kill() }
  }, [still])

  return (
    <div className="figure" ref={root}>
      <span className={`fluid-num ${smaller ? 'smaller' : ''}`} role="img" aria-label={`${value}${unit ? ' ' + unit : ''}`}>
        {!still && (
          <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
            <clipPath id={id} clipPathUnits="objectBoundingBox"><path ref={path} d={waveD(0, 0)} /></clipPath>
          </svg>
        )}
        <span className="fn-stroke" aria-hidden="true">{value}</span>
        <span
          ref={fill}
          className="fn-fill"
          aria-hidden="true"
          style={still ? undefined : { clipPath: `url(#${id})`, WebkitClipPath: `url(#${id})` }}
        >
          {value}
        </span>
      </span>
      {unit && <span className="fig-unit meta" aria-hidden="true">{unit}</span>}
      {label && <span className="fig-label">{label}</span>}
    </div>
  )
}
