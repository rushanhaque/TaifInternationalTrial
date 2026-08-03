import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reduced } from './gsap'
import { getLenis } from './useLenis'
import { applyMeta } from './seo'

/* Custom pushState router + SteviaPlease-style vertical-strips curtain.
   Routes: [{ path, page, idx, name, title, desc, ok?, jsonLd? }] — name,
   title and desc may be functions of the matched params (product pages).
   `ok(params)` reports whether those params resolved to real content, and
   `jsonLd(params)` builds the route's structured data. */

const RouteCtx = createContext({ path: '/', params: {} })
export const useRoute = () => useContext(RouteCtx)

let navigateFn = (to) => { window.location.href = to }
export const navigate = (to) => navigateFn(to)

export function Link({ to, children, onClick, ...rest }) {
  return (
    <a
      href={to}
      {...rest}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) return
        e.preventDefault()
        if (onClick) onClick(e)
        navigate(to)
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
   SteviaPlease vertical-strips curtain transition
   ─────────────────────────────────────────────────────────────────────────
   Phase 1 – strips rise bottom-up (scaleY 0→1), staggered left-to-right
   Phase 2 – page is swapped while the curtain is opaque
   Phase 3 – strips collapse top-down (scaleY 1→0), staggered left-to-right
   Landscape: 20 vertical columns · Portrait: 10 horizontal rows            */

const LANDSCAPE_COUNT = 20
const PORTRAIT_COUNT  = 10



export function Router({ routes, notFound, after = null }) {
  const [path, setPath]   = useState(window.location.pathname)
  /* teardown() runs from a timer and would otherwise close over a stale
     `path`; this ref always reports what is actually mounted */
  const pathRef           = useRef(path)
  const busy              = useRef(false)
  const stripsRef         = useRef(null)

  const matched = matchRoutes(routes, path)
  const route   = matched ? matched.route : notFound
  const params  = matched ? matched.params : {}

  useEffect(() => {
    /* `ok` lets a route say its params did not resolve to anything real —
       an unknown product slug, a family that is not a family. Those render
       the not-found body, so their metadata must say so too rather than
       advertising a product that does not exist. */
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

  function go(to, push = true) {
    if (busy.current) return
    if (to === window.location.pathname && push) {
      const l = getLenis()
      l ? l.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (push) window.history.pushState({}, '', to)

    if (reduced() || !stripsRef.current) {
      settle(to)
      requestAnimationFrame(() => ScrollTrigger.refresh())
      document.getElementById('main')?.focus({ preventScroll: true })
      return
    }

    busy.current = true
    getLenis()?.stop()

    const veil = stripsRef.current

    /* pick which set of lines is currently active based on orientation */
    const isPortrait  = window.matchMedia('(orientation: portrait)').matches
    const linesWrap   = isPortrait
      ? veil.querySelector('.strips__portrait')
      : veil.querySelector('.strips__landscape')
    const lines = Array.from(linesWrap.querySelectorAll('.strips__line'))

    veil.classList.add('is-active')

    /* reset all lines to collapsed before animating in, 
       with a 1.03 scale on the orthogonal axis to cover sub-pixel gaps */
    if (isPortrait) {
      gsap.set(lines, { scaleX: 0, scaleY: 1.03, transformOrigin: '100% 50%' })
    } else {
      gsap.set(lines, { scaleY: 0, scaleX: 1.03, transformOrigin: '50% 100%' })
    }

    const safety = setTimeout(teardown, 3500)

    function teardown() {
      clearTimeout(safety)
      veil.classList.remove('is-active')
      /* clear every GSAP inline style so strips are clean while hidden */
      gsap.set(lines, { clearProps: 'all' })
      busy.current = false
      try { getLenis()?.start() } catch (_) {}
      document.getElementById('main')?.focus({ preventScroll: true })

      /* The page swap lives in PHASE 1's onComplete, which is driven by
         GSAP's ticker — i.e. by rAF. A tab that is backgrounded or badly
         starved mid-navigation never advances that tween, so the safety
         timer fires with the URL already changed and the OLD page still
         mounted. Re-running go() from here would start the whole curtain
         again on the same starved clock and simply repeat every 3.5s.
         Swap directly instead: the transition is decoration, arriving is not.

         Measured with frames frozen: the URL updated and the page never
         changed until this landed. */
      if (pathRef.current !== to) { settle(to); return }
      if (window.location.pathname !== to) go(window.location.pathname, false)
    }

    const STAGGER   = 0.035   /* seconds between each strip */
    const IN_DUR    = 0.55    /* duration each strip takes to rise */
    const OUT_DUR   = 0.45    /* duration each strip takes to fall */
    const EASE_IN   = 'power3.inOut'
    const EASE_OUT  = 'power3.inOut'

    const prop = isPortrait ? 'scaleX' : 'scaleY'

    /* PHASE 1 — curtain rises */
    gsap.to(lines, {
      [prop]: 1,
      duration: IN_DUR,
      ease: EASE_IN,
      stagger: STAGGER,
      transformOrigin: isPortrait ? '100% 50%' : '50% 100%',
      onComplete() {
        /* PHASE 2 — swap the page while fully covered */
        settle(to)
        try { ScrollTrigger.refresh() } catch (_) {}

        requestAnimationFrame(() => requestAnimationFrame(() => {
          /* PHASE 3 — curtain falls; origin flips to the opposite edge */
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

  navigateFn = go

  useEffect(() => {
    const onPop = () => go(window.location.pathname, false)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* Build the strip elements — one static render is fine; GSAP drives them */
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

      {/* SteviaPlease-style curtain overlay */}
      <div className="strips" ref={stripsRef} aria-hidden="true">
        {/* Landscape: 20 vertical columns */}
        <div className="strips__landscape">
          {landscapeLines}
        </div>
        {/* Portrait: 10 horizontal rows */}
        <div className="strips__portrait">
          {portraitLines}
        </div>
      </div>
    </RouteCtx.Provider>
  )
}
