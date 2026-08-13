import { useEffect } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { useRoute } from '../../lib/router'

/* ── the reveal guard ───────────────────────────────────────────────────────
   Scroll reveals across this site seed elements at opacity 0 and rely on a
   ScrollTrigger firing to bring them back. If a trigger never fires — a JS
   error in a sibling, a starved frame clock, a mis-measured pin, a resize
   mid-load — the content is not merely un-animated, it is INVISIBLE, and the
   reader has no way to recover it. This is the backstop.

   IT MUST NOT DEPEND ON THE MACHINERY IT IS GUARDING. An earlier version
   used an IntersectionObserver, which was wrong: IO is driven by the same
   rendering pipeline as rAF, so in the exact scenario the guard exists for —
   a starved frame clock — the reveal and its guard fail together. Measured
   in a throttled pane: rAF 0 frames, IO 0 callbacks, while timers and scroll
   events kept running normally.

   So the guard runs on the task queue instead: a few sweeps after the route
   settles, plus a throttled sweep on scroll. Both are independent of the
   compositor, which is what makes them a real fallback.

   Conservative by design — only ever makes things MORE visible, skips
   anything mid-tween, and respects elements meant to be hidden. If it is
   ever seen doing work, the reveal it rescued has a real bug; the visitor
   still reads the page. */

const CANDIDATES = [
  '[class*="tl-"]', '[class*="rig-"]', '[class*="pl-"]', '[class*="cat-"]',
  '[class*="qs-"]', '[class*="cix-"]', '[class*="tf-"]', '[class*="smp-"]',
  '[class*="rq-"]', '[class*="shows-"]', '[class*="tm-"]', '[class*="care-"]',
  '.wrap > *', '.grid > *',
  'section p', 'section h1', 'section h2', 'section h3', 'section li',
].join(',')

const SWEEP_MS = 1500      // spacing of the boot sweeps
const BOOT_SWEEPS = 5      // ~7.5s of cover while the page settles
const SCROLL_THROTTLE = 450

export default function RevealGuard() {
  const { path } = useRoute()

  useEffect(() => {
    let lastSweep = 0
    let sweeps = 0
    let bootId = null

    /* Elements seen transparent on a previous sweep. A HEALTHY reveal
       finishes inside one sweep interval, so it is never seen twice; a
       STALLED one persists and is rescued on its second sighting.

       This two-strike rule replaced a plain `gsap.isTweening()` skip, which
       was exactly backwards: a tween that exists but never advances reports
       as "in flight" forever, so the guard permanently excused the stalled
       tweens it was built to catch. Measured: two rows stayed invisible
       through every sweep until this changed. */
    const seenStranded = new WeakSet()

    const strandedIn = (el) => {
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden' || cs.display === 'none') return false
      if (parseFloat(cs.opacity) > 0.02) return false
      if (el.closest('[aria-hidden="true"]')) return false
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) return false
      /* only rescue what the reader can actually reach right now */
      const vh = window.innerHeight
      const reachable = r.top < vh * 1.25 && r.bottom > -vh * 0.25
      if (!reachable) return false

      /* first sighting: note it and give the tween one more interval */
      if (!seenStranded.has(el)) {
        /* a genuinely running tween gets the benefit of the doubt once */
        if (gsap.isTweening(el)) { seenStranded.add(el); return false }
        seenStranded.add(el)
        return false
      }
      return true
    }

    const sweep = () => {
      lastSweep = Date.now()
      let fixed = 0
      document.querySelectorAll(CANDIDATES).forEach((el) => {
        if (!strandedIn(el)) return
        gsap.set(el, { clearProps: 'opacity,visibility,transform' })
        fixed += 1
      })
      if (fixed && import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn(`[taif] reveal guard restored ${fixed} stranded element(s)`)
      }
    }

    /* scroll is the important one: it covers the whole life of the page, so
       anything the reader scrolls to later is protected too.

       The throttle must have a TRAILING call. A leading-only throttle drops
       the final scroll of a gesture — which is precisely the one that lands
       on new content — so an element could be scrolled to and never swept.
       Measured: consecutive rows stayed stranded until this was added. */
    let trailId = null
    const onScroll = () => {
      const since = Date.now() - lastSweep
      if (since >= SCROLL_THROTTLE) { sweep(); return }
      clearTimeout(trailId)
      trailId = setTimeout(sweep, SCROLL_THROTTLE - since)
    }

    const tick = () => {
      sweep()
      sweeps += 1
      if (sweeps < BOOT_SWEEPS) bootId = setTimeout(tick, SWEEP_MS)
    }

    const boot = setTimeout(() => {
      try { ScrollTrigger.refresh() } catch (_) { /* never let this throw */ }
      tick()
    }, 500)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      clearTimeout(boot)
      clearTimeout(bootId)
      clearTimeout(trailId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [path])

  return null
}
