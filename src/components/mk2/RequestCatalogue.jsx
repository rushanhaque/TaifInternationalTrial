import { useRef, useState } from 'react'
import { gsap, reduced } from '../../lib/gsap'
import Field from '../Field'

/* ── Request the catalogue ──────────────────────────────────────────────────
   The conversion moment, kept deliberately short: a statement, what actually
   ships, three fields, one button. The only flourish is the stamp — on submit
   a brass RECEIVED mark strikes down over the card, which is the whole reward
   for filling it in.

   This replaces a much longer version (a 3-D hinged catalogue plus a full air
   waybill). It was handsome but it was the heaviest block on the page for the
   least payoff at the point where a buyer just wants to hand over an address.

   Client-side only — wire the POST when a backend exists.
   FAIL-OPEN: nothing rests hidden; the stamp only mounts after submit. */

const SHIPS = [
  ['48', 'pages'],
  ['20', 'pieces'],
  ['5', 'finish swatches, physical'],
]

export default function RequestCatalogue() {
  const [sent, setSent] = useState(false)
  const stampRef = useRef(null)
  const cardRef = useRef(null)

  function onSubmit(e) {
    e.preventDefault()
    fetch('https://formspree.io/f/xdenzbon', {
      method: 'POST',
      body: new FormData(e.target),
      headers: { Accept: 'application/json' },
    }).catch(() => {/* fail-open */})
    setSent(true)
    if (reduced()) return
    /* strike on the next frame, once the stamp is actually in the DOM */
    requestAnimationFrame(() => {
      if (!stampRef.current) return
      gsap.fromTo(stampRef.current,
        { scale: 2.4, opacity: 0, rotate: -14 },
        { scale: 1, opacity: 1, rotate: -7, duration: 0.42, ease: 'power4.out' })
      if (cardRef.current) {
        gsap.fromTo(cardRef.current, { y: 0 },
          { y: 3, duration: 0.09, yoyo: true, repeat: 1, ease: 'power2.out' })
      }
    })
  }

  const stamped = new Date()
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase()

  return (
    <section className="rq deep section" aria-labelledby="rq-title">
      <div className="sec-head"><span className="meta">Connect</span></div>
      <div className="wrap rq-inner">
        <div className="rq-say">

          <ul className="rq-ships">
            {SHIPS.map(([n, what]) => (
              <li key={what}><b>{n}</b><span>{what}</span></li>
            ))}
          </ul>
        </div>

        <div className="rq-card" ref={cardRef}>
          {!sent ? (
            <form className="rq-form" onSubmit={onSubmit}>
              <Field label="Name" name="rq-name" autoComplete="name" required />
              <Field label="Email" name="rq-email" type="email" autoComplete="email" required />
              <Field label="Company" name="rq-company" autoComplete="organization" />
              <button className="btn primary rq-send" type="submit">
                <span className="btn-fill" aria-hidden="true" />
                <span className="btn-label">Request it</span>
              </button>
            </form>
          ) : (
            <div className="rq-done" role="status">
              <span className="rq-stamp" ref={stampRef} aria-hidden="true">
                <b>RECEIVED</b>
                <i>{stamped}</i>
              </span>
              <p className="rq-done-line">
                Logged. A catalogue ships within two working days.
              </p>
              <button className="rq-reset" type="button" onClick={() => setSent(false)}>
                Send another
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
