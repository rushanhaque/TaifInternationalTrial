import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap, ScrollTrigger, reduced } from '../lib/gsap'
import { getLenis } from '../lib/useLenis'
import { BRAND } from '../data/site'
import { CharCascade, Dilate } from '../components/Reveal'

/* ── THE FINE PRINT ─────────────────────────────────────────────────────────
   A terms page is not read; it is CONSULTED. A buyer's lawyer wants to send a
   colleague to one clause, and a buyer in a dispute wants to point at the
   sentence that settles it. So every clause is numbered and deep-linkable,
   the index lists all of them rather than the two headings above them, and
   the reference travels in the URL.

   The clause numbers come from the data's own position, so inserting a clause
   renumbers everything below it automatically and the index can never drift
   out of step with the document. */

const DOC = [
  {
    id: 'terms',
    label: 'Terms of trade',
    clauses: [
      ['quotes', 'Quotes & orders', 'Quotes are valid for 30 days and include tooling, unit price and a dated production slot. An order is confirmed on receipt of a signed quote and the agreed advance.'],
      ['tolerances', 'Tolerances & variation', 'Dimensional tolerances are stated per drawing; unless agreed otherwise, hand-formed work holds ±0.5 mm and machined features ±0.2 mm. Grain, patina and hammer texture vary between pieces by nature — the approved physical sample, not the photograph, defines the acceptable range.'],
      ['delivery', 'Delivery', 'Goods ship FOB Nhava Sheva unless otherwise agreed. Risk passes per the agreed incoterm. Dated slots are commitments: if we miss one by more than five working days, the freight upgrade is at our cost.'],
      ['claims', 'Claims', 'Visible defects must be notified within 14 days of receipt with photographs; a root-cause report and a replacement plan follow within five working days.'],
    ],
  },
  {
    id: 'privacy',
    label: 'Privacy policy',
    clauses: [
      ['collect', 'What we collect', 'Contact details you send us, drawings and briefs you share, and standard server logs. No analytics trackers, no advertising pixels, no cookies beyond what the browser needs.'],
      ['use', 'How it is used', 'To quote, manufacture and ship your work, and for nothing else. Drawings are held under NDA by default and never shown to another client.'],
      ['retention', 'Retention', 'Commercial records are kept for seven years to meet Indian tax law. Briefs that do not become orders are deleted after twelve months on request.'],
      ['rights', 'Your rights', `Write to ${BRAND.email} to access, correct or erase your data. We reply within 30 days.`],
    ],
  },
]

