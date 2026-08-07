import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reduced, coarse } from '../../lib/gsap'
import { FINISHES, BRAND } from '../../data/site'
import Button from '../Button'
import { CharCascade, SmoothReveal, EditorialReveal } from '../Reveal'
/* ── Sampler ────────────────────────────────────────────────────────────────
   One object, five surfaces. The vessel is a clipped stack of CSS material
   recipes; switching finish cross-fades the stack (CSS, so it can never fail
   into a hidden state) while GSAP re-rakes a specular sweep across the form.

   Division of labour is deliberate:
     · CSS transitions own every state that carries CONTENT (surface layers,
       text panels, swatch ring). React writes the class, so the resting state
       is always correct even if GSAP never loads.
     · GSAP owns the light — the sweep, the settle, the entrance. Pure
       ornament, and re-triggerable, which a CSS transition is not.
   ───────────────────────────────────────────────────────────────────────── */

/* How each material handles a moving light source.
   `peak` — how hot the sweep gets as it crosses.
   `rest` — the standing highlight left behind once it settles. Matte antique
            keeps almost nothing; struck brass keeps a lot.
   `rake` — the angle of the light. Changed on every switch so a finish change
            reads as the lamp being moved, not as a dissolve. */
const LIGHT = {
  hammered: { peak: 0.98, rest: 0.42, rake: -11 },
  antique: { peak: 0.30, rest: 0.09, rake: -3 },
  burnished: { peak: 0.66, rest: 0.26, rake: -17 },
  natural: { peak: 0.36, rest: 0.15, rake: -6 },
  inlay: { peak: 0.52, rest: 0.19, rake: -21 },
}
const LIGHT_FALLBACK = { peak: 0.6, rest: 0.22, rake: -10 }

const AUTO_SECONDS = 4.2
const pad = (n) => String(n).padStart(2, '0')

