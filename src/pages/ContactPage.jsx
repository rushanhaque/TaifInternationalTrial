import { useRef, useState } from 'react'
import { gsap, reduced } from '../lib/gsap'
import { LOCATIONS, BRAND } from '../data/site'
import { CharCascade, Dilate } from '../components/Reveal'
import Field from '../components/Field'
import Slab from '../components/Slab'

export default function ContactPage() {
  const formWrap = useRef(null)
  const [sent, setSent] = useState(false)

  function submit(e) {
    e.preventDefault()
    if (reduced()) { setSent(true); return }
    /* H7 — the form collapses to a droplet, then re-expands as confirmation */
    gsap.timeline({ onComplete: () => setSent(true) })
      .to(formWrap.current, {
        scale: 0.04, borderRadius: 999, opacity: 0.9,
        transformOrigin: '50% 50%', duration: 0.55, ease: 'viscous',
      })
      .to(formWrap.current, { opacity: 0, duration: 0.15 })
  }

  return (
    <>
      <section className="page-hero wrap">
        <p className="hero-kicker"><span className="idx">1.1</span> <span className="meta">Contact</span></p>
        <CharCascade as="h1" className="mega">Start the sample.</CharCascade>
        <Dilate>
          <p className="lede">
            Send a drawing, a photograph or a piece you already sell. A priced quote —
            tooling, MOQ and a dated production slot — returns within five working days.
          </p>
        </Dilate>
      </section>

      <section className="section alt">
        <div className="wrap grid">
          <div className="sp-7">
            {!sent ? (
              <div ref={formWrap}>
                <form className="contact-form" onSubmit={submit} noValidate={false}>
                  <Field label="Name" name="name" autoComplete="name" required />
                  <Field label="Company" name="company" autoComplete="organization" />
                  <Field label="Email" name="email" type="email" autoComplete="email" required />
                  <Field label="What are we making?" name="brief" textarea required />
                  <button type="submit" className="btn primary">
                    <span className="btn-fill" aria-hidden="true" />
                    <span className="btn-label">Send the brief</span>
                  </button>
                </form>
              </div>
            ) : (
              <Dilate className="sent-card" role="status">
                <span className="idx">1.1</span>
                <h2 className="d2">Received.</h2>
                <p className="body">
                  Your brief is in the queue — a named person replies within five
                  working days. Urgent? Call {BRAND.phone}.
                </p>
              </Dilate>
            )}
          </div>
          <div className="sp-4 st-8 contact-direct">
            <Dilate delay={0.1}>
              <h3 className="meta" style={{ color: 'var(--dim)' }}>Direct</h3>
              <a className="d3 direct-link" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
              <a className="d3 direct-link" href={`tel:${BRAND.phone.replace(/\s/g, '')}`}>{BRAND.phone}</a>
              <p className="body dim" style={{ marginTop: '1rem' }}>Mon–Sat, 09:00–18:00 IST. Replies in English, हिन्दी, اردو.</p>
            </Dilate>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head"><span className="idx">1.1</span><span className="meta">Locations</span></div>
          <div className="grid">
            {LOCATIONS.map((l, i) => (
              <Dilate key={l.name} className="sp-4 loc-card" delay={i * 0.08}>
                <span className="meta dim2">{l.meta}</span>
                <h3 className="d3">{l.name}</h3>
                {l.lines.map((line) => <p key={line} className="body">{line}</p>)}
              </Dilate>
            ))}
          </div>
          <div style={{ marginTop: '1.6rem' }}>
            <Slab tone="wood" ratio="21/6" label="MORADABAD · 28.84° N, 78.77° E" meta="Industrial Estate" />
          </div>
        </div>
      </section>
    </>
  )
}
