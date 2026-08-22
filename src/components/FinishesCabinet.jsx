import { FINISHES } from '../data/site'
import { CharCascade } from './Reveal'
import { asset } from '../lib/asset'

const FINISH_IMGS = {
  hammered: asset('/assets/materials/brass.webp'),
  antique: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop',
  burnished: asset('/assets/materials/copper.webp'),
  natural: asset('/assets/materials/sheesham.webp'),
  inlay: asset('/assets/materials/teak.webp'),
}

export default function FinishesCabinet() {
  return (
    <section className="section" id="finishes-we-offer" style={{ background: '#FFFFFF', color: '#7A3B1D' }}>
      <div className="wrap">
        <div className="sec-head">
          <CharCascade as="h2" className="d2" style={{ color: '#7A3B1D' }}>Finishes we offer</CharCascade>
          <p className="meta" style={{ marginTop: '0.5rem', color: 'rgba(122, 59, 29, 0.75)' }}>
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
                    src={FINISH_IMGS[f.key] || asset('/assets/materials/brass.webp')}
                    alt={f.name}
                    className="chouse-cover"
                    loading="lazy"
                    decoding="async"
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
