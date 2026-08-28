import { useCallback, useEffect, useRef, useState } from 'react'
import SmartImage from './SmartImage'
import { productShots } from '../data/images'
import '../styles/product-gallery.css'

/* ============ ProductGallery ============
   The photographs on a product page: up to four, one at a time, with arrows,
   a thumbnail strip and a swipe.

   THREE THINGS IT IS CAREFUL ABOUT

   1. THE FIRST PHOTOGRAPH STAYS THE LCP. Only slide 0 is rendered at full
      size on load — it keeps the `priority` hint the single hero had, so the
      Largest Contentful Paint on this route is what it was before the gallery
      existed. The other three are mounted on the first sign the visitor wants
      them (a hover, a touch, a focus, an arrow), so a buyer who reads the
      spec and leaves never downloads them at all.

      This is why the slides are gated in JS rather than left to
      `loading="lazy"`: a slide translated off to the side is inside the
      scroll viewport as far as some engines are concerned, and lazy loading
      is a hint either way. A slide that is not rendered cannot be fetched.

   2. NO EMPTY FRAME BETWEEN SLIDES. The strip already holds every thumbnail
      — a few kB each, written by the upload pipeline — so a slide arriving
      for the first time paints its thumbnail out of cache immediately and
      sharpens as the full image decodes. SmartImage does that cross-fade.

   3. THE TRANSFORM IS NOT REACT STATE. A drag writes the track's transform
      straight to the node; only the settled index is state. Rendering four
      slides per pointermove is the difference between a gallery that tracks
      the finger and one that stutters on a mid-range phone.

   Reduced motion is honoured in the stylesheet: the slide still changes, it
   simply does not travel.                                                   */

/* How far a drag must travel before it counts as a swipe rather than a tap:
   a fraction of the stage, clamped, so it feels the same on a phone and on a
   wide desktop stage. */
const commitDistance = (w) => Math.min(96, Math.max(36, w * 0.18))

/* Below this the pointer has not said whether it means to swipe the gallery
   or scroll the page, and claiming it early would break vertical scrolling. */
const AXIS_LOCK = 7

