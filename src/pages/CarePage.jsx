import { useState } from 'react'
import { CARE } from '../data/site'
import { CharCascade, Dilate } from '../components/Reveal'
import Button from '../components/Button'
import '../styles/mk2/page-editorial.css'

/* ── /care — material care guidance ────────────────────────────────────────
   The material selector is a real toggle group now: each pill carries
   aria-pressed, so the active material is announced rather than being
   signalled by fill colour alone. */

export default function CarePage() {
  const [tab, setTab] = useState(CARE[0].key)
  const activeGuide = CARE.find((c) => c.key === tab) || CARE[0]

  return (
    <>
      <section className="page-hero wrap">
        <div className="hero-kicker">
          <span className="meta">Maintenance &amp; preservation</span>
        </div>
        <CharCascade as="h1" className="mega">Care Guidance</CharCascade>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="care-pills" role="group" aria-label="Choose a material">
            {CARE.map((c) => (
              <button
                key={c.key}
                type="button"
                className="pl-family-pill-btn"
                aria-pressed={c.key === tab}
                onClick={() => setTab(c.key)}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* aria-live so switching material is announced to a screen reader,
              which otherwise gets no signal that the panel changed */}
          <div className="pl-card care-card" aria-live="polite">
            <div className="care-card-head">
              <h2>{activeGuide.name}</h2>
              <span className="meta">{activeGuide.subtitle}</span>
            </div>

            <div className="care-cols">
              <div className="care-col is-do">
                <h3 className="care-col-title">
                  <span className="care-mark" aria-hidden="true">✓</span>
                  Recommended care
                </h3>
                <ul className="care-list">
                  {activeGuide.dos.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>

              <div className="care-col is-avoid">
                <h3 className="care-col-title">
                  <span className="care-mark" aria-hidden="true">✕</span>
                  Things to avoid
                </h3>
                <ul className="care-list">
                  {activeGuide.nevers.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>

            <div className="care-note">
              <p><strong>Note:</strong> {activeGuide.note}</p>
            </div>
          </div>

          <div className="sec-foot" style={{ display: 'flex', justifyContent: 'center' }}>
            <Button to="/contact">Ask about a finish</Button>
          </div>
        </div>
      </section>
    </>
  )
}
