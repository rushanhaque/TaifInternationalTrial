import { useRef, useState } from 'react'
import { BRAND } from '../data/site'

/* ── THE CONTACT FORM ──────────────────────────────────────────────────────
   Replaces the old floating-label pill fields. Three things drove the rebuild:

   ▸ THE LABEL SITS ABOVE THE FIELD, and stays there. The previous design
     floated the caption from inside the input to its top edge on focus, which
     meant the caption was also the placeholder — so a half-filled form had no
     stable column of labels to scan, and the caption animated away at exactly
     the moment you were reading it. A static caption costs one line and reads
     at a glance.

   ▸ EVERY FIELD IS A <label>. Clicking a caption, a corner, the padding, or
     the far right edge focuses the control, natively, with no handler and no
     hit-testing of our own. The pill shape used to swallow corner clicks
     because hit-testing follows border-radius.

   ▸ ERRORS BELONG TO A FIELD, not the form. The old form showed one message
     under everything after a failed send; a field that failed validation only
     turned red. Each field now carries its own message, tied to the input
     with aria-describedby, and the first invalid one takes focus.        */

const ENDPOINT = 'https://formspree.io/f/xdenzbon'

function TextField({
  label, name, type = 'text', textarea = false, rows = 5,
  autoComplete, required = false, placeholder,
  value, error, onChange, inputRef,
}) {
  const id = `cf-${name}`
  const errId = `${id}-err`
  const Control = textarea ? 'textarea' : 'input'

  return (
    /* the whole block is the label, so the caption and every part of the
       control's box focus the control — see the note at the top */
    <label className={`cf-field${error ? ' is-invalid' : ''}`} htmlFor={id}>
      <span className="cf-label">
        {label}
        {required && <span className="cf-req" aria-hidden="true">*</span>}
      </span>

      <Control
        id={id}
        ref={inputRef}
        className="cf-control"
        name={name}
        type={textarea ? undefined : type}
        rows={textarea ? rows : undefined}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined}
      />

      {/* Rendered only when it applies. An always-present node reserves a line
          of space under every field, which is what made the old form's
          spacing look uneven once one error appeared. */}
      {error && (
        <span className="cf-error" id={errId} role="alert">{error}</span>
      )}
    </label>
  )
}

const BLANK = { name: '', email: '', message: '' }

export default function ContactForm() {
  const [values, setValues] = useState(BLANK)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [failed, setFailed] = useState(false)
  const refs = { name: useRef(null), email: useRef(null), message: useRef(null) }

  const set = (key, val) => {
    setValues((v) => ({ ...v, [key]: val }))
    /* clear a field's error as soon as it is being corrected — leaving it up
       while the visitor fixes it reads as the fix not having worked */
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e))
  }

  /* Validated here rather than by the browser so the wording matches the rest
     of the site and the message can sit in the layout instead of in a native
     bubble that vanishes on the next click. */
  const validate = () => {
    const next = {}
    if (!values.name.trim()) next.name = 'Please tell us your name.'
    if (!values.email.trim()) next.email = 'Please add an email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = 'That email address does not look right.'
    }
    if (!values.message.trim()) next.message = 'Please write a message.'
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFailed(false)

    const found = validate()
    setErrors(found)
    const first = ['name', 'email', 'message'].find((k) => found[k])
    if (first) {
      refs[first].current?.focus()
      return
    }

    setBusy(true)
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        body: new FormData(e.target),
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        setSent(true)
        setValues(BLANK)
      } else {
        setFailed(true)
      }
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div className="cf-sent" role="status">
        <span className="cf-sent-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
               stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h2 className="cf-sent-title">Message sent.</h2>
        <p className="cf-sent-note">
          We&rsquo;ll get back to you within two working days. If it&rsquo;s urgent,
          reach us at <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>.
        </p>
        <button type="button" className="cf-again" onClick={() => setSent(false)}>
          Send another
        </button>
      </div>
    )
  }

  return (
    <form className="cf" onSubmit={handleSubmit} noValidate>
      <div className="cf-head">
        <h2 className="cf-title">Send us a message</h2>
        <p className="cf-sub">We&rsquo;ll get back to you within two working days.</p>
      </div>

      <TextField
        label="Name" name="name" autoComplete="name" required
        placeholder="Your name"
        value={values.name} error={errors.name} onChange={set} inputRef={refs.name}
      />
      <TextField
        label="Email" name="email" type="email" autoComplete="email" required
        placeholder="you@company.com"
        value={values.email} error={errors.email} onChange={set} inputRef={refs.email}
      />
      <TextField
        label="Message" name="message" textarea required
        placeholder="What can we make for you?"
        value={values.message} error={errors.message} onChange={set} inputRef={refs.message}
      />

      {failed && (
        <p className="cf-failed" role="alert">
          Something went wrong — please try again or email us at{' '}
          <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>.
        </p>
      )}

      <button type="submit" className="cf-submit" disabled={busy}>
        <span>{busy ? 'Sending…' : 'Send message'}</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
             stroke="currentColor" strokeWidth="1.9"
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </button>
    </form>
  )
}
