import { BRAND } from '../data/site'

/* ── ROUTE METADATA ─────────────────────────────────────────────────────────
   The router used to update document.title and the description and nothing
   else, which left three real problems on a site whose SPA fallback answers
   HTTP 200 for literally any path:

   1. NO CANONICAL. /collections and /collections/ and //collections all
      render the same page at three indexable URLs, and link equity splits
      between them.

   2. FROZEN OPEN GRAPH. Every share of every inner page unfurled with the
      homepage's title and description, because the og:* tags were static in
      index.html and nothing ever rewrote them.

   3. SOFT 404s. /catalogue/anything-at-all matched the :slug pattern, so the
      tab said "Product — TAIF INTERNATIONAL" and the description said
      "Handmade metal and wood pieces by TAIF INTERNATIONAL" while the body
      rendered the not-found state. A stale inbound link became an indexable
      page advertising itself as a product.

   Everything here is idempotent: each tag is found or created once and then
   updated in place, so navigating twenty times leaves twenty updates and one
   tag, never twenty tags. */

/* Canonical host. Falls back to whatever origin is serving the page, so
   preview deploys self-canonicalise instead of pointing at production. */
export const SITE_URL = (BRAND.url || '').replace(/\/$/, '')

const origin = () =>
  SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')

/* find-or-create, then set — never append a duplicate */
function tag(selector, make) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = make()
    document.head.appendChild(el)
  }
  return el
}

const meta = (name, content) => {
  const el = tag(`meta[name="${name}"]`, () => {
    const m = document.createElement('meta')
    m.setAttribute('name', name)
    return m
  })
  el.setAttribute('content', content)
}

const prop = (property, content) => {
  const el = tag(`meta[property="${property}"]`, () => {
    const m = document.createElement('meta')
    m.setAttribute('property', property)
    return m
  })
  el.setAttribute('content', content)
}

const link = (rel, href) => {
  const el = tag(`link[rel="${rel}"]`, () => {
    const l = document.createElement('link')
    l.setAttribute('rel', rel)
    return l
  })
  el.setAttribute('href', href)
}

/* One managed JSON-LD block for the current route. Replaced wholesale on
   every navigation so a product page never keeps the previous product's
   markup, and removed entirely when a route has none. */
function structured(data) {
  const id = 'ld-route'
  const existing = document.getElementById(id)
  if (!data) {
    if (existing) existing.remove()
    return
  }
  const el = existing || document.createElement('script')
  el.id = id
  el.type = 'application/ld+json'
  el.textContent = JSON.stringify(data)
  if (!existing) document.head.appendChild(el)
}

/* ── the one entry point ── */
export function applyMeta({ title, description, path, canonical, index = true, jsonLd = null }) {
  if (typeof document === 'undefined') return

  /* `canonical` lets a route point at a different address than the one being
     visited — /collections/lighting and /collections/lightings are the same
     three products, so both declare the family slug as the real one. */
  const self = canonical || path
  const url = `${origin()}${self === '/' ? '/' : self}`

  document.title = title
  meta('description', description)

  /* A canonical is the only thing that tells a crawler which of the many URL
     forms the SPA fallback answers is the real one. */
  link('canonical', url)

  /* Soft-404s and the not-found route must not be indexed. On every real
     route the directive is set back to index,follow rather than removed, so
     a single stale tag can never outlive the page that needed it. */
  meta('robots', index ? 'index,follow' : 'noindex,follow')

  prop('og:title', title)
  prop('og:description', description)
  prop('og:url', url)
  prop('og:site_name', BRAND.name)
  prop('og:type', path === '/' ? 'website' : 'article')

  meta('twitter:title', title)
  meta('twitter:description', description)

  structured(jsonLd)
}

/* ── builders ───────────────────────────────────────────────────────────────
   Structured data assembled from the catalogue's own fields, so it cannot
   drift from what the page actually says. Only facts we hold are emitted —
   no invented ratings, prices or availability. */

export function productLd(p) {
  if (!p) return null
  const u = origin()
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.story,
    category: p.category,
    material: p.material,
    sku: p.slug,
    url: `${u}/catalogue/${p.slug}`,
    ...(p.weight
      ? { weight: { '@type': 'QuantitativeValue', value: parseFloat(p.weight) || undefined, unitCode: 'KGM' } }
      : {}),
    brand: { '@type': 'Brand', name: BRAND.name },
    manufacturer: { '@type': 'Organization', name: BRAND.name },
    /* MOQ and lead time are the two figures a trade buyer actually filters
       on, and schema.org has no field for either — they ride as properties */
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Minimum order quantity', value: String(p.moq) },
      { '@type': 'PropertyValue', name: 'Lead time', value: p.lead },
      ...(p.dims ? [{ '@type': 'PropertyValue', name: 'Dimensions', value: p.dims }] : []),
    ],
  }
}

export function breadcrumbLd(trail) {
  const u = origin()
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: `${u}${t.path}`,
    })),
  }
}

export function collectionLd(family, pieces, path) {
  const u = origin()
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${family} — ${BRAND.name}`,
    url: `${u}${path}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: pieces.length,
      itemListElement: pieces.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${u}/catalogue/${p.slug}`,
        name: p.name,
      })),
    },
  }
}
