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
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [target, duration])
  return [ref, val]
}
