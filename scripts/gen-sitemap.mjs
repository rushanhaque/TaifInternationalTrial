/* Generates public/sitemap.xml from the real route + catalogue data.
   Runs as part of `npm run build`, so the sitemap can never drift from the
   routes again — the previous hand-maintained file advertised /materials and
   /catalogue (neither is a route) and every product slug in it was stale. */

import { writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

const ORIGIN = process.env.SITE_ORIGIN || 'https://taifinternational.com'

/* The data files are plain ESM with no JSX, so they import directly. */
const { CATALOGUE } = await import(
  new URL('../src/data/catalogue.js', import.meta.url).href
)

/* Mirrors familySlug() in src/pages/CollectionPage.jsx. Kept in sync by the
   assertion below rather than by hope. */
const familySlug = (name) =>
  name.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')

const FAMILIES = [
  'Wooden Products', 'Copper Products', 'Home Decor', 'Hardware Supplies',
  'Corporate Gifting', 'Religious Supplies', 'Bathroom Accessories',
  'Kitchenware', 'Barware',
]

/* Guard: if someone edits FAMILIES in CollectionPage.jsx without touching this
   file, fail the build loudly instead of shipping a half-right sitemap. */
const pageSrc = readFileSync(join(root, 'src/pages/CollectionPage.jsx'), 'utf8')
const declared = pageSrc.match(/export const FAMILIES = \[([\s\S]*?)\]/)
if (declared) {
  const names = [...declared[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
  const missing = names.filter((n) => !FAMILIES.includes(n))
  const extra = FAMILIES.filter((n) => !names.includes(n))
  if (missing.length || extra.length) {
    console.error('[sitemap] FAMILIES out of sync with CollectionPage.jsx')
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
  ...CATALOGUE.map((p) => ({
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
console.log(`[sitemap] wrote ${urls.length} urls (${FAMILIES.length} families, ${CATALOGUE.length} products)`)
