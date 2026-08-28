/* ============ imagery ============
   Temporary Unsplash-sourced photographs, served through Lorem Picsum's
   stable-seed endpoint so every surface keeps the SAME picture between
   reloads (a random endpoint reshuffles the site on every navigation).

   ▸ TO SWAP IN THE REAL PHOTOGRAPHY
     Drop the files in `public/img/` and replace the `pic()` calls below with
     plain paths, e.g.  hero: '/img/hero.jpg'. Nothing else in the codebase
     needs to change — every component reads from this file. */

const pic = (seed, w = 1200, h = 900) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

/* hero — the full-bleed backdrop behind the TAIF wordmark */
export const HERO_IMG = pic('taif-workshop-hero', 1920, 1200)

/* the six real cover photographs supplied for the collection grid — dropped
   in `public/img/collections/`. There are nine families and six photos, so
   two photos are used twice; the assignment below was shuffled once and
   fixed in place, rather than randomised at runtime, for the same reason
   `pic()` uses a stable seed above: a random pick per page load would
   reshuffle every family's cover on every visit. */
const COVER = (name) => `/img/collections/${name}.png`

/* Homepage mosaic covers — shown in the 3×3 grid on the landing page */
export const COLLECTION_IMGS = {
  'Wooden Products':       '/img/collections/homepage/WoodenProducts.webp',
  'Copper Products':       '/img/collections/homepage/CopperProducts.webp',
  'Home Decor':            '/img/collections/homepage/HomeDecor.webp',
  'Hardware Supplies':     '/img/collections/homepage/HardwareSupplies.webp',
  'Gifting':               '/img/collections/homepage/Gifting.webp',
  'Religious Supplies':    '/img/collections/homepage/ReligiousSupplies.webp',
  'Bathroom Accessories':  '/img/collections/homepage/BathroomAccessories.webp',
  'Kitchenware':           '/img/collections/homepage/Kitchenware.webp',
  'Barware':               '/img/collections/homepage/Barware.webp',
}

/* Collection page covers — shown in the full-width wall on /collections */
export const COLLECTION_PAGE_IMGS = {
  'Wooden Products':       '/img/collections/collectionpage/WoodenProducts.webp',
  'Copper Products':       '/img/collections/collectionpage/CopperProducts.webp',
  'Home Decor':            '/img/collections/collectionpage/HomeDecor.webp',
  'Hardware Supplies':     '/img/collections/collectionpage/HardwareSupplies.webp',
  'Gifting':               '/img/collections/collectionpage/Gifting.webp',
  'Religious Supplies':    '/img/collections/collectionpage/ReligiousSupplies.webp',
  'Bathroom Accessories':  '/img/collections/collectionpage/BathroomAccessories.webp',
  'Kitchenware':           '/img/collections/collectionpage/Kitchenware.webp',
  'Barware':               '/img/collections/collectionpage/Barware.webp',
}

/* materials (/materials) */
export const MATERIAL_IMGS = {
  Brass: pic('taif-brass', 900, 700),
  Copper: pic('taif-copper', 900, 700),
  Aluminium: pic('taif-aluminium', 900, 700),
  Sheesham: pic('taif-sheesham', 900, 700),
  'Mango Wood': pic('taif-mango', 900, 700),
  'Reclaimed Teak': pic('taif-teak', 900, 700),
}

/* workshop floor (/workshop) */
export const WORKSHOP_IMGS = [
  pic('taif-floor-metal', 1000, 750),
  pic('taif-floor-wood', 1000, 750),
  pic('taif-floor-finish', 1000, 750),
]

/* every catalogue product, keyed by slug — stable per piece */
export const productImg = (slug) => pic(`taif-${slug}`, 900, 700)

/* landscape plates for the collection grids — same seed as the portrait
   version so a piece keeps its identity wherever it appears */
export const productPlate = (slug) => pic(`taif-${slug}`, 1400, 880)

/* the ground image behind a family masthead */
export const familyPlate = (family) => pic(`taif-family-${family}`, 1600, 900)

/* ── the four photographs a product may carry ──────────────────────────────
   `image` is the main one and is what every grid, rail, card and cart row on
   the site reads; `image2`–`image4` are extra angles that appear ONLY in the
   slider on the product page. Four flat keys rather than a nested array is
   deliberate: it is the shape the admin's existing image field, its upload
   pipeline, the build-time extractor and the publisher already understand, so
   the new photographs travel through all four without a line of new plumbing.

   Each key has a `…Thumb` companion written by src/lib/image.js.

   A product with one photograph yields one shot and therefore renders exactly
   as it did before this existed — no arrows, no strip, no extra bytes. */
export const PRODUCT_IMAGE_KEYS = ['image', 'image2', 'image3', 'image4']

export function productShots(p) {
  if (!p) return []
  const out = []
  /* the same file pasted into two slots is one photograph, and showing it
     twice would read as a bug rather than a gallery */
  const seen = new Set()
  for (const key of PRODUCT_IMAGE_KEYS) {
    const src = typeof p[key] === 'string' ? p[key].trim() : ''
    if (!src || seen.has(src)) continue
    seen.add(src)
    out.push({ key, src, thumb: p[`${key}Thumb`] || '' })
  }
  /* nothing uploaded yet — the placeholder keeps the page whole, exactly as
     `p.image || productImg(p.slug)` did at every call site before this */
  if (!out.length) out.push({ key: 'image', src: productImg(p.slug), thumb: '' })
  return out
}
