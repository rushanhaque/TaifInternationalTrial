import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reduced } from '../../lib/gsap'
import { TESTIMONIALS } from '../../data/site'
import { getLenis } from '../../lib/useLenis'

/* QuoteStage — the testimonial stage.
   One buyer on screen at a time, set enormous on the one dark surface.
   Desktop pins the stage and scrubs the three reports past you; under
   900px the same three stack and reveal in flow. The resting stylesheet
   IS the stacked layout, so if this script never runs the section is
   still three readable quotes on espresso. */

const N = TESTIMONIALS.length

/* Timeline units, not seconds — the same numbers place the tweens, resolve
   the active index and aim the tick jumps, so those three can never drift
   apart. Three holds, two transitions. */
const HOLD = 1
const TRANS = 1.25
const TOTAL = HOLD * N + TRANS * (N - 1)
/* the index flips at the midpoint of each transition, where the incoming
   lines have cleared the mask and the outgoing ones are gone */
const SWITCH = Array.from({ length: N - 1 }, (_, i) => HOLD * (i + 1) + TRANS * (i + 0.5))
const CENTER = Array.from({ length: N }, (_, i) => HOLD * i + TRANS * i + HOLD * 0.5)

/* Words become masked pairs so lines can rise from behind a hard edge.
   Built here rather than in JSX: the resting DOM stays plain text. */
function splitWords(el) {
  const toks = el.textContent.trim().split(/\s+/)
  const frag = document.createDocumentFragment()
  const inners = []
  toks.forEach((tok, i) => {
    if (i) frag.appendChild(document.createTextNode(' ')) // real spaces keep copy/paste honest
    const mask = document.createElement('span')
    mask.className = 'qs-w'
    const inner = document.createElement('span')
    inner.className = 'qs-wi'
    inner.textContent = tok
    mask.appendChild(inner)
    frag.appendChild(mask)
    inners.push(inner)
  })
  el.textContent = ''
  el.appendChild(frag)
  return inners
}

/* Group words into visual lines by their measured offset. Wrapping is the
   browser's business, so we read it back rather than authoring line breaks;
   the grouping only drives stagger order, so a late font swap costs nothing. */
function groupLines(words) {
  const rows = []
  words.forEach((w) => {
    const top = w.parentElement.offsetTop
    const row = rows.find((r) => Math.abs(r.top - top) < 6) // subpixel drift within a line
    if (row) row.items.push(w)
    else rows.push({ top, items: [w] })
  })
  return rows.sort((a, b) => a.top - b.top).map((r) => r.items)
}

function scrollToY(y) {
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(y, { duration: 1.05 })
  else window.scrollTo({ top: y, behavior: reduced() ? 'auto' : 'smooth' })
}

