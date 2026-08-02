import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, reduced } from '../lib/gsap'
import { getVelocity } from '../lib/useLenis'

/* E4 — full-width top-edge bar. Fill = page depth (shown as a bare decimal,
   matching the section device); height thickens with scroll velocity. */
export default function Viscosity() {
  const bar = useRef(null)
  const fill = useRef(null)
  const num = useRef(null)

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        gsap.set(fill.current, { scaleX: self.progress })
        num.current.textContent = self.progress.toFixed(2)
      },
    })
    let tick = null
    if (!reduced()) {
      const hTo = gsap.quickTo(bar.current, 'height', { duration: 0.25 })
      tick = () => hTo(gsap.utils.clamp(2, 6, 2 + Math.abs(getVelocity()) * 0.05))
      gsap.ticker.add(tick)
    }
    return () => {
      st.kill()
      if (tick) gsap.ticker.remove(tick)
    }
  }, [])

  return (
    <div className="visco" aria-hidden="true">
      <div className="visco-bar" ref={bar}>
        <div className="visco-fill" ref={fill} />
      </div>
      <span className="visco-num" ref={num}>0.00</span>
    </div>
  )
}
