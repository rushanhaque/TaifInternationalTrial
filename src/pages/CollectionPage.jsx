import { useEffect, useMemo, useRef, useCallback, useState } from 'react'
import { gsap, ScrollTrigger, reduced, coarse } from '../lib/gsap'
import { Link, navigate } from '../lib/router'
import { useContent } from '../lib/content'
import { familySlug, FAMILIES, resolveFamily, familyPieces } from '../lib/families'
import { productPlate, COLLECTION_IMGS, familyPlate } from '../data/images'
import { useCart } from '../lib/cart'
import Button from '../components/Button'
import ProductCard from '../components/ui/ProductCard'

/* ── /collections/:family — THE PLATE ROOM ──────────────────────────────────
   One family of work, presented as an archive of production plates.

   The page has three ideas:

   1. THE GROUND. The family name is set enormous behind the grid and scrolls
      slower than it, so the pieces literally sit on top of the word that
      names them. It is the only thing on the page that moves at a different
      speed, which is what gives the grid its depth.

   2. THE RHYTHM. Plates are landscape and deliberately unequal — the row
      pattern alternates wide/narrow so the eye travels diagonally instead of
      scanning a uniform matrix. A 12-column grid with a 7/5 then 5/7 split.

   3. THE SPEC RAIL. Every plate hides its numbers until you ask. On hover the
      photograph pushes in, a hairline brass frame draws around the plate and
      a rail rises from the bottom edge carrying dims, weight, MOQ and lead —
      the four figures a buyer actually needs. Nothing is hidden from a
      keyboard: focus does exactly what hover does.

   FAIL-OPEN: nothing rests hidden in CSS. The spec rail's resting state is
   visible-but-translated; motion only changes where it sits. Reduced motion
   pins every plate open. */

/* The family list and its lookups moved to src/lib/families.js so the route
   table in App.jsx can read them without importing this whole page — see the
   header there. Re-exported so every existing importer keeps working. */
export {
  familySlug, FAMILIES, canonicalFamilySlug, resolveFamily, familyPieces,
} from '../lib/families'

const FAMILY_NOTE = {
  'Wooden Products': 'Carved, turned and inlaid timber pieces built from kiln-dried hardwood.',
  'Copper Products': 'Hand-hammered copper vessels, trays and serveware with lasting patina.',
  'Home Decor': 'Vessels, sculpture, wall pieces. The quiet centrepiece of a room.',
  'Hardware Supplies': 'Handles, knobs, hinges and fittings — cast, forged and finished by hand.',
  'Gifting': 'Branded keepsakes, desk sets and presentation pieces for corporate orders.',
  'Religious Supplies': 'Pooja thalis, diyas, bells and temple fittings in traditional brass and copper.',
  'Bathroom Accessories': 'Soap dishes, towel rings, dispensers and vanity trays for premium bathrooms.',
  'Kitchenware': 'Serving bowls, ladles, utensil holders and cookware in hand-finished metal.',
  'Barware': 'Ice buckets, coasters, shakers and trays. The pieces that carry the evening.',
}

