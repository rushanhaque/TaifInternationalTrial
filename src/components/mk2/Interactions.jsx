import { useEffect } from 'react'
import { reduced } from '../../lib/gsap'

/* ── THE INTERACTION LAYER ──────────────────────────────────────────────────
   One place for the hover behaviour that should feel the same everywhere,
   rather than each card inventing its own.

   THE IDEA. This company sells surfaces that catch light — hammered brass,
   burnished copper, oiled grain. So the primary hover is a SPECULAR one: a
   highlight that tracks the pointer across a surface, the way a raised bowl
   throws light when you move past it. It is the product's own behaviour used
   as the interface's, which is why it reads as expensive rather than
   decorative.

   HOW IT IS BUILT. Delegation, not per-element listeners: two document-level
   handlers serve every surface on the page, however many there are. Each
   element's rect is cached on enter and reused for the whole hover, so moving
   the pointer never reads layout — no forced reflow per frame, which is the
   usual reason effects like this get ripped out again.

   The handlers write custom properties (--mx, --my, --mag-x, --mag-y) and CSS
   does the rest. Nothing here changes what is on the page, so if this file
   never runs the site is identical minus the polish. That is deliberate: a
   hover effect must never be load-bearing.

   MAGNETISM uses the `translate` property rather than `transform`, because
   Button already animates transform with GSAP for its press. Keeping them on
   separate properties means the two compose instead of fighting. */

const SURFACES = '.slab, .cat-card, .pl-card, .rail-card, .loc-card, .nf-card, .dp, .pat-swatch, .cx-scroll, .wo-attach'
const MAGNETS = '.btn'

/* how far a magnet reaches, and how far it travels — small on purpose. Past
   about 8px it stops reading as weight and starts reading as a bug. */
const MAG_RADIUS = 90
const MAG_PULL = 0.22
const MAG_MAX = 8

export default function Interactions() {
  useEffect(() => {
    if (reduced()) return undefined

    /* coarse pointers have no hover — the handlers would only ever fire once,
       on tap, and leave a highlight stuck under the finger */
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined

    let surface = null
    let sRect = null
    let magnet = null
    let mRect = null

    const enter = (e) => {
      const s = e.target.closest?.(SURFACES)
      if (s && s !== surface) {
        surface = s
        sRect = s.getBoundingClientRect()   // read once, reuse all hover
        s.classList.add('is-lit')
      }
      const m = e.target.closest?.(MAGNETS)
      if (m && m !== magnet) {
        magnet = m
        mRect = m.getBoundingClientRect()
      }
    }

    const clearSurface = () => {
      if (!surface) return
      surface.classList.remove('is-lit')
      surface.style.removeProperty('--mx')
      surface.style.removeProperty('--my')
      surface = null
      sRect = null
    }

    const clearMagnet = () => {
      if (!magnet) return
      magnet.style.removeProperty('--mag-x')
      magnet.style.removeProperty('--mag-y')
      magnet = null
      mRect = null
    }

    const move = (e) => {
      if (surface && sRect) {
        /* left the surface? drop it — pointerout is unreliable across the
           child elements a card is made of */
        if (e.clientX < sRect.left || e.clientX > sRect.right ||
            e.clientY < sRect.top || e.clientY > sRect.bottom) {
          clearSurface()
        } else {
          const x = ((e.clientX - sRect.left) / sRect.width) * 100
          const y = ((e.clientY - sRect.top) / sRect.height) * 100
          surface.style.setProperty('--mx', `${x.toFixed(1)}%`)
          surface.style.setProperty('--my', `${y.toFixed(1)}%`)
        }
      }

      if (magnet && mRect) {
        const cx = mRect.left + mRect.width / 2
        const cy = mRect.top + mRect.height / 2
        const dx = e.clientX - cx
        const dy = e.clientY - cy
        const dist = Math.hypot(dx, dy)
        if (dist > MAG_RADIUS + Math.max(mRect.width, mRect.height) / 2) {
          clearMagnet()
        } else {
          const px = Math.max(-MAG_MAX, Math.min(MAG_MAX, dx * MAG_PULL))
          const py = Math.max(-MAG_MAX, Math.min(MAG_MAX, dy * MAG_PULL))
          magnet.style.setProperty('--mag-x', `${px.toFixed(2)}px`)
          magnet.style.setProperty('--mag-y', `${py.toFixed(2)}px`)
        }
      }
    }

    /* a scroll moves the page under a stationary pointer, so every cached
       rect is stale — drop them rather than light the wrong spot */
    const drop = () => { clearSurface(); clearMagnet() }

    document.addEventListener('pointerover', enter, { passive: true })
    document.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('scroll', drop, { passive: true })
    window.addEventListener('resize', drop, { passive: true })
    document.addEventListener('pointerleave', drop, { passive: true })

    return () => {
      drop()
      document.removeEventListener('pointerover', enter)
      document.removeEventListener('pointermove', move)
      window.removeEventListener('scroll', drop)
      window.removeEventListener('resize', drop)
      document.removeEventListener('pointerleave', drop)
    }
  }, [])

  return null
}
