/* ============ public/ image → WebP ============
   A one-off (re-runnable) pass over everything in public/ that a browser
   downloads as a picture. Mirrors what src/lib/image.js already does for
   admin uploads, so the two halves of the site are encoded to the same
   standard: WebP, visually lossless, long edge capped at what the layout
   can actually paint.

   WHY THIS EXISTS: public/ shipped 43 MB of PNG. A PNG of a photograph is
   the worst of both worlds — lossless encoding of data that has already
   been through a lossy camera pipeline — and several of these are 2–3 MB
   each for images the page paints at ~600px. WebP at q=90 is the standard
   "visually lossless" point for photographic content.

   WHAT IT DOES NOT TOUCH:
     · icons (apple-touch-icon, icon-192, icon-512) — installed by the OS
       and by PWA manifests, which want PNG,
     · og.png — Open Graph scrapers (Slack, WhatsApp, X) have patchy WebP
       support and this is the one image whose audience is not a browser,
     · SVG and GIF — vector, and animation, respectively.

   ORIGINALS ARE KEPT. This writes foo.webp beside foo.png and leaves the
   PNG in place, so the change is reversible by reverting the code
   references alone. Delete the originals in a separate, deliberate commit
   once the site has been verified against the WebP files.                */

import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = 'public'

/* Quality is chosen by what the SOURCE is, not by one global number, and
   the distinction is the whole reason this runs at two settings.

   A PNG here is a lossless encode of a photograph: every bit of detail the
   camera captured is still present, so the WebP has to be good enough to
   stand in for the real thing — q=90, the knee of the curve, where 92+
   grows the file quickly for a difference no one can see.

   A JPEG here has ALREADY thrown that detail away. Encoding it at q=90
   spends bits faithfully reproducing its compression artifacts, and comes
   out LARGER than the JPEG it replaced (measured: +6% to +20% across all
   twenty of the collection images). q=85 is the matching point for a
   second-generation encode — indistinguishable from the JPEG that went in,
   because the detail that separates them was gone before this script ran. */
const QUALITY_FROM_LOSSLESS = 90
const QUALITY_FROM_LOSSY = 85

/* the slowest/densest setting sharp offers — it costs encode time, which is
   paid once here, never by a visitor */
const EFFORT = 6

/* The widest any of these is painted is a full-bleed band on a 2x display.
   Capping the long edge is where most of the saving actually comes from:
   several of these are 4000px originals displayed at a fraction of that. */
const MAX_EDGE = 1920

/* Basenames whose consumers are not this site's own <img> tags. */
const SKIP = new Set([
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'og.png',
])

/* GENERATED, NOT AUTHORED — hands off. scripts/extract-content-images.mjs
   rebuilds public/img/content/ from the admin snapshot before every dev run
   and build, and ends with a sweep that deletes everything in there it did
   not just write. A .webp left beside those files would be removed on the
   next `npm run prep`, and a source reference pointing at it would 404.
   Those images are already WebP anyway: they come out of the admin
   pipeline in src/lib/image.js, and the ones that are not are re-encoded by
   the bulk optimiser on /admin → Images. */
const SKIP_DIRS = [path.join('public', 'img', 'content')]

/* RAW SOURCE → PROCESSED PUBLIC, the convention .gitignore already states:
   "raw source assets — processed versions live in public/, source stays
   local". The root assets/ tree is gitignored, and Vite copies only public/
   into dist/ — so anything referenced straight out of assets/ loads in dev
   (the dev server reads from the project root) and 404s in production, on a
   machine that does not even have the file because it was never committed.

   assets/about/ was in exactly that state: three PNGs, 7.2 MB, referenced by
   src/data/site.js, working locally and broken on deploy. Encoding them into
   public/ is what moves them across the line into something that ships.    */
const SOURCE_TREES = [{ from: 'assets', to: path.join('public', 'assets') }]

const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name)
    return e.isDirectory() ? walk(p) : [p]
  })

const kb = (n) => `${(n / 1024).toFixed(0)} KB`

const isImage = (f) => /\.(png|jpe?g)$/i.test(f)
const webpName = (f) => f.replace(/\.(png|jpe?g)$/i, '.webp')

/* in place, beside the original */
const jobs = walk(ROOT)
  .filter(isImage)
  .filter((f) => !SKIP.has(path.basename(f)))
  .filter((f) => !SKIP_DIRS.some((d) => f.startsWith(d)))
  .map((f) => ({ in: f, out: webpName(f) }))

/* and across, from the raw tree into the one that ships */
for (const { from, to } of SOURCE_TREES) {
  if (!fs.existsSync(from)) continue
  for (const f of walk(from).filter(isImage)) {
    jobs.push({ in: f, out: webpName(path.join(to, path.relative(from, f))), crossTree: true })
  }
}

let before = 0
let after = 0
let converted = 0

for (const job of jobs) {
  const file = job.in
  const out = job.out
  fs.mkdirSync(path.dirname(out), { recursive: true })
  const src = await sharp(file).rotate() /* honour EXIF orientation */
  const meta = await src.metadata()

  const pipeline =
    Math.max(meta.width, meta.height) > MAX_EDGE
      ? src.resize({
          width: meta.width >= meta.height ? MAX_EDGE : undefined,
          height: meta.height > meta.width ? MAX_EDGE : undefined,
          fit: 'inside',
          withoutEnlargement: true,
          kernel: 'lanczos3',
        })
      : src

  const quality = /\.png$/i.test(file) ? QUALITY_FROM_LOSSLESS : QUALITY_FROM_LOSSY
  await pipeline.webp({ quality, effort: EFFORT }).toFile(out)

  const b = fs.statSync(file).size
  const a = fs.statSync(out).size

  /* A WebP that came out heavier than its source is a pessimisation — drop
     it and leave the reference pointing at the original.

     Cross-tree jobs are exempt: their "original" is in the gitignored raw
     tree, which never reaches dist/. Falling back to it there would not
     trade size for fidelity, it would ship nothing at all. */
  if (a >= b && !job.crossTree) {
    fs.unlinkSync(out)
    console.log(`  keep  ${file.replace(/\\/g, '/')} — WebP was larger`)
    before += b
    after += b
    continue
  }

  before += b
  after += a
  converted += 1
  const pct = (100 - (a / b) * 100).toFixed(0)
  console.log(
    `  ok    ${out.replace(/\\/g, '/').padEnd(58)} ${kb(b).padStart(9)} → ${kb(a).padStart(8)}  (-${pct}%)`
  )
}

console.log(
  `\n${converted}/${jobs.length} converted — ${(before / 1024 / 1024).toFixed(1)} MB → ${(after / 1024 / 1024).toFixed(1)} MB ` +
    `(-${(100 - (after / before) * 100).toFixed(0)}%)`
)
