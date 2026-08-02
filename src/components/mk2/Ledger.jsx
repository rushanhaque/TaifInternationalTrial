import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import Button from '../Button'

/* ═══════════════════════════════════════════════════════════════════════════
   ⚠ PLACEHOLDER DATA — CLIENT MUST CONFIRM EVERY LINE BEFORE LAUNCH ⚠

   Everything in LEDGER and DOC below is written to the correct SHAPE for a
   Moradabad metal-and-wood handicraft exporter, but the actual values are
   assumptions. They are plausible, not verified. Publishing an unconfirmed
   HS code, certificate scope or payment term is a commercial and customs
   liability, not a copy problem.

   Before launch, Taif's export desk must sign off, line by line:
     · HS headings — confirm against current ITC(HS) schedule with the CHA.
       Duty treatment and the correct 8-digit sub-heading vary by destination.
     · Certificate numbers, scopes and expiry dates (ISO / BSCI / FSC® / LFGB).
       If a certificate has lapsed, the row comes out — it does not get softened.
     · Transit bands — these move with carrier schedules and season. Re-check
       against the last twelve months of actual B/L dates.
     · MOQ, lead times, weekly capacity, damage-claim rate and payment terms —
       must match what the commercial team will actually honour in writing.
   ═══════════════════════════════════════════════════════════════════════════ */

const DOC = [
  { k: 'Document', v: 'Export capability sheet' },
  { k: 'Revision', v: '04 · January 2026' },
  { k: 'Issued by', v: 'Export & Compliance, Moradabad' },
  { k: 'Origin', v: 'India (IN) · Moradabad, U.P.' },
]

const LEDGER = [
  {
    name: 'Classification',
    note: 'Headings shown are the ones we ship under most often. Confirm the final sub-heading with your own broker — duty treatment moves by destination.',
    rows: [
      { k: 'Brass & copper articles', codes: ['7419.80'] },
      { k: 'Copper tableware & kitchenware', codes: ['7418.10'] },
      { k: 'Base-metal ornaments & statuettes', codes: ['8306.29'] },
      { k: 'Wooden ornaments & statuettes', codes: ['4420.10'] },
      { k: 'Wooden tableware & boards', codes: ['4419.90'] },
      { k: 'Lamps & lighting fittings', codes: ['9405.19', '9405.42'] },
      { k: 'Certificate of origin', v: 'Non-preferential, EPCH-issued · preferential where a trade agreement applies' },
    ],
  },
  {
    name: 'Terms & settlement',
    note: 'EXW is quoted ex-works Moradabad, not ex-port. Anything past the factory gate is a separate line on the quotation.',
    rows: [
      { k: 'Incoterms® 2020 handled', v: 'EXW · FOB · CIF · DDP' },
      { k: 'Quoted as standard', v: 'FOB Nhava Sheva' },
      { k: 'First order', v: '30% advance T/T · 70% against B/L copy' },
      { k: 'Repeat accounts', v: 'Net 30 from B/L date, on approved credit' },
      { k: 'Letter of credit', v: 'Irrevocable, at sight, confirmed' },
      { k: 'Invoicing currency', v: 'USD · EUR · GBP' },
    ],
  },
  {
    name: 'Ports & transit',
    note: 'Port to port. Add 6–8 days inland from Moradabad and 2–4 days clearance at destination before you build a delivery date on these.',
    rows: [
      { k: 'Load ports', v: 'Nhava Sheva (INNSA) · Mundra (INMUN)' },
      { k: 'Stuffing', v: 'Factory-stuffed and self-sealed at Moradabad' },
      { k: 'Jebel Ali', v: '5–7 days' },
      { k: 'Rotterdam / Antwerp', v: '22–26 days' },
      { k: 'Hamburg / Felixstowe', v: '24–28 days' },
      { k: 'New York / Savannah', v: '28–33 days' },
      { k: 'Los Angeles / Long Beach', v: '30–35 days' },
      { k: 'Sydney / Melbourne', v: '21–25 days' },
    ],
  },
  {
    name: 'Order & lead time',
    note: 'Every quotation carries a dated production slot rather than an estimate. If the slot slips, you hear it from us first.',
    rows: [
      { k: 'MOQ — catalogue', v: '100–300 pcs per SKU' },
      { k: 'MOQ — bespoke', v: '300 pcs per SKU' },
      { k: 'Sample — existing tooling', v: '10 working days' },
      { k: 'Sample — new tooling or carving', v: '18–22 working days' },
      { k: 'Production — repeat order', v: '4–6 weeks' },
      { k: 'Production — new development', v: '8–12 weeks' },
      { k: 'Weekly capacity', v: '18,000 pcs · metal and wood floors combined' },
    ],
  },
  {
    name: 'Compliance & papers',
    note: 'Certificates travel inside the container, not behind an email. If we cannot document a claim, we do not make it.',
    rows: [
      { k: 'Quality system', v: 'ISO 9001:2015' },
      { k: 'Social audit', v: 'amfori BSCI · renewed annually' },
      { k: 'Timber chain of custody', v: 'FSC® Mix · CoC certificate per lot' },
      { k: 'Coatings & lacquers', v: 'REACH (EC 1907/2006) · SVHC declaration per batch' },
      { k: 'Food-contact', v: 'FDA 21 CFR 175.300 · LFGB tested' },
      { k: 'Wood packaging', v: 'ISPM-15 heat-treated and stamped' },
      { k: 'Trade body', v: 'EPCH member — Export Promotion Council for Handicrafts' },
    ],
  },
  {
    name: 'Packing & yield',
    note: 'Plastic appears only where a curing lacquer needs it. Ask for it out and it comes out — the carton spec is written per SKU anyway.',
    rows: [
      { k: 'Inner', v: 'Recycled tissue · moulded pulp corner set' },
      { k: 'Carton', v: '5-ply recycled board, 32 ECT' },
      { k: 'Rating', v: 'Container-floor stackable · 6 drops at 76 cm (ISTA 1A)' },
      { k: 'Master carton', v: '≤ 18 kg · barcoded · retail-ready on request' },
      { k: 'Container yield', v: '20′ ≈ 28 CBM · 40′ HC ≈ 66 CBM' },
      { k: 'Damage claims', v: 'Under 0.2% of units shipped, trailing twelve months' },
    ],
  },
]

