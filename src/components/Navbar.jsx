import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reduced } from '../lib/gsap'
import { Link, NavLink, useRoute } from '../lib/router'
import { useDarkMode } from '../lib/hooks'
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
  const dark = useDarkMode()
  const [open, setOpen] = useState(false)
  const [atTop, setAtTop] = useState(true)
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

  /* A grace period, not a decoration: the pointer has to cross a gap between
     the "Collections" link and the panel below it, and closing the instant it
     leaves either one makes the menu impossible to reach. Half a second is
     long enough to cross and short enough not to feel stuck open. */
  const handleDropdownMouseLeave = () => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current)
    dropdownTimer.current = setTimeout(() => setDropdownOpen(false), 500)
  }

  /* a pending close must not fire after the menu unmounts */
  useEffect(() => () => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current)
  }, [])

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

  /* React owns the class now rather than classList: the hero treatment below
     re-renders the header, and an imperatively added class would be wiped by
     that render. */
  useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY <= 40
      setAtTop((prev) => (prev === top ? prev : top))
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [path])

  /* Landing page only, and only until the header makes its transition: the
     bar dissolves into the hero footage — no ground, white type, the white
     wordmark the footer uses. The moment the pill takes over it is the
     header it was before. */
  const heroMode = path === '/' && atTop

  return (
    <>
      <header
        className={`nav${atTop ? '' : ' nav-scrolled'}${heroMode ? ' nav-hero' : ''}`}
        ref={nav}
      >
        <Link to="/" className="brand" aria-label={`${BRAND.name} — home`}>
          {/* Three grounds, three marks. Hero is the transparent bar over the
              video, so the white mark reads on it in either theme. Off the
              hero the bar is solid: cream in light mode (burgundy mark) and
              #170D05 in dark (white mark) — the burgundy one was being used
              there too, at 1.25:1 against the dark bar, i.e. invisible. */}
          <img
            src={atTop ? "/img/taif-logo-white.png" : (dark ? "/img/taif-logo-darkmode.png" : "/img/taif-logo-navbar.png")}
            alt={BRAND.name}
            className="header-brand-img"
            style={{
              height: atTop ? '36px' : '32px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
              transition: 'height 0.3s ease'
            }}
          />
          <span className="brand-suffix">{BRAND.suffix}</span>
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
