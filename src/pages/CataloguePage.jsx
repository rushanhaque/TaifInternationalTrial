import { useState } from 'react'
import { Link } from '../lib/router'
import { CATALOGUE, CATEGORIES, railItems } from '../data/catalogue'
import { CharCascade, Dilate } from '../components/Reveal'
import Slab from '../components/Slab'
import Counter from '../components/Counter'
import Toggle from '../components/Toggle'
import FlingGrid from '../components/FlingGrid'
import GlowGrid from '../components/GlowGrid'
import DragRail from '../components/DragRail'
import { productImg } from '../data/images'

const OPTIONS = ['All', ...CATEGORIES]

export default function CataloguePage() {
  const [cat, setCat] = useState('All')
  const items = cat === 'All' ? CATALOGUE : CATALOGUE.filter((p) => p.category === cat)

  return (
    <>
      <section className="page-hero wrap">
        <p className="hero-kicker"><span className="idx">0.2</span> <span className="meta">Catalogue</span></p>
        <CharCascade as="h1" className="mega">Catalogue</CharCascade>
        <Dilate>
          <p className="lede">
            Twenty production pieces across six families, in brass, copper and
            seasoned hardwood. Every one carries its numbers — material, dimensions,
            MOQ, lead time — because for a buyer that is the actual product.
          </p>
        </Dilate>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="cat-bar">
            <Toggle
              label="Filter by category"
              options={OPTIONS.map((c) => ({ value: c, label: c }))}
              value={cat}
              onChange={setCat}
            />
            <div className="cat-count" aria-live="polite">
              <Counter key={cat} value={String(items.length)} unit={items.length === 1 ? 'piece' : 'pieces'} smaller />
            </div>
          </div>

          <FlingGrid>
            <GlowGrid className="grid cat-grid">
              {items.map((p) => (
                <Link key={p.slug} to={`/catalogue/${p.slug}`} className="sp-4 cat-card" data-col>
                  <Slab tone={p.tone} label={p.name.toUpperCase()} meta={p.material} ratio="4/3" bead
                    img={productImg(p.slug)} alt={p.name} />
                  <div className="cat-card-meta">
                    <span className="meta">{p.category}</span>
                    <span className="meta dim2">{p.idx} · MOQ {p.moq}</span>
                  </div>
                </Link>
              ))}
            </GlowGrid>
          </FlingGrid>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.2</span><span className="meta">Recently added</span></div>
          <DragRail label="Recently added" hint="Drag · fling">
            {railItems().map((p) => (
              <Link key={p.slug} to={`/catalogue/${p.slug}`} className="rail-card">
                <Slab tone={p.tone} label={p.name.toUpperCase()} meta={p.lead} bead
                  img={productImg(p.slug)} alt={p.name} />
                <div className="rail-card-meta meta"><span>{p.category}</span><span>{p.idx}</span></div>
              </Link>
            ))}
          </DragRail>
        </div>
      </section>
    </>
  )
}
