# MERCURA — Implementation Plan
### Export 3 · a premium site for a metal handicraft manufacturer

> Complete build spec. Written to be handed to an implementing agent with no prior
> context: stack, tokens, file tree, the named motion catalogue, page-by-page sections,
> data shapes, performance budget, accessibility, build order, acceptance checklist.

---

## 0. Brief

Build a marketing website for a **metal handicraft manufacturer and exporter** (brass,
copper, bronze, pewter, chrome-plate). Demo brand, demo content throughout. **All imagery
and video are placeholder frames** — no real assets, no image payload. React preferred.
Premium, multi-million-dollar feel, heavily animated, and fast.

**This site competes against three sibling sites in the same category** — Export 1
(AERIS), Export 2 (ARGENT) and Export 4 (FILIGRANA). All four are judged together on
design, look, feel and performance. They must be comparably excellent and **completely
different**. Section 2 is the binding contract for that. Read it before writing code.

### The positioning that earns the different design

AERIS sells the works — a foundry's process and tolerances, on warm paper.
ARGENT sells the object — sculpture under gallery light, in a dark room.
FILIGRANA sells the ornament — inherited pattern, gilded and dense.

**MERCURA sells the material in motion — metal *before it sets*.** Molten, poured,
spun, flowing, mirror-bright. This is the modern, kinetic, almost-cosmetic end of
metalwork: chrome-finish tableware, mirror-polished sculpture, liquid-surface objects.
Where the others are still, Mercura *moves*. The entire system follows from one idea:
**a liquid metal surface that responds to touch.**

Aesthetic register: Swiss-clinical grid on an ice-chrome ground, huge tight-tracked
type, and one iridescent oil-slick accent that only ever appears in motion.

---

## 1. Brand

**Primary name: MERCURA** — from *mercury*, the metal that is liquid at room temperature.
Instantly understood, professional, and it names the concept exactly.

Alternates (one line to swap — §8.1): **QUICKSILVER** · **FLUENTA** (Latin, flowing) ·
**LIQUEN** · **VERSA** · **CHROMA**.

| Field | Value |
|---|---|
| Name | MERCURA |
| Line | Metal, Still Moving |
| Descriptor | Mirror-Finish Metalware & Contract Manufacture |
| Established | 2004 |
| Origin | Rajkot · India |
| Email | `hello@mercura.example` |
| Phone | `+91 99250 71180` |
| Section device | **Decimal indices** — `0.1` `0.2` … `1.0`, set in tabular figures |

> Section device is load-bearing. AERIS uses `AER — 001`. ARGENT uses `PLATE VII`.
> FILIGRANA uses ornamental medallions. **MERCURA uses bare decimals only** — `0.4`,
> never a word, prefix, numeral or ornament beside it.

---

## 2. Differentiation contract — READ FIRST

### 2.1 The four-site matrix

| Dimension | 1 · AERIS | 2 · ARGENT | **3 · MERCURA (build this)** | 4 · FILIGRANA |
|---|---|---|---|---|
| Ground | Warm **light** | Cool **dark** | **Cool light** — ice chrome `#eef1f4` | Warm **dark** |
| Accent | Molten copper | Cool jade | **Iridescent oil-slick gradient** | Aged gold + enamel |
| Metaphor | **Heat** | **Light** | **Flow** — liquid, viscosity, ripple | **Ornament** |
| Extra input | none (scroll) | mouse position | **drag + momentum physics** | rhythm choreography |
| Display type | High-contrast serif | Gallery grotesk | **Neo-grotesk, ultra-tight, huge** | Ornamental serif |
| Meta type | Monospace | Letterspaced sans | **Tabular-figure sans, tight** | Small-caps serif |
| Composition | Left asymmetric editorial | Centred, vitrine mat | **Hard Swiss grid, flush-left, no mat** | Symmetrical framed panels |
| Texture | Paper grain | Cursor light bloom | **Chrome sheen + liquid distortion** | Engraved line pattern |
| Corner language | Sharp, drafting ticks | Hairline mat, corner gaps | **Fully rounded — pill radii everywhere** | Scalloped, cusped arches |
| Scroll indicator | Thermometer °C, bottom-right | f-stop meter, left | **Viscosity bar, top edge, full width** | Ornamental progress ring |
| Primary CSS mechanism | transform + opacity | clip-path + filter + blend | **SVG mask/`feTurbulence` + `border-radius` morph + scale** | `stroke-dashoffset` + background-position |
| Motion character | Struck, stamped | Lit, focused | **Elastic, viscous, overshooting** | Unfurling, ceremonial |
| Reveal direction | Rises from below | Settles from above | **Expands from a centre point** | Draws in as a line |

### 2.2 Banned list — do not reproduce any of these

Present in the sibling sites. Re-implementing any of them, even renamed, fails the brief.

**From AERIS:** furnace/temperature preloader with a counting number · mould-split screen
open · caliper-bracket cursor · thermometer scroll gauge · diagonal blade page transition ·
spark/ember particles · pinned **horizontal card conveyor** · self-drawing weld divider
with travelling spark · molten vertical progress line · sticky-swapping visual column
beside a scrolling step list · word-by-word opacity text warm-up · periodic-table element
tiles · scale-down-plus-blur stamp reveal · glyph-scramble hover · magnetic buttons ·
stamped button with collapsing offset shadow · diagonal specular shine sweep · stencil
wordmark forging in · velocity-skewed marquee · rotating-plus accordion · floating-label
form with rubber stamp · drafting measurement ticks · paper grain.

