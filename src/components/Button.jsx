import { useRef } from 'react'
import { gsap, reduced } from '../lib/gsap'
import { navigate } from '../lib/router'

/* H1 — Liquid Fill + Surge Press. The iris flood expands from the pointer's
   entry coordinate; press is a squash-and-stretch, never a stamp.
   `chip` (default true on non-small buttons) seats a nested circular arrow
   in the right padding — it drifts on hover for internal kinetic tension. */
export default function Button({ to, variant = 'primary', small = false, chip, className = '', type = 'button', onClick, children }) {
  const ref = useRef(null)

  function seed(e) {
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--fx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`)
    ref.current.style.setProperty('--fy', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`)
  }
  function press() {
    if (reduced()) return
    gsap.to(ref.current, { scaleX: 0.96, scaleY: 1.06, duration: 0.12, ease: 'power2.out' })
  }
  function release() {
    if (reduced()) return
    gsap.to(ref.current, { scaleX: 1, scaleY: 1, duration: 0.55, ease: 'surge' })
  }

  const showChip = chip ?? (!small && variant === 'primary')
  const cls = `btn ${variant} ${small ? 'small' : ''} ${showChip ? 'has-chip' : ''} ${className}`
  const inner = (
    <>
      <span className="btn-fill" aria-hidden="true" />
      <span className="btn-label">{children}</span>
      {showChip && (
        <span className="btn-chip" aria-hidden="true">
          <svg viewBox="0 0 12 12" width="11" height="11">
            <path d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </>
  )
  const handlers = {
    onMouseEnter: seed,
    onPointerDown: press,
    onPointerUp: release,
    onPointerLeave: release,
  }

  if (to) {
    return (
      <a
        ref={ref}
        href={to}
        className={cls}
        {...handlers}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
          e.preventDefault()
          if (onClick) onClick(e)
          navigate(to)
        }}
      >
        {inner}
      </a>
    )
  }
  return (
    <button ref={ref} type={type} className={cls} {...handlers} onClick={onClick}>
      {inner}
    </button>
  )
}
