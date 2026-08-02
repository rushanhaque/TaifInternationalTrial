import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reduced } from '../../lib/gsap'
import { getLenis } from '../../lib/useLenis'

/* ChapterRail — the fixed chapter index on the right edge.
   At rest it is a column of hairline marks. The mark you are standing in
   draws itself out in brass and names itself; hovering the rail names all ten.

   Ownership split, so CSS and GSAP never fight over the same property:
     · CSS owns every steady state — rest / hover / focus / active colour,
       the label reveal and its per-item stagger (transition-delay).
     · GSAP owns exactly one property set: the transform + opacity of
       .crail-line-live (the brass line) and the one-time mount entrance.
   Nothing that carries meaning is left at opacity 0 by CSS: the grey stub of
   every tick is always painted, and the names reveal on :hover / :focus-visible
   with no JavaScript involved. If GSAP never boots the rail is still a working,
   readable, clickable index. */

const DEFAULT_SECTIONS = [
  { id: 'hero', label: 'Hero' },
  { id: 'collections', label: 'Collections' },
  { id: 'catalogue', label: 'Catalogue' },
  { id: 'the-turn', label: 'The Turn' },
  { id: 'two-floors', label: 'Two Floors' },
  { id: 'measured', label: 'Measured' },
  { id: 'proof', label: 'Proof' },
  { id: 'process', label: 'Process' },
  { id: 'ledger', label: 'Ledger' },
  { id: 'contact', label: 'Contact' },
]

/* --nav-h is 68px; the extra 26 keeps a jumped-to heading clear of the pill
   navbar instead of tucked behind it. */
const NAV_OFFSET = 94

/* The activation scanline: a section owns the rail while it crosses 45% of the
   viewport height. Gaps between chapters (ribbons, tension bridges) leave the
   previous chapter lit, which is what you want — the rail should never blank. */
const LINE = '45%'

