import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reduced } from '../lib/gsap'
import { Link, NavLink, useRoute } from '../lib/router'
import { BRAND, NAV_LINKS } from '../data/site'
import Button from './Button'
import UiverseConnectButton from './UiverseConnectButton'
import MobileSheet from './MobileSheet'
import { AnimatedThemeToggler } from './magicui/AnimatedThemeToggler'

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
    const isHome = path === '/'

    const checkDarkBg = () => {
      if (!nav.current) return
      if (isHome || path.startsWith('/collections')) {
        nav.current.classList.remove('nav-dark-bg')
        return
      }
      const rect = nav.current.getBoundingClientRect()
      const y = rect.top + rect.height / 2
      const xMid = rect.left + rect.width / 2

      const prevVis = nav.current.style.visibility
      nav.current.style.visibility = 'hidden'

      let isDark = false
      const points = [
        { x: rect.left + 60, y },
        { x: xMid, y },
        { x: rect.left + rect.width - 60, y }
      ]

      for (const pt of points) {
        let el = document.elementFromPoint(pt.x, pt.y)
        while (el && el !== document.body && el !== document.documentElement) {
          const cls = el.className ? String(el.className) : ''
          const tag = el.tagName ? el.tagName.toUpperCase() : ''
          const id = el.id ? String(el.id) : ''

          if (
            cls.includes('deep') ||
            cls.includes('dark') ||
            cls.includes('tt') ||
            cls.includes('hero') ||
            cls.includes('footer') ||
            cls.includes('black') ||
            cls.includes('obsidian') ||
            id === 'the-turn' ||
            id === 'two-floors' ||
            id === 'sampler' ||
            tag === 'FOOTER' ||
            el.getAttribute('data-theme') === 'dark'
          ) {
            isDark = true
            break
          }

          const bg = window.getComputedStyle(el).backgroundColor
          if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
            const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
            if (match) {
              const [, r, g, b, a] = match
              const alpha = a !== undefined ? parseFloat(a) : 1
              if (alpha > 0.35) {
                const lum = (parseInt(r) * 0.299 + parseInt(g) * 0.587 + parseInt(b) * 0.114)
                if (lum < 165) {
                  isDark = true
                  break
                } else {
                  break
                }
              }
            }
          }
          el = el.parentElement
        }
        if (isDark) break
      }

      nav.current.style.visibility = prevVis

      if (isDark || document.documentElement.classList.contains('dark')) {
        nav.current.classList.add('nav-dark-bg')
      } else {
        nav.current.classList.remove('nav-dark-bg')
      }
    }

    const onScroll = () => {
      if (!nav.current) return
      if (isHome && window.scrollY <= 10) {
        nav.current.classList.add('nav-hide-top')
      } else {
        nav.current.classList.remove('nav-hide-top')
      }
      checkDarkBg()
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    const observer = new MutationObserver(checkDarkBg)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      observer.disconnect()
    }
  }, [path])

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
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UiverseConnectButton className="nav-cta" />
          <AnimatedThemeToggler />
        </div>
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
