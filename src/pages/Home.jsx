import { Link } from '../lib/router'
import { PROCESS_STAGES, RIBBON_TERMS, HOME_COLLECTIONS, MATERIALS } from '../data/site'
import { railItems } from '../data/catalogue'
import { CharCascade, SmoothReveal, Dilate } from '../components/Reveal'
import '../styles/mk2/page-materials.css'
import HeroBrand from '../components/HeroBrand'
import Slab from '../components/Slab'
import Button from '../components/Button'
import Ribbon from '../components/Ribbon'
import DragRail from '../components/DragRail'
import FinishMorph from '../components/FinishMorph'
import { HeroParallax } from '../components/ui/HeroParallax'
import Stepper from '../components/Stepper'

import Deep from '../components/Deep'
import { productImg } from '../data/images'

/* ── Mark II sections ────────────────────────────────────────────────────
   Each ships its own stylesheet, barrelled through src/styles/mk2/index.css.
   Deliberately NOT on this page: Measured and Ledger — the page was too long,
   so it keeps only the moments that earn their height. Both still exist and
   can be dropped back in. */
import { familySlug } from './CollectionPage'
import TheTurn from '../components/mk2/TheTurn'
import TwoFloors from '../components/mk2/TwoFloors'
import Sampler from '../components/mk2/Sampler'

import ReviewStack from '../components/ReviewStack'
import LogoLoop from '../components/reactbits/LogoLoop'
import CircularGallery from '../components/reactbits/CircularGallery'
import { HeroVideoDialog } from '../components/magicui/HeroVideoDialog'

const countryFlags = [
  { src: "https://flagcdn.com/w160/us.png", alt: "United States", title: "United States" },
  { src: "https://flagcdn.com/w160/gb.png", alt: "United Kingdom", title: "United Kingdom" },
  { src: "https://flagcdn.com/w160/au.png", alt: "Australia", title: "Australia" },
  { src: "https://flagcdn.com/w160/de.png", alt: "Germany", title: "Germany" },
  { src: "https://flagcdn.com/w160/fr.png", alt: "France", title: "France" },
  { src: "https://flagcdn.com/w160/it.png", alt: "Italy", title: "Italy" },
  { src: "https://flagcdn.com/w160/es.png", alt: "Spain", title: "Spain" },
  { src: "https://flagcdn.com/w160/ae.png", alt: "United Arab Emirates", title: "United Arab Emirates" },
  { src: "https://flagcdn.com/w160/ca.png", alt: "Canada", title: "Canada" },
]

const cubeMaterials = [
  { id: 1, name: 'Brass', image: '/assets/materials/brass.png' },
  { id: 2, name: 'Copper', image: '/assets/materials/copper.png' },
  { id: 3, name: 'Aluminium', image: '/assets/materials/aluminium.png' },
  { id: 4, name: 'Sheesham', image: '/assets/materials/sheesham.png' },
  { id: 5, name: 'Mango Wood', image: '/assets/materials/mango.png' },
  { id: 6, name: 'Reclaimed Teak', image: '/assets/materials/teak.png' }
]

