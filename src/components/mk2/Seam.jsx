import { createElement, useEffect, useId, useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger, reduced } from '../../lib/gsap'

/* ═══════════════════════════════════════════════════════════════════════
   Seam — the brass spine, and LineRise — the house text reveal.

   The seam is the literal reading of "Where Metal Meets Grain": one drawn
   brass line that never leaves the screen and never breaks, with a molten
   bead riding it as the page moves. It is the only element on the site that
   is continuous from the first pixel to the last.
   ═══════════════════════════════════════════════════════════════════════ */

/* useLayoutEffect so the seam and the bead are placed before the first
   paint — a decorative element that flashes in the wrong spot for one frame
   is worse than no decoration at all. Guarded for a non-DOM render pass. */
const useIsoEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/* The resting `d`: a dead-straight hairline. This is what ships in the HTML,
   what a reduced-motion visitor sees, and what survives if the script never
   runs. The curve is an enhancement layered on top of it, never a
   prerequisite for the seam existing. */
const STATIC_D = 'M50 -4 L50 104'

/* Resting bead placement, sized for a mid-size viewport. It is overwritten on
   the first frame; it exists so the bead is never a full-viewport blob if the
   script is late or a switch to reduced motion tears the transform off. */
const BEAD_REST = 'translate(95 9) scale(0.07 0.11)'

/* Horizontal envelope in viewBox units. The seam is allowed to wander but it
   is never allowed to reach a text column. */
/* The spine lives in the right-hand margin — a narrow 8% lane rather than the
   full width, so it reads as an edge indicator beside the content instead of
   a line drawn through it. The centre of the lane is X_MID; the drift is
   clamped to the lane so it can never wander over the text column. */
const X_MIN = 92
const X_MAX = 98
const X_MID = 95

/* Curve sampling. 18 segments is the point where more segments stop being
   visible and start being arithmetic. */
const SEG = 18

const round2 = (n) => Math.round(n * 100) / 100

/* Catmull-Rom through the sampled points, emitted as cubic Béziers. A plain
   polyline reads as a folded wire; the spline reads as a drawn one. */
function splineD(xs, ys) {
  const n = xs.length
  let d = `M${round2(xs[0])} ${round2(ys[0])}`
  for (let i = 0; i < n - 1; i++) {
    const i0 = i > 0 ? i - 1 : i
    const i3 = i < n - 2 ? i + 2 : i + 1
    const c1x = xs[i] + (xs[i + 1] - xs[i0]) / 6
    const c1y = ys[i] + (ys[i + 1] - ys[i0]) / 6
    const c2x = xs[i + 1] - (xs[i3] - xs[i]) / 6
    const c2y = ys[i + 1] - (ys[i3] - ys[i]) / 6
    d += `C${round2(c1x)} ${round2(c1y)} ${round2(c2x)} ${round2(c2y)} ${round2(xs[i + 1])} ${round2(ys[i + 1])}`
  }
  return d
}

