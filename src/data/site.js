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
  line: 'An Atelier of Metal and Wood',
  descriptor: 'Metal & Wood Handicraft Manufacture · Export',
  est: '1998',
  origin: 'Moradabad · India',
  /* Every mailto: and wa.me link on the site derives from these two — the
     footer icons, the contact page, the enquiry forms and the JSON-LD. Change
     them here and every enquiry route follows. */
  email: 'internationaltaif93@gmail.com',
  phone: '+91 9389686112',
  instagram: 'https://instagram.com/taif_internaitonal93',
  /* The canonical production origin, no trailing slash. Every canonical URL,
     og:url and structured-data URL derives from this. Leave it empty and the
     site canonicalises to whatever origin is serving it, which is what you
     want on a preview deploy and NOT what you want in production. */
  url: 'https://taifinternational.com',
}

export const NAV_LINKS = [
  { to: '/collections', label: 'Collections' },
  { to: '/shows', label: 'Shows' },
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
  { to: '/catalogue', label: 'Catalogue' },
  { to: '/testimonials', label: 'Testimonials' },
  { to: '/care', label: 'Care' },
  { to: '/faq', label: 'FAQ' },
]

export const FIGURES = [
  { value: '15+', unit: 'artisans', label: 'People working in the workshop' },
  { value: '600+', unit: 'orders', label: 'Estimated orders fulfilled per year' },
  { value: '16', unit: 'countries', label: 'Export markets shipped worldwide' },
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
    key: 'antique', name: 'Polished', tone: 'antique',
    substrates: ['Brass', 'Copper', 'Steel'],
    character: 'Buffed to a mirror shine on the wheel, then sealed — the brightest, most reflective finish on the floor.',
    durability: 'Multi-stage buffing to a true mirror face, then clear-lacquered to hold the shine without fogging over.',
    care: 'Soft dry cloth. A quick wipe keeps the mirror; fingerprints lift straight off unlacquered pieces.',
  },
  {
    key: 'burnished', name: 'Antique', tone: 'copper',
    substrates: ['Brass', 'Copper', 'Iron'],
    character: 'Aged forward by hand until it reads a century old, then stopped exactly where we want it.',
    durability: 'Chemically aged, relieved on the high points, sealed under matte lacquer. Colour is held to a physical master swatch, batch to batch.',
    care: 'Dust only. Polishing removes the age you paid for.',
  },
  {
    key: 'natural', name: 'Nickel', tone: 'wood',
    substrates: ['Brass', 'Steel', 'Zinc Alloy'],
    character: 'Plated in a cool, bright nickel that resists tarnish and fingerprints far longer than raw brass.',
    durability: 'Electroplated to a controlled micron thickness over a brass or steel base, then buffed level.',
    care: 'Wipe with a soft cloth. No polish needed — nickel holds its shine without upkeep.',
  },
  {
    key: 'inlay', name: 'Oil-Rubbed Bronze', tone: 'walnut',
    substrates: ['Brass', 'Zinc Alloy'],
    character: 'A dark, worked bronze with warm highlights left standing on the raised detail — hand-rubbed, not sprayed flat.',
    durability: 'Oxidised and oil-rubbed in stages so the high points stay bright against the darkened field, then sealed.',
    care: 'Dry cloth only. The finish deepens gently with handling rather than wearing away.',
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
  { name: 'Brass', tone: 'brass' },
  { name: 'Copper', tone: 'copper' },
  { name: 'Aluminium', tone: 'antique' },
  { name: 'Sheesham', tone: 'walnut' },
  { name: 'Mango Wood', tone: 'wood' },
  { name: 'Reclaimed Teak', tone: 'inlay' },
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
  { year: '2026', copy: 'Today: 15+ artisans, 16 export markets, and six materials.' },
]

export const PRINCIPLES = [
  { name: 'The joint is the product', copy: 'Anyone can make a brass bowl or a wooden base. The reason to choose us is the line where they meet — flush, tight, and still tight after a container crossing in July.' },
  { name: 'Hand-made, factory-repeatable', copy: 'Every piece is worked by hand. Every batch is checked against a physical master. Craft and consistency are not opposites; holding both at once is the whole job.' },
  { name: 'Season the wood, respect the metal', copy: 'Most handicraft failures are moisture failures. We dry, rest and measure before a single cut. The least glamorous stage decides everything after it.' },
  { name: 'Papers travel with the goods', copy: 'Mill certificates, harvest documents, test reports and packing lists ship inside the container. If we cannot document a claim, we do not make it.' },
]

/* Three cards, deliberately — the About page shows the whole of this list, so
   adding a fourth entry adds a fourth card and breaks the three-up rhythm.
   `seam` is the line revealed when the card splits on hover; keep it short.

   NOTE FOR HANDOVER: these names are still placeholders. Swap them, their
   roles and their `since` years for the real bench before launch. */
