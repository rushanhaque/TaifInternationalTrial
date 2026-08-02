import { useState } from 'react'
import { CARE } from '../data/site'
import { CharCascade, Dilate } from '../components/Reveal'
import Toggle from '../components/Toggle'
import Button from '../components/Button'
import Patina from '../components/mk2/Patina'

export default function CarePage() {
  const [tab, setTab] = useState(CARE[0].key)
  const guide = CARE.find((c) => c.key === tab)

  return (
    <>
      <section className="page-hero wrap">
        <p className="hero-kicker"><span className="idx">1.0</span> <span className="meta">Care</span></p>
        <CharCascade as="h1" className="mega">Keep it well.</CharCascade>
        <Dilate>
          <p className="lede">
            Four surfaces, four habits. Almost nothing here needs a product — mostly
            it needs a dry cloth, ten minutes a year, and restraint.
          </p>
        </Dilate>
      </section>

      {/* the dial — care advice made tangible before it is written out */}
      <Patina />

      <section className="section alt">
        <div className="wrap">
          <Toggle
            label="Choose a material"
            options={CARE.map((c) => ({ value: c.key, label: c.name }))}
            value={tab}
            onChange={setTab}
          />
          <Dilate key={tab} className="care-panel">
            <div className="grid">
              <div className="sp-5 care-col">
                <h3 className="d3">Do</h3>
                <ul className="care-list">
                  {guide.dos.map((d) => <li key={d}>{d}</li>)}
                </ul>
              </div>
              <div className="sp-5 st-7 care-col never">
                <h3 className="d3">Never</h3>
                <ul className="care-list">
                  {guide.nevers.map((d) => <li key={d}>{d}</li>)}
                </ul>
              </div>
            </div>
            <p className="body care-note">{guide.note}</p>
          </Dilate>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid">
          <div className="sp-7">
            <CharCascade as="h2" className="d1">The repair bench is permanent.</CharCascade>
            <Dilate>
              <p className="body" style={{ marginTop: '1.2rem' }}>
                Anything we made, we can re-polish, re-seal, re-oil or raise a dent
                from — usually for the cost of freight. A piece still in use in twenty
                years is better marketing than anything on this site.
              </p>
              <div className="hero-cta">
                <Button to="/contact">Arrange a repair</Button>
              </div>
            </Dilate>
          </div>
        </div>
      </section>
    </>
  )
}
