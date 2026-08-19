import { Link, navigate } from '../lib/router'
import { productBySlug, useContent } from '../lib/content'
import { FINISHES, BRAND } from '../data/site'
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
            {/* the Largest Contentful Paint on this route — the only
                image here that must not be lazy */}
            <Slab warp={false} className="prod-hero-slab" tone={p.tone} ratio="7/5"
              img={p.image || productImg(p.slug)} imgThumb={p.imageThumb}
              priority sizes="(max-width: 900px) 100vw, 50vw" alt={p.name} />
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
                <Button small onClick={() => (has(p.slug) ? remove(p.slug) : add(p))}>
                  {has(p.slug) ? 'In your cart' : 'Add to cart'}
                </Button>
                <Button
                  small
                  variant="ghost"
                  onClick={() => {
                    const num = BRAND.phone.replace(/\D/g, '')
                    const msg = [
                      `Hi, I'm interested in a quote for:`,
                      ``,
                      `*${p.name}*`,
                      `Category: ${p.category}`,
                      `Material: ${p.material}`,
                      finishes.length ? `Finishes: ${finishes.map((f) => f.name).join(', ')}` : null,
                      ``,
                      `Please share pricing, MOQ and lead time.`,
                    ].filter((l) => l !== null).join('\n')
                    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank')
                  }}
                >
                  Request a quote
                </Button>
              </div>
            </Dilate>
          </div>
        </div>
      </section>



      {related.length > 0 && (
        <section className="section alt">
          <div className="wrap">
            <div className="sec-head rail-sec-head"><span className="idx">0.3</span><span className="meta">More {p.category.toLowerCase()}</span></div>
            <DragRail label={`More ${p.category}`} hint="Drag · fling" showNav={false}>
              {related.map((r) => (
                <Link key={r.slug} to={`/catalogue/${r.slug}`} className="rail-card">
                  <Slab tone={r.tone} label={r.name.toUpperCase()} meta={r.material}
                    img={r.image || productImg(r.slug)} imgThumb={r.imageThumb} alt={r.name} />
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
