import { useEffect } from 'react'
import { useRoute } from '../lib/router'

/* ── MOBILE REVEAL ──────────────────────────────────────────────────────────
   Stamps entrance animations onto a phone layout. Desktop never sees this:
   the whole thing is behind a matchMedia gate, and every style it triggers
   lives inside a max-width query in mobile-motion.css.

   It marks elements with data-mr (card | text | btn | media), gives each a
   --mr-i index for stagger, then adds `is-in` as they cross into view.

   THE HIDDEN STATE IS OPT-IN. mobile-motion.css only hides `[data-mr]` under
   `html.m-anim`, and that class is added here — after mount, and only once
   an IntersectionObserver has actually been constructed. If this file never
   loads, throws, or runs on a browser without IO, the class is absent and
   the page renders plainly visible. Nothing here is load-bearing for reading
   the site; it can only ever add motion, never withhold content.

   Re-runs per route because the marked nodes are replaced on navigation. */

const MOBILE = '(max-width: 768px)'

/* What gets which gesture.

   ORDER IS THE CONTRACT. Groups are applied outermost-thing-first: a media
   frame, then cards, then standalone controls, then loose text. Anything
   sitting INSIDE something already marked is skipped (see the descendant
   guard in the effect), so a card animates as one object rather than the card
   and its heading and its button each sliding separately — which reads as the
   card coming apart. That is also what lets the last group be broad enough to
   catch prose nobody enumerated. */
const GROUPS = [
  /* .tt-card is deliberately absent: The Turn pins that card with a
     ScrollTrigger on mobile now, and a reveal transform on a pinned element
     corrupts the pin's measurements. */
  ['media', '.heritage-video-card, .craft-card-container, .hp-media'],
  [
    'card',
    [
      /* homepage */
      '.tm-card', '.about-stat-card', '.craft-process-item',
      '.countries-card', '.mrail-item',
      /* blogs and socials — the video cards are the grid cell, not the
         wrapper, so the cell is what should travel */
      '#instagram .grid > [class*="sp-"]', '.hero-video-wrapper',
      /* catalogue / collections / product */
      '.pl-card', '.cat-card', '.slab', '.cix-row', '.pcx-card',
      '.rail-card', '.fm-cell', '.dp',
      /* about / shows / partners / care / faq — class names verified by
         walking each page at 375px, not guessed */
      '.year-card', '.team-card', '.shows-event', '.shows-atelier-cell',
      '.faq-row', '.faq-group', '.prt-stat-cell', '.prt-cmp-pane',
      '.tl-item', '.ldg-row', '.care-card-head', '.loc-card',
      /* forms read as panels too — the contact page is otherwise inert */
      '.contact-form', '.contact-map-wrap', '.field',
      /* the spec columns under The Turn */
      '.tt-spec-col',
    ].join(','),
  ],
  ['btn', '.btn, .czoom-schedule-btn, .hero-cta > *, .craft-cta > *'],
  [
    /* The broad net, deliberately last. Everything above has already claimed
       its subtree, so what reaches here is genuinely loose copy — section
       headings and standalone paragraphs that no card owns. This is what
       stops a page from having three animated things and forty static ones. */
    'text',
    [
      '.craft-sec-title', '.craft-headline', '.craft-body',
      '.czoom-bestsellers-title', '.mrail-title',
      '.tt-sec-head .meta', '.page-hero .lede',
      '.hero-kicker', '.sec-title', '.prt-lede',
      'section h2', 'section h3', 'section h4',
      'section > p', 'section > .wrap > p', 'section .lede',
      '.ed-block-head', '.sec-head > *',
    ].join(','),
  ],
]

/* ── who already has an owner ───────────────────────────────────────────────
   GSAP writes INLINE opacity, and an inline style beats any stylesheet
   declaration. So an element animated by both systems ends up stranded at
   whichever opacity GSAP last wrote — which is 0 until its ScrollTrigger
   fires. One element, one owner.

   These are the classes rendered through CharCascade / SmoothReveal / Dilate
   in Reveal.jsx (each begins with `gsap.set(el, { opacity: 0 })`), plus the
   two families CollectionsMosaic animates itself. */
const SKIP = [
  '.mega', '.principle-card', '.d1', '.d2',
  '.sec-head .meta',
  '.cm-card', '.cm-title', '.cm-kicker',
].join(',')

