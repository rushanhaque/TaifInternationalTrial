import { useEffect, useRef } from 'react'
import { gsap, reduced } from '../lib/gsap'
import { onPointer } from '../lib/usePointer'

/* E16 Surface Tension Pull — the boundary between two sections stretches
   toward the cursor like a liquid surface. Computes only while the pointer is
   within 140px of the line (§9.4); max two placements per page. */
const FLAT = 'M0,0 H1200 V4 H0 Z'

export default function Tension({ from = 'chrome' }) {
  const root = useRef(null)
  const path = useRef(null)

  useEffect(() => {
    if (reduced()) return
    let active = false
    let cur = 0
    let idle = true
    const io = new IntersectionObserver(
      ([e]) => { active = e.isIntersecting },
      { rootMargin: '220px 0px' }
    )
    io.observe(root.current)
    const un = onPointer((p) => {
      if (!active) return
      const r = root.current.getBoundingClientRect()
      const d = Math.abs(p.y - r.top)
      const target = d < 140 ? (1 - d / 140) * 26 : 0
      cur += (target - cur) * 0.14
      if (cur < 0.25 && target === 0) {
        if (!idle) { idle = true; path.current.setAttribute('d', FLAT) }
        return
      }
      idle = false
      const px = gsap.utils.clamp(60, 1140, ((p.x - r.left) / r.width) * 1200)
      const b = (4 + cur).toFixed(2)
      path.current.setAttribute(
        'd',
        `M0,0 H1200 V4 C${(px + 230).toFixed(0)},4 ${(px + 110).toFixed(0)},${b} ${px.toFixed(0)},${b} C${(px - 110).toFixed(0)},${b} ${(px - 230).toFixed(0)},4 0,4 Z`
      )
    })
    return () => { io.disconnect(); un() }
  }, [])

  return (
    <div className={`tension t-${from}`} ref={root} aria-hidden="true">
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none">
        <path ref={path} d={FLAT} />
      </svg>
    </div>
  )
}
