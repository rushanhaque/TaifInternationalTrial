import { useRef, useEffect } from 'react'
import { Link } from '../lib/router'
import { gsap, ScrollTrigger, reduced } from '../lib/gsap'
import { useCounter } from '../lib/hooks'
import { PROCESS_STAGES, RIBBON_TERMS, HOME_COLLECTIONS, MATERIALS, FINISHES } from '../data/site'
import { railItems } from '../data/catalogue'
import { CharCascade, SmoothReveal, Dilate, CardsReveal } from '../components/Reveal'
import '../styles/mk2/page-materials.css'
/* the home Reviews block reuses the testimonial card styling */
import '../styles/mk2/page-editorial.css'
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
import Sampler from '../components/mk2/Sampler'
import MaskedHeading from '../components/MaskedHeading'

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

const REVIEW_CARDS = [
  {
    id: 1,
    tone: 'walnut',
    category: 'VERIFIED ORDER',
    idx: '01',
    stars: '★★★★★',
    quote: '"They send a moisture reading with the sample. Nobody else in this category has ever done that unprompted."',
    client: 'Meridian Living',
    role: 'Head of Product',
    tag: '300 PCS · 0 RETURNS'
  },
  {
    id: 2,
    tone: 'brass',
    category: 'INLAY PROJECT',
    idx: '02',
    stars: '★★★★★',
    quote: '"The brass inlay is the reason we moved. Four suppliers promised flush finish; only Taif delivered it."',
    client: 'Atelier Kade',
    role: 'Founding Partner',
    tag: '36 SKUS · 0.5% DEFECTS'
  },
  {
    id: 3,
    tone: 'copper',
    category: 'HOTEL SPEC',
    idx: '03',
    stars: '★★★★★',
    quote: '"Four properties, one patina, zero visible variation. Housekeeping notices these things before we do."',
    client: 'Halcyon Hotels',
    role: 'Procurement Director',
    tag: 'GLOBAL BOUTIQUE SUITES'
  },
  {
    id: 4,
    tone: 'antique',
    category: 'ARCHITECTURAL',
    idx: '04',
    stars: '★★★★★',
    quote: '"Precision hand-carved teak paired with solid unlacquered brass. Flawless craftsmanship from Moradabad."',
    client: 'Studio Moradabad',
    role: 'Lead Architect',
    tag: 'KILN-DRIED HARDWOOD'
  },
  {
    id: 5,
    tone: 'inlay',
    category: 'EXPORT LINE',
    idx: '05',
    stars: '★★★★★',
    quote: '"Every container arrives with mill certificates and batch reports inside. Incredible consistency quarter after quarter."',
    client: 'Oberoi Spaces',
    role: 'Design Director',
    tag: '16 EXPORT MARKETS'
  }
]

