import { useRef, useState } from 'react'
import { Link } from '../lib/router'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from '../lib/gsap'
import { CharCascade } from '../components/Reveal'
import MaterialSlider from '../components/MaterialSlider'
import FinishesCabinet from '../components/FinishesCabinet'
import '../styles/mk2/page-materials.css'

const materialsList = [
  { id: 1, name: 'Brass', image: '/assets/materials/brass.png' },
  { id: 2, name: 'Copper', image: '/assets/materials/copper.png' },
  { id: 3, name: 'Aluminium', image: '/assets/materials/aluminium.png' },
  { id: 4, name: 'Sheesham', image: '/assets/materials/sheesham.png' },
  { id: 5, name: 'Mango Wood', image: '/assets/materials/mango.png' },
  { id: 6, name: 'Reclaimed Teak', image: '/assets/materials/teak.png' }
]

export default function MaterialsPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const sectionRef = useRef(null)

  useGSAP(() => {
    if (!sectionRef.current) return

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=2200',
      pin: true,
      scrub: 0.8,
      onUpdate: (self) => {
        const numItems = materialsList.length
        const index = Math.min(numItems - 1, Math.floor(self.progress * numItems))
        setActiveIndex((prev) => (prev !== index ? index : prev))
      }
    })
  }, { dependencies: [] })

  const activeMaterial = materialsList[activeIndex]

  return (
    <>
      <div className="mp">
        {/* Page Hero */}
        <section className="page-hero wrap" style={{ minHeight: '30vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <CharCascade as="h1" className="mega">Metals and hardwoods.</CharCascade>
        </section>

        {/* ── 0.1 · MATERIALS SECTION ── */}
        <section className="mp__lamp-section" ref={sectionRef}>
          <div className="mp__slider-wrap mp__slider-wrap--visible" style={{ position: 'absolute', top: '48%', left: '50%', transform: 'translate(-50%, -60%)', width: '100%' }}>
            <MaterialSlider
              materials={materialsList}
              activeIndex={activeIndex}
              onSelect={(i) => setActiveIndex(i)}
            />
          </div>
          <div className="mp__material-label mp__material-label--visible" style={{ position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
            <h2 className="mp__material-name">{activeMaterial.name}</h2>
          </div>
        </section>

        {/* ── 0.2 · FINISHES WE OFFER SECTION (Below Materials) ── */}
        <FinishesCabinet />

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
