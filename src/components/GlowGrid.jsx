import { useRef } from 'react'
import { gsap } from '../lib/gsap'

/* H5 Column Highlight — hovering any [data-col] child tints the grid columns
   it occupies, tying the liquid surface back to the Swiss grid. */
export default function GlowGrid({ children, className = '' }) {
  const glow = useRef(null)
  const cur = useRef(null)

  function over(e) {
    const t = e.target.closest('[data-col]')
    if (!t || t === cur.current) return
    cur.current = t
    gsap.to(glow.current, {
      x: t.offsetLeft, width: t.offsetWidth,
      opacity: 1, duration: 0.4, ease: 'fluid',
    })
  }
  function leave() {
    cur.current = null
    gsap.to(glow.current, { opacity: 0, duration: 0.35 })
  }

  return (
    <div className={`glow-grid ${className}`} onPointerOver={over} onPointerLeave={leave}>
      <span className="col-glow" ref={glow} aria-hidden="true" />
      {children}
    </div>
  )
}
