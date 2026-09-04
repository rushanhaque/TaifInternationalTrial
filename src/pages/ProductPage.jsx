import { useState } from 'react'
import { Link, navigate } from '../lib/router'
import { productBySlug, useContent } from '../lib/content'
import { FINISHES, BRAND } from '../data/site'
import { CharCascade, Dilate } from '../components/Reveal'
import Slab from '../components/Slab'
import Button from '../components/Button'
import SpecularButton from '../components/reactbits/SpecularButton'
import DragRail from '../components/DragRail'
import { useProductGallery, GalleryStage, GalleryViews } from '../components/ProductGallery'
import NotFoundPage from './NotFoundPage'
import { productImg } from '../data/images'
import { useCart } from '../lib/cart'

export default function ProductPage({ params }) {
  const products = useContent('products')
  const p = productBySlug(params.slug)
  const { add, remove, has, setOpen } = useCart()
  const [shared, setShared] = useState(false)
  const [storyExpanded, setStoryExpanded] = useState(false)
  /* Above the not-found guard so the hook order never changes between
     renders. It holds the state the stage and the view cards share — they
     are one control rendered into two columns of the grid below. */
  const gallery = useProductGallery(p)
  if (!p) return <NotFoundPage />

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: p.name, url }) } catch (_) {}
    } else {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }

  /* Keep whatever the admin typed. A finish that matches one of the curated
     FINISHES entries (by key or name, case-insensitively) is shown under its
     proper display name; anything else is shown verbatim rather than dropped,
     which is what used to leave this row blank. */
  const careKey = (() => {
    const m = String(p.material || '').toLowerCase()
    if (m.includes('copper')) return 'copper'
    if (m.includes('brass')) return 'brass'
    if (m.includes('wood') || m.includes('sheesham') || m.includes('mango') || m.includes('teak') || m.includes('acacia')) return 'wood'
    if (m.includes('aluminium') || m.includes('aluminum')) return 'aluminium'
    if (m.includes('iron') || m.includes('steel')) return 'iron-steel'
    return null
  })()

  const finishNames = (p.finishes || [])
    .map((raw) => String(raw).trim())
    .filter(Boolean)
    .map((entry) => {
      const hit = FINISHES.find(
        (f) =>
          f.key.toLowerCase() === entry.toLowerCase() ||
          f.name.toLowerCase() === entry.toLowerCase()
      )
      return hit ? hit.name : entry
    })

  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 6)
  const specs = [
    ['Material', p.material],
    finishNames.length ? ['Finishes', finishNames.join(' · ')] : null,
  ].filter(Boolean)

  return (
    <>
      <section className="page-hero wrap">
        {/* Top-aligned, not centred. The right-hand column now carries the
            view cards as well as the copy, so it is reliably taller than the
            picture — centring it floated the photograph against nothing and
            left the two columns starting on different lines. */}
        <div className="grid prod-hero-grid">
          <div className="sp-5">
            {/* Up to four photographs, one at a time. The first is still the
                Largest Contentful Paint on this route and is still the only
                image here that must not be lazy; the rest are not fetched
                until the visitor reaches for them. See ProductGallery. */}
            <GalleryStage api={gallery} tone={p.tone} ratio="1/1" />
          </div>
          <div className="sp-7 prod-info">
            <div className="prod-info-header">
              <span className="prod-category-badge">{p.category}</span>
            </div>
            <CharCascade as="h1" className="d1 prod-title">{p.name}</CharCascade>
            <div className="prod-divider" aria-hidden="true" />
            <Dilate className="prod-body">
              {(() => {
                const LIMIT = 160
                const long = p.story.length > LIMIT
                const trimmed = long
                  ? p.story.slice(0, p.story.lastIndexOf(' ', LIMIT))
                  : p.story
                return (
                  <p className="prod-story">
                    {storyExpanded ? p.story : trimmed}
                    {long && !storyExpanded && (
                      <>{'... '}
                        <button type="button" className="prod-story-toggle" onClick={() => setStoryExpanded(true)}>
                          See more
                        </button>
                      </>
                    )}
                    {long && storyExpanded && (
                      <>{' '}
                        <button type="button" className="prod-story-toggle" onClick={() => setStoryExpanded(false)}>
                          See less
                        </button>
                      </>
                    )}
                  </p>
                )
              })()}
              <dl className="spec-list">
                {specs.map(([k, v]) => (
                  <div key={k} className="spec-row">
                    <dt className="meta">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              {careKey && (
                <Link to={`/care?material=${careKey}`} className="prod-care-link">
                  See Care Guide →
                </Link>
              )}
              <div className="prod-cta-block">
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
                      finishNames.length ? `Finishes: ${finishNames.join(', ')}` : null,
                      ``,
                      `Please share pricing, MOQ and lead time.`,
                    ].filter((l) => l !== null).join('\n')
                    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank')
                  }}
                >
                  Request a quote
                </Button>
                <button
                  type="button"
                  className={`prod-share-btn${shared ? ' is-copied' : ''}`}
                  onClick={handleShare}
                  aria-label={shared ? 'Link copied!' : 'Share this product'}
                  title={shared ? 'Copied!' : 'Share'}
                >
                  <span className="prod-share-icon" aria-hidden="true">
                    {shared ? (
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <polyline points="2,7.5 5.5,11 13,3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <circle cx="12" cy="2.5" r="1.8" stroke="currentColor" strokeWidth="1.4"/>
                        <circle cx="2.5" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1.4"/>
                        <circle cx="12" cy="12.5" r="1.8" stroke="currentColor" strokeWidth="1.4"/>
                        <line x1="10.3" y1="3.4" x2="4.2" y2="6.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                        <line x1="4.2" y1="8.4" x2="10.3" y2="11.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                    )}
                  </span>
                </button>
              </div>
              <GalleryViews api={gallery} />
            </Dilate>
          </div>
        </div>
      </section>



      {related.length > 0 && (
        <section className="section alt">
          <div className="wrap">
            <div className="sec-head rail-sec-head"><span className="idx">0.3</span><span className="meta">More {p.category.toLowerCase()}</span></div>
            <DragRail label={`More ${p.category}`} hint="" showNav={false}>
              {related.map((r) => (
                <div key={r.slug} className="rail-card">
                  <div className="rail-card-slab-wrap">
                    <Link to={`/catalogue/${r.slug}`}>
                      <Slab tone={r.tone}
                        img={r.image || productImg(r.slug)} imgThumb={r.imageThumb} alt={r.name} ratio="1/1" warp={false} />
                    </Link>
                    <button
                      type="button"
                      className={`rail-card-add${has(r.slug) ? ' is-in' : ''}`}
                      onClick={() => { has(r.slug) ? remove(r.slug) : add(r) }}
                      aria-label={has(r.slug) ? `${r.name} in cart` : `Add ${r.name} to cart`}
                    >
                      {has(r.slug) ? (
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                          <polyline points="1.5,6.5 5,10 11.5,2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                          <line x1="6.5" y1="1" x2="6.5" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                          <line x1="1" y1="6.5" x2="12" y2="6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  <Link to={`/catalogue/${r.slug}`} className="rail-card-name">{r.name}</Link>
                </div>
              ))}
            </DragRail>
          </div>
        </section>
      )}
    </>
  )
}