export default function ChapterRail({ sections = DEFAULT_SECTIONS, label = 'Chapter index' }) {
  const root = useRef(null)
  const [active, setActive] = useState(0)

  /* Depend on the id list, not the array identity — a parent that inlines the
     prop would otherwise rebuild every ScrollTrigger on each render. */
  const key = sections.map((s) => s.id).join('|')

  /* ── active chapter + dark-section inversion ──────────────────────────────
     ScrollTrigger rather than IntersectionObserver, for two concrete reasons:
     1. lib/useLenis pipes Lenis's scroll straight into ScrollTrigger.update, so
        these triggers read the same interpolated position as every other
        animation on the page — one shared update pass, no extra observers.
     2. This homepage is full of pinned and scrubbed sections that change the
        document height. ScrollTrigger re-measures every trigger on refresh;
        an IntersectionObserver would silently hold stale root margins. */
  useEffect(() => {
    const el = root.current
    if (!el) return

    const mm = gsap.matchMedia()

    mm.add(
      { desk: '(min-width: 1100px)', motion: '(prefers-reduced-motion: no-preference)' },
      (ctx) => {
        const { desk, motion } = ctx.conditions
        /* Below 1100px the rail is display:none, so observe nothing at all. */
        if (!desk) return

        const items = Array.from(el.querySelectorAll('.crail-item'))

        /* Mark chapters whose section is not on this page. Set imperatively and
           never declared in JSX, so React's reconciler leaves it alone on the
           re-renders that `active` causes. Absent attribute = visible, so an
           unresolved rail fails open rather than empty. */
        const trigs = []
        sections.forEach((s, i) => {
          const target = document.getElementById(s.id)
          const li = items[i]
          if (li) li.dataset.live = target ? '1' : '0'
          if (!target) return
          trigs.push({ i, target })
        })

        const lastIdx = trigs.length ? trigs[trigs.length - 1].i : -1

        const made = trigs.map(({ i, target }) =>
          ScrollTrigger.create({
            trigger: target,
            start: `top ${LINE}`,
            /* The final chapter's bottom may never reach the scanline, so it
               holds the rail to the end of the document instead. */
            end: i === lastIdx ? 'max' : `bottom ${LINE}`,
            invalidateOnRefresh: true,
            onToggle: (self) => { if (self.isActive) setActive(i) },
          })
        )

        /* Resolve the opening state deterministically rather than hoping a
           trigger fires on creation: the last chapter whose start is at or
           above the current scroll position wins. */
        const settle = () => {
          const y = window.scrollY
          let idx = made.length ? trigs[0].i : 0
          made.forEach((st, n) => { if (st.start <= y + 1) idx = trigs[n].i })
          setActive(idx)
        }
        settle()

        /* Over the espresso sections a warm-ink rail would vanish. Watch every
           .deep panel and flip the whole rail to its light-on-dark palette
           while one is behind it. */
        const deeps = Array.from(document.querySelectorAll('.deep'))
        const deepTrigs = []
        const syncInverse = () =>
          el.classList.toggle('is-inverse', deepTrigs.some((t) => t.isActive))
        deeps.forEach((d) => {
          deepTrigs.push(
            ScrollTrigger.create({
              trigger: d,
              start: 'top 58%',
              end: 'bottom 42%',
              invalidateOnRefresh: true,
              onToggle: syncInverse,
            })
          )
        })
        syncInverse()

        /* Entrance — seeded from JS only (rule 1), and only when motion is
           welcome. clearProps hands the elements back to CSS afterwards. */
        if (motion && items.length) {
          gsap.set(items, { opacity: 0, x: 18 })
          gsap.to(items, {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: 'atelys',
            stagger: 0.045,
            delay: 0.45,
            clearProps: 'opacity,transform',
          })
        }

        return () => {
          /* matchMedia reverts its own tweens and triggers; the class is ours. */
          el.classList.remove('is-inverse')
          items.forEach((li) => { delete li.dataset.live })
        }
      }
    )

    return () => mm.revert()
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── the brass line ───────────────────────────────────────────────────────
     GSAP owns this one property set exclusively. Under reduced motion the
     duration collapses to zero, which is the spec: no elongation, the active
     state simply changes colour. */
  useEffect(() => {
    const el = root.current
    if (!el) return
    const lines = Array.from(el.querySelectorAll('.crail-line-live'))
    const still = reduced()
    lines.forEach((ln, i) => {
      const on = i === active
      gsap.to(ln, {
        scaleX: on ? 1 : 0,
        opacity: on ? 1 : 0,
        duration: still ? 0 : on ? 0.62 : 0.32,
        ease: on ? 'surge' : 'fluid',
        overwrite: 'auto',
      })
    })
    return () => gsap.killTweensOf(lines)
  }, [active])

  function goTo(id) {
    const target = document.getElementById(id)
    if (!target) return

    const lenis = getLenis()
    if (lenis) {
      /* Negative offset stops short of the target so the navbar clears it. */
      lenis.scrollTo(target, {
        offset: -NAV_OFFSET,
        duration: 1.1,
        easing: (t) => 1 - Math.pow(1 - t, 4),
      })
    } else {
      /* Lenis is never instantiated under prefers-reduced-motion, so this is
         also the reduced-motion path — jump, don't glide. */
      target.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' })
    }

    /* Land keyboard focus inside the chapter, the way a skip link would.
       preventScroll keeps the browser from stealing the smooth scroll. */
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }

  if (!sections.length) return null

  return (
    /* No heading here on purpose — this is a landmark duplicating the primary
       nav, so it names itself with aria-label and leaves the document outline
       to the sections it points at. */
    <nav className="crail" ref={root} aria-label={label}>
      <div className="crail-inner">
        <span className="crail-cap meta" aria-hidden="true">Index</span>
        <span className="crail-spine" aria-hidden="true" />
        <ol className="crail-list">
          {sections.map((s, i) => (
            <li
              key={s.id}
              className={`crail-item${i === active ? ' is-active' : ''}`}
              style={{ '--i': String(i) }}
            >
              <button
                type="button"
                className="crail-tick"
                onClick={() => goTo(s.id)}
                aria-current={i === active ? 'location' : undefined}
              >
                <span className="crail-name">
                  <span className="crail-plate" aria-hidden="true" />
                  <span className="crail-num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="crail-label">{s.label}</span>
                </span>
                <span className="crail-line" aria-hidden="true" />
                <span className="crail-line-live" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}
