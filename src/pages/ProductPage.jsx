import { Link } from '../lib/router'
import { CATALOGUE, bySlug } from '../data/catalogue'
import { FINISHES } from '../data/site'
import { CharCascade, Dilate } from '../components/Reveal'
import Slab from '../components/Slab'
import Button from '../components/Button'
import FinishMorph from '../components/FinishMorph'
import DragRail from '../components/DragRail'
import NotFoundPage from './NotFoundPage'
import { productImg } from '../data/images'

export default function ProductPage({ params }) {
  const p = bySlug(params.slug)
  if (!p) return <NotFoundPage />

  const finishes = FINISHES.filter((f) => p.finishes.includes(f.key))
  const related = CATALOGUE.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 6)
  const specs = [
    ['Material', p.material],
    ['Dimensions', p.dims],
    ['Weight', p.weight],
    ['MOQ', String(p.moq) + ' pcs'],
    ['Lead time', p.lead],
    ['Finishes', finishes.map((f) => f.name).join(' · ')],
  ]

  return (
    <>
      <section className="page-hero wrap">
        <div className="grid" style={{ alignItems: 'center' }}>
          <div className="sp-7">
            <Slab blob tone={p.tone} ratio="7/5" label={p.name.toUpperCase()} meta={p.material}
              img={productImg(p.slug)} alt={p.name} />
          </div>
          <div className="sp-5 prod-info">
            <p className="hero-kicker">
              <span className="idx">0.3</span> <span className="meta">{p.category} · {p.idx}</span>
            </p>
            <CharCascade as="h1" className="d1">{p.name}</CharCascade>
            <Dilate>
              <p className="lede" style={{ marginTop: '1rem' }}>{p.story}</p>
              <dl className="spec-list">
                {specs.map(([k, v]) => (
                  <div key={k} className="spec-row">
                    <dt className="meta">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="hero-cta">
                <Button to="/contact">Request a quote</Button>
                <Button to="/catalogue" variant="ghost">Back to catalogue</Button>
              </div>
            </Dilate>
          </div>
        </div>
      </section>

      {finishes.length > 1 && (
        <section className="section alt">
          <div className="wrap">
            <div className="sec-head"><span className="idx">0.3</span><span className="meta">Available finishes</span></div>
            <FinishMorph mode="manual" finishes={finishes} label={p.name.toUpperCase()} />
          </div>
        </section>
      )}

      <section className="section">
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.3</span><span className="meta">Dimensions</span></div>
          <div className="grid">
            <div className="sp-8">
              <Slab tone="wood" ratio="21/9" label="DIMENSIONS" meta={p.dims} />
            </div>
            <div className="sp-4">
              <Dilate>
                <p className="body dim">
                  Dimensioned drawings are issued at quote stage. Hand-work carries a
                  stated tolerance, wood is metered for moisture at cut and at packing,
                  and both readings travel with the shipment on request.
                </p>
              </Dilate>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section alt">
          <div className="wrap">
            <div className="sec-head"><span className="idx">0.3</span><span className="meta">More {p.category.toLowerCase()}</span></div>
            <DragRail label={`More ${p.category}`} hint="Drag · fling">
              {related.map((r) => (
                <Link key={r.slug} to={`/catalogue/${r.slug}`} className="rail-card">
                  <Slab tone={r.tone} label={r.name.toUpperCase()} meta={r.material} bead
                    img={productImg(r.slug)} alt={r.name} />
                  <div className="rail-card-meta meta"><span>{r.category}</span><span>{r.idx}</span></div>
                </Link>
              ))}
            </DragRail>
          </div>
        </section>
      )}
    </>
  )
}
