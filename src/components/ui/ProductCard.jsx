import { Link } from '../../lib/router'
import { productPlate } from '../../data/images'
import SmartImage from '../SmartImage'
import { useCart } from '../../lib/cart'

/* ── Velora Specimen Card (1:1 exact match with Velora design & screenshot) ─────────────── */
export default function ProductCard({ p }) {
  const { add, remove, has } = useCart()
  const inCart = has(p.slug)

  const refCode = p.idx ? (String(p.idx).startsWith('VD') ? p.idx : `VD-${String(p.idx).padStart(2, '0')}`) : 'VD-01'

  return (
    <li className="pl-plate">
      <div className="pl-card group">
        <Link
          to={`/catalogue/${p.slug}`}
          className="pl-card-link"
          data-cursor="VIEW"
          transition="slide-product"
        >
          {/* Studio Frame — 4/5 Portrait ratio with Velora vitrine ground */}
          <div className="pl-shot burnish">
            <div className="pl-glow" aria-hidden="true" />
            {/* .pl-shot already owns the 16/10 box, so the frame only
                has to fill it — see .si--fill in styles/smart-image.css */}
            <SmartImage
              className="pl-img"
              wrapClassName="si--fill"
              src={p.image || productPlate(p.slug)}
              thumb={p.imageThumb}
              alt={p.name}
              sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
            />

            {/* Ref tag top-left (e.g. VD-02) */}
            <span className="pl-ref-tag" aria-hidden="true">{refCode}</span>

            {/* Plus / Add circular toggle button top-right */}
            <button
              type="button"
              className={`pl-toggle-btn ${inCart ? 'is-in' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                inCart ? remove(p.slug) : add(p)
              }}
              aria-label={inCart ? `Remove ${p.name} from cart` : `Add ${p.name} to cart`}
            >
              {inCart ? (
                <svg viewBox="0 0 24 24" className="pl-toggle-icon" aria-hidden="true">
                  <path d="M5 12l5 5L19 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="pl-toggle-icon" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>

          {/* Caption Area — Title only */}
          <div className="pl-say">
            <h2 className="pl-name">{p.name}</h2>
          </div>
        </Link>
      </div>
    </li>
  )
}
