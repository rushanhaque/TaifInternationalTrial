import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, reduced } from '../lib/gsap'
import { COLLECTIONS } from '../data/site'
import Slab from './Slab'
import { Link } from '../lib/router'
import { familySlug } from '../pages/CollectionPage'
import Button from './Button'
import { COLLECTION_IMGS } from '../data/images'

/* E19 · Collections Dolly — a pinned camera push THROUGH five layered
   collection facades. Nearest slab sits at full scale; deeper ones are
   scaled down and dimmed, stacked in a z-depth queue. On scroll each
   layer swells past the camera and drifts out to an edge, the layer
   behind steps forward, and a warm brass haze between layers thins as
   the camera pushes through it. At the alley's end: the Bespoke wall.
   Ports Template 2's AlleyDolly, re-themed for Taif. */
export default function CollectionsDolly() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const mm = gsap.matchMedia()

    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const stage = root.querySelector('.cd-stage')
      const layers = gsap.utils.toArray(root.querySelectorAll('.cd-layer'))
      const hazes = gsap.utils.toArray(root.querySelectorAll('.cd-haze'))
      const end = root.querySelector('.cd-end')
      const N = layers.length

      /* initial depth stack: nearest (i=0) at scale 1, deeper ones smaller & dim */
      layers.forEach((l, i) => {
        gsap.set(l, {
          scale: 1 / (1 + i * 0.42),
          opacity: i === 0 ? 1 : Math.max(0.25, 1 - i * 0.22),
          zIndex: 2 * (N - i),
        })
      })
      gsap.set(hazes, { opacity: (i) => 0.35 + i * 0.18, zIndex: (i) => 2 * (N - i) - 1 })
      gsap.set(end, { opacity: 0, zIndex: 2 * N + 2 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          pin: true,
          scrub: 0.7,
          start: 'top top',
          end: '+=3200',
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })

      const SEG = 1
      layers.forEach((l, i) => {
        const t = i * SEG
        const dir = i % 2 ? 1 : -1
        /* the passing layer: swells past camera and drifts out an edge */
        tl.to(l, {
          scale: 2.35,
          xPercent: dir * 46,
          yPercent: -12,
          opacity: 0,
          duration: SEG * 0.9,
          ease: 'power1.in',
        }, t)
        /* every layer behind steps one slot closer */
        for (let j = i + 1; j < N; j++) {
          const depth = j - (i + 1)
          tl.to(layers[j], {
            scale: 1 / (1 + depth * 0.42),
            opacity: depth === 0 ? 1 : Math.max(0.25, 1 - depth * 0.22),
            duration: SEG * 0.9,
            ease: 'power1.inOut',
          }, t)
        }
        /* haze sheet i thins as we push through it */
        if (hazes[i]) {
          tl.to(hazes[i], { opacity: 0, duration: SEG * 0.7, ease: 'none' }, t + SEG * 0.1)
        }
      })
      /* the alley's end — Bespoke wall */
      tl.to(end, { opacity: 1, duration: SEG * 0.8, ease: 'power1.out' }, (N - 1) * SEG + 0.3)

      return () => tl.scrollTrigger?.kill()
    })

    return () => mm.revert()
  }, [])

  return (
    <section className="cd section" ref={rootRef}>
      {/* pinned dolly — ≥900px, motion-ok */}
      <div className="cd-stage only-cd">
        {COLLECTIONS.map((c, i) => (
          <div className="cd-layer" key={c.no}>
            <Link
              className="cd-facade"
              to={`/collections/${familySlug(c.name)}`}
              data-cursor="OPEN"
              aria-label={`Open the ${c.name} collection`}
            >
              <span className={`cd-tag a-${c.accent}`} aria-hidden="true">{c.no}</span>
              <Slab tone={c.tone} label={c.name.toUpperCase()} ratio="16/10" bead
                img={COLLECTION_IMGS[c.name]} alt={c.name} />
            </Link>
          </div>
        ))}
        {[0, 1, 2].map((i) => <div className="cd-haze" key={i} aria-hidden="true" />)}
        <div className="cd-end">
          <span className="meta cd-end-kicker">The end of the line — the start of the piece.</span>
          <h3 className="d1">The bench is open.</h3>
          <p className="lede" style={{ maxWidth: '48ch' }}>
            Bespoke sits past the last family. Send a drawing, a photograph or a
            sample — a priced quote returns in five working days.
          </p>
          <div className="cd-end-ctas">
            <Button to="/contact">Connect</Button>
            <Button to="/catalogue" variant="ghost">Or browse the catalogue</Button>
          </div>
        </div>
      </div>

      {/* fallback — stacked cards for mobile / reduced motion */}
      <div className="wrap only-fallback">
        <div className="cd-fallback">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.no}
              className="cd-fallback-cell"
              to={`/collections/${familySlug(c.name)}`}
              aria-label={`Open the ${c.name} collection`}
            >
              <Slab tone={c.tone} label={c.name.toUpperCase()} ratio="16/10"
                img={COLLECTION_IMGS[c.name]} alt={c.name} />
            </Link>
          ))}
        </div>
        <div className="cd-end-fallback">
          <h3 className="d2">The bench is open.</h3>
          <p className="lede">Bespoke is the sixth family — described in a drawing you send.</p>
          <div className="cd-end-ctas">
            <Button to="/contact">Connect</Button>
            <Button to="/catalogue" variant="ghost">Or browse the catalogue</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
