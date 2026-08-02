# MERCURA — Post-build review findings (to apply next session)

Status at time of writing: site fully built, all 14 routes, `npm run build` clean
(83 modules, 1.05s — JS ≈131.8 kB gz of 145 budget, CSS 7.7 kB gz of 13 budget).
A 14-agent review workflow ran; **2 of 4 review dimensions completed** (performance,
spec-compliance) before the session usage limit killed the rest. The accessibility and
correctness reviews **never ran** — re-run them next session. The findings below are
from the two completed reviewers and are **unverified** (verify agents also hit the
limit) — confirm each against the code before fixing.

---

## Performance findings (reviewer 1)

1. **CRITICAL — Ribbon.jsx:32** · E12 animates SVG `textPath` layout every frame,
   forever, with no viewport gating. Three infinite tweens rewrite `startOffset` on two
   `<textPath>`s plus tween both path `d`s — glyph re-placement every frame even when
   offscreen, burning main thread during the pinned FinishMorph/DragRail sections.
   Fix: gate behind IntersectionObserver or ScrollTrigger `onToggle` pause/resume.

2. **MAJOR — DragRail.jsx:54** · Scroll linkage and momentum tween are competing
   writers on rail `x` (violates §9.11). During post-release coast, `setPos()` writes
   the transform while the live tween re-overwrites it next frame → jitter when
   scrolling while coasting. Fix: kill/retarget the active tween inside `setPos` so one
   writer owns the transform per frame.

3. **MAJOR — Tension.jsx:26** · `getBoundingClientRect()` runs every ticker frame
   (usePointer broadcasts unconditionally, even when pointer hasn't moved) → forced
   reflow every scroll frame while within the 220px IO rootMargin; two instances on
   /process. Fix: early-return unless pointer moved since last callback, or cache rect
   on refresh + offset by scroll delta. Same root cause affects Slab.jsx:101-105 hover
   warp and Deep.jsx:19 `matches(':hover')`.

4. **MAJOR — Viscosity.jsx:18** · Dirties layout every scroll frame: (a) writes
   `textContent` even when the 2-dp string is unchanged; (b) `quickTo` on `height`
   (layout property — `will-change: height` is a no-op) churns every tick even at rest.
   Fix: only write textContent on change; use `scaleY` on a 6px bar; skip quickTo when
   target unchanged.

5. **MINOR — DragRail.jsx:53** · `getBounds()` reads `clientWidth`/`scrollWidth`
   inside ScrollTrigger `onUpdate` every scroll frame, right after layout-dirtying
   writes → reflow per frame. Fix: cache bounds on mount, recompute on
   `refreshInit`/resize; `nudge()` (line 77) should reuse the cache.

6. **MINOR — Footer.jsx:31** · Scrub animates layout props: rule `height: 3→8`
   relayouts the footer grid per frame; `--tide` drives an animated `top`; and
   `.t-fill { will-change: clip-path }` (global.css:489) permanently promotes seven
   huge glyph layers. Fix: `scaleY` for the rule, `translateY` for the waterline,
   drop/scope the will-change.

7. **MINOR — Counter.jsx:35** · Path rebuilds run in 4 separate places, not the single
   batched ticker §9.2 mandates. Only E2 (Slab.jsx:34) complies. E13 rebuilds inside
   each Counter's tween onUpdate (4 concurrent on Home); E16 inside Tension's pointer
   callback; T1's wave tween (router.jsx:77-80) yoyos forever even while the overlay is
   `display:none`. Minimum fix: start/kill the router wave inside `go()`; ideally route
   Counter/Tension rebuilds through the shared ticker.

## Spec-compliance findings (reviewer 2)

1. **MAJOR — Deep.jsx:36** · E1 Chrome Sheen Drift missing on `.deep` sections — the
   sheen layer exists only inside Slab. Spec: every `.slab` **and** every `.deep`
   carries the drifting highlight + cursor-X offset. Fix: add a sheen band element or
   `.deep::before` using the same 18s keyframes + `translateX(var(--sheen-x))`.

2. **MAJOR — ContactPage.jsx:67** · Direct email/phone must be `.d1` with Elastic
   Underline (H3) per §7.11; currently `.d3 direct-link` with a color-only hover.

3. **MAJOR — Stepper.jsx:70** · Meniscus edge (E2) on only 2 of 8 stage slabs
   (`blob={i < 2}`). Stages stack vertically so the 4-per-viewport cap is safe —
   pass `blob` on every stage; off-screen culling already exists via onToggle.

4. **MAJOR — MaterialsPage.jsx:29** · Same issue: `blob={i === 0}` — 5 of 6 alloy
   bands lack the liquid edge. Give each full-width band its meniscus edge.

5. **MINOR — catalogue.js:7** · Product `idx` uses zero-padded ordinals `'01'–'20'`,
   which reads as AERIS's plate-number style. Rendered at ProductPage.jsx:35,
   Home.jsx:112, CataloguePage.jsx:52. Fix: bare decimal fractions, e.g. `'.01'–'.20'`.

6. **MINOR — Home.jsx:111** · E9 "meniscus amplitude rises while dragging" is inert:
   `setMeniscusBoost(1.8)` fires but no rail slab has `blob`, so the boost has no
   target (also CataloguePage.jsx:67, ProductPage.jsx:93). Give visible rail slabs
   `blob` (respect the 4-cap).

7. **MINOR — FinishesPage.jsx:6** · Swatch wall renders 25 swatches (5 alloys × 5
   finishes) but the copy at lines 47-48 says "Twenty-four". Drop one combination or
   fix the copy.

8. **MINOR — ContactPage.jsx:47** · Submit uses a raw `<button class="btn primary">`,
   bypassing Button.jsx — loses H1's entry-point flood seed and surge press. Use
   `<Button type="submit">`.

9. **MINOR — NotFoundPage.jsx:21** · The 404 `.d1` is the only display headline not
   arriving via Char Cascade (E8). Wrap in `<CharCascade as="h1" className="d1">`.

10. **MINOR — LegalPage.jsx:32** · Sticky-index pill moves with a single uniform tween —
    missing E6's lead/trail stretch (surge lead edge, viscous trail ~120ms later).
    Port the pattern from Navbar.jsx `movePill` / Toggle.jsx.

---

## Next-session order of work

1. Fix the critical + major performance items (Ribbon gating, DragRail single-writer,
   Tension/pointer early-return, Viscosity scaleY) — verify each claim first.
2. Fix the four major spec items (Deep sheen, Contact .d1/H3, Stepper + Materials blob).
3. Sweep the minors.
4. Re-run the two missing review dimensions: **accessibility** (§10 — keyboard rails,
   aria on split chars, RM branches) and **correctness** (routing, deep links,
   back/forward, ErrorBoundary).
5. `npm run build` after each batch; keep JS ≤145 kB gz (currently ≈131.8, headroom
   ≈13 kB).
