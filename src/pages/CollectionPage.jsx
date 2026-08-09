import { useEffect, useMemo, useRef, useCallback } from 'react'
import { gsap, ScrollTrigger, reduced, coarse } from '../lib/gsap'
import { Link, navigate } from '../lib/router'
import { CATALOGUE, CATEGORIES } from '../data/catalogue'
import { productPlate } from '../data/images'
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

/* 'Décor' → 'decor' — fold accents so the URL stays ASCII */
export const familySlug = (name) =>
  name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')

/* ── the families ─────────────────────────────────────────────────────────
   The site names its collections in two places that did not agree: the
   homepage sequence says Decor / Accessories / Wall arts / Lightings, while
   the catalogue files every product under Tableware / Barware / Décor /
   Lighting / Furniture / Bespoke. Clicking a homepage name therefore led
   nowhere even once the links existed.

   FAMILIES is now the single list every surface reads from, and ALIAS maps
   a family onto the catalogue category that actually holds its stock. A
   family with no products yet is a real, working page with an honest empty
   state — not a 404 — because more are being added. */

export const FAMILIES = [
  'Wooden Products', 'Copper Products', 'Home Decor', 'Hardware Supplies',
  'Corporate Gifting', 'Religious Supplies', 'Bathroom Accessories',
  'Kitchenware', 'Barware',
]

/* family (by slug) → the catalogue category holding its pieces */
const ALIAS = {
  'wooden-products': 'Wooden Products',
  'copper-products': 'Copper Products',
  'home-decor': 'Home Decor',
  'hardware-supplies': 'Hardware Supplies',
  'corporate-gifting': 'Corporate Gifting',
  'religious-supplies': 'Religious Supplies',
  'bathroom-accessories': 'Bathroom Accessories',
  'kitchenware': 'Kitchenware',
  'barware': 'Barware',
}

/* ── one URL per family ───────────────────────────────────────────────────
   Both naming schemes resolve, which is what makes old links keep working —
   but only ONE of them may be the indexable address. */
const CATEGORY_TO_FAMILY = Object.entries(ALIAS).reduce((m, [slug, cat]) => {
  if (cat) m[cat] = slug
  return m
}, {})

export const canonicalFamilySlug = (nameOrCategory) =>
  CATEGORY_TO_FAMILY[nameOrCategory] || familySlug(nameOrCategory)

/* resolve a URL slug to a real family name, checking the declared families
   first and then the raw catalogue categories, so both naming schemes work */
export function resolveFamily(slug) {
  const named = FAMILIES.find((f) => familySlug(f) === slug)
  if (named) return named
  return CATEGORIES.find((c) => familySlug(c) === slug) || null
}

/* the pieces that belong to a family, following the alias when there is one */
export function familyPieces(name) {
  const slug = familySlug(name)
  const cat = slug in ALIAS ? ALIAS[slug] : name
  if (!cat) return []
  return CATALOGUE.filter((p) => familySlug(p.category) === familySlug(cat))
}

const FAMILY_NOTE = {
  'Wooden Products': 'Carved, turned and inlaid timber pieces built from kiln-dried hardwood.',
  'Copper Products': 'Hand-hammered copper vessels, trays and serveware with lasting patina.',
  'Home Decor': 'Vessels, sculpture, wall pieces. The quiet centrepiece of a room.',
  'Hardware Supplies': 'Handles, knobs, hinges and fittings — cast, forged and finished by hand.',
  'Corporate Gifting': 'Branded keepsakes, desk sets and presentation pieces for corporate orders.',
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

  const family = useMemo(() => resolveFamily(params.family), [params.family])
  const pieces = useMemo(() => (family ? familyPieces(family) : []), [family])

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
      /* the ground word drifts slower than the grid — the whole depth trick */
      const ground = root.querySelector('.pl-ground')
      if (ground) {
        gsap.fromTo(ground, { yPercent: -6 }, {
          yPercent: 14, ease: 'none',
          scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
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
          <p className="lede" style={{ margin: '1rem auto 1.6rem' }}>
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
      {/* the family name as the ground the pieces sit on */}
      <span className="pl-ground" aria-hidden="true">{family}</span>

      <section className="pl-head">
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
            {pieces.map((p) => (
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
