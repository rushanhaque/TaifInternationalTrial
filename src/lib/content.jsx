import { useSyncExternalStore } from 'react'
import { DEFAULTS } from '../data/defaults'
/* NOT content.snapshot.json — the .built. one, generated from it before every
   dev run and every build by scripts/extract-content-images.mjs. The two are
   identical except that every uploaded image has been lifted out to a real
   file under /img/content/ and replaced by its path, so the pictures stop
   being megabytes of base64 inside this bundle. See that script's header.
   The file is gitignored; `npm run dev` and `npm run build` both write it. */
import BAKED from '../data/content.snapshot.built.json'

/* The baked snapshot is the value at BUILD time. `published` is the value in
   force RIGHT NOW: it starts as the baked one so the first paint needs no
   network, and refreshPublishedContent() below may replace it with a newer
   one fetched from /published-content.json. See that function for why. */
let published = BAKED

/* ============ editable-content store ============
   One module-level store the admin writes and every public page reads, so an
   edit in /admin shows on /shows or the homepage without a reload.

   THREE LAYERS, each overriding the one before:
     1. DEFAULTS               — hardcoded in src/data/defaults.js, the code
                                  fallback if nothing else is set.
     2. content.snapshot.json  — committed to the repo by the admin's Publish
                                  button (see src/lib/publish.js). Baked into
                                  the bundle at build time, so once Netlify or
                                  Vercel redeploys, THIS is what every visitor
                                  sees — not just the browser that edited it.
     3. localStorage           — this browser's un-published edits. Lets you
                                  preview a change before publishing it, and is
                                  invisible to everyone else.

   Publishing (layer 2) needs a GitHub token with Contents:write on this repo.
   The token is never stored in source or committed — it is pasted into the
   admin's Settings tab at runtime and kept in sessionStorage only, so it
   never enters the JS bundle and disappears when the tab closes. See
   src/lib/publish.js for the commit itself.                                   */

const KEY = 'taif:content:v1'

/* a deep-ish clone that survives structuredClone being absent on old Safari */
const clone = (v) => JSON.parse(JSON.stringify(v))

/* Saved data is merged key-by-key over the defaults rather than replacing them
   wholesale: a store written before a new section existed (say `blogs`) would
   otherwise render that section empty instead of falling back to shipped
   content. */
/* Every list record needs a unique id: the admin edits and deletes by id, so
   two records sharing one (or both missing one) makes an edit hit both. That
   is easy to reintroduce from a hand-written or older content.json, so it is
   repaired on read rather than trusted. */
function ensureIds(obj) {
  for (const k of Object.keys(obj)) {
    const list = obj[k]
    if (!Array.isArray(list)) continue
    /* Only lists of records carry ids. `bestSellers` is a list of product
       slugs — spreading a string here would explode it into {0:'j',1:'a',…}
       and silently destroy the selection. */
    if (!list.every((i) => i && typeof i === 'object' && !Array.isArray(i))) continue
    const seen = new Set()
    let max = list.reduce((m, i) => Math.max(m, Number(i?.id) || 0), 0)
    obj[k] = list.map((item) => {
      const id = Number(item?.id)
      if (!id || seen.has(id)) return { ...item, id: ++max }
      seen.add(id)
      return item
    })
  }
  return obj
}

function layer(out, source) {
  if (!source || typeof source !== 'object') return out
  for (const k of Object.keys(DEFAULTS)) {
    if (source[k] !== undefined && source[k] !== null) out[k] = source[k]
  }
  return out
}

function merge(saved) {
  const out = layer(clone(DEFAULTS), published)
  return ensureIds(layer(out, saved))
}

/* ── has a publish overtaken this browser's local edits? ───────────────────
   Layer 3 beating layer 2 is what makes preview-before-publish work, but
   nothing ever expired it. A browser that opened /admin once and touched
   anything kept that section in localStorage forever, and because layer()
   copies WHOLE top-level sections, every later publish was silently
   overridden in that browser alone. That is why Edge, Safari and Chrome each
   showed a different site while incognito — with no localStorage — showed the
   real published one.

   Local edits now only outrank the snapshot while they are NEWER than it.
   Once a publish lands they have been incorporated by definition, so they are
   dropped. Edits written before this stamp existed carry no savedAt and count
   as older than any publish, which is what clears the stale state already
   sitting in browsers today. */
function superseded(saved) {
  const stamp = Date.parse(published?.publishedAt ?? '')
  if (!stamp) return false /* snapshot predates the stamp — keep old behaviour */
  return (Number(saved?.savedAt) || 0) < stamp
}

function read() {
  if (typeof localStorage === 'undefined') return merge(null)
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (superseded(saved)) {
      /* Remove it, not just ignore it: left in place it would be re-read and
         re-compared on every load, and would win again the moment a future
         snapshot shipped without a stamp. */
      try { localStorage.removeItem(KEY) } catch { /* nothing to remove */ }
      return merge(null)
    }
    return merge(saved)
  } catch {
    /* corrupt or unparseable — fall back to shipped content rather than
       leaving the whole site blank */
    return merge(null)
  }
}

/* useSyncExternalStore compares snapshots by identity, so the snapshot has to
   be cached and only swapped on an actual write. Rebuilding it per call would
   loop forever. */
let snapshot = read()
const listeners = new Set()

