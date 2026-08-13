/* ============ publish to GitHub (via server-side API route) ============
   The GitHub token lives in a Vercel environment variable (GITHUB_TOKEN) and
   never reaches the browser. The admin UI POSTs the content snapshot to
   /api/publish, which commits it to the repo and triggers a redeploy.

   No token entry in the browser. No token in the bundle. */

/** Commit `snapshot` (the content store) via the server-side publish endpoint. */
export async function publishSnapshot(snapshot) {
  const res = await fetch('/api/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(snapshot),
  })

  if (!res.ok) {
    let msg = res.statusText
    try { msg = (await res.json()).error || msg } catch { /* use statusText */ }
    throw new Error(msg)
  }
}

/** Kept for compatibility — no-ops now that the server holds the token. */
export function getToken() { return '' }
export function setToken() {}
export function getConfig() { return {} }
export function setConfig() {}
export async function verifyAccess() {
  const res = await fetch('/api/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ __probe: true }),
  })
  if (res.status === 500) {
    const j = await res.json().catch(() => ({}))
    throw new Error(j.error || 'Server error — check GITHUB_TOKEN is set in Vercel.')
  }
  return { ok: true, fullName: 'configured on server' }
}
