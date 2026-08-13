import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, reduced } from '../lib/gsap'
import { Dilate } from './Reveal'
import Slab from './Slab'

/* E15 Viscous Stepper — a fat rounded tube fills with liquid as you scroll;
   stage nodes inflate as the level reaches them, then relax to 1.1. */
export default function Stepper({ stages, teaser = false, withSlabs = false }) {
  const root = useRef(null)
  const fill = useRef(null)
  const shown = teaser ? stages.slice(0, 3) : stages

  useEffect(() => {
    if (reduced()) {
      gsap.set(fill.current, { scaleY: 1 })
      root.current.querySelectorAll('.step-row').forEach((r) => r.classList.add('passed'))
      return
    }
    const kills = []
    const tw = gsap.to(fill.current, {
      scaleY: 1, ease: 'none',
      scrollTrigger: {
        trigger: root.current, start: 'top 65%', end: 'bottom 65%',
        scrub: 0.6, invalidateOnRefresh: true,
      },
    })
    kills.push(() => { tw.scrollTrigger?.kill(); tw.kill() })
    root.current.querySelectorAll('.step-row').forEach((row) => {
      const node = row.querySelector('.step-node')
      const idxEl = row.querySelector('.idx')
      const titleEl = row.querySelector('.d3')
      const specEl = row.querySelector('.step-spec')
      const copyEl = row.querySelector('.body')
      const textTargets = [idxEl, titleEl, specEl, copyEl].filter(Boolean)

      if (textTargets.length > 0) {
        gsap.set(textTargets, {
          opacity: 0,
          y: 22,
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          force3D: true
        })
      }

      const st = ScrollTrigger.create({
        trigger: row, start: 'top 75%',
        once: true,
        onEnter() {
          row.classList.add('passed')
          gsap.timeline()
            .to(node, { scale: 1.35, duration: 0.35, ease: 'surge' })
            .to(node, { scale: 1.1, duration: 0.5, ease: 'viscous' })

          if (textTargets.length > 0) {
            const ttl = gsap.timeline({
              onComplete: () => gsap.set(textTargets, { clearProps: 'transform,willChange,backfaceVisibility' })
            })
            if (idxEl) ttl.to(idxEl, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' })
            if (titleEl) ttl.to(titleEl, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, idxEl ? '-=0.55' : 0)
            if (specEl) ttl.to(specEl, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }, titleEl ? '-=0.58' : 0)
            if (copyEl) ttl.to(copyEl, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, specEl ? '-=0.55' : 0)
          }
        },
        onLeaveBack() {
          row.classList.remove('passed')
          gsap.to(node, { scale: 1, duration: 0.4, ease: 'fluid' })
        },
      })
      kills.push(() => st.kill())
    })
    return () => kills.forEach((k) => k())
  }, [])

  return (
    <div className="stepper" ref={root}>
      <div className="step-track" aria-hidden="true"><div className="step-fill" ref={fill} /></div>
      <ol>
        {shown.map((s, i) => (
          <li className="step-row" key={s.name}>
            <span className="step-node" aria-hidden="true" />
            <div className="step-grid">
              <div>
                <div className="step-k">
                  <span className="idx">0.{i + 1}</span>
                  <h3 className="d3">{s.name}</h3>
                  <span className="step-spec meta">{s.spec}</span>
                </div>
                <p className="body">{s.copy}</p>
              </div>
              {withSlabs && (
                <Slab
                  tone={['brass', 'copper', 'wood', 'walnut'][i % 4]}
                  ratio="16/9"
                  label={s.name.toUpperCase()}
                  meta={s.spec}
                  blob={i < 2}
                />
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
