import { useEffect, useRef } from 'react'
import { gsap, reduced } from '../lib/gsap'

/* H9 Strike Spark — every press strikes the surface: six brass filings burst
   from the point of contact and gutter out, like a chisel meeting metal.
   Pooled nodes (no churn), transforms + opacity only, capped concurrency.
   Runs for touch too — mobile gets the same feedback. */
const POOL = 18
export default function ClickSpark() {
  const host = useRef(null)

  useEffect(() => {
    if (reduced()) return
    const nodes = []
    for (let i = 0; i < POOL; i++) {
      const s = document.createElement('span')
      s.className = 'strike-spark'
      host.current.appendChild(s)
      nodes.push(s)
    }
    let next = 0

    const strike = (e) => {
      const x = e.clientX
      const y = e.clientY
      if (x == null || (x === 0 && y === 0)) return
      for (let i = 0; i < 6; i++) {
        const s = nodes[next]
        next = (next + 1) % POOL
        const a = (Math.PI * 2 * i) / 6 + Math.random() * 0.9
        const d = 16 + Math.random() * 26
        gsap.killTweensOf(s)
        gsap.fromTo(s,
          { x, y, scale: 0.5 + Math.random() * 0.7, opacity: 1 },
          {
            x: x + Math.cos(a) * d,
            y: y + Math.sin(a) * d - 10,
            scale: 0, opacity: 0,
            duration: 0.5 + Math.random() * 0.25,
            ease: 'power2.out',
          })
      }
    }
    window.addEventListener('pointerdown', strike, { passive: true })
    return () => {
      window.removeEventListener('pointerdown', strike)
      nodes.forEach((n) => n.remove())
    }
  }, [])

  if (reduced()) return null
  return <div className="strike-host" ref={host} aria-hidden="true" />
}
