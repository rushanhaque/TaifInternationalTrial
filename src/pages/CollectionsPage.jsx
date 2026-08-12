import CollectionsWall from '../components/CollectionsWall'
import Button from '../components/Button'

/* /collections — THE INDEX. All nine families as large plates, captions
   underneath, in a plain three-up grid. */
export default function CollectionsPage() {
  return (
    <>
      <CollectionsWall />

      {/* what sits past the ninth bay */}
      <section className="cw-close">
        <div className="wrap">
          <div className="cw-close-in">
            <span className="meta">Past the ninth bay</span>
            <h2 className="d1">The wall has a door in it.</h2>
            <p>
              Bespoke is not a tenth family — it is the bench itself. Send a
              drawing, a photograph or a sample and a priced quote returns in
              five working days.
            </p>
            <Button to="/contact">Connect</Button>
          </div>
        </div>
      </section>
    </>
  )
}