function StatCard({ target, suffix = '+', label, sub, duration = 1800 }) {
  const [ref, count] = useCounter(target, duration)
  return (
    <div className="about-stat-card" ref={ref}>
      <div className="about-stat-number">
        {count}{suffix}
      </div>
      <div className="about-stat-label">{label}</div>
      <div className="about-stat-sub">{sub}</div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="hp">
      {/* 0.1 · HERO BRAND — the title sequence */}
      <HeroBrand />

      <div className="section-divider" />

      {/* 0.15 · HERO PARALLAX PRODUCTS GRID */}
      <div style={{ marginBlock: '2rem 5.5rem' }}>
        <HeroParallax />
      </div>

      <div className="section-divider" />

      {/* 0.3 · wave ribbon */}
      <Ribbon terms={RIBBON_TERMS} />

      <div className="section-divider" />

      {/* 0.5 · SAMPLER — signature piece zoom transition sampler */}
      <Sampler />

      <div className="section-divider" />

      {/* 0.9 · THE CRAFT — Full-screen Heritage Section (ported from Barha). */}
      <div className="craft-card-spacer" style={{
        marginTop: 'clamp(50rem, 65vh, 56rem)',
        position: 'relative',
        zIndex: 2,
      }}>
        <Heritage />
      </div>

      <div className="section-divider" />

      {/* 0.4 · THE TURN (Materials We Use) — moved below Heritage */}
      <div id="the-turn" style={{ position: 'absolute', visibility: 'hidden' }} />
      <TheTurn />

      <div className="section-divider" />

      {/* 0.92 · HERITAGE NARRATIVE & PROCESS SECTION */}
      <section className="section clear fs-section craft-about-section" id="craft">
        <div className="sec-head">
          <CharCascade as="span" className="meta">Heritage</CharCascade>
        </div>
        <div className="wrap">
          <div className="craft-container">
            {/* Top Split: Narrative + 5-Step Process */}
            <div className="craft-main-grid">
              {/* Left Narrative Column */}
              <div className="craft-intro">
                <h3 className="craft-headline">
                  A hundred hammers, <span className="craft-highlight">one steady hand.</span>
                </h3>
                <p className="craft-body">
                  In Moradabad, metal is not manufactured — it is coaxed. Sheet becomes vessel under thousands of measured blows; colour is drawn from the surface with heat and time. Every piece passes along a line of dedicated specialists — one master cuts the disc, another raises it, others chase, patinate and burnish. Nothing is rushed; nothing is repeated exactly.
                </p>
                <div className="craft-cta">
                  <Button to="/about">Inside the Atelier</Button>
                </div>
              </div>

              {/* Right Column: 5 Process Steps */}
              <ol className="craft-process-list">
                <li className="craft-process-item">
                  <span className="craft-process-num">01</span>
                  <div className="craft-process-content">
                    <h4 className="craft-process-title">The Disc</h4>
                    <p className="craft-process-desc">
                      Every piece begins as a flat disc of sheet metal and a fire. The maker chooses the gauge by the object it will become — by hand, never machine.
                    </p>
                  </div>
                </li>
                <li className="craft-process-item">
                  <span className="craft-process-num">02</span>
                  <div className="craft-process-content">
                    <h4 className="craft-process-title">Raising</h4>
                    <p className="craft-process-desc">
                      Struck thousands of times against a stake, the flat sheet climbs into a vessel. The metal hardens as it rises and is annealed in fire to soften it again — over and over, for days.
                    </p>
                  </div>
                </li>
                <li className="craft-process-item">
                  <span className="craft-process-num">03</span>
                  <div className="craft-process-content">
                    <h4 className="craft-process-title">Chasing</h4>
                    <p className="craft-process-desc">
                      Line and ornament are walked into the surface with hammer and punch — from the front for relief, from the back for repoussé.
                    </p>
                  </div>
                </li>
                <li className="craft-process-item">
                  <span className="craft-process-num">04</span>
                  <div className="craft-process-content">
                    <h4 className="craft-process-title">Patina</h4>
                    <p className="craft-process-desc">
                      Colour is drawn from the metal with heat, time and a few quiet chemistries — antique, oxblood, verdigris or blackened — then arrested at the exact moment it is right.
                    </p>
                  </div>
                </li>
                <li className="craft-process-item">
                  <span className="craft-process-num">05</span>
                  <div className="craft-process-content">
                    <h4 className="craft-process-title">Burnish</h4>
                    <p className="craft-process-desc">
                      The surface is brought to its final lustre by hand against stone and steel. A piece is finished when the maker can find nothing left to improve.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Bottom Row: 4 Atelier Stats Placards with scroll-triggered counting animation */}
            <div className="about-stats-grid">
              <StatCard
                target={15}
                suffix="+"
                label="Hands in the workshop"
                sub="Specialist masters under one roof"
              />
              <StatCard
                target={600}
                suffix="+"
                label="Pieces delivered per year"
                sub="Each piece finished by hand"
              />
              <StatCard
                target={18}
                suffix="+"
                label="Countries served"
                sub="Global boutique export"
              />
              <StatCard
                target={10}
                suffix="+"
                label="Years of excellence"
                sub="Est. Moradabad atelier"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* 0.95 · COUNTRIES SERVED */}
      <section className="section clear countries-section-wrap" id="countries">
        <div className="wrap">
          <div className="countries-card">
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
      </section>

      <div className="section-divider" />

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

      <div className="section-divider" />

      {/* 1.0 · REVIEWS DRAG RAIL WITH SCROLL TRIGGER ANIMATION */}
      <ReviewsSection />

    </div>
  )
}