export default function Seam() {
  const rootRef = useRef(null)
  const pathRef = useRef(null)
  const beadRef = useRef(null)
  const svgRef = useRef(null)
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const gradId = `seam-wire-${uid}`
  const bloomId = `seam-bloom-${uid}`

  useIsoEffect(() => {
    const path = pathRef.current
    const bead = beadRef.current
    const svg = svgRef.current
    if (!path || !svg) return

    const mm = gsap.matchMedia()

    mm.add(
      {
        /* The breakpoint and the motion preference are both media queries, so
           both are handled by matchMedia rather than a one-shot read — a
           visitor who turns reduced-motion on mid-session gets the static
           hairline back without a reload. */
        narrow: '(max-width: 900px)',
        motionOK: '(prefers-reduced-motion: no-preference)',
      },
      (self) => {
        const { narrow, motionOK } = self.conditions
        if (!motionOK) return undefined

        /* Under 900px the seam straightens and narrows: a phone column has no
           room for a snake, and a near-vertical line still reads as a spine. */
        const amplitude = narrow ? 1.4 : 2.6
        const waves = narrow ? 0.75 : 1.15

        const xs = new Float64Array(SEG + 1)
        const ys = new Float64Array(SEG + 1)
        for (let i = 0; i <= SEG; i++) ys[i] = -4 + (i / SEG) * 108

        /* preserveAspectRatio="none" stretches user space by different factors
           on each axis. The strokes are immune (non-scaling-stroke) but the
           bead is not, so we hold the live factors and counter-scale it. */
        let sx = 1
        let sy = 1
        const measure = () => {
          const r = svg.getBoundingClientRect()
          sx = (r.width || window.innerWidth) / 100
          sy = (r.height || window.innerHeight) / 100
        }
        measure()

        let lastP = -1
        const draw = (p) => {
          /* The seam breathes open through the middle of the page and closes
             again at both ends, so the hero and the footer stay composed. */
          const swell = amplitude * (0.62 + 0.38 * Math.sin(Math.PI * p))
          const phase = p * Math.PI * 2.1
          for (let i = 0; i <= SEG; i++) {
            const t = i / SEG
            const u = t * Math.PI * 2 * waves + phase
            /* Two out-of-phase harmonics: one sine reads mechanical, two read
               like a line someone drew freehand down a wall. */
            let x = X_MID + swell * Math.sin(u) + swell * 0.3 * Math.sin(u * 2.17 + 1.1)
            if (x < X_MIN) x = X_MIN
            else if (x > X_MAX) x = X_MAX
            xs[i] = x
          }
          path.setAttribute('d', splineD(xs, ys))

          if (bead) {
            const len = path.getTotalLength()
            /* Bead rides 10%→90% of the seam so it never collides with the
               nav or the footer edge. It is the scroll indicator as well as
               the ornament — there is no second progress bar on this site. */
            const pt = path.getPointAtLength(len * (0.1 + p * 0.8))
            bead.setAttribute(
              'transform',
              `translate(${round2(pt.x)} ${round2(pt.y)}) scale(${round2(1 / sx)} ${round2(1 / sy)})`,
            )
          }
        }

        draw(0)

        /* ONE ScrollTrigger for the whole spine. A proxy object is scrubbed
           from 0→1 across the document and its onUpdate does a single `d`
           write plus a single bead transform per frame. No React state is
           touched while scrolling. */
        const state = { p: 0 }
        const tw = gsap.to(state, {
          p: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'max',
            refreshPriority: -10,
            /* A short scrub gives the spine mass — brass lags the scroll for
               about half a second and then settles, which is the whole
               difference between a wire and a graphic. */
            scrub: 0.5,
          },
          onUpdate: () => {
            const p = state.p
            if (Math.abs(p - lastP) < 0.0004) return
            lastP = p
            draw(p)
          },
        })

        const onRefresh = () => {
          measure()
          lastP = -1
          draw(state.p)
        }
        ScrollTrigger.addEventListener('refresh', onRefresh)

        return () => {
          ScrollTrigger.removeEventListener('refresh', onRefresh)
          tw.scrollTrigger?.kill()
          tw.kill()
          /* Hand the element back in its declarative resting state so a
             mid-session switch to reduced motion leaves a clean hairline. */
          path.setAttribute('d', STATIC_D)
          bead?.setAttribute('transform', BEAD_REST)
        }
      },
    )

    return () => mm.revert()
  }, [])

  return (
    <div className="seam" ref={rootRef} aria-hidden="true">
      <svg
        ref={svgRef}
        className="seam-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="100">
            <stop offset="0" stopColor="#C0824F" />
            <stop offset="0.25" stopColor="#5C1F2E" />
            <stop offset="0.5" stopColor="#A83B55" />
            <stop offset="0.75" stopColor="#5C1F2E" />
            <stop offset="1" stopColor="#C0824F" />
          </linearGradient>
          <radialGradient id={bloomId}>
            <stop offset="0" stopColor="#A83B55" stopOpacity="0.95" />
            <stop offset="0.45" stopColor="#C0824F" stopOpacity="0.5" />
            <stop offset="1" stopColor="#5C1F2E" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* One geometry, three passes. */}
        <g className="seam-halo">
          <path
            ref={pathRef}
            id={`seam-src-${uid}`}
            d={STATIC_D}
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        </g>
        <g className="seam-glow">
          <use href={`#seam-src-${uid}`} />
        </g>
        <g className="seam-line" stroke={`url(#${gradId})`}>
          <use href={`#seam-src-${uid}`} />
        </g>

        {/* The scroll indicator dot */}
        <g className="seam-bead" ref={beadRef} transform={BEAD_REST}>
          <circle className="seam-ring" r="8" />
          <circle className="seam-hot" r="4.5" />
        </g>
      </svg>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   LineRise — the house reveal. Text comes up out of a mask, line by line.

   Written by hand rather than with SplitText: no plugin, no licence, and we
   control exactly what happens when the measurement is wrong. Every failure
   path in here ends with readable text.
   ═══════════════════════════════════════════════════════════════════════ */

const W_CLASS = 'lr-w'

/* Wrap every word in a measurable span and return the units in document
   order. Element children (an .iris-phrase, an <em>) are kept whole and
   measured as one unit — .iris-phrase is nowrap by design, so it never
   straddles two lines. Anything that does wrap internally is caught by the
   height guard below and sent to the fallback. */
function wrapWords(el) {
  const units = []
  const kids = Array.from(el.childNodes)
  for (const node of kids) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue
      if (!text) continue
      if (!text.trim()) {
        /* Whitespace between two inline elements is a real word gap. Normalise
           it rather than dropping it, or "brass and grain" becomes "brassand". */
        node.nodeValue = ' '
        continue
      }
      const frag = document.createDocumentFragment()
      for (const part of text.split(/(\s+)/)) {
        if (!part) continue
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(' '))
          continue
        }
        const s = document.createElement('span')
        s.className = W_CLASS
        s.textContent = part
        frag.appendChild(s)
        units.push(s)
      }
      el.replaceChild(frag, node)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'BR') {
        units.push(node)
        continue
      }
      node.classList.add(W_CLASS)
      units.push(node)
    }
  }
  return units
}

