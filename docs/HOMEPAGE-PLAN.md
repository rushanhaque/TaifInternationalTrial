# TAIF INTERNATIONAL — Homepage, Mark II

*A plan to take the homepage from "very good template" to "this cost a million dollars."*

---

## 1. The honest diagnosis

The current homepage is well-built. Warm palette, real motion, no stock-photo clichés. But it reads as **a stack of good sections** rather than **one designed experience**, and that gap is exactly the gap between $30k and $1M.

Five specific problems:

| # | Problem | Why it costs you the sale |
|---|---|---|
| 1 | **No single unforgettable moment.** Nothing on the page is something the client has never seen before. | Million-dollar sites are remembered for *one thing*. We don't have that thing yet. |
| 2 | **No spatial continuity.** Every section is a full-width band stacked on the last. Scrolling feels like paging, not travelling. | Premium sites feel like one continuous space. Ours resets at every boundary. |
| 3 | **The product is never actually shown.** This is a *handicraft manufacturer* — the entire value is in surface, hammer marks, the flush inlay line. We show gradient rectangles and a random photo. | A buyer's first question is "what does the work look like?" We never answer it. |
| 4 | **Zero proof.** `FIGURES`, `CASES`, `TESTIMONIALS` all exist in the data and **none of them are on the homepage.** The `Counter` component is written and unused. | Export buyers buy on evidence: volumes, defect rates, named clients. We're withholding our best material. |
| 5 | **Craft is claimed, not felt.** We *say* "hand-hammered." The interface never lets you feel a hammer, a grain, a weight. | The medium should argue the message. Right now the copy carries it alone. |

**The brand line — "Where Metal Meets Grain" — is the best asset we have and we use it once, in the hero.** The plan below makes it the organizing idea of the entire page.

---

## 2. The big idea: **THE SEAM**

> Two materials. One object. The joint is the product.

A **continuous vertical brass seam runs down the entire homepage**, from the hero to the footer. It is always on screen. It never breaks.

It is not decoration — it is the page's spine, and it *does work*:

- It **threads** between sections instead of letting them butt against each other
- It **widens** into a full divider at chapter breaks, **narrows** to a hairline through dense content
- It **drifts** left and right as you scroll — metal territory on one side, grain on the other — so the page literally is the joint
- It **branches** to underline a heading, then rejoins
- It **carries the scroll progress** — a molten bead travels down it, so it doubles as the progress indicator
- On the closing CTA it **pools** into the button

This single device fixes problem #2 (continuity) and #5 (craft felt, not claimed) at once, and it is *unmistakably this brand* — no other company could use it.

**Technical:** one `position: fixed` SVG layer, full viewport height, `z-index` below content and above backgrounds. A single `<path>` whose `d` is rebuilt on scroll from a spline of control points, one per section. GPU-cheap (one path, one attribute write per frame, no layout). Degrades to a static 1px rule under `prefers-reduced-motion`.

---

## 3. The signature moment: **THE TURN**

The one thing they'll remember and describe to other people.

**A hammered brass bowl rotates a full 360° under raking light, scrubbed by your scroll**, pinned centre-stage, while the light rakes across its surface and every hammer facet catches and releases in turn. As it turns, callout lines fly out to annotate what you're looking at:

- *"~10,000 strikes. Each one placed."*
- *"Work-hardened to 140 HV at the strike face."*
- *"Ø 280 mm · 0.86 kg · IS 319 brass"*

Then the bowl **dissolves into its wooden counterpart** and the annotations change to grain, moisture, seasoning.

This answers problem #3 directly: it *is* the product, shown the way a craftsperson would show it — by turning it in the light.

**Three implementation options, in order of quality:**

| Option | Approach | Cost | Quality |
|---|---|---|---|
| **A** | 36–48 frame image sequence (real photography or a 3D render), canvas-drawn, scrub-scrubbed | Needs assets from client or one render | ★★★★★ |
| **B** | Three.js / R3F with a lit GLB model + HDRI environment | +~150 KB, real 3D, cursor-draggable too | ★★★★★ |
| **C** | **CSS-only fallback**: layered conic/radial gradient "facets" on a circle, counter-rotating with a moving specular sweep | Zero assets, zero deps, ships today | ★★★☆☆ |

**Recommendation: build C now so the page is complete and impressive with zero dependencies, structured so A drops in the moment the client provides photography.** The component takes a `frames` prop; absent it, it renders the CSS turntable. This is the only honest way to ship something great before the assets exist.

---

## 4. The new homepage architecture