/* ── PlateCard — Velora-inspired landscape product card ─────────────── */
function PlateCard({ p, add, remove, has, setOpen }) {
  const inCart = has(p.slug)

  return (
    <li className="pl-plate">
      <div className="pl-card group">
        <Link
          to={`/catalogue/${p.slug}`}
          className="pl-card-link"
          data-cursor="VIEW"
          transition="slide-product"
        >
          {/* Studio Frame — 16/10 Landscape ratio with radial vitrine ground */}
          <div className="pl-shot burnish">
            <div className="pl-glow" aria-hidden="true" />
            <img
              className="pl-img"
              src={productPlate(p.slug)}
              alt={p.name}
              loading="lazy"
              decoding="async"
            />
            {/* Stamped Ref / Index tag top-left */}
            <span className="pl-no" aria-hidden="true">{p.idx}</span>
            {/* Brass light-catch hairline draw along lower edge on hover */}
            <div className="pl-light-catch" aria-hidden="true" />
          </div>

          {/* Caption & Metadata */}
          <div className="pl-say">
            <div className="pl-say-top">
              <h3 className="pl-name">{p.name}</h3>
              <p className="pl-mat">{p.material}</p>
            </div>
            <div className="pl-say-action">
              <span className="pl-action-text">View piece</span>
              <span className="pl-arrow-wrap" aria-hidden="true">
                <span className="pl-arrow arrow-1">→</span>
                <span className="pl-arrow arrow-2">→</span>
              </span>
            </div>
          </div>
        </Link>

        {/* Add to Cart floating action button */}
        <button
          type="button"
          className={`pl-add ${inCart ? 'is-in' : ''}`}
          onClick={() => (inCart ? remove(p.slug) : add(p))}
          aria-label={inCart ? `Remove ${p.name} from your cart` : `Add ${p.name} to your cart`}
        >
          <i aria-hidden="true" />
          <span>{inCart ? 'In cart' : 'Add to cart'}</span>
        </button>
      </div>
    </li>
  )
}


