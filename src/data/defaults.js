/* ============ editable content — defaults ============
   Everything the admin panel can change lives here as the SHIPPED default.
   At runtime `src/lib/content.jsx` layers the admin's saved edits on top of
   these, so this file stays the fallback the site renders with on a fresh
   browser (and the thing you edit if you want to change the shipped baseline).

   Content that used to be hardcoded inside page components was moved here so
   it could be edited at all:
     · ATELIER_IMAGES + EXHIBITION_CARDS  ← src/pages/ShowsPage.jsx
     · TESTIMONIALS                       ← src/pages/TestimonialsPage.jsx
                                            and Home.jsx (they were duplicated;
                                            now one list feeds both)
     · the blog / video cards             ← src/pages/Home.jsx
     · the social links                   ← src/components/Footer.jsx        */

import { CATALOGUE, CATEGORIES } from './catalogue'

/* products — seeded from the shipped catalogue. The admin adds `subcategory`
   and `image`; every other field already existed on the catalogue records.

   The `id` matters: the admin identifies a record by it when saving or
   deleting, and catalogue entries carry only a slug. Without one, every
   product would share an `undefined` id and editing one would rewrite them
   all. It is separate from `slug` because the slug is itself editable. */
export const DEFAULT_PRODUCTS = CATALOGUE.map((p, i) => ({
  ...p,
  id: i + 1,
  subcategory: p.subcategory || '',
  image: p.image || '',
}))

/* the nine families are fixed; subcategories hang underneath them and start
   empty, so an untouched site looks exactly as it does today */
export const DEFAULT_SUBCATEGORIES = CATEGORIES.reduce((acc, cat) => {
  acc[cat] = []
  return acc
}, {})

/* reviews — one list, rendered on /testimonials and in the home rail */
export const DEFAULT_REVIEWS = [
  { id: 1, category: 'Verified order', stars: 5,
    quote: 'They send a moisture reading with the sample. Nobody else in this category has ever done that unprompted.',
    client: 'Meridian Living', role: 'Head of Product',
    tag: '300 pcs · 0 returns', location: 'Frankfurt, Germany' },
  { id: 2, category: 'Inlay project', stars: 5,
    quote: 'The brass inlay is the reason we moved. Four suppliers promised flush finish; only Taif delivered it.',
    client: 'Atelier Kade', role: 'Founding Partner',
    tag: '36 SKUs · 0.5% defects', location: 'Paris, France' },
  { id: 3, category: 'Hotel spec', stars: 5,
    quote: 'Four properties, one patina, zero visible variation. Housekeeping notices these things before we do.',
    client: 'Halcyon Hotels', role: 'Procurement Director',
    tag: 'Global boutique suites', location: 'Dubai, UAE' },
  { id: 4, category: 'Architectural', stars: 5,
    quote: 'Precision hand-carved teak paired with solid unlacquered brass. Flawless craftsmanship from Moradabad.',
    client: 'Studio Moradabad', role: 'Lead Architect',
    tag: 'Kiln-dried hardwood', location: 'London, UK' },
  { id: 5, category: 'Export line', stars: 5,
    quote: 'Every container arrives with mill certificates and batch reports inside. Incredible consistency quarter after quarter.',
    client: 'Oberoi Spaces', role: 'Global Trade VP',
    tag: '4 container shipments', location: 'Toronto, Canada' },
  { id: 6, category: 'Retail collection', stars: 5,
    quote: 'Our customers immediately touch the unlacquered brass finish. It patinas beautifully over time.',
    client: 'Vanguard Home', role: 'Creative Director',
    tag: '1,200 units delivered', location: 'New York, USA' },
]

/* blogs — the video cards in the "Blogs and socials" band on the homepage */
export const DEFAULT_BLOGS = [
  { id: 1, title: 'Inside the metal floor', videoSrc: 'https://www.youtube.com/embed/qh3NGpYRG3I', thumbnail: 'https://picsum.photos/seed/taif-the-arc/900/700', alt: 'Workshop preview 1' },
  { id: 2, title: 'Seasoning the timber', videoSrc: 'https://www.youtube.com/embed/qh3NGpYRG3I', thumbnail: 'https://picsum.photos/seed/taif-the-block/900/700', alt: 'Workshop preview 2' },
  { id: 3, title: 'Setting a brass inlay', videoSrc: 'https://www.youtube.com/embed/qh3NGpYRG3I', thumbnail: 'https://picsum.photos/seed/taif-the-sweep/900/700', alt: 'Workshop preview 3' },
  { id: 4, title: 'Raising a copper vessel', videoSrc: 'https://www.youtube.com/embed/qh3NGpYRG3I', thumbnail: 'https://picsum.photos/seed/taif-the-lean/900/700', alt: 'Workshop preview 4' },
  { id: 5, title: 'The finishing bench', videoSrc: 'https://www.youtube.com/embed/qh3NGpYRG3I', thumbnail: 'https://picsum.photos/seed/taif-the-dip/900/700', alt: 'Workshop preview 5' },
  { id: 6, title: 'Packing for the container', videoSrc: 'https://www.youtube.com/embed/qh3NGpYRG3I', thumbnail: 'https://picsum.photos/seed/taif-the-turn/900/700', alt: 'Workshop preview 6' },
]

