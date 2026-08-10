import { useEffect, useRef, useState } from 'react'

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---- Shared IntersectionObserver for reveals (one observer, many targets) ---- */
let _io = null
function observer() {
  if (_io) return _io
  _io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in')
          _io.unobserve(e.target)
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.14 }
  )
  return _io
}

/** True while the dark theme is on.
 *
 *  The theme lives as a class on <html>, toggled outside React by
 *  AnimatedThemeToggler, so there is no state to subscribe to — an observer on
 *  the class attribute is what keeps a component (the navbar's logo swap) in
 *  step with it. Reads the class on mount too, so a reload in dark mode is
 *  correct on the first paint rather than flashing the light asset.
 */
export function useDarkMode() {
  const [dark, setDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    const el = document.documentElement
    const sync = () => setDark(el.classList.contains('dark'))
    sync()
    const mo = new MutationObserver(sync)
    mo.observe(el, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, [])

  return dark
}

/** Attach to any element with a `.reveal` / mask base class. Adds `is-in` once. */
export function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced()) {
      el.classList.add('is-in')
      return
    }
    const ob = observer()
    ob.observe(el)
    return () => ob.unobserve(el)
  }, [])
  return ref
}

/** Count up to a value once visible. Returns [ref, displayValue]. */
export function useCounter(target = 100, duration = 1800) {
  const ref = useRef(null)
  const [val, setVal] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced()) {
      setVal(target)
      return
    }
    let raf
    let start
    let done = false
    const ease = (t) => 1 - Math.pow(1 - t, 4)
    const run = (ts) => {
      if (start == null) start = ts
      const p = Math.min(1, (ts - start) / duration)
      setVal(Math.round(ease(p) * target))
      if (p < 1) raf = requestAnimationFrame(run)
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !done) {
          done = true
          raf = requestAnimationFrame(run)
          io.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    io.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [target, duration])
  return [ref, val]
}
