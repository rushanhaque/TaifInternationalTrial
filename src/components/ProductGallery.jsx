import { useCallback, useEffect, useRef, useState } from 'react'
import SmartImage from './SmartImage'
import { productShots } from '../data/images'
import '../styles/product-gallery.css'

/* ============ ProductGallery ============
   A product's photographs, split across the two columns of the page: the
   stage sits on the left under the piece itself, and the row of view cards
   sits on the right, under its name and description, in the rhythm of the
   spec list below it.

   That is why this file exports a HOOK and two components rather than one
   component. The stage and the cards are one control — the same index, the
   same preload set, the same keyboard — but they render into two different
   places in the page's grid, which no single element can do without a
   portal. `useProductGallery` holds the state; the two pieces read it.

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

   2. NO EMPTY FRAME BETWEEN SLIDES. The cards already hold every thumbnail —
      a few kB each, written by the upload pipeline — so a slide arriving for
      the first time paints its thumbnail out of cache immediately and
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

/* ── the shared state ─────────────────────────────────────────────────────── */
export function useProductGallery(product) {
  const shots = productShots(product)
  const total = shots.length
  const slug = product?.slug

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

  /* Moving to another product must start at its first photograph rather than
     on whichever slide the last piece was left on. */
  const lastSlug = useRef(slug)
  useEffect(() => {
    if (lastSlug.current === slug) return
    lastSlug.current = slug
    idx.current = 0
    setIndex(0)
    setMounted(new Set([0]))
  }, [slug])

  useEffect(() => {
    /* No product at all — the page is about to render its not-found state.
       The hook still has to run (it sits above that guard, so the hook order
       stays fixed), but there is nothing to settle. */
    if (!total) return
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

  const step = useCallback((d) => go(idx.current + d), [go])

  const onKeyDown = useCallback((e) => {
    if (total < 2) return
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
  }, [total, step])

  /* ── swipe ───────────────────────────────────────────────────────────── */
  const onPointerDown = (e) => {
    if (total < 2) return
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
    if (d.dx <= -threshold) step(1)
    else if (d.dx >= threshold) step(-1)
    else settle(idx.current)
  }

  return {
    shots, total, many: total > 1, index, mounted,
    name: product?.name || '',
    go, step, warm, onKeyDown,
    stage, track,
    pointer: {
      onPointerDown, onPointerMove,
      onPointerUp: endDrag, onPointerCancel: endDrag,
    },
  }
}

/* ── arrows ──────────────────────────────────────────────────────────────────
   One cluster, not two buttons thrown at opposite edges of the picture.

   Two floating circles is what every carousel on the internet does, and it
   puts the two halves of a single decision as far apart as the frame allows.
   Joining them into one unit — split by a hairline, squared to the same
   radius as the frame it sits in — reads as an instrument belonging to this
   page rather than a widget dropped on top of it, and it halves the distance
   the hand travels between one photograph and the next.                     */
const Chevron = ({ back }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={back ? 'M14.5 5.5 8 12l6.5 6.5' : 'M9.5 5.5 16 12l-6.5 6.5'} />
  </svg>
)

export function GalleryStage({ api, tone = 'brass', ratio = '7/5' }) {
  const { shots, total, many, index, mounted, name, step, warm, onKeyDown, stage, track, pointer } = api

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
        onPointerEnter={many ? warm : undefined}
        onFocusCapture={many ? warm : undefined}
        {...pointer}
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
          <div className="pg-nav">
            <button
              type="button"
              className="pg-nav-btn"
              onClick={() => step(-1)}
              disabled={index === 0}
              aria-label="Previous photograph"
            >
              <Chevron back />
            </button>
            <span className="pg-nav-split" aria-hidden="true" />
            <button
              type="button"
              className="pg-nav-btn"
              onClick={() => step(1)}
              disabled={index === total - 1}
              aria-label="Next photograph"
            >
              <Chevron />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── the view cards ──────────────────────────────────────────────────────────
   A rule and a small caption over a row of four, which is the same shape the
   spec list underneath it uses. That is the whole idea: on the right-hand
   column these are not a carousel accessory, they are one more block of the
   piece's record, set in the same rhythm as everything around them.        */
export function GalleryViews({ api }) {
  const { shots, total, index, name, go, warm, onKeyDown } = api
  if (total < 2) return null

  return (
    <div className="pg-views" onKeyDown={onKeyDown} onMouseEnter={warm}>
      <p className="meta pg-views-label">
        Views<span aria-hidden="true"> · {String(total).padStart(2, '0')}</span>
      </p>
      <div className="pg-views-row">
        {shots.map((shot, n) => (
          <button
            key={shot.key}
            type="button"
            className="pg-view"
            aria-current={n === index ? 'true' : undefined}
            aria-label={`Show photograph ${n + 1} of ${total} of ${name}`}
            onClick={() => go(n)}
          >
            <img src={shot.thumb || shot.src} alt="" loading="lazy" decoding="async" draggable="false" />
            <span className="pg-view-mark" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  )
}
