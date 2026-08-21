/* Delete the PNG/JPEG originals that WebP has replaced.
   ────────────────────────────────────────────────────────────────────────
   Run only after scripts/to-webp.mjs, scripts/repoint-webp.mjs and a clean
   scripts/check-image-refs.mjs. Until this runs, public/ holds both formats
   and Vite copies both into dist/ — so the whole point of the conversion,
   a smaller deploy, is not actually realised.

   Four conditions, all of which must hold before a file is removed. Any one
   of them failing leaves the file alone and prints why.

     1. a .webp sibling exists — the replacement is really there.
        This is also what protects og.png and the PWA icons, which were
        never converted and so have no sibling.
     2. the file is tracked by git — deletion is revertible with
        `git checkout -- public/`. The generated img/content/ files are
        untracked and are therefore skipped here as well as in to-webp.
     3. nothing under src/ still references it. Belt and braces with
        check-image-refs, and the one that would catch a reference the
        repoint pass could not rewrite.
     4. --apply was passed. A dry run is the default, because a script whose
        first behaviour is to delete 51 files is one nobody can safely try.

   Usage:  node scripts/prune-originals.mjs          (dry run, lists)
           node scripts/prune-originals.mjs --apply  (deletes)              */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')

const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name)
    return e.isDirectory() ? walk(p) : [p]
  })

/* every image path mentioned anywhere in src/ — condition 3 */
const referenced = new Set()
for (const f of walk('src').filter((x) => /\.(jsx?|css|json)$/i.test(x))) {
  const text = fs.readFileSync(f, 'utf8')
  for (const m of text.matchAll(/\/[A-Za-z0-9_\-./ ]+?\.(?:png|jpe?g)\b/g)) {
    referenced.add(m[0])
  }
}

const isTracked = (rel) => {
  try {
    execFileSync('git', ['ls-files', '--error-unmatch', rel], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

const originals = walk('public').filter((f) => /\.(png|jpe?g)$/i.test(f))

let freed = 0
const removed = []
const kept = []

for (const file of originals) {
  const rel = file.replace(/\\/g, '/')
  const webUrl = `/${rel.replace(/^public\//, '')}`

  if (!fs.existsSync(file.replace(/\.(png|jpe?g)$/i, '.webp'))) {
    kept.push([rel, 'no .webp replacement'])
    continue
  }
  if (!isTracked(rel)) {
    kept.push([rel, 'not tracked by git — deletion would be unrecoverable'])
    continue
  }
  if (referenced.has(webUrl)) {
    kept.push([rel, 'still referenced from src/'])
    continue
  }

  const bytes = fs.statSync(file).size
  freed += bytes
  removed.push([rel, bytes])
  if (APPLY) fs.unlinkSync(file)
}

for (const [f, why] of kept) console.log(`  keep    ${f}\n            ↳ ${why}`)
for (const [f, b] of removed) {
  console.log(`  ${APPLY ? 'delete ' : 'would  '} ${f}  (${(b / 1024).toFixed(0)} KB)`)
}

console.log(
  `\n${removed.length} originals ${APPLY ? 'deleted' : 'would be deleted'}, ` +
    `${kept.length} kept — ${(freed / 1024 / 1024).toFixed(1)} MB ${APPLY ? 'freed' : 'recoverable'}`
)
if (!APPLY && removed.length) console.log('dry run — re-run with --apply to delete')
if (APPLY) console.log('revert with:  git checkout -- public/')