/* socials — `platform` picks the icon, so keep it to a known key.
   An empty url hides the link rather than rendering a dead icon. */
export const SOCIAL_PLATFORMS = ['instagram', 'whatsapp', 'email', 'facebook', 'linkedin', 'youtube', 'x', 'pinterest']

export const DEFAULT_SOCIALS = [
  { id: 1, platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/taif_internaitonal93' },
  { id: 2, platform: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/919389682282' },
  { id: 3, platform: 'email', label: 'Email', url: '' },         // empty ⇒ built from BRAND.email
  { id: 4, platform: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/taif-international-8372b540a?utm_source=share_via&utm_content=profile&utm_medium=member_android' },
  { id: 5, platform: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/share/1BWf7o3JsS/' },
]

/* atelier — the wiping plate reel on /shows. `src`/`alt` is the shape
   SignatureScroll consumes, so the store feeds it straight through. */
export const DEFAULT_ATELIER = [
  { id: 1, src: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop', alt: 'Moradabad Metal Atelier & Showroom' },
  { id: 2, src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop', alt: 'Saharanpur Woodworking Craft Floor' },
  { id: 3, src: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=1600&auto=format&fit=crop', alt: 'Luxury Brass & Copper Lighting Gallery' },
  { id: 4, src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop', alt: 'Hand-Finished Architectural Furniture Floor' },
  { id: 5, src: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1600&auto=format&fit=crop', alt: 'International Trade Exhibition & Showroom' },
]

/* exhibitions — the trade-show cards on /shows */
export const DEFAULT_EXHIBITIONS = [
  { id: 1, title: 'IHGF Delhi Fair', category: 'International exposition', date: 'Autumn 2026', location: 'Greater Noida, Delhi NCR', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop' },
  { id: 2, title: 'Ambiente Frankfurt', category: 'Global home & living', date: 'Spring 2027', location: 'Frankfurt, Germany', img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop' },
  { id: 3, title: 'High Point Market', category: 'North American showcase', date: 'Spring 2027', location: 'North Carolina, USA', img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1200&auto=format&fit=crop' },
  { id: 4, title: 'Maison & Objet', category: 'Design & decoration', date: 'Autumn 2027', location: 'Paris, France', img: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=1200&auto=format&fit=crop' },
]

/* stats — the four counting placards on the homepage, and the figures quoted
   on the Partners page. One list drives both: they used to be written out
   separately and had already drifted apart (the homepage claimed 18 export
   markets while Partners claimed 16).

   `unit` is a stable key other pages look a figure up by, so renaming a label
   does not break the lookup. `value` must stay numeric — the homepage cards
   count up to it. */
export const DEFAULT_STATS = [
  { id: 1, unit: 'artisans', value: 15, suffix: '+', label: 'Hands in the workshop', sub: 'Specialist masters under one roof' },
  { id: 2, unit: 'orders', value: 600, suffix: '+', label: 'Pieces delivered per year', sub: 'Each piece finished by hand' },
  { id: 3, unit: 'countries', value: 16, suffix: '+', label: 'Countries served', sub: 'Global boutique export' },
  { id: 4, unit: 'years', value: 10, suffix: '+', label: 'Years of excellence', sub: 'Est. Moradabad atelier' },
]

/* best sellers — the grid the homepage signature-piece transition settles into.
   Stored as product slugs rather than copies of the products, so a piece edited
   in the Products tab updates here too and cannot drift out of sync.

   NINE SLOTS, fixed: the grid is three columns by three rows beneath the
   signature plate, so nine is what fills it squarely. A slot may be empty
   (the card is simply skipped) but there is never a tenth. */
export const BEST_SELLER_SLOTS = 11

export const DEFAULT_BEST_SELLERS = [
  'jali-lantern',
  'inlaid-keepsake-box',
  'hammered-ice-bucket',
  'copper-water-jug',
  'rosewood-bar-tray',
  'brass-pooja-thali',
  'cast-brass-pull',
  'sheesham-wall-panel',
  'copper-planter',
  'copper-skillet',
  'copper-cocktail-shaker',
]

/* the whole editable surface in one object — the shape the store persists and
   the shape an exported content.json takes */
export const DEFAULTS = {
  stats: DEFAULT_STATS,
  bestSellers: DEFAULT_BEST_SELLERS,
  products: DEFAULT_PRODUCTS,
  subcategories: DEFAULT_SUBCATEGORIES,
  reviews: DEFAULT_REVIEWS,
  blogs: DEFAULT_BLOGS,
  socials: DEFAULT_SOCIALS,
  atelier: DEFAULT_ATELIER,
  exhibitions: DEFAULT_EXHIBITIONS,
}
