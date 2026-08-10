import { useEffect, useRef } from 'react'
import { gsap, reduced, coarse } from '../lib/gsap'
import { BRAND } from '../data/site'

/* the hero clip — swap this URL to change the landing-page backdrop */
const HERO_VIDEO = 'https://res.cloudinary.com/djszwbnxp/video/upload/v1786354702/IMG_0217_mkksta.mp4'

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
    const chars = mark.current ? gsap.utils.toArray(mark.current.querySelectorAll('.hb-ch')) : []

    const tl = gsap.timeline({ delay: introDelay })

    if (chars.length) {
      tl.fromTo(chars,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out', stagger: 0.08 })
    }
    if (intl.current) {
      tl.fromTo(intl.current,
        { opacity: 0, y: 15, letterSpacing: '0.2em' },
        { opacity: 1, y: 0, letterSpacing: '0.58em', duration: 0.9, ease: 'power3.out' }, '-=0.45')
    }
    if (foot.current) {
      tl.fromTo(foot.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }, '-=0.55')
    }

    return () => tl.kill()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── the drain ────────────────────────────────────────────────────────── */
  useEffect(() => {
    const mm = gsap.matchMedia()

    const resetMark = () => {
      const metals = root.current?.querySelectorAll('.hb-ch-metal')
      const woods = root.current?.querySelectorAll('.hb-ch-wood')
      if (metals?.length) gsap.set(metals, { clearProps: 'all' })
      if (woods?.length) gsap.set(woods, { clearProps: 'all' })
      if (intl.current) gsap.set(intl.current, { clearProps: 'all' })
      if (foot.current) gsap.set(foot.current, { clearProps: 'all' })
      if (stage.current) gsap.set(stage.current, { clearProps: 'all' })
      const bg = root.current?.querySelector('.hb-bg')
      if (bg) gsap.set(bg, { clearProps: 'yPercent,scale,transform' })
      if (tag.current) gsap.set(tag.current, { autoAlpha: 1, y: 0 })
    }

    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const metals = root.current?.querySelectorAll('.hb-ch-metal')
      const woods = root.current?.querySelectorAll('.hb-ch-wood')
      const shift = () => window.innerWidth * 0.34
      if (tag.current) gsap.set(tag.current, { autoAlpha: 1, y: 0 })

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

      if (metals?.length) {
        tl.fromTo(metals,
          { x: 0, scaleX: 1, scaleY: 1, filter: 'blur(0px)', opacity: 1, transformOrigin: '100% 50%' },
          {
            x: () => -shift(), scaleX: 1.28, scaleY: 0.92,
            filter: 'blur(2px)', opacity: 0, transformOrigin: '100% 50%',
            duration: 1, ease: 'power2.out', immediateRender: false,
          }, 0)
      }
      if (woods?.length) {
        tl.fromTo(woods,
          { x: 0, scaleX: 1, scaleY: 1, filter: 'blur(0px)', opacity: 1, transformOrigin: '0% 50%' },
          {
            x: () => shift(), scaleX: 1.28, scaleY: 0.92,
            filter: 'blur(2px)', opacity: 0, transformOrigin: '0% 50%',
            duration: 1, ease: 'power2.out', immediateRender: false,
          }, 0)
      }
      if (tag.current) {
        tl.fromTo(tag.current,
          { autoAlpha: 1, y: 0 },
          { autoAlpha: 1, y: 0, duration: 0.36, ease: 'fluid', immediateRender: false }, 0.22)
      }
      if (foot.current) {
        tl.fromTo(foot.current,
          { opacity: 1 },
          { opacity: 0, duration: 0.26, ease: 'power2.out', immediateRender: false }, 0.1)
      }

      return () => { tl.scrollTrigger?.kill(); tl.kill(); resetMark() }
    })

    return () => mm.revert()
  }, [])

  return (
    <section className="hero-brand" ref={root}>
      <h1 className="sr-only">
        {BRAND.name} — {BRAND.line}
      </h1>
      {/* Ambient workshop footage behind the wordmark, and nothing else — no
          poster frame, no photographic fallback: the clip is the landing page.
          Muted + loop + inline so it autoplays everywhere. Reduced-motion
          visitors get the same file held on its first frame rather than a
          different image, so the page never shows a photograph.
          The clip is the client's own Cloudinary asset — swap the URL above. */}
      <div className="hb-media" aria-hidden="true">
        <video
          className="hb-video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src={HERO_VIDEO}
        />
        <div className="hb-scrim" />
      </div>
      <div className="hb-stage" ref={stage}>
        {/* the visible tagline repeats the line already inside the sr-only h1
            above, so it is a paragraph — three competing h1s on the homepage
            left the document with no single title */}
        <p className="hb-tag-title" ref={tag}>{BRAND.line}</p>
      </div>
      <div className="hb-foot" ref={foot}>
        <span className="hb-hint meta" aria-hidden="true">Scroll<i /></span>
      </div>
    </section>
  )
}
