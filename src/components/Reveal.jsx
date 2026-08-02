import { createElement, useEffect, useRef } from 'react'
import { gsap, reduced, splitChars } from '../lib/gsap'

/* E7 Dilate — the default reveal: swell from a centre point with a radius morph. */
export function Dilate({ as = 'div', className = '', delay = 0, children, style, ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    if (reduced()) return
    const tw = gsap.from(ref.current, {
      scale: 0.94, opacity: 0, borderRadius: 34,
      transformOrigin: '50% 50%',
      duration: 0.9, delay, ease: 'surge',
      clearProps: 'borderRadius,scale',
      scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
    })
    return () => { tw.scrollTrigger?.kill(); tw.kill() }
  }, [delay])
  return createElement(as, { ref, className, style, ...rest }, children)
}

/* E8 Char Cascade — characters squash-and-settle, staggered from the centre. */
export function CharCascade({ as = 'h2', className = '', delay = 0, children, id }) {
  const ref = useRef(null)
  useEffect(() => {
    if (reduced()) return
    const chars = splitChars(ref.current)
    const tw = gsap.from(chars, {
      y: 18, scaleY: 1.6, opacity: 0,
      transformOrigin: '50% 100%',
      stagger: { each: 0.014, from: 'center' },
      duration: 0.7, delay, ease: 'surge',
      scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true },
    })
    return () => { tw.scrollTrigger?.kill(); tw.kill() }
  }, [delay])
  return createElement(as, { ref, className, id }, children)
}

/* E14 Grid Snap — children snap onto the grid from slight misalignment while
   the 12 column guides flash once. Wrap a .grid with this. */
export function GridSnap({ className = '', children }) {
  const ref = useRef(null)
  const guides = useRef(null)
  useEffect(() => {
    if (reduced()) return
    const kids = ref.current.querySelectorAll(':scope > .grid > *')
    const tl = gsap.timeline({
      scrollTrigger: { trigger: ref.current, start: 'top 82%', once: true },
    })
    tl.from(kids, {
      x: () => gsap.utils.random(-14, 14),
      opacity: 0, duration: 0.75, ease: 'fluid', stagger: 0.05,
    })
      .to(guides.current, { opacity: 0.35, duration: 0.2 }, 0.1)
      .to(guides.current, { opacity: 0, duration: 0.5 }, 0.7)
    return () => { tl.scrollTrigger?.kill(); tl.kill() }
  }, [])
  return (
    <div ref={ref} className={`snap-zone ${className}`}>
      <div ref={guides} className="g-guides" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => <i key={i} />)}
      </div>
      {children}
    </div>
  )
}
