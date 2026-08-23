/* ── ASSET URL VERSIONING ──────────────────────────────────────────────────
   Files under public/ keep the same filename across deploys, so their URL is
   not a cache key — the bytes can change while the URL does not.

   That bit us hard. While public/assets/ was missing from the deploy those
   URLs answered with a 404/index.html, and vercel.json stamped the reply
   `Cache-Control: max-age=31536000, immutable`. `immutable` means the browser
   must NOT revalidate, so every visitor who loaded the site during that window
   has the broken response pinned until 2027. Fixing the files on the server
   cannot reach them: the browser never asks again.

   Appending a version turns the URL itself into the cache key, so a bump
   forces every client onto a fresh entry. BUMP `V` whenever a file under
   public/ is replaced in place, or when a caching mistake needs flushing.

   Vite-imported images do not need this — Vite content-hashes those filenames,
   so their URL already changes with their bytes. This is only for the paths
   that live in public/ and are referenced as plain strings. */

export const V = '4'

/** Version a site-absolute public/ asset path: '/a/b.webp' -> '/a/b.webp?v=3' */
export const asset = (path) => `${path}?v=${V}`
