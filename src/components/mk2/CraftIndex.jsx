import { useEffect, useRef } from 'react'
import { gsap, reduced } from '../../lib/gsap'
import { TOOLING_TERMS } from '../../data/site'
import Button from '../Button'

/* ═══════════════════════════════════════════════════════════════════════════
   mk2 · CraftIndex — the vocabulary of the workshop.

   An index page, set as one. Ten terms in display type, hairline-ruled,
   numbered in the margin, resting at low contrast so the block reads as a
   texture of words before it reads as a list.

   Engage a row — pointer or keyboard — and four things happen at once:
     · the term snaps from the resting taupe to full ink
     · a brass rule sweeps the row left to right, trailed by a warm wash
     · the term and its numeral nudge right, the numeral by less (parallax)
     · the definition slides in from the right edge

   And on the spine — the hairline down the left margin — a brass marker
   tracks the engaged row on a surge curve. That marker is the only piece of
   this section driven from JS; everything else is CSS, which is deliberate.

   FAIL-OPEN CONTRACT
     · Terms, numerals, floor tags and definitions all rest VISIBLE in CSS.
     · The hover disclosure of the definition exists only inside
       `(hover:hover) and (min-width:1040px) and (prefers-reduced-motion:
       no-preference)`. Touch, narrow, and reduced-motion visitors get both
       lines printed permanently — no interaction required, nothing to find.
     · GSAP seeds hidden states from JS only, inside a matchMedia context
       that reverts them on unmount. If the bundle never runs, the index is
       a finished index.
     · GSAP and CSS never touch the same property on the same node: GSAP owns
       `.cix-line` yPercent, `.cix-no` opacity, `.cix-def` opacity/y; CSS owns
       `.cix-mask` translate, `.cix-no` translate, `.cix-def-t` translate.
       Inline styles beat stylesheets, so this separation is load-bearing.
   ═══════════════════════════════════════════════════════════════════════════ */

const FLOOR_LABEL = {
  metal: 'Metal floor',
  wood: 'Wood floor',
  both: 'Both floors',
}

/* Keyed off the term string rather than the index, so re-ordering or trimming
   TOOLING_TERMS in data/site.js cannot silently pair a word with the wrong
   definition. Anything unglossed falls through to FALLBACK rather than
   rendering an empty row. */
const GLOSS = {
  'Chasing punch': {
    floor: 'metal',
    def: 'Shapes metal from the front. Repoussé works the same piece from behind; between them you get relief.',
  },
  'Raising stake': {
    floor: 'metal',
    def: 'The shaped anvil a flat disc is hammered down onto until it is a bowl. Around four hundred blows, one pair of hands.',
  },
  'Buffing mop': {
    floor: 'both',
    def: 'Cotton wheel, tripoli compound, 2,800 rpm. It flatters a good surface and exposes a lazy one. Nothing hides under a shine.',
  },
  'Rasp & file': {
    floor: 'both',
    def: 'Coarse, then medium, then fine, in that order. Skip a grade to save ten minutes and it shows under lacquer for good.',
  },
  'Kiln schedule': {
    floor: 'wood',
    def: 'Temperature and humidity plotted against days, written per species. Sheesham and mango do not dry on the same curve, so they do not share a chamber.',
  },
  'Jali fret saw': {
    floor: 'wood',
    def: 'Cuts pierced lattice by hand. The blade is unthreaded and re-threaded through a drilled hole for every opening in the panel.',
  },
  'Seasoning yard': {
    floor: 'wood',
    def: 'Where timber waits. Rushing this stage is the single most common way a wooden object fails.',
  },
  'Moisture meter': {
    floor: 'wood',
    def: 'The least glamorous tool on either floor, and the one that decides whether a panel survives a winter.',
  },
  'Foundry ladle': {
    floor: 'metal',
    def: 'Carries brass at 1,050 °C from furnace to mould. The pour is one unbroken movement, or the casting comes out with a cold shut.',
  },
  'Lacquer booth': {
    floor: 'both',
    def: 'Filtered air, extraction overhead, humidity held steady. Colour is the last thing anyone sees, so it is not left to the weather.',
  },
}

const FALLBACK = {
  floor: 'both',
  def: 'A term of the trade. Ask the export desk and you will get the long version.',
}

const ENTRIES = TOOLING_TERMS.map((term, i) => {
  const g = GLOSS[term] || FALLBACK
  return { term, no: String(i + 1).padStart(2, '0'), floor: g.floor, def: g.def }
})

/* The spine marker is a fine-pointer, wide-viewport, motion-permitted luxury.
   Below any of those thresholds it is not rendered at all and this never runs. */
const canTrack = () =>
  !reduced() && window.matchMedia('(hover: hover) and (min-width: 1040px)').matches

