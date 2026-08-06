import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reduced } from './gsap'
import { getLenis } from './useLenis'
import { applyMeta } from './seo'

/* Custom pushState router with TWO transition modes:
   1. Strip curtain  — vertical-strips wipe, used for navbar navigation
   2. Iris reveal    — a circular/diamond mask that opens from the click point,
                        used for in-page links (collections, catalogue, etc.)
   Routes: [{ path, page, idx, name, title, desc, ok?, jsonLd? }] */

const RouteCtx = createContext({ path: '/', params: {} })
export const useRoute = () => useContext(RouteCtx)

/* transition hint: 'strips' (navbar) or 'iris' (default for in-page links) */
let navigateFn = (to) => { window.location.href = to }
export const navigate = (to, opts = {}) => navigateFn(to, opts)

export function Link({ to, children, onClick, transition, ...rest }) {
  return (
    <a
      href={to}
      {...rest}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) return
        e.preventDefault()
        if (onClick) onClick(e)
        navigate(to, { transition })
      }}
    >
      {children}
    </a>
  )
}

/* NavLink is identical to Link but forces the strip curtain transition */
export function NavLink({ to, children, onClick, ...rest }) {
  return (
    <a
      href={to}
      {...rest}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) return
        e.preventDefault()
        if (onClick) onClick(e)
        navigate(to, { transition: 'strips' })
      }}
    >
      {children}
    </a>
  )
}

function matchOne(pattern, path) {
  const ps = pattern.split('/').filter(Boolean)
  const ts = path.split('/').filter(Boolean)
  if (ps.length !== ts.length) return null
  const params = {}
  for (let i = 0; i < ps.length; i++) {
    if (ps[i].startsWith(':')) params[ps[i].slice(1)] = decodeURIComponent(ts[i])
    else if (ps[i] !== ts[i]) return null
  }
  return params
}

export function matchRoutes(routes, path) {
  for (const r of routes) {
    const params = matchOne(r.path, path)
    if (params) return { route: r, params }
  }
  return null
}

const resolve = (v, params) => (typeof v === 'function' ? v(params) : v)

/* ─────────────────────────────────────────────────────────────────────────
   TRANSITION 1 · Strip curtain (navbar only)
   ─────────────────────────────────────────────────────────────────────────
   Phase 1 – strips rise bottom-up (scaleY 0→1), staggered left-to-right
   Phase 2 – page is swapped while the curtain is opaque
   Phase 3 – strips collapse top-down (scaleY 1→0), staggered left-to-right
   Landscape: 20 vertical columns · Portrait: 10 horizontal rows            */

const LANDSCAPE_COUNT = 20
const PORTRAIT_COUNT = 10

/* ─────────────────────────────────────────────────────────────────────────
   TRANSITION 2 · Iris reveal (in-page links)
   ─────────────────────────────────────────────────────────────────────────
   A warm brass-tinted overlay sweeps across the viewport as a soft diagonal
   wipe: the leading edge enters from the bottom-left, crosses to the
   top-right, covers the page, swaps the content, then the trailing edge
   continues off-screen in the same direction. The motion is continuous —
   not a separate in/out — which makes it feel like a single confident
   gesture rather than an open-then-close.                                   */