Existing sections stay. Nothing is removed. Seven new movements are added and the order is re-cut into a narrative arc:

```
  ACT I — WHO                      ACT II — WHAT                 ACT III — PROOF
┌──────────────────┐            ┌──────────────────┐           ┌──────────────────┐
│ 01 Hero          │            │ 04 THE TURN  ★   │           │ 08 Measured  ★   │
│ 02 THE OPENING ★ │            │ 05 Collections   │           │ 09 Proof     ★   │
│ 03 TWO FLOORS ★  │            │ 06 Catalogue rail│           │ 10 Partners      │
│                  │            │ 07 SAMPLER   ★   │           │ 11 Process       │
└──────────────────┘            └──────────────────┘           │ 12 THE LEDGER ★  │
                                                                │ 13 Closing CTA   │
                                                                └──────────────────┘
                          ★ = new     THE SEAM runs through all of it
```

### Section by section

**01 · Hero — upgraded, not replaced**
Keep the shear. Add:
- **Molten cursor light** — a soft radial heat follows the pointer across the wordmark, brightening the brass specular where it passes, as if a light were being moved over metal. Pure CSS `radial-gradient` mask, position driven by one `quickTo`.
- **Ember drift** — 12–18 slow ember motes rising in the background, parallaxed. Pooled DOM nodes, `transform` only.
- **Weight on entry** — letters land with a real settle (`elastic.out` with tight damping), not a fade. Feels struck, not printed.
- **Scroll-cooling** — as you scroll away, the photograph's warmth drains (a CSS `saturate`/`sepia` scrub) as the brass "cools." Ties the hero to the section below.

**02 · THE OPENING ★ new**
The seam's first act. A single sentence, set enormous, that the seam physically writes:

> *Two materials. One object. **The joint is the product.***

Type is masked to the seam's path — the words appear *behind* the brass line as it draws down the screen. Full-bleed, near-empty, huge negative space. This is the breath after the hero and the moment the seam introduces itself.

**03 · TWO FLOORS ★ new — the interactive centrepiece**
A full-viewport split. **Left: the metal floor, Moradabad. Right: the wood floor, Saharanpur.** Two photographs, two palettes, two sound-worlds implied.

The seam is the divider — and it is **draggable**. Pull it left and the wood floor takes the screen; pull right and metal takes over. Each side's content (headline, stat, caption) responds live to the split ratio. Release and it settles back to centre with an elastic wobble.

- Metal side: *"11 processes. Casting, spinning, raising, chasing, repoussé."*
- Wood side: *"8–10% moisture, held before a single cut."*
- Centre, on the seam itself: *"340 artisans. Two floors. One object."*

Uses `TIMELINE`/`CAPABILITIES` copy already written. On touch it becomes a swipe; on reduced-motion, a static 50/50 with both sides visible.

**04 · THE TURN ★ new** — as described in §3.

**05 · Collections** — keep the pinned `FinishMorph`. Upgrades:
- Add a **thickness/edge profile line** that redraws per collection
- The collection name sets in a **masked line-rise** rather than a fade
- The meniscus blob gets a **specular sweep** synced to the rotation we just fixed

**06 · Catalogue rail** — keep `DragRail`. Upgrades:
- **Velocity skew**: cards lean into the drag direction and spring back (classic high-end rail feel)
- **Cursor becomes "DRAG"** over the rail — a text cursor state
- Cards **lift and cast** on hover with a real warm shadow, and the photo pushes in

**07 · THE SAMPLER ★ new — the second interaction**
A single hero object rendered large, with five finish swatches beneath it: *hammered · antique · burnished · natural · inlay*. Hovering a swatch **morphs the object's surface live** — the gradient, the sheen angle, the edge amplitude, the caption, the care line, all cross-fading.

We already have every finish's `character`, `durability` and `care` written in `FINISHES`. This turns a data table into a toy, and toys are what people remember.

**08 · MEASURED ★ new — uses the unused `Counter`**
A wide band of four numbers that **roll up like an odometer** as they enter: **340 artisans · 8–10% MC · 42 countries · 99.1% on-time.**

Each number is set in the display face at ~7rem, tabular, with the unit in small caps beneath and a hairline brass rule between. The seam widens here to carry the band. Digits roll with a physical stagger (each column arrives slightly after the last), not a linear count.

**09 · PROOF ★ new — testimonials + cases, currently unused**
Two-part movement:
- **The quote stage** — one testimonial at a time, huge, in walnut italic, with the attribution small beneath. Quotes swap on scroll with a masked line-rise. Three quotes already written.
- **The case ribbon** — three case studies as wide cards. Each is a *stat first* ("2,800 sets · 16 weeks"), brief on hover, result on click. Content already written in `CASES`.

