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
  'Wooden Products':       '/img/collections/homepage/WoodenProducts.jpeg',
  'Copper Products':       '/img/collections/homepage/CopperProducts.jpeg',
  'Home Decor':            '/img/collections/homepage/HomeDecor.jpeg',
  'Hardware Supplies':     '/img/collections/homepage/HardwareSupplies.jpeg',
  'Gifting':               '/img/collections/homepage/Gifting.jpeg',
  'Religious Supplies':    '/img/collections/homepage/ReligiousSupplies.jpeg',
  'Bathroom Accessories':  '/img/collections/homepage/BathroomAccessories.jpeg',
  'Kitchenware':           '/img/collections/homepage/Kitchenware.jpeg',
  'Barware':               '/img/collections/homepage/Barware.jpeg',
}

/* Collection page covers — shown in the full-width wall on /collections */
export const COLLECTION_PAGE_IMGS = {
  'Wooden Products':       '/img/collections/collectionpage/WoodenProducts.jpeg',
  'Copper Products':       '/img/collections/collectionpage/CopperProducts.jpeg',
  'Home Decor':            '/img/collections/collectionpage/HomeDecor.jpeg',
  'Hardware Supplies':     '/img/collections/collectionpage/HardwareSupplies.jpeg',
  'Gifting':               '/img/collections/collectionpage/Gifting.jpeg',
  'Religious Supplies':    '/img/collections/collectionpage/ReligiousSupplies.jpeg',
  'Bathroom Accessories':  '/img/collections/collectionpage/BathroomAccessories.jpeg',
  'Kitchenware':           '/img/collections/collectionpage/Kitchenware.jpeg',
  'Barware':               '/img/collections/collectionpage/Barware.jpeg',
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
