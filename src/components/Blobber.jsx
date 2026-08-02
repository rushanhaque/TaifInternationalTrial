import { useEffect, useRef } from 'react'
import { gsap, reduced, coarse } from '../lib/gsap'
import { onPointer, pointer } from '../lib/usePointer'

/* E3 — minimal arrow cursor. A small cursor-arrow silhouette in walnut with
   a thin white outline, following the pointer with soft easing. Over an
   interactive target it simply grows a little; there is no second overlay
   layer. (An inverting `mix-blend-mode: difference` pill used to sit here —
   over a white section it composited to solid black, and it could be left
   stranded on screen if you scrolled away mid-hover.)
   Disabled for coarse pointers and reduced motion. */

const ARROW = 'M0,0 L0,18 L4,14 L6.5,20 L9.5,18.7 L7,13 L12,13 Z'

export default function Blobber() {
  const wrap = useRef(null)

  useEffect(() => {
    if (reduced() || coarse()) return
    const lead = { x: pointer.x, y: pointer.y }
    let hot = null

    const un = onPointer((p) => {
      lead.x += (p.x - lead.x) * 0.6
      lead.y += (p.y - lead.y) * 0.6
      wrap.current.style.transform =
        `translate(${lead.x.toFixed(1)}px, ${lead.y.toFixed(1)}px)`
    })

    function over(e) {
      const t = e.target.closest('a, button, [data-blob]')
      if (t === hot) return
      hot = t
      gsap.to(wrap.current, {
        scale: t ? 1.55 : 1,
        duration: 0.35, ease: 'surge', transformOrigin: '0% 0%',
      })
    }
    function down() {
      gsap.to(wrap.current, { scale: hot ? 1.3 : 0.82, duration: 0.12, transformOrigin: '0% 0%' })
    }
    function upH() {
      gsap.to(wrap.current, { scale: hot ? 1.55 : 1, duration: 0.45, ease: 'surge', transformOrigin: '0% 0%' })
    }
    document.addEventListener('mouseover', over)
    document.addEventListener('mousedown', down)
    document.addEventListener('mouseup', upH)
    return () => {
      un()
      document.removeEventListener('mouseover', over)
      document.removeEventListener('mousedown', down)
      document.removeEventListener('mouseup', upH)
    }
  }, [])

  if (reduced() || coarse()) return null
  return (
    <div className="blobber-arrow" ref={wrap} aria-hidden="true">
      <svg width="20" height="26" viewBox="-1.5 -1.5 15 24">
        <path d={ARROW} fill="#241c14" stroke="#fdfbf6" strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  )
}
