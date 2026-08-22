import { useEffect, useRef } from 'react'
import { gsap, reduced } from '../lib/gsap'
import { BRAND } from '../data/site'
import { LANDING_VIDEO } from '../data/video'

/* ── E19 · THE WELCOME ────────────────────────────────────────────────────
   Three lines over the ambient footage — a small kicker, the big brand
   lockup, and the tagline — each fading up in its own beat, one after
   another, on load.

   LOAD    Welcome to → TAIF INTERNATIONAL → the tagline, each rising in
           with a slight overlap so the sequence reads as one continuous
           gesture rather than three separate cues.
   SCROLL  The whole stack fades and lifts away together as the hero leaves
           the top of the viewport, then restores if the visitor scrolls
           back up.

   FAIL-OPEN: all three lines rest fully opaque and in place in CSS, so with
   no JS the welcome is simply there. Motion only ever brings it in. */

export default function HeroBrand() {
  const root = useRef(null)
  const stage = useRef(null)
  const welcome = useRef(null)
  const mark = useRef(null)
  const tag = useRef(null)
  const foot = useRef(null)

  /* No held pause before the welcome. The lines begin rising while the
     preloader curtain is still travelling up, so the text is already in
     motion at the moment it is uncovered — one continuous arrival rather
     than a curtain, a gap, and then a separate animation. */
  const introDelay = performance.now() < 3500 && !reduced() ? 1.5 : 0.1

  /* ── the pour ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (reduced()) return undefined
    const tl = gsap.timeline({ delay: introDelay })

    /* Absolute start times rather than relative offsets: the three lines
       overlap heavily and deliberately, so the stack reads as one slow
       swell lifting into place instead of three separate cues firing in
       turn. Each line only fades up — opacity and a long, soft rise on a
       single long-tail curve, nothing else. */
    if (welcome.current) {
      tl.fromTo(welcome.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 2.1, ease: 'atelys' }, 0)
    }
    if (mark.current) {
      tl.fromTo(mark.current,
        { y: 44, opacity: 0 },
        { y: 0, opacity: 1, duration: 2.4, ease: 'atelys' }, 0.25)
    }
    if (tag.current) {
      tl.fromTo(tag.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 2.2, ease: 'atelys' }, 0.5)
    }
    if (foot.current) {
      tl.fromTo(foot.current,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 1.85, ease: 'atelys' }, 0.78)
    }

    return () => tl.kill()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── the drain ────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (reduced()) return undefined
    const mm = gsap.matchMedia()

    const resetStage = () => {
      if (stage.current) gsap.set(stage.current, { clearProps: 'all' })
      if (foot.current) gsap.set(foot.current, { clearProps: 'all' })
    }

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          invalidateOnRefresh: true,
          onLeaveBack: resetStage,
        },
      })

      if (stage.current) {
        tl.fromTo(stage.current,
          { autoAlpha: 1, y: 0 },
          { autoAlpha: 0, y: -40, duration: 1, ease: 'power2.out', immediateRender: false }, 0)
      }
      if (foot.current) {
        tl.fromTo(foot.current,
          { opacity: 1 },
          { opacity: 0, duration: 0.4, ease: 'power2.out', immediateRender: false }, 0)
      }

      return () => { tl.scrollTrigger?.kill(); tl.kill(); resetStage() }
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
          The clip is self-hosted — swap the paths above. */}
      <div className="hb-media" aria-hidden="true">
        <video
          className="hb-video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          ref={(el) => { if (el) el.setAttribute('muted', '') }}
        >
          {LANDING_VIDEO.map((s) => <source key={s.src} src={s.src} type={s.type} />)}
        </video>
        <div className="hb-scrim" />
      </div>
      <div className="hb-stage" ref={stage}>
        <p className="hb-welcome" ref={welcome}>Welcome to</p>
        <p className="hb-brand-name" ref={mark}>{BRAND.mark} {BRAND.suffix}</p>
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
