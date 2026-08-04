import { useRef, useState, useEffect, useCallback } from 'react'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from '../lib/gsap'
import { MATERIALS } from '../data/site'
import { CharCascade, Dilate } from '../components/Reveal'
import Counter from '../components/Counter'
import Slab from '../components/Slab'
import Deep from '../components/Deep'
import Button from '../components/Button'
import { MATERIAL_IMGS } from '../data/images'

import ParticleScroll from '../components/mk2/ParticleScroll'

import LampSection from '../components/LampSection';
import MaterialSlider from '../components/MaterialSlider';
import '../styles/mk2/page-materials.css';

const cubeMaterials = [
  {
    id: 1,
    name: 'Brass',
    image: '/assets/materials/brass.png',
    desc: 'Classic, resonant, and golden tones.',
    lamp: { from: '#b0894f', to: '#e3c88f', glow: 'rgba(176, 137, 79, 0.60)' },
  },
  {
    id: 2,
    name: 'Copper',
    image: '/assets/materials/copper.png',
    desc: 'Conductive, rich, and industrial feel.',
    lamp: { from: '#b4703c', to: '#e0a275', glow: 'rgba(180, 112, 60, 0.60)' },
  },
  {
    id: 3,
    name: 'Aluminium',
    image: '/assets/materials/aluminium.png',
    desc: 'Lightweight, durable, and sleek finish.',
    lamp: { from: '#8ab4d0', to: '#c8e2f2', glow: 'rgba(138, 180, 208, 0.55)' },
  },
  {
    id: 4,
    name: 'Sheesham',
    image: '/assets/materials/sheesham.png',
    desc: 'Dense, dark and interlocked (Indian Rosewood).',
    lamp: { from: '#543b22', to: '#8c603a', glow: 'rgba(84, 59, 34, 0.60)' },
  },
  {
    id: 5,
    name: 'Mango Wood',
    image: '/assets/materials/mango.png',
    desc: 'Pale, open-grained and beautiful under oil.',
    lamp: { from: '#d4a373', to: '#faedcd', glow: 'rgba(212, 163, 115, 0.60)' },
  },
  {
    id: 6,
    name: 'Reclaimed Teak',
    image: '/assets/materials/teak.png',
    desc: 'Salvaged from old structures, flat and seasoned.',
    lamp: { from: '#9c6644', to: '#e6ccb2', glow: 'rgba(156, 102, 68, 0.60)' },
  }
];

export default function MaterialsPage() {
  const [cubeActiveIndex, setCubeActiveIndex] = useState(0);
  const [lampVisible, setLampVisible] = useState(false);
  const lampSectionRef = useRef(null);

  useGSAP(() => {
    if (!lampSectionRef.current) return;

    ScrollTrigger.create({
      trigger: lampSectionRef.current,
      start: 'top top',
      end: '+=6000', // Increased from 3000px to 6000px to slow down transitions
      pin: true,
      scrub: 1.5, // Use a number for smooth interpolation instead of 'true'
      snap: {
        snapTo: 1 / (cubeMaterials.length - 1),
        duration: { min: 0.2, max: 0.8 },
        delay: 0.05,
        ease: "power2.inOut"
      },
      onUpdate: (self) => {
        const numItems = cubeMaterials.length;
        const index = Math.min(numItems - 1, Math.floor(self.progress * numItems));
        
        setCubeActiveIndex((prev) => {
          if (prev !== index) return index;
          return prev;
        });
      }
    });
  }, { dependencies: [] });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setLampVisible(visible);
      },
      { threshold: 0.15 }
    );
    if (lampSectionRef.current) observer.observe(lampSectionRef.current);
    return () => observer.disconnect();
  }, []);

  const activeCubeMaterial = cubeMaterials[cubeActiveIndex];

  return (
    <ParticleScroll>
      <div className="mp">
        <section className="page-hero wrap" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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

        <section className="mp__lamp-section" ref={lampSectionRef} style={{ marginBottom: '8rem' }}>
          <div className="mp__lamp-row">
            <LampSection
              color={activeCubeMaterial.lamp}
              materialName={activeCubeMaterial.name}
              visible={lampVisible}
            />
          </div>
          <div className={`mp__slider-wrap ${lampVisible ? 'mp__slider-wrap--visible' : ''}`}>
            <MaterialSlider
              materials={cubeMaterials}
              activeIndex={cubeActiveIndex}
            />
          </div>
          <div className={`mp__material-label ${lampVisible ? 'mp__material-label--visible' : ''}`}>
            <h2 className="mp__material-name">{activeCubeMaterial.name}</h2>
            <p className="mp__material-desc">{activeCubeMaterial.desc}</p>
          </div>
        </section>

      <section className="mp__showcase-section">
        <div className="mp__showcase-header">
          <CharCascade as="h2" className="d1" style={{ color: 'var(--chrome)', marginBottom: '1rem' }}>
            The Library
          </CharCascade>
        </div>
        
        <div className="mp__showcase-grid">
          {MATERIALS.map((m, i) => (
            <div key={`showcase-${m.name}`} className="mp__showcase-card" tabIndex="0">
              <img 
                src={cubeMaterials[i].image} 
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
      </div>
    </ParticleScroll>
  )
}