export default function LegalPage() {
  const [active, setActive] = useState('terms')
  const [copied, setCopied] = useState(null)
  const listRef = useRef(null)
  const pillEl = useRef(null)
  const fillEl = useRef(null)
  const bodyRef = useRef(null)

  /* flat, numbered, in document order — one source for index and body */
  const flat = useMemo(
    () => DOC.flatMap((s, si) =>
      s.clauses.map(([id, head, copy], ci) => ({
        key: `${s.id}-${id}`, no: `${si + 1}.${ci + 1}`, head, copy, section: s.id,
      }))
    ),
    []
  )

  /* mark the clause the reader is actually in */
  useEffect(() => {
    const sts = flat.map((c) =>
      ScrollTrigger.create({
        trigger: `#${c.key}`,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle(self) { if (self.isActive) setActive(c.key) },
      })
    )
    return () => sts.forEach((st) => st.kill())
  }, [flat])

  /* reading progress: how far through the document, not the page — the hero
     and footer are not part of what there is to read */
  useEffect(() => {
    if (!bodyRef.current || !fillEl.current) return undefined
    const st = ScrollTrigger.create({
      trigger: bodyRef.current,
      start: 'top 60%',
      end: 'bottom 80%',
      onUpdate(self) {
        gsap.set(fillEl.current, { scaleY: self.progress })
      },
    })
    return () => st.kill()
  }, [])

  useEffect(() => {
    const link = listRef.current?.querySelector(`a[href="#${active}"]`)
    if (!link || !pillEl.current) return
    gsap.to(pillEl.current, {
      y: link.offsetTop, height: link.offsetHeight, opacity: 1,
      duration: reduced() ? 0 : 0.5, ease: 'surge',
    })
  }, [active])

  const jump = (key) => (e) => {
    const l = getLenis()
    if (!l) return
    e.preventDefault()
    l.scrollTo(`#${key}`, { offset: -110 })
    window.history.replaceState({}, '', `#${key}`)
  }

  /* a clause you can send someone. The URL is the whole point of numbering.

     The two outcomes are reported differently ON PURPOSE. Clipboard writes
     fail on insecure origins and under denied permissions; saying "Copied"
     when nothing reached the clipboard would send the reader to paste
     something that is not there. The fallback puts the anchor in the address
     bar and says so. */
  const cite = (key) => async () => {
    const url = `${window.location.origin}${window.location.pathname}#${key}`
    const flash = (state) => {
      setCopied({ key, state })
      setTimeout(() => setCopied((c) => (c?.key === key ? null : c)), 1800)
    }
    try {
      await navigator.clipboard.writeText(url)
      flash('copied')
    } catch (_) {
      window.history.replaceState({}, '', `#${key}`)
      flash('linked')
    }
  }

  return (
    <>
      <section className="page-hero wrap">
        <p className="hero-kicker"><span className="idx">1.3</span> <span className="meta">Legal</span></p>
        <CharCascade as="h1" className="mega">The fine print.</CharCascade>
        <Dilate>
          <p className="lede">
            Eight clauses, numbered so they can be cited. Every one links to
            itself — send a colleague the clause, not the page.
          </p>
        </Dilate>
      </section>

      <section className="section alt">
        <div className="wrap grid legal-grid">
          <nav className="sp-3 legal-index" aria-label="Legal contents" ref={listRef}>
            {/* the rail fills as the document is read */}
            <span className="lg-rail" aria-hidden="true">
              <span className="lg-rail-fill" ref={fillEl} />
            </span>
            <span className="tg-pill legal-pill" ref={pillEl} aria-hidden="true" />
            {DOC.map((s, si) => (
              <div className="lg-group" key={s.id}>
                <span className="lg-group-head meta">{si + 1} · {s.label}</span>
                {s.clauses.map(([id, head], ci) => {
                  const key = `${s.id}-${id}`
                  return (
                    <a
                      key={key}
                      href={`#${key}`}
                      className={active === key ? 'on' : ''}
                      onClick={jump(key)}
                    >
                      <span className="lg-no">{si + 1}.{ci + 1}</span>
                      <span>{head}</span>
                    </a>
                  )
                })}
              </div>
            ))}
          </nav>

          <div className="sp-8 st-5 legal-body" ref={bodyRef}>
            {DOC.map((s, si) => (
              <article key={s.id} id={s.id}>
                <h2 className="d2">{s.label}</h2>
                {s.clauses.map(([id, head, copy], ci) => {
                  const key = `${s.id}-${id}`
                  return (
                    <Dilate key={key}>
                      <div className="lg-clause" id={key}>
                        <h3 className="d3">
                          <span className="lg-clause-no">{si + 1}.{ci + 1}</span>
                          {head}
                          <button
                            type="button"
                            className={`lg-cite ${copied?.key === key ? 'is-done' : ''}`}
                            onClick={cite(key)}
                            aria-label={`Copy a link to clause ${si + 1}.${ci + 1}, ${head}`}
                          >
                            {copied?.key === key
                              ? (copied.state === 'copied' ? 'Copied' : 'In address bar')
                              : '¶'}
                          </button>
                        </h3>
                        <p className="body">{copy}</p>
                      </div>
                    </Dilate>
                  )
                })}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
