/* Verify every site-absolute image reference in src/ resolves to a real file
   under public/. Catches a repoint that pointed at nothing, and the broken
   references that were already there before any of this ran. */

import fs from 'node:fs'
import path from 'node:path'

const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name)
    return e.isDirectory() ? walk(p) : [p]
  })

const files = walk('src').filter((f) => /\.(jsx?|css|json)$/i.test(f))
const REF = /['"(](\/[A-Za-z0-9_\-./ ]+?\.(?:webp|png|jpe?g|svg|gif|avif))['")]/g

/* This file's own header blocks document the path convention by example
   ("e.g. hero: '/img/hero.jpg'"), and those examples name files that were
   never meant to exist. Scanning them reports a broken reference for a line
   that is prose, so strip block comments before matching — otherwise the
   check cries wolf and stops being worth running. */
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '')

const ok = []
const broken = []

for (const file of files) {
  const text = stripComments(fs.readFileSync(file, 'utf8'))
  for (const m of text.matchAll(REF)) {
    const ref = m[1]
    /* generated at build time by scripts/extract-content-images.mjs */
    if (ref.startsWith('/img/content/')) continue
    const disk = path.join('public', ref)
    ;(fs.existsSync(disk) ? ok : broken).push({ ref, file: file.replace(/\\/g, '/') })
  }
}

console.log(`${ok.length} references resolve`)

if (broken.length) {
  console.log(`\n${broken.length} BROKEN — no such file under public/:`)
  const seen = new Set()
  for (const b of broken) {
    const key = `${b.ref}|${b.file}`
    if (seen.has(key)) continue
    seen.add(key)
    console.log(`  ${b.ref.padEnd(42)} ${b.file}`)
  }
  process.exitCode = 1
} else {
  console.log('nothing broken')
}
