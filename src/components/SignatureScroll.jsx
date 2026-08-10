import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * SignatureScroll — timer-driven right→left clipPath wipe reveal
 * with a lit brass divider line, ported from Velora-main.
 * Images auto-advance every 2 seconds.
 */

const SIGNATURE_SLIDES = [
  { src: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop', alt: 'Moradabad Metal Atelier & Showroom' },
  { src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop', alt: 'Saharanpur Woodworking Craft Floor' },
  { src: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=1600&auto=format&fit=crop', alt: 'Luxury Brass & Copper Lighting Gallery' },
  { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop', alt: 'Hand-Finished Architectural Furniture Floor' },
  { src: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1600&auto=format&fit=crop', alt: 'International Trade Exhibition & Showroom' },
]

const WIPE_DURATION = 800    // ms for the clipPath wipe animation
const HOLD_DURATION = 2000   // ms to hold each image before wiping to next

export default function SignatureScroll({ slides = SIGNATURE_SLIDES }) {
  /* the slide list is admin-editable, so it can arrive empty or malformed —
     an empty array would make the advance modulo divide by zero */
  const safe = Array.isArray(slides) ? slides.filter((s) => s && s.src) : []
  const count = safe.length
  const slideRefs = useRef([])
  const dividerRefs = useRef([])
  const rafRef = useRef(null)
  const [, forceRender] = useState(0)

  // Track which slide is currently fully revealed (0-based)
  const revealedRef = useRef(0)
  // When a wipe is in progress, this stores the animation start time
  const wipeStartRef = useRef(null)
  // The slide index currently being wiped in
  const wipingToRef = useRef(null)

  const paint = useCallback((edge, slideIdx) => {
    // Set clipPath for the target slide
    const clip = slideRefs.current[slideIdx]
    if (clip) {
      const val = `inset(0 0 0 ${edge}%)`
      clip.style.clipPath = val
      clip.style.webkitClipPath = val
    }
    // Position the brass divider at the wipe edge
    const div = dividerRefs.current[slideIdx]
    if (div) {
      div.style.left = `${edge}%`
      div.style.opacity = edge > 0.5 && edge < 99.5 ? '1' : '0'
    }
  }, [])

  useEffect(() => {
    // Initialize: slide 0 fully visible, rest hidden
    for (let i = 0; i < count; i++) {
      paint(i === 0 ? 0 : 100, i)
    }

    let holdTimer = null

    const startWipe = (toIndex) => {
      wipingToRef.current = toIndex
      wipeStartRef.current = performance.now()

      const animate = (now) => {
        const elapsed = now - wipeStartRef.current
        const progress = Math.min(1, elapsed / WIPE_DURATION)
        // Ease: cubic out
        const eased = 1 - Math.pow(1 - progress, 3)
        // Edge goes from 100% (hidden) to 0% (fully revealed)
        const edge = (1 - eased) * 100

        paint(edge, toIndex)

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate)
        } else {
          // Wipe complete
          paint(0, toIndex)
          revealedRef.current = toIndex
          wipingToRef.current = null
          wipeStartRef.current = null
          // Schedule next wipe
          holdTimer = setTimeout(scheduleNext, HOLD_DURATION)
        }
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    const scheduleNext = () => {
      const current = revealedRef.current
      const next = (current + 1) % count

      // If looping back to 0, reset all slides to hidden then show slide 0
      if (next === 0) {
        for (let i = 1; i < count; i++) {
          paint(100, i)
        }
        revealedRef.current = 0
        // Schedule next wipe after hold
        holdTimer = setTimeout(scheduleNext, HOLD_DURATION)
      } else {
        startWipe(next)
      }
    }

    // Start the cycle after initial hold
    holdTimer = setTimeout(scheduleNext, HOLD_DURATION)

    return () => {
      if (holdTimer) clearTimeout(holdTimer)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [count, paint])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(597px, 90.7vh, 975px)',
        marginTop: '1.5rem',
        borderRadius: 'clamp(16px, 2vw, 28px)',
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.22)',
        background: '#120C0E',
        isolation: 'isolate'
      }}
    >
      {safe.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: i + 1
          }}
        >
          {/* ClipPath wipe layer */}
          <div
            ref={(el) => { slideRefs.current[i] = el }}
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: i === 0 ? 'inset(0 0 0 0)' : 'inset(0 0 0 100%)',
              WebkitClipPath: i === 0 ? 'inset(0 0 0 0)' : 'inset(0 0 0 100%)'
            }}
          >
            <img
              src={s.src}
              alt={s.alt || `Piece ${i + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block'
              }}
            />
          </div>

          {/* Lit brass divider line — slides along the wipe edge */}
          <div
            ref={(el) => { dividerRefs.current[i] = el }}
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '2px',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(180deg, transparent, #C8A765, transparent)',
              left: i === 0 ? '0%' : '100%',
              opacity: 0,
              boxShadow: '0 0 20px rgba(212,185,134,0.85), 0 0 46px rgba(200,167,101,0.45)',
              pointerEvents: 'none',
              zIndex: 10
            }}
          />
        </div>
      ))}
    </div>
  )
}
