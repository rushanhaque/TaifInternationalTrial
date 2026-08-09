import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reduced } from '../lib/gsap'
import { Link, NavLink, useRoute } from '../lib/router'
import { BRAND, NAV_LINKS, COLLECTIONS } from '../data/site'
import { familySlug } from '../pages/CollectionPage'
import { AnimatedThemeToggler } from './magicui/AnimatedThemeToggler'
import Button from './Button'
import MobileSheet from './MobileSheet'

/* E6 Liquid Pill — the active indicator stretches toward its new target,
   leading edge first, trailing edge ~120ms behind, like a droplet in transit.
   H3 Elastic Underline — the hover underline rubber-bands between links. */
const ALL_NAV_LINKS = [{ to: '/', label: 'Home' }, ...NAV_LINKS]

export default function Navbar() {
  const { path } = useRoute()
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownTimer = useRef(null)
  const lastScrollY = useRef(0)
  const nav = useRef(null)
  const list = useRef(null)
  const pillEl = useRef(null)
  const pillPos = useRef({ l: 0, r: 0, on: false })

  const handleDropdownMouseEnter = () => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current)
    setDropdownOpen(true)
  }

  const handleDropdownMouseLeave = () => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current)
    dropdownTimer.current = setTimeout(() => {
      setDropdownOpen(false)
    }, 1500)
  }

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
    const onScroll = () => {
      if (!nav.current) return
      if (window.scrollY > 40) {
        nav.current.classList.add('nav-scrolled')
      } else {
        nav.current.classList.remove('nav-scrolled')
      }
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [path])

  return (
    <>
      <header className="nav" ref={nav}>
        <Link to="/" className="brand" aria-label={`${BRAND.name} — home`}>
          <img
            src="/img/taif-logo-maroon.png"
            alt={BRAND.name}
            className="header-brand-img"
            style={{
              height: '36px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
          />
        </Link>
        <nav className="nav-links" aria-label="Primary" ref={list}>
          <span className="nav-pill" ref={pillEl} aria-hidden="true" />
          {ALL_NAV_LINKS.map((l) => {
            const isCollections = l.to === '/collections'

            const navItem = (
              <NavLink
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
              </NavLink>
            )

            if (!isCollections) return navItem

            return (
              <div
                key={l.to}
                className={`nav-dropdown-wrap ${dropdownOpen ? 'is-open' : ''}`}
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
              >
                {navItem}
                <div className="nav-dropdown-menu">
                  <div className="nav-dropdown-list">
                    {COLLECTIONS.map((c) => (
                      <Link
                        key={c.no}
                        to={`/collections/${familySlug(c.name)}`}
                        className="nav-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <AnimatedThemeToggler duration={500} variant="circle" />
          <button
            className="burger"
            aria-expanded={open}
            aria-controls="sheet"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(!open)}
          >
            <i aria-hidden="true" />
          </button>
        </div>
      </header>
      <MobileSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}
