/* Lift admin-uploaded images out of the JavaScript bundle.
   ────────────────────────────────────────────────────────────────────────────
   THE PROBLEM
   /admin stores uploaded pictures as data: URLs inside content.snapshot.json,
   and src/lib/content.jsx imports that file. Vite therefore inlines every
   uploaded photograph into the main JS chunk. Four product photos was 760 kB
   of render-blocking JavaScript — parsed and decoded before the page can
   paint, downloaded again on every deploy because the chunk hash changes, and
   costing bandwidth even to a visitor who never scrolls to the picture.

   WHAT THIS DOES
   Before every dev run and every build, walk the snapshot, decode each data:
   URL to a real file under public/img/content/, and rewrite the value to that
   file's path. The result, src/data/content.snapshot.built.json, is what the
   app actually imports. Nothing about /admin changes: it still writes and
   publishes data: URLs, and this step undoes that on the way to the browser.

   The gain is not only the smaller chunk. As files the images become
   lazy-loadable, individually cacheable (public/img/* already carries a
   one-year immutable header), and independent of the JS hash.

   Filenames are content hashes, so identical bytes are written once and a
   changed image can never be served from a stale cache under an old name.

   Both outputs are generated, not authored — see .gitignore.                */

import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const SRC = join(root, 'src/data/content.snapshot.json')
const OUT = join(root, 'src/data/content.snapshot.built.json')
const IMG_DIR = join(root, 'public/img/content')
const PUBLIC_PREFIX = '/img/content'

/* Extensions for the formats /admin can produce. An unrecognised mime is left
   as a data: URL rather than written under a wrong extension — a file served
   as the wrong type is a harder bug than a slightly larger bundle. */
const EXT = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
}

const DATA_URL = /^data:([a-z0-9.+/-]+);base64,([A-Za-z0-9+/=]+)$/i

const written = new Set()
let extracted = 0
let bytesSaved = 0
let skipped = 0

function extract(value) {
  const m = DATA_URL.exec(value)
  if (!m) return value

  const ext = EXT[m[1].toLowerCase()]
  if (!ext) { skipped++; return value }

  let buf
  try {
    buf = Buffer.from(m[2], 'base64')
  } catch {
    skipped++
    return value
  }
  if (!buf.length) { skipped++; return value }

  const hash = createHash('sha256').update(buf).digest('hex').slice(0, 16)
  const name = `${hash}.${ext}`
  const file = join(IMG_DIR, name)

  if (!existsSync(file)) writeFileSync(file, buf)
  written.add(name)
  extracted++
  /* the data: URL cost the bundle its full string length; the path costs ~30 */
  bytesSaved += value.length - (PUBLIC_PREFIX.length + name.length + 1)

  return `${PUBLIC_PREFIX}/${name}`
}

function walk(node) {
  if (typeof node === 'string') {
    /* A path that is already extracted is still live and must survive the
       sweep below. This happens whenever a snapshot arrives with paths rather
       than data URLs — src/lib/publish.jsx works hard to prevent that, but a
       hand-edited or restored file can still carry them, and deleting the
       images out from under it would be the worst possible response. */
    if (node.startsWith(`${PUBLIC_PREFIX}/`)) {
      written.add(node.slice(PUBLIC_PREFIX.length + 1))
      return node
    }
    return node.startsWith('data:') ? extract(node) : node
  }
  if (Array.isArray(node)) return node.map(walk)
  if (node && typeof node === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(node)) out[k] = walk(v)
    return out
  }
  return node
}

/* A BOM makes the file unreadable to JSON.parse in Node and to anything that
   is not a bundler being generous. Strip it on read rather than trusting
   whatever wrote it last. */
const raw = readFileSync(SRC, 'utf8').replace(/^﻿/, '')

let snapshot
try {
  snapshot = JSON.parse(raw)
} catch (err) {
  console.error(`[images] ${SRC} is not valid JSON — ${err.message}`)
  process.exit(1)
}

mkdirSync(IMG_DIR, { recursive: true })

const built = walk(snapshot)

/* THE SWEEP IS GONE ON PURPOSE.

   This used to delete every file here that the snapshot no longer referenced,
   which was safe while the directory was generated and gitignored — anything
   removed by mistake came back on the next run from the data: URL it was
   built from.

   That is no longer true. public/img/content/ is committed now (see
   .gitignore and src/lib/publish.jsx): these files ARE the images, and there
   is no data: URL left to rebuild them from. A sweep here would delete
   committed files during an ordinary `npm run build`, leave the deletions
   staged in the working tree, and take the pictures off the live site the
   moment someone committed that.

   Orphans are handled where it is safe to handle them — in the repo, by a
   person who can see what is being removed. They cost a few kB and git keeps
   the history regardless, so deleting them reclaims nothing. */
const removed = 0

writeFileSync(OUT, JSON.stringify(built), 'utf8')

const kb = (n) => `${(n / 1024).toFixed(0)} kB`
console.log(
  `[images] ${extracted} extracted to ${PUBLIC_PREFIX}/ — ${kb(bytesSaved)} out of the JS bundle` +
  (removed ? `, ${removed} stale removed` : '') +
  (skipped ? `, ${skipped} left inline (unknown type)` : ''),
)
