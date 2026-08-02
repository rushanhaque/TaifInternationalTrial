# TAIF INTERNATIONAL — Where Metal Meets Grain

Marketing site for a metal and wood handicraft manufacturer and exporter in
Moradabad, India. The proposition the whole site is built to carry:
**two materials, worked by hand, that leave the floor as one object** —
hand-raised brass and burnished copper joined to seasoned hardwood, with the
joint levelled flush.

Aesthetic register: a Swiss-clinical 12-column grid on a warm alabaster ground
(`#faf7f2`), huge tight-tracked neo-grotesk type, fully rounded corners on every
surface, and one polished-metal accent that only ever appears in motion.

## Palette

White first — `--white` is the working surface and `--chrome` a barely-there
warm alabaster beneath it, so white panels read as *lifted* rather than flat.
Ink is warm walnut-black, never grey; shadows are warm too.

| Role | Token | Value |
|---|---|---|
| Ground | `--white` / `--chrome` | `#ffffff` / `#faf7f2` |
| Wells & tracks | `--chrome-2` / `--chrome-3` | `#f1ebe1` / `#e3d9c9` |
| Ink | `--graphite` / `--graphite-2` | `#241c14` / `#5a4632` |
| Dark surface | `--deep` | `#1e1710` espresso walnut |
| Metals | `--brass` / `--copper` | `#b0894f` / `#b4703c` |
| Woods | `--walnut` / `--oak` | `#6b4a2e` / `#c7a579` |
| Accent (motion only) | `--metal` | copper→brass→gold specular sweep |
| Accent type | `--tint-deep` / `--tint-on-deep` | `#8a5a20` (5.9:1) / `#e0bb80` (9.8:1) |

`--metal` never carries small text; where accent type is needed the solid
`--tint-*` values are used and all pass 4.5:1.

**Material tones** (`.tone-*` in `global.css`, referenced from catalogue data):
`brass`, `antique`, `copper`, `wood`, `walnut`, `inlay`. The former
mirror/pewter/steel/nickel/graphite/iris keys remain as aliases.

## Stack

- **Vite 5 + React 18** — custom `pushState` router, no router library
- **GSAP 3** (ScrollTrigger, CustomEase) + **Lenis** smooth scroll, synced to the GSAP ticker
- No CSS framework, no monospace, **zero image/video payload** — every visual is a
  CSS-gradient "slab" with a metal sheen
- Fonts: Archivo (expanded width axis) + Inter Tight, Google Fonts, `display=swap`

Build: `npm install && npm run build` · Dev: `npm run dev` · Deploy: `vercel.json`
rewrites all routes to `index.html` (required — deep links 404 without it).

## Routes (14)

| Idx | Route | Page |
|---|---|---|
| 0.1 | `/` | Home — hero, ribbon, figures, drag rail, finish morph, process teaser, partners, CTA |
| 0.2 | `/catalogue` | 20 products, segmented filter, fling grid |
| 0.3 | `/catalogue/:slug` | Product — specs, manual finish morph, related rail |
| 0.4 | `/finishes` | Pinned five-finish morph, swatch wall, comparison table |
| 0.5 | `/process` | Eight-stage stepper |
| 0.6 | `/capabilities` | Contract manufacture, held specs, MOQ table |
| 0.7 | `/materials` | Three metals and three woods with measured properties |
| 0.8 | `/workshop` | 1998 narrative, draggable year rail, principles, team |
| 0.9 | `/partners` | Client roster, before/after comparisons, testimonials |
| 1.0 | `/care` | Four material guides as segmented tabs |
| 1.1 | `/contact` | Fluid-label form with droplet-collapse success |
| 1.2 | `/faq` | Inflating pill disclosure rows |
| 1.3 | `/legal` | Terms & privacy with a liquid-pill index |
| 1.4 | `*` | "This one was never made." |

## Motion catalogue

**Environment & chrome** — E1 Sheen Drift (cursor-tilted highlight on every
slab, one CSS property write per frame) · E2 Meniscus Edge (breathing SVG-clipped
slab boundary, one shared ticker, max 4 concurrent) · E3 Blobber (gooey cursor,
filter confined to a 320×320 travelling layer; swallows interactive targets as an
inverting pill) · E4 Viscosity Bar (full-width top-edge scroll gauge with
velocity-driven thickness and a decimal depth readout) · E5 Coalesce preloader ·
E6 Liquid Pill nav indicator (lead/trail stretch).

**Reveals & scroll** — E7 Dilate (default reveal: swell from centre with radius
morph) · E8 Char Cascade (centre-out squash-and-settle characters) · E9 Drag Rail
(manual momentum physics: grab, fling, rubber-band, velocity skew; scroll-linked;
buttons + arrow keys; native scroll-snap on touch/reduced-motion) · E10 Fling Grid ·
E11 Finish Morph (pinned five-finish cross-dissolve with a re-shaping meniscus;
manual variant on product pages; static five-up fallback) · E12 Wave Ribbon
(text riding breathing SVG paths) · E13 Fluid Fill Numerals (outlined figures fill
with a wobbling level — no counting) · E14 Grid Snap (children snap onto the
12-column grid, guides flash once) · E15 Stepper (fat pill tube filling with
metal; inflating stage nodes) · E16 Surface Tension Pull (section boundary
stretches toward the cursor) · E17 Tide Wordmark (molten metal rises through the
outlined footer mark; letters settle on hover).

**Micro-interaction** — H1 Liquid Fill + Surge Press buttons (flood from pointer
entry point; squash-and-stretch press) · H2 Slab Warp (asymmetric corner-radius
morph tracking the pointer) · H3 Elastic Underline (nav) · H4 Droplet Bead
(perimeter-travelling corner bead) · H5 Column Highlight (hover reveals occupied
grid columns) · H6 Segmented Slide toggles · H7 Fluid Label pill inputs with a
caret-following metal pool; droplet-collapse submit · H8 Pointer Wake
(warm trail, dark sections only).

**Transition** — T1 Meniscus Wipe: a molten-metal mass floods up with a wavy
meniscus, holds while the route's decimal index and title cascade in, then drains.

## Discipline

- **Performance (§9):** ~133 kB JS gzipped across three chunks (budget ≤145),
  ~8.1 kB CSS (≤13), zero image bytes. One shared pointer rAF; one meniscus ticker;
  `backdrop-filter` on the navbar only; pinned sequences inside
  `gsap.matchMedia('(min-width:900px) and (prefers-reduced-motion: no-preference)')`.
- **Accessibility (§10):** skip link; aria-labelled split headlines; every drag
  surface has buttons + keyboard; FAQ rows are real buttons with `aria-expanded`;
  the comparison handle is a native range input; visible `:focus-visible`
  everywhere; under `prefers-reduced-motion` the site is complete and static.
- **Rebrand:** the brand lives once, in `src/data/site.js` (`BRAND`) — navbar,
  footer tide, preloader, transitions and SEO all derive from it. `BRAND.mark`
  is the short display wordmark, `BRAND.name` the full legal name.

## Before launch

Content in `src/data/site.js` and `src/data/catalogue.js` is written to the right
shape but the specifics are **placeholders**. Replace with the client's real data:

- contact details (`BRAND.email`, `BRAND.phone`) and the three `LOCATIONS`
- `BRAND.est` and the `TIMELINE` years
- `FIGURES`, the held specs on `/capabilities`, and all numeric claims
- `CERTS` — only list certifications the client actually holds
- `TEAM` names and roles, `PARTNERS`, `CASES`, `TESTIMONIALS`
- catalogue dimensions, weights, MOQs and lead times
- `index.html` title, description, Open Graph tags and JSON-LD
