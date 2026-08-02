import { useEffect, useRef } from 'react'
import { gsap, reduced, coarse } from '../lib/gsap'
import { makeDraggable } from '../lib/useDrag'

/* E10 Fling Grid — the whole board drags a little in two axes (max 80px) and
   settles back to origin with a slow elastic return. Subtle by design. */
export default function FlingGrid({ children, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    if (reduced() || coarse()) return
    const el = ref.current
    const d = makeDraggable(el, {
      axis: 'both',
      resistance: 0.4,
      settle: { x: 0, y: 0 },
      getBounds: () => ({ minX: -80, maxX: 80, minY: -80, maxY: 80 }),
      onMove(pos) { gsap.set(el, { x: pos.x, y: pos.y }) },
    })
    const clickGuard = (e) => {
      if (d.getMoved() > 8) { e.preventDefault(); e.stopPropagation() }
    }
    el.addEventListener('click', clickGuard, true)
    return () => { d.kill(); el.removeEventListener('click', clickGuard, true) }
  }, [])

  return (
    <div ref={ref} className={`fling ${className}`} style={{ willChange: 'transform' }}>
      {children}
    </div>
  )
}
