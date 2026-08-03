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
import CatalogueIndex from '../components/mk2/CatalogueIndex'
import { productImg } from '../data/images'

const OPTIONS = ['All', ...CATEGORIES]

export default function CataloguePage() {
  const [cat, setCat] = useState('All')
  /* two ways to read the same twenty pieces: the gallery is for looking, the
     index is for buying. The filter is shared, so switching view never loses
     the buyer's place. */
  const [view, setView] = useState('gallery')
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

          <div className="cv-bar">
            <div className="cv-switch" role="group" aria-label="Catalogue view">
              <button type="button" className="cv-btn" aria-pressed={view === 'gallery'}
                onClick={() => setView('gallery')}>Gallery</button>
              <button type="button" className="cv-btn" aria-pressed={view === 'index'}
                onClick={() => setView('index')}>Index</button>
            </div>
            <p className="meta dim2">
              {view === 'gallery'
                ? 'Photographs and finishes'
                : 'Dimensions, weight, MOQ and lead — sortable'}
            </p>
          </div>

          {view === 'gallery' ? (
            <ol className="cat-collage">
              {items.map((p, i) => {
                /* 6-item repeating collage rhythm:
                   row A: 8-col hero  +  4-col portrait
                   row B: 4-col  +  4-col  +  4-col  (trio)
                   row C: 12-col full-width panoramic */
                const PATTERN = [
                  { span: 8,  ratio: '16/9'  },   // A1 — wide hero
                  { span: 4,  ratio: '3/4'   },   // A2 — tall portrait
                  { span: 4,  ratio: '4/3'   },   // B1 — square-ish
                  { span: 4,  ratio: '4/3'   },   // B2
                  { span: 4,  ratio: '4/3'   },   // B3
                  { span: 12, ratio: '21/6'  },   // C  — full-width panoramic
                ]
                const tile = PATTERN[i % PATTERN.length]
                return (
                  <li key={p.slug} className={`cat-col-plate cat-span-${tile.span}`}>
                    <Link to={`/catalogue/${p.slug}`} className="cat-col-card">
                      <Slab
                        tone={p.tone}
                        label={p.name.toUpperCase()}
                        meta={p.material}
                        ratio={tile.ratio}
                        img={productImg(p.slug)}
                        alt={p.name}
                      />
                      <div className="cat-col-meta">
                        <span className="meta">{p.category}</span>
                        <span className="meta dim2">{p.idx} · MOQ {p.moq}</span>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ol>
          ) : (
            <CatalogueIndex items={items} />
          )}
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.2</span><span className="meta">Recently added</span></div>
          <DragRail label="Recently added" hint="Drag · fling">
            {railItems().map((p) => (
              <Link key={p.slug} to={`/catalogue/${p.slug}`} className="rail-card">
                <Slab tone={p.tone} label={p.name.toUpperCase()} meta={p.lead}
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
