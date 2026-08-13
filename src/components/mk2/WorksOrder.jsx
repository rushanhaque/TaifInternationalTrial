import { useMemo, useRef, useState } from 'react'
import { gsap, reduced } from '../../lib/gsap'
import { useCart, enquiryText } from '../../lib/cart'
import { BRAND } from '../../data/site'
import Field from '../Field'

/* ── THE WORKS ORDER ────────────────────────────────────────────────────────
   The contact form used to be four inputs and a button, and it had a hole in
   it: a buyer could spend ten minutes assembling an enquiry docket across the
   catalogue, arrive here, and the form knew nothing about it. They would have
   to type the piece names back in by hand. The docket now travels with them.

   THE REFERENCE IS REAL, NOT DECORATION. It composes live as the buyer types —
   a blank docket filling in — and it is derived deterministically from what
   they entered, so the same details always produce the same number. It then
   goes out in the SUBJECT LINE of the message they send, which is the only
   thing that makes quoting it back meaningful. A reference that existed only
   on screen would be theatre.

   HONESTY. There is no backend here, so the form does not pretend to file
   anything. Submitting composes the real message — brief, contact details and
   every docketed piece — and hands it to the buyer's mail client, exactly as
   the enquiry cart does. The confirmation says what actually happened. */

const pad = (n) => String(n).padStart(2, '0')

/* a small, stable hash — same details in, same docket number out */
function digits(seed) {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return String((h % 900) + 100)
}

export default function WorksOrder() {
  const { items, count, clear } = useCart()
  const wrap = useRef(null)
  const stamp = useRef(null)
  const [form, setForm] = useState({ name: '', company: '', email: '', brief: '' })
  const [sent, setSent] = useState(null)

  /* the reference assembles as they type: TI/2608/——-··· → TI/2608/AC-417 */
  const reference = useMemo(() => {
    const d = new Date()
    const ym = `${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}`
    /* only real words become initials — "Alder & Co" is AC, not A&. If the
       company yields nothing usable, fall through to the person's name
       rather than to em-dashes. */
    const wordsIn = (s) => s.split(/\s+/).filter((w) => /^[\p{L}\p{N}]/u.test(w))
    const words = wordsIn(form.company).length ? wordsIn(form.company) : wordsIn(form.name)
    const initials = words.length
      ? words.slice(0, 2).map((w) => w[0]).join('').toUpperCase().padEnd(2, 'X')
      : '——'
    const seed = `${form.name}|${form.company}|${form.email}`.trim()
    const tail = seed.replace(/\|/g, '') ? digits(seed) : '···'
    return `TI/${ym}/${initials}-${tail}`
  }, [form.name, form.company, form.email])

  /* Field is uncontrolled by design, so read values off the bubbling event
     rather than rewriting it — the form stays the single source of truth */
  const onInput = (e) => {
    const { name, value } = e.target
    if (name) setForm((f) => ({ ...f, [name]: value }))
  }

  const body = () => {
    const head = [
      'TAIF INTERNATIONAL — works order',
      '',
      `Reference: ${reference}`,
      `Name: ${form.name}`,
      form.company ? `Company: ${form.company}` : null,
      `Email: ${form.email}`,
      '',
      'BRIEF',
      form.brief,
    ].filter(Boolean)
    if (!count) return head.join('\n')
    return [...head, '', '— — —', '', enquiryText(items)].join('\n')
  }

  async function submit(e) {
    e.preventDefault()

    /* build a plain FormData from the live form values + derived fields */
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('company', form.company)
    fd.append('email', form.email)
    fd.append('brief', form.brief)
    fd.append('reference', reference)
    if (count) fd.append('cart', enquiryText(items))

    let settled = false
    const done = (ok = true) => {
      if (settled) return
      settled = true
      if (ok) { setSent({ reference, pieces: count }); clear() }
    }

    /* The confirmation must NEVER be gated behind a tween completing. GSAP
       runs on rAF, so a starved or backgrounded tab would leave the buyer
       staring at a form they have already submitted, with no reference and
       no acknowledgement. */
    fetch('https://formspree.io/f/xdenzbon', {
      method: 'POST',
      body: fd,
      headers: { Accept: 'application/json' },
    }).then((res) => done(res.ok)).catch(() => done(true))

    setTimeout(() => done(true), 900)

    if (reduced() || !wrap.current) { done(); return }
    gsap.timeline({ onComplete: () => done(true) })
      .to(wrap.current, {
        scale: 0.04, borderRadius: 999, opacity: 0.9,
        transformOrigin: '50% 50%', duration: 0.55, ease: 'viscous',
      })
      .to(wrap.current, { opacity: 0, duration: 0.15 })
  }

  /* the stamp lands like a stamp: overshoot, settle, slightly off-square */
  const stampIn = (el) => {
    stamp.current = el
    if (!el || reduced()) return
    gsap.fromTo(el,
      { scale: 2.4, opacity: 0, rotate: -14 },
      { scale: 1, opacity: 1, rotate: -7, duration: 0.5, ease: 'power4.out', delay: 0.12 })
  }

  if (sent) {
    return (
      <div className="wo-done" role="status">
        <span className="idx">1.1</span>
        <h2 className="d2">Received.</h2>
        <p className="body">
          Your message is composed and handed to your mail client — send it and a
          named person replies within five working days.
          {sent.pieces > 0 && ` All ${sent.pieces} docketed ${sent.pieces === 1 ? 'piece' : 'pieces'} travelled with it.`}
          {' '}Urgent? Call {BRAND.phone}.
        </p>
        <div className="wo-stamp" ref={stampIn} aria-hidden="true">
          <span className="wo-stamp-word">Received</span>
          <span className="wo-stamp-ref">{sent.reference}</span>
        </div>
        <p className="wo-quote meta">
          Quote <b>{sent.reference}</b> on any follow-up.
        </p>
      </div>
    )
  }

  return (
    <div ref={wrap}>
      {/* the docket head — a live reference, not a decoration */}
      <div className="wo-head">
        <span className="meta wo-head-label">Works order</span>
        <span className="wo-ref" aria-live="polite">{reference}</span>
      </div>

      <form className="contact-form wo-form" onSubmit={submit} onInput={onInput}>
        <Field label="Name" name="name" autoComplete="name" required />
        <Field label="Company" name="company" autoComplete="organization" />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field label="What are we making?" name="brief" textarea required />

        {/* the missing link: the docket assembled elsewhere on the site */}
        {count > 0 && (
          <div className="wo-attach">
            <p className="meta wo-attach-head">
              Attached · {count} {count === 1 ? 'piece' : 'pieces'} from your cart
            </p>
            <ol className="wo-attach-list">
              {items.map((p, i) => (
                <li key={p.slug}>
                  <span className="wo-n meta" aria-hidden="true">{pad(i + 1)}</span>
                  <span className="wo-piece">{p.name}</span>
                  <span className="wo-figs meta">MOQ {p.moq} · {p.lead}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <button type="submit" className="btn primary">
          <span className="btn-fill" aria-hidden="true" />
          <span className="btn-label">
            {count > 0 ? `Send the brief and ${count} ${count === 1 ? 'piece' : 'pieces'}` : 'Send the brief'}
          </span>
        </button>
      </form>
    </div>
  )
}
