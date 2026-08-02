import { useEffect, useRef } from 'react'
import { reduced, coarse } from '../lib/gsap'
import { onPointer } from '../lib/usePointer'

/* H8 Pointer Wake — dark sections only: fast pointer movement leaves a faint
   iridescent wake. Reuses the shared pointer pipeline; expendable (§9.12). */
export default function Deep({ className = '', children, wake = true }) {
  const root = useRef(null)

  useEffect(() => {
    if (!wake || reduced() || coarse()) return
    const spans = Array.from(root.current.querySelectorAll('.wake'))
    let i = 0
    let last = 0
    const un = onPointer((p) => {
      const now = performance.now()
      if (now - last < 95) return
      last = now
      if (!root.current.matches(':hover')) return
      const r = root.current.getBoundingClientRect()
      const s = spans[i++ % spans.length]
      s.style.left = `${p.x - r.left}px`
      s.style.top = `${p.y - r.top}px`
      s.animate(
        [
          { opacity: 0.5, transform: 'translate(-50%,-50%) scale(0.7)' },
          { opacity: 0, transform: 'translate(-50%,-50%) scale(1.6)' },
        ],
        { duration: 620, easing: 'ease-out' }
      )
    })
    return () => un()
  }, [wake])

  return (
    <section className={`section deep ${className}`} ref={root}>
      {children}
      <div aria-hidden="true">
        {Array.from({ length: 6 }, (_, k) => <span key={k} className="wake" />)}
      </div>
    </section>
  )
}
