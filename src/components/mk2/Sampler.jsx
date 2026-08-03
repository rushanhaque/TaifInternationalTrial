import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reduced, coarse } from '../../lib/gsap'
import { FINISHES, BRAND } from '../../data/site'
import Button from '../Button'

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
    /* Touch fires pointerenter on tap; hover preview is a mouse affordance
       only, otherwise a tap would preview and commit in the same gesture. */
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
    btns.current[next]?.focus()   // focus moves → onFocus previews it
  }

  /* Safe here — every hook above ran unconditionally, so hook order is stable.
     Only reachable if a caller passes an empty `finishes`. */
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
        <div className="sec-head">
          <span className="meta">Finish sampler · {pad(n)} surfaces</span>
        </div>

        <div className="smp-top">
          <h2 className="d1 smp-head" id={headId}>
            Every surface we ship,<br />on one object.
          </h2>
          <p className="lede smp-lede">
            Five recipes off the same finishing line, drawn on a single form so the
            only thing changing is the skin.{' '}
            {touch
              ? 'Tap a swatch to hold it.'
              : 'Hover a swatch to move the light across it; click to hold it.'}
          </p>
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
                    <span
                      key={x.key}
                      className={`smp-layer smp-rcp smp-rcp-${x.key}${i === shown ? ' is-on' : ''}`}
                    />
                  ))}
                  <span className="smp-form" />
                  <span className="smp-rim" />
                  <span className="smp-spec" ref={specRef} />
                </div>
              </div>

              {/* A physical sample card lying on the plinth — same recipe, flat,
                  at chip scale. This is how the finish actually gets approved. */}
              <div className="smp-card" aria-hidden="true">
                <span className="smp-cardface">
                  {finishes.map((x, i) => (
                    <span
                      key={x.key}
                      className={`smp-layer smp-rcp smp-rcp-${x.key}${i === shown ? ' is-on' : ''}`}
                    />
                  ))}
                </span>
                <span className="meta smp-cardlabel">Sample · 1:1</span>
              </div>

              <span className="meta smp-mark" aria-hidden="true">
                {BRAND.mark} · {BRAND.origin}
              </span>
            </div>


          </div>

          {/* ─────────── readout ─────────── */}
          <div className="smp-info" ref={infoRef}>
            {/* The visual stack is a cross-fade of five copies, so it is marked
                decorative; the live region below carries the same content to
                assistive tech in one clean, changing node. */}
            <div className="smp-panels" aria-hidden="true">
              {finishes.map((x, i) => (
                <div key={x.key} className={`smp-panel${i === shown ? ' is-on' : ''}`}>
                  <span className="idx smp-idx">
                    {pad(i + 1)}<i />{pad(n)}
                  </span>
                  <p className="smp-name">{x.name}</p>
                  <ul className="smp-subs">
                    {x.substrates.map((s) => (
                      <li key={s} className="chip smp-sub">{s}</li>
                    ))}
                  </ul>
                  <p className="lede smp-char">{x.character}</p>
                </div>
              ))}
            </div>

            <p className="smp-sr" role="status">
              {`${f.name}. Substrates: ${f.substrates.join(', ')}. ${f.character} Durability: ${f.durability} Care: ${f.care}`}
            </p>

            <div className="smp-cta">
              <Button to="/contact" variant="ghost" small>Request the swatch box</Button>
            </div>
            
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
              <p className="smp-note">
                Colour is held to a physical master swatch. A screen is a starting
                point, not a specification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
