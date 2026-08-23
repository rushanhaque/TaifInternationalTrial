/* ============ publish to GitHub (via server-side API route) ============
   The GitHub token lives in a Vercel environment variable (GITHUB_TOKEN) and
   never reaches the browser. The admin UI POSTs the content snapshot to
   /api/publish, which commits it to the repo and triggers a redeploy.

   No token entry in the browser. No token in the bundle. */

/* Sent as x-admin-secret so the endpoint can turn away callers who merely
   found the URL. Read from the build environment, so it is only in the
   bundle if it was set; see the matching note in api/publish.js about what
   this does and does not protect. */
const SECRET = import.meta.env.VITE_ADMIN_PUBLISH_SECRET || ''

/* ── putting the images back before publishing ────────────────────────────
   THE ROUND-TRIP THIS CLOSES

   content.snapshot.json — the file this endpoint commits — stores uploaded
   images as data: URLs. Before every build, scripts/extract-content-images.mjs
   writes each of those out to public/img/content/<hash>.webp and hands the app
   a copy of the snapshot with paths instead, so the pictures stop weighing
   down the JS bundle.

   The admin UI therefore holds paths, not data URLs. Publishing that state
   verbatim would replace the data URLs in the committed file with paths — and
   those files are generated, gitignored, and rebuilt from the data URLs that
   just got overwritten. The first publish would look fine (the extracted files
   still exist on that build) and the *next* deploy would ship a site whose
   every uploaded image 404s, with no way back short of a git revert.

   So publishing reverses the extraction: each /img/content/ path is fetched
   from this same origin and inlined back to a data URL. The committed file
   stays the single source of truth, the bundle stays small, and the two steps
   are exact inverses of each other.

   A path that cannot be fetched is left alone rather than dropped — losing a
   reference is recoverable, silently deleting an image is not. */
const EXTRACTED = '/img/content/'

const toDataUrl = (blob) => new Promise((resolve, reject) => {
  const r = new FileReader()
  r.onload = () => resolve(r.result)
  r.onerror = () => reject(new Error('unreadable'))
  r.readAsDataURL(blob)
})

async function inlineExtractedImages(node, cache) {
  if (typeof node === 'string') {
    if (!node.startsWith(EXTRACTED)) return node
    if (cache.has(node)) return cache.get(node)
    try {
      const res = await fetch(node)
      if (!res.ok) throw new Error(String(res.status))
      const url = await toDataUrl(await res.blob())
      cache.set(node, url)
      return url
    } catch {
      cache.set(node, node)
      return node
    }
  }
  if (Array.isArray(node)) {
    const out = []
    for (const v of node) out.push(await inlineExtractedImages(v, cache))
    return out
  }
  if (node && typeof node === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(node)) out[k] = await inlineExtractedImages(v, cache)
    return out
  }
  return node
}

/** Commit `snapshot` (the content store) via the server-side publish endpoint. */
export async function publishSnapshot(snapshot) {
  const payload = await inlineExtractedImages(snapshot, new Map())

  const res = await fetch('/api/publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(SECRET ? { 'x-admin-secret': SECRET } : {}),
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    /* NEVER let this throw an empty message.
       `res.statusText` is not a usable fallback in production: HTTP/2 removed
       the reason phrase entirely, so on Vercel it is ALWAYS ''. Pair that
       with an error body that is not JSON — which is exactly what the
       platform returns for an oversized request — and `msg` stayed '',
       Error('') reached the admin, and the toast rendered as a 34px red pill
       with no text in it. Unreadable, and it named the one failure the admin
       most needs to understand. */
    let msg = ''
    let body = ''
    try { body = await res.text() } catch { /* body already consumed or gone */ }
    if (body) {
      try { msg = JSON.parse(body).error || '' } catch { /* not JSON */ }
    }

    if (!msg) {
      /* The payload is the usual culprit: images are stored as base64 data
         URLs inside the snapshot, so a few large uploads push the request
         past the serverless body limit. Say so, and say what to do. */
      const mb = (new Blob([JSON.stringify(payload)]).size / 1024 / 1024).toFixed(1)
      msg = res.status === 413 || res.status === 507
        ? `Too large to publish — the content is ${mb} MB and the server limit is about 4.5 MB. Re-upload the newest images (they compress on upload), or replace a few with pasted URLs, then publish again.`
        : `Publish failed — the server answered ${res.status}${res.statusText ? ` ${res.statusText}` : ''}. The content is ${mb} MB. Nothing was published; your edits are still here.`
    }
    throw new Error(msg)
  }
}

/** Kept for compatibility — no-ops now that the server holds the token. */
export function getToken() { return '' }
export function setToken() {}
export function getConfig() { return {} }
export function setConfig() {}
/* This used to POST {__probe:true} to /api/publish to test the connection.
   That endpoint writes its body straight over the content snapshot, so a
   "check" would have replaced the entire site's content with the word
   probe. Nothing calls this — it is kept only because the module's other
   compatibility shims are — and it now reports rather than writes. */
export async function verifyAccess() {
  return { ok: true, fullName: 'configured on server' }
}