const HALF = Math.ceil(LEDGER.length / 2)
const COLUMNS = [LEDGER.slice(0, HALF), LEDGER.slice(HALF)]
const pad = (n) => String(n).padStart(2, '0')

/* The credibility close. After a page of motion this is the tonal drop — a
   shipping manifest set as a two-page spread. The only movement permitted is
   an 8px rise on each line, because the point of the block is that it does
   not perform. */
export default function Ledger() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const mm = gsap.matchMedia()

    /* Hidden states are seeded here and nowhere else — the CSS resting state
       is fully visible, so a failed/blocked GSAP load still ships a readable
       manifest. */
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const groups = gsap.utils.toArray(root.querySelectorAll('.ldg-group'))
      const strip = root.querySelector('.ldg-strip')
      const tweens = []

      if (strip) {
        const cells = strip.querySelectorAll('.ldg-strip-cell')
        gsap.set(cells, { opacity: 0, y: 8 })
        tweens.push(
          gsap.to(cells, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'atelys',
            stagger: 0.05,
            scrollTrigger: { trigger: strip, start: 'top 92%', once: true },
          })
        )
      }

      groups.forEach((g, i) => {
        const lines = g.querySelectorAll('.ldg-head, .ldg-row, .ldg-note')
        gsap.set(lines, { opacity: 0, y: 8 })
        tweens.push(
          gsap.to(lines, {
            opacity: 1,
            y: 0,
            duration: 0.52,
            ease: 'atelys',
            stagger: 0.026,
            /* right-hand groups trail the left by a beat so the spread reads
               as two pages settling, not one block flashing on */
            delay: i >= HALF ? 0.09 : 0,
            scrollTrigger: { trigger: g, start: 'top 88%', once: true },
          })
        )
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

  return (
    <section className="ldg section alt" ref={rootRef} aria-labelledby="ldg-h">
      <div className="wrap">
        <div className="sec-head">
          <span className="meta">Export ledger</span>
        </div>

        <div className="grid ldg-top">
          <div className="sp-6">
            <h2 className="d1" id="ldg-h">Everything the second call is about.</h2>
          </div>
          <div className="sp-5 ldg-top-r">
            <p className="lede">
              Codes, terms, ports, dates and papers. Set down here so a sourcing
              team can qualify us before anyone books a meeting.
            </p>
          </div>
        </div>

        <dl className="ldg-strip">
          {DOC.map((d) => (
            <div className="ldg-strip-cell" key={d.k}>
              <dt className="meta ldg-strip-k">{d.k}</dt>
              <dd className="ldg-strip-v">{d.v}</dd>
            </div>
          ))}
        </dl>

        <div className="ldg-sheet">
          <span className="ldg-gutter" aria-hidden="true" />
          {COLUMNS.map((col, ci) => (
            <div className="ldg-col" key={ci}>
              {col.map((g, gi) => {
                const no = ci * HALF + gi + 1
                return (
                  <section className="ldg-group" key={g.name}>
                    <h3 className="ldg-head">
                      <span className="ldg-punch" aria-hidden="true" />
                      <span className="idx ldg-no">{pad(no)}</span>
                      <span className="ldg-name">{g.name}</span>
                      <span className="meta ldg-count">{pad(g.rows.length)} lines</span>
                    </h3>
                    <dl className="ldg-rows">
                      {g.rows.map((r) => (
                        <div className="ldg-row" key={r.k}>
                          <dt className="meta ldg-k">{r.k}</dt>
                          <dd className="ldg-v">
                            {r.codes
                              ? r.codes.map((c) => (
                                  <span className="ldg-code" key={c}>
                                    <i aria-hidden="true">HS</i>{c}
                                  </span>
                                ))
                              : r.v}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <p className="ldg-note">{g.note}</p>
                  </section>
                )
              })}
            </div>
          ))}
        </div>

        <div className="ldg-foot">
          <p className="ldg-fine">
            Figures are typical, not contractual. Transit is port to port and
            excludes inland haulage and clearance. Every quotation ships with a
            dated production slot, a per-SKU packing spec and the certificates
            that travel with the container.
          </p>
          <Button to="/contact" small>Open a line with the export desk</Button>
        </div>
      </div>
    </section>
  )
}
