import { useEffect, useRef } from 'react'
import { gsap, reduced } from '../lib/gsap'
import { getLenis } from '../lib/useLenis'
import { Link, useRoute } from '../lib/router'
import { BRAND, NAV_LINKS, MORE_LINKS } from '../data/site'

/* Mobile menu — the burger swells into a full-screen blob that squares off
   into the sheet; links dilate in from centre (E7). */
export default function MobileSheet({ open, onClose }) {
  const ref = useRef(null)
  const { path } = useRoute()

  useEffect(() => { if (open) onClose() }, [path]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = ref.current
    if (open) {
      getLenis()?.stop()
      el.classList.add('open')
      if (!reduced()) {
        const cx = 'calc(100% - 45px)'
        gsap.fromTo(
          el,
          { clipPath: `circle(21px at ${cx} 49px)` },
          {
            clipPath: `circle(150% at ${cx} 49px)`,
            duration: 0.6, ease: 'viscous',
            onComplete() { el.style.clipPath = 'none' },
          }
        )
        gsap.from(el.querySelectorAll('.sheet-link, .chip'), {
          scale: 0.92, opacity: 0, duration: 0.5, ease: 'surge', stagger: 0.045, delay: 0.18,
        })
      }
      el.querySelector('a')?.focus()
      const onKey = (e) => { if (e.key === 'Escape') onClose() }
      document.addEventListener('keydown', onKey)
      return () => document.removeEventListener('keydown', onKey)
    } else {
      getLenis()?.start()
      el.classList.remove('open')
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="sheet" id="sheet" ref={ref} role="dialog" aria-modal="true" aria-label="Menu">
      {NAV_LINKS.map((l) => (
        <Link key={l.to} to={l.to} className="sheet-link">{l.label}</Link>
      ))}
      <div className="sheet-more">
        {MORE_LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="chip">{l.label}</Link>
        ))}
      </div>
      <p className="sheet-contact meta">
        {BRAND.email} · {BRAND.phone}
      </p>
    </div>
  )
}
