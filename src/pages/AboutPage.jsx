import { useEffect, useRef } from 'react'
import { TIMELINE, PRINCIPLES, BRAND } from '../data/site'
import { CharCascade, Dilate } from '../components/Reveal'
import Button from '../components/Button'
import MaskedHeading from '../components/MaskedHeading'
import Timeline from '../components/mk2/Timeline'
import SlatShow from '../components/mk2/SlatShow'


export default function AboutPage() {
  const bgVideo = "https://res.cloudinary.com/djszwbnxp/video/upload/v1786264932/IMG_0205_n1mn8t.mp4"
  const posterImg = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop"
  const bgVideoRef = useRef(null)

  return (
    <>
      {/* Top Hero Header — the shared masthead, so this page opens on the
          same line as every other inner page rather than 57px higher */}
      <section className="page-hero wrap">
        <div className="hero-kicker">
          {/* a plain span, as on every other masthead — CharCascade renders a
              block wrapper that dropped this kicker 22px below the others */}
          <span className="meta">About Us</span>
        </div>
        <CharCascade as="h1" className="mega">Where metal meets grain.</CharCascade>
      </section>

      {/* ── 0.1 · HERITAGE & THE CRAFT SECTION ── */}
      <section className="section craft-card-wrapper" id="heritage" style={{ paddingTop: '0' }}>
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

      {/* HERITAGE NARRATIVE & PROCESS SECTION */}
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
                  <Button to="/contact">Inside the Atelier</Button>
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
                    <h4 className="craft-process-title">Patination</h4>
                    <p className="craft-process-desc">
                      Heat, acid and oxides aged onto the warm metal to draw out deep umbers, vert-de-gris and centuries-old bronze depth.
                    </p>
                  </div>
                </li>
                <li className="craft-process-item">
                  <span className="craft-process-num">05</span>
                  <div className="craft-process-content">
                    <h4 className="craft-process-title">Burnishing</h4>
                    <p className="craft-process-desc">
                      Worked to a low, warm shine with a steel burnisher rather than a buffing mop, keeping its handmade depth forever.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>



      {/* the chronology, as a rail that fills while you read */}
      <Timeline />

      <SlatShow />

      <section className="section">
        <div className="wrap">
          <div className="sec-head"><span className="meta">Principles</span></div>
          <div className="grid">
            {PRINCIPLES.map((p, i) => (
              <Dilate key={p.name} className="sp-6 principle-card" delay={i * 0.08}>
                <h3 className="d3">{p.name}</h3>
                <p className="body">{p.copy}</p>
              </Dilate>
            ))}
          </div>
        </div>
      </section>

    </>
  )
}
