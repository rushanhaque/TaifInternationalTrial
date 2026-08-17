import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap, reduced } from '../../lib/gsap'
import '../../styles/mk2/slatshow.css'

/* ── SECTION 1 · THE LOUVRE ─────────────────────────────────────────────────
   A slideshow whose transition is a mechanism rather than a fade.

   The frame is cut into vertical SLATS. Each slat is a double-sided panel:
   the picture you are looking at is printed on its front, the next one on its
   back. Advancing flips every slat a half-turn about its own vertical axis,
   one after the next, so the change travels across the frame as a wave — the
   way a split-flap board turns over, or a louvre shutter closes and opens on
   a different view.

   WHY IT HOLDS TOGETHER. Each slat is a WINDOW onto a full-width copy of the
   photograph, offset by its own index, so the nine windows reconstruct one
   continuous picture rather than nine cropped thumbnails. That offset is pure
   CSS (`--i` / `--n`), so it survives any resize without measurement.

   The flip is `rotationY` only — no width, no opacity, no filter — so the
   whole wave is one composited transform per slat.

   FAIL-OPEN: the resting CSS state is slat 0 of the first image, unrotated
   and fully opaque, so with no JS the section is a still photograph rather
   than an empty box. `prefers-reduced-motion` swaps the picture outright and
   never rotates anything. */

const SLATS = 9

/* Unsplash, pending the client's own photography — swap these for local
   paths in public/img/ and nothing else here needs to change. */
const SLIDES = [
  { src: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1800&auto=format&fit=crop', caption: 'The metal floor' },
  { src: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1800&auto=format&fit=crop', caption: 'Seasoned timber' },
  { src: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1800&auto=format&fit=crop', caption: 'The finishing bench' },
  { src: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=1800&auto=format&fit=crop', caption: 'Brass, raised by hand' },
  { src: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1800&auto=format&fit=crop', caption: 'Grain and joint' },
  { src: 'https://images.unsplash.com/photo-1524758631624-e2822e304796?q=80&w=1800&auto=format&fit=crop', caption: 'The room it ends in' },
]

const DWELL = 5200

export default function SlatShow() {
  const root = useRef(null)
  const slatsRef = useRef([])
  const sweepRef = useRef(null)
  const busy = useRef(false)

  /* `face` is which side of every slat is currently pointing at the viewer.
     It alternates, so a slat never has to rotate back the way it came — each
     advance keeps turning in the same direction, like a real flap board. */
  const [front, setFront] = useState(0)      // slide index printed on the front
  const [back, setBack] = useState(1)        // slide index printed on the back
  const [showing, setShowing] = useState(0)  // 0 = front is facing, 1 = back
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  /* ── the flip ─────────────────────────────────────────────────────────── */
  const go = useCallback((next) => {
    if (busy.current || next === current) return
    const slats = slatsRef.current.filter(Boolean)
    if (!slats.length) return

    /* Reduced motion: no mechanism at all, just arrive at the picture. The
       stylesheet pins every slat at `transform: none` in this mode, so only
       the FRONT face can ever be seen — printing the new picture on both
       sides and leaving `showing` alone is what keeps the visible face from
       going stale. */
    if (reduced()) {
      setFront(next)
      setBack(next)
      setCurrent(next)
      return
    }

    busy.current = true

    /* print the incoming picture on whichever side is hidden right now */
    if (showing === 0) setBack(next); else setFront(next)

    const tl = gsap.timeline({
      onComplete() {
        setShowing((s) => (s === 0 ? 1 : 0))
        setCurrent(next)
        busy.current = false
      },
    })

    tl.to(slats, {
      rotationY: '+=180',
      duration: 1.15,
      ease: 'viscous',
      stagger: { each: 0.055, from: 'start' },
    }, 0)

    /* a burnisher's light travelling with the wave — it exists to tie the
       nine independent flips into one gesture, so it is timed to the whole
       stagger rather than to any single slat */
    if (sweepRef.current) {
      tl.fromTo(sweepRef.current,
        { xPercent: -130, opacity: 0 },
        { xPercent: 130, opacity: 1, duration: 1.5, ease: 'power1.inOut' }, 0)
        .to(sweepRef.current, { opacity: 0, duration: 0.35, ease: 'power2.out' }, 1.2)
    }
  }, [current, showing])

  const next = useCallback(() => go((current + 1) % SLIDES.length), [current, go])
  const prev = useCallback(() => go((current - 1 + SLIDES.length) % SLIDES.length), [current, go])

  /* A face is only hidden until the slat passes 90°, which is roughly 300ms
     after an advance begins — not long enough to fetch a photograph. Pulling
     the whole set up front means a slat never turns to reveal a blank. */
  useEffect(() => {
    SLIDES.forEach((s) => { new Image().src = s.src })
  }, [])

  /* ── the dwell ────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (paused) return undefined
    const t = setTimeout(next, DWELL)
    return () => clearTimeout(t)
  }, [next, paused])

  /* left/right arrows once the section has focus */
  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next() }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
  }

  return (
    <section
      className="ss-section"
      id="section-1"
      ref={root}
      aria-label="Workshop photographs"
    >
      <div
          className="ss-frame"
          style={{ '--n': SLATS }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onKeyDown={onKey}
          tabIndex={0}
          role="group"
          aria-roledescription="slideshow"
          aria-label="Workshop photographs"
        >
          <div className="ss-stage" aria-hidden="true">
            {Array.from({ length: SLATS }, (_, i) => (
              <div
                className="ss-slat"
                key={i}
                style={{ '--i': i }}
                ref={(el) => { slatsRef.current[i] = el }}
              >
                <div className="ss-face ss-front">
                  <img className="ss-img" src={SLIDES[front].src} alt="" draggable="false" />
                </div>
                <div className="ss-face ss-back">
                  <img className="ss-img" src={SLIDES[back].src} alt="" draggable="false" />
                </div>
              </div>
            ))}
            <span className="ss-sweep" ref={sweepRef} />
          </div>

          {/* live region rather than announcing every slat */}
          <p className="sr-only" role="status">
            {`${current + 1} of ${SLIDES.length} — ${SLIDES[current].caption}`}
          </p>
      </div>

      <div className="ss-controls">
          <button type="button" className="ss-arrow" onClick={prev} aria-label="Previous photograph">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 2 4 8l6 6" />
            </svg>
          </button>

          <div className="ss-dots">
            {SLIDES.map((s, i) => (
              <button
                key={s.src}
                type="button"
                className={`ss-dot ${i === current ? 'is-on' : ''}`}
                onClick={() => go(i)}
                aria-label={s.caption}
                aria-current={i === current ? 'true' : undefined}
              />
            ))}
          </div>

          <button type="button" className="ss-arrow" onClick={next} aria-label="Next photograph">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2l6 6-6 6" />
            </svg>
          </button>
      </div>
    </section>
  )
}
