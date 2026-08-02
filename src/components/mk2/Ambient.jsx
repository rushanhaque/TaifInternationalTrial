import { useEffect, useRef } from 'react'
import { gsap, reduced, coarse } from '../../lib/gsap'

/* ── the living ground ──────────────────────────────────────────────────────
   The page is lit, not painted. Three layers sit behind everything:

   1. THE LAMP    A large warm pool that follows the pointer at a lag, as if
                  a work lamp were being carried across the bench. It reveals
                  the paper texture where it falls and lets it fade elsewhere,
                  so the ground is never uniformly flat.
   2. THE DRIFT   Two slow brass/copper blooms moving on long, out-of-phase
                  cycles. They never resolve into a recognisable shape, which
                  is what stops the eye from locking onto them.
   3. THE FORGE   A deep warm glow anchored low, so the bottom of the page
                  always feels a little hotter than the top — the direction
                  heat actually travels in a workshop.

   COST: one fixed layer, no filters, no blend modes across the viewport, two
   quickTo writes per pointer move and one very slow infinite tween. The
   drift and forge are CSS animations on transform/opacity only.

   Disabled entirely for reduced motion and coarse pointers, where it would
   be either unwanted or unusable — the paper texture alone carries those. */

export default function Ambient() {
  const lampRef = useRef(null)

  useEffect(() => {
    if (reduced() || coarse()) return undefined
    const lamp = lampRef.current
    if (!lamp) return undefined

    /* quickTo so a pointer move never allocates a tween */
    const xTo = gsap.quickTo(lamp, 'x', { duration: 1.1, ease: 'power3' })
    const yTo = gsap.quickTo(lamp, 'y', { duration: 1.1, ease: 'power3' })

    let shown = false
    const onMove = (e) => {
      xTo(e.clientX)
      yTo(e.clientY)
      if (!shown) {
        shown = true
        gsap.to(lamp, { opacity: 1, duration: 1.2, ease: 'fluid' })
      }
    }
    const onLeave = () => {
      shown = false
      gsap.to(lamp, { opacity: 0, duration: 1.4, ease: 'fluid' })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      gsap.killTweensOf(lamp)
    }
  }, [])

  return (
    <div className="amb" aria-hidden="true">
      <span className="amb-forge" />
      <span className="amb-drift amb-drift-a" />
      <span className="amb-drift amb-drift-b" />
      <span className="amb-lamp" ref={lampRef} />
    </div>
  )
}
