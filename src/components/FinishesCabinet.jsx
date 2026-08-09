import { FINISHES } from '../data/site'
import { CharCascade } from './Reveal'

const FINISH_IMGS = {
  hammered: '/assets/materials/brass.png',
  antique: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop',
  burnished: '/assets/materials/copper.png',
  natural: '/assets/materials/sheesham.png',
  inlay: '/assets/materials/teak.png',
}

export default function FinishesCabinet() {
  return (
    <section className="section alt" id="finishes-we-offer" style={{ paddingBlock: '4rem 5rem' }}>
      <div className="wrap">
        <div className="sec-head" style={{ marginBottom: '1.5rem' }}>
          <CharCascade as="h2" className="d2">Finishes we offer</CharCascade>
          <p className="meta" style={{ marginTop: '0.5rem', color: 'var(--dim)' }}>
            Five hand-crafted surfaces · Struck, aged, burnished, oiled, and inlaid
          </p>
        </div>

        {/* Velora-main Cabinet Accordion Row */}
        <div className="crow-wrapper">
          <div className="crow">
            {FINISHES.map((f, i) => (
              <div
                key={f.key}
                className="chouse"
              >
                {/* inlaid brass seam */}
                {i < FINISHES.length - 1 && <span aria-hidden="true" className="chouse-seam" />}

                <div className="chouse-lift">
                  <img
                    src={FINISH_IMGS[f.key] || '/assets/materials/brass.png'}
                    alt={f.name}
                    className="chouse-cover"
                  />
                  <span aria-hidden="true" className="chouse-scrim" />

                  {/* Title Overlay */}
                  <div className="chouse-content">
                    <h3 className="chouse-name">{f.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
