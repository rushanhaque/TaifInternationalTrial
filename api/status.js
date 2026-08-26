/* Vercel serverless function — /api/status
   ───────────────────────────────────────────────────────────────────────────
   WHY THIS EXISTS

   "The client sees an old site" has several possible causes that look
   identical from a browser, and they need opposite fixes:

     · the visitor's browser or a proxy handed them an old document;
     · the visitor is not reaching this Vercel project at all — an old
       Netlify or Cloudflare Pages deployment still answers for the domain,
       or the apex and www point at different places;
     · the deployment IS the newest one, but it was built before the last
       /admin publish, so its content is genuinely old.

   Opening this endpoint on the affected device answers all three in one
   request, with no guessing and nothing to clear:

     404 or HTML back        → not this project. DNS, domain or another host.
     deployedCommit is old   → the deploy did not happen or it failed; the
                               production alias is still on an older build.
     inSync: false           → the deployment predates the content commit —
                               GitHub has content this build never saw.
     inSync: true            → the origin is correct and current, so anything
                               stale on screen came from a cache in between.

   Read-only. It commits nothing, and returns commit ids and timestamps only —
   never the token, never repository contents. */

const DEFAULT_OWNER  = 'rushanhaque'
const DEFAULT_REPO   = 'TaifInternationalTrial'
const DEFAULT_BRANCH = 'main'
const CONTENT_PATH   = 'src/data/content.snapshot.json'

function ghHeaders(token) {
  const h = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    /* GitHub serves the REST API through its own CDN and will happily hand
       back a cached representation. Every read here exists to answer "what is
       true right now", so a cached answer is worse than no answer. */
    'Cache-Control': 'no-cache',
  }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

const short = (sha) => (typeof sha === 'string' ? sha.slice(0, 12) : null)

export default async function handler(req, res) {
  /* This report is about freshness. Caching it would be self-defeating. */
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('CDN-Cache-Control', 'no-store')

  const owner  = process.env.GITHUB_OWNER  || DEFAULT_OWNER
  const repo   = process.env.GITHUB_REPO   || DEFAULT_REPO
  const branch = process.env.GITHUB_BRANCH || DEFAULT_BRANCH
  const token  = process.env.GITHUB_TOKEN

  /* What this running deployment was built from. Vercel sets these at build
     time and bakes them into the function's environment. */
  const deployment = {
    env: process.env.VERCEL_ENV || 'unknown',
    deploymentUrl: process.env.VERCEL_URL || null,
    region: process.env.VERCEL_REGION || null,
    deployedCommit: short(process.env.VERCEL_GIT_COMMIT_SHA),
    deployedBranch: process.env.VERCEL_GIT_COMMIT_REF || null,
    servedAt: new Date().toISOString(),
  }

  const api = `https://api.github.com/repos/${owner}/${repo}`
  const out = { ok: true, deployment, github: null, inSync: null, notes: [] }

  if (!deployment.deployedCommit) {
    out.notes.push(
      'VERCEL_GIT_COMMIT_SHA is not set — this deployment was not built from a Git push, so it cannot be compared with GitHub.',
    )
  }

  try {
    const [headRes, contentRes] = await Promise.all([
      fetch(`${api}/commits/${encodeURIComponent(branch)}`, { headers: ghHeaders(token) }),
      fetch(
        `${api}/commits?path=${encodeURIComponent(CONTENT_PATH)}&sha=${encodeURIComponent(branch)}&per_page=1`,
        { headers: ghHeaders(token) },
      ),
    ])

    if (!headRes.ok) {
      out.notes.push(`GitHub refused the branch read (${headRes.status}).`)
      return res.status(200).json(out)
    }

    const head = await headRes.json()
    const contentCommits = contentRes.ok ? await contentRes.json() : []
    const contentCommit = Array.isArray(contentCommits) ? contentCommits[0] : null

    out.github = {
      branch,
      headCommit: short(head?.sha),
      headCommittedAt: head?.commit?.committer?.date ?? null,
      lastContentCommit: short(contentCommit?.sha),
      lastContentCommitAt: contentCommit?.commit?.committer?.date ?? null,
      lastContentMessage: contentCommit?.commit?.message ?? null,
    }

    if (deployment.deployedCommit && out.github.headCommit) {
      out.inSync = deployment.deployedCommit === out.github.headCommit
      if (!out.inSync) {
        out.notes.push(
          'This deployment is not built from the newest commit on the branch. Either a build is still running, the last build failed and the production alias is still on an older deployment, or the Git integration did not fire.',
        )
      }
    }
  } catch (err) {
    out.notes.push(`Could not reach GitHub: ${err.message}`)
  }

  return res.status(200).json(out)
}
