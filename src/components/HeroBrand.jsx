import { useEffect, useRef } from 'react'
import { gsap, reduced, coarse } from '../lib/gsap'
import { BRAND } from '../data/site'
import { HERO_IMG } from '../data/images'

/* E18 The Seam — the homepage hero is the brand name and nothing else.
   Each glyph of the mark carries two fills: polished brass above, walnut grain
   below, split by a glowing gold seam — "where metal meets grain" rendered
   literally inside the wordmark.

   Load: the letters seat themselves like inlay pieces, the seam draws across,
   INTERNATIONAL tracks open beneath.
   Scroll (pinned, desktop, motion-safe): the name shears apart along the seam —
   metal half slides left, grain half right, like an inlay slid open — the seam
   stretches full-bleed and the tagline surfaces in the gap, then the whole
   stage drifts up and the page continues.
   Fallback (<900px or reduced motion): static lockup, tagline visible, no pin.

   Background image: drop one in via `--hero-image` on .hero-brand (or :root),
   e.g.  --hero-image: url('/hero.jpg');  — the alabaster veil above it keeps
   the wordmark legible. */

const MARK_CHARS = BRAND.mark.split('')

export default function HeroBrand() {
  const root = useRef(null)
  const stage = useRef(null)
  const mark = useRef(null)
  const intl = useRef(null)
  const tag = useRef(null)
  const foot = useRef(null)

  /* let the letters seat just as the preloader drains on first load */
  const introDelay = performance.now() < 3500 && !reduced() ? 1.55 : 0.1

  /* load — seat the letters, open the tracking */
  useEffect(() => {
    if (reduced()) return
    const chars = mark.current.querySelectorAll('.hb-ch')
    const tl = gsap.timeline({ delay: introDelay })
    tl.fromTo(chars,
      { y: '24%', opacity: 0, scaleY: 1.16, transformOrigin: '50% 100%' },
      { y: 0, opacity: 1, scaleY: 1, duration: 0.85, ease: 'surge', stagger: 0.08 })
      .fromTo(intl.current,
        { opacity: 0, letterSpacing: '0.2em' },
        { opacity: 1, letterSpacing: '0.58em', duration: 0.9, ease: 'fluid' }, '-=0.45')
      .fromTo(foot.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6 }, '-=0.55')
    return () => tl.kill()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* scroll — the shear (pinned, motion-safe desktop only) */
  useEffect(() => {
    const mm = gsap.matchMedia()

    /* Hard reset to the wordmark's rest state. Both breakpoint branches
       write inline styles to the same nodes, so if one branch ever runs
       (a narrow measurement during boot, a resize across 900px) its end
       values can survive into the other and leave the letters stranded
       translucent. Clearing the properties outright — rather than tweening
       back to a remembered value — is the only reset that cannot inherit
       someone else's leftovers. */
    const resetMark = () => {
      const metals = root.current?.querySelectorAll('.hb-ch-metal')
      const woods = root.current?.querySelectorAll('.hb-ch-wood')
      if (metals?.length) gsap.set(metals, { clearProps: 'all' })
      if (woods?.length) gsap.set(woods, { clearProps: 'all' })
      if (intl.current) gsap.set(intl.current, { clearProps: 'all' })
      if (foot.current) gsap.set(foot.current, { clearProps: 'all' })
      const bg = root.current?.querySelector('.hb-bg')
      /* Only clear the transform properties GSAP animated — NOT 'all'.
         clearProps:'all' would also wipe the --hero-image inline CSS variable
         that lives on this element, making the background disappear. */
      if (bg) gsap.set(bg, { clearProps: 'yPercent,scale,transform' })
      if (tag.current) gsap.set(tag.current, { autoAlpha: 0, y: 18 })
    }

    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const metals = root.current.querySelectorAll('.hb-ch-metal')
      const woods = root.current.querySelectorAll('.hb-ch-wood')
      gsap.set(tag.current, { autoAlpha: 0, y: 18 })

      const shift = () => window.innerWidth * 0.34
      /* unpinned: the hero is exactly one screen tall and the shear plays
         as it scrolls away, so the next section arrives immediately after */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.1,
          invalidateOnRefresh: true,
          onLeaveBack: resetMark,
        },
      })
      /* elastic stretch — halves taper horizontally as they slide, with soft
         blur + opacity fade so the letters are pulled apart like taffy.

         These are fromTo() rather than to() on purpose. With
         `invalidateOnRefresh`, a to() tween re-reads its START values from
         whatever is on screen at refresh time — and refresh can fire while
         the user is already scrolled down (fonts settling, the position-card
         stack arming). That baked the sheared-apart state in as the origin,
         so scrolling back up never restored the wordmark. An explicit `from`
         makes the rest position deterministic. */
      tl.fromTo(metals,
        { x: 0, scaleX: 1, scaleY: 1, filter: 'blur(0px)', opacity: 1, transformOrigin: '100% 50%' },
        {
          x: () => -shift(),
          scaleX: 1.28, scaleY: 0.92,
          filter: 'blur(2px)',
          opacity: 0,
          transformOrigin: '100% 50%',
          duration: 1, ease: 'power2.out', immediateRender: false,
        }, 0)
        .fromTo(woods,
          { x: 0, scaleX: 1, scaleY: 1, filter: 'blur(0px)', opacity: 1, transformOrigin: '0% 50%' },
          {
            x: () => shift(),
            scaleX: 1.28, scaleY: 0.92,
            filter: 'blur(2px)',
            opacity: 0,
            transformOrigin: '0% 50%',
            duration: 1, ease: 'power2.out', immediateRender: false,
          }, 0)
        .fromTo(intl.current,
          { opacity: 1, y: 0 },
          { opacity: 0, y: 12, duration: 0.3, ease: 'power2.out', immediateRender: false }, 0.05)
        .fromTo(tag.current,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.35, ease: 'fluid', immediateRender: false }, 0.2)
        .fromTo(foot.current,
          { opacity: 1 },
          { opacity: 0, duration: 0.25, ease: 'power2.out', immediateRender: false }, 0.1)
        /* the photograph drifts up slower than the page — depth */
        .fromTo('.hb-bg',
          { yPercent: 0, scale: 1 },
          { yPercent: 12, scale: 1.06, duration: 1, ease: 'none', immediateRender: false }, 0)

      /* The position card's slide-up is owned by SectionStack — it makes the
         hero sticky and drives the card over it. An earlier duplicate here
         animated the same element's opacity/transform and fought with it. */

      return () => { tl.scrollTrigger?.kill(); tl.kill(); resetMark() }
    })

    /* mobile — the same shear, unpinned and lighter: as the hero scrolls
       away the halves part, the tagline surfaces, everything fades. */
    mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
      const metals = root.current.querySelectorAll('.hb-ch-metal')
      const woods = root.current.querySelectorAll('.hb-ch-wood')
      gsap.set(tag.current, { autoAlpha: 0, y: 14 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom 35%',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onLeaveBack: resetMark,
        },
      })
      /* fromTo for the same reason as desktop — a refresh mid-scroll must
         not become the new rest position */
      tl.fromTo(metals, { xPercent: 0, opacity: 1 },
        { xPercent: -16, opacity: 0.15, duration: 0.7, ease: 'power1.in', immediateRender: false }, 0)
        .fromTo(woods, { xPercent: 0, opacity: 1 },
          { xPercent: 16, opacity: 0.15, duration: 0.7, ease: 'power1.in', immediateRender: false }, 0)
        .fromTo(tag.current, { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.3, ease: 'fluid', immediateRender: false }, 0.1)
        .fromTo(intl.current, { opacity: 1 },
          { opacity: 0.25, duration: 0.5, immediateRender: false }, 0.15)
        .fromTo(foot.current, { opacity: 1 },
          { opacity: 0, duration: 0.3, immediateRender: false }, 0.3)
      return () => { tl.scrollTrigger?.kill(); tl.kill(); resetMark() }
    })

    return () => mm.revert()
  }, [])

  /* pointer — a breath of parallax; the mark and its caption counter-drift */
  useEffect(() => {
    if (reduced() || coarse()) return
    const xTo = gsap.quickTo(mark.current, 'x', { duration: 0.9, ease: 'fluid' })
    const iTo = gsap.quickTo(intl.current, 'x', { duration: 1.1, ease: 'fluid' })
    const onMove = (e) => {
      const n = e.clientX / window.innerWidth - 0.5
      xTo(n * 18)
      iTo(n * -8)
    }
    const el = root.current
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section className="hero-brand" ref={root}>
      <h1 className="sr-only">
        {BRAND.name} — metal &amp; wood handicraft manufacture and export, {BRAND.origin.replace(' · ', ', ')}
      </h1>
      <div className="hb-bg" aria-hidden="true" style={{ '--hero-image': `url('${HERO_IMG}')` }} />
      <div className="hb-stage" ref={stage}>
        <div className="hb-mark" ref={mark} aria-hidden="true">
          {MARK_CHARS.map((c, i) => (
            <span key={i} className="hb-ch">
              <span className="hb-ch-wood">{c}</span>
              <span className="hb-ch-metal">{c}</span>
            </span>
          ))}
        </div>
        <p className="hb-intl" ref={intl} aria-hidden="true">{BRAND.suffix}</p>
        <p className="hb-tag meta" ref={tag}>{BRAND.line}</p>
      </div>
      <div className="hb-foot" ref={foot}>
        <span className="meta hb-side">Est. {BRAND.est} · {BRAND.origin.replace(' · ', ', ')}</span>
        <span className="hb-hint meta" aria-hidden="true">Scroll<i /></span>
        <span className="meta hb-side">{BRAND.descriptor}</span>
      </div>
    </section>
  )
}
