/* ── THE THREE MARKS ────────────────────────────────────────────────────────
   Our Core Philosophy — set on the house off-white, the same warm ground the
   Materials and Countries sections share, so it reads as one continuous
   paper rather than a dark interruption between two white sections.

   Each commitment now carries a proper icon badge — a filled burgundy-tint
   circle with a two-stroke glyph inside, rather than the earlier almost-
   invisible ring — because on a light ground a hairline outline alone reads
   as decoration; a badge reads as an icon.

   The columns are still divided by hairlines that fade out at both ends
   rather than by boxes. Three bordered cards would look like a pricing
   table; a ruled division is what a printed page does, and it leaves the
   type alone.

   NO SCRIPT. The entrance is handled by the site-wide SceneReveal, which
   marks `.phil-mark` as a card and staggers the three against each other.
   Everything else — the badge fill, the rule under each name — is CSS on
   :hover and :focus-within. Nothing here can leave content hidden. */

const MARKS = [
  {
    no: '01',
    name: 'Sustainability',
    body:
      'We use 100% recyclable, lead-free Metal. Our pieces are built to last lifetimes, reducing the environmental footprint of modern luxury.',
    /* a leaf with its stem and midrib — reads at any size, no fill needed */
    icon: (
      <>
        <path d="M6 20C4.3 12.4 8 5.6 19 4.5c1 10.3-6.2 15-13 15.5Z" />
        <path d="M6 20c1.8-5.3 5-8.6 10.2-11.6" />
      </>
    ),
  },
  {
    no: '02',
    name: 'Artisan DNA',
    body:
      'No machines. No assembly lines. Just the rhythmic sound of the hammer meeting the metal, guided by eyes that see excellence.',
    /* a claw hammer, head and handle — the one tool on the metal floor that
       cannot be replaced by a machine */
    icon: (
      <>
        <path d="M13.4 3.4 20 10l-3 3-6.6-6.6Z" />
        <path d="M14.7 10.1 4.8 20a1.6 1.6 0 0 1-2.3-2.3l9.9-9.9" />
      </>
    ),
  },
  {
    no: '03',
    name: 'Wellness',
    body:
      'Metal is naturally antimicrobial and offers superior heat retention, turning your daily routine into a rejuvenating ritual.',
    /* a heart with its pulse — the universal wellness mark */
    icon: (
      <>
        <path d="M12 20.1s-7.4-4.5-7.4-9.9A4.4 4.4 0 0 1 12 6.9a4.4 4.4 0 0 1 7.4 3.3c0 5.4-7.4 9.9-7.4 9.9Z" />
        <path d="M5.4 11.3h2.9l1.4-2.8 2 4.6 1.4-2.6h4.3" />
      </>
    ),
  },
]

export default function Philosophy() {
  return (
    <section className="phil" id="philosophy">
      <span className="phil-glow" aria-hidden="true" />

      <div className="wrap">
        <header className="phil-head">
          <h2 className="phil-title">Our Core Philosophy</h2>
          <span className="phil-rule" aria-hidden="true" />
          <p className="phil-lede">
            Beyond aesthetics, our work is guided by three fundamental
            commitments.
          </p>
        </header>

        <ul className="phil-grid">
          {MARKS.map((m) => (
            <li className="phil-mark" key={m.no}>
              <span className="phil-no">{m.no}</span>

              <span className="phil-emblem" aria-hidden="true">
                <span className="phil-badge" />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {m.icon}
                </svg>
              </span>

              <h3 className="phil-name">{m.name}</h3>
              <p className="phil-body">{m.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
