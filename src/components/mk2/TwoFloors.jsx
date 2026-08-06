import { useEffect, useRef } from 'react'
import { gsap, reduced } from '../../lib/gsap'
import { CharCascade, SmoothReveal } from '../Reveal'

/* MK2 · Two Floors — the metal floor (Moradabad) and the wood floor
   (Saharanpur), split by a draggable brass seam.

   The whole interaction is one number. `--split` (0..1) lives on the section
   and CSS derives everything from it: both panel clip-paths, the seam's
   translate, and each side's focus weighting. Pointer, keyboard and the
   elastic settle all funnel through a single write() so the three input paths
   can never disagree. JS writes custom properties only — never layout. */

const MIN = 0.15   // never fully swallow a floor; both stay legible at the ends
const MAX = 0.85
const REST = 0.5
const STEP = 0.05  // arrow-key increment (5%), per the slider contract

export default function TwoFloors() {
  const root = useRef(null)
  const sliderRef = useRef(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const slider = sliderRef.current
    const state = { v: REST }

    const write = (v) => {
      state.v = v
      el.style.setProperty('--split', v.toFixed(4))
      /* Per-side weight: how much of the frame each floor currently owns. CSS
         turns these into scale / opacity / blur, so the wider floor reads as
         the one in focus and the narrow one recedes rather than just shrinking. */
      el.style.setProperty('--m-k', v.toFixed(4))
      el.style.setProperty('--w-k', (1 - v).toFixed(4))
      if (slider) {
        const pct = Math.round(gsap.utils.clamp(MIN, MAX, v) * 100)
        slider.setAttribute('aria-valuenow', String(pct))
        slider.setAttribute('aria-valuetext', `Metal floor ${pct}%, wood floor ${100 - pct}%`)
      }
    }
    write(REST)

    /* Reduced motion: the resting state is already the finished state — a
       static 50/50 with both floors fully readable. Bind nothing. */
    if (reduced()) return

    const mm = gsap.matchMedia()

    /* ── drag + keyboard — fine pointers only ──────────────────────────────
       Coarse pointers get the stacked layout instead, where a horizontal
       seam divides two full-width panels and there is nothing to drag. */
    mm.add('(pointer: fine) and (min-width: 861px)', () => {
      if (!slider) return
      let tween = null
      let dragging = false
      let pid = null

      const stop = () => { if (tween) { tween.kill(); tween = null } }

      const ratioAt = (clientX) => {
        const r = el.getBoundingClientRect()
        return gsap.utils.clamp(MIN, MAX, (clientX - r.left) / r.width)
      }

      const down = (e) => {
        if (e.button) return
        stop()
        dragging = true
        pid = e.pointerId
        /* Capture so the seam keeps following the pointer once it leaves the
           52px hit strip — which it does immediately on any real drag. */
        try { slider.setPointerCapture(pid) } catch { /* non-fatal */ }
        el.classList.add('is-dragging')
        write(ratioAt(e.clientX))
        e.preventDefault()
      }

      const move = (e) => { if (dragging) write(ratioAt(e.clientX)) }

      const up = () => {
        if (!dragging) return
        dragging = false
        el.classList.remove('is-dragging')
        try { slider.releasePointerCapture(pid) } catch { /* non-fatal */ }
        stop()
        /* Let go and it wants balance back: overshoots centre once, then
           settles. Elastic, not eased — the seam should feel sprung. */
        tween = gsap.to(state, {
          v: REST,
          duration: 1.2,
          ease: 'elastic.out(1, 0.42)',
          onUpdate: () => write(state.v),
        })
      }

      const key = (e) => {
        let t = null
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') t = state.v - STEP
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') t = state.v + STEP
        else if (e.key === 'PageDown') t = state.v - STEP * 3
        else if (e.key === 'PageUp') t = state.v + STEP * 3
        else if (e.key === 'Home') t = MIN
        else if (e.key === 'End') t = MAX
        else return
        e.preventDefault()
        stop()
        /* Keyboard HOLDS its value — no elastic return. A control that springs
           back the instant you release the key is unusable without a pointer. */
        tween = gsap.to(state, {
          v: gsap.utils.clamp(MIN, MAX, t),
          duration: 0.36,
          ease: 'surge',
          onUpdate: () => write(state.v),
        })
      }

      slider.addEventListener('pointerdown', down)
      slider.addEventListener('pointermove', move)
      slider.addEventListener('pointerup', up)
      slider.addEventListener('pointercancel', up)
      slider.addEventListener('keydown', key)

      return () => {
        stop()
        slider.removeEventListener('pointerdown', down)
        slider.removeEventListener('pointermove', move)
        slider.removeEventListener('pointerup', up)
        slider.removeEventListener('pointercancel', up)
        slider.removeEventListener('keydown', key)
        el.classList.remove('is-dragging')
        write(REST)
      }
    })

    /* ── entrance — one-shot, both layouts ─────────────────────────────────
       fromTo (not from) so the CSS resting state stays visible: if this never
       runs, every element is already in its final, readable position. */
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const q = gsap.utils.selector(el)
      const tl = gsap.timeline({
        defaults: { ease: 'atelys', duration: 0.9 },
        scrollTrigger: { trigger: el, start: 'top 72%', once: true },
      })
      tl.fromTo(q('.tf-line'),
        { scaleY: 0, transformOrigin: '50% 0%' },
        { scaleY: 1, duration: 1.15, ease: 'viscous' }, 0)
        .fromTo(q('.tf-strip'), { opacity: 0, y: -14 }, { opacity: 1, y: 0, stagger: 0.08 }, 0.1)
        .fromTo(q('.tf-metal .tf-stack > *'), { opacity: 0, y: 28 },
          { opacity: 1, y: 0, stagger: 0.06 }, 0.18)
        .fromTo(q('.tf-wood .tf-stack > *'), { opacity: 0, y: 28 },
          { opacity: 1, y: 0, stagger: 0.06 }, 0.3)
        .fromTo(q('.tf-numeral'), { opacity: 0, y: 34 },
          { opacity: 1, y: 0, duration: 1.3, stagger: 0.1 }, 0.34)
        /* clearProps hands opacity back to CSS — .tf-hint's resting opacity and
           its drag-fade rule both live there and must not be overridden inline. */
        .fromTo(q('.tf-hit, .tf-plaque, .tf-hint'), { opacity: 0 },
          { opacity: 1, duration: 0.7, clearProps: 'opacity' }, 0.52)
      return () => {
        if (tl.scrollTrigger) tl.scrollTrigger.kill()
        tl.kill()
      }
    })

    return () => mm.revert()
  }, [])

  return (
    <section className="tf section" ref={root} aria-labelledby="tf-title">
      <div className="sec-head"><span className="meta">Signature piece</span></div>
      <h2 id="tf-title" className="tf-vh">Two floors, one object</h2>

      {/* ── FLOOR 01 · METAL ─────────────────────────────────────────── */}
      <div className="tf-panel tf-metal">
        <div className="tf-ground" aria-hidden="true">
          <span className="tf-hammer" />
          <span className="tf-sheen" />
          <span className="tf-vig" />
        </div>
        <p className="tf-strip">Brass · Copper · German silver · Aluminium</p>
        <span className="tf-numeral" aria-hidden="true">01</span>
        <div className="tf-content">
          <div className="tf-stack">
            <p className="tf-eyebrow">
              <span className="tf-tick" aria-hidden="true" />Floor 01 — Moradabad
            </p>
            <CharCascade as="h3" className="tf-head">Struck, spun, raised.</CharCascade>
            <SmoothReveal>
              <p className="tf-copy">
                Sand-cast, or spun down onto a lathe chuck, then raised over a stake
                by hand. Chasing tightens the line from the front; repoussé pushes it
                out from the back. Nothing on this floor is pressed.
              </p>
            </SmoothReveal>
            <p className="tf-stat">
              <span className="tf-stat-n">11</span>
              <span className="tf-stat-l">processes<br />under one roof</span>
            </p>
            <p className="tf-spec">Raised up to 900 mm across</p>
          </div>
        </div>
      </div>

      {/* ── FLOOR 02 · WOOD ──────────────────────────────────────────── */}
      <div className="tf-panel tf-wood">
        <div className="tf-ground" aria-hidden="true">
          <span className="tf-grain" />
          <span className="tf-knot" />
          <span className="tf-vig" />
        </div>
        <p className="tf-strip">Sheesham · Mango · Acacia · Reclaimed teak</p>
        <span className="tf-numeral" aria-hidden="true">02</span>
        <div className="tf-content">
          <div className="tf-stack">
            <p className="tf-eyebrow">
              <span className="tf-tick" aria-hidden="true" />Floor 02 — Saharanpur
            </p>
            <CharCascade as="h3" className="tf-head">Seasoned, then cut.</CharCascade>
            <SmoothReveal>
              <p className="tf-copy">
                Sheesham and mango go into the kiln green and come out at eight to ten
                percent. Then they rest four weeks in the air the benches breathe.
                Only after that does a blade touch them.
              </p>
            </SmoothReveal>
            <p className="tf-stat">
              <span className="tf-stat-n">8–10%</span>
              <span className="tf-stat-l">moisture<br />at the bench</span>
            </p>
            <p className="tf-spec">Four weeks resting. Then one cut.</p>
          </div>
        </div>
      </div>

      {/* ── THE SEAM ─────────────────────────────────────────────────── */}
      <div className="tf-seam">
        <span className="tf-shade tf-shade-l" aria-hidden="true" />
        <span className="tf-shade tf-shade-r" aria-hidden="true" />
        <span className="tf-halo" aria-hidden="true" />
        <span className="tf-line" aria-hidden="true" />

        <div
          className="tf-hit"
          ref={sliderRef}
          role="slider"
          tabIndex={0}
          aria-label="Balance the metal floor against the wood floor"
          aria-orientation="horizontal"
          aria-valuemin={Math.round(MIN * 100)}
          aria-valuemax={Math.round(MAX * 100)}
          aria-valuenow={Math.round(REST * 100)}
          aria-valuetext="Metal floor 50%, wood floor 50%"
        >
          <span className="tf-arrow tf-arrow-l" aria-hidden="true" />
          <span className="tf-grip" aria-hidden="true" />
          <span className="tf-arrow tf-arrow-r" aria-hidden="true" />
        </div>

        <p className="tf-plaque">
          <span className="tf-plaque-i"><b>10-15</b> artisans</span>
          <span className="tf-slash" aria-hidden="true">/</span>
          <span className="tf-plaque-i">Two floors</span>
          <span className="tf-slash" aria-hidden="true">/</span>
          <span className="tf-plaque-i">One object</span>
        </p>

        <p className="tf-hint" aria-hidden="true">Drag the seam · or arrow keys</p>
      </div>
    </section>
  )
}
