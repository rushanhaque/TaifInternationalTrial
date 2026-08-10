/* ============ publish to GitHub ============
   Commits the current content store to src/data/content.snapshot.json in the
   repo, via GitHub's Contents API, directly from the browser — no server.
   This is the same pattern Decap/Netlify CMS's "GitHub backend" uses.

   THE TOKEN NEVER TOUCHES SOURCE OR THE BUNDLE. It is typed into the admin's
   Settings tab at runtime and held in sessionStorage only:
     - cleared when the tab closes
     - never written to disk, never committed, never inlined into the JS Vite
       ships (unlike a VITE_-prefixed env var, which IS bundled and public)
     - readable by anyone with devtools open on this machine while it's set —
       this is convenience, not a vault. Use a fine-grained token scoped to
       Contents:write on this one repo, with an expiry, so a leak is small
       and self-limiting.

   A push here triggers Netlify/Vercel's normal deploy — publishing is a real,
   hard-to-instantly-undo action (revertible with another commit, not instant).
   The UI that calls this should always ask for confirmation first. */

const TOKEN_KEY = 'taif:gh:token'      // sessionStorage — memory-lifetime only
const CFG_KEY = 'taif:gh:cfg'          // localStorage — not secret, just config

const DEFAULT_CFG = {
  owner: 'rushanhaque',
  repo: 'TaifInternationalTrial',
  branch: 'main',
  path: 'src/data/content.snapshot.json',
}

export function getToken() {
  try { return sessionStorage.getItem(TOKEN_KEY) || '' } catch { return '' }
}
export function setToken(token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token)
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch { /* private-browsing storage blocks — the field just won't persist */ }
}

export function getConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(CFG_KEY))
    return { ...DEFAULT_CFG, ...(saved || {}) }
  } catch {
    return { ...DEFAULT_CFG }
  }
}
export function setConfig(cfg) {
  try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)) } catch { /* non-fatal */ }
}

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
})

/* UTF-8 safe base64 — btoa() alone mangles anything outside Latin1, and every
   quote mark and em dash in this site's copy is outside Latin1. */
function b64FromUtf8(str) {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

async function readGhError(res) {
  try {
    const j = await res.json()
    return j.message || res.statusText
  } catch {
    return res.statusText
  }
}

/** Read-only check: does this token exist and can it push to this repo?
 *  Makes no change — safe to run as often as you like. */
export async function verifyAccess() {
  const token = getToken()
  if (!token) throw new Error('Paste a GitHub token first.')
  const { owner, repo } = getConfig()

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: authHeaders(token),
  })
  if (res.status === 401) throw new Error('That token was rejected — check it was copied in full and has not expired.')
  if (res.status === 404) throw new Error(`Can't see ${owner}/${repo}. Either the name is wrong, or the token's repository access does not include it.`)
  if (!res.ok) throw new Error(`GitHub said: ${await readGhError(res)}`)

  const repoInfo = await res.json()
  if (!repoInfo.permissions?.push) {
    throw new Error(`Token can read ${owner}/${repo} but not write to it — check the Contents permission is set to "Read and write".`)
  }
  return { ok: true, fullName: repoInfo.full_name, defaultBranch: repoInfo.default_branch }
}

/** Commit `snapshot` (the content store) to the configured path and branch.
 *  Creates the file if it doesn't exist yet, updates it if it does. */
export async function publishSnapshot(snapshot, { message } = {}) {
  const token = getToken()
  if (!token) throw new Error('Paste a GitHub token first.')
  const { owner, repo, branch, path } = getConfig()
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`

  const current = await fetch(`${api}?ref=${encodeURIComponent(branch)}`, { headers: authHeaders(token) })
  let sha
  if (current.status === 200) {
    sha = (await current.json()).sha
  } else if (current.status !== 404) {
    throw new Error(`Couldn't read the current file: ${await readGhError(current)}`)
  }

  const body = {
    message: message || `Publish content edits from /admin — ${new Date().toISOString()}`,
    content: b64FromUtf8(JSON.stringify(snapshot, null, 2)),
    branch,
    ...(sha ? { sha } : {}),
  }

  const put = await fetch(api, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(body) })
  if (!put.ok) throw new Error(`GitHub rejected the commit: ${await readGhError(put)}`)
  return put.json()
}