function buildLines(el) {
  const units = wrapWords(el)
  if (!units.length) throw new Error('lr: nothing to split')

  const cs = getComputedStyle(el)
  const fs = parseFloat(cs.fontSize) || 16
  const lh = parseFloat(cs.lineHeight) || fs * 1.2

  /* One measurement pass, no interleaved writes — a single forced layout. */
  const measured = []
  for (const u of units) {
    if (u.tagName === 'BR') {
      measured.push(null)
      continue
    }
    const h = u.offsetHeight
    /* A unit taller than one-and-a-half lines has wrapped inside itself, which
       means grouping by vertical position is meaningless. Bail out loudly. */
    if (h > lh * 1.7) throw new Error('lr: unit spans multiple lines')
    measured.push(u.offsetTop + h / 2)
  }

  const groups = []
  let cur = null
  let ref = 0
  for (let i = 0; i < units.length; i++) {
    const mid = measured[i]
    if (mid === null) {
      cur = null
      continue
    }
    /* Group on the vertical centre with half a line of tolerance, not on a
       raw offsetTop match — an accent span at a different size sits on the
       same line but not at the same top. */
    if (!cur || Math.abs(mid - ref) > lh * 0.5) {
      cur = []
      groups.push(cur)
      ref = mid
    }
    cur.push(units[i])
  }
  if (!groups.length) throw new Error('lr: no lines resolved')

  /* Hard breaks did their job during measurement; leaving them between block
     masks would add an empty line box. */
  for (const u of units) if (u.tagName === 'BR') u.remove()

  const inners = []
  for (const group of groups) {
    const first = group[0]
    const last = group[group.length - 1]
    const mask = document.createElement('span')
    mask.className = 'lr-line'
    const inner = document.createElement('span')
    inner.className = 'lr-in'
    el.insertBefore(mask, first)
    /* A Range carries the inter-word text nodes across too, so spacing and
       any nested markup survive the move intact. */
    const range = document.createRange()
    range.setStartBefore(first)
    range.setEndAfter(last)
    inner.appendChild(range.extractContents())
    range.detach?.()
    mask.appendChild(inner)
    inners.push(inner)
  }
  return inners
}

export function LineRise({ children, as = 'p', className = '', delay = 0, ...rest }) {
  const ref = useRef(null)

  useIsoEffect(() => {
    if (reduced()) return undefined
    const el = ref.current
    if (!el) return undefined

    const original = el.innerHTML
    let dead = false
    let tween = null
    let net = 0

    const start = () => {
      if (dead || !ref.current) return
      let inners = null
      try {
        inners = buildLines(el)
      } catch {
        /* Splitting failed — restore the untouched markup and fall back to a
           whole-block fade. The reveal is decoration; the words are not. */
        el.innerHTML = original
        inners = null
      }

      if (inners && inners.length) {
        /* The mask bleeds past the line box on both sides so display type with
           a sub-1 line-height keeps its ascenders and descenders. That bleed
           is read back from the used style, so the seed offset can clear the
           taller mask exactly instead of guessing. */
        const bleed = parseFloat(getComputedStyle(inners[0].parentNode).paddingTop) || 0
        const h = inners[0].offsetHeight || 1
        const seed = 108 + (100 * bleed) / h

        /* A hair of rotation about the bottom-left corner: the line lands from
           the left, the way a hand sets a rule down. Nothing swings above the
           mask because a positive angle pushes the far end further down. */
        gsap.set(inners, { yPercent: seed, rotate: 0.9, transformOrigin: '0% 100%' })
        tween = gsap.to(inners, {
          yPercent: 0,
          rotate: 0,
          duration: 1.05,
          delay,
          ease: 'atelys',
          stagger: 0.075,
          /* At rest the natural transform is identity, so dropping it entirely
             leaves nothing composited after the reveal is done. */
          clearProps: 'transform',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      } else {
        tween = gsap.from(el, {
          opacity: 0,
          y: 20,
          duration: 0.9,
          delay,
          ease: 'atelys',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      }

      /* Last line of defence. If the trigger never fires — mounted inside a
         hidden panel, a refresh missed during a route change — release the
         mask anyway rather than leave a paragraph unreadable. */
      net = window.setTimeout(() => {
        if (!tween || tween.progress() > 0) return
        const r = el.getBoundingClientRect()
        if (r.top < window.innerHeight && r.bottom > 0) tween.play()
      }, 2600)
    }

    /* Line boxes measured against a fallback font group differently from the
       real one. Wait only when there is something left to load. */
    if (typeof document !== 'undefined' && document.fonts && document.fonts.status !== 'loaded') {
      /* Same handler on both settlements: a font that failed to load is still
         a reason to measure and reveal, never a reason to stay hidden. */
      document.fonts.ready.then(start, start)
    } else {
      start()
    }

    return () => {
      dead = true
      if (net) window.clearTimeout(net)
      tween?.scrollTrigger?.kill()
      tween?.kill()
      if (ref.current) ref.current.innerHTML = original
    }
  }, [delay])

  return createElement(as, { ref, className, ...rest }, children)
}
