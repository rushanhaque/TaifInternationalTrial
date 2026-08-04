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

export const COLLECTION_IMGS = {
  'Wooden Products': pic('taif-wooden-products', 1000, 700),
  'Copper Products': pic('taif-copper-products', 1000, 700),
  'Home Decor': pic('taif-home-decor', 1000, 700),
  'Hardware Supplies': pic('taif-hardware-supplies', 1000, 700),
  'Corporate Gifting': pic('taif-corporate-gifting', 1000, 700),
  'Religious Supplies': pic('taif-religious-supplies', 1000, 700),
  'Bathroom Accessories': pic('taif-bathroom-accessories', 1000, 700),
  'Kitchenware': pic('taif-kitchenware', 1000, 700),
  'Barware': pic('taif-barware', 1000, 700),
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
