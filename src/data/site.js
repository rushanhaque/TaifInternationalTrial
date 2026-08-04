/* All site content lives here. The brand lives only in BRAND (§8.1) — navbar,
   footer, preloader, transitions and SEO all derive from it, so a rename is
   one edit.

   NOTE FOR HANDOVER: figures, certifications, addresses, phone, email, team
   names and case studies are placeholders written to the right shape. Swap
   them for the client's real data before launch. */

export const BRAND = {
  name: 'TAIF INTERNATIONAL',
  mark: 'TAIF',                       // short wordmark for display lockups
  suffix: 'INTERNATIONAL',            // set beside the mark, letterspaced
  line: 'Where Metal Meets Grain',
  descriptor: 'Metal & Wood Handicraft Manufacture · Export',
  est: '1998',
  origin: 'Moradabad · India',
  email: 'export@taifinternational.com',
  phone: '+91 98370 42200',
  /* The canonical production origin, no trailing slash. Every canonical URL,
     og:url and structured-data URL derives from this. Leave it empty and the
     site canonicalises to whatever origin is serving it, which is what you
     want on a preview deploy and NOT what you want in production. */
  url: 'https://taifinternational.com',
}

export const NAV_LINKS = [
  { to: '/collections', label: 'Collections' },
  { to: '/catalogue', label: 'Catalogue' },
  { to: '/materials', label: 'Materials' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export const COLLECTIONS = [
  { no: '01', name: 'Wooden Products', tone: 'walnut',  material: 'Sheesham · Mango · Teak',
    accent: 'brass',   pitch: 'Carved, turned and inlaid timber pieces built from kiln-dried hardwood.' },
  { no: '02', name: 'Copper Products', tone: 'copper',  material: 'Copper · Brass',
    accent: 'copper',  pitch: 'Hand-hammered copper vessels, trays and serveware with lasting patina.' },
  { no: '03', name: 'Home Decor',      tone: 'antique', material: 'Brass · Copper · Wood',
    accent: 'antique', pitch: 'Vessels, sculpture, wall pieces. The quiet centrepiece of a room.' },
  { no: '04', name: 'Hardware Supplies', tone: 'brass',  material: 'Brass · Iron · Steel',
    accent: 'brass',   pitch: 'Handles, knobs, hinges and fittings — cast, forged and finished by hand.' },
  { no: '05', name: 'Corporate Gifting', tone: 'inlay',  material: 'Brass · Wood · Copper',
    accent: 'copper',  pitch: 'Branded keepsakes, desk sets and presentation pieces for corporate orders.' },
  { no: '06', name: 'Religious Supplies', tone: 'brass', material: 'Brass · Copper',
    accent: 'brass',   pitch: 'Pooja thalis, diyas, bells and temple fittings in traditional brass and copper.' },
  { no: '07', name: 'Bathroom Accessories', tone: 'copper', material: 'Brass · Copper · Steel',
    accent: 'copper',  pitch: 'Soap dishes, towel rings, dispensers and vanity trays for premium bathrooms.' },
  { no: '08', name: 'Kitchenware',     tone: 'copper',  material: 'Copper · Brass · Steel',
    accent: 'copper',  pitch: 'Serving bowls, ladles, utensil holders and cookware in hand-finished metal.' },
  { no: '09', name: 'Barware',         tone: 'copper',  material: 'Copper · Brass · Rosewood',
    accent: 'copper',  pitch: 'Ice buckets, coasters, shakers and trays. The pieces that carry the evening.' },
]

export const MORE_LINKS = [
  { to: '/partners', label: 'Partners' },
  { to: '/care', label: 'Care' },
  { to: '/faq', label: 'FAQ' },
  { to: '/legal', label: 'Legal' },
]

export const FIGURES = [
  { value: '340', unit: 'artisans', label: 'Hands on the metal and wood floors' },
  { value: '8–10', unit: '% MC', label: 'Moisture held in every wood part before it is cut' },
  { value: '42', unit: 'countries', label: 'Export markets shipped from Moradabad' },
  { value: '99.1', unit: '% on time', label: 'Container dispatch record, trailing twelve months' },
]

export const FINISHES = [
  {
    key: 'hammered', name: 'Hand-Hammered', tone: 'brass',
    substrates: ['Brass', 'Copper', 'Aluminium'],
    character: 'Ten thousand marks, struck one at a time. Light breaks across the surface instead of sliding off it.',
    durability: 'Work-hardened to roughly 140 HV at the strike face — the texture is stronger than the sheet it came from. Sealed or left raw, your call.',
    care: 'Dry cloth. Left raw it will darken; a lemon-and-salt rub takes it straight back.',
  },
  {
    key: 'antique', name: 'Antique Patina', tone: 'antique',
    substrates: ['Brass', 'Copper', 'Iron'],
    character: 'Brass aged forward by hand until it reads a century old, then stopped exactly where we want it.',
    durability: 'Chemically aged, relieved on the high points, sealed under matte lacquer. Colour is held to a physical master swatch, batch to batch.',
    care: 'Dust only. Polishing removes the age you paid for.',
  },
  {
    key: 'burnished', name: 'Burnished Copper', tone: 'copper',
    substrates: ['Copper', 'Brass'],
    character: 'Worked to a low, warm shine with a steel burnisher rather than a buffing mop, so the surface keeps its depth.',
    durability: 'Sealed with food-safe wax or clear lacquer. Left unsealed it travels from rose to umber over about eighteen months.',
    care: 'Rinse and dry at once. Never leave anything acidic standing in it.',
  },
  {
    key: 'natural', name: 'Natural Wood', tone: 'wood',
    substrates: ['Sheesham', 'Mango', 'Acacia', 'Teak'],
    character: 'Sanded to 400 grit and finished in oil. The grain is the decoration — nothing is printed, nothing is veneered.',
    durability: 'Kiln-dried to 8–10% moisture before a single cut, then three coats of hard-wax oil cured over 48 hours.',
    care: 'A barely damp cloth. Re-oil once a year; it takes ten minutes.',
  },
  {
    key: 'inlay', name: 'Brass Inlay', tone: 'walnut',
    substrates: ['Sheesham', 'Teak', 'Mango'],
    character: 'Brass wire and sheet set into dark hardwood by hand, then levelled flush. Run a finger across the joint and you will not find it.',
    durability: 'Cut, seated and hammered tight — no filler, no adhesive line. The inlay moves with the wood through every season.',
    care: 'Dry cloth on the wood, dry cloth on the brass. Never a solvent.',
  },
]

export const HOME_COLLECTIONS = [
  {
    key: 'brass', name: 'Brass', tone: 'brass',
    character: 'The workhorse of the metal floor. It casts cleanly and holds an antique patina evenly.',
  },
  {
    key: 'copper', name: 'Copper', tone: 'copper',
    character: 'Soft, warm and antimicrobial. We raise it annealed and seal it with food-safe wax.',
  },
  {
    key: 'aluminium', name: 'Aluminium', tone: 'antique',
    character: 'Lightweight and durable. Sand-cast or spun into complex, seamless forms.',
  },
  {
    key: 'wood', name: 'Wood', tone: 'walnut',
    character: 'Sheesham, mango, and acacia. Seasoned, kiln-dried, and finished in hard-wax oil.',
  }
]

export const PROCESS_STAGES = [
  { name: 'Source', spec: 'papers first', copy: 'Brass and copper arrive from mills with test certificates; sheesham, mango and acacia from plantation lots with legal harvest documents. Nothing enters the yard unpapered.' },
  { name: 'Season', spec: '8–10% MC', copy: 'Timber is air-stacked, kiln-dried to 8–10% moisture and then rested. Wood rushed at this stage cracks in a customer’s living room two winters later.' },
  { name: 'Cast & Cut', spec: '±0.5 mm', copy: 'Sand casting and lost wax on the metal floor; band-saw and CNC blanking on the wood floor. Both work to the same drawing, in the same week.' },
  { name: 'Form', spec: 'by hand', copy: 'Spinning lathes, stakes and hammers for metal. Turning, carving and jali fretwork for wood. This is the stage that cannot be bought as a machine.' },
  { name: 'Join', spec: 'no filler', copy: 'Brazing, riveting, mortise and tenon. Metal-to-wood joints are pinned and seated dry — we do not hide a gap behind putty.' },
  { name: 'Refine', spec: '400 grit base', copy: 'Filing, sanding and buffing to a 400-grit base. Everything after this stage only reveals what this stage left behind.' },
  { name: 'Colour & Seal', spec: 'ΔE ≤ 1.5', copy: 'Antiquing, burnishing, lacquer, powder coat and hard-wax oil — all in-house, all matched to a physical master swatch rather than a memory.' },
  { name: 'Inspect & Pack', spec: '100% checked', copy: 'Every piece is handled, weighed and compared against the approved sample. Packed in recycled board, corner-protected, rated for the container floor.' },
]

export const CAPABILITIES = [
  { name: 'Metal handicraft', stat: '11 processes', copy: 'Sand casting, lost wax, spinning, raising, chasing and repoussé in brass, copper, aluminium and iron — up to 900 mm across.' },
  { name: 'Wood handicraft', stat: '8–10% MC', copy: 'Turning, carving, jali fretwork, joinery and inlay in sheesham, mango, acacia and reclaimed teak. Seasoned and kiln-dried on site.' },
  { name: 'Metal-and-wood assembly', stat: 'no filler', copy: 'The joint is the product. Pinned, seated and levelled flush so two materials leave the floor reading as one object.' },
  { name: 'Finishing & colour', stat: 'ΔE ≤ 1.5', copy: 'Antiquing, burnishing, lacquer, powder coat and hard-wax oil, matched to a physical master swatch batch after batch.' },
  { name: 'Private label & packing', stat: '18k pcs / wk', copy: 'Laser marking, gift boxes, barcodes, retail-ready cartons and container consolidation. One PO, one container, one invoice.' },
]

export const MATERIALS = [
  {
    name: 'Brass IS 319', kind: 'Metal', tone: 'brass', meta: '78% recycled input',
    figs: [{ v: '927', u: '°C melt' }, { v: '8.44', u: 'g/cm³' }, { v: '110', u: 'HV' }],
    copy: 'The workhorse of the metal floor. It casts cleanly, takes a hammer without tearing and holds an antique patina evenly across a batch of two thousand.',
  },
  {
    name: 'Copper C11000', kind: 'Metal', tone: 'copper', meta: '92% recycled input',
    figs: [{ v: '1083', u: '°C melt' }, { v: '8.94', u: 'g/cm³' }, { v: '75', u: 'HV' }],
    copy: 'Soft, warm and antimicrobial. We raise it annealed and seal it with food-safe wax when the patina is not supposed to move.',
  },
  {
    name: 'Aluminium LM6', kind: 'Metal', tone: 'antique', meta: '81% recycled input',
    figs: [{ v: '577', u: '°C melt' }, { v: '2.65', u: 'g/cm³' }, { v: '60', u: 'HB' }],
    copy: 'A third of the weight, sand-cast and powder-coated. For large decor and lighting that has to ship by air without the freight eating the margin.',
  },
  {
    name: 'Sheesham (Indian Rosewood)', kind: 'Wood', tone: 'walnut', meta: 'Plantation-grown · legal harvest',
    figs: [{ v: '0.77', u: 'g/cm³' }, { v: '1660', u: 'lbf Janka' }, { v: '8–10', u: '% MC' }],
    copy: 'Dense, dark and interlocked. It carves without chipping and takes a brass inlay tightly enough that the joint disappears under a fingertip.',
  },
  {
    name: 'Mango Wood', kind: 'Wood', tone: 'wood', meta: 'Orchard by-product',
    figs: [{ v: '0.64', u: 'g/cm³' }, { v: '1070', u: 'lbf Janka' }, { v: '8–10', u: '% MC' }],
    copy: 'Cut from orchard trees past fruiting age, so the timber is a by-product rather than a felling. Pale, open-grained and beautiful under oil.',
  },
  {
    name: 'Reclaimed Teak', kind: 'Wood', tone: 'inlay', meta: 'Salvaged · age-verified',
    figs: [{ v: '0.68', u: 'g/cm³' }, { v: '1070', u: 'lbf Janka' }, { v: '60', u: 'yrs avg' }],
    copy: 'Salvaged from old structures, de-nailed, re-sawn and re-dried. Sixty years of movement are already behind it, which is why it stays flat.',
  },
]

export const PARTNERS = [
  { name: 'Halcyon Hotels', cat: 'Hospitality' },
  { name: 'Saffron House', cat: 'Hospitality' },
  { name: 'The Cedar Rooms', cat: 'Hospitality' },
  { name: 'Port & Parlour', cat: 'Hospitality' },
  { name: 'Meridian Living', cat: 'Retail' },
  { name: 'Casa Verde', cat: 'Retail' },
  { name: 'Northgate Home', cat: 'Retail' },
  { name: 'Solstice Home', cat: 'Retail' },
  { name: 'Atelier Kade', cat: 'Design' },
  { name: 'Studio Marrow', cat: 'Design' },
  { name: 'Arcline Architects', cat: 'Architecture' },
  { name: 'Bureau Nord', cat: 'Architecture' },
]

export const CASES = [
  {
    client: 'Halcyon Hotels', cat: 'Hospitality',
    brief: '2,800 hammered-brass and sheesham amenity sets across four properties, matched to a 2012 original whose original maker had closed.',
    result: 'Reverse-engineered from five surviving pieces; delivered in 16 weeks with a patina the client’s own housekeepers could not tell apart.',
    stat: '2,800 sets · 16 weeks',
  },
  {
    client: 'Atelier Kade', cat: 'Design',
    brief: 'A limited run of 300 inlaid keepsake boxes where a brass line had to sit flush in rosewood across seasons and two continents.',
    result: 'Moisture spec tightened to 8% and the inlay re-cut over four sample rounds. Zero lifted inlays reported in the first two years.',
    stat: '300 pcs · 0 returns',
  },
  {
    client: 'Meridian Living', cat: 'Retail',
    brief: 'Consolidate a 36-SKU decor line from four vendors to one, without a visible change on shelf and without a price rise.',
    result: 'One PO now covers casting, joinery, finishing and retail carton. Defect rate fell from 3.1% to 0.5% inside two quarters.',
    stat: '36 SKUs · 0.5% defects',
  },
]

export const TIMELINE = [
  { year: '1998', copy: 'Founded in Moradabad with six artisans, one buffing wheel and a single brazing bench.' },
  { year: '2003', copy: 'First export container — brass planters for a Hamburg importer. It has not stopped since.' },
  { year: '2008', copy: 'The wood floor opens in Saharanpur. Metal stops being the only material we speak.' },
  { year: '2013', copy: 'Seasoning yard and kiln commissioned. Wood is dried to 8–10% before it is cut, not after.' },
  { year: '2019', copy: 'Lacquer and powder-coat lines brought in-house. Colour becomes a process instead of a subcontract.' },
  { year: '2024', copy: 'Rooftop solar carries the finishing lines; metal offcuts go back to the smelter, wood offcuts to the boiler.' },
  { year: '2026', copy: 'Today: 340 artisans, 42 export markets, and two materials that leave as one object.' },
]

export const PRINCIPLES = [
  { name: 'The joint is the product', copy: 'Anyone can make a brass bowl or a wooden base. The reason to choose us is the line where they meet — flush, tight, and still tight after a container crossing in July.' },
  { name: 'Hand-made, factory-repeatable', copy: 'Every piece is worked by hand. Every batch is checked against a physical master. Craft and consistency are not opposites; holding both at once is the whole job.' },
  { name: 'Season the wood, respect the metal', copy: 'Most handicraft failures are moisture failures. We dry, rest and measure before a single cut. The least glamorous stage decides everything after it.' },
  { name: 'Papers travel with the goods', copy: 'Mill certificates, harvest documents, test reports and packing lists ship inside the container. If we cannot document a claim, we do not make it.' },
]

export const TEAM = [
  { name: 'Imran Taif', role: 'Founder & Managing Director' },
  { name: 'Rehana Qureshi', role: 'Head of Finishing' },
  { name: 'Devendra Sharma', role: 'Master Metalsmith' },
  { name: 'Anjali Rawat', role: 'Wood Shop & Seasoning' },
  { name: 'Faizan Ahmed', role: 'Export & Compliance' },
  { name: 'Neha Kulshrestha', role: 'Design & Sampling' },
]

export const TESTIMONIALS = [
  { quote: 'They send a moisture reading with the sample. Nobody else in this category has ever done that unprompted.', who: 'Head of Product', org: 'Meridian Living' },
  { quote: 'The inlay is the reason we moved. Four suppliers said flush; only this one delivered flush a year later.', who: 'Founding Partner', org: 'Atelier Kade' },
  { quote: 'Four properties, one patina, zero visible variation. Housekeeping notices these things before we do.', who: 'Procurement Director', org: 'Halcyon Hotels' },
]

export const CARE = [
  {
    key: 'brass', name: 'Unlacquered Brass',
    dos: ['Dry microfibre wipe, weekly', 'Mild soap for fingerprints', 'Museum wax twice a year if you want the shine held'],
    nevers: ['Abrasive pads or powders', 'Bleach or ammonia', 'Dishwashers'],
    note: 'Left alone, brass drifts to a warm umber. That is not damage — it is the alloy ageing, and a ten-minute polish returns it to day one.',
  },
  {
    key: 'copper', name: 'Copper',
    dos: ['Rinse and dry immediately after use', 'Lemon and salt for a fast re-brighten', 'Keep interiors tinned for food contact'],
    nevers: ['Leaving acidic food standing', 'Scouring a tinned interior', 'Salt air without a wax coat'],
    note: 'Copper is the fastest-moving surface we make. Embrace the patina or schedule the polish — both answers are correct.',
  },
  {
    key: 'sealed', name: 'Sealed & Lacquered',
    dos: ['Dry cloth only — the seal does the work', 'Gloves during installation', 'Check the fixings, not the finish'],
    nevers: ['Any abrasive or polish compound', 'Adhesive tape on the surface', 'Chlorinated cleaners'],
    note: 'A lacquer is a film, not a paint. If a mark will not wipe off it is sitting on the film, not in it — and we can strip and re-seal.',
  },
  {
    key: 'wood', name: 'Solid Wood',
    dos: ['Wipe with a barely damp cloth', 'Re-oil once a year with hard-wax oil', 'Use mats under anything hot or wet'],
    nevers: ['Standing water or a sunny windowsill', 'Silicone sprays and furniture polish', 'Dry indoor heat below 35% humidity'],
    note: 'Wood moves. Seasoned properly it moves in millimetres you will never notice — but keep it out of direct heat and it will outlive the room.',
  },
]

export const FAQS = [
  {
    group: 'Ordering', items: [
      { q: 'What is your minimum order quantity?', a: 'Catalogue pieces start at 100–300 units depending on the item; bespoke work is quoted per project and typically starts at 300 units. Samples ship in 10 days.' },
      { q: 'How fast can you quote?', a: 'Send a drawing, a photograph or a competitor sample and a priced quote returns within five working days, tooling included.' },
      { q: 'Do you do private label?', a: 'Most of our output ships under other names. Laser marking, engraving, gift boxes, barcoding and retail cartons are all done in-house.' },
    ],
  },
  {
    group: 'Manufacture', items: [
      { q: 'How do you keep hand-work consistent?', a: 'Every SKU has an approved physical master. Artisans work against it, QC compares against it, and finish colour is held to ΔE 1.5 batch to batch.' },
      { q: 'Can you match an existing finish?', a: 'Yes — send the reference piece. We match to a measured swatch and a signed-off sample, not to a description over email.' },
      { q: 'Which materials do you run?', a: 'Brass, copper, aluminium and iron on the metal floor; sheesham, mango, acacia and reclaimed teak on the wood floor. Others by arrangement.' },
    ],
  },
  {
    group: 'Logistics', items: [
      { q: 'Which incoterms do you ship on?', a: 'FOB Nhava Sheva as standard; CIF and DDP to most markets. Consolidating several SKUs into one container is routine, not an exception.' },
      { q: 'How is the work packed?', a: 'Each piece in recycled tissue and a moulded corner set, cartons rated to six drops from 76 cm. Damage claims run under 0.2%.' },
      { q: 'What are typical lead times?', a: 'Repeat orders 4–6 weeks, new tooling or new carving 8–12 weeks. Every quote carries a dated production slot rather than an estimate.' },
    ],
  },
  {
    group: 'Quality & compliance', items: [
      { q: 'Which standards do you hold?', a: 'ISO 9001:2015, BSCI social audit, FSC® mixed-sources chain of custody on timber, and REACH compliance on lacquers and coatings. Food-contact work is tested separately.' },
      { q: 'How do you control wood moisture?', a: 'Kiln-dried to 8–10% and metered again at cut, at assembly and at packing. The readings are recorded per batch and travel with the shipment.' },
      { q: 'What if a batch is wrong?', a: 'We re-run it. The dated slot system keeps a re-run inside the same quarter, and the root-cause report ships with the replacement.' },
    ],
  },
]

export const LOCATIONS = [
  { name: 'Moradabad Works', lines: ['Plot 21, Industrial Estate', 'Moradabad 244001, Uttar Pradesh'], meta: 'Metal · HQ' },
  { name: 'Saharanpur Wood Shop', lines: ['Village Nakur Road', 'Saharanpur 247001, Uttar Pradesh'], meta: 'Wood · Joinery' },
  { name: 'Delhi Office', lines: ['412 Okhla Phase III', 'New Delhi 110020'], meta: 'Export · Commercial' },
]

export const CERTS = ['ISO 9001:2015', 'BSCI audited', 'FSC® mixed sources', 'EPCH member', 'REACH', 'FDA food-contact']

export const RIBBON_TERMS = [
  'Hand-hammered', 'Sand cast', 'Sheesham', 'Antique brass', 'Lost wax',
  'Hand-turned', 'Mango wood', 'Chased & repoussé', 'Brass inlay', 'Hard-wax oil',
]

export const TOOLING_TERMS = [
  'Chasing punch', 'Raising stake', 'Buffing mop', 'Rasp & file', 'Kiln schedule',
  'Jali fret saw', 'Seasoning yard', 'Moisture meter', 'Foundry ladle', 'Lacquer booth',
]
