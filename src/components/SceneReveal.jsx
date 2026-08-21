import { useEffect } from 'react'
import { useRoute } from '../lib/router'

/* ── SCENE REVEAL ───────────────────────────────────────────────────────────
   Site-wide scroll entrances, for every width. Grew out of MobileReveal,
   which did this for phones only; the marking logic there was sound, so it
   is carried over rather than reinvented, and only the gesture vocabulary
   and the width gate have changed.

   It marks elements with data-sr (media | card | btn | head | text), gives
   each a --sr-i index for stagger and a --sr-x lateral drift, then adds
   `is-in` as they cross into view. The gestures themselves live in
   scene-motion.css.

   THE HIDDEN STATE IS OPT-IN. scene-motion.css only hides `[data-sr]` under
   `html.sr-anim`, and that class is added here — after mount, and only once
   an IntersectionObserver has actually been constructed. If this file never
   loads, throws, or runs on a browser without IO, the class is absent and
   the page renders plainly visible. Nothing here is load-bearing for reading
   the site; it can only ever add motion, never withhold content.

   Re-runs per route because the marked nodes are replaced on navigation. */

/* What gets which gesture.

   ORDER IS THE CONTRACT. Groups are applied outermost-thing-first: a media
   frame, then cards, then standalone controls, then headings, then loose
   text. Anything sitting INSIDE something already marked is skipped (see the
   descendant guard in the effect), so a card animates as one object rather
   than the card and its heading and its button each sliding separately —
   which reads as the card coming apart. That is also what lets the last two
   groups be broad enough to catch prose nobody enumerated. */
const GROUPS = [
  /* .tt-card is deliberately absent: The Turn pins its stage with a
     ScrollTrigger at every width, and a reveal transform on or around a
     pinned element corrupts the pin's measurements. */
  ['media', '.heritage-video-card, .craft-card-container, .hp-media'],
  [
    'card',
    [
      /* homepage */
      '.tm-card', '.about-stat-card', '.craft-process-item', '.phil-mark',
      '.countries-card', '.mrail-item',
      /* blogs and socials — the video cards are the grid cell, not the
         wrapper, so the cell is what should travel */
      '#instagram .grid > [class*="sp-"]', '.hero-video-wrapper',
      /* catalogue / collections / product */
      '.pl-card', '.cat-card', '.slab', '.cix-row', '.pcx-card',
      '.rail-card', '.fm-cell', '.dp',
      /* about / shows / partners / care / faq — class names verified by
         walking each page, not guessed */
      '.year-card', '.team-card', '.shows-event', '.shows-atelier-cell',
      '.faq-row', '.faq-group', '.prt-stat-cell', '.prt-cmp-pane',
      '.tl-item', '.ldg-row', '.care-card-head', '.loc-card',
      /* forms read as panels too — the contact page is otherwise inert */
      '.contact-form', '.contact-map-wrap', '.field',
    ].join(','),
  ],
  ['btn', '.btn, .czoom-schedule-btn, .hero-cta > *, .craft-cta > *'],

  /* TEXT IS STATIC, EVERYWHERE, BY REQUEST.
     There were two more groups here — 'head' (a horizontal wipe for
     headings) and 'text' (a vertical lift for loose copy) — and between
     them they claimed essentially every heading and paragraph on the site,
     which is why prose nobody had enumerated still faded in. They are gone
     rather than merely restyled: the hidden state is applied by MARKING an
     element (scene-motion.css hides `[data-sr]` under `html.sr-anim`), so
     leaving the groups in place and neutering the CSS would still take
     every heading to opacity 0 for a frame before putting it back.

     Not marking them at all is the only version with no flash in it.

     What remains — media, card, btn — are frames, panels and controls, not
     copy. A card carrying a heading still travels as one object; the
     heading does not animate independently, and nothing here fades text in
     on its own. The gestures for the two removed groups have been deleted
     from scene-motion.css alongside this. */
]

/* ── who already has an owner ───────────────────────────────────────────────
   GSAP writes INLINE opacity, and an inline style beats any stylesheet
   declaration. So an element animated by both systems ends up stranded at
   whichever opacity GSAP last wrote — which is 0 until its ScrollTrigger
   fires. One element, one owner.

   These are the classes rendered through CharCascade / SmoothReveal / Dilate
   in Reveal.jsx and through EditorialReveal (each begins with a gsap.set to
   opacity 0), the two families CollectionsMosaic animates itself, the rows
   MaterialRig animates, and the whole of The Turn, which is pinned.

   '.cw' is the whole collections elevation: its bays are wiped in by their own
   GSAP timeline and its plinth label remounts on every hover, so a scroll
   reveal on either would strand an element at opacity 0. */
const SKIP = [
  '.mega', '.principle-card', '.d1', '.d2',
  '.cw',
  '.sec-head .meta',
  '.cm-card', '.cm-title', '.cm-kicker',
  '.ed-container', '.rig-row',
  '.tt-stage', '.tt-rig',
].join(',')

