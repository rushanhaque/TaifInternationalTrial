import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { BRAND } from '../../data/site'
import { CharCascade, SmoothReveal } from '../Reveal'

/* mk2 · THE TURN — the homepage's signature moment.
 *
 * A hand-raised brass vessel turns a full 360° under a raking key light,
 * scrubbed by scroll, pinned centre-stage, with technical callouts flying out
 * and retracting as their portion of the turn arrives. Past 60% the brass
 * cross-dissolves into walnut and the callouts swap to the wood spec.
 *
 * No 3D library, no image assets. The turn is faked with stacked paint layers
 * inside one circular clip:
 *   · a BROAD specular strip and a FINE facet strip slide horizontally at
 *     DIFFERENT rates — the parallax between a reflection and the surface
 *     carrying it is what actually reads as rotation, not the sliding itself;
 *   · a dimple + lathe-ring texture rotates a few degrees so the surface reads
 *     as struck by hand rather than printed;
 *   · a specular hotspot and two rim arcs orbit the form once;
 *   · a static edge-darkening layer supplies the cylinder's falloff, which is
 *     what stops the uncompressed bands from reading as flat stripes.
 *
 * `frames` is the upgrade path to real photography: pass an array of image
 * URLs and the identical scrub drives a canvas image sequence instead of the
 * CSS turntable. Annotations, HUD and pin are shared by both paths.
 */

/* Six callouts at six distinct anchors — brass trio, then walnut trio. They
   sit at DIFFERENT anchors rather than reusing three, so the fail-open state
   (JS never runs) is six readable labels instead of three collisions, and so
   the second act visibly re-composes the plate rather than re-filling it.
   `in`/`out` are positions on a 0→1 timeline; a1/a3/a5 hang left, a2/a4/a6
   right; the anchor offsets are cos-derived from each row's height on the
   circle so every leader line lands on the true silhouette, not a bounding box. */
const NOTES = [
  { id: 'b1', mat: 'brass', a: 1, side: 'l', tag: 'Strike count', in: 0.05, out: 0.22,
    text: '~10,000 strikes. Each one placed.' },
  { id: 'b2', mat: 'brass', a: 2, side: 'r', tag: 'Hardness', in: 0.25, out: 0.42,
    text: 'Work-hardened to 140 HV at the strike face.' },
  { id: 'b3', mat: 'brass', a: 3, side: 'l', tag: 'Dimensions', in: 0.45, out: 0.58,
    text: '280 mm diameter / 0.86 kg / IS 319 brass' },
  { id: 'w1', mat: 'wood', a: 4, side: 'r', tag: 'Moisture', in: 0.68, out: 0.79,
    text: 'Kiln-dried to 8–10% moisture before a single cut.' },
  { id: 'w2', mat: 'wood', a: 5, side: 'l', tag: 'Finish', in: 0.80, out: 0.89,
    text: 'Three coats of hard-wax oil, cured 48 hours.' },
  { id: 'w3', mat: 'wood', a: 6, side: 'r', tag: 'Surface', in: 0.90, out: null,
    text: 'The grain is the decoration. Nothing printed, nothing veneered.' },
]

const COLS = [
  { mat: 'brass', head: 'Brass — the body, raised' },
  { mat: 'wood', head: 'Walnut — the body, cut' },
]

/* One material's paint stack. `isolation: isolate` on the skin keeps its
   overlay/screen layers blending inside that skin only, so the brass stack
   never composites against the walnut sitting behind it mid-dissolve. */
function Skin({ mat }) {
  return (
    <div className={`tt-skin is-${mat}`}>
      <span className="tt-lay tt-base" />
      {mat === 'brass' && <span className="tt-strip tt-bands" data-strip="slow" />}
      <span className="tt-strip tt-chatter" data-strip="fast" />
      <span className="tt-lay tt-tex" data-tex />
      <span className="tt-lay tt-vol" />
      <span className="tt-lay tt-rake" data-rake />
      <span className="tt-mouth" />
    </div>
  )
}

/* The raking light on the silhouette itself. pathLength="100" lets the dash
   pattern be written in plain percentages of the circumference. */
function Rim({ mat }) {
  return (
    <svg className={`tt-rim is-${mat}`} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <circle className="tt-rim-base" cx="100" cy="100" r="99.1" />
      <g data-rimg>
        <circle className="tt-rim-hot" cx="100" cy="100" r="99.1" pathLength="100" strokeDasharray="14 86" />
        <circle className="tt-rim-hot2" cx="100" cy="100" r="99.1" pathLength="100" strokeDasharray="5 95" strokeDashoffset="-42" />
      </g>
    </svg>
  )
}

