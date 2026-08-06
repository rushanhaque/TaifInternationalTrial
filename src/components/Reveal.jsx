import { createElement, useEffect, useRef } from 'react'
import { gsap, reduced, splitChars } from '../lib/gsap'
export { EditorialReveal } from './EditorialReveal'

/* E7 Dilate — smooth luxury upward reveal without bounce or scale */
export function Dilate({ as = 'div', className = '', delay = 0, children, style, ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    if (reduced()) return
    if (!ref.current) return

    gsap.set(ref.current, { opacity: 0, y: 22 })

    const tw = gsap.to(ref.current, {
      y: 0, opacity: 1,
      duration: 0.85, delay, ease: 'power3.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 95%',
        toggleActions: 'play none none none',
        once: true
      },
      onComplete: () => {
        gsap.set(ref.current, { clearProps: 'transform' })
      }
    })

    if (tw.scrollTrigger && tw.scrollTrigger.progress > 0) {
      tw.play()
    }

    return () => { tw.scrollTrigger?.kill(); tw.kill() }
  }, [delay])
  return createElement(as, { ref, className, style, ...rest }, children)
}

/* Premium Luxury Text Cascade — smooth subtle upward fade without bounce or scale */
export function CharCascade({ as = 'h2', className = '', delay = 0, children, id, style, ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    if (reduced()) return
    if (!ref.current) return

    gsap.set(ref.current, { opacity: 0, y: 22 })

    const tw = gsap.to(ref.current, {
      y: 0, opacity: 1,
      duration: 0.85, delay, ease: 'power3.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 95%',
        toggleActions: 'play none none none',
        once: true
      },
      onComplete: () => {
        gsap.set(ref.current, { clearProps: 'transform' })
      }
    })

    if (tw.scrollTrigger && tw.scrollTrigger.progress > 0) {
      tw.play()
    }

    return () => { tw.scrollTrigger?.kill(); tw.kill() }
  }, [delay, children])

  return createElement(as, { ref, className, id, style, ...rest }, children)
}

/* Minimal & smooth scroll-triggered reveal for body copy & secondary homepage texts */
export function SmoothReveal({ as = 'div', className = '', delay = 0, children, style, ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    if (reduced()) return
    if (!ref.current) return

    gsap.set(ref.current, { opacity: 0, y: 20 })

    const tw = gsap.to(ref.current, {
      y: 0, opacity: 1,
      duration: 0.8, delay, ease: 'power3.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 95%',
        toggleActions: 'play none none none',
        once: true
      },
      onComplete: () => {
        gsap.set(ref.current, { clearProps: 'transform' })
      }
    })

    if (tw.scrollTrigger && tw.scrollTrigger.progress > 0) {
      tw.play()
    }

    return () => { tw.scrollTrigger?.kill(); tw.kill() }
  }, [delay])

  return createElement(as, { ref, className, style, ...rest }, children)
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
