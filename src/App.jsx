import { Component, useEffect } from 'react'
import { ScrollTrigger } from './lib/gsap'
import { Router } from './lib/router'
import { BRAND } from './data/site'
import { productBySlug as bySlug } from './lib/content'
import { productLd, breadcrumbLd, collectionLd } from './lib/seo'
import Preloader from './components/Preloader'
import Viscosity from './components/Viscosity'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SectionStack from './components/SectionStack'
import ClickSpark from './components/ClickSpark'
import Ambient from './components/mk2/Ambient'
import RevealGuard from './components/mk2/RevealGuard'
import Interactions from './components/mk2/Interactions'
import SceneReveal from './components/SceneReveal'
import Cart from './components/mk2/Cart'
import { CartProvider } from './lib/cart'

import Home from './pages/Home'
import CollectionsPage from './pages/CollectionsPage'
import CollectionPage, { resolveFamily, familyPieces, canonicalFamilySlug } from './pages/CollectionPage'
import ProductPage from './pages/ProductPage'
import CataloguePage from './pages/CataloguePage'
import ShowsPage from './pages/ShowsPage'
import AboutPage from './pages/AboutPage'
import PartnersPage from './pages/PartnersPage'
import TestimonialsPage from './pages/TestimonialsPage'
import CarePage from './pages/CarePage'
import ContactPage from './pages/ContactPage'
import FaqPage from './pages/FaqPage'
import LegalPage from './pages/LegalPage'
import NotFoundPage from './pages/NotFoundPage'
import AdminPage from './pages/AdminPage'

const B = BRAND.name
const t = (s) => `${s} — ${B}`

/* recover the family name from its URL slug. resolveFamily knows both the
   declared families and the raw catalogue categories, so titles are right
   for every collection — including the ones with no stock filed yet. */
const familyName = (slug) => resolveFamily(slug) || 'Collection'

const ROUTES = [
  { path: '/', page: Home, idx: '0.1', name: 'Home',
    title: `${B} — ${BRAND.line} · Metal & Wood Handicraft`,
    desc: 'Metal and wood handicraft manufacture and export. Hand-hammered brass, burnished copper, seasoned sheesham and flush brass inlay, made in Moradabad, India.' },
  { path: '/collections', page: CollectionsPage, idx: '0.2', name: 'Collections',
    title: t('Collections'),
    desc: 'Nine families — wooden products, copper products, home decor, hardware, corporate gifting, religious supplies, bathroom accessories, kitchenware and barware.' },
  { path: '/collections/:family', page: CollectionPage, idx: '0.2', transition: 'slide',
    name: (p) => familyName(p.family),
    title: (p) => t(familyName(p.family)),
    desc: (p) => `${familyName(p.family)} — production pieces with dimensions, MOQ and lead times.`,
    /* an unrecognised family renders "No such family." — say so in the head */
    ok: (p) => !!resolveFamily(p.family),
    /* both naming schemes resolve, but only the family slug is indexable */
    canonical: (p) => `/collections/${canonicalFamilySlug(resolveFamily(p.family))}`,
    jsonLd: (p) => {
      const fam = resolveFamily(p.family)
      if (!fam) return null
      return collectionLd(fam, familyPieces(fam), `/collections/${canonicalFamilySlug(fam)}`)
    } },
  { path: '/catalogue', page: CataloguePage, idx: '0.25', name: 'Catalogue',
    title: t('Catalogue'),
    desc: 'Every piece TAIF makes, filed under one list — dimensions, MOQ and lead times.' },
  { path: '/catalogue/:slug', page: ProductPage, idx: '0.3', transition: 'slide',
    name: (p) => bySlug(p.slug)?.name || 'Product',
    title: (p) => t(bySlug(p.slug)?.name || 'Product'),
    desc: (p) => bySlug(p.slug)?.story || `Handmade metal and wood pieces by ${B}.`,
    /* an unknown slug renders NotFoundPage — without this it shipped a 200
       titled "Product — TAIF INTERNATIONAL", an indexable page advertising
       a product that does not exist */
    ok: (p) => !!bySlug(p.slug),
    jsonLd: (p) => {
      const piece = bySlug(p.slug)
      if (!piece) return null
      return [
        productLd(piece),
        breadcrumbLd([
          { name: 'Collections', path: '/collections' },
          { name: piece.name, path: `/catalogue/${piece.slug}` },
        ]),
      ]
    } },
  { path: '/shows', page: ShowsPage, idx: '0.75', name: 'Shows',
    title: t('Shows & Showroom'),
    desc: 'Exhibitions, international trade shows and Moradabad atelier showroom.' },
  { path: '/about', page: AboutPage, idx: '0.8', name: 'About',
    title: t('About'),
    desc: 'Founded 1998 in Moradabad. 15+ artisans, 600+ yearly orders, 16 export markets.' },
  { path: '/testimonials', page: TestimonialsPage, idx: '0.85', name: 'Testimonials',
    title: t('Testimonials'),
    desc: 'Client reviews, trade partner testimonials and verified order feedback.' },
  { path: '/partners', page: PartnersPage, idx: '0.9', name: 'Partners',
    title: t('Partners'),
    desc: 'Hospitality groups, retailers, design studios and architects who ship our metal and wood under their own names.' },
  { path: '/care', page: CarePage, idx: '1.0', name: 'Care',
    title: t('Care'),
    desc: 'Care guides for unlacquered brass, copper, sealed finishes and solid wood — plus our repair commitment.' },
  { path: '/contact', page: ContactPage, idx: '1.1', name: 'Contact',
    title: t('Contact'),
    desc: 'Send a drawing, a photograph or a sample — a priced quote returns within five working days. Moradabad, Uttar Pradesh.' },
  { path: '/faq', page: FaqPage, idx: '1.2', name: 'FAQ',
    title: t('FAQ'),
    desc: 'MOQs, finish matching, moisture control, incoterms, packing and lead times — answered with numbers.' },
  { path: '/legal', page: LegalPage, idx: '1.3', name: 'Legal',
    title: t('Terms & Privacy'),
    desc: 'Terms of trade and privacy policy.' },
  { path: '/admin', page: AdminPage, idx: '1.4', name: 'Admin',
    title: t('Admin'),
    desc: 'Admin area',
    /* a working page, but never an indexable one */
    noindex: true },
]

