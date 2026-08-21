import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reduced } from '../lib/gsap'
import { Link } from '../lib/router'
import { BRAND, NAV_LINKS, MORE_LINKS } from '../data/site'
import SocialLinks from './SocialLinks'

/* E17 — giant stencil wordmark spread edge-to-edge along the footer. The
   letters forge in on scroll: rising from below with alternating tilt in a
   stagger from the centre. At rest the letters read as thin brass outlines;
   hovering a letter fills it with polished brass. */
export default function Footer() {
  const root = useRef(null)
  const mark = useRef(null)
  const rule = useRef(null)
  const [showColophon, setShowColophon] = useState(false)

  useEffect(() => {
    if (reduced()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(rule.current,
        { scaleX: 0.05, height: 3, opacity: 0.3 },
        {
          scaleX: 1, height: 6, opacity: 1, ease: 'power2.out',
          scrollTrigger: {
            trigger: root.current,
            start: 'top 95%',
            end: 'top 50%',
            scrub: 0.8,
          },
        }
      )
    }, root)

    return () => ctx.revert()
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
            {/* The logo art is the short mark on its own, so INTERNATIONAL is
                set beneath it — the same lockup the navbar uses, rather than
                leaving the footer reading "TAIF". */}
            <div className="foot-lockup">
              <img
                src="/img/taif-logo-white.webp"
                alt={BRAND.name}
                width="2172"
                height="724"
                loading="lazy"
                decoding="async"
                style={{ height: '46px', width: 'auto', objectFit: 'contain', display: 'block' }}
              />
              <span className="foot-lockup-suffix">{BRAND.suffix}</span>
            </div>
            <p className="d3" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>{BRAND.line}</p>
            <p className="body" style={{ marginTop: '.6rem', color: 'rgba(255, 255, 255, 0.78)' }}>
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
          <div className="foot-contact-cell">
            {/* .foot-contact-text wraps the written-out details — the heading,
                the two full addresses, the hours. On mobile this group is
                swapped for the icon row alone: instagram / whatsapp / email
                already ARE phone and mail, just as taps rather than reading
                matter, so nothing is lost, only compacted. Desktop keeps the
                full text; the class carries no styling until the mobile
                stylesheet claims it. */}
            <div className="foot-contact-text">
              <h3 className="meta">Contact</h3>
              <div><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></div>
              <div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.45rem', flexWrap: 'wrap' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`}>{BRAND.phone}</a>
                  {BRAND.phone2 && (
                    <>
                      <span style={{ opacity: 0.4, userSelect: 'none' }}>|</span>
                      <a href={`tel:${BRAND.phone2.replace(/\s/g, '')}`}>{BRAND.phone2}</a>
                    </>
                  )}
                </span>
              </div>
              <p style={{ marginTop: '.6rem', color: 'rgba(255, 255, 255, 0.78)', fontSize: '.9rem' }}>
                Mon–Sat, 09:00–18:00 IST
              </p>
            </div>
            <SocialLinks className="foot-contact-icons" />
          </div>
        </div>
      </div>
      <div className="foot-copy">
        <span>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</span>
        <span className="foot-copy-sep">·</span>
        <span>{BRAND.origin}</span>
        <span className="foot-copy-sep">·</span>
        <Link to="/privacy">Privacy</Link>
      </div>
    </footer>
  )
}