**From ARGENT:** aperture/iris preloader · iris or shutter page transition · cursor
spotlight with blend mode · circular cursor reticle · f-stop exposure meter · Z-stacked
"deck through" pinned sequence · raking chiaroscuro light sweep · rack-focus blur scrub ·
odometer digit roll · split-flap text · refraction/chromatic hover split · contracting
corner brackets · Roman-numeral watermarks · slat-flip testimonials · FLIP vitrine
lightbox · two-pane reading-desk FAQ · exposure-invert section · seal-draw form success ·
gallery mat frame · settle-from-above reveals.

**Reserved for FILIGRANA — do not touch:** any `stroke-dashoffset` line-drawing of
ornament, jali/lattice pattern reveals, gold-leaf shimmer, unfurling scroll motifs,
medallion progress rings, ornamental borders that grow.

### 2.3 Shared foundation — deliberately identical

Same stack, same discipline, so the contest is decided on design: **Vite 5 + React 18 +
GSAP 3/ScrollTrigger + Lenis**, custom `pushState` router, no CSS framework, zero image
payload. What differs is the technique palette above.

---

## 3. Stack & setup

```
D:\ClaudeCode\Export 3\
```

```json
{
  "name": "mercura",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" },
  "engines": { "node": "20.x" },
  "dependencies": {
    "@gsap/react": "^2.1.2",
    "gsap": "^3.13.0",
    "lenis": "^1.1.18",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^5.4.11"
  }
}
```

`vite.config.js` — `cssCodeSplit: false`, target `es2019`, manual chunks
`vendor: [react, react-dom]`, `motion: [gsap, @gsap/react, lenis]`.

GSAP plugins used: **ScrollTrigger**, **Draggable**, **InertiaPlugin** *(if unavailable in
the free tier, implement momentum manually — see E9 note)*, **CustomEase**.

**Required deploy files:**
- `vercel.json` — rewrite `/(.*)` → `/index.html`. **Mandatory**: the router uses
  `history.pushState`; deep links 404 without it. Immutable cache headers on `/assets/(.*)`.
- `.nvmrc` → `20` · `.gitignore` → `node_modules`, `dist`, `.DS_Store`, `*.local`

**Fonts** — Google Fonts, preconnected, `display=swap`:
**Archivo Expanded** *(or `Anton` for the display weight)* + **Inter Tight** (400/500/600/700).
Nothing else, and **no monospace** — numerals use Inter Tight's `font-variant-numeric:
tabular-nums`.

**Favicon** — inline SVG: a chrome droplet (two overlapping circles) on `#eef1f4`.

---

## 4. Design system

### 4.1 Tokens — `src/styles/tokens.css`

```css
:root {
  /* ground — cool light, chrome */
  --chrome:     #eef1f4;
  --chrome-2:   #e2e7ec;
  --chrome-3:   #d5dce3;
  --white:      #fbfcfd;
  --shadow-soft: rgba(31, 42, 55, 0.08);

  /* ink — cool graphite, never pure black */
  --graphite:   #1f2a37;
  --graphite-2: #47566a;
  --dim:        rgba(31, 42, 55, 0.56);
  --faint:      rgba(31, 42, 55, 0.30);
  --hair:       rgba(31, 42, 55, 0.12);
  --hair-strong: rgba(31, 42, 55, 0.30);

  /* the one dark surface */
  --deep:       #131a23;
  --on-deep:    #e9edf1;
  --dim-on-deep: rgba(233, 237, 241, 0.56);
  --hair-on-deep: rgba(233, 237, 241, 0.16);

  /* accent — iridescent, only ever in motion */
  --iris: linear-gradient(100deg,
    #6ee7f0 0%, #7c9cf5 26%, #b98cf7 52%, #f77fb4 74%, #f6c86a 100%);
  --iris-soft: linear-gradient(100deg,
    rgba(110,231,240,.22), rgba(185,140,247,.22), rgba(246,200,106,.22));
  --tint:       #5b8def;   /* solid fallback for text-on-accent contrast */
  --tint-deep:  #2f5fc4;

  /* chrome sheen for placeholder frames */
  --sheen: linear-gradient(160deg,
    #fdfefe 0%, #cfd8e0 22%, #f2f5f7 40%, #aab6c2 62%, #e8edf1 80%, #b9c4cf 100%);

  --font-display: 'Archivo Expanded', 'Archivo', system-ui, sans-serif;
  --font-body:    'Inter Tight', system-ui, sans-serif;

  /* easings — elastic and viscous; distinct curves from siblings */
  --ease-fluid:   cubic-bezier(0.65, 0, 0.35, 1);
  --ease-surge:   cubic-bezier(0.16, 1.1, 0.3, 1);   /* slight overshoot */
  --ease-viscous: cubic-bezier(0.5, 0, 0.1, 1);      /* slow start, long settle */

  /* radii — fully rounded is this site's signature */
  --r-sm: 10px;
  --r-md: 22px;
  --r-lg: 34px;
  --r-pill: 999px;

  --gutter: clamp(1.25rem, 4vw, 3.5rem);
  --nav-h: 68px;
  --col: 12;
}
```

**No `--mat`, no tick patterns, no grain.** The environmental texture here is chrome
sheen and liquid distortion (E1, E2).

### 4.2 Type

| Class | Font | Size | Notes |
|---|---|---|---|
| `.mega` | Archivo Expanded 700 | `clamp(3.6rem, 12vw, 11rem)` | tracking `-0.05em`, line-height `0.86` |
| `.d1` | Archivo Expanded 700 | `clamp(2.4rem, 6vw, 5rem)` | tracking `-0.04em` |
| `.d2` | Archivo Expanded 600 | `clamp(1.7rem, 3.4vw, 2.8rem)` | tracking `-0.03em` |
| `.d3` | Inter Tight 700 | `clamp(1.15rem, 1.9vw, 1.5rem)` | tracking `-0.01em` |
| `.body` | Inter Tight 400 | `1.0625rem` | line-height `1.62`, measure `58ch` |
| `.lede` | Inter Tight 400 | `clamp(1.1rem, 1.5vw, 1.35rem)` | `--graphite-2` |
| `.meta` | Inter Tight 600 | `0.7rem` | uppercase, tracking `0.1em`, **tabular-nums** |
| `.idx` | Inter Tight 600 | `0.8rem` | tabular-nums, e.g. `0.4` — accent-tinted |

