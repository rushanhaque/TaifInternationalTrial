import { CharCascade, Dilate } from '../components/Reveal'
import CollectionsDolly from '../components/CollectionsDolly'
import Button from '../components/Button'
import Seam from '../components/mk2/Seam'
import { navigate } from '../lib/router'
import { CATALOGUE, CATEGORIES } from '../data/catalogue'
import { familySlug } from './CollectionPage'

/* /collections — a single, cinematic pinned scroll: the camera pushes
   through five layered collection families and lands on the Bespoke wall.
   No navigation chrome on the way in — just the alley, the haze, and the
   end of it. */
export default function CollectionsPage() {
  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      {/* the brass spine — this page only */}
      <Seam />
      <section className="section" style={{ paddingTop: 'calc(var(--nav-h, 80px) + 3rem)', paddingBottom: 0, backgroundColor: '#FFFFFF' }}>
        <div className="wrap">
          <CharCascade as="h1" className="mega" style={{ marginTop: '1.5rem', color: '#1c1c1a' }}>Five families, one bench.</CharCascade>
        </div>
      </section>

      <CollectionsDolly />
    </div>
  )
}