export default function SceneReveal() {
  const route = useRoute()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (typeof IntersectionObserver === 'undefined') return

    const root = document.documentElement
    const marked = []

    /* Stagger is counted PER CONTAINER, not per group. Counted across the
       whole group, a broad selector burns through the cap on the first grid
       and every later element on the page inherits a flat half-second delay
       before it will move — pure latency, since each element reveals on its
       own intersection anyway.

       Per container the numbers mean what they should: siblings in a grid
       cascade against each other, and a lone heading in its own section is
       index 0 and moves at once. */
    const seen = new Map()

    /* mark first, in group order, skipping anything already claimed */
    for (const [kind, selector] of GROUPS) {
      let nodes
      try {
        nodes = document.querySelectorAll(selector)
      } catch {
        continue
      }
      for (const el of nodes) {
        if (el.hasAttribute('data-sr')) continue
        /* declared owner */
        if (el.matches(SKIP) || el.closest(SKIP)) continue
        /* and the general net: an inline opacity is GSAP's fingerprint, so
           anything already carrying one belongs to a tween, named or not.
           This works because page components' effects run before this one —
           React flushes child effects ahead of the parent's. */
        if (el.style.opacity !== '') continue
        /* DESCENDANT GUARD — an ancestor is already travelling, so this rides
           along with it. Without this the broad selectors below would
           re-animate every heading and paragraph already inside a card, and a
           card would visibly come apart as it arrived: the frame sliding on
           one curve while its own title slid on another. Checked from the
           PARENT so the element's own mark (set above) is not what matches. */
        if (el.parentElement?.closest('[data-sr]')) continue

        el.setAttribute('data-sr', kind)

        const parent = el.parentElement || document.body
        const n = seen.get(parent) || 0
        seen.set(parent, n + 1)
        /* cap it — past ~6 siblings the tail of a cascade reads as lag */
        el.style.setProperty('--sr-i', String(Math.min(n, 5)))

        /* LATERAL DRIFT, derived from where the element actually sits.
           An element on the left of the viewport enters from the left, one
           on the right from the right, and a full-width block — whose centre
           is the viewport's centre — gets no drift at all and simply lifts.
           So a grid assembles from its outer edges inward while a paragraph
           just rises, from one rule and no per-page configuration.

           Cards only: a heading drifting sideways reads as a typo, and a
           media frame drifting reads as a layout bug. */
        marked.push(el)
      }
    }

    if (!marked.length) return

    /* when each element was told to reveal — read by the hardening pass */
    const revealedAt = new Map()
    const hardened = new WeakSet()

    const reveal = (el) => {
      if (el.classList.contains('is-in')) return
      el.classList.add('is-in')
      revealedAt.set(el, Date.now())
    }

    /* THE LAST RESORT, and the one the rest of this file cannot provide.
       Every gesture here lands via a CSS TRANSITION, which needs frames. In a
       view that is not compositing — a backgrounded tab, a throttled or
       headless pane, a device that has stopped painting — `is-in` is applied,
       the landed state is declared, and the element still sits at opacity 0
       because no frame ever interpolates it there.

       RevealGuard cannot fix this one: it clears INLINE styles, and this
       opacity comes from a stylesheet. So the rescue has to be an inline
       write, which outranks the sheet. Measured, not theorised — a frozen
       pane holds `[data-sr].is-in` at opacity 0 and transform indefinitely. */
    const harden = (el) => {
      if (hardened.has(el)) return
      hardened.add(el)
      /* transition FIRST, and it is the load-bearing line. Writing opacity
         alone does not rescue anything: a transition is still declared on
         `.is-in`, so the new value simply starts another transition from the
         frozen one, and in a view with no frames that second transition is as
         stuck as the first. Killing the transition is what makes the
         remaining three declarations take effect in the same frame. */
      el.style.setProperty('transition', 'none', 'important')
      el.style.setProperty('opacity', '1', 'important')
      el.style.setProperty('transform', 'none', 'important')
      el.style.setProperty('clip-path', 'none', 'important')

      /* THEN GIVE THE TRANSITION BACK. The kill above only has to survive
         long enough for the three landed values to take effect in this
         frame — reading offsetHeight forces that recalculation, so by the
         next line they are committed.

         Left in place it was permanent, and it did not only disable the
         reveal: `transition: none !important` on the element outranks every
         stylesheet, so a card that had been hardened could never animate
         ANYTHING again. Card hovers across the site were snapping between
         states instead of easing, and the cause was invisible from the CSS
         because the winning declaration was written by this function.

         Removing it cannot un-land the element: opacity, transform and
         clip-path are still pinned inline with !important, so there is no
         value left for a transition to run from. */
      void el.offsetHeight
      el.style.removeProperty('transition')
    }

    /* ── LATERAL DRIFT, measured late ────────────────────────────────────
       An element on the left of the viewport enters from the left, one on
       the right from the right, and a full-width block — whose centre IS the
       viewport's centre — gets no drift and simply lifts. So a grid
       assembles from its outer edges inward while a paragraph just rises,
       from one rule and no per-page configuration.

       WIDTH GATE: drift is a statement about which side of the fold a card
       occupies, and a card spanning most of the viewport does not occupy a
       side. Ungated, a phone (where nearly every card is full-bleed) gave
       them all the same sideways shove — the whole page listing to one side,
       and content briefly pushed past the right edge in any container that
       does not clip.

       MEASURED AT REVEAL TIME, NOT AT MARK TIME. At mount the layout is not
       settled: images and webfonts have not landed and rails have not been
       laid out, so cards measure at zero or at full width and the gate
       rejects every one of them — 15 of 27 on the homepage, silently. By the
       time an element is intersecting, its geometry is real. */
    const measureDrift = (el) => {
      const vw = window.innerWidth || 1
      const r = el.getBoundingClientRect()
      if (!(r.width > 0 && r.width < vw * 0.7)) return
      const off = ((r.left + r.width / 2) / vw - 0.5) * 2   // -1 … 1
      const drift = Math.max(-1, Math.min(1, off)) * Math.min(26, vw * 0.05)
      if (Math.abs(drift) > 2) el.style.setProperty('--sr-x', `${drift.toFixed(1)}px`)
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const el = e.target
          io.unobserve(el)
          if (el.dataset.sr !== 'card') { reveal(el); continue }
          /* ONE FRAME between writing --sr-x and adding `is-in`. Both in the
             same task and the browser computes style once, never renders the
             drifted hidden state, and the card animates from x=0 — the value
             is written but has no effect. The rAF gives the hidden state a
             frame to exist in. If frames are frozen the rAF never fires and
             the sweep below reveals the card instead, un-drifted but
             visible, which is the right way for this to degrade. */
          measureDrift(el)
          requestAnimationFrame(() => reveal(el))
        }
      },
      /* POSITIVE bottom margin, not negative. A negative margin shrinks the
         effective viewport, so a trigger only fires once an element is
         already well inside it — for a section-height block like the
         Heritage masthead or its "Heritage" heading, that meant scrolling
         it most of the way into view before the entrance even STARTED, and
         only then paying the transition's own duration on top. The two
         stacked delays are what read as "takes too long to appear". A
         positive margin does the opposite: it extends the observed area
         below the real viewport edge, so the entrance is already running by
         the time the element is actually on screen. */
      { rootMargin: '0px 0px 12% 0px', threshold: 0.01 }
    )

    /* only now is hiding safe — the observer exists, so everything hidden is
       guaranteed to have something that can bring it back */
    root.classList.add('sr-anim')

    /* Observe everything, including whatever is already on screen — an
       IntersectionObserver fires for intersecting targets as soon as they are
       observed, so on-screen elements still reveal at once without help.

       A hand-rolled "is it visible right now?" check does not belong here: it
       would measure at MOUNT, which is the one moment the answer is not yet
       knowable. Images and webfonts have not landed, the document is a
       fraction of its final height, and elements that will end up thousands
       of pixels down are momentarily inside the first viewport — marked
       revealed on the spot, with nothing left to play by the time you scroll
       to them. */
    for (const el of marked) io.observe(el)

    /* Backstop, in the spirit of RevealGuard: if an element is still hidden
       when it should not be, show it. Runs on the task queue, independent of
       the compositor.

       IT MUST BE POSITION-AWARE. A flat timeout that revealed every marked
       element at once would quietly defeat the whole feature: the homepage is
       ~15,000px tall, so a few seconds in you have reached almost none of it,
       and every card below that point would be force-revealed while still far
       off screen. Scroll down and they are already visible — nothing slides
       in, because nothing was left hidden to slide. A safety net that fires
       before the thing it guards has been reached is not a safety net, it is
       a silent off switch.

       So: sweep repeatedly, and only rescue what has actually come into view
       (plus a 10% margin). Anything still below the fold keeps its entrance. */
    const SETTLE_MS = 2000  // generous: longest gesture 0.68s + longest delay ~0.35s

    const sweep = window.setInterval(() => {
      let pending = 0
      const now = Date.now()

      for (const el of marked) {
        if (!el.classList.contains('is-in')) {
          pending += 1
          if (el.getBoundingClientRect().top < window.innerHeight * 1.1) reveal(el)
          continue
        }

        if (hardened.has(el)) continue

        /* told to reveal, but did it actually land? Give the transition its
           full run plus a margin, then check the one thing that matters. */
        const since = now - (revealedAt.get(el) || now)
        if (since < SETTLE_MS) { pending += 1; continue }
        if (parseFloat(getComputedStyle(el).opacity) < 0.05) harden(el)
        else hardened.add(el)   // landed cleanly; nothing further to watch
      }

      if (!pending) window.clearInterval(sweep)
    }, 1200)

    return () => {
      window.clearInterval(sweep)
      io.disconnect()
      root.classList.remove('sr-anim')
      for (const el of marked) {
        el.removeAttribute('data-sr')
        el.style.removeProperty('--sr-i')
        el.style.removeProperty('--sr-x')
        el.style.removeProperty('transition')
        el.style.removeProperty('opacity')
        el.style.removeProperty('transform')
        el.style.removeProperty('clip-path')
        el.classList.remove('is-in')
      }
    }
  }, [route])

  return null
}
