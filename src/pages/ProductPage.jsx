import { Link, navigate } from '../lib/router'
import { productBySlug, useContent } from '../lib/content'
import { FINISHES } from '../data/site'
import { CharCascade, Dilate } from '../components/Reveal'
import Slab from '../components/Slab'
import Button from '../components/Button'
import SpecularButton from '../components/reactbits/SpecularButton'
import DragRail from '../components/DragRail'
import SpecDock from '../components/mk2/SpecDock'
import NotFoundPage from './NotFoundPage'
import { productImg } from '../data/images'
import { useCart } from '../lib/cart'

export default function ProductPage({ params }) {
  const products = useContent('products')
  const p = productBySlug(params.slug)
  const { add, remove, has, setOpen } = useCart()
  if (!p) return <NotFoundPage />

  const finishes = FINISHES.filter((f) => p.finishes.includes(f.key))
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 6)
  const specs = [
    ['Material', p.material],
    ['Finishes', finishes.map((f) => f.name).join(' · ')],
  ]

  return (
    <>
      <SpecDock piece={p} />

      <section className="page-hero wrap">
        <div className="grid" style={{ alignItems: 'center' }}>
          <div className="sp-6">
            <Slab warp={false} className="prod-hero-slab" tone={p.tone} ratio="7/5" label={p.name.toUpperCase()} meta={p.material}
              img={productImg(p.slug)} alt={p.name} />
          </div>
          <div className="sp-6 prod-info">
            <p className="meta">{p.category}</p>
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
              {/* a buyer who has read this far must be able to act HERE — the
                  enquiry docket was reachable from every grid on the site
                  except the page that actually argues for the piece */}
              <div className="hero-cta">
                <SpecularButton
                  size="md"
                  radius={999}
                  tint="var(--chrome)"
                  tintOpacity={1}
                  textColor="var(--graphite)"
                  lineColor="#421520"
                  baseColor="var(--hair-strong)"
                  intensity={1.2}
                  thickness={1.5}
                  onClick={() => (has(p.slug) ? remove(p.slug) : add(p))}
                >
                  {has(p.slug) ? 'In your cart' : 'Add to cart'}
                </SpecularButton>
                <SpecularButton
                  size="md"
                  radius={999}
                  tint="transparent"
                  tintOpacity={0}
                  textColor="var(--graphite)"
                  lineColor="#421520"
                  baseColor="var(--hair-strong)"
                  intensity={1}
                  thickness={1}
                  onClick={() => navigate('/contact')}
                >
                  Request a quote
                </SpecularButton>
              </div>
            </Dilate>
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
                  <Slab tone={r.tone} label={r.name.toUpperCase()} meta={r.material}
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