export default function QuoteStage() {
  const rootRef = useRef(null)
  const pinRef = useRef(null) // the pinned ScrollTrigger, so the ticks can aim at it
  const [active, setActive] = useState(0)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const figs = gsap.utils.toArray(root.querySelectorAll('.qs-fig'))
    const texts = figs.map((f) => f.querySelector('.qs-text'))
    const marks = figs.map((f) => f.querySelector('.qs-mark'))
    const attrs = figs.map((f) => f.querySelector('.qs-attr-in'))
    const fills = gsap.utils.toArray(root.querySelectorAll('.qs-fill'))
    const halo = root.querySelector('.qs-halo')

    const source = texts.map((t) => t.textContent)
    const restore = () => texts.forEach((t, i) => { t.textContent = source[i] })
    /* splitWords reads textContent, so re-splitting already-split text is a
       no-op-safe rebuild. That matters: when a resize crosses 900px the two
       matchMedia contexts swap in whatever order the browser fires their
       listeners, so only the effect's own teardown puts the text back. */

    let shown = 0
    const show = (i) => { if (i !== shown) { shown = i; setActive(i) } }

    const mm = gsap.matchMedia()

    /* ── desktop · pinned, scrubbed cross-fade ─────────────────────────── */
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      root.classList.add('is-stage') // stacks the three figures into one cell
      const words = texts.map(splitWords)
      const lines = words.map(groupLines) // measured after is-stage, so the layout is final

      /* hidden states are seeded from JS only — never from the stylesheet */
      for (let i = 1; i < N; i++) {
        gsap.set(words[i], { yPercent: 130 })
        gsap.set([marks[i], attrs[i]], { opacity: 0 })
        gsap.set(attrs[i], { yPercent: 115 })
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.querySelector('.qs-stage'),
          pin: true,
          anticipatePin: 1,
          scrub: 0.8,
          start: 'top top',
          end: '+=1800',
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const t = self.progress * TOTAL
            let i = 0
            while (i < SWITCH.length && t >= SWITCH[i]) i++
            const lo = i === 0 ? 0 : SWITCH[i - 1]
            const hi = i === SWITCH.length ? TOTAL : SWITCH[i]
            const p = gsap.utils.clamp(0, 1, (t - lo) / (hi - lo))
            /* the live tick fills as you scroll through its report — it starts
               already longer than the others so "active" reads at p = 0 */
            fills.forEach((f, k) =>
              f.style.setProperty('--fill', k === i ? (0.34 + 0.66 * p).toFixed(3) : '0.16'))
            show(i)
          },
        },
      })

      /* one empty tween reserves the full length so the last report holds
         at the end of the pin instead of finishing early */
      tl.to({}, { duration: TOTAL }, 0)
      if (halo) tl.fromTo(halo, { xPercent: -6, yPercent: 3 },
        { xPercent: 6, yPercent: -3, ease: 'none', duration: TOTAL }, 0)

      for (let i = 0; i < N - 1; i++) {
        const at = HOLD * (i + 1) + TRANS * i
        const inAt = at + TRANS * 0.4

        /* outgoing: lines rise out and fade, top line leading */
        lines[i].forEach((ln, li) => {
          tl.to(ln, { yPercent: -130, opacity: 0, duration: TRANS * 0.5, ease: 'power2.in' },
            at + li * 0.05)
        })
        tl.to(marks[i], { opacity: 0, yPercent: -18, duration: TRANS * 0.45, ease: 'power1.in' }, at)
        tl.to(attrs[i], { yPercent: -115, opacity: 0, duration: TRANS * 0.4, ease: 'power2.in' }, at)

        /* incoming: lines rise in from below, behind the mask */
        lines[i + 1].forEach((ln, li) => {
          tl.to(ln, { yPercent: 0, duration: TRANS * 0.6, ease: 'atelys' }, inAt + li * 0.06)
        })
        tl.to(marks[i + 1], { opacity: 1, yPercent: 0, duration: TRANS * 0.55, ease: 'atelys' }, inAt)
        tl.to(attrs[i + 1], { yPercent: 0, opacity: 1, duration: TRANS * 0.5, ease: 'atelys' },
          inAt + 0.14)
      }

      pinRef.current = tl.scrollTrigger

      return () => {
        pinRef.current = null
        fills.forEach((f) => f.style.removeProperty('--fill'))
        root.classList.remove('is-stage')
      }
    })

    /* ── under 900px · no pin, the three stack and reveal in place ─────── */
    mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
      const words = texts.map(splitWords)
      const lines = words.map(groupLines)
      const trigs = []

      figs.forEach((fig, i) => {
        gsap.set(words[i], { yPercent: 120 })
        gsap.set([marks[i], attrs[i]], { opacity: 0 })
        gsap.set(attrs[i], { yPercent: 80 })

        const tl = gsap.timeline({
          scrollTrigger: { trigger: fig, start: 'top 80%', once: true },
        })
        tl.to(marks[i], { opacity: 1, duration: 0.9, ease: 'atelys' }, 0)
        lines[i].forEach((ln, li) => {
          tl.to(ln, { yPercent: 0, duration: 0.95, ease: 'atelys' }, 0.04 + li * 0.07)
        })
        tl.to(attrs[i], { yPercent: 0, opacity: 1, duration: 0.8, ease: 'atelys' }, 0.34)
        trigs.push(tl.scrollTrigger)
        /* reloaded halfway down the page: a report already on screen must not
           sit there waiting for a scroll event that never arrives */
        if (fig.getBoundingClientRect().top < window.innerHeight * 0.8) tl.progress(1)

        /* the tick rail still means something without a pin: whichever
           report owns the middle band of the screen is the live one */
        trigs.push(ScrollTrigger.create({
          trigger: fig,
          start: 'top 62%',
          end: 'bottom 42%',
          onToggle: (self) => { if (self.isActive) show(i) },
        }))
      })

      return () => trigs.forEach((t) => t && t.kill())
    })

    /* ── reduced motion · nothing moves, everything is already there ───── */
    mm.add('(prefers-reduced-motion: reduce)', () => {
      /* observing which quote is in view is state, not motion — it keeps
         the tick rail truthful without animating anything */
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          if (e.isIntersecting) show(figs.indexOf(e.target))
        }),
        { rootMargin: '-45% 0px -45% 0px' },
      )
      figs.forEach((f) => io.observe(f))
      return () => io.disconnect()
    })

    return () => { mm.revert(); restore(); pinRef.current = null }
  }, [])

  /* Ticks are controls, not decoration: they jump the scroll to the point
     in the pin (or the figure in flow) that owns that report. */
  const jump = (i) => {
    const st = pinRef.current
    if (st) scrollToY(st.start + (st.end - st.start) * (CENTER[i] / TOTAL))
    else {
      const fig = rootRef.current?.querySelectorAll('.qs-fig')[i]
      if (fig) scrollToY(window.scrollY + fig.getBoundingClientRect().top - window.innerHeight * 0.2)
    }
    setActive(i)
  }

  return (
    <section className="qs deep" ref={rootRef} aria-labelledby="qs-heading">
      <div className="qs-stage">
        <div className="qs-field" aria-hidden="true" />
        <div className="qs-halo" aria-hidden="true" />

        <div className="wrap qs-inner">
          <header className="qs-head">
            <div className="qs-head-l">
              <p className="meta qs-kicker">Field reports</p>
              <h2 className="d3 qs-h2" id="qs-heading">Three buyers, on the record.</h2>
            </div>
            <p className="qs-note">
              Eleven letters on file. These three waste the fewest words.
            </p>
          </header>

          <div className="qs-deck">
            {TESTIMONIALS.map((t, i) => (
              <figure className="qs-fig" key={t.org}>
                <span className="qs-mark" aria-hidden="true">&ldquo;</span>
                <blockquote className="qs-quote">
                  <p className="qs-text">{t.quote}</p>
                </blockquote>
                <figcaption className="qs-attr">
                  <span className="qs-attr-in">
                    <span className="qs-attr-rule" aria-hidden="true" />
                    <span className="meta qs-no">{String(i + 1).padStart(2, '0')}</span>
                    <span className="meta qs-who">{t.who}</span>
                    <span className="qs-dot" aria-hidden="true" />
                    <span className="meta qs-org">{t.org}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="qs-nav">
            <div className="qs-ticks" role="group" aria-label="Jump to a report">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={t.org}
                  type="button"
                  className={`qs-tick${i === active ? ' is-on' : ''}`}
                  onClick={() => jump(i)}
                  aria-current={i === active ? 'true' : undefined}
                  aria-label={`Report ${i + 1} of ${N} — ${t.who}, ${t.org}`}
                >
                  <span className="qs-track" aria-hidden="true">
                    <span className="qs-fill" />
                  </span>
                </button>
              ))}
            </div>
            <p className="meta qs-count" aria-hidden="true">
              <span className="qs-count-now">{String(active + 1).padStart(2, '0')}</span>
              <span className="qs-count-sep">/</span>
              <span className="qs-count-all">{String(N).padStart(2, '0')}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
