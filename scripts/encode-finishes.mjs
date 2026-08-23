/* Encode the finish photography into delivery files.
 *
 * Source: assets/Finishes/*.png — twelve ~2.2 MB frames of the SAME object,
 * shot from the same position, so only the surface differs between them.
 *
 * Two derivatives per finish, because the section uses each at a very
 * different size and shipping one file for both jobs is what makes a gallery
 * like this heavy:
 *
 *   <slug>.webp        1600w  — the stage
 *   <slug>-thumb.webp   520w  — the swatch tile
 *
 * The swatch grid shows all twelve at once. At full size that is ~27 MB of
 * PNG or ~3 MB of full-size WebP before the visitor has chosen anything; the
 * thumbs bring the same grid in around 400 KB, and a stage frame is fetched
 * only when its finish is actually selected.
 *
 * Run: npm run finishes
 */
import { readdirSync, mkdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const SRC = 'assets/Finishes'
const OUT = 'public/assets/finishes'

const slug = (file) =>
  file.replace(/\.png$/i, '').trim().toLowerCase().replace(/\s+/g, '-')

mkdirSync(OUT, { recursive: true })

const files = readdirSync(SRC).filter((f) => /\.png$/i.test(f)).sort()
if (!files.length) {
  console.error(`no PNGs in ${SRC}`)
  process.exit(1)
}

let before = 0
let after = 0

for (const file of files) {
  const s = slug(file)
  const src = join(SRC, file)
  before += statSync(src).size

  const stage = join(OUT, `${s}.webp`)
  const thumb = join(OUT, `${s}-thumb.webp`)

  await sharp(src).resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 86 }).toFile(stage)
  await sharp(src).resize({ width: 520, withoutEnlargement: true })
    .webp({ quality: 82 }).toFile(thumb)

  const a = statSync(stage).size + statSync(thumb).size
  after += a
  console.log(
    `${file.padEnd(22)} -> ${s}.webp + ${s}-thumb.webp  ` +
    `${(statSync(stage).size / 1024).toFixed(0)}K + ${(statSync(thumb).size / 1024).toFixed(0)}K`
  )
}

const mb = (n) => (n / 1024 / 1024).toFixed(1)
console.log(`\n${files.length} finishes — ${mb(before)} MB PNG -> ${mb(after)} MB WebP`)
