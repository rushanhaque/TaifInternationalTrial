import { useEffect, useRef, useState } from 'react'
import { useCart } from '../../lib/cart'

/* ── THE SPEC DOCK ──────────────────────────────────────────────────────────
   A product page asks the buyer to scroll through finishes, a dimensioned
   drawing and related pieces — and the moment they do, the figures they are
   judging all this against scroll off the top. The numbers should stay with
   the read.

   So once the spec list leaves the screen, a slim dock takes its place: the
   piece, its material, the three figures that decide a purchase (dimensions,
   MOQ, lead) and the enquiry action. It retires again near the footer, where
   the page is handing over to navigation and a floating bar would just be in
   the way.

   NO IntersectionObserver. IO shares the rendering pipeline with rAF, so in a
   starved or backgrounded tab it stops firing — measured at 0 callbacks in
   exactly that state — and the dock would either never appear or never leave.
   A throttled scroll handler plus getBoundingClientRect is driven by the task
   queue instead, which keeps running. Same lesson as the reveal guard.

   FAIL-OPEN: every figure here is also in the spec list at the top of the
   page. If this never mounts, nothing is lost. */

export default function SpecDock({ piece }) {
  const [shown, setShown] = useState(false)
  const tick = useRef(0)
  const { add, has, setOpen } = useCart()

  useEffect(() => {
    let raf = 0
    const evaluate = () => {
      const list = document.querySelector('.spec-list')
      const foot = document.querySelector('footer, .foot')
      if (!list) return
      const lr = list.getBoundingClientRect()
      /* past the figures at the top … */
      const past = lr.bottom < 8
      /* … but not yet into the footer, where it would only be in the way */
      const nearFoot = foot
        ? foot.getBoundingClientRect().top < window.innerHeight - 40
        : false
      setShown(past && !nearFoot)
    }

    const onScroll = () => {
      const now = Date.now()
      if (now - tick.current < 120) {
        clearTimeout(raf)
        raf = setTimeout(evaluate, 120)   // trailing call: never miss the last scroll
        return
      }
      tick.current = now
      evaluate()
    }

    const boot = setTimeout(evaluate, 400)

    /* A TIMER, NOT ONLY SCROLL. Scroll events are dispatched as part of the
       browser's rendering steps, so when frames stop the events stop with
       them — measured here: window.scrollY moved from 0 to 1900 and BOTH
       window and document fired exactly zero scroll events, so the dock
       stayed retired the whole way down a page it should have followed.

       The listener stays because it is what makes the dock feel instant when
       frames are healthy; the interval is what makes it correct when they are
       not. Two getBoundingClientRect reads every 300ms is nothing. */
    const poll = setInterval(evaluate, 300)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      clearTimeout(boot)
      clearTimeout(raf)
      clearInterval(poll)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [piece.slug])

  const inCart = has(piece.slug)

  return (
    <div className={`sd ${shown ? 'is-up' : ''}`} role="region" aria-label={`${piece.name} — specification`}>
      <div className="sd-in">
        <span className={`sd-chip tone-${piece.tone}`} aria-hidden="true" />
        <span className="sd-name">{piece.name}</span>
        <span className="sd-mat meta">{piece.material}</span>

        <dl className="sd-figs">
          <div><dt className="meta">Dims</dt><dd>{piece.dims}</dd></div>
          <div><dt className="meta">MOQ</dt><dd>{piece.moq}</dd></div>
          <div><dt className="meta">Lead</dt><dd>{piece.lead}</dd></div>
        </dl>

        <button
          type="button"
          className={`sd-add ${inCart ? 'is-in' : ''}`}
          onClick={() => (inCart ? remove(piece.slug) : add(piece))}
          /* the dock is off-screen when retired; keep it out of the tab order
             so focus never lands on a control nobody can see */
          tabIndex={shown ? 0 : -1}
        >
          {inCart ? 'In your cart' : 'Add to cart'}
        </button>
      </div>
    </div>
  )
}
