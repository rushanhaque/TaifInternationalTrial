import { useEffect, useRef } from 'react'
import { gsap, reduced, coarse } from '../lib/gsap'
import { BRAND } from '../data/site'
import { HERO_IMG } from '../data/images'

/* ── E18 · THE SEAM ────────────────────────────────────────────────────────
   Every glyph of the mark carries two fills: polished brass above, walnut
   grain below, blended into each other where they meet. "Where Metal Meets
   Grain", rendered literally inside the wordmark.

   LOAD    The letters seat themselves like inlay pieces being tapped home,
           then INTERNATIONAL tracks open beneath.
   SCROLL  The name shears apart along the seam — brass halves slide left,
           grain halves slide right, tapering and softening as they go, like
           an inlay being slid open — and the tagline surfaces in the gap.

   FAIL-OPEN: both halves rest fully opaque and unshifted in CSS, so with no
   JS the wordmark is simply whole. Motion only ever takes it apart. */

const MARK_CHARS = BRAND.mark.split('')

export default function HeroBrand() {
  const root = useRef(null)
  const stage = useRef(null)
  const mark = useRef(null)
  const intl = useRef(null)
  const tag = useRef(null)
  const foot = useRef(null)

  /* let the pour begin as the preloader drains on a cold load */
  const introDelay = performance.now() < 3500 && !reduced() ? 1.45 : 0.1

  /* ── the pour ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (reduced()) return undefined
    const chars = gsap.utils.toArray(mark.current.querySelectorAll('.hb-ch'))

    const tl = gsap.timeline({ delay: introDelay })

    /* each letter seats itself like an inlay piece tapped into its channel */
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

  /* ── the drain ────────────────────────────────────────────────────────── */
  useEffect(() => {
    const mm = gsap.matchMedia()

    /* Clear the properties outright rather than tweening back to a remembered
       value — both breakpoint branches write to the same nodes, so a value
       left by one must never become the other's resting state. */
    const resetMark = () => {
      const metals = root.current?.querySelectorAll('.hb-ch-metal')
      const woods = root.current?.querySelectorAll('.hb-ch-wood')
      if (metals?.length) gsap.set(metals, { clearProps: 'all' })
      if (woods?.length) gsap.set(woods, { clearProps: 'all' })
      if (intl.current) gsap.set(intl.current, { clearProps: 'all' })
      if (foot.current) gsap.set(foot.current, { clearProps: 'all' })
      if (stage.current) gsap.set(stage.current, { clearProps: 'all' })
      const bg = root.current?.querySelector('.hb-bg')
      /* only the transform props GSAP touched — clearProps:'all' would also
         wipe the --hero-image variable that lives on this element */
      if (bg) gsap.set(bg, { clearProps: 'yPercent,scale,transform' })
      if (tag.current) gsap.set(tag.current, { autoAlpha: 0, y: 18 })
    }

    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const metals = root.current.querySelectorAll('.hb-ch-metal')
      const woods = root.current.querySelectorAll('.hb-ch-wood')
      const shift = () => window.innerWidth * 0.34
      gsap.set(tag.current, { autoAlpha: 0, y: 18 })

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

      /* fromTo, not to: with invalidateOnRefresh a to() re-reads its start
         values from whatever is on screen when a refresh fires, and refresh
         can fire mid-scroll. An explicit `from` keeps the rest state fixed. */
      /* the halves taper and soften as they part, so it reads as one object
         being pulled open rather than two graphics sliding apart */
      tl.fromTo(metals,
        { x: 0, scaleX: 1, scaleY: 1, filter: 'blur(0px)', opacity: 1, transformOrigin: '100% 50%' },
        {
          x: () => -shift(), scaleX: 1.28, scaleY: 0.92,
          filter: 'blur(2px)', opacity: 0, transformOrigin: '100% 50%',
          duration: 1, ease: 'power2.out', immediateRender: false,
        }, 0)
        .fromTo(woods,
          { x: 0, scaleX: 1, scaleY: 1, filter: 'blur(0px)', opacity: 1, transformOrigin: '0% 50%' },
          {
            x: () => shift(), scaleX: 1.28, scaleY: 0.92,
            filter: 'blur(2px)', opacity: 0, transformOrigin: '0% 50%',
            duration: 1, ease: 'power2.out', immediateRender: false,
          }, 0)
        .fromTo(intl.current,
          { opacity: 1, y: 0 },
          { opacity: 0, y: 14, duration: 0.34, ease: 'power2.out', immediateRender: false }, 0.08)
        .fromTo(tag.current,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.36, ease: 'fluid', immediateRender: false }, 0.22)
        .fromTo(foot.current,
          { opacity: 1 },
          { opacity: 0, duration: 0.26, ease: 'power2.out', immediateRender: false }, 0.1)
        .fromTo(stage.current,
          { yPercent: 0 },
          { yPercent: -9, duration: 1, ease: 'none', immediateRender: false }, 0)
        /* the photograph drifts slower than the page — depth */
        .fromTo('.hb-bg',
          { yPercent: 0, scale: 1 },
          { yPercent: 12, scale: 1.06, duration: 1, ease: 'none', immediateRender: false }, 0)

      return () => { tl.scrollTrigger?.kill(); tl.kill(); resetMark() }
    })

    /* mobile — the same drain, lighter and unpinned */
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

  /* ── the raking light ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (reduced() || coarse()) return undefined
    const el = root.current
    const markEl = mark.current
    if (!el || !markEl) return undefined

    /* one quickTo per property, so pointer moves never allocate a tween */
    const xTo = gsap.quickTo(markEl, 'x', { duration: 0.9, ease: 'fluid' })
    const iTo = gsap.quickTo(intl.current, 'x', { duration: 1.1, ease: 'fluid' })

    const onMove = (e) => {
      const n = e.clientX / window.innerWidth - 0.5
      xTo(n * 16)
      iTo(n * -7)
    }
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
