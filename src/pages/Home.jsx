import { useRef, useEffect } from 'react'
import { Link } from '../lib/router'
import { gsap, ScrollTrigger, reduced } from '../lib/gsap'
import { useCounter } from '../lib/hooks'
import { PROCESS_STAGES, RIBBON_TERMS, HOME_COLLECTIONS, MATERIALS, FINISHES } from '../data/site'
import { useContent, railProducts } from '../lib/content'
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
import CollectionsMosaic from '../components/CollectionsMosaic'
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
import Philosophy from '../components/mk2/Philosophy'
import MaterialGuidance from '../components/mk2/MaterialGuidance'
import FinishesShowcase from '../components/mk2/FinishesShowcase'
import MaskedHeading from '../components/MaskedHeading'

import LogoLoop from '../components/reactbits/LogoLoop'
import CircularGallery from '../components/reactbits/CircularGallery'
import { HeroVideoDialog } from '../components/magicui/HeroVideoDialog'

/* The export markets, in the order given by the client. The count here is what
   the "Countries served" figure should agree with — 16 — so if a market is
   added or dropped, update that figure in /admin → Figures to match.

   "Europe" is a region rather than a country and carries the EU flag; it sits
   alongside France, Italy, Spain and Switzerland, which are themselves in
   Europe. That is how the list was supplied. */
const countryFlags = [
  { src: "https://flagcdn.com/w160/gb.png", alt: "United Kingdom", title: "United Kingdom" },
  { src: "https://flagcdn.com/w160/us.png", alt: "United States", title: "United States" },
  { src: "https://flagcdn.com/w160/eu.png", alt: "Europe", title: "Europe" },
  { src: "https://flagcdn.com/w160/za.png", alt: "South Africa", title: "South Africa" },
  { src: "https://flagcdn.com/w160/au.png", alt: "Australia", title: "Australia" },
  { src: "https://flagcdn.com/w160/bd.png", alt: "Bangladesh", title: "Bangladesh" },
  { src: "https://flagcdn.com/w160/ca.png", alt: "Canada", title: "Canada" },
  { src: "https://flagcdn.com/w160/cr.png", alt: "Costa Rica", title: "Costa Rica" },
  { src: "https://flagcdn.com/w160/fr.png", alt: "France", title: "France" },
  { src: "https://flagcdn.com/w160/it.png", alt: "Italy", title: "Italy" },
  { src: "https://flagcdn.com/w160/ke.png", alt: "Kenya", title: "Kenya" },
  { src: "https://flagcdn.com/w160/ae.png", alt: "United Arab Emirates", title: "United Arab Emirates" },
  { src: "https://flagcdn.com/w160/tr.png", alt: "Turkey", title: "Turkey" },
  { src: "https://flagcdn.com/w160/ch.png", alt: "Switzerland", title: "Switzerland" },
  { src: "https://flagcdn.com/w160/sg.png", alt: "Singapore", title: "Singapore" },
  { src: "https://flagcdn.com/w160/es.png", alt: "Spain", title: "Spain" },
]

/* (a fourth hardcoded copy of the reviews lived here, feeding a ReviewStack
   that was never rendered — removed so /admin is the single place reviews
   are edited) */

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
  const blogs = useContent('blogs')
  const stats = useContent('stats')
  const announcements = useContent('announcements')

  return (
    <div className="hp">
      {/* top announcement bar — items editable via Admin → Offers */}
      {announcements.length > 0 && (
        <div className="announce-bar" aria-label="Announcement">
          <div className="announce-track">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="announce-seg" aria-hidden={i > 0 ? 'true' : undefined}>
                {/* a Fragment, not a wrapping span: .announce-seg is the flex
                    container and its `gap` only separates DIRECT children, so
                    boxing each pair up would leave the star jammed against the
                    word it follows */}
                {announcements.map((a, j) => (
                  <span key={a.id ?? j} className="announce-item">
                    {a.text}
                    <span className="announce-dot" aria-hidden="true">✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 0.1 · HERO BRAND — the title sequence */}
      <HeroBrand />

      <div className="section-divider" />

      {/* 0.15 · THE VITRINE — nine collections on one screen */}
      <CollectionsMosaic />

      <div className="vitrine-cta">
        <Button to="/contact" variant="ghost" small>Begin a bespoke commission</Button>
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

      {/* 0.41 · PERSONAL GUIDANCE — a consultation CTA directly under Materials */}
      <MaterialGuidance />

      {/* 0.42 · FINISHES, AT A GLANCE — below the guidance CTA: pick a
          metal, get pointed to a person, then see what it can look like */}
      <FinishesShowcase />

      <div className="section-divider" />

      {/* 0.92 · HERITAGE NARRATIVE & PROCESS SECTION */}
      <section className="section clear fs-section craft-about-section" id="craft">
        <div className="wrap">
          <div className="craft-container">
            <div className="craft-sec-head">
              <h2 className="craft-sec-title">Heritage</h2>
            </div>

            {/* Top Split: Narrative + 5-Step Process */}
            <div className="craft-main-grid">
              {/* Left Narrative Column */}
              <div className="craft-intro">
                {/* The small "Heritage" kicker that used to open this column is
                    gone — the section now carries a full-size Heritage heading
                    at top centre, and the two together said it twice. */}
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
              {stats.map((s) => (
                <StatCard
                  key={s.id}
                  target={Number(s.value) || 0}
                  suffix={s.suffix}
                  label={s.label}
                  sub={s.sub}
                />
              ))}
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
            {blogs.map((b) => (
              <div className="sp-2" key={b.id}>
                <a
                  href={b.link || b.videoSrc}
                  target="_blank"
                  rel="noreferrer"
                  className="blog-card"
                  aria-label={b.alt || b.title}
                >
                  <img src={b.thumbnail} alt={b.alt || b.title} className="blog-card-img" />
                  <span className="blog-play" aria-hidden="true">▶</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* 0.95 · OUR CORE PHILOSOPHY — three commitments, ahead of reviews */}
      <Philosophy />

      <div className="section-divider" />

      {/* 1.0 · REVIEWS DRAG RAIL WITH SCROLL TRIGGER ANIMATION */}
      <ReviewsSection />

    </div>
  )
}

/* reviews come from the shared content store so /admin edits both this
   rail and the /testimonials page from one list */

function ReviewsSection() {
  const reviews = useContent('reviews')

  return (
    <section className="section alt fs-section bestsellers-section" id="reviews" style={{ paddingBlock: '4rem 3rem' }}>
      <div className="wrap">
        <div className="sec-head" style={{ marginBottom: '2.5rem' }}>
          <CharCascade as="span" className="meta">What our clients say</CharCascade>
        </div>

        <CardsReveal className="home-reviews-grid" selector=":scope > .tm-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.8rem' }}>
          {reviews.map((t) => (
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
                  <span className="tm-stars" role="img" aria-label={`${t.stars} out of 5`}>
                    <span aria-hidden="true">{'★'.repeat(Number(t.stars) || 0)}</span>
                  </span>
                </div>
                <p className="tm-quote">“{t.quote}”</p>
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