**10 · Partners** — keep the filter. Upgrade: chips get a **magnetic hover** (they lean toward the cursor) and the wall **re-flows with FLIP animation** when the filter changes, instead of hard-swapping.

**11 · Process** — keep the `Stepper`. Upgrade: the stage numbers become **stations on the seam** — the seam passes through each one, and the molten bead pauses at each station as you scroll past it. Turns a list into a journey.

**12 · THE LEDGER ★ new — the credibility close**
Before the CTA, a quiet, dense, almost-boring block that is exactly what a serious export buyer wants: **HS codes, incoterms, ports, lead times, MOQ ranges, certifications, packing spec.** Set like a shipping manifest — monospace-ish, tabular, hairline-ruled.

This is a deliberate *tonal drop*. After all the motion, one section that says "we are a real factory and here are the numbers." The contrast is what makes it land, and it is genuinely the section that converts a buyer.

**13 · Closing CTA** — keep. Upgrade: the seam **pools into the button**, which fills with molten brass on hover (already have the fill; make it pour from the seam).

---

## 5. New components to build

| Component | What it does | Deps | Risk |
|---|---|---|---|
| `Seam.jsx` | The page spine. Fixed SVG path, scroll-driven, carries the progress bead | none | med |
| `TheTurn.jsx` | Scrubbed 360° product rotation + flying annotations | none (canvas if frames supplied) | med |
| `TwoFloors.jsx` | Draggable metal/wood split | none | med |
| `Sampler.jsx` | Live finish-morphing hero object | none | low |
| `Measured.jsx` | Odometer figure band (wraps existing `Counter`) | none | low |
| `QuoteStage.jsx` | Scroll-swapped testimonial stage | none | low |
| `CaseRibbon.jsx` | Three expanding case cards | none | low |
| `Ledger.jsx` | Shipping-manifest credibility block | none | low |
| `LineRise.jsx` | Masked line-by-line text reveal — used everywhere | none | low |
| `Magnetic.jsx` | Wrapper: any child leans toward the cursor | none | low |
| `CursorLabel.jsx` | Cursor gains a contextual word (DRAG / TURN / PULL) | none | low |
| `EmberField.jsx` | Pooled ember motes for the hero | none | low |

**Total new JS: ~18–22 KB gzipped. No new dependencies.** Everything is GSAP + CSS, which we already ship.

---

## 5b. Mark II additions — beyond the original plan

Added during the build. Each one earns its place by fixing a specific gap the first plan left open.

### `ChapterRail.jsx` — the authored spine
A delicate fixed index at the right edge: one hairline tick per section, the active one elongating into brass. At rest it reads as a **row of marks, not a menu**; hovering reveals every name with a stagger; clicking scrolls there through Lenis.

*Why it earns its place:* the homepage is about to become very long. Without a wayfinder, length reads as sprawl. With one, length reads as **authorship** — the same reason a good book has chapter headings. Hidden below 1100px (the only component permitted to hide on mobile, because it is pure navigation chrome that duplicates the nav).

### `LightLeak.jsx` — the boundary bloom
A soft warm bloom placed wherever a light section meets the dark espresso surface, so the join reads as **light spilling** rather than a hard cut. Pure CSS, no JS.

*Why:* every hard section boundary is a "template" tell. Softening the three light/dark transitions on the page is the cheapest possible upgrade in perceived production value.

### `data-cursor` labelling system
Any element can now declare `data-cursor="DRAG"` (or `TURN` / `PULL` / `VIEW`) and the cursor grows a small brass pill carrying that word. Used on the drag rail, the turntable and the two-floors divider.

*Why:* it teaches the interactions without a single line of instructional copy — the interface explains itself.

### Odometer numerals
`Measured` doesn't count up — each **numeral column rolls behind its own mask** with a left-to-right stagger, like a mechanical counter settling. Non-digits (`–`, `.`, `%`) fade instead of rolling, which is what makes it read mechanical rather than digital.

### Auto-advance with intent-detection
`Sampler` gently cycles finishes while it is in view **only until the user touches it**, then stops permanently. A demo that keeps moving after you take control is a demo that fights you.

### The `frames` upgrade path
`TheTurn` ships a pure-CSS turntable today and accepts a `frames` array. The moment real photography exists, passing that prop switches it to a canvas image sequence with the identical scroll scrub — **no redesign, no rewrite**. This is how we ship the signature moment before the assets exist without painting ourselves into a corner.