export default function Sampler({ finishes = FINISHES }) {
  const n = finishes.length
  /* useId returns ':r3:' — colons are illegal inside a url(#…) fragment. */
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const clipId = `smp-vessel-${uid}`
  const headId = `smp-head-${uid}`

  const root = useRef(null)
  const stageRef = useRef(null)
  const infoRef = useRef(null)
  const vesselRef = useRef(null)
  const specRef = useRef(null)
  const stripRef = useRef(null)
  const btns = useRef([])
  const rakeTl = useRef(null)
  const firstPass = useRef(true)

  const [committed, setCommitted] = useState(0)
  const [preview, setPreview] = useState(null)   // hover/focus, not yet chosen
  const [locked, setLocked] = useState(false)    // user has touched it — stop cycling
  const [inView, setInView] = useState(false)
  /* Lazy init so the hint copy is right on the first paint rather than
     flipping a frame later. */
  const [touch] = useState(() => (typeof window === 'undefined' ? false : coarse()))

  /* preview may legitimately be 0, so ?? not ||. */
  const shown = preview ?? committed
  const f = finishes[shown]

  /* mirrored into a ref so the entrance timeline — which fires half a second
     after it was built — rakes the finish that is live *then*, not the one
     that was live when the effect closed over it. */
  const shownRef = useRef(shown)
  shownRef.current = shown

  /* ── the light ─────────────────────────────────────────────────────────── */
  const rake = useCallback((i) => {
    const el = specRef.current
    if (!el || reduced()) return
    const L = LIGHT[finishes[i]?.key] || LIGHT_FALLBACK
    rakeTl.current?.kill()
    rakeTl.current = gsap
      .timeline()
      .set(el, { rotate: L.rake })
      .fromTo(
        el,
        { xPercent: -82, opacity: 0 },
        { xPercent: 4, opacity: L.peak, duration: 1.05, ease: 'atelys' }
      )
      /* fall back to the standing highlight before the sweep finishes, so the
         hot core passes rather than parks. */
      .to(el, { opacity: L.rest, duration: 0.6, ease: 'fluid' }, '-=0.26')
  }, [finishes])

  useEffect(() => () => rakeTl.current?.kill(), [])

  /* Re-rake + settle the form on every change. The first pass is owned by the
     entrance timeline so the two do not fight over the sweep. */
  useEffect(() => {
    if (firstPass.current) { firstPass.current = false; return }
    rake(shown)
    if (reduced() || !vesselRef.current) return
    const t = gsap.fromTo(
      vesselRef.current,
      { scale: 0.986 },
      { scale: 1, duration: 0.9, ease: 'surge', overwrite: 'auto' }
    )
    return () => t.kill()
  }, [shown, rake])

  /* ── in-view gate for the gentle auto-advance ──────────────────────────── */
  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return }
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      /* fires only while the section occupies the middle band of the viewport,
         so the cycle never runs against a sliver at the screen edge. */
      { rootMargin: '-15% 0px -15% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (reduced() || locked || !inView) return
    const call = gsap.delayedCall(AUTO_SECONDS, () =>
      setCommitted((c) => (c + 1) % n)
    )
    return () => call.kill()
  }, [committed, locked, inView, n])

  const [displayedIdx, setDisplayedIdx] = useState(shown)
  const panelRefs = useRef([])
  const textTlRef = useRef(null)
  const isFirstRender = useRef(true)
  const displayedIdxRef = useRef(shown)
  displayedIdxRef.current = displayedIdx

  const getPanelElements = (panelEl) => {
    if (!panelEl) return { catEl: null, titleEl: null, bodyEl: null, specEls: [], ctaEl: null }
    const catEl = panelEl.querySelector('.ed-category')
    const titleEl = panelEl.querySelector('.ed-title')
    const bodyEl = panelEl.querySelector('.ed-body')
    const specEls = Array.from(panelEl.querySelectorAll('.ed-spec-item') || [])
    const ctaEl = panelEl.querySelector('.ed-cta')
    return { catEl, titleEl, bodyEl, specEls, ctaEl }
  }

  const animateEntry = useCallback((idx) => {
    const activePanelEl = panelRefs.current[idx]
    if (!activePanelEl) return
    const { catEl, titleEl, bodyEl, specEls, ctaEl } = getPanelElements(activePanelEl)
    const targets = [catEl, titleEl, bodyEl, ...specEls, ctaEl].filter(Boolean)
    if (targets.length === 0) return

    gsap.set(targets, {
      opacity: 0,
      y: 24,
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden',
      force3D: true
    })

    const entryTl = gsap.timeline({
      onComplete: () => {
        gsap.set(targets, { clearProps: 'transform,willChange,backfaceVisibility' })
      }
    })

    if (catEl) entryTl.to(catEl, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
    if (titleEl) entryTl.to(titleEl, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' }, catEl ? '-=0.62' : 0)
    if (bodyEl) entryTl.to(bodyEl, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, titleEl ? '-=0.68' : 0)
    if (specEls.length > 0) entryTl.to(specEls, { opacity: 1, y: 0, duration: 0.75, stagger: 0.1, ease: 'power3.out' }, '-=0.62')
    if (ctaEl) entryTl.to(ctaEl, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.55')
  }, [])

  /* ── GSAP Material Text Sequence (Exit previous -> Switch panel -> Entry new) ── */
  useEffect(() => {
    if (reduced()) {
      setDisplayedIdx(shown)
      displayedIdxRef.current = shown
      return
    }

    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const fromIdx = displayedIdxRef.current
    if (fromIdx === shown) return

    if (textTlRef.current) {
      textTlRef.current.kill()
    }

    const getTargets = (panelEl) => {
      const { catEl, titleEl, bodyEl, specEls, ctaEl } = getPanelElements(panelEl)
      return [catEl, titleEl, bodyEl, ...specEls, ctaEl].filter(Boolean)
    }

    // Instantly hide non-active non-target panels to prevent rapid hover overlap
    panelRefs.current.forEach((panel, i) => {
      if (i !== fromIdx && i !== shown && panel) {
        const targets = getTargets(panel)
        if (targets.length) gsap.set(targets, { opacity: 0, y: 24 })
      }
    })

    const fromPanelEl = panelRefs.current[fromIdx]
    const oldTargets = getTargets(fromPanelEl)

    const tl = gsap.timeline()
    textTlRef.current = tl

    // 1. Exit animation for previous finish text (opacity: 1 -> 0, y: 0 -> -20)
    if (oldTargets.length > 0) {
      tl.to(oldTargets, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power3.in',
        stagger: 0.02,
        onComplete: () => {
          setDisplayedIdx(shown)
          displayedIdxRef.current = shown
        }
      })
    } else {
      setDisplayedIdx(shown)
      displayedIdxRef.current = shown
    }

    return () => {
      tl.kill()
    }
  }, [shown])

  // Trigger entry animation when displayedIdx updates to new shown finish
  useEffect(() => {
    if (reduced()) return
    animateEntry(displayedIdx)
  }, [displayedIdx, animateEntry])

  /* ── keep the committed swatch in view on the mobile swipe rail ─────────── */
  useEffect(() => {
    const strip = stripRef.current
    const btn = btns.current[committed]
    if (!strip || !btn) return
    if (strip.scrollWidth <= strip.clientWidth + 2) return   // no overflow, nothing to do
    const left = btn.offsetLeft - (strip.clientWidth - btn.offsetWidth) / 2
    strip.scrollTo({ left: Math.max(0, left), behavior: reduced() ? 'auto' : 'smooth' })
  }, [committed])

  /* ── entrance ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ paused: true })
      tl.from(stageRef.current, { yPercent: 4, opacity: 0, duration: 1.05, ease: 'atelys' })
        .from(infoRef.current, { y: 26, opacity: 0, duration: 0.95, ease: 'atelys' }, 0.12)
        .from(btns.current.filter(Boolean), {
          yPercent: 32, opacity: 0, stagger: 0.055, duration: 0.7, ease: 'surge',
        }, 0.28)
        .add(() => rake(shownRef.current), 0.5)

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top 82%',
        once: true,
        onEnter: () => tl.play(),
      })
      /* Hard backstop: gsap.from() seeds the hidden state immediately, so if
         the trigger never resolves (odd scroll container, layout race) the
         content would stay invisible. Nothing here may outlive ~2s hidden. */
      const safety = gsap.delayedCall(2, () => tl.play())

      return () => { safety.kill(); st.kill(); tl.kill() }
    })
    return () => mm.revert()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── interaction ───────────────────────────────────────────────────────── */
  const engage = useCallback(() => setLocked(true), [])

  const enter = (i, e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return
    engage()
    setPreview(i)
  }
  const leave = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return
    setPreview(null)   // back to the committed finish
  }
  const commit = (i) => { engage(); setCommitted(i); setPreview(null) }

  const onKey = (i, e) => {
    const k = e.key
    let next = null
    if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % n
    else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + n) % n
    else if (k === 'Home') next = 0
    else if (k === 'End') next = n - 1
    if (next === null) return
    e.preventDefault()
    engage()
    btns.current[next]?.focus()
  }

  if (!f) return null

  return (
    <section className="smp section" ref={root} aria-labelledby={headId}>
      {/* Vessel silhouette. objectBoundingBox units so it scales with the box. */}
      <svg className="smp-defs" aria-hidden="true" focusable="false" width="0" height="0">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d="M0.300 0.012C0.190 0.030 0.084 0.126 0.048 0.270C0.013 0.406 0.021 0.558 0.071 0.704C0.113 0.826 0.175 0.927 0.243 0.981C0.261 0.995 0.277 1 0.299 1L0.701 1C0.723 1 0.739 0.995 0.757 0.981C0.825 0.927 0.887 0.826 0.929 0.704C0.979 0.558 0.987 0.406 0.952 0.270C0.916 0.126 0.810 0.030 0.700 0.012Z" />
          </clipPath>
        </defs>
      </svg>


      <div className="wrap">
        <div className="sec-head" style={{ position: 'relative', top: 0, left: 0, marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)', paddingTop: 'clamp(1rem, 2vw, 2rem)' }}>
          <CharCascade as="span" className="meta">Signature Piece</CharCascade>
        </div>

        <div className="smp-grid">
          {/* ─────────── the object ─────────── */}
          <div className="smp-left">
              <div className="smp-stage" ref={stageRef} style={{ height: 'calc(100vh - 4rem)', minHeight: '600px', position: 'sticky', top: '2rem' }}>
                <span className="smp-corner tl" aria-hidden="true" />
                <span className="smp-corner tr" aria-hidden="true" />
                <span className="smp-corner bl" aria-hidden="true" />
                <span className="smp-corner br" aria-hidden="true" />
                <span className="smp-horizon" aria-hidden="true" />

                <div className="smp-object">
                <div className="smp-glows" aria-hidden="true">
                  {finishes.map((x, i) => (
                    <span
                      key={x.key}
                      className={`smp-glow g-${x.key}${i === shown ? ' is-on' : ''}`}
                    />
                  ))}
                </div>

                <div
                  className="smp-vessel"
                  ref={vesselRef}
                  aria-hidden="true"
                  style={{ clipPath: `url(#${clipId})` }}
                >
                  {finishes.map((x, i) => (
                    i === shown ? (
                      <span
                        key={x.key}
                        className={`smp-layer smp-rcp smp-rcp-${x.key} is-on`}
                      />
                    ) : null
                  ))}
                  <span className="smp-form" />
                  <span className="smp-rim" />
                  <span className="smp-spec" ref={specRef} />
                </div>
              </div>





            </div>


          </div>

          {/* ─────────── readout ─────────── */}
          <div className="smp-info" ref={infoRef}>
            <div className="smp-panels">
              <div className="smp-panel is-on">
                <EditorialReveal
                  category="SIGNATURE PIECE · FEATURED SPECIFICATION"
                  title="Lotus Wall Sconce"
                  body="Ten thousand marks, struck one at a time. Light breaks across the surface instead of sliding off it."
                  staggerMs={100}
                  disabled={true}
                >
                  <div className="ed-cta" style={{ marginTop: '1.75rem' }}>
                    <Button to="/contact">Request the swatch box</Button>
                  </div>
                </EditorialReveal>
              </div>
            </div>

            <p className="smp-sr" role="status">
              Lotus Wall Sconce. Ten thousand marks, struck one at a time. Light breaks across the surface instead of sliding off it.
            </p>
            
            {/* ─────────── swatches ─────────── */}
            <div className="smp-swatches" style={{ marginTop: '2rem' }}>
              <div
                className="smp-strip"
                ref={stripRef}
                role="toolbar"
                aria-label="Choose a finish"
                aria-orientation="horizontal"
              >
                {finishes.map((x, i) => (
                  <button
                    key={x.key}
                    type="button"
                    ref={(el) => { btns.current[i] = el }}
                    className={`smp-sw${i === shown ? ' is-shown' : ''}${i === committed ? ' is-on' : ''}`}
                    aria-pressed={i === committed}
                    /* roving tabindex — one stop for the whole rail, arrows move within */
                    tabIndex={i === committed ? 0 : -1}
                    onClick={() => commit(i)}
                    onPointerEnter={(e) => enter(i, e)}
                    onPointerLeave={leave}
                    onFocus={() => { engage(); setPreview(i) }}
                    onBlur={() => setPreview(null)}
                    onKeyDown={(e) => onKey(i, e)}
                  >
                    <span className="smp-sw-face" aria-hidden="true">
                      <span className={`smp-rcp smp-rcp-${x.key}`} />
                      <span className="smp-sw-gloss" />
                    </span>
                    <span className="smp-sw-name">{x.name}</span>
                  </button>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