export default function TheTurn({ frames }) {
  const root = useRef(null)
  const stage = useRef(null)
  const canvas = useRef(null)
  const draw = useRef(null)          // set by the canvas path, read by the scrub
  const hasFrames = Array.isArray(frames) && frames.length > 1

  /* ── image-sequence path ──────────────────────────────────────────────
     Declared before the ScrollTrigger effect so draw.current is populated
     by the time the scrub first fires. */
  useEffect(() => {
    if (!hasFrames) return
    const cv = canvas.current
    const host = cv?.parentElement
    if (!cv || !host) return
    const ctx = cv.getContext('2d')
    const imgs = frames.map((src) => {
      const im = new Image()
      im.decoding = 'async'
      im.src = src
      return im
    })
    /* Rest pose: a three-quarter frame, not frame 0. If the scrub never runs
       (mobile, reduced motion, JS budget blown) the object still reads as
       deliberately posed rather than parked at the sequence origin. */
    const rest = Math.floor((frames.length - 1) * 0.12)
    let cur = rest
    let painted = -1
    let w = 0
    let h = 0

    function measure() {
      const r = host.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = Math.max(1, Math.round(r.width))
      h = Math.max(1, Math.round(r.height))
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      painted = -1
    }
    function paint(i) {
      const im = imgs[i]
      if (!im || !im.complete || !im.naturalWidth) return
      ctx.clearRect(0, 0, w, h)
      const s = Math.min(w / im.naturalWidth, h / im.naturalHeight)
      const dw = im.naturalWidth * s
      const dh = im.naturalHeight * s
      ctx.drawImage(im, (w - dw) / 2, (h - dh) / 2, dw, dh)
      painted = i
    }
    function onLoad() {
      if (painted < 0) paint(cur)
    }

    draw.current = (p) => {
      const i = gsap.utils.clamp(0, frames.length - 1, Math.round(p * (frames.length - 1)))
      cur = i
      if (i !== painted) paint(i)
    }

    measure()
    paint(cur)
    imgs.forEach((im) => im.addEventListener('load', onLoad))
    const ro = new ResizeObserver(() => { measure(); paint(cur) })
    ro.observe(host)

    return () => {
      ro.disconnect()
      imgs.forEach((im) => im.removeEventListener('load', onLoad))
      draw.current = null
    }
  }, [frames, hasFrames])

  /* ── the scrub ────────────────────────────────────────────────────────
     matchMedia gates the whole thing: below 1000px, or with reduced motion
     requested, nothing is seeded and nothing is hidden — the CSS resting
     state IS the designed static plate. */
  useEffect(() => {
    const el = root.current
    if (!el) return
    const mm = gsap.matchMedia()

    mm.add('(min-width: 1000px) and (prefers-reduced-motion: no-preference)', () => {
      const q = (s) => gsap.utils.toArray(el.querySelectorAll(s))
      const notes = q('[data-note]')
      const lines = q('[data-line]')
      const slow = q('[data-strip="slow"]')
      const fast = q('[data-strip="fast"]')
      const tex = q('[data-tex]')
      const rake = q('[data-rake]')
      const rimg = q('[data-rimg]')
      const brass = q('[data-brass]')
      const ground = q('[data-ground]')
      const form = el.querySelector('[data-form]')
      const bar = el.querySelector('[data-bar]')
      const deg = el.querySelector('[data-deg]')
      const matWood = el.querySelector('[data-mat="wood"]')

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stage.current,
          start: 'top top',
          end: '+=2600',
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate(self) {
            if (deg) deg.textContent = `${String(Math.round(self.progress * 360)).padStart(3, '0')}°`
            if (draw.current) draw.current(self.progress)
          },
        },
      })
      /* only tween what this render actually put on the page — with `frames`
         the CSS turntable is absent and every one of these lists is empty */
      const from = (t, a, b, p) => { if (t && (t.length ?? 1)) tl.fromTo(t, a, b, p) }
      const to = (t, b, p) => { if (t && (t.length ?? 1)) tl.to(t, b, p) }

      /* continuous, full length. Broad specular travels slower than the
         surface it sits on — that lag is the rotation cue. */
      from(slow, { xPercent: 0 }, { xPercent: -20, duration: 1 }, 0)
      from(fast, { xPercent: 0 }, { xPercent: -32, duration: 1 }, 0)
      from(tex, { rotate: 0 }, { rotate: -15, duration: 1 }, 0)
      from(rake, { rotate: 0 }, { rotate: 360, duration: 1 }, 0)
      if (rimg.length) {
        /* the <g> holds two dashed circles; svgOrigin pins the spin to the
           viewBox centre rather than to a dash-derived bbox guess */
        gsap.set(rimg, { svgOrigin: '100 100' })
        tl.fromTo(rimg, { rotate: 0 }, { rotate: 360, duration: 1 }, 0)
      }
      /* progress meter: scaleX(0) is a meter reading zero, not hidden content */
      from(bar, { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)

      /* the cast shadow breathes as the mass swings through the key light */
      to(ground, { scaleX: 1.1, xPercent: -4, opacity: 0.86, duration: 0.25 }, 0)
      to(ground, { scaleX: 0.93, xPercent: 3, opacity: 1, duration: 0.25 }, 0.25)
      to(ground, { scaleX: 1.08, xPercent: 2, opacity: 0.9, duration: 0.25 }, 0.5)
      to(ground, { scaleX: 1, xPercent: 0, opacity: 1, duration: 0.25 }, 0.75)

      /* metal → grain. Walnut is already sitting opaque underneath, so the
         dissolve is one opacity tween on the brass group and neither layer
         ever needs a hidden resting state. */
      to(brass, { opacity: 0, duration: 0.14, ease: 'power1.inOut' }, 0.6)
      if (form) {
        tl.to(form, { scale: 1.035, duration: 0.07, ease: 'power2.out' }, 0.6)
          .to(form, { scale: 1, duration: 0.09, ease: 'power2.inOut' }, 0.67)
      }
      /* HUD reads "IS 319 BRASS → AMERICAN WALNUT" at rest; the turn only
         moves the emphasis, so the line stays legible with no JS at all. */
      to(el.querySelector('[data-mat="brass"]'), { opacity: 0.32, duration: 0.1 }, 0.6)
      if (matWood) tl.fromTo(matWood, { opacity: 0.32 }, { opacity: 1, duration: 0.1 }, 0.62)

      NOTES.forEach((n, i) => {
        const note = notes[i]
        const line = lines[i]
        if (!note) return
        const dir = n.side === 'l' ? -1 : 1
        tl.fromTo(note,
          { autoAlpha: 0, x: dir * 26 },
          { autoAlpha: 1, x: 0, duration: 0.085, ease: 'surge' }, n.in)
        if (line) tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.075, ease: 'power2.out' }, n.in + 0.015)
        if (n.out == null) return
        /* retract toward the anchor: the label follows its own leader home */
        tl.to(note, { autoAlpha: 0, x: dir * -12, duration: 0.05, ease: 'power1.in' }, n.out)
        if (line) tl.to(line, { scaleX: 0, duration: 0.05 }, n.out)
      })

      return () => {
        tl.scrollTrigger?.kill()
        tl.kill()
      }
    })

    return () => mm.revert()
  }, [hasFrames])

  return (
    <section className="tt section deep" ref={root} aria-labelledby="tt-h">
      <div className="tt-stage" ref={stage}>
        <div className="sec-head tt-sec-head"><span className="meta">From us to you</span></div>
        <span className="tt-lamp" aria-hidden="true" />
        <span className="tt-floor" aria-hidden="true" />

        <div className="tt-hud wrap">
          <span className="tt-hud-l">
            <span className="meta">Finishes</span>
            <span className="tt-hud-sub">{BRAND.origin}</span>
          </span>
        </div>

        <div className="tt-rig">
          <div className={`tt-form${hasFrames ? ' is-frames' : ''}`} data-form aria-hidden="true">
            {hasFrames ? (
              <canvas className="tt-canvas" ref={canvas} />
            ) : (
              <>
                <div className="tt-group">
                  <Skin mat="wood" />
                  <Rim mat="wood" />
                </div>
                <div className="tt-group" data-brass>
                  <Skin mat="brass" />
                  <Rim mat="brass" />
                </div>
              </>
            )}
          </div>
          {!hasFrames && <span className="tt-ground" data-ground aria-hidden="true" />}

          {/* Decorative duplicate of the spec list below — that list is the
              accessible copy, so these are hidden from assistive tech. */}
          <div className="tt-notes" aria-hidden="true">
            {NOTES.map((n) => (
              <div className={`tt-note a${n.a} side-${n.side}`} key={n.id} data-note data-side={n.side}>
                <span className="tt-note-body">
                  <span className="tt-note-tag meta">{n.tag}</span>
                  <span className="tt-note-text">{n.text}</span>
                </span>
                <span className="tt-note-line" data-line />
                <span className="tt-note-dot" />
              </div>
            ))}
          </div>
        </div>

        <div className="tt-bar" aria-hidden="true"><i data-bar /></div>
      </div>

      {/* The spec. Visible presentation on mobile and under reduced motion;
          under the pinned turn it stays in the accessibility tree so the
          callouts are never the only route to the content. */}
      <div className="wrap tt-specs">
        <div className="tt-spec-grid">
          {COLS.map((c) => (
            <div className={`tt-spec-col is-${c.mat}`} key={c.mat}>
              <CharCascade as="h3" className="tt-spec-h">{c.head}</CharCascade>
              <ul className="tt-spec-list">
                {NOTES.filter((n) => n.mat === c.mat).map((n) => (
                  <li key={n.id}>
                    <span className="tt-spec-tag meta">{n.tag}</span>
                    <SmoothReveal><p className="tt-spec-text">{n.text}</p></SmoothReveal>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
