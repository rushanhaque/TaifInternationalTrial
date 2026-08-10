import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { PARTNERS, CASES, TESTIMONIALS } from '../data/site'
import { useContent } from '../lib/content'
import { CharCascade, Dilate } from '../components/Reveal'
import Toggle from '../components/Toggle'
import Button from '../components/Button'
import { gsap, reduced, coarse } from '../lib/gsap'
import { onPointer } from '../lib/usePointer'

const CATS = ['All', 'Hospitality', 'Retail', 'Design', 'Architecture']

/* Each case study is keyed to the material that actually shipped, and the
   middle spread is flipped onto espresso — light / dark / light, so the three
   read as a magazine rhythm rather than three identical bands. */
const CASE_KEY = {
  'Halcyon Hotels': { tone: 'brass', deep: false, note: 'Hand-hammered brass · sheesham' },
  'Atelier Kade': { tone: 'inlay', deep: true, note: 'Brass inlay · rosewood' },
  'Meridian Living': { tone: 'copper', deep: false, note: 'Burnished copper · mango wood' },
}
const CASE_FALLBACK = { tone: 'brass', deep: false, note: 'Metal · wood' }

/* '2,800 sets · 16 weeks' → [{ n:'2,800', u:'sets' }, { n:'16', u:'weeks' }] so
   the figure can be set enormous and the unit held back at meta size. */
function splitStat(stat) {
  return String(stat)
    .split('·')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((seg) => {
      const m = seg.match(/^([\d][\d.,]*%?)\s*(.*)$/)
      return m ? { n: m[1], u: m[2] } : { n: seg, u: '' }
    })
}

/* Before/after comparison — a real range input drives the reveal, so the
   handle is draggable, keyboard-operable and screen-reader friendly for free. */
function Compare({ label, tone = 'brass' }) {
  const [v, setV] = useState(50)
  return (
    <div className="prt-cmp" style={{ '--cmp': `${v}%` }}>
      <div className={`prt-cmp-pane prt-cmp-before tone-wood`}>
        <span className="meta">Reference piece</span>
      </div>
      <div className={`prt-cmp-pane prt-cmp-after tone-${tone}`}>
        <span className="meta">Taif finish</span>
      </div>
      <span className="prt-cmp-line" aria-hidden="true" />
      <input
        type="range"
        min="0"
        max="100"
        value={v}
        aria-label={`Compare finish — ${label}`}
        onInput={(e) => setV(Number(e.target.value))}
        onChange={(e) => setV(Number(e.target.value))}
      />
    </div>
  )
}

/* ── The partner wall ─────────────────────────────────────────────────────
   Chips magnetise toward the pointer off the one shared pointer pipeline
   (no second mousemove listener), and re-flow with a stagger whenever the
   category changes. Both are motion-only; the names are always readable. */
