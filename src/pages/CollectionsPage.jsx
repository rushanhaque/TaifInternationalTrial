import { CharCascade, Dilate } from '../components/Reveal'
import CollectionsDolly from '../components/CollectionsDolly'
import Seam from '../components/mk2/Seam'
import { FAMILIES } from './CollectionPage'

/* /collections — a single, cinematic pinned scroll: the camera pushes
   through the collection families and lands on the Bespoke wall.
   No navigation chrome on the way in — just the alley, the haze, and the
   end of it. */
export default function CollectionsPage() {
  return (
    <>
      {/* the brass spine — this page only */}
      <Seam />

      <section className="page-hero wrap">
        <div className="hero-kicker">
          <span className="meta">The collections</span>
        </div>
        {/* counted from FAMILIES rather than written into the copy — the
            headline read "Five families" long after the ninth was added */}
        <CharCascade as="h1" className="mega">
          {`${FAMILIES.length} families, one bench.`}
        </CharCascade>
      </section>

      <CollectionsDolly />
    </>
  )
}