const NOT_FOUND = {
  path: '*', page: NotFoundPage, idx: '1.4', name: 'Not Found',
  title: t('Not Found'), desc: 'This page was never made.',
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { err: false }
    this.onNav = () => { if (this.state.err) this.setState({ err: false }) }
  }
  static getDerivedStateFromError() { return { err: true } }
  componentDidCatch(error, info) {
    /* keep the real error visible for diagnosis — the shell hides the stack */
    console.error('[taif] boundary caught:', error, info?.componentStack)
  }
  componentDidMount() { window.addEventListener('popstate', this.onNav) }
  componentWillUnmount() { window.removeEventListener('popstate', this.onNav) }
  render() {
    if (this.state.err) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: '2rem' }}>
          <div>
            <p className="idx">1.5</p>
            <h1 className="d1">Something slipped the bench.</h1>
            <p className="lede" style={{ margin: '1rem auto 1.6rem' }}>An unexpected error occurred.</p>
            <div style={{ display: 'flex', gap: '.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn primary" onClick={() => this.setState({ err: false })}>
                <span className="btn-label">Continue</span>
              </button>
              <button className="btn ghost" onClick={() => window.location.reload()}>
                <span className="btn-label">Reload</span>
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  useEffect(() => {
    // refresh once web fonts settle so pinned measurements are exact (§9.10)
    document.fonts.ready.then(() => setTimeout(() => ScrollTrigger.refresh(), 300))
  }, [])

  return (
    <ErrorBoundary>
      <CartProvider>
      <a className="skip" href="#main">Skip to content</a>
      <Preloader />
      <Viscosity />
      {/* the navbar goes through the router so it can read the current path —
          as a sibling it only ever saw the context default, '/' */}
      <Router
        routes={ROUTES}
        notFound={NOT_FOUND}
        before={<Navbar />}
        after={<><SectionStack /><RevealGuard /><SceneReveal /><Footer /></>}
      />
      <Ambient />
      <Interactions />
      <div className="grain" aria-hidden="true" />
      <ClickSpark />
      <Cart />
      </CartProvider>
    </ErrorBoundary>
  )
}
