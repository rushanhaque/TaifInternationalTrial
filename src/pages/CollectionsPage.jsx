import { CharCascade, Dilate } from '../components/Reveal'
import CollectionsDolly from '../components/CollectionsDolly'
import Button from '../components/Button'
import Seam from '../components/mk2/Seam'
import { navigate } from '../lib/router'
import { CATALOGUE, CATEGORIES } from '../data/catalogue'
import { canonicalFamilySlug } from './CollectionPage'

/* /collections — a single, cinematic pinned scroll: the camera pushes
   through five layered collection families and lands on the Bespoke wall.
   No navigation chrome on the way in — just the alley, the haze, and the
   end of it. */
export default function CollectionsPage() {
  return (
    <>
      {/* the brass spine — this page only */}
      <Seam />
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <div className="hero-kicker">
            <span className="idx">0.2</span>
            <span className="meta">Collections</span>
          </div>
          <CharCascade as="h1" className="mega">Five families, one bench.</CharCascade>
          <Dilate>
            <p className="lede" style={{ marginTop: '1.4rem' }}>
              Scroll to walk the line: tableware, barware, décor, lighting,
              furniture. The sixth family is bespoke — it waits at the end.
            </p>
          </Dilate>
        </div>
      </section>

      <CollectionsDolly />

      {/* the index — each family opens its own plate room */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.2.5</span><span className="meta">Open a family</span></div>
          <ul className="pl-switch-list">
            {CATEGORIES.map((c) => {
              const n = CATALOGUE.filter((p) => p.category === c).length
              return (
                <li key={c} className="pl-switch-row">
                  <button
                    type="button"
                    className="pl-switch-btn"
                    onClick={() => navigate(`/collections/${canonicalFamilySlug(c)}`)}
                  >
                    <span className="pl-switch-name">{c}</span>
                    <span className="pl-switch-n meta">{String(n).padStart(2, '0')} pieces</span>
                    <span className="pl-switch-go" aria-hidden="true">→</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.2.6</span><span className="meta">Every piece</span></div>
          <p className="body" style={{ maxWidth: '58ch' }}>
            The complete catalogue lists twenty production pieces across the
            five families above plus bespoke — each with dimensions, MOQ, lead
            times and finish options.
          </p>
          <div className="hero-cta">
            <Button to="/catalogue">View the catalogue</Button>
            <Button to="/materials" variant="ghost">The materials, measured</Button>
          </div>
        </div>
      </section>
    </>
  )
}
