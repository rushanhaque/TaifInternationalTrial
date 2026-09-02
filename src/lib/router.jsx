import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reduced } from './gsap'
import { getLenis } from './useLenis'
import { applyMeta } from './seo'

/* Custom pushState router with ONE transition: THE MITRE.

   There used to be four — strips, iris, slide, wipe — of which two were
   reachable and two were dead code. Four transitions is not four times the
   craft; it is a site that behaves differently depending on which link you
   happened to click, which is the opposite of a considered one. A house has
   a single way of turning a page. See page-transition.css for the geometry.

   Routes: [{ path, page, idx, name, title, desc, ok?, jsonLd? }] */

const RouteCtx = createContext({ path: '/', params: {} })
export const useRoute = () => useContext(RouteCtx)

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

/* NavLink used to force a different transition from Link. There is only one
   transition now, so it survives purely as the named export the navbar and
   the mobile menu already import. */
export function NavLink({ to, children, onClick, ...rest }) {
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

/* ── the timing sheet ──────────────────────────────────────────────────────
   Close and open are NOT symmetrical, and that asymmetry is the whole feel.
   Closing is quick and decisive — you asked to leave, so leaving should not
   be negotiated. Opening is slower, with a long tail, because that is the
   half you are actually looking at: the new page resolving.

   The two panels are also offset by a hair (CLASP) so the joint mates with a
   slight roll rather than a slap. Below ~30ms the offset stops reading;
   above ~90ms it reads as one panel simply being late. */
const T = {
  CLOSE: 0.46,
  CLASP: 0.055,
  HOLD: 0.16,   // the joint sits shut, plate legible
  OPEN: 0.52,
  SETTLE: 0.72, // the new page's own resolve, overlapping OPEN
}

/* `before` renders inside the route context but outside #page — for chrome
   that must know the current path (the navbar) without being caught by the
   page-transition transforms applied to #main. */
export function Router({ routes, notFound, before = null, after = null }) {
  const [path, setPath] = useState(window.location.pathname)
  const [plateLabel, setPlateLabel] = useState({ idx: '', name: '' })
  const pathRef = useRef(path)
  const busy = useRef(false)
  const mitreRef = useRef(null)
  const plateRef = useRef(null)

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
      /* `noindex` keeps a route reachable but out of the index — /admin is a
         real working page, not a soft-404, so `ok` is the wrong lever. */
      index: real && !route.noindex,
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

    /* back/forward is a return to somewhere you have already been — the mitre
       announces arrival at a new page, so it would misread here.
       transition:false skips the mitre for specific navigations (e.g. product
       cards in a collection, where the card itself already communicates intent). */
    if (!push || reduced() || !mitreRef.current || opts.transition === false) {
      settle(to)
      requestAnimationFrame(() => ScrollTrigger.refresh())
      document.getElementById('main')?.focus({ preventScroll: true })
      return
    }

    busy.current = true
    try { getLenis()?.stop() } catch (_) {}

    if (/^\/catalogue\//.test(to)) {
      playFade(to)
    } else {
      playMitre(to)
    }
  }

  function playFade(to) {
    const mainEl = document.getElementById('main')
    if (!mainEl) { settle(to); busy.current = false; try { getLenis()?.start() } catch (_) {} return }

    gsap.to(mainEl, {
      opacity: 0, duration: 0.18, ease: 'power1.in',
      onComplete: () => {
        settle(to)
        requestAnimationFrame(() => {
          ScrollTrigger.refresh()
          gsap.fromTo(mainEl, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: 'power1.out',
            onComplete: () => { gsap.set(mainEl, { clearProps: 'opacity' }); busy.current = false; try { getLenis()?.start() } catch (_) {} document.getElementById('main')?.focus({ preventScroll: true }) }
          })
        })
      }
    })
  }

  /* the destination, named on the plate. Falls back to the notFound route so
     a bad URL still gets a struck plate rather than a blank one. */
  function labelFor(to) {
    const m = matchRoutes(routes, to)
    const r = m ? m.route : notFound
    const p = m ? m.params : {}
    const real = r.ok ? r.ok(p) : r !== notFound
    const src = real ? r : notFound
    return { idx: src.idx, name: resolve(src.name, p) }
  }

  /* ── THE MITRE ────────────────────────────────────────────────────────────
     Close the joint, swap the page behind it, strike the plate, open the
     joint. The page itself is never the thing that animates out — it recedes
     a hair and dims while the panels do the work, so what you watch is the
     joint, not a page being taken away from you.

     EVERY EXIT ROUTES THROUGH teardown(), including a 2.4s safety timer. A
     transition that can strand the viewport behind an opaque panel is worse
     than no transition at all, so there is no path out of this function that
     leaves the overlay standing. */
  function playMitre(to) {
    const veil = mitreRef.current
    const plate = plateRef.current
    const mainEl = document.getElementById('main')
    const top = veil?.querySelector('.is-top')
    const bot = veil?.querySelector('.is-bot')

    if (!veil || !top || !bot) {
      settle(to)
      busy.current = false
      try { getLenis()?.start() } catch (_) {}
      return
    }

    setPlateLabel(labelFor(to))
    veil.classList.add('is-active')

    gsap.set(top, { yPercent: -101 })
    gsap.set(bot, { yPercent: 101 })
    gsap.set(plate, { opacity: 0, y: 10 })
    if (mainEl) gsap.set(mainEl, { transformOrigin: '50% 0%', willChange: 'opacity, transform' })

    let done = false
    const safety = setTimeout(teardown, 2400)

    function teardown() {
      if (done) return
      done = true
      clearTimeout(safety)
      veil.classList.remove('is-active')
      gsap.set([top, bot], { clearProps: 'all' })
      if (plate) gsap.set(plate, { clearProps: 'all' })
      if (mainEl) gsap.set(mainEl, { clearProps: 'all' })
      busy.current = false
      try { getLenis()?.start() } catch (_) {}
      document.getElementById('main')?.focus({ preventScroll: true })
      if (pathRef.current !== to) { settle(to); return }
      if (window.location.pathname !== to) go(window.location.pathname, false)
    }

    const tl = gsap.timeline({ onComplete: teardown })

    /* ─ close ─ the bottom panel leads by CLASP so the faces roll together */
    tl.to(bot, { yPercent: 0, duration: T.CLOSE, ease: 'expo.inOut' }, 0)
      .to(top, { yPercent: 0, duration: T.CLOSE, ease: 'expo.inOut' }, T.CLASP)

    if (mainEl) {
      tl.to(mainEl, {
        opacity: 0.35, scale: 0.986, y: -8,
        duration: T.CLOSE, ease: 'power2.in',
      }, 0)
    }

    /* ─ swap ─ behind a shut joint, so none of it is ever seen */
    tl.call(() => {
      settle(to)
      try { ScrollTrigger.refresh() } catch (_) {}
      if (mainEl) gsap.set(mainEl, { opacity: 0, scale: 1.014, y: 14, transformOrigin: '50% 0%' })
    })

    /* ─ the plate ─ struck, held, released */
    if (plate) {
      tl.to(plate, { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' })
        .to(plate, { opacity: 0, y: -8, duration: 0.2, ease: 'power2.in' }, `+=${T.HOLD}`)
    }

    /* ─ open ─ the top panel leads out, mirroring how the joint came shut */
    tl.to(top, { yPercent: -101, duration: T.OPEN, ease: 'expo.inOut' })
      .to(bot, { yPercent: 101, duration: T.OPEN, ease: 'expo.inOut' }, `<+=${T.CLASP}`)

    /* the new page resolves UNDER the opening joint rather than after it — by
       the time the panels clear the frame the content has already arrived,
       which is what keeps a ~1.1s transition from reading as a wait */
    if (mainEl) {
      tl.to(mainEl, {
        opacity: 1, scale: 1, y: 0,
        duration: T.SETTLE, ease: 'expo.out',
      }, '<')
    }
  }

  navigateFn = (to, opts = {}) => go(to, true, opts)

  useEffect(() => {
    const onPop = () => go(window.location.pathname, false)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const Page = route.page
  return (
    <RouteCtx.Provider value={{ path, params }}>
      {before}
      <div id="page">
        <main id="main" tabIndex={-1}>
          <Page params={params} key={path} />
        </main>
        {after}
      </div>

      {/* THE MITRE — two panels closing on a scarf joint. See
          page-transition.css; the clip-paths there are exact complements. */}
      <div className="mitre" ref={mitreRef} aria-hidden="true">
        <div className="mitre__panel is-top" />
        <div className="mitre__panel is-bot" />
        <div className="mitre__plate" ref={plateRef}>
          <span className="mitre__idx">{plateLabel.idx}</span>
          <span className="mitre__name">{plateLabel.name}</span>
          <span className="mitre__keyline" />
        </div>
      </div>
    </RouteCtx.Provider>
  )
}
