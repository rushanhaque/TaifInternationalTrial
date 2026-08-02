import { TIMELINE, PRINCIPLES, TEAM, BRAND } from '../data/site'
import { CharCascade, Dilate } from '../components/Reveal'
import Slab from '../components/Slab'
import Button from '../components/Button'
import { WORKSHOP_IMGS } from '../data/images'
import Timeline from '../components/mk2/Timeline'

const TEAM_TONES = ['brass', 'wood', 'copper', 'antique', 'walnut', 'inlay']

export default function AboutPage() {
  return (
    <>
      <section className="page-hero wrap">
        <p className="hero-kicker"><span className="idx">0.8</span> <span className="meta">About · est. {BRAND.est}</span></p>
        <CharCascade as="h1" className="mega">Two floors.</CharCascade>
        <Dilate>
          <p className="lede">
            A metal floor in Moradabad and a wood floor in Saharanpur, run to one
            drawing and one calendar. Since {BRAND.est} — long enough to have learned
            what moisture does, and young enough to still measure it.
          </p>
        </Dilate>
      </section>

      {/* the chronology, as a rail that fills while you read */}
      <Timeline />

      <section className="section">
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.8</span><span className="meta">Principles</span></div>
          <div className="grid">
            {PRINCIPLES.map((p, i) => (
              <Dilate key={p.name} className="sp-6 principle-card" delay={i * 0.08}>
                <span className="idx">0.{i + 1}</span>
                <h3 className="d3">{p.name}</h3>
                <p className="body">{p.copy}</p>
              </Dilate>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.8</span><span className="meta">The people</span></div>
          <div className="grid">
            {TEAM.map((m, i) => (
              <div key={m.name} className="sp-4 team-card">
                <Slab tone={TEAM_TONES[i]} ratio="4/5" label={m.name.toUpperCase()} meta={m.role} bead
                  img={WORKSHOP_IMGS[i % WORKSHOP_IMGS.length]} alt={m.role} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: '2.2rem' }}>
            <Button to="/contact" variant="ghost">Visit the works</Button>
          </div>
        </div>
      </section>
    </>
  )
}
