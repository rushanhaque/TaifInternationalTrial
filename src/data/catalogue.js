/* 20 products, 6 families. `rail: true` marks the six Drag Rail pieces (E9).
   `finishes` keys must exist in FINISHES (src/data/site.js);
   `tone` keys must exist as .tone-* in src/styles/global.css. */

export const CATEGORIES = ['Tableware', 'Barware', 'Décor', 'Lighting', 'Furniture', 'Bespoke']

export const CATALOGUE = [
  { slug: 'hammered-serving-bowl', name: 'Hammered Serving Bowl', category: 'Tableware', tone: 'brass', material: 'Brass IS 319',
    finishes: ['hammered', 'antique', 'burnished'], dims: 'Ø 280 × 95 mm', weight: '0.86 kg', moq: 200, lead: '6 wks', rail: true, idx: '01',
    story: 'Raised from a single brass disc and struck by hand until the surface carries its own light. The centrepiece that lets the table do the decorating.' },
  { slug: 'sheesham-brass-platter', name: 'Sheesham & Brass Platter', category: 'Tableware', tone: 'inlay', material: 'Sheesham + Brass',
    finishes: ['inlay', 'natural'], dims: '420 × 300 × 22 mm', weight: '1.24 kg', moq: 150, lead: '6 wks', idx: '02',
    story: 'A rosewood platter with a brass rim set flush into the edge. Two materials, one plane — the whole company argument in a single object.' },
  { slug: 'copper-water-jug', name: 'Copper Water Jug', category: 'Tableware', tone: 'copper', material: 'Copper C11000',
    finishes: ['burnished', 'antique'], dims: 'Ø 110 × 240 mm · 1.2 L', weight: '0.62 kg', moq: 300, lead: '5 wks', idx: '03',
    story: 'Raised, seamed and burnished by hand, then sealed food-safe inside. Warm to hold, cold to drink from, and antimicrobial by nature.' },
  { slug: 'mango-wood-board', name: 'Mango Wood Board', category: 'Tableware', tone: 'wood', material: 'Mango Wood',
    finishes: ['natural'], dims: '460 × 220 × 24 mm', weight: '1.05 kg', moq: 250, lead: '4 wks', idx: '04',
    story: 'Cut from orchard trees past fruiting age, dried to 8% and finished in food-safe hard-wax oil. Open grain, no two boards alike.' },

  { slug: 'hammered-ice-bucket', name: 'Hammered Ice Bucket', category: 'Barware', tone: 'brass', material: 'Brass IS 319',
    finishes: ['hammered', 'antique'], dims: 'Ø 180 × 200 mm', weight: '1.15 kg', moq: 150, lead: '6 wks', idx: '05',
    story: 'Double-walled so the outside stays dry and the ice stays whole. The hammer texture hides the fingerprints a busy bar will give it.' },
  { slug: 'rosewood-bar-tray', name: 'Rosewood Bar Tray', category: 'Barware', tone: 'walnut', material: 'Sheesham + Brass',
    finishes: ['inlay', 'natural'], dims: '380 × 260 × 30 mm', weight: '1.40 kg', moq: 150, lead: '6 wks', rail: true, idx: '06',
    story: 'A dark rosewood tray with brass gallery rails and inlaid corner lines. Heavy enough to stay put when the room gets busy.' },
  { slug: 'brass-coaster-set', name: 'Brass Coaster Set', category: 'Barware', tone: 'antique', material: 'Brass IS 319',
    finishes: ['antique', 'hammered'], dims: 'Ø 100 × 6 mm', weight: '0.11 kg', moq: 600, lead: '4 wks', idx: '07',
    story: 'Cast, faced and antiqued, with a felted underside cut to the disc. Ages a shade darker every year, which is the point of buying brass.' },

  { slug: 'jali-lantern', name: 'Jali Lantern', category: 'Décor', tone: 'antique', material: 'Brass IS 319',
    finishes: ['antique', 'hammered'], dims: '180 × 180 × 320 mm', weight: '1.30 kg', moq: 200, lead: '7 wks', rail: true, idx: '08',
    story: 'Fretwork cut by hand, panel by panel, so the light it throws is a drawing rather than a glow. Candle or LED insert, both supplied.' },
  { slug: 'carved-wall-panel', name: 'Carved Wall Panel', category: 'Décor', tone: 'walnut', material: 'Sheesham',
    finishes: ['natural', 'inlay'], dims: '900 × 600 × 35 mm', weight: '6.20 kg', moq: 50, lead: '9 wks', idx: '09',
    story: 'Relief-carved from a single seasoned slab, not assembled from strips. Hangs on a French cleat that ships fitted and levelled.' },
  { slug: 'copper-planter', name: 'Copper Planter', category: 'Décor', tone: 'copper', material: 'Copper C11000',
    finishes: ['burnished', 'antique'], dims: 'Ø 300 × 260 mm', weight: '1.85 kg', moq: 150, lead: '6 wks', idx: '10',
    story: 'Spun, seamed and sealed watertight, with a lacquered interior so the plant does not decide the finish for you.' },
  { slug: 'inlaid-keepsake-box', name: 'Inlaid Keepsake Box', category: 'Décor', tone: 'inlay', material: 'Sheesham + Brass',
    finishes: ['inlay', 'natural'], dims: '220 × 150 × 80 mm', weight: '0.74 kg', moq: 300, lead: '6 wks', rail: true, idx: '11',
    story: 'Brass wire let into rosewood and levelled flush, on a lid that closes with a soft brass click. The piece that wins the sample meeting.' },

  { slug: 'hammered-pendant', name: 'Hammered Pendant', category: 'Lighting', tone: 'brass', material: 'Brass IS 319',
    finishes: ['hammered', 'antique', 'burnished'], dims: 'Ø 320 × 260 mm', weight: '1.60 kg', moq: 100, lead: '8 wks', rail: true, idx: '12',
    story: 'A spun and hammered shade that scatters light across its own inner face. CE and UL fittings available; cable length to order.' },
  { slug: 'turned-wood-lamp', name: 'Turned Wood Lamp', category: 'Lighting', tone: 'wood', material: 'Mango + Brass',
    finishes: ['natural', 'inlay'], dims: 'Ø 180 × 420 mm', weight: '2.30 kg', moq: 100, lead: '8 wks', idx: '13',
    story: 'Turned from one billet on a hand lathe, with a brass collar and a weighted base. The switch is machined brass and worth pressing twice.' },
  { slug: 'fretwork-sconce', name: 'Fretwork Sconce', category: 'Lighting', tone: 'antique', material: 'Brass IS 319',
    finishes: ['antique', 'hammered'], dims: '220 × 120 × 300 mm', weight: '1.10 kg', moq: 150, lead: '8 wks', idx: '14',
    story: 'A half-lantern that washes the wall through cut brass. Backplate and fixings included; driver remote for hotel specification.' },

  { slug: 'brass-clad-side-table', name: 'Brass-Clad Side Table', category: 'Furniture', tone: 'inlay', material: 'Sheesham + Brass',
    finishes: ['hammered', 'natural', 'inlay'], dims: 'Ø 450 × 520 mm', weight: '8.40 kg', moq: 50, lead: '10 wks', rail: true, idx: '15',
    story: 'A hammered brass top wrapped over a seasoned rosewood frame, pinned rather than glued so the two can move at their own speeds.' },
  { slug: 'sheesham-console', name: 'Sheesham Console', category: 'Furniture', tone: 'walnut', material: 'Sheesham + Brass',
    finishes: ['natural', 'inlay'], dims: '1200 × 380 × 780 mm', weight: '26.0 kg', moq: 40, lead: '10 wks', idx: '16',
    story: 'Mortise-and-tenon throughout, with inlaid brass lines along the apron. Ships flat-packed to four bolts, assembled in ten minutes.' },
  { slug: 'folding-campaign-stool', name: 'Folding Campaign Stool', category: 'Furniture', tone: 'wood', material: 'Acacia + Brass',
    finishes: ['natural', 'antique'], dims: '460 × 380 × 460 mm', weight: '3.60 kg', moq: 100, lead: '8 wks', idx: '17',
    story: 'Solid acacia on antique-brass hinges, tested to 150 kg and 20,000 folds. Stacks eight deep on a pallet, which the freight quote will like.' },

  { slug: 'cast-brass-pull', name: 'Cast Brass Pull', category: 'Bespoke', tone: 'brass', material: 'Brass IS 319',
    finishes: ['antique', 'hammered', 'burnished'], dims: '160 × 32 × 38 mm', weight: '0.24 kg', moq: 600, lead: '5 wks', idx: '18',
    story: 'Lost-wax cast, hand-filed and finished, fixings included. Specified by the thousand for joinery packages and hotel refits.' },
  { slug: 'rosewood-brass-knob', name: 'Rosewood & Brass Knob', category: 'Bespoke', tone: 'inlay', material: 'Sheesham + Brass',
    finishes: ['inlay', 'natural', 'antique'], dims: 'Ø 38 × 45 mm', weight: '0.09 kg', moq: 1000, lead: '4 wks', idx: '19',
    story: 'A turned rosewood knob on a machined brass collar, sold with three spindle lengths so the joiner never has to call you back.' },
  { slug: 'atelier-commission', name: 'Atelier Commission', category: 'Bespoke', tone: 'antique', material: 'To specification',
    finishes: ['hammered', 'antique', 'burnished', 'natural', 'inlay'], dims: 'To drawing', weight: '—', moq: 300, lead: '8–12 wks', idx: '20',
    story: 'Your drawing, our floors. Send a file, a photograph or a sample; a priced quote with tooling and a dated slot returns in five working days.' },
]

export const bySlug = (slug) => CATALOGUE.find((p) => p.slug === slug)
export const railItems = () => CATALOGUE.filter((p) => p.rail)
