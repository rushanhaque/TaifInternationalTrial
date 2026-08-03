# TAIF INTERNATIONAL — handover

Everything a developer needs to take this site live, change it, and keep it
honest. Written for someone who has never seen the codebase.

---

## 1. What this is

A React 18 + Vite 5 marketing site. Plain JavaScript (`.jsx`, no TypeScript)
and vanilla CSS (no Tailwind, no CSS-in-JS). Motion is GSAP 3 with
ScrollTrigger; scrolling is smoothed by Lenis. Routing is a small custom
pushState router — **not** React Router.

```bash
npm install
npm run dev      # local, http://localhost:5173
npm run build    # production bundle into dist/
npm run preview  # serve the built bundle
```

---

## 2. Before you go live — the short list

| # | What | Where | Why it matters |
|---|------|-------|----------------|
| 1 | **Replace the photography** | `src/data/images.js` | Every image is currently a placeholder served from `picsum.photos`. The site depends on a third-party host until you change this. |
| 2 | Remove the placeholder preconnect | `index.html` | One commented line pointing at `picsum.photos`. Delete it with step 1. |
| 3 | Confirm the real figures | `src/data/site.js` | Phone, email, addresses, headcount, market count, certifications. |
| 4 | Confirm the catalogue | `src/data/catalogue.js` | 20 pieces with dimensions, weight, MOQ and lead times. These are quoted to buyers — they must be true. |
| 5 | Set the live domain | `public/sitemap.xml` | URLs are absolute and currently use `https://taifinternational.com`. |
| 6 | Add a social share image | `index.html` | There is no `og:image`. Deliberate: a stock photo as the brand's share card is worse than a clean text card. Add one when real photography exists. |

### Swapping the photography

`src/data/images.js` is the single place any image is named. Nothing else in
the codebase reads an image path. Drop files into `public/img/` and replace the
`pic()` calls with plain paths:

```js
export const HERO_IMG = '/img/hero.jpg'
```

Images are already `loading="lazy"` and `decoding="async"` wherever they appear
in markup, with `alt` text carried from the product data. The hero is a CSS
background rather than an `<img>`, so if you want the fastest possible largest
contentful paint, also add a `<link rel="preload" as="image">` for it in
`index.html` once its URL is static.

---

## 3. Deployment

The site is a single-page app: **every route must fall back to `index.html`**,
or a direct link to `/catalogue` returns 404. Three configs are committed and
kept in agreement — you only need whichever matches your host.

- `vercel.json` — rewrites plus security headers
- `netlify.toml` — same, in Netlify's format
- `public/_redirects` — Netlify's fallback file

Also committed: `public/robots.txt` and `public/sitemap.xml` (every real route,
including each collection family and each product).

Build output is `dist/`. No server, no database, no environment variables — the
enquiry flow composes a message and hands it to the visitor's own mail or
WhatsApp client (see §5).

---

## 4. Where the content lives

Content is data, not markup. You should rarely need to touch a component to
change what the site says.

| File | Holds |
|------|-------|
| `src/data/site.js` | Brand name and line, contact details, locations, finishes, FAQ, partner and process copy |
| `src/data/catalogue.js` | The 20 products: slug, name, category, material, dimensions, weight, MOQ, lead time, story, finishes |
| `src/data/images.js` | Every image URL |
| `src/App.jsx` | The route table, including each route's `<title>` and meta description |

Adding a product means adding one object to `CATALOGUE`. It will appear in the
catalogue gallery, the sortable index, its family's collection page, the
related-pieces rail, and get its own product page with a scale drawing — with
no other change. Add it to `public/sitemap.xml` too.

**Constraints on that data**, or the piece will render wrong:

- `tone` must be one of the `.tone-*` classes in `src/styles/global.css`
- `finishes` keys must exist in `FINISHES` in `src/data/site.js`
- `dims` must parse as either `Ø 280 × 95 mm` (round) or `460 × 220 × 24 mm`
  (rectangular), or the dimension drawing falls back to an honest
  "to drawing" panel rather than inventing geometry

---

## 5. The enquiry flow

There is no cart, no checkout and no payment — this is a B2B enquiry basket.

- Add a piece from any grid, the catalogue index, or its product page.
- The basket is **in-memory only and resets on refresh.** This is deliberate:
  a buyer should never return tomorrow to a stale list they have forgotten
  assembling.
- The pane offers WhatsApp and email. Both compose from one function
  (`enquiryText` in `src/lib/cart.jsx`) so the two channels cannot drift apart.
- The contact page carries the basket into its works order and sends the whole
  set as one message, with a reference number in the subject line.

To route enquiries elsewhere, change `BRAND.email` and `BRAND.phone` in
`src/data/site.js`. Nothing else needs editing.

---

## 6. The design system

`src/styles/tokens.css` is the source of truth: colour, elevation, easing,
duration, radius, and the paper texture. Use the tokens rather than new values —
the shadows in particular are tiered (`--lift-1` … `--lift-4`), and each tier is
two shadows, a tight contact shadow plus a broad ambient one, because a single
blurred shadow reads as a sticker.

Component styles live in `src/styles/mk2/` and are pulled in by the barrel
`src/styles/mk2/index.css`. **If you add a stylesheet there, add its `@import`
to the barrel or it will silently not load.**

Two stylesheets are intentionally not imported — `measured.css` and
`ledger.css`. Their components are built and working but are on no page. Re-add
the imports if you put them back.

---

## 7. House rules

These are load-bearing. Breaking one produces a bug that is hard to see in
development and obvious in production.

**Animations must fail open.** Anything seeded at `opacity: 0` must become
visible even if its trigger never fires. `src/components/mk2/RevealGuard.jsx` is
the backstop, and it deliberately runs on timers and scroll rather than
IntersectionObserver — IO shares the rendering pipeline with `requestAnimationFrame`,
so in the exact starved-frame scenario the guard exists for, IO and the reveal
fail together. The same reasoning applies to the spec dock and the router's
safety net.

**Never animate layout properties.** Accordions use
`grid-template-rows: 0fr → 1fr`, never `height`. Motion belongs on `transform`
and `opacity`.

**`@property` custom properties that a parent sets and a child reads must
declare `inherits: true`.** With `false`, children silently fall back to the
initial value and the animation appears not to run.

**Magnetism uses `translate`, not `transform`,** because buttons already animate
`transform` with GSAP. Keeping them on separate properties lets them compose.

**Respect `prefers-reduced-motion`.** Every animated component checks
`reduced()` from `src/lib/gsap.js`.

---

## 8. Accessibility commitments already made

Keep these when you change things.

- Real form controls: the patina dial is an `<input type="range">`, the
  catalogue index is a `<table>` with `aria-sort` and a caption.
- The spec dock leaves the tab order while it is off-screen, so focus never
  lands on a control nobody can see.
- The legal page's clause links report honestly: "Copied" only when the
  clipboard actually accepted the text, "In address bar" when it did not.
- Decorative images carry `aria-hidden`; meaningful ones carry real `alt`.
- Content is never gated behind an animation.

---

## 9. Known limitations

- **Photography is placeholder.** See §2. This is the single biggest thing
  standing between the site and launch.
- **No `og:image`.** See §2 — deliberate until real photography exists.
- **All routes ship in one JavaScript chunk.** Page transitions are instant as a
  result, which suits the curtain transition; the trade is a larger initial
  download (~200 KB gzipped total). Route-level code splitting would reduce
  first load but risks the curtain hanging on a slow chunk.
- **No analytics and no cookies.** Nothing tracks visitors. The privacy policy
  says so, so if you add analytics you must update `src/pages/LegalPage.jsx`.