const emit = () => { for (const fn of listeners) fn() }

function persist(next) {
  snapshot = next
  try {
    /* savedAt is what superseded() compares against the snapshot's
       publishedAt. It is not a content section, so layer() never copies it
       into the merged store and it cannot reach the rendered site. */
    localStorage.setItem(KEY, JSON.stringify({ ...next, savedAt: Date.now() }))
  } catch {
    /* quota — most likely a base64 image too large to store. The in-memory
       snapshot still updates so the UI stays truthful for this session; the
       admin surfaces the failure via `hasStorage` below. */
  }
  emit()
}

const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/* another tab editing content should update this one */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return
    snapshot = read()
    emit()
  })
}

const getSnapshot = () => snapshot

/* ── public API ──────────────────────────────────────────────────────────── */

/** Read one editable section, e.g. useContent('reviews'). */
export function useContent(section) {
  const all = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return section ? all[section] : all
}

/** Read the store outside React — route metadata and JSON-LD are built during
 *  routing, before any component renders, so they cannot use the hook. */
export function getContent(section) {
  const all = getSnapshot()
  return section ? all[section] : all
}

/* Product lookups go through the store so an admin edit reaches the catalogue
   pages, the product page and the structured data at once. They live here
   rather than in data/catalogue.js because that module is the shipped-defaults
   source this store is built from — importing back into it would be a cycle. */
export const getProducts = () => getContent('products')
export const productBySlug = (slug) => getProducts().find((p) => p.slug === slug)
export const railProducts = () => getProducts().filter((p) => p.rail)

/** Replace one section. Pass a value or an updater, like setState. */
export function setSection(section, value) {
  const current = getSnapshot()
  const next = typeof value === 'function' ? value(current[section]) : value
  persist({ ...current, [section]: next })
}

/** Throw away all local edits and go back to the shipped content. */
export function resetContent() {
  try { localStorage.removeItem(KEY) } catch { /* nothing saved */ }
  snapshot = merge(null)
  emit()
}

/** True when localStorage actually accepted the last write. */
export function hasStorage() {
  try {
    localStorage.setItem('taif:probe', '1')
    localStorage.removeItem('taif:probe')
    return true
  } catch {
    return false
  }
}

/** Download the whole store as content.json. */
export function exportContent() {
  const blob = new Blob([JSON.stringify(getSnapshot(), null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'content.json'
  a.click()
  URL.revokeObjectURL(url)
}

/** Load a previously exported content.json. Resolves to a short status string. */
export function importContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          reject(new Error('That file is not a content export.'))
          return
        }
        const known = Object.keys(DEFAULTS).filter((k) => parsed[k] !== undefined)
        if (!known.length) {
          reject(new Error('No recognisable content sections in that file.'))
          return
        }
        persist(merge(parsed))
        resolve(`Imported ${known.length} section${known.length === 1 ? '' : 's'}.`)
      } catch {
        reject(new Error('That file is not valid JSON.'))
      }
    }
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.readAsText(file)
  })
}

/** Next free integer id for a list whose items carry numeric ids. */
export const nextId = (list) => (list.length ? Math.max(...list.map((i) => Number(i.id) || 0)) + 1 : 1)

/* ── refresh the published layer without a new bundle ──────────────────────
   WHY THIS EXISTS

   Until now the published content was reachable only by importing it, which
   means it was compiled into a content-hashed JS chunk. That ties one thing
   that changes several times a day (what the client wrote in /admin) to one
   thing that must be cached hard to keep the site fast (the JS bundle), and
   makes the content only as fresh as the oldest cache between the visitor and
   Vercel — a browser cache, a corporate proxy, or a CDN sitting in front of
   the domain. A visitor whose HTML came out of such a cache is handed the old
   chunk hash and therefore the old content, and nothing on the page can tell.

   The same snapshot is now ALSO written to /published-content.json at build
   (see vite.config.js) and served no-store. Fetching it costs one small
   request and cannot be answered from a cache, so the content on screen stops
   depending on how the shell around it was delivered.

   It only ever moves FORWARD. A response is applied when its publishedAt is
   strictly newer than what is already in force, so a stale copy, a 404 on an
   older deployment, or a truncated body all leave the baked content alone.
   That also makes the call safe to repeat. */
export async function refreshPublishedContent() {
  try {
    const res = await fetch(`/published-content.json?t=${Date.now()}`, {
      cache: 'no-store',
      credentials: 'omit',
    })
    if (!res.ok) return false

    const next = await res.json()
    if (!next || typeof next !== 'object' || Array.isArray(next)) return false

    /* Same guard api/publish.js applies before committing: a body carrying no
       recognisable section is not a snapshot, and replacing the live content
       with it would blank the site. */
    if (!Object.keys(DEFAULTS).some((k) => next[k] !== undefined)) return false

    const incoming = Date.parse(next.publishedAt ?? '')
    const current = Date.parse(published?.publishedAt ?? '')
    if (!incoming || (current && incoming <= current)) return false

    published = next
    /* re-run the whole three-layer merge, so this browser's own unpublished
       edits are re-compared against the newer stamp and dropped if the
       publish has overtaken them — exactly as on a cold load */
    snapshot = read()
    emit()
    return true
  } catch {
    /* offline, or `vite dev` where the file is not emitted — not an error */
    return false
  }
}
