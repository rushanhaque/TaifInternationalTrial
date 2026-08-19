import { CATEGORIES } from '../data/catalogue'
import { getProducts } from './content'

/* ============ the nine families ============
   These used to live at the top of src/pages/CollectionPage.jsx, and half the
   site imported them from there — the navbar, the homepage, the mosaic, the
   404, and the route table in App.jsx.

   That is fine until you want to load the pages lazily. A route table that
   must call resolveFamily() to build a <title> cannot wait for a dynamic
   import, so importing the helpers from the page component pinned the whole
   page — and its imagery, its GSAP timelines, its ProductCard tree — into the
   first chunk every visitor downloads, whether or not they ever open a
   collection.

   The data and the lookups are a few hundred bytes and belong to the site
   rather than to one page. They live here; CollectionPage re-exports them so
   nothing that imported them from there has to change.                     */

/* 'Décor' → 'decor' — fold accents so the URL stays ASCII */
export const familySlug = (name) =>
  String(name).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')

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
  'Gifting', 'Religious Supplies', 'Bathroom Accessories',
  'Kitchenware', 'Barware',
]

/* family (by slug) → the catalogue category holding its pieces */
const ALIAS = {
  'wooden-products': 'Wooden Products',
  'copper-products': 'Copper Products',
  'home-decor': 'Home Decor',
  'hardware-supplies': 'Hardware Supplies',
  'gifting': 'Gifting',
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
  return getProducts().filter((p) => familySlug(p.category) === familySlug(cat))
}
