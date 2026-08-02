import { Component, useEffect } from 'react'
import { ScrollTrigger } from './lib/gsap'
import { Router } from './lib/router'
import { BRAND } from './data/site'
import { bySlug } from './data/catalogue'
import Preloader from './components/Preloader'
import Viscosity from './components/Viscosity'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Blobber from './components/Blobber'
import SectionStack from './components/SectionStack'
import ClickSpark from './components/ClickSpark'

import Home from './pages/Home'
import CollectionsPage from './pages/CollectionsPage'
import CataloguePage from './pages/CataloguePage'
import ProductPage from './pages/ProductPage'
import MaterialsPage from './pages/MaterialsPage'
import AboutPage from './pages/AboutPage'
import PartnersPage from './pages/PartnersPage'
import CarePage from './pages/CarePage'
import ContactPage from './pages/ContactPage'
import FaqPage from './pages/FaqPage'
import LegalPage from './pages/LegalPage'
import NotFoundPage from './pages/NotFoundPage'

const B = BRAND.name
const t = (s) => `${s} — ${B}`

const ROUTES = [
  { path: '/', page: Home, idx: '0.1', name: 'Home',
    title: `${B} — ${BRAND.line} · Metal & Wood Handicraft`,
    desc: 'Metal and wood handicraft manufacture and export. Hand-hammered brass, burnished copper, seasoned sheesham and flush brass inlay, made in Moradabad, India.' },
  { path: '/collections', page: CollectionsPage, idx: '0.2', name: 'Collections',
    title: t('Collections'),
    desc: 'Five families — tableware, barware, décor, lighting and furniture — with bespoke waiting at the end.' },
  { path: '/catalogue', page: CataloguePage, idx: '0.25', name: 'Catalogue',
    title: t('Catalogue'),
    desc: '20 production pieces across tableware, barware, décor, lighting, furniture and bespoke.' },
  { path: '/catalogue/:slug', page: ProductPage, idx: '0.3',
    name: (p) => bySlug(p.slug)?.name || 'Product',
    title: (p) => t(bySlug(p.slug)?.name || 'Product'),
    desc: (p) => bySlug(p.slug)?.story || `Handmade metal and wood pieces by ${B}.` },
  { path: '/materials', page: MaterialsPage, idx: '0.7', name: 'Materials',
    title: t('Materials'),
    desc: 'Six materials, measured: brass, copper, aluminium, sheesham, mango wood and reclaimed teak.' },
  { path: '/about', page: AboutPage, idx: '0.8', name: 'About',
    title: t('About'),
    desc: 'Founded 1998 in Moradabad. 340 artisans, two material floors, 42 export markets. Hand-made, factory-repeatable.' },
  { path: '/partners', page: PartnersPage, idx: '0.9', name: 'Partners',
    title: t('Partners'),
    desc: 'Hospitality groups, retailers, design studios and architects who ship our metal and wood under their own names.' },
  { path: '/care', page: CarePage, idx: '1.0', name: 'Care',
    title: t('Care'),
    desc: 'Care guides for unlacquered brass, copper, sealed finishes and solid wood — plus our repair commitment.' },
  { path: '/contact', page: ContactPage, idx: '1.1', name: 'Contact',
    title: t('Contact'),
    desc: 'Send a drawing, a photograph or a sample — a priced quote returns within five working days. Moradabad · Saharanpur · Delhi.' },
  { path: '/faq', page: FaqPage, idx: '1.2', name: 'FAQ',
    title: t('FAQ'),
    desc: 'MOQs, finish matching, moisture control, incoterms, packing and lead times — answered with numbers.' },
  { path: '/legal', page: LegalPage, idx: '1.3', name: 'Legal',
    title: t('Terms & Privacy'),
    desc: 'Terms of trade and privacy policy.' },
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
      <a className="skip" href="#main">Skip to content</a>
      <Preloader />
      <Viscosity />
      <Navbar />
      <Router routes={ROUTES} notFound={NOT_FOUND} after={<><SectionStack /><Footer /></>} />
      <div className="grain" aria-hidden="true" />
      <ClickSpark />
      <Blobber />
    </ErrorBoundary>
  )
}