export default function CraftIndex() {
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const cursorRef = useRef(null)
  const activeRef = useRef(null)

  /* ── entrance: masked line-rise, one ScrollTrigger per row ──────────────
     A single staggered tween would fire the bottom five rows off-screen —
     the block is ~1,300px tall. Per-row triggers turn the cascade over to
     the reader's own scroll, which is the whole point of an index. */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tweens = []
      const rows = gsap.utils.toArray(root.querySelectorAll('.cix-row'))
      const spine = root.querySelector('.cix-spine')

      gsap.set(root.querySelectorAll('.cix-line'), { yPercent: 116 })
      gsap.set(root.querySelectorAll('.cix-no'), { opacity: 0 })
      gsap.set(root.querySelectorAll('.cix-def'), { opacity: 0, y: 12 })

      if (spine) {
        gsap.set(spine, { scaleY: 0, transformOrigin: 'top center' })
        tweens.push(
          gsap.to(spine, {
            scaleY: 1,
            duration: 1.2,
            ease: 'viscous',
            scrollTrigger: { trigger: listRef.current, start: 'top 88%', once: true },
          })
        )
      }

      rows.forEach((row) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: row, start: 'top 90%', once: true },
        })
        tl.to(row.querySelector('.cix-line'), {
          yPercent: 0,
          duration: 1.05,
          ease: 'atelys',
        }, 0)
          .to(row.querySelector('.cix-no'), {
            opacity: 1,
            duration: 0.7,
            ease: 'fluid',
          }, 0.1)
          .to(row.querySelector('.cix-def'), {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'atelys',
          }, 0.16)
        tweens.push(tl)
      })

      return () => {
        tweens.forEach((t) => {
          t.scrollTrigger?.kill()
          t.kill()
        })
      }
    })

    return () => mm.revert()
  }, [])

  /* the marker's tweens are born in event handlers, outside the matchMedia
     context, so they are killed by hand */
  useEffect(() => () => {
    if (cursorRef.current) gsap.killTweensOf(cursorRef.current)
  }, [])

  function mark(e) {
    const cur = cursorRef.current
    if (!cur || !canTrack()) return
    const row = e.target?.closest?.('.cix-row')
    if (!row || row === activeRef.current) return

    const first = activeRef.current === null
    activeRef.current = row
    /* offsetTop is read against .cix-list, which is positioned — so this stays
       correct through resize and reflow without a single listener */
    const y = row.offsetTop + (row.offsetHeight - cur.offsetHeight) / 2

    if (first) gsap.set(cur, { y })
    gsap.to(cur, {
      y,
      opacity: 1,
      duration: first ? 0.42 : 0.62,
      ease: first ? 'fluid' : 'surge',
      overwrite: 'auto',
    })
  }

  function clear() {
    const cur = cursorRef.current
    if (!cur) return
    activeRef.current = null
    gsap.to(cur, { opacity: 0, duration: 0.38, ease: 'fluid', overwrite: 'auto' })
  }

  /* tabbing row to row fires blur before focus — bail out while focus is
     still inside the list so the marker glides instead of blinking */
  function onListBlur(e) {
    if (e.relatedTarget && listRef.current?.contains(e.relatedTarget)) return
    clear()
  }

  return (
    <section className="cix section" ref={rootRef} aria-labelledby="cix-h">
      <div className="wrap">
        <div className="sec-head">
          <span className="meta">Craft index</span>
          <span className="meta cix-count">{ENTRIES.length} terms · two floors</span>
        </div>

        <div className="grid cix-top">
          <div className="sp-7">
            <h2 className="d1" id="cix-h">Ten words that decide the object.</h2>
          </div>
          <div className="sp-5 cix-top-r">
            <p className="lede">
              A workshop runs on about forty words. These ten decide most of
              what leaves the floor — set down in plain English, because a spec
              sheet you cannot read is not a spec sheet.
            </p>
          </div>
        </div>

        <dl
          className="cix-list"
          ref={listRef}
          onMouseOver={mark}
          onFocus={mark}
          onMouseLeave={clear}
          onBlur={onListBlur}
        >
          <span className="cix-spine" aria-hidden="true" />
          <span className="cix-cursor" ref={cursorRef} aria-hidden="true" />

          {ENTRIES.map((e) => (
            <div className="cix-row" key={e.term} data-floor={e.floor} tabIndex={0}>
              <dt className="cix-term">
                <span className="cix-no" aria-hidden="true">{e.no}</span>
                <span className="cix-mask">
                  <span className="cix-line">{e.term}</span>
                </span>
              </dt>
              <dd className="cix-def">
                <span className="cix-floor">{FLOOR_LABEL[e.floor]}</span>
                <span className="cix-def-t">{e.def}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="cix-foot">
          <p className="cix-fine">
            Metal words belong to Moradabad, wood words to Saharanpur. Almost
            nothing leaves here that did not need one from each list.
          </p>
          <Button to="/#the-turn" variant="ghost" small>
            The materials these are used on
          </Button>
        </div>
      </div>
    </section>
  )
}
