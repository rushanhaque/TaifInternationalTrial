import { CharCascade, SmoothReveal } from '../Reveal'
import Button from '../Button'

/* ── PERSONAL GUIDANCE ──────────────────────────────────────────────────────
   A single, quiet CTA band directly under Materials (The Turn). A buyer who
   has just read through six metals is exactly the person who now has a
   question the page cannot answer for them — this is the page saying so and
   handing them a door out to a person instead of another gallery.

   Deliberately spare: one kicker, one line of a question, one sentence,
   one button. Every other homepage CTA sits inside a bigger section; this
   one gets a full band of its own because the offer — a free, no-obligation
   consult — is the whole content. */
export default function MaterialGuidance() {
  return (
    <section className="mg section" id="material-guidance">
      <div className="wrap mg-in">
        <CharCascade as="span" className="meta mg-kicker">Personal guidance</CharCascade>
        {/* a deliberate manual break, not a wrapped line — the two-line
            shape is the design, not an accident of viewport width, so it
            should not shuffle between one line and three as the column
            resizes. CharCascade only animates the ref'd element itself
            (no textContent rebuild), so a <br/> child survives it intact. */}
        <CharCascade as="h2" className="d1 mg-title">
          Not sure which metal<br />to choose?
        </CharCascade>
        <SmoothReveal as="p" className="lede mg-lede">
          Our artisans will guide you to the right metal, finish and form for
          your project — complimentary, with no obligation.
        </SmoothReveal>
        <div className="mg-cta">
          <Button to="/contact" variant="ghost">Book a free consultation</Button>
        </div>
      </div>
    </section>
  )
}
