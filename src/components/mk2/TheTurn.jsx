import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { EditorialReveal } from '../Reveal'

const MATERIAL_SLIDES = [
  { id: 'b1', key: 'brass', name: 'Brass', tag: 'Brass', in: 0.05, out: 0.18, side: 'l', a: 1, text: 'Unlacquered & Polished Brass' },
  { id: 'b2', key: 'aluminium', name: 'Aluminium', tag: 'Aluminium', in: 0.20, out: 0.35, side: 'r', a: 2, text: 'Cast & Brushed Aluminium' },
  { id: 'b3', key: 'iron', name: 'Iron', tag: 'Iron', in: 0.37, out: 0.50, side: 'l', a: 3, text: 'Hand-Forged Wrought Iron' },
  { id: 'w1', key: 'copper', name: 'Copper', tag: 'Copper', in: 0.52, out: 0.65, side: 'r', a: 4, text: 'Hand-Hammered Raw Copper' },
  { id: 'w2', key: 'steel', name: 'Steel', tag: 'Steel', in: 0.67, out: 0.80, side: 'l', a: 5, text: 'Stainless & Carbon Steel' },
  { id: 'w3', key: 'wood', name: 'Wood', tag: 'Wood', in: 0.82, out: 1.00, side: 'r', a: 6, text: 'Kiln-Dried Hardwood & Teak' },
]

const MATERIAL_IMAGES = {
  brass: '/img/materials/brass.png',
  aluminium: '/img/materials/aluminium.png',
  iron: '/img/materials/iron.png',
  copper: '/img/materials/copper.png',
  steel: '/img/materials/steel.png',
  wood: '/img/materials/wood.png',
}

const COLS = [
  { mat: 'metal', head: 'Metals & Alloys' },
  { mat: 'wood', head: 'Natural Hardwoods' },
]