const HOME_TESTIMONIALS = [
  {
    id: 1,
    category: 'VERIFIED ORDER',
    stars: '★★★★★',
    quote: '"They send a moisture reading with the sample. Nobody else in this category has ever done that unprompted."',
    client: 'Meridian Living',
    role: 'Head of Product',
    tag: '300 PCS · 0 RETURNS',
    location: 'Frankfurt, Germany'
  },
  {
    id: 2,
    category: 'INLAY PROJECT',
    stars: '★★★★★',
    quote: '"The brass inlay is the reason we moved. Four suppliers promised flush finish; only Taif delivered it."',
    client: 'Atelier Kade',
    role: 'Founding Partner',
    location: 'Paris, France'
  },
  {
    id: 3,
    category: 'HOTEL SPEC',
    stars: '★★★★★',
    quote: '"Four properties, one patina, zero visible variation. Housekeeping notices these things before we do."',
    client: 'Halcyon Hotels',
    role: 'Procurement Director',
    tag: 'GLOBAL BOUTIQUE SUITES',
    location: 'Dubai, UAE'
  },
  {
    id: 4,
    category: 'ARCHITECTURAL',
    stars: '★★★★★',
    quote: '"Precision hand-carved teak paired with solid unlacquered brass. Flawless craftsmanship from Moradabad."',
    client: 'Studio Moradabad',
    role: 'Lead Architect',
    tag: 'KILN-DRIED HARDWOOD',
    location: 'London, UK'
  },
  {
    id: 5,
    category: 'EXPORT LINE',
    stars: '★★★★★',
    quote: '"Every container arrives with mill certificates and batch reports inside. Incredible consistency quarter after quarter."',
    client: 'Oberoi Spaces',
    role: 'Global Trade VP',
    tag: '4 CONTAINER SHIPMENTS',
    location: 'Toronto, Canada'
  },
  {
    id: 6,
    category: 'RETAIL COLLECTION',
    stars: '★★★★★',
    quote: '"Our customers immediately touch the unlacquered brass finish. It patinas beautifully over time."',
    client: 'Vanguard Home',
    role: 'Creative Director',
    tag: '1,200 UNITS DELIVERED',
    location: 'New York, USA'
  }
]

function ReviewsSection() {
  return (
    <section className="section alt fs-section bestsellers-section" id="reviews" style={{ paddingBlock: '4rem 3rem' }}>
      <div className="wrap">
        <div className="sec-head" style={{ marginBottom: '2.5rem' }}>
          <CharCascade as="span" className="meta">Reviews and testimonials</CharCascade>
        </div>

        <CardsReveal className="home-reviews-grid" selector=":scope > .tm-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.8rem' }}>
          {HOME_TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="pl-card tm-card"
              style={{
                padding: '2rem 1.8rem',
                borderRadius: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div className="tm-card-head">
                  <span className="tm-cat">{t.category}</span>
                  <span className="tm-stars">{t.stars}</span>
                </div>
                <p className="tm-quote">{t.quote}</p>
              </div>

              <div className="tm-card-foot">
                <div>
                  <h3 className="tm-client">{t.client}</h3>
                  <p className="tm-role">{t.role} · {t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </CardsReveal>
      </div>
    </section>
  )
}

function Heritage() {
  const bgVideo = "https://res.cloudinary.com/djszwbnxp/video/upload/v1786264932/IMG_0205_n1mn8t.mp4"
  const bgVideoRef = useRef(null)

  return (
    <section className="section craft-card-wrapper" id="heritage">
      <div className="wrap">
        <div className="craft-card-container">
          {/* Background Video */}
          <div className="craft-card__video-wrap">
            <video
              ref={bgVideoRef}
              className="craft-card__video-bg"
              autoPlay
              loop
              muted
              playsInline
              src={bgVideo}
            />
            <div className="craft-card__overlay" />
          </div>

          {/* Centered THE CRAFT Text */}
          <div className="craft-card__content">
            <MaskedHeading
              text="THE CRAFT"
              mediaType="video"
              src={bgVideo}
              syncVideoRef={bgVideoRef}
              fillScale={1.35}
              parallax={32}
              brightness={1.05}
              saturation={1.0}
              reveal="wipe"
              trigger="view"
              textScale={0.11}
              weight={900}
              tracking={0.035}
              lineHeight={1.0}
              align="center"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