Composition is **flush-left on a hard 12-column grid**, never centred (that is Argent's).
Headlines are set enormous and tight, breaking to 2–3 lines, with the grid visible in the
alignment of everything beneath them.

### 4.3 Layout

- Container `max-width: 1560px`, `padding-inline: var(--gutter)`.
- **Hard 12-column grid**, `gap: clamp(0.8rem, 1.6vw, 1.6rem)`. Sections declare
  explicit column spans; asymmetric spans (7/5, 8/4, 5/7) are the norm.
- Section rhythm `padding-block: clamp(5rem, 10vw, 9rem)`.
- **Every surface is rounded.** Cards `--r-md`, frames `--r-lg`, buttons and chips
  `--r-pill`, inputs `--r-pill`. Nothing in this site has a sharp corner — this is the
  fastest read of difference against all three siblings.
- Dividers are **thick soft rules** (3px, `--chrome-3`, `--r-pill`), never hairlines.
- Exactly two `.deep` (dark) sections per long page for contrast.
- Elevation via `box-shadow: 0 18px 50px -18px var(--shadow-soft)` — soft, diffuse,
  never an offset hard shadow.

### 4.4 Placeholders — `src/components/Slab.jsx`

Props: `tone`, `label`, `meta`, `ratio`, `video`, `blob`, `className`.

Tones are **chrome and cool** gradients built from `--sheen`: `mirror`, `pewter`,
`steel`, `nickel`, `graphite`, `iris` (the one iridescent tone, used sparingly).
Each slab renders: `border-radius: var(--r-lg)`, `overflow: hidden`, a chrome sheen
layer, a centred `.meta` label, and — when `blob` is set — an SVG mask whose edge is
a morphing blob (E2). **No corner brackets of any kind** (Aeris and Argent both use
them). Instead, slabs carry a **1px inner highlight** at the top edge and a soft
shadow beneath, reading as a polished physical plate.

---

## 5. File architecture

```
src/
  main.jsx
  App.jsx                  routes, SEO map, ErrorBoundary, Lenis, chrome mounts
  lib/
    gsap.js                register ScrollTrigger, Draggable, CustomEase; splitChars()
    useLenis.js            Lenis + GSAP ticker sync, getLenis(), getVelocity()
    router.jsx             pushState router + Meniscus page transition (T1)
    usePointer.js          one shared pointer rAF (feeds E1, E3, H2)
    useDrag.js             pointer-drag + momentum helper (feeds E9, E10)
  data/
    site.js                brand, nav, all demo content
    catalogue.js           products + specs
  components/
    Viscosity.jsx          top-edge scroll bar          (E4)
    Blobber.jsx            gooey cursor                 (E3)
    Preloader.jsx          droplet coalesce             (E5)
    Navbar.jsx             pill nav + liquid pill slide (E6, H1)
    MobileSheet.jsx        blob-expand menu
    Footer.jsx             ripple wordmark + tide rule  (E17)
    Slab.jsx               placeholder plates           (E2, H4)
    Reveal.jsx             Dilate / CharCascade / GridSnap (E7, E8, E14)
    Button.jsx             liquid fill + surge press    (H1)
    Counter.jsx            fluid-fill numerals          (E13)
    Ribbon.jsx             wave-path ticker             (E12)
    DragRail.jsx           momentum gallery             (E9)
    Swatches.jsx           finish selector, morphing    (E11)
    Stepper.jsx            viscous process stepper      (E15)
    Toggle.jsx             segmented control            (H6)
    Field.jsx              pill input, fluid label      (H7)
  pages/
    Home.jsx  CataloguePage.jsx  ProductPage.jsx  FinishesPage.jsx
    ProcessPage.jsx  CapabilitiesPage.jsx  MaterialsPage.jsx
    StudioPage.jsx  PartnersPage.jsx  CarePage.jsx
    ContactPage.jsx  FaqPage.jsx  LegalPage.jsx  NotFoundPage.jsx
  styles/
    tokens.css  global.css  home.css  pages.css
```

---

## 6. Motion catalogue

Every effect is named. Build them as specified; do not substitute. `RM` = must be
neutralised under `prefers-reduced-motion: reduce`.

### 6.1 Environment & chrome

**E1 · Chrome Sheen Drift** — the ambient texture of the site. Every `.slab` and every
`.deep` section carries a very slow-moving highlight band: a `linear-gradient` layer whose
`background-position` drifts on an 18-second loop, so polished surfaces never look
completely static. Additionally the drift **offsets by cursor X** (±8%), so moving the
mouse appears to tilt the light across every chrome surface at once.
*How:* one CSS `@keyframes` for the base loop; the cursor offset written once per rAF as a
CSS custom property `--sheen-x` on `document.documentElement` from `usePointer`.
*Perf:* a single property write per frame drives every surface. Never animate
`background-position` per-element in JS.

**E2 · Meniscus Edge** *(the signature surface treatment)* — slabs flagged `blob` have a
**liquid edge**: instead of a rectangle, their mask is an SVG path whose control points
breathe on a slow loop, so the plate's boundary undulates like the surface of mercury.
On hover the undulation amplitude doubles and speeds up.
*How:* an inline `<svg><clipPath>` with a path built from 8 control points; animate the
path `d` between 3 pre-authored states with GSAP (`morphSVG` is paid — instead cross-fade
between three `clipPath` definitions via opacity on stacked masked layers, or animate the
control points numerically and rebuild `d` in an `onUpdate`). Cap to **4 concurrent
meniscus slabs per viewport**.
*Where:* `Slab.jsx`. `RM`: static rounded rectangle.

**E3 · Blobber** *(cursor)* — not a ring, not brackets. A **gooey blob** of liquid chrome:
a primary circle (16px) that tracks the cursor tightly, plus **three trailing circles**
at increasing lag that visually merge into it via an SVG `feGaussianBlur` +
`feColorMatrix` goo filter. Over interactive elements the blob **swallows** the target —
it expands to the element's bounding box as a rounded pill and the element's label inverts.
On mousedown it compresses (`scaleX: 1.3, scaleY: 0.7`) then surges back on `--ease-surge`.
*How:* one SVG filter defined once; four `<circle>`s driven by `gsap.quickTo` at
lags `0.12 / 0.22 / 0.34 / 0.46`. The swallow state reads `getBoundingClientRect()` of the
hovered target on `mouseenter` and tweens `width/height/x/y/borderRadius`.
*Perf:* the goo filter is the one expensive item in this site. Apply it to a
**64×64 → 320×320 max** fixed layer only, never full-viewport. Disable on
`(pointer: coarse)` and `RM`.

**E4 · Viscosity Bar** *(scroll indicator)* — a **full-width bar across the very top edge**
(not a corner gauge). It fills with the `--iris` gradient as you scroll, and its **height
responds to scroll velocity**: 2px at rest, thickening to 6px when scrolling fast, easing
back. A small tabular-figure readout at the right shows page depth as a decimal (`0.42`),
matching the site's section device.
*How:* one document `ScrollTrigger` `onUpdate` → `gsap.set` on `scaleX` + a velocity-driven
`height` tween read from Lenis. `will-change: transform`.

**E5 · Droplet Coalesce** *(preloader)* — five separate chrome droplets scattered across a
`--chrome` screen slide toward the centre and **merge into one mass** (using the same goo
filter as E3), which then **stretches horizontally into the wordmark's bounding box** and
resolves into the logotype as the droplet layer fades and the letters snap sharp. No
counting number, no iris, no split. ~2.2s.
*Where:* `Preloader.jsx`. `RM`: skip to ready immediately.

**E6 · Liquid Pill** *(nav active indicator)* — a filled pill sits behind the active nav
link. On navigating, it **stretches** toward the new target (leading edge arrives first,
trailing edge follows ~120ms later, so it elongates in transit then contracts), like a
droplet moving along a surface.
*How:* animate `x` and `width` on two staggered tweens with different eases
(`--ease-surge` for the lead, `--ease-viscous` for the trail).

### 6.2 Reveals & type

**E7 · Dilate** *(the default reveal)* — blocks **expand from a centre point**: `scale:
0.94 → 1`, `opacity 0 → 1`, and `border-radius` morphing from `--r-lg` down to its
resting radius, so elements appear to *swell* into place rather than travel. Ease
`--ease-surge` with its slight overshoot. This is deliberately neither Aeris's rise-from-
below nor Argent's settle-from-above.
*Where:* `Reveal.jsx` → `<Dilate>`. Default everywhere.

**E8 · Char Cascade** *(display headlines)* — split to **characters**, not words or lines.
Each character arrives with `y: 18px`, `scaleY: 1.6 → 1` (a vertical squash-and-settle)
and `opacity`, staggered `0.014s` from the **centre outward** (`stagger: { from: 'center' }`).
The squash is what makes it read as liquid rather than typographic.
*How:* `splitChars()` in `lib/gsap.js`; parent gets `aria-label`, spans `aria-hidden`.
*Where:* every `.mega` and `.d1`.

**E9 · Drag Rail** *(the pinned signature — the drag-physics moment)* — a horizontal rail
of catalogue slabs the user can **grab and fling**. It has real momentum: releasing sends
it coasting with friction, and it **rubber-bands** at both ends. It also advances on
scroll, so it works without ever touching it — but the drag is the point, and no sibling
site has any drag interaction at all.
*How:* GSAP **Draggable** with `type: 'x'`, `inertia: true`, `edgeResistance: 0.85`,
`bounds`. If InertiaPlugin is unavailable, `useDrag.js` implements momentum manually:
track pointer velocity over the last 5 moves, on release tween `x` by `v * 0.28` with
`ease: 'power3.out'`, then clamp with a bounce tween. Additionally: while dragging, slabs
**skew** by `velocity * 0.02` (clamped ±8°) and their meniscus amplitude rises — the rail
feels viscous. Scroll linkage: a `ScrollTrigger` that adds to the same `x` value, so both
inputs share one source of truth.
*Where:* `Home.jsx`, `CataloguePage.jsx`.
*RM / touch:* falls back to a native `overflow-x: auto` scroll-snap rail.

**E10 · Fling Grid** — on the catalogue page, the whole grid can be **dragged in two axes**
within bounds (a light "board" feel), returning to origin with a slow elastic settle when
released past the edge. Subtle: max travel 80px. Gives the page a physical quality no
sibling has.

### 6.3 Signature scroll sequences

**E11 · Finish Morph** *(pinned)* — a pinned section showing **one object rendered in five
finishes**. As you scroll, the object's slab **cross-dissolves through the finishes while
its meniscus edge re-shapes** for each — mirror, brushed, satin, black-chrome, iridescent.
The finish name changes with a Char Cascade (E8) and a row of pill swatches fills
progressively. Because the object stays and only its *surface* changes, this reads as a
material demo, not a carousel.
*How:* `pin: true`, `scrub: 0.8`, `end: '+=2600'`; a master timeline cross-fading five
stacked masked layers; swatch fill via `scaleX`. Wrap in
`gsap.matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)')`
with a static five-up grid fallback.
*Where:* `Home.jsx`, `FinishesPage.jsx`.

**E12 · Wave Ribbon** *(ticker)* — terms run along a **curved SVG path** that undulates,
so the text physically rides a wave rather than a straight line. Two ribbons cross the
section at opposing angles. The path itself breathes slowly.
*How:* `<textPath>` on an animated `<path>`; scroll the text by animating `startOffset`.
Not scroll-velocity-coupled (that is Aeris's) — constant speed, path-driven.
*Where:* `Ribbon.jsx`.

**E13 · Fluid Fill Numerals** *(statistics)* — figures are **outlined**, and a liquid level
**rises inside the glyphs** to fill them as they enter, with a wobbling surface line at the
top of the fill that settles. The number itself does not count or roll — it is present
from the start and simply *fills*.
*How:* the numeral is duplicated: a stroked copy and a solid copy clipped by a rising
rectangle mask with a wavy top edge (SVG path, 2-state alternation). Fill on
`scrollTrigger` entry, ~1.4s, `--ease-viscous`.
*Where:* `Counter.jsx`.

**E14 · Grid Snap** — as each section enters, its children **snap onto the 12-column grid
from slightly off-alignment** (`x: ±14px`, randomised per child, resolving to 0) with a
crisp `--ease-fluid`, and the column guides flash at `opacity: 0.35` for 600ms once.
Reads as Swiss precision asserting itself — the counterpoint to all the liquid motion,
and what keeps the site feeling engineered rather than gimmicky.

**E15 · Viscous Stepper** *(process)* — the eight process stages sit along a **thick
vertical pill-shaped track**. A liquid level rises through the track as you scroll, and
each stage node **inflates** (`scale: 1 → 1.35`, radius morph) as the level reaches it,
then relaxes to `1.1` once passed. Copy for the active stage dilates in (E7).
Explicitly **not** a hairline rail with a gradient fill (Aeris) and **not** a numeral
spine (Argent) — it is a fat rounded tube filling with fluid.

**E16 · Surface Tension Pull** — between two adjacent sections, the boundary is not a
straight line: the upper section's bottom edge **stretches downward toward the cursor**
when the pointer approaches it, like a liquid surface being drawn up, snapping back when
the pointer leaves. Amplitude max 26px.
*How:* an SVG divider path whose middle control point tracks pointer X and proximity;
one path rebuild per rAF only while the pointer is within 140px of the boundary.
*Where:* two placements per long page, maximum.

**E17 · Tide Wordmark** *(footer)* — the brand name is set in outlined `.mega` type and a
**tide of iridescence rises through it** as the footer enters, driven by scroll position,
with a wave-edged waterline. Beneath it, a **thick pill rule swells from 3px to 8px** as it
grows outward. On hover of any letter, that letter's fill **sloshes** — the waterline tilts
briefly and settles.
*Where:* `Footer.jsx`. No forging, no letter-stagger, no gradient-fill-from-baseline
(that is Argent's).

### 6.4 Hover & micro-interaction

**H1 · Liquid Fill + Surge Press** *(buttons)* — pill buttons. On hover the `--iris`
gradient **floods in from the pointer's entry side** (a circle mask expanding from the
exact entry coordinate, not from an edge), and the label shifts to `--white`. On press the
button **compresses horizontally and expands vertically** (`scaleX: 0.96, scaleY: 1.06`)
then overshoots back on `--ease-surge` — a squash-and-stretch, never a stamped offset.
No particles, no ripple ring, no magnetism.

**H2 · Slab Warp** *(cards)* — on hover, the slab's `border-radius` **morphs asymmetrically**
(each corner to a different value, tracking pointer position — e.g. pointer top-left
rounds the top-left corner hardest) while the whole slab scales `1.015`. The label slides
up behind a rounded clip. Nothing desaturates, nothing shines diagonally.

**H3 · Elastic Underline** *(links)* — the underline is a **rubber band**: it stretches
from the previous hovered link to the new one across the nav/list, arriving with a wobble
(`--ease-surge`) and thinning in the middle while in transit. Between separate lists it
just dilates in place. No flipping, no scrambling.

**H4 · Droplet Bead** *(slab corners)* — instead of corner brackets, a small chrome **bead**
sits at one corner of each slab; on hover it **travels the slab's perimeter** once, tracing
the rounded edge, and settles at the opposite corner. Uses `offset-path: path(...)` with
`offset-distance` animated, or a simple `motion-path` polyfill via keyframed positions.

**H5 · Column Highlight** — hovering any grid-aligned block **tints its underlying grid
columns** faintly (`--iris-soft` at 8%), revealing which columns the element occupies.
Ties the liquid surface back to the Swiss grid; a genuinely distinctive detail.

**H6 · Segmented Slide** *(filters, toggles)* — filter controls are segmented pill
controls where the active background **slides** between segments with the same
lead/trail stretch as E6. Replaces chip-toggle patterns used by the siblings.

**H7 · Fluid Label** *(forms)* — pill-shaped inputs. The label sits inside at rest; on
focus it **shrinks and rises to the pill's upper-left as the pill itself grows 6px taller**,
and a thin iridescent line **pools** along the bottom inner edge, thickest under the caret
and thinning outward. On submit, the whole form **collapses to a droplet and re-expands**
as a confirmation card (E5's coalesce, reversed). No travelling underline, no seal, no
stamp.

**H8 · Pointer Wake** — moving quickly across any `.deep` section leaves a **faint
iridescent wake** that fades over ~600ms: 6 pooled positions rendered as low-opacity
blurred circles behind content. Dark sections only, so it never fights the light ground.
*Perf:* reuses the E3 blob layer's positions — no additional listener. Cut this first if
frame budget tightens.

### 6.5 Page transition

**T1 · Meniscus Wipe** — on navigate, a **liquid mass floods up from the bottom edge** with
a wavy leading meniscus, covers the viewport, holds while the new route mounts, then
**drains downward** revealing the new page. The outgoing page scales to `0.985` behind it.
During the hold, the new route's decimal index and title appear centred, arriving by Char
Cascade (E8). Total ≈1.6s.
*How:* one full-viewport div with a `--iris` fill and an SVG wavy top edge; animate
`yPercent: 100 → 0 → 100`, with the wave path alternating between two states throughout so
the meniscus never looks frozen. `pointer-events` locked; a `busy` ref prevents overlap.
On settle: `lenis.scrollTo(0, { immediate: true })` and `ScrollTrigger.refresh()` on the
next two frames. `RM`: instant swap, no overlay.

**Alternate for variety:** *Droplet Iris* — a single droplet at the click point swells to
cover the viewport, then drains to a droplet at the new page's hero. Do **not** use blades,
shutters, or a circular aperture (siblings 1 and 2).

---

## 7. Pages

14 routes. Effect codes in parentheses are mandatory placements.

### 7.1 `/` — Home · `0.1`
1. **Hero** — `.mega` headline "Metal, still moving." (E8), lede, two buttons (H1); a
   large meniscus slab (E2) with chrome sheen (E1); Viscosity bar visible (E4).
2. **Wave Ribbon** (E12) — finishes and alloys on undulating paths.
3. **Positioning statement** — 7/5 split, Dilate (E7), one iridescent phrase.
4. **Figures** — four statistics as Fluid Fill Numerals (E13) on the grid, with
   Grid Snap (E14).
5. **Drag Rail** (E9) — *the signature interaction.* Grab-and-fling catalogue rail with
   an explicit "drag" affordance label.
6. **Finish Morph** (E11) — pinned five-finish material demo. *The signature scroll.*
7. **Surface Tension Pull** (E16) at the boundary into the next section.
8. **Capability trio** on the first `.deep` section, with Pointer Wake (H8).
9. **Viscous Stepper** teaser (E15) — three of eight stages, linking to `/process`.
10. **Partners** — logos as pill chips, Segmented Slide category filter (H6).
11. **Closing CTA** — Char Cascade (E8) + primary button, on the second `.deep` section.

### 7.2 `/catalogue` — Catalogue · `0.2`
Segmented Slide category control (H6) · **Fling Grid** (E10) of slabs with Slab Warp (H2),
Droplet Bead (H4), Column Highlight (H5) · result count as a Fluid Fill numeral that
re-fills on filter change (E13) · Drag Rail of "recently added" at the foot (E9).

### 7.3 `/catalogue/:slug` — Product · `0.3`
Hero meniscus slab (E2) with sheen drift (E1) · spec block on a 5-column span, Dilate
stagger (E7) · **inline Finish Morph** for this product (E11, non-pinned variant: driven
by the swatch control instead of scroll) · dimensions diagram slab · related products
Drag Rail (E9).

### 7.4 `/finishes` — Finishes · `0.4`
Full pinned Finish Morph (E11) as the page's spine, five finishes at full detail ·
per-finish care and durability notes · **Swatch wall**: 24 pill swatches whose radii morph
on hover (H2) · comparison table with Column Highlight (H5).

### 7.5 `/process` — Process · `0.5`
Full **Viscous Stepper** (E15), eight stages · each stage: copy dilating in (E7) and a
slab with meniscus edge (E2) · two Surface Tension Pull boundaries (E16) · Wave Ribbon of
tooling terms (E12).

### 7.6 `/capabilities` — Capabilities · `0.6`
Contract-manufacture pitch · five capability blocks on asymmetric spans with Grid Snap
(E14) · MOQ and lead-time table with tabular figures · certifications as pill chips ·
tolerance figures as Fluid Fill numerals (E13) · CTA.

### 7.7 `/materials` — Materials · `0.7`
Six alloys as full-width bands, each 8/4 split, meniscus slab (E2) + properties ·
melting point, density and hardness as Fluid Fill numerals (E13) · sourcing and recycling
block on a `.deep` section with Pointer Wake (H8).

### 7.8 `/studio` — Studio · `0.8`
Founded-2004 narrative — the youngest of the four brands, and the copy should say so ·
history as a **horizontal Drag Rail of year cards** (E9) rather than a vertical timeline ·
principles on four rounded cards · team grid with Slab Warp (H2) and Droplet Bead (H4).

### 7.9 `/partners` — Partners · `0.9`
*Unique to this site.* Client roster as pill chips with Segmented Slide filtering (H6) ·
three case-study blocks, each with before/after slabs and a **draggable comparison
handle** (reuse `useDrag.js`) · testimonial trio in rounded cards that dilate in (E7).

### 7.10 `/care` — Care · `1.0`
Four material care guides as **segmented tabs** (H6) with panels dilating in (E7) ·
do/never as two rounded columns · repair service commitment · CTA.

### 7.11 `/contact` — Contact · `1.1`
Pill-input form with Fluid Label (H7) and droplet-collapse success · three locations as
rounded cards · map slab · direct email and phone in `.d1` with Elastic Underline (H3).

### 7.12 `/faq` — FAQ · `1.2`
**Inflating disclosure list:** each question is a full-width pill row; opening **inflates
the row** — it grows taller, its radius morphs, and the answer dilates inside (E7), while
a droplet bead slides from the left edge to the right (H4). Four groups, twelve questions.
Explicitly not an accordion with a rotating icon (Aeris) and not a two-pane reader (Argent).

### 7.13 `/legal` — Terms & Privacy · `1.3`
Two documents · sticky left index where the active item is marked by the **Liquid Pill**
(E6) · prose blocks dilating in (E7).

### 7.14 `*` — Not Found · `1.4`
Centred. "This one never set." A single droplet from E5 breathing in place. CTA home.

### 7.15 Navigation
Pill-shaped floating navbar, detached from the top edge by 14px, `backdrop-filter: blur(14px)`
over `--chrome` at 78% opacity, `--r-pill`. Seven links with Elastic Underline (H3) and the
Liquid Pill active indicator (E6). Right-side CTA button (H1). Hides on scroll-down past
420px, returns on scroll-up. Mobile: burger **swells into a full-screen blob** that then
squares off into the sheet; links dilate in from centre (E7).

---

## 8. Data & content

### 8.1 `src/data/site.js`

```js
export const BRAND = { name:'MERCURA', line:'Metal, Still Moving', est:'2004',
  origin:'Rajkot · India', email:'hello@mercura.example', phone:'+91 99250 71180' }
```

Brand name lives **only** here — navbar, footer wordmark, transition titles and the SEO
map all derive from it, so a rename is one line. Decimal indices come from a per-route
map in `router.jsx`.

Also export: `NAV_LINKS`, `MORE_LINKS`, `FIGURES` (4), `FINISHES` (5 — name, character,
durability, care, tone), `PROCESS_STAGES` (8), `CAPABILITIES` (5), `MATERIALS` (6 — melt,
density, hardness, character, recycled content), `PARTNERS` (12 + 3 case studies),
`TIMELINE` (6, 2004→2026), `PRINCIPLES` (4), `TEAM` (6), `TESTIMONIALS` (3), `CARE` (4),
`FAQS` (4 groups × 3), `LOCATIONS` (3), `CERTS`, `RIBBON_TERMS`.

### 8.2 `src/data/catalogue.js`
20 products across 6 categories. Each: `slug, name, category, tone, alloy, finishes[]
(subset of the 5), dims, weight, moq, lead, story (2 sentences), idx`. Six flagged
`rail: true` for the Drag Rail (E9).

### 8.3 Voice
Confident, technical, contemporary. Short sentences. Specific tolerances and numbers.
This is the youngest brand of the four (2004) and should sound it — precise and modern
rather than heritage-inflected. Where AERIS speaks as a foreman and ARGENT as a curator,
**MERCURA speaks as an engineer with taste.** Never mystical about craft; talk about
surface roughness in microns, plating thickness, repeatability.

---

## 9. Performance budget

Sibling benchmark: Export 1 ships **~141 kB gzipped, 72 modules, sub-1.1s build.**
Match or beat it.

| Metric | Target |
|---|---|
| JS gzipped (all chunks) | ≤ 145 kB *(Draggable adds ~8 kB — budgeted)* |
| CSS gzipped | ≤ 13 kB |
| Image payload | **0 bytes** |
| LCP (4× CPU throttle) | < 1.8s |
| Frame rate | 60fps sustained; no frame > 20ms during pinned scroll or drag |
| Long tasks post-hydration | none > 120ms |

**This project's specific risks are the SVG goo filter and per-frame path rebuilds.**
1. The E3 goo filter applies to a **fixed layer no larger than 320×320** — never the
   viewport, never a section.
2. Path rebuilds (E2, E13, E16, T1) run at most **one per rAF, in one place**. Batch all
   path math into a single ticker callback; never one `requestAnimationFrame` per element.
3. Cap **4 concurrent meniscus slabs** per viewport. Slabs outside the viewport must have
   their edge animation killed via `ScrollTrigger` `onToggle`.
4. E16 (Surface Tension) only computes while the pointer is within 140px of the boundary.
   Two placements per page maximum.
5. `backdrop-filter` appears on **exactly one element** — the floating navbar.
6. One shared pointer rAF in `usePointer.js`, `{ passive: true }`. E1, E3, H2, H5 and H8
   all read from it. Never add a second `mousemove` listener.
7. E1's cursor-driven sheen writes **one CSS custom property on `:root` per frame**, not
   per-element styles.
8. Every pinned sequence wrapped in `gsap.matchMedia('(min-width: 900px) and
   (prefers-reduced-motion: no-preference)')` with a static fallback.
9. `invalidateOnRefresh: true` on any trigger with a computed `end`.
10. Lenis synced to `gsap.ticker`, `lagSmoothing(0)`. `ScrollTrigger.refresh()` after
    fonts settle (~300ms) and after every route change.
11. Draggable and ScrollTrigger must write to the **same** `x` value for E9 — never run
    two competing tweens on one transform.
12. H8 (Pointer Wake) is expendable. Cut it at the first sign of jank, then E16.

---

## 10. Accessibility

- Skip link to `#main`.
- `splitChars()` sets `aria-label` on the parent and `aria-hidden` on every generated
  span — critical here, since character splitting is used on all large headlines.
- **Drag interactions (E9, E10, and the comparison handle) must have keyboard and button
  equivalents**: visible prev/next buttons on every rail, `role="region"` with
  `aria-roledescription="carousel"`, arrow-key support when focused. A drag-only control
  is an accessibility failure.
- FAQ inflating rows are real `<button>`s with `aria-expanded` / `aria-controls`; panels
  are `role="region"`.
- Contrast: `--graphite` on `--chrome` is ~12:1. **The `--iris` gradient must never carry
  small text** — use `--tint-deep` for any text that needs to read as accent-coloured, and
  verify 4.5:1. On `--iris` fills (button hover) the label must be `--white` and tested
  against the gradient's *lightest* stop.
- Visible `:focus-visible` — 2px `--tint` ring, offset 3px, `--r-pill`. Never removed.
- Every effect has an `RM` branch. Under reduced motion: no goo cursor, no meniscus
  animation, no sheen drift, no squash-and-stretch, rails become scroll-snap, all pins
  become static stacks. The site remains complete and legible.
- Forms: real `<label for>`, correct `type`, `autocomplete`, inline error state.
- Respect `hover: none` — every hover-only affordance (H4, H5, H8, E16) must have a
  non-hover resting state that is fully informative.

---

## 11. Build order

1. Scaffold, `package.json`, `vite.config.js`, `vercel.json`, `.nvmrc`, fonts, `tokens.css`.
2. `lib/` — `gsap.js` (+ Draggable, CustomEase), `useLenis.js`, `usePointer.js`,
   `useDrag.js`, `router.jsx` with the Meniscus Wipe (T1).
3. **Prove the two hardest primitives first:** the goo filter + Blobber (E3) and the
   meniscus path system (E2). Everything else is calibrated against their frame cost.
   If either cannot hold 60fps, simplify *now*, not after ten pages exist.
4. Chrome — `Viscosity` (E4), `Preloader` (E5), `Navbar` + `Liquid Pill` (E6, H1, H3).
5. Primitives — `Reveal` (E7, E8, E14), `Button` (H1), `Slab` (E1, E2, H2, H4),
   `Counter` (E13), `Toggle` (H6), `Field` (H7).
6. Data files — all of `site.js` and `catalogue.js` before any page work.
7. **Home**, in §7.1 order. Land E9 (Drag Rail) and E11 (Finish Morph) here first —
   they are the signature moments and the hardest.
8. `DragRail` reuse → `/catalogue` (+ E10 Fling Grid), `/catalogue/:slug`.
9. `/finishes` (full E11), `/process` (full E15).
10. Remaining pages in §7 order.
11. SEO map (title + meta description per route), `ErrorBoundary`, 404.
12. Performance pass against §9 — profile drag and pinned scroll specifically. Then the
    accessibility pass against §10, with keyboard-only testing of every rail.
13. `README.md` documenting the concept, all 14 routes and the full named effect list.

Run `npm run build` after each milestone — cheapest way to catch a syntax error. Do not
open a browser to verify mid-build; the client reviews manually at the end.

---

## 12. Acceptance checklist

- [ ] All 14 routes render, deep-link, and handle back/forward.
- [ ] Every effect **E1–E17**, **H1–H8** and **T1** implemented and placed per §7.
- [ ] Nothing on the §2.2 banned list appears anywhere, including the FILIGRANA reserve.
- [ ] Cool-light chrome ground, iridescent accent used **only in motion**, hard 12-column
      flush-left grid, **fully rounded corners on every surface**, zero monospace.
- [ ] Section device is a bare decimal (`0.4`) everywhere — no prefixes, no numerals.
- [ ] The drag interaction (E9) is genuinely physical: momentum, rubber-band, velocity skew.
- [ ] Every drag control has visible buttons and keyboard support.
- [ ] `prefers-reduced-motion` yields a complete, static, legible site.
- [ ] Keyboard-only: full navigation, all rails operable, focus always visible.
- [ ] `--iris` never carries small text; all accent text passes 4.5:1.
- [ ] `vercel.json` present; a deep link served from `dist` does not 404.
- [ ] Zero image or video files in the repo.
- [ ] Brand name changeable from one line in `site.js`.
- [ ] Meets or beats the §9 budget; drag and pinned scroll profiled at 60fps.
- [ ] `npm run build` clean.
- [ ] Placed beside Exports 1, 2 and 4, no viewer would guess one team built them all.

---

## 13. Enhancement layer — the cinematic pass (v2, mandatory)

### 13.1 Composition & alignment
- **Radius scale**: corner radii quantised to the four tokens only; a documented
  radius-per-component table (slabs `--r-lg`, cards `--r-md`, chips/buttons
  `--r-pill`) — audit for strays. Grid snap on all 12 columns with the three
  sanctioned asymmetric spans (7/5, 8/4, 5/7) and no others.
- **Iridescence restraint law**: `--iris` may be *visible* in at most two places per
  viewport (indicator + one interaction) — scarcity keeps it precious.

### 13.2 Colour grade
Add: `--chrome-4: #c8d0d9` (pressed/active state tone) · `--depth: #0e1220` (deepest
band inside `.deep` sections) · a specular white token `rgba(255,255,255,.85)` as the
single source for all highlight lines.

### 13.3 Scene direction — the Overture
Viscosity bar fills to 0-point → the Blobber cursor "drips in" (drops from the top to
the pointer's position, one bounce) → hero Char Cascade → the hero slab's meniscus
edge starts breathing → CTAs dilate in. Liquid enters the room before content does.

### 13.4 New effects & micro
- **E18 · Evaporate Exit** *(the exit language)* — sections exiting shrink 2% and
  drift 8px upward while fading, radius morphing toward round — content evaporating
  off the chrome. Both directions via shared triggers.
- **E19 · Ripple Waypoint** *(scroll)* — each section entry emits one expanding
  stroked ring from its title's baseline (a single pooled element) — a drop landing.
- **E20 · Idle Wobble** *(idle life)* — idle >5s: on-screen meniscus edges double
  amplitude for one cycle; the viscosity bar's readout blinks its decimal. Paused
  hidden/`RM`.
- **H9 · Bead Run** — hovering a Drag Rail's edge sends the nearest slab's Droplet
  Bead (H4) one lap immediately — the rail acknowledging touch before drag.

### 13.5 Performance & acceptance additions
`content-visibility: auto` below fold; preload Archivo Expanded woff2; **LCP = hero
`.mega` headline**; ripple ring pooled; exits reuse entry triggers; idle wobble
respects the 4-concurrent-meniscus cap.
- [ ] Radius/iridescence audits pass; E18–E20, H9 implemented both directions;
      v2 neutral under `RM`; drag still 60fps after v2.
