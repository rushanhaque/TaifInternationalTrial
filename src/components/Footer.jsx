import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, reduced } from '../lib/gsap'
import { Link } from '../lib/router'
import { scrollTop } from '../lib/useLenis'
import { BRAND, NAV_LINKS, MORE_LINKS } from '../data/site'

/* E17 — giant stencil wordmark spread edge-to-edge along the footer. The
   letters forge in on scroll: rising from below with alternating tilt in a
   stagger from the centre. At rest the letters read as thin brass outlines;
   hovering a letter fills it with polished brass. */
export default function Footer() {
  const root = useRef(null)
  const mark = useRef(null)
  const rule = useRef(null)

  useEffect(() => {
    if (reduced()) return
    const letters = mark.current.querySelectorAll('.mark-ch')
    const fw = gsap.fromTo(letters,
      { yPercent: 75, opacity: 0, rotate: (i) => (i % 2 ? 9 : -9) },
      {
        yPercent: 0, opacity: 1, rotate: 0,
        ease: 'none',
        stagger: { each: 0.05, from: 'center' },
        scrollTrigger: { trigger: mark.current, start: 'top 100%', end: 'top 55%', scrub: 0.6 },
      })
    const tw = gsap.fromTo(rule.current,
      { height: 3, scaleX: 0.15 },
      {
        height: 8, scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'top 25%', scrub: 0.6 },
      })
    return () => {
      fw.scrollTrigger?.kill(); fw.kill()
      tw.scrollTrigger?.kill(); tw.kill()
    }
  }, [])

  return (
    <footer className="footer" ref={root}>
      <div className="wrap">
        <hr className="foot-rule" ref={rule} />
        <div className="foot-grid">
          <div className="foot-brand-cell">
            <div className="hallmark" aria-hidden="true">
              <svg viewBox="0 0 108 108">
                <defs>
                  <path id="hm-ring" d="M54,54 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0" />
                </defs>
                <text><textPath href="#hm-ring">EST. 1998 · MORADABAD · METAL &amp; WOOD ·&#160;</textPath></text>
              </svg>
              <span className="hallmark-core"><span>T</span></span>
            </div>
            <p className="d3">{BRAND.line}</p>
            <p className="body" style={{ marginTop: '.6rem', color: 'var(--graphite-2)' }}>
              {BRAND.descriptor}. Est. {BRAND.est}, {BRAND.origin}.
            </p>
          </div>
          <nav aria-label="Explore">
            <h3 className="meta">Explore</h3>
            {NAV_LINKS.map((l) => (
              <div key={l.to}><Link to={l.to}>{l.label}</Link></div>
            ))}
          </nav>
          <nav aria-label="More">
            <h3 className="meta">More</h3>
            {MORE_LINKS.map((l) => (
              <div key={l.to}><Link to={l.to}>{l.label}</Link></div>
            ))}
          </nav>
          <div>
            <h3 className="meta">Contact</h3>
            <div><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></div>
            <div><a href={`tel:${BRAND.phone.replace(/\s/g, '')}`}>{BRAND.phone}</a></div>
            <p style={{ marginTop: '.6rem', color: 'var(--dim)', fontSize: '.9rem' }}>
              Mon–Sat, 09:00–18:00 IST
            </p>
          </div>
        </div>

        <div className="mark-stencil" ref={mark} role="img" aria-label={BRAND.mark}>
          {BRAND.mark.split('').map((ch, i) => (
            <span key={i} className="mark-ch" data-ch={ch} aria-hidden="true">
              <span className="mark-ch-fill">{ch}</span>
              <span className="mark-ch-stroke" aria-hidden="true">{ch}</span>
              <span className="mark-ch-rule" aria-hidden="true" />
            </span>
          ))}
        </div>

        {/* export credentials — the trade facts a buyer checks first */}
        <div className="foot-trade meta" aria-label="Export credentials">
          <span>42 export markets</span>
          <span>FOB Nhava Sheva · Mundra</span>
          <span>HS 7419 · 4420 · 9403</span>
          <span>SEDEX · BSCI audited</span>
          <span>EPCH member</span>
        </div>

        <div className="foot-meta">
          <span className="meta">© 2026 {BRAND.name} · {BRAND.origin} · All rights reserved</span>
          <button className="to-top" onClick={() => scrollTop(false)}>Colophon ↑</button>
        </div>
      </div>
    </footer>
  )
}
