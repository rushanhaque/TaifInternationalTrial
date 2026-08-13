/* Vercel serverless function — /api/publish
   Commits content.snapshot.json to the repo using a GitHub token stored as a
   Vercel environment variable (GITHUB_TOKEN). The token never reaches the
   browser; the admin UI just POSTs the content payload here.

   Environment variables required (set in Vercel dashboard → Settings → Environment Variables):
     GITHUB_TOKEN   — fine-grained PAT with Contents: Read and write on this repo
     GITHUB_OWNER   — repo owner, e.g. rushanhaque           (optional, falls back to default)
     GITHUB_REPO    — repo name,  e.g. TaifInternationalTrial (optional, falls back to default)
     GITHUB_BRANCH  — branch,     e.g. main                   (optional, falls back to default)
     GITHUB_PATH    — file path in repo                        (optional, falls back to default)
*/

const DEFAULT_OWNER  = 'rushanhaque'
const DEFAULT_REPO   = 'TaifInternationalTrial'
const DEFAULT_BRANCH = 'main'
const DEFAULT_PATH   = 'src/data/content.snapshot.json'

function b64(str) {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

function ghHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return res.status(500).json({ error: 'GITHUB_TOKEN environment variable is not set on the server.' })
  }

  const owner  = process.env.GITHUB_OWNER  || DEFAULT_OWNER
  const repo   = process.env.GITHUB_REPO   || DEFAULT_REPO
  const branch = process.env.GITHUB_BRANCH || DEFAULT_BRANCH
  const path   = process.env.GITHUB_PATH   || DEFAULT_PATH

  let snapshot
  try {
    snapshot = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Request body must be JSON.' })
  }

  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`

  // Fetch current SHA so we can update rather than create
  let sha
  try {
    const current = await fetch(`${api}?ref=${encodeURIComponent(branch)}`, {
      headers: ghHeaders(token),
    })
    if (current.status === 200) {
      sha = (await current.json()).sha
    } else if (current.status !== 404) {
      const msg = await current.text()
      return res.status(502).json({ error: `GitHub read failed: ${msg}` })
    }
  } catch (err) {
    return res.status(502).json({ error: `GitHub read error: ${err.message}` })
  }

  // Commit
  const body = {
    message: `Publish content edits from /admin — ${new Date().toISOString()}`,
    content: b64(JSON.stringify(snapshot, null, 2)),
    branch,
    ...(sha ? { sha } : {}),
  }

  let put
  try {
    put = await fetch(api, {
      method: 'PUT',
      headers: ghHeaders(token),
      body: JSON.stringify(body),
    })
  } catch (err) {
    return res.status(502).json({ error: `GitHub write error: ${err.message}` })
  }

  if (!put.ok) {
    const msg = await put.text()
    return res.status(502).json({ error: `GitHub rejected the commit: ${msg}` })
  }

  return res.status(200).json({ ok: true })
}
