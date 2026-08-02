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
      const st = ScrollTrigger.create({
        trigger: row, start: 'top 65%',
        onEnter() {
          row.classList.add('passed')
          gsap.timeline()
            .to(node, { scale: 1.35, duration: 0.35, ease: 'surge' })
            .to(node, { scale: 1.1, duration: 0.5, ease: 'viscous' })
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
              <Dilate>
                <div className="step-k">
                  <span className="idx">0.{i + 1}</span>
                  <h3 className="d3">{s.name}</h3>
                  <span className="step-spec meta">{s.spec}</span>
                </div>
                <p className="body">{s.copy}</p>
              </Dilate>
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
