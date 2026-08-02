import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reduced } from '../lib/gsap'
import { Link, useRoute } from '../lib/router'
import { BRAND, NAV_LINKS } from '../data/site'
import Button from './Button'
import MobileSheet from './MobileSheet'

/* E6 Liquid Pill — the active indicator stretches toward its new target,
   leading edge first, trailing edge ~120ms behind, like a droplet in transit.
   H3 Elastic Underline — the hover underline rubber-bands between links. */
export default function Navbar() {
  const { path } = useRoute()
  const [open, setOpen] = useState(false)
  const nav = useRef(null)
  const list = useRef(null)
  const pillEl = useRef(null)
  const pillPos = useRef({ l: 0, r: 0, on: false })

  const isActive = (to) => (to === '/' ? path === '/' : path.startsWith(to))

  function movePill(immediate = false) {
    const target = list.current?.querySelector('a.on')
    const p = pillPos.current
    if (!target) {
      gsap.to(pillEl.current, { opacity: 0, duration: 0.25 })
      p.on = false
      return
    }
    const L = target.offsetLeft
    const R = L + target.offsetWidth
    if (immediate || !p.on || reduced()) {
      p.l = L; p.r = R; p.on = true
      gsap.set(pillEl.current, { x: L, width: R - L, opacity: 1 })
      return
    }
    const goingRight = L > p.l
    const lead = { v: goingRight ? p.r : p.l }
    const trail = { v: goingRight ? p.l : p.r }
    const apply = () => {
      const lo = Math.min(lead.v, trail.v)
      const hi = Math.max(lead.v, trail.v)
      gsap.set(pillEl.current, { x: lo, width: hi - lo })
    }
    gsap.to(lead, { v: goingRight ? R : L, duration: 0.45, ease: 'surge', onUpdate: apply })
    gsap.to(trail, { v: goingRight ? L : R, duration: 0.6, delay: 0.12, ease: 'viscous', onUpdate: apply })
    p.l = L; p.r = R; p.on = true
  }

  useEffect(() => {
    movePill()
    const onR = () => movePill(true)
    window.addEventListener('resize', onR)
    document.fonts.ready.then(onR)
    return () => window.removeEventListener('resize', onR)
  }, [path]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        if (window.scrollY > 420 && self.direction === 1) nav.current.classList.add('hid')
        else nav.current.classList.remove('hid')
      },
    })
    return () => st.kill()
  }, [])

  return (
    <>
      <header className="nav" ref={nav}>
        <Link to="/" className="brand" aria-label={`${BRAND.name} — home`}>
          <span className="brand-mark">{BRAND.mark}</span>
          <span className="brand-suffix" aria-hidden="true">{BRAND.suffix}</span>
        </Link>
        <nav className="nav-links" aria-label="Primary" ref={list}>
          <span className="nav-pill" ref={pillEl} aria-hidden="true" />
          {/* Contact is served by the CTA on desktop; keep the rail tight */}
          {NAV_LINKS.filter((l) => l.to !== '/contact').map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={isActive(l.to) ? 'on' : ''}
              aria-current={isActive(l.to) ? 'page' : undefined}
            >
              {/* H3 Label Roll — the word steps up, its twin steps in below */}
              <span className="nl-roll">
                <span className="nl-up">{l.label}</span>
                <span className="nl-in" aria-hidden="true">{l.label}</span>
              </span>
            </Link>
          ))}
        </nav>
        <Button to="/contact" small className="nav-cta">Connect</Button>
        <button
          className="burger"
          aria-expanded={open}
          aria-controls="sheet"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen(!open)}
        >
          <i aria-hidden="true" />
        </button>
      </header>
      <MobileSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}
