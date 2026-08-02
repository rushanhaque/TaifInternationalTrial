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

/* collection families (/collections dolly) */
export const COLLECTION_IMGS = {
  Tableware: pic('taif-tableware', 1000, 700),
  Barware: pic('taif-barware', 1000, 700),
  'Décor': pic('taif-decor', 1000, 700),
  Lighting: pic('taif-lighting', 1000, 700),
  Furniture: pic('taif-furniture', 1000, 700),
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
