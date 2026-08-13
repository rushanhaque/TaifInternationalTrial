import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, reduced, coarse } from '../lib/gsap'
import { makeDraggable } from '../lib/useDrag'
import { setMeniscusBoost } from './Slab'

/* E9 Drag Rail — grab-and-fling with real momentum, rubber-band ends and a
   velocity skew; also advances on scroll. Keyboard + visible buttons per §10.
   Touch and reduced-motion fall back to a native scroll-snap rail. */
export default function DragRail({ children, label = 'Gallery', hint = 'Drag · fling', className = '', showNav = true }) {
  const isNative = reduced() || coarse()
  const wrap = useRef(null)
  const track = useRef(null)
  const drag = useRef(null)

  useEffect(() => {
    if (isNative) return
    const trackEl = track.current
    const skewTo = gsap.quickTo(trackEl, 'skewX', { duration: 0.35, ease: 'power2.out' })
    let lastX = 0
    let lastT = performance.now()

    const getBounds = () => {
      const wrapEl = wrap.current
      if (!wrapEl || !trackEl) return { minX: 0, maxX: 0, minY: 0, maxY: 0 }
      const style = window.getComputedStyle(wrapEl)
      const padL = parseFloat(style.paddingLeft) || 0
      const padR = parseFloat(style.paddingRight) || 0
      const contentWidth = wrapEl.clientWidth - padL - padR
      return {
        minX: Math.min(0, contentWidth - trackEl.scrollWidth),
        maxX: 0, minY: 0, maxY: 0,
      }
    }
    const d = makeDraggable(trackEl, {
      axis: 'x',
      getBounds,
      onStart() { setMeniscusBoost(1.8) },
      onMove(pos) {
        const now = performance.now()
        const dt = Math.max(now - lastT, 8)
        const v = ((pos.x - lastX) / dt) * 1000
        lastX = pos.x; lastT = now
        skewTo(gsap.utils.clamp(-8, 8, v * 0.004))
        gsap.set(trackEl, { x: pos.x })
      },
      onEnd() { skewTo(0); setMeniscusBoost(1) },
    })
    drag.current = d

    // scroll linkage — smooth scroll-triggered horizontal movement
    const st = ScrollTrigger.create({
      trigger: wrap.current,
      start: 'top 90%',
      end: 'bottom 10%',
      onUpdate(self) {
        if (d.isDragging()) return
        const b = getBounds()
        if (b.minX >= 0) return
        const targetX = -self.progress * Math.abs(b.minX)
        d.setPos(gsap.utils.clamp(b.minX, 0, targetX))
      },
    })

    // suppress child link clicks after a real drag
    const clickGuard = (e) => {
      if (d.getMoved() > 8) { e.preventDefault(); e.stopPropagation() }
    }
    trackEl.addEventListener('click', clickGuard, true)

    return () => {
      st.kill()
      d.kill()
      trackEl.removeEventListener('click', clickGuard, true)
    }
  }, [isNative])

  function nudge(dir) {
    if (isNative) {
      wrap.current.scrollBy({ left: dir * 320, behavior: 'smooth' })
      return
    }
    const d = drag.current
    const b = { minX: Math.min(0, wrap.current.clientWidth - track.current.scrollWidth), maxX: 0 }
    d.tweenTo(gsap.utils.clamp(b.minX, 0, d.pos.x - dir * 340), {
      onUpdate: () => gsap.set(track.current, { x: d.pos.x }),
    })
  }

  function onKey(e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); nudge(1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); nudge(-1) }
  }

  return (
    <div
      className={`rail ${isNative ? 'native' : ''} ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="rail-head">
        <span className="rail-hint meta">{hint}</span>
        {showNav && (
          <div className="rail-nav">
            <button className="rail-btn" aria-label="Previous" onClick={() => nudge(-1)}>←</button>
            <button className="rail-btn" aria-label="Next" onClick={() => nudge(1)}>→</button>
          </div>
        )}
      </div>
      <div className="rail-wrap" ref={wrap} tabIndex={0} onKeyDown={onKey}>
        <div className="rail-track" ref={track}>{children}</div>
      </div>
    </div>
  )
}
