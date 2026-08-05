import { Link } from '../lib/router'
import { PROCESS_STAGES, RIBBON_TERMS, HOME_COLLECTIONS } from '../data/site'
import { railItems } from '../data/catalogue'
import { CharCascade, Dilate } from '../components/Reveal'
import HeroBrand from '../components/HeroBrand'
import Slab from '../components/Slab'
import Button from '../components/Button'
import Ribbon from '../components/Ribbon'
import DragRail from '../components/DragRail'
import FinishMorph from '../components/FinishMorph'
import { HeroParallax } from '../components/ui/HeroParallax'
import Stepper from '../components/Stepper'
import Tension from '../components/Tension'
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

export default function Home() {
  return (
    <>

      {/* 0.1 · hero — the brand name, and nothing else (E18) */}
      <div id="top" />
      <HeroBrand />

      {/* 0.15 · collections parallax */}
      <div id="collections-1" />
      <div style={{ position: 'relative', zIndex: 2, background: 'var(--bg)' }}>
        <HeroParallax />
      </div>

      {/* 0.2 · materials — finish morph section */}
      <section className="fm-section alt" id="materials">
        <div className="wrap">
        <FinishMorph
          mode="scroll"
          finishes={HOME_COLLECTIONS}
          label="MATERIALS"
        />
        </div>
      </section>

      {/* 0.3 · wave ribbon */}
      <Ribbon terms={RIBBON_TERMS} />

      {/* 0.4 · THE TURN (From us to you) */}
      <div id="the-turn" style={{ position: 'absolute', visibility: 'hidden' }} />
      <TheTurn />

      {/* 0.5 · drag rail — the signature piece */}
      <section className="section alt fs-section" id="catalogue">
        <div className="sec-head"><span className="meta">Signature piece</span></div>
        <DragRail label="Featured catalogue" hint="">
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

      {/* 0.8 · surface tension into the deep section */}
      <Tension from="white" />

      {/* 0.9 · process teaser — transparent ground, sits on the page colour */}
      <section className="section clear fs-section" id="process">
        <div className="sec-head"><span className="meta">Process</span></div>
        <div className="wrap">
          <div className="grid">
            <div className="sp-8">
              <Stepper stages={PROCESS_STAGES} teaser />
            </div>
            <div className="sp-4 proc-aside">
              <Dilate>
                <p className="body dim">
                  Three of eight stages. The full line runs from certified stock and a
                  seasoning yard through to a packed carton — every hand-off recorded.
                </p>
                <Button to="/catalogue">What we can make</Button>
              </Dilate>
            </div>
          </div>
        </div>
      </section>

      {/* 0.95 · COUNTRIES SERVED */}
      <div className="wrap" style={{ marginBlock: '4rem' }}>
        <div className="countries-card" id="countries">
          <div style={{ position: 'absolute', top: '3rem', left: 0, width: '100%', textAlign: 'center' }}>
            <span className="meta" style={{ display: 'inline-block', transform: 'scale(1.5)' }}>Countries served</span>
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

      {/* 0.98 · INSTAGRAM */}
      <section className="section clear fs-section" id="instagram">
        <div className="sec-head"><span className="meta">Blogs and socials</span></div>
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
        <div className="sec-head"><span className="meta">Reviews</span></div>
        <ReviewStack />
        
        {/* Big Designer Connect Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3.5rem', marginBottom: '2rem' }}>
          <Link to="/contact" className="big-connect-btn">
            <span>Connect</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>


    </>
  )
}
