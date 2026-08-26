import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/* ── the build's identity ──────────────────────────────────────────────────
   One string that changes whenever the deployed site changes, baked into the
   bundle as __BUILD_ID__ and written to dist/version.json. src/lib/freshness.js
   compares the two at runtime and reloads a browser that is holding an older
   document than the server has. See that file for why headers alone are not
   enough.

   The host's commit SHA is the right source where there is one: a publish
   from /admin lands as a commit, so a new SHA means new content. Falling
   back to the local git HEAD keeps `npm run build` on a laptop honest, and
   the timestamp keeps a build outside a checkout (a tarball, a container)
   from silently sharing an id with a different build. */
function buildId() {
  const fromHost =
    process.env.VERCEL_GIT_COMMIT_SHA || /* Vercel  */
    process.env.COMMIT_REF || /* Netlify */
    process.env.GITHUB_SHA || /* Actions */
    process.env.CF_PAGES_COMMIT_SHA /* Cloudflare Pages */
  if (fromHost) return fromHost.slice(0, 12)
  try {
    return execSync('git rev-parse --short=12 HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return String(Date.now())
  }
}

const BUILD_ID = buildId()

/* Two files emitted into the root of dist/ rather than kept in public/, so
   neither is ever committed and neither can go stale against the bundle
   beside it.

     version.json           — which build this is. src/lib/freshness.js
                              compares it with the id compiled into the JS to
                              catch a document served from a cache.
     published-content.json — the admin's content, byte-identical to what is
                              compiled into the bundle, but reachable without
                              it. src/lib/content.jsx re-reads it at runtime so
                              a publish is not trapped behind a cached JS
                              chunk. See refreshPublishedContent() there.

   published-content.json is read from the file the build step has already
   produced (content.snapshot.built.json — images lifted out to real paths),
   NOT from content.snapshot.json, so the two copies cannot disagree about
   where an image lives. */
const SNAPSHOT = 'src/data/content.snapshot.built.json'

const emitRuntimeFiles = () => ({
  name: 'taif-runtime-files',
  apply: 'build',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'version.json',
      source: JSON.stringify({ buildId: BUILD_ID, builtAt: new Date().toISOString() }),
    })

    let snapshot = ''
    try {
      snapshot = readFileSync(SNAPSHOT, 'utf8')
      JSON.parse(snapshot) /* never emit something the site would choke on */
    } catch (err) {
      /* `npm run build` runs the prep step first, so this should not happen.
         Warn rather than fail: without the file the site simply falls back to
         the snapshot compiled into the bundle, which is the old behaviour. */
      this.warn(`${SNAPSHOT} unreadable (${err.message}) — published-content.json not emitted`)
      return
    }
    this.emitFile({ type: 'asset', fileName: 'published-content.json', source: snapshot })
  },
})

export default defineConfig({
  plugins: [react(), emitRuntimeFiles()],
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
  server: process.env.PORT ? { port: Number(process.env.PORT), strictPort: true } : undefined,
  build: {
    target: 'es2019',
    cssCodeSplit: false,
    minify: 'esbuild',
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['gsap', '@gsap/react', 'lenis'],
        },
      },
    },
  },
})