export const TEAM = [
  {
    name: 'Imran Taif',
    role: 'Founder & Managing Director',
    discipline: 'The bench',
    since: '1998',
    seam: 'Signs off every sample against the master.',
  },
  {
    name: 'Devendra Sharma',
    role: 'Master Metalsmith',
    discipline: 'Metal floor',
    since: '2004',
    seam: 'Raises, chases and planishes by hand.',
  },
  {
    name: 'Anjali Rawat',
    role: 'Wood Shop & Seasoning',
    discipline: 'Wood floor',
    since: '2009',
    seam: 'Meters moisture before a single cut.',
  },
]

export const TESTIMONIALS = [
  { quote: 'They send a moisture reading with the sample. Nobody else in this category has ever done that unprompted.', who: 'Head of Product', org: 'Meridian Living' },
  { quote: 'The inlay is the reason we moved. Four suppliers said flush; only this one delivered flush a year later.', who: 'Founding Partner', org: 'Atelier Kade' },
  { quote: 'Four properties, one patina, zero visible variation. Housekeeping notices these things before we do.', who: 'Procurement Director', org: 'Halcyon Hotels' },
]

export const CARE = [
  {
    key: 'brass', name: 'Brass',
    subtitle: 'Unlacquered & Polished Brass',
    dos: ['Wipe with a soft dry microfibre cloth weekly', 'Use mild soap water for removing fingerprints', 'Apply museum wax twice a year to preserve mirror polish'],
    nevers: ['Harsh chemical cleaners, bleach, or ammonia', 'Abrasive pads, steel wool, or scouring powder', 'Automatic dishwashers'],
    note: 'Left raw, brass naturally patinas to a rich warm umber. If preferred, a 5-minute polish restores its day-one golden sheen.',
  },
  {
    key: 'copper', name: 'Copper',
    subtitle: 'Hand-Hammered Copper Vessels',
    dos: ['Rinse thoroughly and dry immediately after use', 'Use natural lemon juice and salt for fast brightening', 'Ensure inner lining remains food-safe'],
    nevers: ['Leaving acidic liquids or vinegar standing', 'Scouring the tinned interior lining', 'Salt air exposure without a protective wax coat'],
    note: 'Copper is a living, breathing metal. Embrace the evolving natural patina or re-brighten periodically as needed.',
  },
  {
    key: 'wood', name: 'Solid Wood',
    subtitle: 'Kiln-Dried Sheesham, Mango & Teak',
    dos: ['Wipe clean using a slightly damp cloth', 'Re-oil annually with food-safe hard-wax oil', 'Use protective mats under hot or wet items'],
    nevers: ['Direct sunlight or placement right next to heaters', 'Silicone furniture sprays or harsh detergents', 'Soaking in water or placing in high humidity above 75%'],
    note: 'Our timber is kiln-dried to 8–10% moisture content. Proper care ensures the wood holds its shape and finish for decades.',
  },
  {
    key: 'aluminium', name: 'Aluminium',
    subtitle: 'Cast & Brushed Aluminium',
    dos: ['Clean with warm water and mild neutral detergent', 'Dry with a lint-free cloth to avoid water spots', 'Store in a dry, ventilated area'],
    nevers: ['Acidic or alkaline chemical solutions', 'Scouring pads that scratch polished surfaces', 'Direct contact with harsh outdoor salt spray'],
    note: 'Aluminium is lightweight and naturally corrosion-resistant. Regular gentle wiping keeps the smooth brushed surface pristine.',
  },
  {
    key: 'iron-steel', name: 'Iron & Steel',
    subtitle: 'Hand-Forged Iron & Powder-Coated Steel',
    dos: ['Wipe with a dry cloth after outdoor use', 'Apply a light oil coat on bare forged iron surfaces', 'Inspect rubber feet and mounting screws periodically'],
    nevers: ['Leaving standing water or prolonged moisture', 'Scratching powder-coated protective layers', 'Exposure to unvented damp environments'],
    note: 'Powder-coated finishes form a durable shield against rust. Any surface scratches can be touched up easily with metal sealant.',
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

/* The single real address. The Saharanpur and Delhi entries that used to sit
   beside this one were placeholders written to the right shape — they are gone
   rather than left to read as premises the business does not have. */
export const LOCATIONS = [
  {
    name: 'Moradabad Works',
    lines: ['Sarai Husaini Begum, Jhabbu Ka Nala', 'Moradabad 244001, Uttar Pradesh'],
    meta: 'Metal & Wood · HQ',
    /* The surveyed pin, from the Google Maps listing for Taif International.
       Geocoding the address text landed near enough to be plausible and wrong;
       these are the listing's own marker coordinates, so the embed centres on
       the works itself rather than on whatever the address string resolves to.
       `share` is the canonical short link — it opens the real listing, with
       the name, photographs and reviews attached. */
    coords: { lat: 28.8433785, lng: 78.7761936 },
    share: 'https://maps.app.goo.gl/YT9Lk9AvQiLiCqiy8',
  },
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
