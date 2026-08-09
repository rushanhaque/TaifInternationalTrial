/* 36 products across 9 families. `rail: true` marks pieces for the Drag Rail.
   `finishes` keys must exist in FINISHES (src/data/site.js);
   `tone` keys must exist as .tone-* in src/styles/global.css. */

export const CATEGORIES = [
  'Wooden Products', 'Copper Products', 'Home Decor', 'Hardware Supplies',
  'Corporate Gifting', 'Religious Supplies', 'Bathroom Accessories',
  'Kitchenware', 'Barware'
]

export const CATALOGUE = [
  // Wooden Products
  { slug: 'wooden-serving-board', name: 'Wooden Serving Board', category: 'Wooden Products', tone: 'wood', material: 'Mango Wood', finishes: ['natural'], dims: '460 × 220 × 24 mm', weight: '1.05 kg', moq: 100, lead: '4 wks', idx: '01', story: 'Hand-carved serving board from sustainably sourced mango wood.' },
  { slug: 'sheesham-wall-panel', name: 'Sheesham Wall Panel', category: 'Wooden Products', tone: 'walnut', material: 'Sheesham', finishes: ['natural', 'inlay'], dims: '900 × 600 × 35 mm', weight: '6.20 kg', moq: 50, lead: '9 wks', idx: '02', story: 'Relief-carved from a single seasoned slab, not assembled from strips.' },
  { slug: 'wooden-stool', name: 'Wooden Stool', category: 'Wooden Products', tone: 'wood', material: 'Acacia', finishes: ['natural'], dims: '460 × 380 × 460 mm', weight: '3.60 kg', moq: 100, lead: '8 wks', idx: '03', story: 'Solid acacia stool, tested to 150 kg and 20,000 folds.' },
  { slug: 'teak-wood-bowl', name: 'Teak Wood Bowl', category: 'Wooden Products', tone: 'walnut', material: 'Teak', finishes: ['natural'], dims: 'Ø 200 × 80 mm', weight: '0.80 kg', moq: 150, lead: '6 wks', idx: '04', story: 'Hand-turned from reclaimed teak wood, finished with natural oils.' },
  
  // Copper Products
  { slug: 'copper-water-jug', name: 'Copper Water Jug', category: 'Copper Products', tone: 'copper', material: 'Copper', finishes: ['burnished', 'antique'], dims: 'Ø 110 × 240 mm · 1.2 L', weight: '0.62 kg', moq: 150, lead: '5 wks', idx: '05', story: 'Raised, seamed and burnished by hand, then sealed food-safe inside.' },
  { slug: 'copper-planter', name: 'Copper Planter', category: 'Copper Products', tone: 'copper', material: 'Copper', finishes: ['burnished', 'antique'], dims: 'Ø 300 × 260 mm', weight: '1.85 kg', moq: 150, lead: '6 wks', idx: '06', story: 'Spun, seamed and sealed watertight, with a lacquered interior.' },
  { slug: 'hammered-copper-tray', name: 'Hammered Copper Tray', category: 'Copper Products', tone: 'copper', material: 'Copper', finishes: ['hammered', 'burnished'], dims: '400 × 300 × 20 mm', weight: '1.20 kg', moq: 200, lead: '6 wks', idx: '07', story: 'Hand-hammered tray with raised edges, perfect for serving.' },
  { slug: 'copper-tumbler', name: 'Copper Tumbler', category: 'Copper Products', tone: 'copper', material: 'Copper', finishes: ['burnished'], dims: 'Ø 80 × 100 mm', weight: '0.20 kg', moq: 500, lead: '4 wks', idx: '08', story: 'Classic copper tumbler, unlined for health benefits.' },

  // Home Decor
  { slug: 'jali-lantern', name: 'Jali Lantern', category: 'Home Decor', tone: 'antique', material: 'Brass', finishes: ['antique', 'hammered'], dims: '180 × 180 × 320 mm', weight: '1.30 kg', moq: 200, lead: '7 wks', rail: true, idx: '09', story: 'Fretwork cut by hand, panel by panel, so the light it throws is a drawing.' },
  { slug: 'inlaid-keepsake-box', name: 'Inlaid Keepsake Box', category: 'Home Decor', tone: 'inlay', material: 'Sheesham + Brass', finishes: ['inlay', 'natural'], dims: '220 × 150 × 80 mm', weight: '0.74 kg', moq: 300, lead: '6 wks', rail: true, idx: '10', story: 'Brass wire let into rosewood and levelled flush.' },
  { slug: 'brass-vase', name: 'Brass Vase', category: 'Home Decor', tone: 'brass', material: 'Brass', finishes: ['antique', 'burnished'], dims: 'Ø 120 × 250 mm', weight: '0.90 kg', moq: 200, lead: '5 wks', idx: '11', story: 'Spun brass vase with a slender neck and weighted base.' },
  { slug: 'decorative-wall-mirror', name: 'Decorative Wall Mirror', category: 'Home Decor', tone: 'antique', material: 'Brass', finishes: ['antique', 'hammered'], dims: 'Ø 600 mm', weight: '4.50 kg', moq: 100, lead: '8 wks', idx: '12', story: 'Round mirror framed in hand-hammered antique brass.' },

  // Hardware Supplies
  { slug: 'cast-brass-pull', name: 'Cast Brass Pull', category: 'Hardware Supplies', tone: 'brass', material: 'Brass', finishes: ['antique', 'hammered', 'burnished'], dims: '160 × 32 × 38 mm', weight: '0.24 kg', moq: 600, lead: '5 wks', idx: '13', story: 'Lost-wax cast, hand-filed and finished, fixings included.' },
  { slug: 'rosewood-brass-knob', name: 'Rosewood & Brass Knob', category: 'Hardware Supplies', tone: 'inlay', material: 'Sheesham + Brass', finishes: ['inlay', 'natural', 'antique'], dims: 'Ø 38 × 45 mm', weight: '0.09 kg', moq: 1000, lead: '4 wks', idx: '14', story: 'A turned rosewood knob on a machined brass collar.' },
  { slug: 'flush-brass-hinge', name: 'Flush Brass Hinge', category: 'Hardware Supplies', tone: 'brass', material: 'Brass', finishes: ['burnished'], dims: '75 × 50 × 3 mm', weight: '0.15 kg', moq: 1000, lead: '5 wks', idx: '15', story: 'Heavy-duty brass hinge, precision milled for smooth operation.' },
  { slug: 'antique-drawer-pull', name: 'Antique Drawer Pull', category: 'Hardware Supplies', tone: 'antique', material: 'Brass', finishes: ['antique'], dims: '120 × 40 × 20 mm', weight: '0.18 kg', moq: 800, lead: '4 wks', idx: '16', story: 'Classic cup pull, chemically aged and relieved on high points.' },

  // Corporate Gifting
  { slug: 'brass-desk-clock', name: 'Brass Desk Clock', category: 'Corporate Gifting', tone: 'brass', material: 'Brass', finishes: ['burnished'], dims: 'Ø 100 × 40 mm', weight: '0.45 kg', moq: 200, lead: '6 wks', idx: '17', story: 'Minimalist desk clock, housed in a solid brass casing.' },
  { slug: 'wooden-pen-stand', name: 'Wooden Pen Stand', category: 'Corporate Gifting', tone: 'walnut', material: 'Sheesham + Brass', finishes: ['inlay'], dims: '80 × 80 × 100 mm', weight: '0.30 kg', moq: 300, lead: '5 wks', idx: '18', story: 'Rosewood pen stand with brass inlay detailing.' },
  { slug: 'copper-flask', name: 'Copper Flask', category: 'Corporate Gifting', tone: 'copper', material: 'Copper', finishes: ['burnished'], dims: '90 × 25 × 120 mm', weight: '0.25 kg', moq: 250, lead: '6 wks', idx: '19', story: 'Pocket flask, formed from copper and lined with tin.' },
  { slug: 'engraved-brass-tray', name: 'Engraved Brass Tray', category: 'Corporate Gifting', tone: 'antique', material: 'Brass', finishes: ['antique'], dims: '200 × 100 × 10 mm', weight: '0.40 kg', moq: 500, lead: '5 wks', idx: '20', story: 'Small catch-all tray, perfect for corporate engraving.' },

  // Religious Supplies
  { slug: 'brass-pooja-thali', name: 'Brass Pooja Thali', category: 'Religious Supplies', tone: 'brass', material: 'Brass', finishes: ['burnished', 'hammered'], dims: 'Ø 300 × 25 mm', weight: '0.85 kg', moq: 200, lead: '6 wks', idx: '21', story: 'Traditional offering plate, spun and hand-polished.' },
  { slug: 'copper-kalash', name: 'Copper Kalash', category: 'Religious Supplies', tone: 'copper', material: 'Copper', finishes: ['burnished'], dims: 'Ø 120 × 150 mm', weight: '0.40 kg', moq: 300, lead: '5 wks', idx: '22', story: 'Seamless copper vessel for ritual water offerings.' },
  { slug: 'brass-diya', name: 'Brass Diya', category: 'Religious Supplies', tone: 'brass', material: 'Brass', finishes: ['burnished'], dims: 'Ø 60 × 40 mm', weight: '0.15 kg', moq: 1000, lead: '4 wks', idx: '23', story: 'Cast brass oil lamp, available in multiple sizes.' },
  { slug: 'temple-bell', name: 'Temple Bell', category: 'Religious Supplies', tone: 'antique', material: 'Brass', finishes: ['antique'], dims: 'Ø 80 × 120 mm', weight: '0.50 kg', moq: 400, lead: '6 wks', idx: '24', story: 'Hand-cast bell with a clear, sustained resonance.' },

  // Bathroom Accessories
  { slug: 'brass-towel-ring', name: 'Brass Towel Ring', category: 'Bathroom Accessories', tone: 'brass', material: 'Brass', finishes: ['burnished', 'antique'], dims: 'Ø 150 × 20 mm', weight: '0.35 kg', moq: 300, lead: '6 wks', idx: '25', story: 'Solid brass ring with a concealed wall mount.' },
  { slug: 'copper-soap-dish', name: 'Copper Soap Dish', category: 'Bathroom Accessories', tone: 'copper', material: 'Copper', finishes: ['burnished'], dims: '120 × 80 × 15 mm', weight: '0.20 kg', moq: 500, lead: '5 wks', idx: '26', story: 'Formed copper dish with drainage ridges.' },
  { slug: 'brass-dispenser', name: 'Brass Dispenser', category: 'Bathroom Accessories', tone: 'antique', material: 'Brass', finishes: ['antique'], dims: 'Ø 70 × 180 mm', weight: '0.60 kg', moq: 250, lead: '6 wks', idx: '27', story: 'Liquid soap dispenser with a reliable brass pump.' },
  { slug: 'marble-brass-tray', name: 'Marble & Brass Tray', category: 'Bathroom Accessories', tone: 'inlay', material: 'Marble + Brass', finishes: ['natural', 'burnished'], dims: '300 × 150 × 20 mm', weight: '1.50 kg', moq: 200, lead: '8 wks', idx: '28', story: 'White marble vanity tray with a brass gallery rail.' },

  // Kitchenware
  { slug: 'brass-spice-box', name: 'Brass Spice Box', category: 'Kitchenware', tone: 'brass', material: 'Brass', finishes: ['burnished'], dims: 'Ø 200 × 60 mm', weight: '1.20 kg', moq: 150, lead: '6 wks', idx: '29', story: 'Traditional masala dabba with seven internal bowls.' },
  { slug: 'copper-skillet', name: 'Copper Skillet', category: 'Kitchenware', tone: 'copper', material: 'Copper', finishes: ['burnished'], dims: 'Ø 260 × 45 mm', weight: '1.80 kg', moq: 100, lead: '8 wks', idx: '30', story: 'Heavy-gauge copper skillet, tin-lined for cooking.' },
  { slug: 'brass-ladle', name: 'Brass Ladle', category: 'Kitchenware', tone: 'brass', material: 'Brass', finishes: ['burnished'], dims: '350 × 90 × 40 mm', weight: '0.30 kg', moq: 400, lead: '5 wks', idx: '31', story: 'Hand-forged handle riveted to a spun brass bowl.' },
  { slug: 'wooden-chopping-block', name: 'Wooden Chopping Block', category: 'Kitchenware', tone: 'wood', material: 'Acacia', finishes: ['natural'], dims: '400 × 300 × 40 mm', weight: '3.20 kg', moq: 200, lead: '6 wks', idx: '32', story: 'End-grain acacia block, treated with food-grade mineral oil.' },

  // Barware
  { slug: 'hammered-ice-bucket', name: 'Hammered Ice Bucket', category: 'Barware', tone: 'brass', material: 'Brass', finishes: ['hammered', 'antique'], dims: 'Ø 180 × 200 mm', weight: '1.15 kg', moq: 150, lead: '6 wks', idx: '33', story: 'Double-walled so the outside stays dry and the ice stays whole.' },
  { slug: 'rosewood-bar-tray', name: 'Rosewood Bar Tray', category: 'Barware', tone: 'walnut', material: 'Sheesham + Brass', finishes: ['inlay', 'natural'], dims: '380 × 260 × 30 mm', weight: '1.40 kg', moq: 150, lead: '6 wks', rail: true, idx: '34', story: 'A dark rosewood tray with brass gallery rails and inlaid corner lines.' },
  { slug: 'brass-coaster-set', name: 'Brass Coaster Set', category: 'Barware', tone: 'antique', material: 'Brass', finishes: ['antique', 'hammered'], dims: 'Ø 100 × 6 mm', weight: '0.11 kg', moq: 600, lead: '4 wks', idx: '35', story: 'Cast, faced and antiqued, with a felted underside cut to the disc.' },
  { slug: 'copper-cocktail-shaker', name: 'Copper Cocktail Shaker', category: 'Barware', tone: 'copper', material: 'Copper', finishes: ['burnished'], dims: 'Ø 90 × 220 mm', weight: '0.45 kg', moq: 250, lead: '6 wks', idx: '36', story: 'Classic three-piece cobbler shaker, tin-lined interior.' },
]

export const bySlug = (slug) => CATALOGUE.find((p) => p.slug === slug)
export const railItems = () => CATALOGUE.filter((p) => p.rail)
