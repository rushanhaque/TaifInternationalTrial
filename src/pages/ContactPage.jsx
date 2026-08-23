import { LOCATIONS, BRAND } from '../data/site'
import { CharCascade } from '../components/Reveal'
import ContactForm from '../components/ContactForm'

const site = LOCATIONS[0]
const addressLine = [site.name, ...site.lines].join(', ')
const mapPin = `${site.coords.lat},${site.coords.lng}`
const mapEmbedSrc = `https://www.google.com/maps?q=${mapPin}&z=17&output=embed`
const mapsHref = site.share

/* Submit handling, validation and the sent state all live in ContactForm now
   — this page is layout and contact details. */
export default function ContactPage() {
  return (
    <>
      <section className="page-hero wrap">
        <CharCascade as="h1" className="mega">Get in touch.</CharCascade>
      </section>

      <section className="section alt">
        <div className="wrap">
          {/* ── THE BIG 3D CARD ────────────────────────────── */}
          <div className="contact-card-3d">
            <div className="contact-card-inner">
              <div className="contact-split">
                {/* ── LEFT: Contact Form ───────────────────── */}
                <div className="contact-form-col">
                  <ContactForm />
                </div>

                {/* ── RIGHT: Details ───────────────────────── */}
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
          </div>
        </div>
      </section>

      {/* ── MAP: Moradabad ───────────────────────────────────── */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head"><span className="idx">1.2</span><span className="meta">Location</span></div>
          <a
            className="contact-map-wrap"
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${BRAND.name}'s location in Google Maps — ${addressLine}`}
          >
            <iframe
              className="contact-map"
              title="Map of the Moradabad works"
              src={mapEmbedSrc}
              width="100%"
              height="450"
              style={{ border: 0 }}
              loading="lazy"
              tabIndex={-1}
              aria-hidden="true"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <span className="contact-map-cue">
              Open in Google Maps
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17 17 7" /><path d="M8 7h9v9" />
              </svg>
            </span>
          </a>
        </div>
      </section>
    </>
  )
}