---

## 6. Craft upgrades across the whole page

These are the details that separate tiers, applied globally:

**Typography**
- Introduce a **third size tier** — a true display face at `clamp(5rem, 14vw, 13rem)` for the Opening and Measured. Right now the jump from `.mega` to body is too abrupt.
- **Optical alignment**: hanging punctuation, negative letter-spacing that scales with size (already partly there), and a proper `text-wrap: balance` on every heading.
- Every heading gets **masked line-rise** as its default entrance. One reveal, used consistently, reads as a system. Many different reveals read as a template.

**Light & material**
- A single **fixed light source** for the whole page: every shadow points the same way, every specular sweep rakes the same angle. Currently sheens run at inconsistent angles — this is the most visible "template" tell.
- **Warm shadow ramp** (3 tiers: rest / lifted / floating), all in walnut, never grey.
- **Light leak** at section boundaries — a barely-visible warm bloom where a dark section meets a light one.

**Motion discipline**
- **One easing per intent**, documented: `enter` (atelys), `exit` (power2.in), `settle` (elastic), `scrub` (none). Currently we use 6+ curves without a rule.
- **Stagger scale**: 0.02 for chars, 0.06 for lines, 0.1 for cards. Consistent rhythm across the page.
- **Nothing animates on load below the fold.** Everything is scroll-triggered, once, and clears its props.

**Cursor**
- Contextual labels (DRAG on the rail, TURN on the turntable, PULL on the split)
- Magnetic attraction on all primary CTAs
- Keep the current minimal arrow as the base state

---

## 7. Build order

Sequenced so the page is shippable and impressive at the end of every phase.

| Phase | Contents | Effort | Payoff |
|---|---|---|---|
| **1 — Spine** | `Seam` + `LineRise` + light/shadow/easing systems | ~1 session | Immediate: the page stops feeling like bands |
| **2 — Proof** | `Measured`, `QuoteStage`, `CaseRibbon`, `Ledger` | ~1 session | Biggest *commercial* gain; uses data already written |
| **3 — Signature** | `TheTurn` (CSS version), `Sampler` | ~1–2 sessions | The memorable moment |
| **4 — Interaction** | `TwoFloors`, `Magnetic`, `CursorLabel`, rail velocity-skew | ~1 session | The "how did they do that" layer |
| **5 — Hero** | Molten cursor light, embers, weighted entry, scroll-cool | ~1 session | Polish on the first impression |
| **6 — Pass** | Mobile parity, reduced-motion, perf audit, a11y audit | ~1 session | Ship quality |

**Phase 2 first if the priority is closing the client**; Phase 1 first if the priority is the visual leap. My recommendation: **1 → 2 → 3**, because the seam makes everything after it look intentional.

---

## 8. Guardrails

Non-negotiables I'll hold myself to, because a heavy site is not a premium site:

- **Performance budget**: ≤ 200 KB JS gzipped total (currently 137 KB, leaves 60 KB headroom — the plan needs ~20 KB). 60fps scroll on a mid-tier laptop. No layout-triggering animation, ever — `transform`/`opacity`/`clip-path` only.
- **No new dependencies** unless we choose Three.js for The Turn, and that's an explicit decision, not a default.
- **Mobile is not a fallback** — every effect gets a designed mobile counterpart (split becomes swipe, turn becomes drag, seam narrows and straightens).
- **`prefers-reduced-motion` is complete** — the page must be beautiful and fully legible with zero motion. Every pin releases, every reveal becomes static.
- **Nothing fails closed.** Every entrance animation must leave content visible if its trigger never fires. (I've been bitten by this exact class of bug three times on this build — it goes in the plan as a rule.)
- **Accessibility**: real heading order, the seam is `aria-hidden`, drag interactions have keyboard equivalents, contrast holds at AA for all body text.

---

## 9. What I need from you

Three decisions, and one asset question:

1. **The Turn** — ship the CSS version now, or wait for photography / commission a render? *(My recommendation: build CSS now, structure for frames later.)*
2. **Photography** — is real product/workshop photography coming? The current Picsum placeholders are the single biggest thing holding the design back. Even 6–8 real images would transform the page.
3. **Scope** — all six phases, or stop after 3?
4. **The Ledger's numbers** — HS codes, incoterms, MOQs, ports and lead times need to be *real* before launch. Everything else on the page can ship with placeholder copy; this section cannot, because it's the one a buyer will act on.

---

*Plan prepared for the Mark II homepage build. Nothing in the current build is removed by this plan — every existing section is either kept as-is or upgraded in place.*
