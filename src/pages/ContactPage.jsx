import { useState } from 'react'
import { LOCATIONS, BRAND } from '../data/site'
import { CharCascade } from '../components/Reveal'
import Field from '../components/Field'
import Button from '../components/Button'

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const fd = new FormData(e.target)
    const name = fd.get('name') || ''
    const email = fd.get('email') || ''
    const message = fd.get('message') || ''

    const subject = encodeURIComponent(`Enquiry from ${name}`)
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`
    )
    window.location.href = `mailto:${BRAND.email}?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <>
      <section className="page-hero wrap">
        <p className="hero-kicker"><span className="idx">1.1</span> <span className="meta">Contact</span></p>
        <CharCascade as="h1" className="mega">Get in touch.</CharCascade>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="contact-split">
            {/* ── LEFT: Contact Form ─────────────────────────── */}
            <div className="contact-form-col">
              {!sent ? (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <h2 className="d3" style={{ marginBottom: '.4rem' }}>Send us a message</h2>
                  <p className="body dim" style={{ marginBottom: '1rem' }}>
                    We'll get back to you within two working days.
                  </p>
                  <Field label="Name" name="name" autoComplete="name" required />
                  <Field label="Email" name="email" type="email" autoComplete="email" required />
                  <Field label="Message" name="message" textarea required />
                  <Button type="submit">Send message</Button>
                </form>
              ) : (
                <div className="sent-card">
                  <h2 className="d3">Message composed.</h2>
                  <p className="body" style={{ marginTop: '.6rem' }}>
                    Your mail client should have opened with the message ready to send.
                    If it didn't, write to us directly at{' '}
                    <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>.
                  </p>
                  <div style={{ marginTop: '1.2rem' }}>
                    <Button onClick={() => setSent(false)} variant="ghost">Send another</Button>
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT: Details ─────────────────────────────── */}
            <div className="contact-info-col">
              <div className="contact-info-block">
                <h3 className="meta dim2">Phone</h3>
                <a className="d3 direct-link" href={`tel:${BRAND.phone.replace(/\s/g, '')}`}>
                  {BRAND.phone}
                </a>
              </div>

              <div className="contact-info-block">
                <h3 className="meta dim2">Email</h3>
                <a className="d3 direct-link" href={`mailto:${BRAND.email}`}>
                  {BRAND.email}
                </a>
              </div>

              <div className="contact-info-block">
                <h3 className="meta dim2">Address</h3>
                {LOCATIONS.slice(0, 1).map((l) => (
                  <div key={l.name}>
                    <p className="body" style={{ fontWeight: 600 }}>{l.name}</p>
                    {l.lines.map((line) => <p key={line} className="body dim">{line}</p>)}
                  </div>
                ))}
              </div>

              <div className="contact-info-block">
                <h3 className="meta dim2">Hours</h3>
                <p className="body">Mon – Sat, 09:00 – 18:00 IST</p>
                <p className="body dim">Replies in English, हिन्दी, اردو.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAP: Moradabad ───────────────────────────────────── */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head"><span className="idx">1.2</span><span className="meta">Location</span></div>
          <div className="contact-map-wrap">
            <iframe
              className="contact-map"
              title="Taif International – Moradabad"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112046.89357949399!2d78.70791570000001!3d28.838888700000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390b07539e9bd80b%3A0x8393adc0e67adea7!2sMoradabad%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: 'var(--r-lg)' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  )
}