function PartnerWall({ cat, setCat, partners }) {
  const wall = useRef(null)
  const first = useRef(true)

  /* stagger re-flow on filter change */
  useLayoutEffect(() => {
    if (reduced()) return
    const el = wall.current
    if (!el) return
    const chips = el.querySelectorAll('.prt-chip')
    if (!chips.length) return
    const isFirst = first.current
    first.current = false
    const tw = gsap.fromTo(
      chips,
      { yPercent: 26, opacity: 0, scale: 0.94 },
      {
        yPercent: 0,
        opacity: 1,
        scale: 1,
        duration: 0.62,
        ease: 'surge',
        stagger: { each: 0.028, from: 'start' },
        clearProps: 'transform,opacity',
        ...(isFirst
          ? { scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
          : {}),
      }
    )
    return () => {
      tw.scrollTrigger?.kill()
      tw.kill()
      gsap.set(chips, { clearProps: 'transform,opacity' })
    }
  }, [cat])

  /* pointer magnetism — cached offsets, one shared ticker, no per-frame layout */
  useLayoutEffect(() => {
    if (reduced() || coarse()) return
    const el = wall.current
    if (!el) return
    const nodes = Array.from(el.querySelectorAll('.prt-mag'))
    if (!nodes.length) return

    const items = nodes.map((n) => ({ el: n, cx: 0, cy: 0, x: 0, y: 0 }))
    let box = null
    let stale = true

    const measure = () => {
      box = el.getBoundingClientRect()
      for (const it of items) {
        it.cx = it.el.offsetLeft + it.el.offsetWidth / 2
        it.cy = it.el.offsetTop + it.el.offsetHeight / 2
      }
      stale = false
    }
    const mark = () => { stale = true }

    measure()
    window.addEventListener('resize', mark, { passive: true })
    window.addEventListener('scroll', mark, { passive: true })

    const R = 200
    const off = onPointer((p) => {
      if (stale) measure()
      if (!box) return
      const px = p.x - box.left
      const py = p.y - box.top
      for (const it of items) {
        const dx = px - it.cx
        const dy = py - it.cy
        const d = Math.hypot(dx, dy)
        const f = d < R ? (1 - d / R) ** 2 : 0
        it.x += (dx * f * 0.32 - it.x) * 0.15
        it.y += (dy * f * 0.32 - it.y) * 0.15
        const s = it.el.style
        s.setProperty('--mx', `${it.x.toFixed(2)}px`)
        s.setProperty('--my', `${it.y.toFixed(2)}px`)
        s.setProperty('--mg', f.toFixed(3))
      }
    })

    return () => {
      off()
      window.removeEventListener('resize', mark)
      window.removeEventListener('scroll', mark)
      for (const it of items) {
        it.el.style.removeProperty('--mx')
        it.el.style.removeProperty('--my')
        it.el.style.removeProperty('--mg')
      }
    }
  }, [cat])

  return (
    <>
      <div className="prt-bar">
        <Toggle
          label="Filter partners"
          options={CATS.map((c) => ({ value: c, label: c }))}
          value={cat}
          onChange={setCat}
        />
        <p className="prt-count meta" aria-live="polite">
          <span className="prt-count-n">{String(partners.length).padStart(2, '0')}</span>
          <span className="prt-count-s">/ {PARTNERS.length} on the wall</span>
        </p>
      </div>

      <ul className="prt-wall" ref={wall}>
        {partners.map((p) => (
          <li key={p.name} className="prt-mag">
            <span className="prt-chip">
              <span className="prt-chip-punch" aria-hidden="true" />
              <span className="prt-chip-name">{p.name}</span>
              <span className="prt-chip-cat dim2">· {p.cat}</span>
              <span className="prt-chip-sweep" aria-hidden="true" />
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}

/* ── SIGNATURE: the case spread ───────────────────────────────────────────
   Full-bleed, alternating. The stat is set enormous in brass, brief and
   result face each other across a hairline spine, and a material strip
   keyed to that client bleeds off the outer edge. */
function CaseSpread({ c, i }) {
  const k = CASE_KEY[c.client] || CASE_FALLBACK
  const rev = i % 2 === 1
  const root = useRef(null)
  const stats = useMemo(() => splitStat(c.stat), [c.stat])

  useLayoutEffect(() => {
    if (reduced()) return
    const el = root.current
    if (!el) return
    const ctx = gsap.context(() => {
      const once = (t, s) => ({ trigger: t, start: s, once: true })

      gsap.from('.prt-case-head > *', {
        y: 22, opacity: 0, duration: 0.85, ease: 'fluid', stagger: 0.07,
        scrollTrigger: once(el, 'top 74%'),
      })
      gsap.from('.prt-stat-num', {
        yPercent: 114, duration: 1.05, ease: 'surge', stagger: 0.09,
        scrollTrigger: once('.prt-stat', 'top 84%'),
      })
      gsap.from('.prt-stat-rule', {
        scaleX: 0, transformOrigin: '0% 50%', duration: 0.95, ease: 'viscous', stagger: 0.09,
        scrollTrigger: once('.prt-stat', 'top 84%'),
      })
      gsap.from('.prt-col', {
        y: 28, opacity: 0, duration: 0.9, ease: 'fluid', stagger: 0.13,
        scrollTrigger: once('.prt-case-cols', 'top 86%'),
      })
      gsap.from('.prt-match', {
        y: 26, opacity: 0, duration: 0.9, ease: 'fluid',
        scrollTrigger: once('.prt-match', 'top 92%'),
      })

      /* brass bead runs the spine as the columns pass */
      const spine = el.querySelector('.prt-spine')
      if (spine) {
        gsap.fromTo('.prt-bead', { y: 0 }, {
          y: () => Math.max(0, spine.offsetHeight - 12),
          ease: 'none',
          scrollTrigger: {
            trigger: '.prt-case-cols', start: 'top 78%', end: 'bottom 62%',
            scrub: 0.5, invalidateOnRefresh: true,
          },
        })
      }

      /* the material field drifts against the page */
      gsap.fromTo('.prt-strip-i', { yPercent: -7 }, {
        yPercent: 7, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      })
      gsap.fromTo('.prt-ghost', { yPercent: 10 }, {
        yPercent: -10, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <article
      ref={root}
      className={`prt-case ${rev ? 'rev' : ''} ${k.deep ? 'deep' : ''}`}
      data-tone={k.tone}
      aria-labelledby={`prt-case-${i}`}
    >
      <span className={`prt-strip tone-${k.tone}`} aria-hidden="true">
        <span className="prt-strip-i" />
        <span className="prt-strip-sheen" />
      </span>
      <span className="prt-arcs" aria-hidden="true" />
      <span className="prt-ghost" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>

      <div className="wrap prt-case-in">
        <div className="prt-case-grid">
          <header className="prt-case-head">
            <p className="prt-case-tag">
              <span className="idx">{String(i + 1).padStart(2, '0')}</span>
              <span className="prt-case-cat meta">{c.cat}</span>
            </p>
            <h3 className="d1 prt-case-client" id={`prt-case-${i}`}>{c.client}</h3>
            <p className="prt-case-note meta">{k.note}</p>

            <div className="prt-stat">
              {stats.map((s, n) => (
                <div className="prt-stat-cell" key={n}>
                  <span className="prt-stat-rule" aria-hidden="true" />
                  <span className="prt-stat-clip">
                    <span className="prt-stat-num">{s.n}</span>
                  </span>
                  {s.u && <span className="prt-stat-unit meta">{s.u}</span>}
                </div>
              ))}
            </div>
          </header>

          <div className="prt-case-cols">
            <div className="prt-col">
              <p className="prt-col-k meta">Brief</p>
              <p className="body">{c.brief}</p>
            </div>
            <span className="prt-spine" aria-hidden="true"><i className="prt-bead" /></span>
            <div className="prt-col prt-col-result">
              <p className="prt-col-k meta">Result</p>
              <p className="body">{c.result}</p>
            </div>
          </div>
        </div>

        <div className="prt-match">
          <div className="prt-match-head">
            <span className="meta">Finish match · {c.client}</span>
            <span className="prt-match-hint meta" aria-hidden="true">drag ↔</span>
          </div>
          <Compare label={c.client} tone={k.tone} />
        </div>
      </div>
    </article>
  )
}

export default function PartnersPage() {
  const stats = useContent('stats')
  const [cat, setCat] = useState('All')
  const partners = cat === 'All' ? PARTNERS : PARTNERS.filter((p) => p.cat === cat)
  const root = useRef(null)

  /* the tally — one punch-mark per partner, grouped by sector, group widths
     proportional to the count. The hero's piece of visual invention. */
  const groups = useMemo(
    () => CATS.slice(1).map((c) => ({ cat: c, n: PARTNERS.filter((p) => p.cat === c).length })),
    []
  )

  useLayoutEffect(() => {
    if (reduced()) return
    const ctx = gsap.context(() => {
      gsap.from('.prt-tally-group', {
        yPercent: 30, opacity: 0, duration: 0.85, ease: 'surge', stagger: 0.08,
        scrollTrigger: { trigger: '.prt-tally', start: 'top 96%', once: true },
      })
      gsap.from('.prt-tally-punches i', {
        scale: 0, duration: 0.5, ease: 'surge', stagger: 0.025, delay: 0.25,
        scrollTrigger: { trigger: '.prt-tally', start: 'top 96%', once: true },
      })
      gsap.from('.prt-fig', {
        y: 16, opacity: 0, duration: 0.7, ease: 'fluid', stagger: 0.08,
        scrollTrigger: { trigger: '.prt-figs', start: 'top 94%', once: true },
      })
      gsap.from('.prt-quote', {
        y: 30, opacity: 0, duration: 0.9, ease: 'fluid', stagger: 0.12,
        scrollTrigger: { trigger: '.prt-quote-list', start: 'top 84%', once: true },
      })
      gsap.fromTo('.prt-cta-names', { xPercent: -4 }, {
        xPercent: -14, ease: 'none',
        scrollTrigger: { trigger: '.prt-cta', start: 'top bottom', end: 'bottom top', scrub: 0.7 },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root}>
      <section className="page-hero wrap prt-hero">
        <CharCascade as="h1" className="mega prt-h1">Their name on it.</CharCascade>

        <div className="prt-hero-grid">

          <div className="prt-hero-side">
            <dl className="prt-figs">
              <div className="prt-fig">
                <dt className="meta">Partners</dt>
                <dd>{PARTNERS.length}</dd>
              </div>
              <div className="prt-fig">
                <dt className="meta">Markets</dt>
                {/* was hardcoded 42, then read from a FIGURES list the homepage
                    did not actually share — so the two pages still disagreed
                    (18 there, 16 here). Both now read the admin-editable stats. */}
                <dd>{stats.find((s) => s.unit === 'countries')?.value ?? '—'}</dd>
              </div>
              <div className="prt-fig">
                <dt className="meta">Since</dt>
                <dd>1998</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="prt-tally">
          <ul className="prt-tally-groups">
            {groups.map((g) => (
              <li key={g.cat} className="prt-tally-group" style={{ '--n': g.n }}>
                <span className="prt-tally-bar" aria-hidden="true" />
                <span className="prt-tally-punches" aria-hidden="true">
                  {Array.from({ length: g.n }, (_, n) => <i key={n} />)}
                </span>
                <span className="prt-tally-foot">
                  <span className="prt-tally-label meta">{g.cat}</span>
                  <span className="prt-tally-n">{String(g.n).padStart(2, '0')}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section alt prt-wall-sec" aria-labelledby="prt-roster-h">
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.9</span><span className="meta">The roster</span></div>
          <div className="prt-head-grid">
            <h2 className="d1" id="prt-roster-h">Twelve houses.<br />Four sectors.</h2>
            <p className="body prt-head-copy">
              These are the names we are allowed to print. Most of what leaves Moradabad
              ships under a label that is not ours — that is the arrangement, and it is
              the point.
            </p>
          </div>

          <PartnerWall cat={cat} setCat={setCat} partners={partners} />
        </div>
      </section>

      <section className="prt-cases" aria-labelledby="prt-cases-h">
        <div className="wrap prt-cases-intro">
          <div className="sec-head"><span className="idx">0.9</span><span className="meta">Case studies</span></div>
          <div className="prt-head-grid">
            <h2 className="d1" id="prt-cases-h">Three jobs, with the numbers attached.</h2>
            <p className="body prt-head-copy">
              No renderings and no adjectives. What was asked for, what came back, and a
              figure the client can check against their own records.
            </p>
          </div>
        </div>

        {CASES.map((c, i) => <CaseSpread key={c.client} c={c} i={i} />)}
      </section>

      <section className="section alt prt-quotes" aria-labelledby="prt-quotes-h">
        <div className="wrap">
          <div className="sec-head"><span className="idx">0.9</span><span className="meta">In their words</span></div>
          <div className="prt-head-grid">
            <h2 className="d1" id="prt-quotes-h">Unprompted.</h2>
            <p className="body prt-head-copy">
              Three lines from three procurement desks. We have not edited them, and we
              have not chosen the flattering half.
            </p>
          </div>

          <ol className="prt-quote-list">
            {TESTIMONIALS.map((tq, i) => (
              <li className="prt-quote" key={tq.org}>
                <span className="prt-quote-n idx" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <blockquote className="prt-quote-body">
                  <span className="prt-quote-mark" aria-hidden="true">“</span>
                  <p className="d3">“{tq.quote}”</p>
                </blockquote>
                <p className="prt-quote-src meta">{tq.who} · {tq.org}</p>
                <span className="prt-quote-rule" aria-hidden="true" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section deep prt-cta" aria-labelledby="prt-cta-h">
        <span className="prt-cta-names" aria-hidden="true">
          {PARTNERS.map((p) => p.name).join('  ·  ')}
        </span>
        <div className="wrap prt-cta-in">
          <div className="prt-cta-copy">
            <p className="idx">0.9</p>
            <h2 className="d1" id="prt-cta-h">Join them.</h2>
            <p className="lede">
              Send a drawing, a photograph or a competitor sample. A priced quote returns
              within five working days, tooling included.
            </p>
          </div>
          <div className="prt-cta-act">
            <Button to="/contact">Join them</Button>
            <Button to="/catalogue" variant="ghost">See the catalogue</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
