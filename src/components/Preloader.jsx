import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reduced } from '../lib/gsap'
import { getLenis } from '../lib/useLenis'
import { BRAND } from '../data/site'

/* E6 The Rising Curtain — a linen panel holding the wordmark, one line, one
   size, one font, and the tagline centred cleanly beneath it. It settles,
   holds, then lifts clean off the top of the viewport to unveil the page —
   the hero wordmark already timed to start its own pour right as the
   curtain departs (see HeroBrand's introDelay). ~2.3s, one held breath then
   gone. */
export default function Preloader() {
  const [gone, setGone] = useState(reduced())
  const root = useRef(null)
  const word = useRef(null)
  const rule = useRef(null)
  const tag = useRef(null)
  const glow = useRef(null)

  useEffect(() => {
    if (reduced()) return
    getLenis()?.stop()
    const tl = gsap.timeline({
      onComplete() {
        setGone(true)
        getLenis()?.start()
        ScrollTrigger.refresh()
      },
    })
    tl.fromTo(glow.current, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: 'fluid' }, 0)
      .fromTo(word.current,
        { y: 22, opacity: 0, letterSpacing: '0.02em' },
        { y: 0, opacity: 1, letterSpacing: '0.12em', duration: 0.85, ease: 'power3.out' }, 0.12)
      .fromTo(rule.current, { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: 'surge' }, 0.68)
      .fromTo(tag.current,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.82)
      // a held breath, then everything settles half a step before the lift
      .to([word.current, rule.current, tag.current, glow.current],
        { scale: 0.98, opacity: (i) => (i === 3 ? 0 : 0.82), duration: 0.35, ease: 'fluid' }, 1.38)
      .to(root.current, { yPercent: -100, duration: 0.92, ease: 'viscous' }, 1.48)
    return () => tl.kill()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (gone) return null
  return (
    <div className="preload" ref={root} aria-hidden="true">
      <div className="preload-glow" ref={glow} />
      <p className="preload-word" ref={word}>{BRAND.mark} {BRAND.suffix}</p>
      <span className="preload-rule" ref={rule} />
      <p className="preload-tag" ref={tag}>{BRAND.line}</p>
    </div>
  )
}
