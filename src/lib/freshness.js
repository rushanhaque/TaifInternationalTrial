/* ── "am I the current build?" ─────────────────────────────────────────────
   Cache headers alone cannot fix a browser that is ALREADY holding an old
   index.html. Whatever the server says today only reaches a client that asks
   the server today, and a laptop with a stale document in its disk cache —
   or behind a corporate proxy, an ISP cache, or an offline-first browser
   mode — may not ask for weeks. That is the "my client still sees last
   month's site" case, and it cannot be fixed from vercel.json.

   So the running bundle checks itself. Vite bakes this build's id into the
   JS as __BUILD_ID__ (see vite.config.js), and the same id is written to
   /version.json next to it. version.json is tiny and served no-store, so a
   fetch for it always reaches the origin even when the HTML did not. If the
   two ids disagree, the document on screen came from a cache and is out of
   date: throw away anything a past build may have stored and reload onto the
   current one.

   The reload carries ?_v=<id> for one hop. Without it a reload can be served
   the very same cached document and nothing changes; a URL the cache has
   never seen cannot be answered from it. The parameter is stripped again
   with replaceState as soon as the new build boots, so it never reaches a
   canonical tag, an analytics referrer, or the user's address bar for long.

   Reloading is capped at once per server id per tab session. If a reload
   somehow lands on the stale document again — a broken intermediary that
   ignores the query string — the page stays usable instead of looping. */

import { refreshPublishedContent } from './content'

const VERSION_URL = '/version.json'
const PARAM = '_v'
/* a long-open tab re-checks at most this often, however many times it is
   focused and blurred */
const MIN_INTERVAL = 60_000

/* __BUILD_ID__ is replaced at build time. The typeof guard keeps this module
   importable from a test or a tool that does not run through Vite. */
const localId = typeof __BUILD_ID__ === 'string' ? __BUILD_ID__ : ''

let lastCheck = 0
let checking = false

/* Remove the one-hop cache-buster. history.replaceState leaves the loaded
   document alone — it only rewrites what the address bar and any later
   canonical computation see. */
function stripParam() {
  try {
    const url = new URL(window.location.href)
    if (!url.searchParams.has(PARAM)) return
    url.searchParams.delete(PARAM)
    const search = url.searchParams.toString()
    window.history.replaceState(
      window.history.state,
      '',
      url.pathname + (search ? `?${search}` : '') + url.hash,
    )
  } catch {
    /* an exotic URL, or history disabled — the parameter is inert either way */
  }
}

async function serverId() {
  try {
    const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, {
      cache: 'no-store',
      credentials: 'omit',
    })
    if (!res.ok) return null
    const data = await res.json()
    return typeof data?.buildId === 'string' ? data.buildId : null
  } catch {
    /* offline, or `vite dev` where the file is not emitted — not an error,
       just nothing to compare against */
    return null
  }
}

/* Anything a previous build may have persisted outside the HTTP cache. The
   site registers no service worker, but a browser that picked one up from an
   earlier deploy — or from another project once served on this origin — would
   keep answering from it forever, which is the single most common cause of a
   permanently frozen page. Clearing unconditionally costs one no-op call. */
async function purgeStores() {
  try {
    const regs = (await navigator.serviceWorker?.getRegistrations()) ?? []
    await Promise.all(regs.map((r) => r.unregister()))
  } catch {
    /* unsupported, or blocked by the page's storage settings */
  }
  try {
    const keys = (await window.caches?.keys()) ?? []
    await Promise.all(keys.map((k) => window.caches.delete(k)))
  } catch {
    /* same */
  }
}

async function reloadOnto(id) {
  const key = `taif:reloaded:${id}`
  try {
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
  } catch {
    /* no sessionStorage (private mode on old Safari) — proceed once and
       accept that a pathological cache could reload twice */
  }
  await purgeStores()
  try {
    const url = new URL(window.location.href)
    url.searchParams.set(PARAM, id)
    window.location.replace(url.toString())
  } catch {
    window.location.reload()
  }
}

async function check() {
  if (checking) return
  const now = Date.now()
  if (now - lastCheck < MIN_INTERVAL) return
  lastCheck = now
  checking = true
  try {
    /* Content first, and unconditionally. It is the cheaper repair and the
       one that needs no reload: if only the client's copy is out of date the
       page simply re-renders with the new text. It also covers the case the
       build-id check cannot — a CDN handing out an old shell while the
       origin's content is current. */
    await refreshPublishedContent()

    if (!localId) return /* nothing was baked in — cannot compare builds */
    const id = await serverId()
    if (id && id !== localId) await reloadOnto(id)
  } finally {
    checking = false
  }
}

/** Start watching. Safe to call once, at boot. */
export function watchForNewBuild() {
  if (typeof window === 'undefined') return
  stripParam()
  /* after first paint: the check must never compete with the render for
     bandwidth on the visit that is already correct, which is nearly all of them */
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => check(), { timeout: 4000 })
  } else {
    window.setTimeout(check, 2000)
  }
  /* a tab left open across a publish picks the new build up when it is
     looked at again, rather than on its next cold load */
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check()
  })
  window.addEventListener('pageshow', (e) => {
    /* restored from the back/forward cache — that document was never
       re-fetched, so it is exactly the case worth re-checking */
    if (e.persisted) check()
  })
}
