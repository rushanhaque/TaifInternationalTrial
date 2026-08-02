import { useEffect, useRef } from 'react'
import { gsap, reduced } from '../lib/gsap'

/* E12 Wave Ribbon — terms ride two undulating SVG paths at constant speed in
   opposing directions; the paths themselves breathe. Not velocity-coupled.
   The bottom path is the EXACT vertical mirror of the top (about y=140) and
   both breathe with the same duration & phase — equal arc length at every
   instant, so the two rows stay in perfect opposite sync. */
const P1A = 'M0,90 C260,30 520,150 800,90 C1080,30 1340,140 1600,80'
const P1B = 'M0,80 C260,140 520,20 800,90 C1080,150 1340,40 1600,95'
const P2A = 'M0,190 C260,250 520,130 800,190 C1080,250 1340,140 1600,200'
const P2B = 'M0,200 C260,140 520,260 800,190 C1080,130 1340,240 1600,185'

export default function Ribbon({ terms, className = '' }) {
  const p1 = useRef(null)
  const p2 = useRef(null)
  const t1 = useRef(null)
  const t2 = useRef(null)
  const tp1 = useRef(null)
  const tp2 = useRef(null)

  const unit = terms.join('   ·   ') + '   ·   '
  const text = unit.repeat(5)

  useEffect(() => {
    if (reduced()) return
    let tweens = []
    let cancelled = false
    document.fonts.ready.then(() => {
      if (cancelled || !t1.current) return
      let len
      try { len = t1.current.getSubStringLength(0, unit.length) } catch { len = 2400 }
      const o = { v: 0 }
      tweens.push(
        gsap.to(o, {
          v: -len, duration: len / 85, ease: 'none', repeat: -1,
          onUpdate() {
            tp1.current.setAttribute('startOffset', o.v)
            tp2.current.setAttribute('startOffset', -len - o.v)
          },
        }),
        /* same duration + phase: the mirrored paths keep equal arc length at
           every instant, so the rows never drift out of opposite sync */
        gsap.to(p1.current, { attr: { d: P1B }, duration: 5.5, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
        gsap.to(p2.current, { attr: { d: P2B }, duration: 5.5, yoyo: true, repeat: -1, ease: 'sine.inOut' })
      )
    })
    return () => { cancelled = true; tweens.forEach((t) => t.kill()) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`ribbon ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1600 280" preserveAspectRatio="xMidYMid meet">
        <defs>
          <path id="rib-1" d={P1A} ref={p1} />
          <path id="rib-2" d={P2A} ref={p2} />
        </defs>
        <text className="ribbon-txt strong" ref={t1}>
          <textPath href="#rib-1" ref={tp1} startOffset="0">{text}</textPath>
        </text>
        <text className="ribbon-txt" ref={t2}>
          <textPath href="#rib-2" ref={tp2} startOffset="0">{text}</textPath>
        </text>
      </svg>
    </div>
  )
}
