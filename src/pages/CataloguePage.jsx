import { useState } from 'react'
import { Link } from '../lib/router'
import { CATALOGUE, CATEGORIES, railItems } from '../data/catalogue'
import { CharCascade, Dilate } from '../components/Reveal'
import Slab from '../components/Slab'
import Counter from '../components/Counter'
import Toggle from '../components/Toggle'
import FlingGrid from '../components/FlingGrid'
import { productImg } from '../data/images'
import { Grid } from '../components/canvasui/Grid'
import CircularGallery from '../components/reactbits/CircularGallery'

const OPTIONS = ['All', ...CATEGORIES]

export default function CataloguePage() {
  const [cat, setCat] = useState('All')
  let items = cat === 'All' ? CATALOGUE : CATALOGUE.filter((p) => p.category === cat)

  // Reduce items to one per category for the collage view when showing All
  if (cat === 'All') {
    const seenCategories = new Set()
    items = items.filter(p => {
      if (seenCategories.has(p.category)) return false
      seenCategories.add(p.category)
      return true
    })
  }

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
                      <Grid
                        tileSize={36}
                        gap={0}
                        cornerRadius={0}
                        amplitude={1.2}
                        waveSpeed={0.5}
                        frequency={12}
                        waveWidth={0.05}
                        fadeTime={0.2}
                        maxLift={1}
                        jitter={0}
                        liftHeight={0}
                        perspective={99999}
                        tilt={0}
                        shading={0}
                        tintStrength={0}
                        idleRipples={0}
                        style={{ width: '100%', height: '100%', display: 'block' }}
                      >
                        <Slab
                          tone={p.tone}
                          label={p.name.toUpperCase()}
                          meta={p.material}
                          ratio={tile.ratio}
                          img={productImg(p.slug)}
                          alt={p.name}
                          warp={false}
                        />
                      </Grid>
                      <div className="cat-col-meta">
                        <span className="meta">{p.category}</span>
                        <span className="meta dim2">{p.idx} · MOQ {p.moq}</span>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.2</span><span className="meta">Recently added</span></div>
          <div style={{ height: '600px', position: 'relative' }}>
            <CircularGallery
              items={railItems().map((p) => ({
                image: productImg(p.slug),
                text: p.name.toUpperCase()
              }))}
              bend={1.5}
              textColor="#b0894f"
              borderRadius={0.05}
              scrollSpeed={0.3}
              scrollEase={0.08}
              fontUrl="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,600..700&display=swap"
              font="bold 15px Archivo"
            />
          </div>
        </div>
      </section>
    </>
  )
}
