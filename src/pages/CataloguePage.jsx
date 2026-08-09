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
  const items = CATALOGUE

  return (
    <>
      <section className="page-hero wrap">
        <CharCascade as="h1" className="mega">Catalogue</CharCascade>
      </section>

      <section className="section alt">
        <div className="wrap">
          <ol className="cat-collage">
              {items.map((p, i) => {
                /* Professionally structured landscape collage rhythm:
                   row A: 8-col wide landscape  +  4-col landscape
                   row B: 4-col  +  4-col  +  4-col  (trio landscape)
                   row C: 12-col full-width panoramic landscape
                   row D: 6-col  +  6-col  (duo landscape) */
                const PATTERN = [
                  { span: 8,  ratio: '16/9'  },   // A1 — hero landscape
                  { span: 4,  ratio: '16/10' },   // A2 — secondary landscape
                  { span: 4,  ratio: '16/10' },   // B1 — trio landscape
                  { span: 4,  ratio: '16/10' },   // B2 — trio landscape
                  { span: 4,  ratio: '16/10' },   // B3 — trio landscape
                  { span: 12, ratio: '21/9'  },   // C  — full-width panoramic landscape
                  { span: 6,  ratio: '16/9'  },   // D1 — duo landscape
                  { span: 6,  ratio: '16/9'  },   // D2 — duo landscape
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
          <div className="sec-head"><span className="meta">New arrivals</span></div>
          <div style={{ height: '600px', position: 'relative' }}>
            <CircularGallery
              items={railItems().map((p) => ({
                image: productImg(p.slug),
                text: p.name.toUpperCase()
              }))}
              bend={1.5}
              textColor="#c5973f"
              borderRadius={0.05}
              scrollSpeed={0.3}
              scrollEase={0.08}
              fontUrl="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap"
              font="bold 15px Cinzel"
            />
          </div>
        </div>
      </section>
    </>
  )
}
