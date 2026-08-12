import { useContent, railProducts } from '../lib/content'
import { CharCascade } from '../components/Reveal'
import Button from '../components/Button'
import ProductCard from '../components/ui/ProductCard'
import CircularGallery from '../components/reactbits/CircularGallery'
import { productImg } from '../data/images'

/* ── /catalogue — THE FULL LIST ────────────────────────────────────────────
   Every piece on the site, on one page, filed under nothing. /collections is
   where a buyer browses by family; this is where "Browse everything else"
   from a family's empty state, and the footer's Catalogue link, land.

   The product list itself lives in the shared content store (`useContent`,
   the same source /admin edits), so this page renders whatever has been
   filed there — currently a working set, filled in by hand over time. An
   empty store still renders a complete, honest page rather than a blank
   one. */
export default function CataloguePage() {
  const items = useContent('products')
  const arrivals = railProducts()

  return (
    <>
      <section className="page-hero wrap">
        <div className="hero-kicker">
          <span className="meta">Every piece, one list</span>
        </div>
        <CharCascade as="h1" className="mega">Catalogue</CharCascade>
      </section>

      <section className="section alt">
        <div className="wrap">
          {items.length > 0 ? (
            <ol className="pl-grid">
              {items.map((p) => (
                <ProductCard key={p.slug} p={p} />
              ))}
            </ol>
          ) : (
            /* honest holding state — the page is real and reachable, the
               list is simply still being filed */
            <div className="pl-empty">
              <span className="pl-empty-mark" aria-hidden="true" />
              <h2 className="pl-empty-title">Being filed.</h2>
              <p className="pl-empty-note">
                The full catalogue is being put together. Browse by family in
                the meantime, or ask directly and we will send what you need.
              </p>
              <div className="hero-cta">
                <Button to="/collections">Browse by family</Button>
                <Button to="/contact" variant="ghost">Ask us directly</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {arrivals.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="sec-head"><span className="meta">New arrivals</span></div>
            <div style={{ height: '600px', position: 'relative' }}>
              <CircularGallery
                items={arrivals.map((p) => ({
                  image: productImg(p.slug),
                  text: p.name.toUpperCase()
                }))}
                bend={1.5}
                textColor="#421520"
                borderRadius={0.05}
                scrollSpeed={0.3}
                scrollEase={0.08}
                fontUrl="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap"
                font="bold 15px Cinzel"
              />
            </div>
          </div>
        </section>
      )}
    </>
  )
}