export function Router({ routes, notFound, after = null }) {
  const [path, setPath] = useState(window.location.pathname)
  const pathRef = useRef(path)
  const busy = useRef(false)
  const stripsRef = useRef(null)
  const irisRef = useRef(null)

  const matched = matchRoutes(routes, path)
  const route = matched ? matched.route : notFound
  const params = matched ? matched.params : {}

  useEffect(() => {
    const real = route.ok ? route.ok(params) : route !== notFound
    applyMeta({
      title: real ? resolve(route.title, params) : resolve(notFound.title, params),
      description: real ? resolve(route.desc, params) : resolve(notFound.desc, params),
      path,
      canonical: real && route.canonical ? route.canonical(params) : undefined,
      index: real,
      jsonLd: real && route.jsonLd ? route.jsonLd(params) : null,
    })
  }, [path]) // eslint-disable-line react-hooks/exhaustive-deps

  function settle(to) {
    pathRef.current = to
    setPath(to)
    const l = getLenis()
    if (l) l.scrollTo(0, { immediate: true, force: true })
    window.scrollTo(0, 0)
  }

  function go(to, push = true, opts = {}) {
    if (busy.current) return
    if (to === window.location.pathname && push) {
      const l = getLenis()
      l ? l.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (push) window.history.pushState({}, '', to)

    if (reduced() || (!stripsRef.current && !irisRef.current)) {
      settle(to)
      requestAnimationFrame(() => ScrollTrigger.refresh())
      document.getElementById('main')?.focus({ preventScroll: true })
      return
    }

    busy.current = true
    try { getLenis()?.stop() } catch (_) {}

    const mode = opts.transition || 'strips'

    if (mode === 'strips') {
      playStrips(to)
    } else {
      playIris(to)
    }
  }

  /* ── STRIPS CURTAIN ─────────────────────────────────────────────────── */
  function playStrips(to) {
    const veil = stripsRef.current
    if (!veil) { playIris(to); return }

    const isPortrait = window.matchMedia('(orientation: portrait)').matches
    const linesWrap = isPortrait
      ? veil.querySelector('.strips__portrait')
      : veil.querySelector('.strips__landscape')
    const lines = Array.from(linesWrap.querySelectorAll('.strips__line'))

    veil.classList.add('is-active')

    if (isPortrait) {
      gsap.set(lines, { scaleX: 0, scaleY: 1.03, transformOrigin: '100% 50%' })
    } else {
      gsap.set(lines, { scaleY: 0, scaleX: 1.03, transformOrigin: '50% 100%' })
    }

    const safety = setTimeout(teardown, 2000)

    function teardown() {
      clearTimeout(safety)
      veil.classList.remove('is-active')
      gsap.set(lines, { clearProps: 'all' })
      busy.current = false
      try { getLenis()?.start() } catch (_) { }
      document.getElementById('main')?.focus({ preventScroll: true })
      if (pathRef.current !== to) { settle(to); return }
      if (window.location.pathname !== to) go(window.location.pathname, false)
    }

    const STAGGER = 0.035
    const IN_DUR = 0.35
    const OUT_DUR = 0.3
    const EASE_IN = 'power3.inOut'
    const EASE_OUT = 'power3.inOut'

    const prop = isPortrait ? 'scaleX' : 'scaleY'

    gsap.to(lines, {
      [prop]: 1,
      duration: IN_DUR,
      ease: EASE_IN,
      stagger: STAGGER,
      transformOrigin: isPortrait ? '100% 50%' : '50% 100%',
      onComplete() {
        settle(to)
        try { ScrollTrigger.refresh() } catch (_) { }

        requestAnimationFrame(() => requestAnimationFrame(() => {
          gsap.to(lines, {
            [prop]: 0,
            duration: OUT_DUR,
            ease: EASE_OUT,
            stagger: STAGGER,
            transformOrigin: isPortrait ? '0% 50%' : '50% 0%',
            onComplete: teardown,
          })
        }))
      },
    })
  }

  /* ── IRIS REVEAL ────────────────────────────────────────────────────── */
  function playIris(to) {
    const iris = irisRef.current
    if (!iris) { settle(to); busy.current = false; try { getLenis()?.start() } catch(_){} return }

    iris.classList.add('is-active')

    /* The overlay enters from bottom-left (translate 0%,100%) and exits
       toward top-right (translate 100%,-100%). The page swap happens at
       the midpoint when the overlay fully covers the viewport. Using a
       skewX gives the leading edge a diagonal angle for a premium feel. */

    gsap.set(iris, { xPercent: 0, yPercent: 110, skewY: -4, opacity: 1 })

    const safety = setTimeout(teardown, 2200)

    function teardown() {
      clearTimeout(safety)
      iris.classList.remove('is-active')
      gsap.set(iris, { clearProps: 'all' })
      busy.current = false
      try { getLenis()?.start() } catch (_) { }
      document.getElementById('main')?.focus({ preventScroll: true })
      if (pathRef.current !== to) { settle(to); return }
      if (window.location.pathname !== to) go(window.location.pathname, false)
    }

    /* Phase 1 — sweep in from bottom */
    gsap.to(iris, {
      xPercent: 0,
      yPercent: 0,
      skewY: 0,
      duration: 0.45,
      ease: 'power4.inOut',
      onComplete() {
        settle(to)
        try { ScrollTrigger.refresh() } catch (_) { }

        requestAnimationFrame(() => requestAnimationFrame(() => {
          /* Phase 2 — sweep out to top */
          gsap.to(iris, {
            xPercent: 0,
            yPercent: -110,
            skewY: 4,
            duration: 0.45,
            ease: 'power4.inOut',
            onComplete: teardown,
          })
        }))
      },
    })
  }

  /* ── SLIDE REVEAL ────────────────────────────────────────────────────── */
  function playSlide(to, dir) {
    const iris = irisRef.current
    if (!iris) { settle(to); busy.current = false; try { getLenis()?.start() } catch(_){} return }

    iris.classList.add('is-active')

    const isRight = dir === 'right'
    const startX = isRight ? 100 : 0
    const startY = isRight ? 0 : 100
    const endX = isRight ? -100 : 0
    const endY = isRight ? 0 : -100

    gsap.set(iris, { xPercent: startX, yPercent: startY, skewY: 0, opacity: 1 })

    const safety = setTimeout(teardown, 2200)

    function teardown() {
      clearTimeout(safety)
      iris.classList.remove('is-active')
      gsap.set(iris, { clearProps: 'all' })
      busy.current = false
      try { getLenis()?.start() } catch (_) { }
      document.getElementById('main')?.focus({ preventScroll: true })
      if (pathRef.current !== to) { settle(to); return }
      if (window.location.pathname !== to) go(window.location.pathname, false)
    }

    gsap.to(iris, {
      xPercent: 0,
      yPercent: 0,
      duration: 0.45,
      ease: 'power4.inOut',
      onComplete() {
        settle(to)
        try { ScrollTrigger.refresh() } catch (_) { }

        requestAnimationFrame(() => requestAnimationFrame(() => {
          gsap.to(iris, {
            xPercent: endX,
            yPercent: endY,
            duration: 0.45,
            ease: 'power4.inOut',
            onComplete: teardown,
          })
        }))
      },
    })
  }

  navigateFn = (to, opts = {}) => go(to, true, opts)

  useEffect(() => {
    const onPop = () => go(window.location.pathname, false)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const landscapeLines = Array.from({ length: LANDSCAPE_COUNT }, (_, i) => (
    <div key={i} className="strips__line" />
  ))
  const portraitLines = Array.from({ length: PORTRAIT_COUNT }, (_, i) => (
    <div key={i} className="strips__line" />
  ))

  const Page = route.page
  return (
    <RouteCtx.Provider value={{ path, params }}>
      <div id="page">
        <main id="main" tabIndex={-1}>
          <Page params={params} key={path} />
        </main>
        {after}
      </div>

      {/* Iris reveal overlay — diagonal sweep for in-page links */}
      <div className="iris-overlay" ref={irisRef} aria-hidden="true" />

      {/* SteviaPlease-style curtain overlay — navbar only */}
      <div className="strips" ref={stripsRef} aria-hidden="true">
        <div className="strips__landscape">
          {landscapeLines}
        </div>
        <div className="strips__portrait">
          {portraitLines}
        </div>
      </div>
    </RouteCtx.Provider>
  )
}
