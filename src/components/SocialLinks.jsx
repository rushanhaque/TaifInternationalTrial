import { BRAND } from '../data/site'
import { useContent } from '../lib/content'

/* ── social links ─────────────────────────────────────────────────────────
   The list is admin-editable (platform + url), so the icon is looked up by
   platform key rather than written inline beside each anchor.

   WhatsApp and email default to BRAND.phone / BRAND.email when their url is
   left blank, which is how they behaved before this was editable — an admin
   who never opens the socials tab keeps the old behaviour. */

const ICONS = {
  instagram: (
    <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></>
  ),
  whatsapp: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  email: (
    <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>
  ),
  facebook: (
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  ),
  linkedin: (
    <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></>
  ),
  youtube: (
    <><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></>
  ),
  x: (
    <><line x1="4" y1="4" x2="20" y2="20" /><line x1="20" y1="4" x2="4" y2="20" /></>
  ),
  pinterest: (
    <><circle cx="12" cy="12" r="10" /><path d="M8 15c1.5-3 2-5 2-6a2.5 2.5 0 1 1 5 0c0 2.5-1.5 4-3.5 4" /><line x1="10" y1="14" x2="9" y2="20" /></>
  ),
}

const glyph = (platform) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ICONS[platform]}
  </svg>
)

/** Resolve the href, filling in the brand contact details for blank urls. */
function hrefFor(s) {
  const url = (s.url || '').trim()
  if (url) return url
  if (s.platform === 'whatsapp') return `https://wa.me/${BRAND.phone.replace(/[^0-9]/g, '')}`
  if (s.platform === 'email') return `mailto:${BRAND.email}`
  return ''
}

export default function SocialLinks({ style }) {
  const socials = useContent('socials')

  const links = (socials || [])
    .map((s) => ({ ...s, href: hrefFor(s) }))
    /* a platform with no icon and no href would render an empty tap target */
    .filter((s) => s.href && ICONS[s.platform])

  if (!links.length) return null

  return (
    <div style={{ display: 'flex', gap: '1.2rem', marginTop: '1.5rem', ...style }}>
      {links.map((s) => {
        const isMail = s.href.startsWith('mailto:')
        return (
          <a
            key={s.id}
            href={s.href}
            aria-label={s.label || s.platform}
            className="social-icon"
            {...(isMail ? {} : { target: '_blank', rel: 'noreferrer' })}
          >
            {/* the glyph rolls: the resting copy steps up and out of the mask
                while its twin steps in from below — the same motion the nav
                labels use, so the footer reads as part of the same system.
                The second copy is decorative, hence aria-hidden. */}
            <span className="si-roll">
              <span className="si-up">{glyph(s.platform)}</span>
              <span className="si-in" aria-hidden="true">{glyph(s.platform)}</span>
            </span>
          </a>
        )
      })}
    </div>
  )
}
