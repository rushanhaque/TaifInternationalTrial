import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from '../lib/gsap'
import { MATERIALS } from '../data/site'
import { CharCascade, Dilate } from '../components/Reveal'
import Counter from '../components/Counter'
import Slab from '../components/Slab'
import Deep from '../components/Deep'
import Button from '../components/Button'
import { MATERIAL_IMGS } from '../data/images'
import MaterialRig from '../components/mk2/MaterialRig'

export default function MaterialsPage() {
  const containerRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const triggerRefs = useRef([])

  useGSAP(() => {
    // Clear any previous triggers if re-running
    ScrollTrigger.getAll().filter(t => t.vars.id?.startsWith('mat-')).forEach(t => t.kill())

    triggerRefs.current.forEach((el, i) => {
      if (!el) return
      ScrollTrigger.create({
        id: `mat-${i}`,
        trigger: el,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => {
          if (self.isActive) {
            setActiveIndex(i)
          }
        }
      })
    })
  }, { scope: containerRef, dependencies: [] })

  return (
    <>
      <section className="page-hero wrap" style={{ paddingBottom: '2rem' }}>
        <p className="hero-kicker"><span className="idx">0.7</span> <span className="meta">Materials</span></p>
        <CharCascade as="h1" className="mega">Three metals, three woods.</CharCascade>
        <Dilate>
          <p className="lede">
            Chosen for how they behave under a hammer, a chisel and twenty years on
            a shelf. Every property below is measured on our floor, not copied from
            a supplier’s brochure.
          </p>
        </Dilate>
      </section>

      <section className="section tight" ref={containerRef} style={{ paddingTop: '0' }}>
        <div className="wrap">
          <div className="grid">
            {/* Sticky Left Column for Images */}
            <div className="sp-6" style={{ position: 'sticky', top: 'calc(var(--nav-h, 72px) + 2rem)', height: 'calc(100vh - var(--nav-h, 72px) - 4rem)', display: 'flex', alignItems: 'center', zIndex: 5 }}>
              <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
                {MATERIALS.map((m, i) => (
                  <div
                    key={`img-${m.name}`}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      opacity: activeIndex === i ? 1 : 0,
                      transform: activeIndex === i ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
                      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      pointerEvents: activeIndex === i ? 'auto' : 'none',
                      zIndex: activeIndex === i ? 2 : 1
                    }}
                  >
                    <Slab tone={m.tone} ratio="4/5" label={m.name.toUpperCase()} meta={m.meta} blob={i === 0}
                      img={MATERIAL_IMGS[m.name]} alt={m.name} />
                  </div>
                ))}
              </div>
            </div>

            {/* Scrolling Right Column for Text */}
            <div className="sp-5 st-8">
              <div style={{ paddingBottom: '20vh' }}>
                {MATERIALS.map((m, i) => (
                  <div
                    key={`txt-${m.name}`}
                    ref={el => triggerRefs.current[i] = el}
                    style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 0' }}
                  >
                    <Dilate>
                      <span className="meta dim2" style={{ 
                        color: activeIndex === i ? 'var(--tint-deep)' : 'var(--dim)',
                        transition: 'color 0.4s'
                      }}>
                        {m.kind}
                      </span>
                      <h2 className="d2" style={{ 
                        transition: 'color 0.4s', 
                        color: activeIndex === i ? 'var(--graphite)' : 'var(--graphite-2)' 
                      }}>
                        {m.name}
                      </h2>
                      <p className="body" style={{ 
                        marginTop: '1.2rem', 
                        transition: 'opacity 0.4s', 
                        opacity: activeIndex === i ? 1 : 0.4 
                      }}>
                        {m.copy}
                      </p>
                      <div className="mat-figs" style={{ 
                        marginTop: '2.5rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '1rem',
                        transition: 'opacity 0.4s', 
                        opacity: activeIndex === i ? 1 : 0.4 
                      }}>
                        {m.figs.map((f) => (
                          <Counter key={f.u} value={f.v} unit={f.u} smaller />
                        ))}
                      </div>
                    </Dilate>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* the comparison rig — eighteen figures made comparable */}
      <MaterialRig />

      <Deep>
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.7</span><span className="meta">Sourcing</span></div>
          <div className="grid">
            <div className="sp-7">
              <CharCascade as="h2" className="d1">Recycled metal, documented timber.</CharCascade>
              <Dilate>
                <p className="body" style={{ marginTop: '1.2rem' }}>
                  Between 78% and 92% of the metal we melt is recycled feedstock, verified
                  against the mill certificate at intake. Every timber lot arrives with a
                  legal harvest document, and our mango is an orchard by-product rather
                  than a felling. Metal offcuts go back to the smelter; wood offcuts heat
                  the kiln that dries the next batch.
                </p>
              </Dilate>
            </div>
            <div className="sp-4 st-8">
              <Dilate delay={0.15}>
                <Counter value="84" unit="% avg recycled" label="Weighted across 2025 metal input" />
              </Dilate>
            </div>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <Button to="/contact" variant="ghost">Ask for certificates</Button>
          </div>
        </div>
      </Deep>
    </>
  )
}