export default function Home() {
  return (
    <div className="hp">
      {/* 0.1 · HERO BRAND — the title sequence */}
      <HeroBrand />

      {/* 0.15 · HERO PARALLAX PRODUCTS GRID */}
      <div style={{ marginBlock: '2rem 4rem' }}>
        <HeroParallax />
      </div>

      {/* 0.2 · materials — showcase grid section */}
      <section className="fm-section alt" id="materials" style={{ paddingBlock: '3rem 4rem' }}>
        <div className="sec-head" style={{ position: 'relative', top: 0, left: 0, paddingInline: 'clamp(2.5rem, 5vw, 4.5rem)', marginBottom: '2.5rem' }}>
          <CharCascade as="span" className="meta">Materials we use</CharCascade>
        </div>
        <div className="wrap">
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
        </div>
      </section>

      {/* 0.3 · wave ribbon */}
      <Ribbon terms={RIBBON_TERMS} />

      {/* 0.4 · THE TURN (From us to you) */}
      <div id="the-turn" style={{ position: 'absolute', visibility: 'hidden' }} />
      <TheTurn />

      {/* 0.5 · drag rail — best sellers */}
      <section className="section alt fs-section bestsellers-section" id="catalogue">
        <div className="sec-head">
          <CharCascade as="span" className="meta">Best sellers</CharCascade>
        </div>
        <DragRail label="Featured catalogue" hint="" showNav={false}>
          {railItems().map((p) => (
            <Link key={p.slug} to={`/catalogue/${p.slug}`} className="rail-card" transition="slide-product">
              <Slab tone={p.tone} label={p.name.toUpperCase()} meta={p.material}
                img={productImg(p.slug)} alt={p.name} />
              <div className="rail-card-meta meta"><span>{p.category}</span><span>{p.idx}</span></div>
            </Link>
          ))}
          <Link to="/catalogue" className="rail-card rail-more" transition="slide-collection">
            <Slab tone="walnut" label="VIEW ALL — 20 PIECES" />
            <div className="rail-card-meta meta"><span>Catalogue</span><span>0.2</span></div>
          </Link>
        </DragRail>
      </section>

      {/* 0.6 · TWO FLOORS — drag the brass seam: metal (Moradabad) vs wood
          (Saharanpur). The brand line made literal and operable. */}
      <div id="two-floors" style={{ position: 'absolute', visibility: 'hidden' }} />
      <TwoFloors />

      {/* 0.7 · SAMPLER — five finishes morphing live on one object */}
      <div id="sampler" style={{ position: 'absolute', visibility: 'hidden' }} />
      <Sampler />



      {/* 0.9 · heritage — big video card placeholder */}
      <section className="section deep fs-section" id="heritage">
        <div className="sec-head">
          <CharCascade as="span" className="meta">Heritage</CharCascade>
        </div>
        <div className="wrap">
          <SmoothReveal>
            <div className="heritage-video-card">
              <div className="heritage-video-inner">
                <span className="heritage-play" aria-hidden="true">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="23" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
                    <path d="M19 15L33 24L19 33V15Z" fill="currentColor" opacity="0.85" />
                  </svg>
                </span>
                <span className="heritage-label meta">Video coming soon</span>
              </div>
            </div>
          </SmoothReveal>
        </div>
      </section>

      {/* 0.95 · COUNTRIES SERVED */}
      <div className="wrap" style={{ marginBlock: '3rem' }}>
        <div className="countries-card" id="countries">
          <div style={{ position: 'absolute', top: '1.6rem', left: 0, width: '100%', textAlign: 'center' }}>
            <CharCascade as="span" className="meta" style={{ display: 'inline-block', fontSize: '1.25rem' }}>
              Countries served
            </CharCascade>
          </div>
          <LogoLoop
            logos={countryFlags}
            speed={60}
            direction="left"
            logoHeight={64}
            gap={60}
            hoverSpeed={10}
            scaleOnHover
            ariaLabel="Countries served"
          />
        </div>
      </div>

      {/* 0.98 · BLOGS AND SOCIALS */}
      <section className="section clear fs-section" id="instagram">
        <div className="sec-head">
          <CharCascade as="span" className="meta">Blogs and socials</CharCascade>
        </div>
        <div className="wrap">
          <div className="grid">
            <div className="sp-2">
              <HeroVideoDialog
                animationStyle="from-center"
                videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
                thumbnailSrc={productImg('the-arc')}
                thumbnailAlt="Workshop preview 1"
              />
            </div>
            <div className="sp-2">
              <HeroVideoDialog
                animationStyle="from-center"
                videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
                thumbnailSrc={productImg('the-block')}
                thumbnailAlt="Workshop preview 2"
              />
            </div>
            <div className="sp-2">
              <HeroVideoDialog
                animationStyle="from-center"
                videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
                thumbnailSrc={productImg('the-sweep')}
                thumbnailAlt="Workshop preview 3"
              />
            </div>
            <div className="sp-2">
              <HeroVideoDialog
                animationStyle="from-center"
                videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
                thumbnailSrc={productImg('the-lean')}
                thumbnailAlt="Workshop preview 4"
              />
            </div>
            <div className="sp-2">
              <HeroVideoDialog
                animationStyle="from-center"
                videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
                thumbnailSrc={productImg('the-dip')}
                thumbnailAlt="Workshop preview 5"
              />
            </div>
            <div className="sp-2">
              <HeroVideoDialog
                animationStyle="from-center"
                videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
                thumbnailSrc={productImg('the-turn')}
                thumbnailAlt="Workshop preview 6"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 1.0 · REVIEWS */}
      <section className="section clear fs-section" id="reviews">
        <div className="sec-head">
          <CharCascade as="span" className="meta">Reviews</CharCascade>
        </div>
        <div style={{ marginTop: 'clamp(3.5rem, 7vw, 6rem)' }}>
          <ReviewStack />
        </div>
        
        {/* Big Designer Connect Button */}
        <SmoothReveal style={{ display: 'flex', justifyContent: 'center', marginTop: '3.5rem', marginBottom: '2rem' }}>
          <Link to="/contact" className="big-connect-btn">
            <span>Connect</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </SmoothReveal>
      </section>


    </div>
  )
}
