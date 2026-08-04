import { useEffect, useMemo, useRef, useCallback } from 'react'
import { gsap, ScrollTrigger, reduced, coarse } from '../lib/gsap'
import { Link, navigate } from '../lib/router'
import { CATALOGUE, CATEGORIES } from '../data/catalogue'
import { productPlate } from '../data/images'
import { useCart } from '../lib/cart'
import Button from '../components/Button'

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
  'wooden-products': null,
  'copper-products': null,
  'home-decor': 'Décor',
  'hardware-supplies': null,
  'corporate-gifting': null,
  'religious-supplies': null,
  'bathroom-accessories': null,
  'kitchenware': null,
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

/* ── PlateCard — bead travels TL→TR→BR then morphs into the Add button ───── */
function PlateCard({ p, add, has, setOpen }) {
  const liRef   = useRef(null)
  const beadRef = useRef(null)
  const addRef  = useRef(null)
  const tlRef   = useRef(null)   // keep reference so we can kill on re-enter

  const handleEnter = useCallback(() => {
    if (reduced() || !beadRef.current || !liRef.current) return

    /* kill any in-progress animation so re-hovering always starts cleanly */
    if (tlRef.current) tlRef.current.kill()

    const li   = liRef.current
    const bead = beadRef.current
    const btn  = addRef.current

    /* travel distances — bead is 12 px, starts 14 px from each edge */
    const w = li.offsetWidth  - 26   /* to the right edge  */
    const h = li.offsetHeight - 26   /* to the bottom edge */

    /* always start from top-left */
    gsap.set(bead, { x: 0, y: 0, scale: 1, opacity: 1 })
    gsap.set(btn,  { opacity: 0, scale: 0.8 })

    const tl = gsap.timeline()

    /* phase 1 — slide along the top edge to the top-right corner */
    tl.to(bead, { x: w, duration: 0.28, ease: 'power2.inOut' })

    /* phase 2 — drop down the right edge to the bottom-right corner */
    tl.to(bead, { y: h, duration: 0.22, ease: 'power2.inOut' })

    /* phase 3 — bead blooms out and vanishes while the Add button pops in */
    tl.to(bead, { scale: 2.6, opacity: 0, duration: 0.22, ease: 'power2.out' }, '-=0.02')
    tl.to(btn,  { opacity: 1, scale: 1,   duration: 0.22, ease: 'back.out(1.4)' }, '<0.05')

    tlRef.current = tl
  }, [])

  const handleLeave = useCallback(() => {
    if (tlRef.current) tlRef.current.kill()
    if (!beadRef.current || !addRef.current) return

    /* snap everything back — no animation on leave so the next enter is crisp */
    gsap.set(addRef.current,  { opacity: 0, scale: 0.8 })
    gsap.set(beadRef.current, { x: 0, y: 0, scale: 1, opacity: 0 })
  }, [])

  return (
    <li
      className="pl-plate"
      ref={liRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* bead lives on the li so it isn't clipped by the card's overflow:hidden */}
      <span ref={beadRef} className="bead pl-bead" aria-hidden="true" />

      <Link
        to={`/catalogue/${p.slug}`}
        className="pl-card"
        data-cursor="VIEW"
      >
        <span className="pl-frame" aria-hidden="true" />

        <span className="pl-shot">
          <img
            className="pl-img"
            src={productPlate(p.slug)}
            alt={p.name}
            loading="lazy"
            decoding="async"
          />
          <span className={`pl-wash tone-${p.tone}`} aria-hidden="true" />
        </span>

        <span className="pl-no meta" aria-hidden="true">{p.idx}</span>


        <span className="pl-say">
          <span className="pl-name">{p.name}</span>
          <span className="pl-mat meta">{p.material}</span>
        </span>
      </Link>

      <button
        ref={addRef}
        type="button"
        className={`pl-add ${has(p.slug) ? 'is-in' : ''}`}
        onClick={() => { add(p); setOpen(true) }}
        aria-label={has(p.slug)
          ? `${p.name} is in your enquiry`
          : `Add ${p.name} to your enquiry`}
      >
        <i aria-hidden="true" />
        <span>{has(p.slug) ? 'In enquiry' : 'Add'}</span>
      </button>
    </li>
  )
}


export default function CollectionPage({ params = {} }) {
  const rootRef = useRef(null)
  const { add, has, setOpen } = useCart()

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

      /* plates rise with a whisper of rotation so the grid never feels stamped */
      gsap.utils.toArray('.pl-plate').forEach((el, i) => {
        gsap.from(el, {
          y: 54, opacity: 0, rotate: i % 2 ? -0.5 : 0.5,
          duration: 1, ease: 'atelys',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
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

          <div className="pl-meta">
            <p className="pl-note">{FAMILY_NOTE[family]}</p>
            {stats && (
              <dl className="pl-figs">
                <div><dt>Pieces</dt><dd>{String(stats.count).padStart(2, '0')}</dd></div>
                <div><dt>From MOQ</dt><dd>{stats.moq}</dd></div>
                <div><dt>Lead</dt><dd>{stats.lead}</dd></div>
              </dl>
            )}
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
              <PlateCard key={p.slug} p={p} add={add} has={has} setOpen={setOpen} />
            ))}
          </ol>
        </div>
      </section>

      {/* ── the other five ─────────────────────────────────────────────── */}
      <section className="pl-switch">
        <div className="wrap">
          <div className="sec-head">
            <span className="idx">0.2</span><span className="meta">The other families</span>
          </div>
          <ul className="pl-switch-list">
            {others.map((c) => {
              const n = familyPieces(c).length
              return (
                <li key={c} className="pl-switch-row">
                  <button
                    type="button"
                    className="pl-switch-btn"
                    onClick={() => navigate(`/collections/${familySlug(c)}`)}
                  >
                    <span className="pl-switch-name">{c}</span>
                    <span className="pl-switch-n meta">{String(n).padStart(2, '0')} pieces</span>
                    <span className="pl-switch-go" aria-hidden="true">→</span>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="hero-cta pl-cta">
            <Button to="/catalogue">The full catalogue</Button>
            <Button to="/contact" variant="ghost">Ask about {family.toLowerCase()}</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