export default function TheTurn() {
  const root = useRef(null)
  const stage = useRef(null)
  const card = useRef(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const mm = gsap.matchMedia()

    /* One builder, two contexts. The MECHANISM is identical on both — pin,
       scrub, cross-dissolve the six materials, turn the form — so it would be
       wrong to write it twice. What differs is only where the lock begins and
       how far it runs:

         trigger  desktop pins off the stage, which sits inside the card and
                  below its padding. On a phone that reads as late: the card's
                  top edge slides under the header and the screen keeps moving
                  for another beat before it catches. Triggering on the CARD
                  locks the moment its top edge meets the top of the screen,
                  which is the edge the eye is actually tracking. `pin` names
                  the stage explicitly, so the trigger can move independently
                  of what is pinned.

         end      a phone screen is shorter and thumb-scrolled, so the same six
                  beats want less travel; 2600px there reads as a section that
                  will not end.

       Split at 1000px to match the FLAT/PINNED boundary in theturn.css, and
       as two separate queries so a rotate rebuilds against the right one. */
    /* live height of the fixed masthead — the var is the authored value, the
       rect is what it actually measures to, and they differ */
    const navH = () => {
      const bar = document.querySelector('header.nav')
      const h = bar?.getBoundingClientRect().height
      return Math.round(h || parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
      ) || 68)
    }

    const build = ({ triggerEl, travel, start }) => () => {
      const q = (s) => gsap.utils.toArray(el.querySelectorAll(s))
      const notes = q('[data-note]')
      const lines = q('[data-line]')
      const bar = el.querySelector('[data-bar]')

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: triggerEl() || stage.current,
          start,
          end: '+=' + travel,
          pin: stage.current,
          pinSpacing: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      if (bar) tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)

      const formEl = el.querySelector('[data-form]')
      if (formEl) {
        tl.fromTo(formEl, { rotate: 0 }, { rotate: 180, duration: 1 }, 0)
      }

      MATERIAL_SLIDES.forEach((m, i) => {
        const imgLayer = el.querySelector(`[data-mat-img="${m.key}"]`)
        const note = notes[i]
        const line = lines[i]

        const dir = m.side === 'l' ? -1 : 1

        // Show callout note
        if (note) {
          tl.fromTo(note,
            { autoAlpha: 0, x: dir * 26 },
            { autoAlpha: 1, x: 0, duration: 0.085, ease: 'surge' }, m.in)
        }
        if (line) {
          tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.075, ease: 'power2.out' }, m.in + 0.015)
        }

        // Cross-dissolve material image layer inside shape
        if (imgLayer) {
          if (i === 0) {
            // First material starts visible, fades out at its out point
            if (m.out != null) {
              tl.to(imgLayer, { opacity: 0, scale: 1.05, duration: 0.08, ease: 'power2.inOut' }, m.out)
            }
          } else {
            // Subsequent materials fade in at m.in, fade out at m.out
            tl.fromTo(imgLayer,
              { opacity: 0, scale: 1.06 },
              { opacity: 1, scale: 1, duration: 0.08, ease: 'power2.inOut' }, m.in)

            if (m.out != null && i < MATERIAL_SLIDES.length - 1) {
              tl.to(imgLayer, { opacity: 0, scale: 1.05, duration: 0.08, ease: 'power2.inOut' }, m.out)
            }
          }
        }

        if (m.out == null) return
        if (note) tl.to(note, { autoAlpha: 0, x: dir * -12, duration: 0.05, ease: 'power1.in' }, m.out)
        if (line) tl.to(line, { scaleX: 0, duration: 0.05 }, m.out)
      })

      return () => {
        tl.scrollTrigger?.kill()
        tl.kill()
      }
    }

    /* desktop — unchanged: stage trigger, 'top top', 2600px of travel. The
       stage carries `padding-top: calc(var(--nav-h) + …)` there, which is what
       keeps the label clear of the masthead while pinned at y=0. */
    mm.add('(min-width: 1000px) and (prefers-reduced-motion: no-preference)',
      build({ triggerEl: () => stage.current, travel: 2600, start: 'top top' }))

    /* phones and tablets — the mobile stylesheet drops that nav padding to buy
       back vertical room, so pinning at y=0 would park the card's top edge
       UNDER the fixed masthead and hide the section label for the whole turn.
       Starting at the masthead's own height instead fires the lock one header
       earlier: the card comes to rest with its top edge against the bottom of
       the header, which is the moment the eye reads as "it caught". */
    mm.add('(max-width: 999.98px) and (prefers-reduced-motion: no-preference)',
      build({ triggerEl: () => card.current, travel: 1800, start: () => `top ${navH()}px` }))

    return () => mm.revert()
  }, [])

  return (
    <section className="tt section" ref={root} aria-labelledby="tt-h">
      {/* the off-white plate the whole section sits on — the maroon .tt ground
          survives only as a frame around it */}
      <div className="tt-card" ref={card}>
      <div className="tt-stage" ref={stage}>
        <div className="sec-head tt-sec-head"><span className="meta">Materials we use</span></div>

        <div className="tt-rig">
          {/* Proper Circle Container holding material close-up macro texture images */}
          <div
            className="tt-form"
            data-form
            aria-hidden="true"
            style={{
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.08)'
            }}
          >
            {MATERIAL_SLIDES.map((m, idx) => (
              <div
                key={m.key}
                data-mat-img={m.key}
                style={{
                  position: 'absolute',
                  inset: '-40%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  opacity: idx === 0 ? 1 : 0,
                  willChange: 'opacity, transform',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={MATERIAL_IMAGES[m.key]}
                  alt={`${m.name} macro texture`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    transform: 'scale(1.35)',
                    display: 'block'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Decorative Callouts for Material Names */}
          <div className="tt-notes" aria-hidden="true">
            {MATERIAL_SLIDES.map((n) => (
              <div className={`tt-note a${n.a} side-${n.side}`} key={n.id} data-note data-side={n.side}>
                <span className="tt-note-body">
                  <span className="tt-note-tag meta" style={{ fontSize: '1.05rem', fontWeight: '700', letterSpacing: '0.12em', color: '#421520' }}>{n.tag}</span>
                </span>
                <span className="tt-note-line" data-line />
                <span className="tt-note-dot" />
              </div>
            ))}
          </div>
        </div>

        <div className="tt-bar" aria-hidden="true"><i data-bar /></div>
      </div>

      <div className="wrap tt-specs">
        <div className="tt-spec-grid">
          {COLS.map((c) => (
            <div className={`tt-spec-col is-${c.mat}`} key={c.mat}>
              <EditorialReveal
                category={`${c.mat.toUpperCase()} SPECIFICATION`}
                title={c.head}
                specs={MATERIAL_SLIDES.filter((n) => (c.mat === 'wood' ? n.key === 'wood' : n.key !== 'wood')).map((n) => ({
                  label: n.tag,
                  value: n.text
                }))}
                staggerMs={100}
              />
            </div>
          ))}
        </div>
      </div>
      </div>
    </section>
  )
}
