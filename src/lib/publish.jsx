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

/* ── images travel on their own, not inside the snapshot ──────────────────
   WHAT CHANGED AND WHY

   This module used to do the opposite of what it does now. Uploaded images
   lived in content.snapshot.json as data: URLs; a build step wrote them out
   to public/img/content/<hash>.<ext> so they would not weigh down the JS
   bundle; and publishing INLINED them back, because those extracted files
   were generated and gitignored, so a snapshot of bare paths would have
   pointed at files the next deploy never rebuilt.

   That worked and did not scale. Images are ~99% of the snapshot's bytes, so
   the single POST to /api/publish grew with every upload until it crossed the
   ~4.5 MB serverless body limit and publishing stopped working outright —
   the failure the admin saw as "the content is 5.1 MB".

   Now the extracted files are COMMITTED (see .gitignore), which makes a path
   a durable reference rather than a dangling one, so the inlining is no
   longer needed and the direction is reversed:

     · every data: URL is written to the repo as its own file, one request
       each, well inside the body limit — see api/publish-image.js;
     · the snapshot then carries paths only, a few kB regardless of how many
       pictures exist.

   The filename is a content hash produced with the SAME algorithm as
   scripts/extract-content-images.mjs (sha256, first 16 hex chars) so both
   halves of the system agree on a name and identical bytes are stored once.

   AN IMAGE THAT FAILS TO UPLOAD KEEPS ITS DATA URL. Substituting a path we
   failed to write would publish a reference to a file that does not exist,
   turning a retryable error into a broken image on the live site. Leaving it
   inline keeps the snapshot correct; if that makes the request too large the
   size error explains exactly that. */
const EXTRACTED = '/img/content/'

const DATA_URL = /^data:([a-z0-9.+/-]+);base64,([A-Za-z0-9+/=]+)$/i

/* Mirrors EXT in scripts/extract-content-images.mjs. A type not listed here
   is left as a data: URL rather than written under a guessed extension — a
   file served as the wrong type is a worse bug than a larger request. */
const EXT = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
}

const b64ToBytes = (b64) => {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i)
  return out
}

/** sha256 of the decoded bytes, first 16 hex chars — matches the build step. */
async function hashName(bytes, ext) {
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 16)}.${ext}`
}

/** Commit one image and return its public path, or null if it could not go. */
async function putImage(name, contentBase64) {
  const res = await fetch('/api/publish-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(SECRET ? { 'x-admin-secret': SECRET } : {}),
    },
    body: JSON.stringify({ name, contentBase64 }),
  })
  if (!res.ok) return null
  try { return (await res.json()).path || null } catch { return null }
}

/* Walk the snapshot, upload every data: URL, and swap in its path. `cache`
   keys on the data URL so the same picture used in two places is sent once.
   `stats` is reported back so the caller can say what happened. */
async function externaliseImages(node, cache, stats) {
  if (typeof node === 'string') {
    if (node.startsWith(EXTRACTED)) return node          // already a file
    const m = DATA_URL.exec(node)
    if (!m) return node
    if (cache.has(node)) return cache.get(node)

    const ext = EXT[m[1].toLowerCase()]
    if (!ext) { stats.skipped += 1; cache.set(node, node); return node }

    let path = null
    try {
      const bytes = b64ToBytes(m[2])
      path = await putImage(await hashName(bytes, ext), m[2])
    } catch {
      path = null
    }

    if (path) stats.uploaded += 1
    else stats.failed += 1
    const value = path || node
    cache.set(node, value)
    return value
  }
  if (Array.isArray(node)) {
    const out = []
    for (const v of node) out.push(await externaliseImages(v, cache, stats))
    return out
  }
  if (node && typeof node === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(node)) out[k] = await externaliseImages(v, cache, stats)
    return out
  }
  return node
}

/** Commit `snapshot` (the content store) via the server-side publish endpoint. */
export async function publishSnapshot(snapshot) {
  const stats = { uploaded: 0, failed: 0, skipped: 0 }
  const payload = await externaliseImages(snapshot, new Map(), stats)

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
        /* Images ship separately now, so a snapshot this large means some of
           them could not be uploaded and stayed inline — say that, because
           "make your images smaller" would be the wrong advice for it. */
        ? `Too large to publish — ${mb} MB. ${stats.failed} image${stats.failed === 1 ? '' : 's'} could not be uploaded and had to stay inside the content. Check your connection and publish again.`
        : `Publish failed — the server answered ${res.status}${res.statusText ? ` ${res.statusText}` : ''}. Nothing was published; your edits are still here.`
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
