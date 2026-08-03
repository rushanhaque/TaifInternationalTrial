import { useEffect, useRef } from 'react'
import { gsap, reduced, coarse } from '../../lib/gsap'
import { onPointer, pointer, startPointer } from '../../lib/usePointer'

/* ═══════════════════════════════════════════════════════════════════════════
   mk2 · Micro — three small parts that give the page a hand.

   (A) Magnetic    a control leans toward the cursor before it is touched
   (B) LightLeak   the seam between a light and a dark section blooms

   All three ride the site's single shared pointer pipeline (§9.6 —
   src/lib/usePointer.js). Not one of them adds a mousemove listener; the
   whole file adds exactly two document listeners and, across every
   <Magnetic> on the page, one scroll listener.
   ═══════════════════════════════════════════════════════════════════════════ */


/* ── shared geometry stamp ──────────────────────────────────────────────────
   A magnet only needs to re-read its rest position when the page moves under
   it. One scroll/resize listener serves every instance: each compares a
   shared counter and re-measures on change, instead of hammering
   getBoundingClientRect() 60 times a second, per magnet, forever. */
let geoStamp = 0
let geoUsers = 0
const bumpGeo = () => { geoStamp += 1 }

function holdGeo() {
  if (geoUsers++ === 0) {
    window.addEventListener('scroll', bumpGeo, { passive: true })
    window.addEventListener('resize', bumpGeo, { passive: true })
  }
}
function dropGeo() {
  if (--geoUsers <= 0) {
    geoUsers = 0
    window.removeEventListener('scroll', bumpGeo)
    window.removeEventListener('resize', bumpGeo)
  }
}

const clamp = (v, l) => (v > l ? l : v < -l ? -l : v)


/* ═══ (A) Magnetic ═════════════════════════════════════════════════════════
   Wraps ANY single child. Inside a soft radius the child leans toward the
   cursor; on exit it springs home on the surge curve.

   The wrapper is deliberately inert: no listeners, no padding, no pointer
   rules, no positioning. Everything the child does — click, focus, Enter,
   its own hover states — passes straight through, because nothing here sits
   between the child and the pointer. Position is read from the shared
   pipeline instead of from mouse events on the wrapper, which also means the
   pull begins *before* the cursor arrives, which is the whole point.

   props
     strength  0–1 · how far it travels relative to cursor offset (0.36)
     radius    px  · how far outside its own box the field reaches (96)
     tilt      deg · optional lean; only flatters wide children (0)
     className     · pass `mag-block` for a full-width child, `mag-halo`
                     for the brass bloom variant                            */
export default function Magnetic({
  strength = 0.36,
  radius = 96,
  tilt = 0,
  className = '',
  children,
}) {
  const host = useRef(null)

  useEffect(() => {
    /* Magnetism is a fine-pointer luxury. On touch there is no hover to lean
       into, and a reduced-motion visitor gets the control exactly where it
       renders — which is where they expect to press it. */
    if (reduced() || coarse()) return
    const el = host.current
    if (!el) return

    startPointer()   // idempotent; guarantees the shared ticker is running
    holdGeo()

    /* One quickTo pair does both jobs. Retargeted every frame it reads as a
       smooth follow; called once with 0 on exit, the surge curve's overshoot
       IS the spring back. Two competing tweens would fight over `x`. */
    const qx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'surge' })
    const qy = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'surge' })
    const qr = tilt ? gsap.quickTo(el, 'rotate', { duration: 0.6, ease: 'surge' }) : null

    let stamp = geoStamp - 1
    let cx = 0, cy = 0, rx = 1, ry = 1
    let pulled = false
    const cap = radius * 0.6

    /* The shared pointer parks at viewport centre until the mouse moves; a
       magnet sitting under that point would twitch on load. Wait for proof
       of life. */
    const seedX = pointer.x
    const seedY = pointer.y
    let live = false

    function measure() {
      const r = el.getBoundingClientRect()
      /* The rect already includes whatever translate is rendered right now —
         back it out so the field is always anchored to the rest position and
         cannot chase itself. */
      cx = r.left + r.width / 2 - (parseFloat(gsap.getProperty(el, 'x')) || 0)
      cy = r.top + r.height / 2 - (parseFloat(gsap.getProperty(el, 'y')) || 0)
      rx = r.width / 2 + radius
      ry = r.height / 2 + radius
    }

    function state(on) {
      if (on === pulled) return
      pulled = on
      el.setAttribute('data-mag', on ? 'on' : 'off')   // styling hook, not per-frame
    }

    const un = onPointer((p) => {
      if (!live) {
        if (p.x === seedX && p.y === seedY) return
        live = true
      }
      if (stamp !== geoStamp) { measure(); stamp = geoStamp }

      const dx = p.x - cx
      const dy = p.y - cy
      const d = Math.hypot(dx / rx, dy / ry)   // 1 = the rim of the field

      if (d >= 1) {
        if (pulled) { state(false); qx(0); qy(0); if (qr) qr(0) }
        return
      }
      state(true)
      /* Falloff hits zero exactly at the rim, so entering the field is a
         swell rather than a snap; the cap keeps large children civil. */
      const w = strength * (1 - d * d)
      const ox = clamp(dx * w, cap)
      const oy = clamp(dy * w, cap)
      qx(ox)
      qy(oy)
      if (qr) qr(ox * (tilt / 24))
    })

    return () => {
      un()
      dropGeo()
      gsap.killTweensOf(el)
      gsap.set(el, { clearProps: 'transform' })
      el.removeAttribute('data-mag')
    }
  }, [strength, radius, tilt])

  /* Always renders the child, in flow, with or without JS. */
  return (
    <span className={`mag ${className}`.trim()} ref={host}>
      {children}
    </span>
  )
}


/* ═══ (C) LightLeak ════════════════════════════════════════════════════════
   A boundary bloom. Drop it at the edge where a light section meets the
   espresso one and the join stops reading as a cut — light spills across it
   the way it does over a polished lip.

   THE PARENT MUST BE position: relative. The band is absolutely positioned
   to that edge, sits behind content, and takes no pointer events.

   position  'bottom' (default) | 'top'  — which edge of the parent it hugs
   tone      'brass' (default) | 'copper' | 'oak' — additive bloom, for the
             DARK side of the seam
             'shade' — the same falloff inverted into a warm ambient
             shadow, for the LIGHT side of the seam                          */
export function LightLeak({ position = 'bottom', tone = 'brass' }) {
  return <span className={`leak leak-${position} leak-${tone}`} aria-hidden="true" />
}