export default function CollectionPage({ params = {} }) {
  const rootRef = useRef(null)
  const { add, remove, has, setOpen } = useCart()

  /* subscribing to products keeps the grid live when the admin edits the
     catalogue — familyPieces() reads the same store, but only re-runs when
     this value changes identity */
  const products = useContent('products')
  const subcategoriesMap = useContent('subcategories')
  const family = useMemo(() => resolveFamily(params.family), [params.family])
  const pieces = useMemo(() => (family ? familyPieces(family) : []), [family, products])

  const [subcat, setSubcat] = useState(null)
  useEffect(() => { setSubcat(null) }, [family])

  const subcats = useMemo(() => subcategoriesMap?.[family] || [], [subcategoriesMap, family])
  const visiblePieces = useMemo(
    () => (subcat ? pieces.filter((p) => p.subcategory === subcat) : pieces),
    [pieces, subcat],
  )

  /* the aggregate figures a buyer scans before opening a single plate */
  const stats = useMemo(() => {
    if (!pieces.length) return null
    const wks = pieces.flatMap((p) => (String(p.lead).match(/\d+/g) || []).map(Number))
    const lo = Math.min(...wks)
    const hi = Math.max(...wks)
    return {
      count: pieces.length,
      moq: Math.min(...pieces.map((p) => p.moq)),
      lead: lo === hi ? `${lo} wks` : `${lo}–${hi} wks`,
      materials: [...new Set(pieces.map((p) => p.material.split(/[+·]/)[0].trim()))],
    }
  }, [pieces])

  useEffect(() => {
    const root = rootRef.current
    if (!root || reduced()) return undefined

    const ctx = gsap.context(() => {
      /* The cover photograph drifts slower than the page — the depth trick the
         ground word used to carry, moved onto the image that replaced it.
         Scoped to the masthead's own scroll range rather than the whole page,
         since the band is only a few hundred pixels tall. */
      const cover = root.querySelector('.pl-head-media img')
      if (cover) {
        gsap.fromTo(cover, { yPercent: -6 }, {
          yPercent: 6, ease: 'none',
          scrollTrigger: { trigger: '.pl-head', start: 'top top', end: 'bottom top', scrub: 0.8 },
        })
      }

      gsap.from('.pl-mast > *', {
        yPercent: 108, duration: 1, ease: 'atelys', stagger: 0.07,
        scrollTrigger: { trigger: '.pl-mast', start: 'top 92%', once: true },
      })

      /* plates slide in from alternating sides as they enter — a staggered
         card reveal rather than a uniform rise, so the grid assembles itself
         diagonally. .pl clips its overflow, so the lateral offset never adds
         a horizontal scrollbar. */
      gsap.utils.toArray('.pl-plate').forEach((el, i) => {
        const dir = i % 2 ? 1 : -1
        gsap.from(el, {
          y: 64, x: dir * 46, opacity: 0, scale: 0.955, rotate: dir * 0.6,
          duration: 1.05, ease: 'atelys',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })

      gsap.from('.pl-switch-row', {
        y: 18, opacity: 0, duration: 0.7, ease: 'fluid', stagger: 0.05,
        scrollTrigger: { trigger: '.pl-switch', start: 'top 92%', once: true },
      })

      ScrollTrigger.refresh()
    }, root)

    return () => ctx.revert()
  }, [family])

  if (!family) {
    return (
      <section className="section">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <p className="idx">0.2</p>
          <h1 className="d1">No such family.</h1>
          <p className="lede" style={{ marginInline: 'auto' }}>
            Nine families leave this workshop. That is not one of them.
          </p>
          <Button to="/collections">See all nine</Button>
        </div>
      </section>
    )
  }

  const others = FAMILIES.filter((c) => c !== family)

  return (
    <div className="pl" ref={rootRef}>
      {/* The masthead's ground is the family's own cover photograph — the same
          plate the collections grid uses for this family, so the page opens on
          the picture the visitor just clicked.

          It replaces the giant ghosted family name that used to sit here: two
          full-bleed ground layers behind one title fought each other, and the
          word only reappeared below the image band looking like a leak.

          The scrim under it is what keeps the crumb and the title legible over
          an arbitrary photograph — see .pl-head-scrim. */}
      <section className="pl-head pl-head--shot">
        <div className="pl-head-media" aria-hidden="true">
          <img
            src={COLLECTION_IMGS[family] || familyPlate(family)}
            alt=""
            loading="eager"
            decoding="async"
          />
          <span className="pl-head-scrim" />
        </div>

        <div className="wrap">
          <nav className="pl-crumb meta" aria-label="Breadcrumb">
            <Link to="/collections">Collections</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{family}</span>
          </nav>

          <div className="pl-mast">
            <span className="pl-mast-line"><h1 className="pl-title">{family}</h1></span>
          </div>
        </div>
      </section>

      {/* ── the plates ─────────────────────────────────────────────────── */}
      <section className="pl-grid-wrap" aria-label={`${family} pieces`}>
        <div className="wrap">
          {subcats.length > 0 && (
            <div className="pl-subcat-row" role="group" aria-label="Filter by subcategory">
              <button
                className={`pl-subcat-btn${!subcat ? ' is-active' : ''}`}
                onClick={() => setSubcat(null)}
              >All</button>
              {subcats.map((s) => (
                <button
                  key={s}
                  className={`pl-subcat-btn${subcat === s ? ' is-active' : ''}`}
                  onClick={() => setSubcat(s)}
                >{s}</button>
              ))}
            </div>
          )}
          {!pieces.length && (
            /* an honest holding page: this family is real and reachable, its
               stock simply has not been filed yet. Never a 404. */
            <div className="pl-empty">
              <span className="pl-empty-mark" aria-hidden="true" />
              <h2 className="pl-empty-title">Being photographed.</h2>
              <p className="pl-empty-note">
                {family} is in production. The plates for this family are not
                on the site yet — ask and we will send them directly, with
                dimensions, MOQ and lead times.
              </p>
              <div className="hero-cta">
                <Button to="/contact">Ask about {family.toLowerCase()}</Button>
                <Button to="/catalogue" variant="ghost">Browse everything else</Button>
              </div>
            </div>
          )}
          <ol className="pl-grid">
            {visiblePieces.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </ol>
        </div>
      </section>

      {/* ── the other families ─────────────────────────────────────────────── */}
      <section className="pl-switch">
        <div className="wrap">
          <div className="sec-head">
            <span className="meta">The other families</span>
          </div>
          <div className="pl-family-buttons-grid">
            {others.map((c) => (
              <button
                key={c}
                type="button"
                className="pl-family-pill-btn"
                onClick={() => navigate(`/collections/${familySlug(c)}`)}
              >
                <span className="pl-family-pill-name">{c}</span>
                <span className="pl-family-pill-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>

          <div className="hero-cta pl-cta">
            <Button to="/contact">Get in touch</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
