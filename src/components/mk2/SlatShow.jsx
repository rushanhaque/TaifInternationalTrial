import { useCallback, useEffect, useRef, useState } from 'react'
import { ABOUT_SLIDES } from '../../data/site'
import { reduced } from '../../lib/gsap'
import '../../styles/mk2/slatshow.css'

/* ── SECTION 1 · THE ABOUT SLIDESHOW ────────────────────────────────────────
   Four frames — introduction, story, bespoke, the director. Copy, photographs
   and shot briefs all live in ABOUT_SLIDES in data/site.js.

   THE LAYOUT is one image running the full bleed of the frame with the copy
   set over it, rather than a picture panel butted against a text panel. The
   two halves are separated by a GRADIENT, not an edge: the scrim is nearly
   solid at the left margin where the paragraphs sit and clears completely by
   the right third, so the photograph is the ground of the whole frame and
   there is no seam anywhere for the eye to catch on.

   THE TRANSITION is tiny-slider's `gallery` mode — a crossfade, not a
   dissolve. The incoming frame stacks ABOVE the outgoing one and fades up
   from nothing over 1000ms while the old one waits underneath at full
   opacity, so the change never dips through the page background. The copy
   then rises 40px into place on a stagger, and the photograph drifts slowly
   in scale for as long as the frame is held.

   THE STAGE is a one-cell grid holding all four frames, so its height is that
   of the tallest and advancing never reflows the page.

   FAIL-OPEN: the first frame is the one at opacity 1 in the resting CSS, so
   with no JS the section is a still spread rather than an empty box.
   `prefers-reduced-motion` cuts every transition, the drift and the rise. */

const SLIDES = ABOUT_SLIDES

const SPEED = 1000
const DWELL = 11000

export default function SlatShow() {
  const [current, setCurrent] = useState(0)
  /* the frame still holding the visible pixels underneath the one fading in */
  const [outgoing, setOutgoing] = useState(null)
  const [paused, setPaused] = useState(false)
  const settle = useRef(null)

  const go = useCallback((next) => {
    if (next === current) return
    if (!reduced()) setOutgoing(current)
    setCurrent(next)
  }, [current])

  /* Retire the outgoing frame once the incoming one is fully opaque. Any
     earlier and the page background shows through the half-faded picture. */
  useEffect(() => {
    if (outgoing === null) return undefined
    clearTimeout(settle.current)
    settle.current = setTimeout(() => setOutgoing(null), SPEED)
    return () => clearTimeout(settle.current)
  }, [outgoing, current])

  const next = useCallback(() => go((current + 1) % SLIDES.length), [current, go])
  const prev = useCallback(() => go((current - 1 + SLIDES.length) % SLIDES.length), [current, go])

  /* A frame has only the transition's length to arrive, which is not long
     enough to fetch a photograph over a slow connection. */
  useEffect(() => {
    SLIDES.forEach((s) => { if (s.image?.src) new Image().src = s.image.src })
  }, [])

  useEffect(() => {
    if (paused) return undefined
    const t = setTimeout(next, DWELL)
    return () => clearTimeout(t)
  }, [next, paused])

  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next() }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
  }

  return (
    <section className="ss-section" id="section-1" aria-label="About Taif International">
      <div className="wrap">
        <div
          className="ss-frame"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onKeyDown={onKey}
          tabIndex={0}
          role="group"
          aria-roledescription="slideshow"
          aria-label="About Taif International"
        >
          <div className="ss-stage">
            {SLIDES.map((s, i) => (
              <article
                className={`ss-slide${i === current ? ' is-on' : ''}${i === outgoing ? ' is-out' : ''}`}
                key={s.no}
                aria-hidden={i !== current ? 'true' : undefined}
                /* keeps the three hidden frames out of the tab order and off
                   the screen-reader's path. String rather than boolean —
                   React 18 warns on a boolean for a non-boolean attribute. */
                {...(i !== current ? { inert: '' } : {})}
              >
                <img
                  className="ss-img"
                  src={s.image.src}
                  alt={s.image.alt}
                  draggable="false"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  style={{ objectPosition: s.image.focus }}
                />
                <div className="ss-scrim" aria-hidden="true" />

                <div className="ss-copy">
                  <p className="meta ss-kicker">
                    <span className="ss-kicker__no">{s.no}</span>
                    <span className="ss-kicker__rule" aria-hidden="true" />
                    {s.kicker}
                  </p>

                  <h3 className="ss-title">{s.title}</h3>

                  <p className="ss-lede">{s.lede}</p>

                  {s.paras.map((p) => (
                    <p className="ss-para" key={p.slice(0, 24)}>{p}</p>
                  ))}

                  {s.quote && (
                    <blockquote className="ss-quote">
                      <p className="ss-quote__text">{s.quote}</p>
                      <cite className="meta ss-quote__cite">{s.attribution}</cite>
                    </blockquote>
                  )}

                  <ul className="ss-facts">
                    {s.facts.map((f) => (
                      <li className="meta ss-fact" key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          {/* controls ride on the picture, bottom right — a control bar slung
              under the box is the other half of what read as dated */}
          <div className="ss-controls">
            <div className="ss-dots">
              {SLIDES.map((s, i) => (
                <button
                  key={s.no}
                  type="button"
                  className={`ss-dot ${i === current ? 'is-on' : ''}`}
                  onClick={() => go(i)}
                  aria-label={s.kicker}
                  aria-current={i === current ? 'true' : undefined}
                />
              ))}
            </div>

            <div className="ss-arrows">
              <button type="button" className="ss-arrow" onClick={prev} aria-label="Previous frame">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10 2 4 8l6 6" />
                </svg>
              </button>
              <button type="button" className="ss-arrow" onClick={next} aria-label="Next frame">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 2l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>

          <p className="sr-only" role="status">
            {`${current + 1} of ${SLIDES.length} — ${SLIDES[current].kicker}`}
          </p>
        </div>
      </div>
    </section>
  )
}