/* NOTHING FROM CollectionsMosaic APPEARS ABOVE — not .cm-card, and not
   .cm-title / .cm-kicker either. That component runs its own GSAP reveal over
   `.cm-card` and `.cm-head > *`, and GSAP writes INLINE opacity, which beats
   a stylesheet declaration. Marking those elements here left them owned by
   two systems and stranded at GSAP's opacity 0 whenever its ScrollTrigger had
   not fired. One element, one owner. */

export default function MobileReveal() {
  const route = useRoute()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia(MOBILE).matches) return
    if (typeof IntersectionObserver === 'undefined') return

    const root = document.documentElement
    const marked = []

    /* Stagger is counted PER CONTAINER, not per group. Counting across the
       whole group meant a broad selector burned through the 0–7 cap on the
       first grid, and every later element on the page — hundreds of them —
       inherited a flat 490ms delay before it would move. Since each element
       reveals on its own intersection anyway, that was pure latency: you
       reached a heading and waited half a second for it.

       Per container, the numbers mean what they should: siblings in a grid
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
        if (el.hasAttribute('data-mr')) continue
        /* declared owner */
        if (el.matches(SKIP) || el.closest(SKIP)) continue
        /* and the general net: an inline opacity is GSAP's fingerprint, so
           anything already carrying one belongs to a tween, named or not */
        if (el.style.opacity !== '') continue
        /* DESCENDANT GUARD — an ancestor is already travelling, so this rides
           along with it. Without this the broad `text` selectors below would
           re-animate every heading and paragraph already inside a card, and a
           card would visibly come apart as it arrived: the frame sliding on
           one curve while its own title slid on another. Checked from the
           PARENT so the element's own mark (set above) is not what matches. */
        if (el.parentElement?.closest('[data-mr]')) continue
        el.setAttribute('data-mr', kind)
        const parent = el.parentElement || document.body
        const n = seen.get(parent) || 0
        seen.set(parent, n + 1)
        /* cap it — past ~6 siblings the tail of a cascade reads as lag */
        el.style.setProperty('--mr-i', String(Math.min(n, 5)))
        marked.push(el)
      }
    }

    if (!marked.length) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.08 }
    )

    /* only now is hiding safe — the observer exists, so everything hidden is
       guaranteed to have something that can bring it back */
    root.classList.add('m-anim')

    /* Observe everything, including whatever is already on screen — an
       IntersectionObserver fires for intersecting targets as soon as they are
       observed, so on-screen elements still reveal at once without help.

       The hand-rolled "is it visible right now?" check that used to stand
       here measured at MOUNT, which is the one moment the answer is not yet
       knowable: images and webfonts have not landed, so the document is a
       fraction of its final height and elements that will end up thousands of
       pixels down are momentarily inside the first viewport. They were marked
       revealed on the spot and had nothing left to play by the time you
       scrolled to them — which is precisely the "everything is static"
       symptom, arriving from a different direction than the flat timeout. */
    for (const el of marked) io.observe(el)

    /* Backstop, in the spirit of RevealGuard: if an element is still hidden
       when it should not be, show it. Runs on the task queue, independent of
       the compositor.

       IT MUST BE POSITION-AWARE. The first version was a flat 6s timeout that
       revealed EVERY marked element at once, and that quietly defeated the
       whole feature: this page is ~15,000px tall, so six seconds in you have
       reached almost none of it, and every card and heading below that point
       was force-revealed while still far off screen. Scroll down and they were
       already visible — nothing slid in, because nothing was left hidden to
       slide. A safety net that fires before the thing it guards has even been
       reached is not a safety net, it is a silent off switch.

       So: sweep repeatedly, and only rescue what has actually come into view
       (plus a 10% margin). Anything still below the fold stays hidden and
       keeps its entrance. */
    const sweep = window.setInterval(() => {
      let pending = 0
      for (const el of marked) {
        if (el.classList.contains('is-in')) continue
        pending += 1
        if (el.getBoundingClientRect().top < window.innerHeight * 1.1) {
          el.classList.add('is-in')
        }
      }
      if (!pending) window.clearInterval(sweep)
    }, 1200)

    return () => {
      window.clearInterval(sweep)
      io.disconnect()
      root.classList.remove('m-anim')
      for (const el of marked) {
        el.removeAttribute('data-mr')
        el.style.removeProperty('--mr-i')
        el.classList.remove('is-in')
      }
    }
  }, [route])

  return null
}
