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
import CollectionsDolly from '../components/CollectionsDolly'
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

import RequestCatalogue from '../components/mk2/RequestCatalogue'
import ChapterRail from '../components/mk2/ChapterRail'

/* the chapter rail's map of the page — ids must match the section ids below */
const CHAPTERS = [
  { id: 'top', label: 'Taif' },
  { id: 'collections', label: 'Collections' },
  { id: 'catalogue', label: 'Catalogue' },
  { id: 'the-turn', label: 'Finishes' },
  { id: 'two-floors', label: 'Two Floors' },
  { id: 'sampler', label: 'Finishes' },
  { id: 'process', label: 'Process' },
  { id: 'proof', label: 'Proof' },
  { id: 'craft', label: 'Craft' },
  { id: 'request', label: 'Request' },
]

export default function Home() {
  return (
    <>
      <ChapterRail sections={CHAPTERS} />

      {/* 0.1 · hero — the brand name, and nothing else (E18) */}
      <span id="top" />
      <HeroBrand />

      {/* 0.15 · collections dolly */}
      <span id="collections-1" />
      <div style={{ position: 'relative', zIndex: 2, background: 'var(--bg)' }}>
        <CollectionsDolly />
      </div>

      {/* 0.2 · materials — finish morph section */}
      <section className="fm-section alt" id="materials">
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.2</span><span className="meta">Materials</span></div>
        </div>
        <FinishMorph
          mode="scroll"
          finishes={HOME_COLLECTIONS}
          label="MATERIALS"
        />
        <div className="wrap fm-after">
          <Button to="/catalogue" variant="ghost">See it on the pieces</Button>
        </div>
      </section>

      {/* 0.3 · wave ribbon */}
      <Ribbon terms={RIBBON_TERMS} />

      {/* 0.4 · drag rail — the signature interaction */}
      <section className="section alt" id="catalogue">
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

      {/* 0.5 · THE TURN — the signature. A hand-raised brass vessel turns a
          full 360° under raking light, then dissolves into its walnut twin. */}
      <span id="the-turn" />
      <TheTurn />

      {/* 0.6 · TWO FLOORS — drag the brass seam: metal (Moradabad) vs wood
          (Saharanpur). The brand line made literal and operable. */}
      <span id="two-floors" />
      <TwoFloors />

      {/* 0.7 · SAMPLER — five finishes morphing live on one object */}
      <span id="sampler" />
      <Sampler />

      {/* 0.8 · surface tension into the deep section */}
      <Tension from="white" />

      {/* 0.9 · process teaser — transparent ground, sits on the page colour */}
      <section className="section clear" id="process">
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.3</span><span className="meta">Process</span></div>
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

      {/* 1.0 · REVIEWS — coming soon */}
      <section className="section clear" id="reviews">
        <div className="wrap">
          <div className="sec-head"><span className="idx">1.0</span><span className="meta">Reviews</span></div>
          <h2 className="d1" style={{ color: 'var(--ink)' }}>Reviews</h2>
          <p className="lede" style={{ marginTop: '1rem' }}>Reviews section coming soon.</p>
        </div>
      </section>


      {/* 1.2 · REQUEST THE CATALOGUE — the conversion moment */}
      <span id="request" />
      <RequestCatalogue />


    </>
  )
}
