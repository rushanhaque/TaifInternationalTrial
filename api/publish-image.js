/* Vercel serverless function — /api/publish-image
   Commits ONE image file to public/img/content/ in the repo.

   WHY THIS EXISTS
   /api/publish sends the whole content snapshot in a single request, and
   uploaded images used to travel inside it as base64 data URLs. Images are
   ~99% of that snapshot's bytes, so the request grew with every upload until
   it crossed the ~4.5 MB serverless body limit and publishing simply stopped
   working — with no way forward except deleting images.

   Splitting the images out fixes that for good rather than buying headroom:
   each picture is its own request (each already capped near 900 kB by the
   encoder in src/lib/image.js), and the snapshot that follows carries only
   paths, which is a few kB no matter how many images exist.

   Filenames are content hashes computed by the client with the SAME
   algorithm as scripts/extract-content-images.mjs (sha256, first 16 hex
   chars), so a given image has one name everywhere and re-uploading
   identical bytes is a no-op rather than a duplicate.

   Environment variables: the same set /api/publish uses.                   */

const DEFAULT_OWNER  = 'rushanhaque'
const DEFAULT_REPO   = 'TaifInternationalTrial'
const DEFAULT_BRANCH = 'main'

/* Everything this endpoint may write, and nothing else. The path arrives
   from the browser, so without this it is an arbitrary-file-write into the
   repo — a caller could overwrite api/publish.js or a workflow file. */
const ALLOWED_DIR = 'public/img/content/'
const ALLOWED_NAME = /^[0-9a-f]{16}\.(webp|jpg|png|avif|gif|svg)$/

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

  const secret = process.env.ADMIN_PUBLISH_SECRET
  if (secret && req.headers['x-admin-secret'] !== secret) {
    return res.status(401).json({ error: 'Not authorised to publish.' })
  }

  const owner  = process.env.GITHUB_OWNER  || DEFAULT_OWNER
  const repo   = process.env.GITHUB_REPO   || DEFAULT_REPO
  const branch = process.env.GITHUB_BRANCH || DEFAULT_BRANCH

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Request body must be JSON.' })
  }

  const name = String(body?.name || '')
  const contentBase64 = String(body?.contentBase64 || '')

  /* Only a bare content-hashed filename is accepted — no directories, no
     traversal, no extensions we do not serve. */
  if (!ALLOWED_NAME.test(name)) {
    return res.status(400).json({ error: `Refusing to write "${name}" — expected a content-hashed image filename.` })
  }
  if (!contentBase64) {
    return res.status(400).json({ error: 'No image content in the request.' })
  }

  const path = ALLOWED_DIR + name
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`

  /* Already there? The name IS the hash of the bytes, so a file at this path
     is byte-identical by construction and re-committing it would only add an
     empty commit and another deploy. */
  try {
    const head = await fetch(`${api}?ref=${encodeURIComponent(branch)}`, { headers: ghHeaders(token) })
    if (head.status === 200) {
      return res.status(200).json({ ok: true, path: `/img/content/${name}`, skipped: true })
    }
    if (head.status !== 404) {
      return res.status(502).json({ error: `GitHub read failed: ${await head.text()}` })
    }
  } catch (err) {
    return res.status(502).json({ error: `GitHub read error: ${err.message}` })
  }

  let put
  try {
    put = await fetch(api, {
      method: 'PUT',
      headers: ghHeaders(token),
      body: JSON.stringify({
        message: `Add content image ${name}`,
        content: contentBase64,
        branch,
      }),
    })
  } catch (err) {
    return res.status(502).json({ error: `GitHub write error: ${err.message}` })
  }

  if (!put.ok) {
    return res.status(502).json({ error: `GitHub rejected the image: ${await put.text()}` })
  }

  return res.status(200).json({ ok: true, path: `/img/content/${name}` })
}
