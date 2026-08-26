/* Generates public/sitemap.xml from the real route + catalogue data.
   Runs as part of `npm run build`, so the sitemap can never drift from the
   routes again — the previous hand-maintained file advertised /materials
   (never a route) and every product slug in it was stale. */

import { writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

const ORIGIN = process.env.SITE_ORIGIN || 'https://www.taifinternational.co'

/* ── which products actually exist ────────────────────────────────────────
   NOT src/data/catalogue.js. That file is the shipped *default* list, and
   src/lib/content.jsx replaces it wholesale when content.snapshot.json
   carries a `products` key — it layers section by section, not record by
   record. Publishing two products from /admin therefore leaves a site with
   two product pages while this script was still advertising all 36 shipped
   slugs, so 34 sitemap entries resolved to the noindex Not Found page and
   were reported back as crawl errors.

   The rule here has to be the rule content.jsx uses, or the sitemap
   describes a site that does not exist. */
const { DEFAULT_PRODUCTS } = await import(
  new URL('../src/data/defaults.js', import.meta.url).href
)

const snapshot = JSON.parse(
  /* utf-8 BOM tolerated: the file has carried one before, and JSON.parse
     rejects it outright */
  readFileSync(join(root, 'src/data/content.snapshot.json'), 'utf8').replace(/^\uFEFF/, ''),
)

const PRODUCTS = Array.isArray(snapshot.products) ? snapshot.products : DEFAULT_PRODUCTS

/* Mirrors familySlug() in src/lib/families.js. Kept in sync by the assertion
   below rather than by hope. */
const familySlug = (name) =>
  name.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')

const FAMILIES = [
  'Wooden Products', 'Copper Products', 'Home Decor', 'Hardware Supplies',
  'Gifting', 'Religious Supplies', 'Bathroom Accessories',
  'Kitchenware', 'Barware',
]

/* Guard: if someone edits FAMILIES without touching this file, fail the build
   loudly instead of shipping a half-right sitemap.

   This read src/pages/CollectionPage.jsx until FAMILIES moved to lib. The
   `if (declared)` below meant the guard did not fail when its target went
   missing — it just quietly stopped guarding, which is the worst behaviour
   a guard can have. A missing match is now an error in its own right. */
const famSrc = readFileSync(join(root, 'src/lib/families.js'), 'utf8')
const declared = famSrc.match(/export const FAMILIES = \[([\s\S]*?)\]/)
if (!declared) {
  console.error('[sitemap] could not find FAMILIES in src/lib/families.js — did it move again?')
  process.exit(1)
}
{
  const names = [...declared[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
  const missing = names.filter((n) => !FAMILIES.includes(n))
  const extra = FAMILIES.filter((n) => !names.includes(n))
  if (missing.length || extra.length) {
    console.error('[sitemap] FAMILIES out of sync with src/lib/families.js')
    if (missing.length) console.error('  missing here:', missing)
    if (extra.length) console.error('  stale here:', extra)
    process.exit(1)
  }
}

/* priority / changefreq reflect how the pages actually behave: the catalogue
   moves, the legal text does not. */
const staticPages = [
  ['/', '1.0', 'weekly'],
  ['/collections', '0.9', 'weekly'],
  ['/catalogue', '0.8', 'weekly'],
  ['/about', '0.7', 'monthly'],
  ['/shows', '0.7', 'monthly'],
  ['/testimonials', '0.6', 'monthly'],
  ['/partners', '0.6', 'monthly'],
  ['/care', '0.5', 'yearly'],
  ['/contact', '0.8', 'monthly'],
  ['/faq', '0.5', 'yearly'],
  ['/legal', '0.3', 'yearly'],
]

const today = new Date().toISOString().slice(0, 10)

const urls = [
  ...staticPages.map(([path, priority, changefreq]) => ({ path, priority, changefreq })),
  ...FAMILIES.map((f) => ({
    path: `/collections/${familySlug(f)}`, priority: '0.8', changefreq: 'weekly',
  })),
  ...PRODUCTS.filter((p) => p && p.slug).map((p) => ({
    path: `/catalogue/${p.slug}`, priority: '0.7', changefreq: 'monthly',
  })),
]

/* /admin is deliberately absent — it is also noindex'd at runtime. */

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ path, priority, changefreq }) => `  <url>
    <loc>${ORIGIN}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>
`

writeFileSync(join(root, 'public/sitemap.xml'), xml)
const source = Array.isArray(snapshot.products) ? 'published snapshot' : 'shipped defaults'
console.log(`[sitemap] wrote ${urls.length} urls (${FAMILIES.length} families, ${PRODUCTS.length} products from ${source})`)
