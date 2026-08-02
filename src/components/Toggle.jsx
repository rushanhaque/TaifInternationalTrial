import { useEffect, useRef } from 'react'
import { gsap, reduced } from '../lib/gsap'

/* H6 Segmented Slide — the active background slides between segments with the
   same lead/trail stretch as the nav pill (E6). Radiogroup semantics. */
export default function Toggle({ options, value, onChange, label }) {
  const root = useRef(null)
  const pillEl = useRef(null)
  const pos = useRef({ l: 0, r: 0, on: false })

  function move(immediate = false) {
    const btn = root.current?.querySelector('button[aria-checked="true"]')
    const p = pos.current
    if (!btn) return
    const L = btn.offsetLeft
    const R = L + btn.offsetWidth
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
    gsap.to(lead, { v: goingRight ? R : L, duration: 0.4, ease: 'surge', onUpdate: apply })
    gsap.to(trail, { v: goingRight ? L : R, duration: 0.55, delay: 0.1, ease: 'viscous', onUpdate: apply })
    p.l = L; p.r = R; p.on = true
  }

  useEffect(() => {
    move()
    const onR = () => move(true)
    window.addEventListener('resize', onR)
    document.fonts.ready.then(onR)
    return () => window.removeEventListener('resize', onR)
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  function onKey(e) {
    const i = options.findIndex((o) => o.value === value)
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const n = options[(i + 1) % options.length]
      onChange(n.value)
      root.current.querySelectorAll('button')[(i + 1) % options.length].focus()
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const n = options[(i - 1 + options.length) % options.length]
      onChange(n.value)
      root.current.querySelectorAll('button')[(i - 1 + options.length) % options.length].focus()
    }
  }

  return (
    <div className="toggle" role="radiogroup" aria-label={label} ref={root} onKeyDown={onKey}>
      <span className="tg-pill" ref={pillEl} aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={o.value === value}
          tabIndex={o.value === value ? 0 : -1}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
