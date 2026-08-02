import { useState } from 'react'
import { Link } from '../lib/router'
import { PROCESS_STAGES, PARTNERS, RIBBON_TERMS, CERTS, HOME_COLLECTIONS } from '../data/site'
import { railItems } from '../data/catalogue'
import { CharCascade, Dilate } from '../components/Reveal'
import HeroBrand from '../components/HeroBrand'
import Slab from '../components/Slab'
import Button from '../components/Button'
import Ribbon from '../components/Ribbon'
import DragRail from '../components/DragRail'
import FinishMorph from '../components/FinishMorph'
import Stepper from '../components/Stepper'
import Toggle from '../components/Toggle'
import Tension from '../components/Tension'
import Deep from '../components/Deep'
import { productImg } from '../data/images'

const PARTNER_CATS = ['All', 'Hospitality', 'Retail', 'Design', 'Architecture']

export default function Home() {
  const [pcat, setPcat] = useState('All')
  const partners = pcat === 'All' ? PARTNERS : PARTNERS.filter((p) => p.cat === pcat)

  return (
    <>
      {/* 0.1 · hero — the brand name, and nothing else (E18) */}
      <HeroBrand />

      {/* 0.2 · collections (formerly finishes) — slides up like a stacked card after the hero */}
      <section className="fm-section alt home-position">
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.1</span><span className="meta">Collections</span></div>
        </div>
        <FinishMorph mode="scroll" finishes={HOME_COLLECTIONS} label="COLLECTIONS" />
        <div className="wrap fm-after">
          <Button to="/catalogue" variant="ghost">See it on the pieces</Button>
        </div>
      </section>

      {/* 0.3 · wave ribbon */}
      <Ribbon terms={RIBBON_TERMS} />

      {/* 0.4 · drag rail — the signature interaction */}
      <section className="section alt">
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.2</span><span className="meta">Catalogue</span></div>
          <DragRail label="Featured catalogue" hint="Drag · fling · release">
            {railItems().map((p) => (
              <Link key={p.slug} to={`/catalogue/${p.slug}`} className="rail-card">
                <Slab tone={p.tone} label={p.name.toUpperCase()} meta={p.material} bead
                  img={productImg(p.slug)} alt={p.name} />
                <div className="rail-card-meta meta"><span>{p.category}</span><span>{p.idx}</span></div>
              </Link>
            ))}
            <Link to="/catalogue" className="rail-card rail-more">
              <Slab tone="walnut" label="VIEW ALL — 20 PIECES" />
              <div className="rail-card-meta meta"><span>Catalogue</span><span>0.2</span></div>
            </Link>
          </DragRail>
        </div>
      </section>

      {/* 0.5 · positioning */}
      <section className="section alt">
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.3</span><span className="meta">Position</span></div>
          <div className="grid">
            <div className="sp-7">
              <CharCascade as="h2" className="d1">
                Handmade is the easy part. Repeating it is the business.
              </CharCascade>
              <Dilate>
                <p className="body" style={{ marginTop: '1.4rem' }}>
                  Anyone can strike one good bowl or carve one good panel. What a buyer
                  actually purchases is <span className="iris-phrase">the joint</span> —
                  brass set flush into rosewood, still flush after a container crossing,
                  in the two-thousandth piece as much as the first.
                </p>
                <div className="hero-cta">
                  <Button to="/catalogue">View the catalogue</Button>
                  <Button to="/about" variant="ghost">About us</Button>
                </div>
              </Dilate>
            </div>
            <div className="sp-4 st-8">
              <Dilate delay={0.15}>
                <p className="body dim">
                  Audited, documented and metered at every stage. The papers travel inside the container.
                </p>
                <div className="cert-chips">
                  {CERTS.map((c) => <span key={c} className="chip">{c}</span>)}
                </div>
              </Dilate>
            </div>
          </div>
        </div>
      </section>

      {/* 0.6 · surface tension into the deep section */}
      <Tension from="white" />

      {/* 0.7 · process teaser — transparent ground, sits on the page colour */}
      <section className="section clear">
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.4</span><span className="meta">Process</span></div>
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
                <Button to="/catalogue" variant="ghost">What we can make</Button>
              </Dilate>
            </div>
          </div>
        </div>
      </section>

      {/* 0.8 · partners strip */}
      <section className="section alt">
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.5</span><span className="meta">Partners</span></div>
          <div className="partner-bar">
            <Toggle
              label="Filter partners"
              options={PARTNER_CATS.map((c) => ({ value: c, label: c }))}
              value={pcat}
              onChange={setPcat}
            />
            <Link to="/partners" className="chip">Case studies →</Link>
          </div>
          <div className="chip-wall">
            {partners.map((p) => <span key={p.name} className="chip">{p.name}</span>)}
          </div>
        </div>
      </section>

      {/* 0.9 · closing CTA */}
      <Deep className="cta-deep">
        <div className="wrap" style={{ textAlign: 'left' }}>
          <span className="idx">0.6</span>
          <CharCascade as="h2" className="mega cta-mega">Make it in both.</CharCascade>
          <Dilate>
            <p className="lede">Send a drawing, a photograph or a sample. A priced quote returns in five working days.</p>
            <div className="hero-cta">
              <Button to="/contact">Connect</Button>
              <Button to="/faq" variant="ghost">Read the FAQ</Button>
            </div>
          </Dilate>
        </div>
      </Deep>
    </>
  )
}
