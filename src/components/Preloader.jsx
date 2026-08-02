import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reduced } from '../lib/gsap'
import { getLenis } from '../lib/useLenis'
import { BRAND } from '../data/site'

/* E5 Coalesce — five beads of metal slide to centre, merge through the goo
   filter, stretch into the wordmark's box and resolve as the letters snap
   sharp. No counting number, no accent sweep, no split. ~2.2s. */
const SPOTS = [
  [46, 84], [274, 62], [62, 252], [252, 240], [160, 36],
]

export default function Preloader() {
  const [gone, setGone] = useState(reduced())
  const root = useRef(null)
  const pillEl = useRef(null)
  const word = useRef(null)
  const circles = useRef([])

  useEffect(() => {
    if (reduced()) return
    getLenis()?.stop()
    const wordW = word.current.offsetWidth + 48
    const tl = gsap.timeline({
      onComplete() {
        setGone(true)
        getLenis()?.start()
        ScrollTrigger.refresh()
      },
    })
    tl.to(circles.current, {
      attr: { cx: 160, cy: 160 },
      duration: 0.95, ease: 'viscous', stagger: 0.06,
    })
      .to(circles.current, { attr: { r: 26 }, duration: 0.4, ease: 'surge' }, '-=0.3')
      .to(pillEl.current, { opacity: 1, duration: 0.18 }, '-=0.1')
      .to(circles.current, { opacity: 0, duration: 0.2 }, '<')
      .to(pillEl.current, { width: wordW, duration: 0.5, ease: 'surge' }, '<')
      .to(word.current, { opacity: 1, filter: 'blur(0px)', duration: 0.45, ease: 'fluid' }, '-=0.25')
      .to(pillEl.current, { opacity: 0, duration: 0.35 }, '-=0.1')
      .to(root.current, { opacity: 0, duration: 0.45, ease: 'fluid' }, '+=0.25')
    return () => tl.kill()
  }, [])

  if (gone) return null
  return (
    <div className="preload" ref={root} aria-hidden="true">
      <div className="pre-stack">
        <svg width="320" height="320">
          <defs>
            <filter id="goo-pre">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b" />
              <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="g" />
              <feComposite in="SourceGraphic" in2="g" operator="atop" />
            </filter>
          </defs>
          <g filter="url(#goo-pre)">
            {SPOTS.map((s, i) => (
              <circle key={i} ref={(el) => (circles.current[i] = el)} cx={s[0]} cy={s[1]} r={i === 4 ? 10 : 14} />
            ))}
          </g>
        </svg>
        <div className="pre-pill" ref={pillEl} />
        <div className="pre-word" ref={word}>{BRAND.mark}</div>
      </div>
    </div>
  )
}
