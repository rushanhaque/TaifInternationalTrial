import { useEffect, useRef, useState } from 'react'
import { gsap, reduced, splitChars } from '../lib/gsap'
import { FINISHES } from '../data/site'
import Slab from './Slab'
import Toggle from './Toggle'
import { Link } from '../lib/router'

/* E11 Finish Morph — one object, five finishes. In scroll mode the section
   pins and the slab cross-dissolves through the finishes while its meniscus
   edge re-shapes; the finish name arrives by Char Cascade (E8) and a row of
   pill swatches fills progressively. Manual mode is driven by the swatch
   control instead of scroll (product pages).
   Fallback (<900px or reduced motion): a static five-up grid. */

/* [amplitude, speed] of the slab's meniscus edge, per finish — the boundary
   still visibly breathes on every finish but calms progressively as the
   sequence runs from struck metal down to a flush inlay. */
function FmCell({ href, children }) {
  return href
    ? <Link className="fm-cell fm-cell-link" to={href}>{children}</Link>
    : <div className="fm-cell">{children}</div>
}

const EDGES = {
  hammered: [0.028, 0.95],
  antique: [0.025, 0.78],
  burnished: [0.023, 0.66],
  natural: [0.021, 0.55],
  inlay: [0.019, 0.46],
}

export default function FinishMorph({
  mode = 'scroll', finishes = FINISHES, detail = false, label = 'FINISH DEMO',
  /* hrefFor(item) -> url. When supplied, the name and the slab both become
     links into that item's own page. The homepage passes this so clicking a
     collection actually opens it; the product page omits it, because there
     the finishes are a control, not navigation. */
  hrefFor = null,
}) {
  const root = useRef(null)
  const slabRef = useRef(null)

  /* ---------- manual mode (product page) ---------- */
  const [active, setActive] = useState(0)
  const manualFirst = useRef(true)
  const activePhase = useRef(0)

  useEffect(() => {
    if (mode !== 'manual') return
    const layers = root.current.querySelectorAll('[data-l]')
    const names = root.current.querySelectorAll('[data-n]')
    const copies = root.current.querySelectorAll('[data-c]')
    if (manualFirst.current) {
      manualFirst.current = false
      layers.forEach((l, i) => gsap.set(l, { opacity: i === active ? 1 : 0 }))
      names.forEach((n, i) => gsap.set(n, { opacity: i === active ? 1 : 0 }))
      copies.forEach((c, i) => gsap.set(c, { opacity: i === active ? 1 : 0 }))
      return
    }
    layers.forEach((l, i) => gsap.to(l, { opacity: i === active ? 1 : 0, duration: 0.5 }))
    copies.forEach((c, i) => gsap.to(c, { opacity: i === active ? 1 : 0, duration: 0.35 }))
    names.forEach((n, i) => {
      if (i === active) {
        gsap.set(n, { opacity: 1 })
        if (!reduced()) {
          const chars = splitChars(n)
          gsap.from(chars, {
            y: 14, scaleY: 1.5, opacity: 0, transformOrigin: '50% 100%',
            stagger: { each: 0.014, from: 'center' }, duration: 0.45, ease: 'surge',
          })
        }
      } else gsap.set(n, { opacity: 0 })
    })
    const e = EDGES[finishes[active].key] || [0.012, 0.55]
    slabRef.current?.setEdge(e[0], e[1])
    /* one animated phase sweep per swatch tap — advances the shape by ~1
       rotation over 700ms, then holds. */
    if (slabRef.current?.setPhase) {
      const p = { v: (activePhase.current || 0) }
      const target = p.v + Math.PI * 2 * 1.2
      gsap.to(p, {
        v: target, duration: 0.7, ease: 'power2.inOut',
        onUpdate() { slabRef.current?.setPhase(p.v) },
        onComplete() { activePhase.current = target },
      })
    }
  }, [active, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- scroll mode (home, finishes) ---------- */
  useEffect(() => {
    if (mode !== 'scroll') return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const q = (s) => Array.from(root.current.querySelectorAll(s))
      const layers = q('[data-l]')
      const names = q('[data-n]')
      const copies = q('[data-c]')
      const sws = q('[data-s]')
      const n = finishes.length
      const nameChars = names.map((el) => splitChars(el))

      layers.forEach((l, idx) => {
        gsap.set(l, {
          opacity: idx === 0 ? 1 : 0,
          display: idx === 0 ? 'block' : 'none',
          clipPath: idx === 0 ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)',
          y: 0,
        })
      })
      names.forEach((el, i) => gsap.set(el, { opacity: i === 0 ? 1 : 0 }))
      copies.forEach((el, i) => gsap.set(el, { opacity: i === 0 ? 1 : 0 }))
      sws.forEach((el, i) => gsap.set(el, { scaleX: i === 0 ? 1 : 0 }))

      /* pre-flatten edge amp/speed by finish index so we can interpolate */
      const amps = finishes.map((f) => (EDGES[f.key] || [0.012, 0.55])[0])
      const spds = finishes.map((f) => (EDGES[f.key] || [0.012, 0.55])[1])

      slabRef.current?.setEdge(amps[0], spds[0])
      slabRef.current?.setPhase(0)

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=2600',
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate(self) {
            const t = self.progress * (n - 1)
            const i = Math.min(n - 2, Math.floor(t))
            const f = t - i
            const amp = amps[i] + (amps[i + 1] - amps[i]) * f
            const spd = spds[i] + (spds[i + 1] - spds[i]) * f
            slabRef.current?.setEdge(amp, spd)
            slabRef.current?.setPhase(self.progress * (n - 1) * 9.4)
          },
        },
      })
      for (let i = 1; i < n; i++) {
        // Step 1: Outgoing image completes its exit animation completely (opacity: 0, clip out)
        tl.to(layers[i - 1], { opacity: 0, y: -24, clipPath: 'inset(0% 0 100% 0)', duration: 0.28, ease: 'power2.in' }, i - 0.28)
          // Step 2: Remove outgoing image from visibility before incoming image starts
          .set(layers[i - 1], { display: 'none' }, i)
          // Step 3: Reveal incoming image ONLY AFTER outgoing image has fully exited to opacity 0
          .set(layers[i], { display: 'block' }, i + 0.02)
          .fromTo(
            layers[i],
            { opacity: 0, y: 24, clipPath: 'inset(100% 0 0 0)' },
            { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 0.35, ease: 'power3.out' },
            i + 0.02
          )
          .to(names[i - 1], { opacity: 0, y: -12, duration: 0.2 }, i - 0.1)
          .set(names[i], { opacity: 1 }, i + 0.02)
          .fromTo(
            nameChars[i],
            { y: 14, scaleY: 1.5, opacity: 0, transformOrigin: '50% 100%' },
            { y: 0, scaleY: 1, opacity: 1, stagger: { each: 0.012, from: 'center' }, duration: 0.3, ease: 'surge' },
            i + 0.04
          )
          .to(copies[i - 1], { opacity: 0, duration: 0.2 }, i - 0.1)
          .to(copies[i], { opacity: 1, duration: 0.3 }, i + 0.04)
          .fromTo(sws[i], { scaleX: 0 }, { scaleX: 1, duration: 0.4 }, i - 0.1)
      }
      return () => { tl.scrollTrigger?.kill(); tl.kill() }
    })
    return () => mm.revert()
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  if (mode === 'manual') {
    const f = finishes[active]
    return (
      <div className="fm fm-manual" ref={root}>
        <div className="fm-slab-col">
          <Slab blob quietHover ref={slabRef} tone={finishes[0].tone} ratio="7/6" className="fm-slab">
            {finishes.map((x, i) => (
              <span key={x.key} className={`fm-layer tone-${x.tone}`} data-l aria-hidden="true" />
            ))}
            <span className="slab-tag meta">{label}</span>
          </Slab>
        </div>
        <div className="fm-info">
          <div className="fm-names">
            {finishes.map((x) => <span key={x.key} className="fm-name d2" data-n>{x.name}</span>)}
          </div>
          <div className="fm-copies">
            {finishes.map((x) => (
              <p key={x.key} className="fm-copy" data-c>
                {x.character}{detail ? ` ${x.durability}` : ''}
              </p>
            ))}
          </div>
          <Toggle
            label="Finish"
            options={finishes.map((x, i) => ({ value: i, label: x.name }))}
            value={active}
            onChange={setActive}
          />
        </div>
      </div>
    )
  }

  return (
    <div ref={root}>
      {/* pinned variant — ≥900px, motion allowed */}
      <div className="fm fm-pinned">
        <div className="fm-slab-col">
          {hrefFor && (
            /* an overlay link so the artwork is clickable without nesting
               anything inside the Slab's own markup */
            <Link
              className="fm-slab-hit"
              to={hrefFor(finishes[active] || finishes[0])}
              data-cursor="OPEN"
              aria-label={`Open ${(finishes[active] || finishes[0])?.name}`}
            />
          )}
          <Slab blob quietHover ref={slabRef} tone={finishes[0].tone} ratio="7/6" className="fm-slab">
            {finishes.map((x) => (
              <span key={x.key} className={`fm-layer tone-${x.tone}`} data-l aria-hidden="true" />
            ))}
            <span className="slab-tag meta">{label}</span>
          </Slab>
        </div>
        <div className="fm-info">
          <span className="meta fm-kicker">One object · {finishes.length} finishes</span>
          <div className="fm-names">
            {finishes.map((x) => (
              hrefFor
                ? (
                  <Link key={x.key} className="fm-name d1 fm-link" data-n data-cursor="OPEN" to={hrefFor(x)}>
                    {x.name}<i className="fm-go" aria-hidden="true">→</i>
                  </Link>
                )
                : <span key={x.key} className="fm-name d1" data-n>{x.name}</span>
            ))}
          </div>
          <div className="fm-copies">
            {finishes.map((x) => (
              <div key={x.key} className="fm-copy" data-c>
                <p className="lede">{x.character}</p>
                {detail && (
                  <>
                    <p className="body fm-detail">{x.durability}</p>
                    <p className="body fm-detail dim">{x.care}</p>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="fm-swatches" aria-hidden="true">
            {finishes.map((x) => (
              <span key={x.key} className="fm-sw">
                <i className={`fm-swi tone-${x.tone}`} data-s />
                <span className="meta">{x.name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* static fallback — mobile / reduced motion */}
      <div className="fm-fallback">
        {finishes.map((x) => (
          <FmCell key={x.key} href={hrefFor ? hrefFor(x) : null}>
            <Slab tone={x.tone} ratio="4/3" label={x.name.toUpperCase()} />
            <h3 className="d3">{x.name}</h3>
            <p className="body">{x.character}</p>
            {detail && <p className="body dim">{x.durability}</p>}
          </FmCell>
        ))}
      </div>
    </div>
  )
}
