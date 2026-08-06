import { useRef, useState } from 'react'
import { Link } from '../lib/router'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from '../lib/gsap'
import { MATERIALS } from '../data/site'
import { CharCascade, Dilate } from '../components/Reveal'
import MaterialSlider from '../components/MaterialSlider'
import '../styles/mk2/page-materials.css'

const cubeMaterials = [
  {
    id: 1,
    name: 'Brass',
    image: '/assets/materials/brass.png',
    desc: 'Classic, resonant, and golden tones.',
  },
  {
    id: 2,
    name: 'Copper',
    image: '/assets/materials/copper.png',
    desc: 'Conductive, rich, and industrial feel.',
  },
  {
    id: 3,
    name: 'Aluminium',
    image: '/assets/materials/aluminium.png',
    desc: 'Lightweight, durable, and sleek finish.',
  },
  {
    id: 4,
    name: 'Sheesham',
    image: '/assets/materials/sheesham.png',
    desc: '',
  },
  {
    id: 5,
    name: 'Mango Wood',
    image: '/assets/materials/mango.png',
    desc: 'Pale, open-grained and beautiful under oil.',
  },
  {
    id: 6,
    name: 'Reclaimed Teak',
    image: '/assets/materials/teak.png',
    desc: 'Salvaged from old structures, flat and seasoned.',
  }
]

export default function MaterialsPage() {
  const [cubeActiveIndex, setCubeActiveIndex] = useState(0)
  const sectionRef = useRef(null)

  useGSAP(() => {
    if (!sectionRef.current) return

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=3000',
      pin: true,
      scrub: 1,
      onUpdate: (self) => {
        const numItems = cubeMaterials.length
        const index = Math.min(numItems - 1, Math.floor(self.progress * numItems))
        setCubeActiveIndex((prev) => (prev !== index ? index : prev))
      }
    })
  }, { dependencies: [] })

  const activeCubeMaterial = cubeMaterials[cubeActiveIndex]

  return (
    <>
      <div className="mp">
        <section className="page-hero wrap" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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

        {/* ── Materials Scroll Section (Dark Background) ── */}
        <section className="mp__lamp-section" ref={sectionRef}>
          <div className="mp__slider-wrap mp__slider-wrap--visible" style={{ position: 'absolute', top: '48%', left: '50%', transform: 'translate(-50%, -60%)', width: '100%' }}>
            <MaterialSlider
              materials={cubeMaterials}
              activeIndex={cubeActiveIndex}
            />
          </div>
          <div className="mp__material-label mp__material-label--visible" style={{ position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
            <h2 className="mp__material-name">{activeCubeMaterial.name}</h2>
            {activeCubeMaterial.desc && (
              <p className="mp__material-desc">{activeCubeMaterial.desc}</p>
            )}
          </div>
        </section>

        {/* ── Finishes Section ── */}
        <section className="mp__showcase-section">
          <div className="mp__showcase-header">
            <CharCascade as="h2" className="d1" style={{ color: 'var(--chrome)', marginBottom: '1rem' }}>
              Finishes
            </CharCascade>
          </div>
          
          <div className="mp__showcase-grid">
            {MATERIALS.map((m, i) => (
              <div key={`showcase-${m.name}`} className="mp__showcase-card" tabIndex="0">
                <img 
                  src={cubeMaterials[i % cubeMaterials.length].image} 
                  alt={m.name} 
                  className="mp__showcase-img" 
                  loading="lazy"
                />
                
                <div className="mp__showcase-label">
                  {m.name}
                </div>
                
                <div className="mp__showcase-content">
                  <span className="mp__showcase-meta">{m.kind} · {m.meta}</span>
                  <h3 className="mp__showcase-title">{m.name}</h3>
                  <p className="mp__showcase-copy">{m.copy}</p>
                  <div className="mp__showcase-figs">
                    {m.figs.map((f) => (
                      <div key={`${m.name}-${f.u}`} className="mp__showcase-fig">
                        <span className="mp__showcase-fig-v">{f.v}</span>
                        <span className="mp__showcase-fig-u">{f.u}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Consultation CTA */}
        <section className="section clear" style={{ paddingBlock: '6rem 5rem', textAlign: 'center' }}>
          <div className="wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            <CharCascade as="h2" className="d1" style={{ maxWidth: '920px', width: '100%', textWrap: 'balance' }}>
              Not sure which material to use? Schedule a discussion
            </CharCascade>
            <Link to="/contact" className="big-connect-btn">
              <span>Connect</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