const Chevron = ({ back }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={back ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
  </svg>
)

export default function ProductGallery({ product, tone = 'brass', ratio = '7/5' }) {
  const shots = productShots(product)
  const total = shots.length
  const many = total > 1
  const name = product?.name || ''

  const [index, setIndex] = useState(0)
  /* The same number as `index`, readable synchronously.

     React batches, so two arrow presses inside one task both run against the
     index of the render they were queued from — press Next twice quickly, or
     hold the arrow key down, and the gallery advances once. The ref is the
     live value every handler steps from; `index` stays the render's value and
     is what the markup reads. */
  const idx = useRef(0)
  /* which slides have been rendered at full size. Slide 0 always; the rest
     once the visitor shows any interest — see note 1 above. */
  const [mounted, setMounted] = useState(() => new Set([0]))
  const stage = useRef(null)
  const track = useRef(null)
  const drag = useRef(null)

  /* Paint the settled position. Kept out of the style prop on purpose: the
     drag writes to this same property directly, and React would not know to
     put it back if the value it last rendered had not changed. */
  const settle = useCallback((n) => {
    const el = track.current
    if (!el) return
    el.style.transition = ''
    el.style.transform = `translate3d(${-n * 100}%, 0, 0)`
  }, [])

  useEffect(() => {
    /* An admin editing this product in another tab can take a photograph
       away while the page is open (the content store broadcasts across tabs),
       which would leave the track parked past the last slide showing nothing.
       Step back to a slide that exists. */
    if (index > total - 1) {
      idx.current = total - 1
      setIndex(total - 1)
      return
    }
    idx.current = index
    settle(index)
  }, [index, total, settle])

  const warm = useCallback(() => {
    setMounted((m) => {
      if (m.size >= total) return m
      const next = new Set(m)
      for (let n = 0; n < total; n += 1) next.add(n)
      return next
    })
  }, [total])

  /* Clamped, not wrapping. The slides live on one track, so a wrap from the
     last back to the first would sweep the whole strip backwards — which
     reads as a glitch rather than a loop. */
  const go = useCallback((n) => {
    const next = Math.max(0, Math.min(total - 1, n))
    idx.current = next
    setMounted((m) => (m.has(next) ? m : new Set(m).add(next)))
    setIndex(next)
    settle(next)
  }, [total, settle])

  /* ── swipe ───────────────────────────────────────────────────────────── */
  const onPointerDown = (e) => {
    if (!many) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    warm()
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, axis: null }
  }

  const onPointerMove = (e) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return

    const dx = e.clientX - d.x
    if (d.axis === null) {
      const dy = e.clientY - d.y
      if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return
      d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      if (d.axis === 'x') {
        /* keep receiving the pointer even if it leaves the stage, so a fast
           swipe that runs off the edge still finishes rather than sticking */
        try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* unsupported */ }
        stage.current?.classList.add('is-dragging')
      }
    }
    if (d.axis !== 'x') return

    /* rubber-band past the ends — the resistance is what says "there is
       nothing more this way" without disabling the gesture */
    const at = idx.current
    const atEdge = (at === 0 && dx > 0) || (at === total - 1 && dx < 0)
    d.dx = dx
    const el = track.current
    if (!el) return
    const offset = (atEdge ? dx * 0.26 : dx).toFixed(1)
    el.style.transition = 'none'
    el.style.transform = `translate3d(calc(${-at * 100}% + ${offset}px), 0, 0)`
  }

  const endDrag = (e) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    stage.current?.classList.remove('is-dragging')
    if (d.axis !== 'x') return

    const threshold = commitDistance(stage.current?.clientWidth || 1)
    if (d.dx <= -threshold) go(idx.current + 1)
    else if (d.dx >= threshold) go(idx.current - 1)
    else settle(idx.current)
  }

  const onKeyDown = (e) => {
    if (!many) return
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx.current - 1) }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(idx.current + 1) }
  }

  return (
    <div
      className={`pg${many ? ' pg--multi' : ''}`}
      onKeyDown={onKeyDown}
      {...(many
        ? { role: 'group', 'aria-roledescription': 'carousel', 'aria-label': `${name} photographs` }
        : {})}
    >
      <div
        ref={stage}
        className={`pg-stage tone-${tone}`}
        style={{ aspectRatio: ratio }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={many ? warm : undefined}
        onFocusCapture={many ? warm : undefined}
      >
        <div ref={track} className="pg-track">
          {shots.map((shot, n) => (
            <div
              key={shot.key}
              className="pg-slide"
              aria-hidden={n !== index ? 'true' : undefined}
              {...(many
                ? { role: 'group', 'aria-roledescription': 'slide', 'aria-label': `${n + 1} of ${total}` }
                : {})}
            >
              {mounted.has(n) ? (
                <SmartImage
                  className="pg-shot"
                  wrapClassName="si--fill"
                  src={shot.src}
                  thumb={shot.thumb}
                  alt={n === 0 ? name : `${name} — photograph ${n + 1}`}
                  /* exactly one priority image per screenful, or the hint
                     means nothing — see SmartImage */
                  priority={n === 0}
                  sizes="(max-width: 900px) 100vw, 50vw"
                  draggable="false"
                />
              ) : (
                /* not yet wanted: the thumbnail alone, so the slide is never
                   an empty box if it is reached before warm() has run */
                <img
                  className="pg-shot pg-shot--ghost"
                  src={shot.thumb || shot.src}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              )}
            </div>
          ))}
        </div>

        {many && (
          <>
            <button
              type="button"
              className="pg-nav pg-nav--prev"
              onClick={() => go(idx.current - 1)}
              disabled={index === 0}
              aria-label="Previous photograph"
            >
              <Chevron back />
            </button>
            <button
              type="button"
              className="pg-nav pg-nav--next"
              onClick={() => go(idx.current + 1)}
              disabled={index === total - 1}
              aria-label="Next photograph"
            >
              <Chevron />
            </button>
            <p className="pg-count meta" aria-live="polite">{index + 1} / {total}</p>
          </>
        )}
      </div>

      {many && (
        <div className="pg-strip">
          {shots.map((shot, n) => (
            <button
              key={shot.key}
              type="button"
              className="pg-dot"
              aria-current={n === index ? 'true' : undefined}
              aria-label={`Show photograph ${n + 1} of ${total}`}
              onMouseEnter={warm}
              onClick={() => go(n)}
            >
              <img src={shot.thumb || shot.src} alt="" loading="lazy" decoding="async" draggable="false" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
