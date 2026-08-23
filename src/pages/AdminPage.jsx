import { useEffect, useMemo, useState } from 'react'
import { CATEGORIES } from '../data/catalogue'
import { SOCIAL_PLATFORMS, BEST_SELLER_SLOTS } from '../data/defaults'
import {
  useContent, getContent, setSection, nextId,
} from '../lib/content'
import { publishSnapshot } from '../lib/publish'
import { processImage, reprocessDataUrl, humanBytes, supportsWebp } from '../lib/image'
import { getLenis } from '../lib/useLenis'
import '../styles/admin.css'

/* ── /admin ────────────────────────────────────────────────────────────────
   One screen per editable section, all driven by the schemas below: a section
   declares its fields and how a row summarises itself, and the generic list /
   modal / delete machinery is shared. Adding a new editable section is a
   schema entry plus a key in src/data/defaults.js — no new UI code.

   Edits are saved to localStorage by src/lib/content.jsx and are visible
   immediately on the public pages *in this browser*. Publishing them to real
   visitors means exporting content.json from the Settings tab — see the note
   rendered there, and the header comment in src/lib/content.jsx.            */

/* A gate, not a lock: this is a static site with no server, so anything the
   browser can check the visitor can read in the bundle. It keeps /admin from
   being stumbled into; it is NOT access control. Real protection needs the
   route served behind auth (Netlify Identity, Cloudflare Access, a backend). */
const PASSCODE = 'taif@ruh'
const GATE_KEY = 'taif:admin:open'

/* The cap on the file an admin may CHOOSE. It is generous because the upload
   is re-encoded to WebP before anything is stored (src/lib/image.js) — a 9 MB
   camera original routinely lands under 250 KB. */
const MAX_UPLOAD_BYTES = 12_000_000

/* The cap on what may be STORED lives in src/lib/image.js as STORE_BUDGET,
   because that is where it is now acted on: the encoder compresses down to
   the budget instead of this page rejecting whatever missed it. */

/* Where the small companion image is filed. A record with `image` gets
   `imageThumb` beside it; nothing else in the schema has to change, and a
   record written before this existed simply has no thumb and falls back to
   the full image. */
export const thumbKey = (key) => `${key}Thumb`

/* ── icons ───────────────────────────────────────────────────────────────── */
const Ico = ({ d, ...rest }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
    {d}
  </svg>
)
const EditIco = () => <Ico d={<><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></>} />
const TrashIco = () => <Ico d={<><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></>} />
const SearchIco = () => <Ico d={<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>} />

/* ── schemas ─────────────────────────────────────────────────────────────── */
const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const SECTIONS = [
  {
    key: 'products',
    label: 'Products',
    title: 'Products',
    blurb: 'The catalogue behind every collection page and product page. Deleting a piece also removes it from its collection.',
    singular: 'product',
    rowTitle: (p) => p.name,
    rowSub: (p) => [p.category, p.subcategory, p.moq ? `MOQ ${p.moq}` : ''].filter(Boolean).join(' · '),
    rowImg: (p) => p.imageThumb || p.image,
    blank: { name: '', category: CATEGORIES[0], subcategory: '', slug: '', material: '', dims: '', weight: '', moq: '', lead: '', image: '', story: '', tone: 'brass', finishes: [], rail: false },
    fields: [
      { key: 'image', label: 'Image', type: 'image', full: true },
      { key: 'name', label: 'Name', required: true, full: true },
      { key: 'category', label: 'Category', type: 'select', options: () => CATEGORIES, required: true },
      { key: 'subcategory', label: 'Subcategory', type: 'select', options: (draft, content) => ['', ...(content.subcategories[draft.category] || [])] },
      { key: 'material', label: 'Material', placeholder: 'Brass' },
      { key: 'finishes', label: 'Finish', placeholder: 'antique, hammered' },
      { key: 'story', label: 'Description', type: 'textarea', full: true },
    ],
    /* a product with no slug is unroutable, so derive one on save */
    normalise: (d) => ({ ...d, slug: d.slug?.trim() || slugify(d.name), finishes: typeof d.finishes === 'string' ? d.finishes.split(',').map(s => s.trim()).filter(Boolean) : (d.finishes || []) }),
  },
  {
    key: 'stats',
    label: 'Figures',
    title: 'Figures',
    blurb: 'The four counting placards on the homepage. The Partners page quotes the countries figure from this same list.',
    singular: 'figure',
    /* a fixed set: these render into a layout that expects a known number of
       items, so they are edit-only — no adding, no deleting, no reordering */
    fixed: true,
    rowTitle: (s) => `${s.value}${s.suffix || ''} — ${s.label}`,
    rowSub: (s) => s.sub,
    blank: { unit: '', value: 0, suffix: '+', label: '', sub: '' },
    fields: [
      { key: 'value', label: 'Number', type: 'number', required: true, hint: 'Digits only — the homepage counts up to it.' },
      { key: 'suffix', label: 'After the number', placeholder: '+' },
      { key: 'label', label: 'Label', required: true, full: true, placeholder: 'Pieces delivered per year' },
      { key: 'sub', label: 'Caption', full: true, placeholder: 'Each piece finished by hand' },
      { key: 'unit', label: 'Reference key', masterKey: true },
    ],
    normalise: (d) => ({ ...d, value: Number(d.value) || 0 }),
  },
  {
    key: 'reviews',
    label: 'Reviews',
    title: 'Reviews',
    blurb: 'Shown on the Testimonials page and in the homepage reviews band. One list feeds both.',
    singular: 'review',
    /* a fixed set: these render into a layout that expects a known number of
       items, so they are edit-only — no adding, no deleting, no reordering */
    fixed: true,
    rowTitle: (r) => r.client,
    rowSub: (r) => [r.role, r.location, `${r.stars}★`].filter(Boolean).join(' · '),
    blank: { client: '', role: '', category: '', stars: 5, tag: '', location: '', quote: '' },
    fields: [
      { key: 'client', label: 'Client', required: true },
      { key: 'role', label: 'Role', placeholder: 'Head of Product' },
      { key: 'category', label: 'Label', placeholder: 'Verified order' },
      { key: 'stars', label: 'Stars', type: 'number', min: 1, max: 5 },
      { key: 'location', label: 'Location', placeholder: 'Frankfurt, Germany' },
      { key: 'tag', label: 'Tag', placeholder: '300 pcs · 0 returns' },
      { key: 'quote', label: 'Quote', type: 'textarea', full: true, required: true, hint: 'Written without quotation marks — the page adds them.' },
    ],
    normalise: (d) => ({ ...d, stars: Math.min(5, Math.max(1, Number(d.stars) || 5)) }),
  },
  {
    key: 'blogs',
    label: 'Blogs',
    title: 'Blogs and socials band',
    blurb: 'The cards on the homepage. Clicking one opens its link in a new tab.',
    singular: 'post',
    /* a fixed set: these render into a layout that expects a known number of
       items, so they are edit-only — no adding, no deleting, no reordering */
    fixed: true,
    rowTitle: (b) => b.title,
    rowSub: (b) => b.link || b.videoSrc,
    rowImg: (b) => b.thumbnail,
    blank: { title: '', link: '', videoSrc: '', thumbnail: '', alt: '' },
    fields: [
      { key: 'title', label: 'Title', required: true, full: true },
      { key: 'link', label: 'Link', full: true, placeholder: 'https://instagram.com/p/...', hint: 'Where the card goes when clicked. Falls back to the video URL if blank.' },
      { key: 'videoSrc', label: 'Video URL', full: true, placeholder: 'https://www.youtube.com/watch?v=VIDEO_ID' },
      { key: 'thumbnail', label: 'Thumbnail', type: 'image', full: true },
      { key: 'alt', label: 'Image description', full: true, hint: 'Read aloud by screen readers.' },
    ],
  },
  {
    key: 'socials',
    label: 'Socials',
    title: 'Social links',
    blurb: 'The icon row in the footer. The platform picks the icon; an empty link is hidden rather than shown broken.',
    singular: 'link',
    /* a fixed set: these render into a layout that expects a known number of
       items, so they are edit-only — no adding, no deleting, no reordering */
    fixed: true,
    rowTitle: (s) => s.label || s.platform,
    rowSub: (s) => s.url || (s.platform === 'whatsapp' || s.platform === 'email' ? 'Using the brand contact details' : 'No link set — hidden'),
    blank: { platform: 'instagram', label: '', url: '' },
    fields: [
      { key: 'platform', label: 'Platform', type: 'select', options: () => SOCIAL_PLATFORMS, required: true },
      { key: 'label', label: 'Label', placeholder: 'Instagram', hint: 'Used as the accessible name.' },
      { key: 'url', label: 'Link', full: true, placeholder: 'https://instagram.com/yourhandle', hint: 'WhatsApp and Email fall back to the brand phone/email when left blank.' },
    ],
  },
  {
    key: 'announcements',
    label: 'Offers / Announcements',
    title: 'Offers / Announcements',
    blurb: 'The scrolling ticker at the very top of the homepage. Add, edit or remove items here.',
    singular: 'item',
    rowTitle: (a) => a.text,
    rowSub: () => '',
    blank: { text: '' },
    fields: [
      { key: 'text', label: 'Text', required: true, full: true, placeholder: 'Shipping worldwide' },
    ],
  },
  {
    key: 'atelier',
    label: 'Atelier images',
    title: 'Atelier images',
    blurb: 'The wiping image reel in the Ateliers band on the Shows page. They advance automatically, in this order.',
    singular: 'image',
    rowTitle: (a) => a.alt || 'Untitled image',
    rowSub: (a) => a.src,
    rowImg: (a) => a.src,
    blank: { src: '', alt: '' },
    fields: [
      { key: 'src', label: 'Image', type: 'image', full: true, required: true },
      { key: 'alt', label: 'Image description', full: true, hint: 'Read aloud by screen readers.' },
    ],
  },
  {
    key: 'exhibitions',
    label: 'Exhibitions',
    title: 'Exhibitions',
    blurb: 'The trade-show cards on the Shows page.',
    singular: 'exhibition',
    rowTitle: (e) => e.title,
    rowSub: (e) => [e.date, e.location].filter(Boolean).join(' · '),
    rowImg: (e) => e.img,
    blank: { title: '', category: '', date: '', location: '', img: '' },
    fields: [
      { key: 'title', label: 'Name', required: true },
      { key: 'category', label: 'Kind', placeholder: 'International exposition' },
      { key: 'date', label: 'When', placeholder: 'Autumn 2026' },
      { key: 'location', label: 'Where', placeholder: 'Frankfurt, Germany' },
      { key: 'img', label: 'Image', type: 'image', full: true },
    ],
  },
]

/* ── confirm dialog ──────────────────────────────────────────────────────── */
function ConfirmModal({ message, confirmLabel = 'Delete', onConfirm, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="ad-overlay" onMouseDown={onClose}>
      <div className="ad-modal ad-confirm" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <div className="ad-modal-head">
          <h2>Are you sure?</h2>
          <button type="button" className="ad-ibtn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="ad-modal-body">
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--ad-ink-2)', lineHeight: 1.55 }}>{message}</p>
        </div>
        <div className="ad-modal-foot">
          <button type="button" className="ad-btn ad-btn--quiet" onClick={onClose}>Cancel</button>
          <button type="button" className="ad-btn" style={{ background: 'var(--ad-danger)', color: '#FFF' }} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

/* ── field renderer ──────────────────────────────────────────────────────── */
function Field({ f, draft, content, onChange, onFile, onImage, busy }) {
  /* master-key fields are machine identifiers that other pages depend on —
     showing them as editable text would invite breaking changes */
  if (f.masterKey) return null
  const v = draft[f.key] ?? ''
  const cls = `ad-field${f.full ? ' ad-field--full' : ''}`
  const id = `ad-f-${f.key}`

  if (f.type === 'check') {
    return (
      <div className={`${cls} ad-check`}>
        <input id={id} type="checkbox" checked={!!draft[f.key]} onChange={(e) => onChange(f.key, e.target.checked)} />
        <label htmlFor={id}>{f.label}</label>
      </div>
    )
  }

  return (
    <div className={cls}>
      <label htmlFor={id}>{f.label}{f.required ? ' *' : ''}</label>

      {f.type === 'select' && (
        <select id={id} value={v} required={f.required} onChange={(e) => onChange(f.key, e.target.value)}>
          {f.options(draft, content).map((o) => (
            <option key={o} value={o}>{o === '' ? '— none —' : o}</option>
          ))}
        </select>
      )}

      {f.type === 'textarea' && (
        <textarea id={id} value={v} required={f.required} placeholder={f.placeholder} onChange={(e) => onChange(f.key, e.target.value)} />
      )}

      {f.type === 'image' && (
        <div className="ad-img">
          {/* the preview reads from the thumbnail when there is one: on a list
              of twenty products, previewing the full-size data URLs is tens of
              megabytes of decoded bitmap for a 90px box */}
          {v
            ? <img className="ad-img-preview" src={draft[thumbKey(f.key)] || v} alt="" loading="lazy" decoding="async" />
            : <div className="ad-img-preview ad-thumb--empty">None</div>}
          <div className="ad-img-side">
            <input id={id} value={v} placeholder="https://... or upload" onChange={(e) => onImage(f.key, e.target.value)} />
            <label className={`ad-btn ad-btn--quiet ad-btn--sm${busy === f.key ? ' is-busy' : ''}`} style={{ alignSelf: 'flex-start', cursor: busy ? 'progress' : 'pointer' }}>
              {busy === f.key ? 'Optimising…' : 'Upload file'}
              <input type="file" accept="image/*" hidden disabled={!!busy} onChange={(e) => onFile(f.key, e)} />
            </label>
          </div>
        </div>
      )}

      {!f.type || f.type === 'text' || f.type === 'number' ? (
        <input
          id={id}
          type={f.type === 'number' ? 'number' : 'text'}
          value={v}
          min={f.min}
          max={f.max}
          required={f.required}
          placeholder={f.placeholder}
          onChange={(e) => onChange(f.key, e.target.value)}
        />
      ) : null}

      {f.hint && <span className="ad-hint">{f.hint}</span>}
    </div>
  )
}

/* ── record modal ────────────────────────────────────────────────────────── */
function RecordModal({ section, record, content, onSave, onClose, notify }) {
  const [draft, setDraft] = useState(() => ({ ...section.blank, ...record }))
  /* the field key currently being encoded, so its uploader can say so */
  const [busy, setBusy] = useState(null)

  /* the page behind the modal is Lenis-smooth-scrolled; without stopping it
     the wheel scrolls the page instead of a long form */
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    getLenis()?.stop()
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      getLenis()?.start()
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const set = (k, val) => setDraft((d) => ({ ...d, [k]: val }))

  /* Uploads are re-encoded to WebP and given a thumbnail before they are
     stored — see the header of src/lib/image.js for why that matters here. */
  const onFile = async (key, e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (file.size > MAX_UPLOAD_BYTES) {
      notify(`That file is ${humanBytes(file.size)}. Use one under ${humanBytes(MAX_UPLOAD_BYTES)}.`, true)
      return
    }

    setBusy(key)
    try {
      /* No size rejection here. processImage walks a compression ladder until
         the result fits its budget, so an oversized upload comes back smaller
         rather than refused; when even the last rung is over, out.overBudget
         says so and the image is stored anyway. Turning an admin away from
         their own photograph was never the right trade. */
      const out = await processImage(file)
      setDraft((d) => ({ ...d, [key]: out.full, [thumbKey(key)]: out.thumb }))
      const saved = out.beforeBytes ? Math.round((1 - out.afterBytes / out.beforeBytes) * 100) : 0
      /* the image is saved either way — overBudget only colours the notice,
         so a heavy one is flagged rather than silently accepted */
      notify(out.note || (out.converted && saved > 0
        ? `Converted to WebP — ${humanBytes(out.beforeBytes)} → ${humanBytes(out.afterBytes)} (${saved}% smaller), thumbnail included.`
        : `Optimised — ${humanBytes(out.afterBytes)} stored, thumbnail included.`), out.overBudget)
    } catch (err) {
      notify(err.message || 'Could not read that image.', true)
    } finally {
      setBusy(null)
    }
  }

  /* Typing or clearing the URL by hand must not leave last upload's thumbnail
     behind — it would keep showing in card and list views under a new image. */
  const setImage = (key, value) => setDraft((d) => ({ ...d, [key]: value, [thumbKey(key)]: '' }))

  const submit = (e) => {
    e.preventDefault()
    onSave(section.normalise ? section.normalise(draft) : draft)
  }

  return (
    <div className="ad-overlay" onMouseDown={onClose}>
      <div className="ad-modal" role="dialog" aria-modal="true" aria-label={`${record ? 'Edit' : 'New'} ${section.singular}`} onMouseDown={(e) => e.stopPropagation()}>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0 }}>
          <div className="ad-modal-head">
            <h2>{record ? `Edit ${section.singular}` : `New ${section.singular}`}</h2>
            <button type="button" className="ad-ibtn" onClick={onClose} aria-label="Close">✕</button>
          </div>

          <div className="ad-modal-body">
            <div className="ad-form">
              {section.fields.map((f) => (
                <Field key={f.key} f={f} draft={draft} content={content} onChange={set} onFile={onFile} onImage={setImage} busy={busy} />
              ))}
            </div>
          </div>

          <div className="ad-modal-foot">
            <button type="button" className="ad-btn ad-btn--quiet" onClick={onClose}>Cancel</button>
            <button type="submit" className="ad-btn ad-btn--primary">{record ? 'Save changes' : `Add ${section.singular}`}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── generic list section ────────────────────────────────────────────────── */
function ListSection({ section, notify, onDirty }) {
  const content = useContent()
  const items = content[section.key] || []
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [confirmItem, setConfirmItem] = useState(null)

  /* search + sort — only surfaced for Products */
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('default')

  const isProducts = section.key === 'products'

  const visibleItems = useMemo(() => {
    let list = items
    if (isProducts && search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.subcategory || '').toLowerCase().includes(q)
      )
    }
    if (isProducts) {
      list = [...list]
      if (sortBy === 'name-az') list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      else if (sortBy === 'name-za') list.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
      else if (sortBy === 'category') list.sort((a, b) => (a.category || '').localeCompare(b.category || ''))
    }
    return list
  }, [items, isProducts, search, sortBy])

  const save = (draft) => {
    if (editing) {
      setSection(section.key, items.map((i) => (i.id === editing.id ? { ...draft, id: editing.id } : i)))
      notify(`${section.singular[0].toUpperCase()}${section.singular.slice(1)} updated.`)
    } else {
      setSection(section.key, [...items, { ...draft, id: nextId(items) }])
      notify(`${section.singular[0].toUpperCase()}${section.singular.slice(1)} added.`)
    }
    onDirty?.()
    setEditing(null)
    setAdding(false)
  }

  const remove = (item) => setConfirmItem(item)

  const confirmRemove = () => {
    if (!confirmItem) return
    const name = section.rowTitle(confirmItem) || `this ${section.singular}`
    setSection(section.key, items.filter((i) => i.id !== confirmItem.id))
    notify(`Deleted "${name}".`)
    onDirty?.()
    setConfirmItem(null)
  }

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>{section.title}</h1>
          <p>{section.blurb}</p>
        </div>
        {!section.fixed && (
          <button className="ad-btn ad-btn--primary" onClick={() => { setEditing(null); setAdding(true) }}>
            Add {section.singular}
          </button>
        )}
      </div>

      {isProducts && items.length > 0 && (
        <div className="ad-search-bar">
          <div className="ad-search-wrap">
            <SearchIco />
            <input
              type="search"
              className="ad-search-input"
              placeholder="Search by name, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="ad-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Order: default</option>
            <option value="name-az">Name A → Z</option>
            <option value="name-za">Name Z → A</option>
            <option value="category">Category</option>
          </select>
        </div>
      )}

      {visibleItems.length === 0 ? (
        <div className="ad-empty">
          {search ? (
            <p>No products match &ldquo;{search}&rdquo;.</p>
          ) : (
            <>
              <p>Nothing here yet.</p>
              {!section.fixed && (
                <button className="ad-btn ad-btn--primary" onClick={() => setAdding(true)}>Add the first {section.singular}</button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="ad-list">
          {visibleItems.map((item) => {
            const img = section.rowImg?.(item)
            return (
              <div className="ad-row" key={item.id}>
                {section.rowImg && (img
                  ? <img className="ad-thumb" src={img} alt="" loading="lazy" decoding="async" />
                  : <div className="ad-thumb ad-thumb--empty">None</div>)}

                <div className="ad-row-main">
                  <p className="ad-row-title">{section.rowTitle(item)}</p>
                  <p className="ad-row-sub">{section.rowSub(item)}</p>
                </div>

                <div className="ad-row-acts">
                  <button className="ad-ibtn" onClick={() => { setAdding(false); setEditing(item) }} aria-label={`Edit ${section.rowTitle(item)}`}><EditIco /></button>
                  {!section.fixed && (
                    <button className="ad-ibtn ad-ibtn--danger" onClick={() => remove(item)} aria-label={`Delete ${section.rowTitle(item)}`}><TrashIco /></button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {(adding || editing) && (
        <RecordModal
          section={section}
          record={editing}
          content={content}
          notify={notify}
          onSave={save}
          onClose={() => { setAdding(false); setEditing(null) }}
        />
      )}

      {confirmItem && (
        <ConfirmModal
          message={`Delete "${section.rowTitle(confirmItem)}"? This cannot be undone.`}
          onConfirm={confirmRemove}
          onClose={() => setConfirmItem(null)}
        />
      )}
    </>
  )
}

/* ── best sellers ────────────────────────────────────────────────────────── */
function BestSellersSection({ notify, onDirty }) {
  const chosen = useContent('bestSellers') || []
  const products = useContent('products')

  /* Always render exactly BEST_SELLER_SLOTS rows, padding the stored list with
     blanks. That is what makes this a picker with a fixed shape rather than a
     list you can grow: there is no row to add and none to remove, only nine
     slots that are either filled or empty. */
  const slots = Array.from({ length: BEST_SELLER_SLOTS }, (_, i) => chosen[i] || '')

  const setSlot = (i, slug) => {
    const next = slots.slice()
    next[i] = slug
    /* trailing blanks are trimmed so the stored list stays tidy, but interior
       blanks are kept — clearing slot 2 should not shuffle slot 3 upward */
    while (next.length && !next[next.length - 1]) next.pop()
    setSection('bestSellers', next)
    onDirty?.()
    notify(slug ? `Slot ${i + 1} set to "${products.find((p) => p.slug === slug)?.name}".` : `Slot ${i + 1} cleared.`)
  }

  const filled = slots.filter(Boolean).length
  const dupes = slots.filter(Boolean).filter((s, i, a) => a.indexOf(s) !== i)

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Best sellers</h1>
          <p>
            The grid the homepage settles into after the signature piece. Nine slots, each holding one
            product from the catalogue — pick a different product to change a slot, or leave it blank to
            show one fewer card.
          </p>
        </div>
        <span className="ad-tab-count" style={{ fontSize: '0.8rem' }}>{filled} of {BEST_SELLER_SLOTS}</span>
      </div>

      {dupes.length > 0 && (
        <div className="ad-sub-group" style={{ borderColor: 'var(--ad-danger)' }}>
          <p className="ad-hint" style={{ margin: 0, color: 'var(--ad-danger)' }}>
            The same product is in more than one slot. It will appear twice in the grid.
          </p>
        </div>
      )}

      <div className="ad-list">
        {slots.map((slug, i) => {
          const product = products.find((p) => p.slug === slug)
          return (
            <div className="ad-row" key={i}>
              <span className="ad-slot-no">{i + 1}</span>

              {product?.image
                ? <img className="ad-thumb" src={product.imageThumb || product.image} alt="" loading="lazy" decoding="async" />
                : <div className="ad-thumb ad-thumb--empty">{product ? 'None' : 'Empty'}</div>}

              <div className="ad-row-main">
                <label className="ad-hint" htmlFor={`bs-${i}`} style={{ display: 'block', marginBottom: '0.25rem' }}>
                  Slot {i + 1}
                </label>
                <select
                  id={`bs-${i}`}
                  value={slug}
                  onChange={(e) => setSlot(i, e.target.value)}
                  style={{
                    width: '100%', font: 'inherit', fontSize: '0.88rem',
                    padding: '0.5rem 0.65rem', borderRadius: '9px',
                    border: '1px solid var(--ad-line-2)', background: 'var(--ad-bg)',
                    color: 'var(--ad-ink)',
                  }}
                >
                  <option value="">— empty —</option>
                  {products.map((p) => (
                    <option key={p.slug} value={p.slug}>{p.name} · {p.category}</option>
                  ))}
                </select>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

/* ── subcategories ───────────────────────────────────────────────────────── */
function SubcategoriesSection({ notify, onDirty }) {
  const subs = useContent('subcategories')
  const products = useContent('products')
  const [drafts, setDrafts] = useState({})
  const [confirmSub, setConfirmSub] = useState(null) // { cat, name }

  const add = (cat) => {
    const name = (drafts[cat] || '').trim()
    if (!name) return
    if ((subs[cat] || []).some((s) => s.toLowerCase() === name.toLowerCase())) {
      notify(`"${name}" is already under ${cat}.`, true)
      return
    }
    setSection('subcategories', { ...subs, [cat]: [...(subs[cat] || []), name] })
    setDrafts((d) => ({ ...d, [cat]: '' }))
    onDirty?.()
    notify(`Added "${name}" to ${cat}.`)
  }

  const remove = (cat, name) => setConfirmSub({ cat, name })

  const confirmRemoveSub = () => {
    if (!confirmSub) return
    const { cat, name } = confirmSub
    const used = products.filter((p) => p.category === cat && p.subcategory === name)
    setSection('subcategories', { ...subs, [cat]: (subs[cat] || []).filter((s) => s !== name) })
    if (used.length) {
      setSection('products', products.map((p) => (
        p.category === cat && p.subcategory === name ? { ...p, subcategory: '' } : p
      )))
    }
    onDirty?.()
    notify(`Deleted "${name}".`)
    setConfirmSub(null)
  }

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Subcategories</h1>
          <p>Optional groupings inside each of the nine collections. A product picks one in the Products tab.</p>
        </div>
      </div>

      {CATEGORIES.map((cat) => {
        const list = subs[cat] || []
        return (
          <div className="ad-sub-group" key={cat}>
            <div className="ad-sub-head">
              <h3>{cat}</h3>
              <form
                style={{ display: 'flex', gap: '0.4rem' }}
                onSubmit={(e) => { e.preventDefault(); add(cat) }}
              >
                <input
                  className="ad-sub-input"
                  value={drafts[cat] || ''}
                  placeholder="New subcategory"
                  aria-label={`New subcategory under ${cat}`}
                  onChange={(e) => setDrafts((d) => ({ ...d, [cat]: e.target.value }))}
                  style={{
                    font: 'inherit', fontSize: '0.83rem', padding: '0.4rem 0.6rem',
                    borderRadius: '8px', border: '1px solid var(--ad-line-2)',
                    background: 'var(--ad-bg)', color: 'var(--ad-ink)', minWidth: 0, width: '11rem',
                  }}
                />
                <button className="ad-btn ad-btn--quiet ad-btn--sm" type="submit">Add</button>
              </form>
            </div>

            {list.length === 0 ? (
              <p className="ad-sub-none">No subcategories.</p>
            ) : (
              <div className="ad-chips">
                {list.map((s) => (
                  <span className="ad-chip" key={s}>
                    {s}
                    <button onClick={() => remove(cat, s)} aria-label={`Delete ${s}`}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {confirmSub && (
        <ConfirmModal
          message={(() => {
            const used = products.filter((p) => p.category === confirmSub.cat && p.subcategory === confirmSub.name)
            return used.length
              ? `Delete "${confirmSub.name}"? ${used.length} product${used.length === 1 ? '' : 's'} will lose this subcategory.`
              : `Delete "${confirmSub.name}"?`
          })()}
          onConfirm={confirmRemoveSub}
          onClose={() => setConfirmSub(null)}
        />
      )}
    </>
  )
}



/* ── images ──────────────────────────────────────────────────────────────
   A one-button pass over everything already stored. Images uploaded before
   the WebP pipeline existed are full-weight JPEGs sitting in the JS bundle;
   re-encoding them is the single largest thing that can be done to this
   site's load time, and it is not something the admin should have to do by
   re-uploading twenty products by hand.

   It also backfills thumbnails for records that predate them.               */
function imageFieldsOf(section) {
  return section.fields ? section.fields.filter((f) => f.type === 'image').map((f) => f.key) : []
}

function ImagesSection({ notify, onDirty }) {
  const content = useContent()
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(null)

  /* every stored image across every section, with where it came from */
  const inventory = useMemo(() => {
    const rows = []
    for (const section of SECTIONS) {
      for (const key of imageFieldsOf(section)) {
        for (const item of content[section.key] || []) {
          const src = item[key]
          if (typeof src !== 'string' || !src) continue
          rows.push({
            section: section.key,
            label: section.label,
            id: item.id,
            key,
            title: section.rowTitle(item) || `#${item.id}`,
            embedded: src.startsWith('data:'),
            webp: src.startsWith('data:image/webp'),
            bytes: src.startsWith('data:') ? src.length : 0,
            hasThumb: !!item[thumbKey(key)],
            thumb: item[thumbKey(key)] || src,
          })
        }
      }
    }
    return rows
  }, [content])

  const embedded = inventory.filter((r) => r.embedded)
  const totalBytes = embedded.reduce((n, r) => n + r.bytes, 0)
  const stale = embedded.filter((r) => !r.webp || !r.hasThumb)

  const optimise = async () => {
    if (!stale.length) return
    setRunning(true)
    let done = 0
    let before = 0
    let after = 0
    let failed = 0

    try {
      for (const row of stale) {
        setProgress({ done, total: stale.length, title: row.title })
        /* read the section fresh each time: an earlier iteration already wrote
           to it, and a stale closure would undo that write */
        const list = getContent(row.section)
        const item = list.find((i) => i.id === row.id)
        if (!item) { done++; continue }
        try {
          const out = await reprocessDataUrl(item[row.key])
          if (out && out.full.length + out.thumb.length < item[row.key].length) {
            before += item[row.key].length
            after += out.full.length + out.thumb.length
            setSection(row.section, list.map((i) => (
              i.id === row.id ? { ...i, [row.key]: out.full, [thumbKey(row.key)]: out.thumb } : i
            )))
          } else if (out) {
            /* not worth swapping the full image, but the thumbnail still is */
            before += item[row.key].length
            after += item[row.key].length + out.thumb.length
            setSection(row.section, list.map((i) => (
              i.id === row.id ? { ...i, [thumbKey(row.key)]: out.thumb } : i
            )))
          }
        } catch {
          failed++
        }
        done++
        /* yield to the browser so the progress line actually paints and the
           tab does not look hung on a long run */
        await new Promise((r) => setTimeout(r, 0))
      }

      onDirty?.()
      const saved = before ? Math.round((1 - after / before) * 100) : 0
      notify(failed
        ? `Optimised ${done - failed} of ${stale.length}. ${failed} could not be read.`
        : `Optimised ${done} image${done === 1 ? '' : 's'} — ${humanBytes(before)} → ${humanBytes(after)} (${saved}% smaller). Publish to push it live.`)
    } finally {
      setRunning(false)
      setProgress(null)
    }
  }

  return (
    <>
      <div className="ad-head">
        <div>
          <h1>Images</h1>
          <p>
            Every picture uploaded here is stored inside the site itself, so its weight is
            paid by every visitor on their first load. New uploads are converted to WebP
            automatically — this screen re-converts the ones that came before that.
          </p>
        </div>
        {!!stale.length && (
          <button className="ad-btn ad-btn--primary" onClick={optimise} disabled={running}>
            {running ? 'Optimising…' : `Optimise ${stale.length} image${stale.length === 1 ? '' : 's'}`}
          </button>
        )}
      </div>

      <div className="ad-sub-group">
        <div className="ad-sub-head">
          <h3>{embedded.length} uploaded image{embedded.length === 1 ? '' : 's'} · {humanBytes(totalBytes)}</h3>
        </div>
        <p className="ad-sub-none">
          {inventory.length - embedded.length} more are linked by URL and cost nothing to store.
          {stale.length
            ? ` ${stale.length} could still be made smaller.`
            : ' Everything stored is already converted and has a thumbnail.'}
        </p>
        {progress && (
          <p className="ad-sub-none" role="status">
            {progress.done + 1} of {progress.total} — {progress.title}
          </p>
        )}
      </div>

      {embedded.length > 0 && (
        <div className="ad-list">
          {embedded.map((r) => (
            <div className="ad-row" key={`${r.section}-${r.id}-${r.key}`}>
              <img className="ad-thumb" src={r.thumb} alt="" loading="lazy" decoding="async" />
              <div className="ad-row-main">
                <p className="ad-row-title">{r.title}</p>
                <p className="ad-row-sub">
                  {r.label} · {humanBytes(r.bytes)} · {r.webp ? 'WebP' : 'not converted'}
                  {r.hasThumb ? ' · has thumbnail' : ' · no thumbnail'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

/* ── gate ────────────────────────────────────────────────────────────────── */
function Gate({ onOpen }) {
  const [val, setVal] = useState('')
  const [bad, setBad] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (val === PASSCODE) {
      sessionStorage.setItem(GATE_KEY, '1')
      onOpen()
    } else {
      setBad(true)
    }
  }

  return (
    <div className="ad ad-gate" style={{ display: 'grid', gridTemplateColumns: '1fr', paddingTop: 'var(--nav-h, 72px)' }}>
      <form className="ad-gate-card" onSubmit={submit}>
        <h1>Admin</h1>
        <p>Enter the passcode to manage site content.</p>
        <div className="ad-field">
          <label htmlFor="ad-pass">Passcode</label>
          <input
            id="ad-pass"
            type="password"
            value={val}
            autoFocus
            onChange={(e) => { setVal(e.target.value); setBad(false) }}
          />
          {bad && <span className="ad-hint" style={{ color: 'var(--ad-danger)' }}>That passcode is not right.</span>}
        </div>
        <button className="ad-btn ad-btn--primary ad-btn--wide" type="submit" style={{ marginTop: '1rem' }}>
          Open admin
        </button>
      </form>
    </div>
  )
}

/* ── shell ───────────────────────────────────────────────────────────────── */
export default function AdminPage() {
  const [open, setOpen] = useState(() => {
    try { return sessionStorage.getItem(GATE_KEY) === '1' } catch { return false }
  })
  const [tab, setTab] = useState('products')
  const [toast, setToast] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const content = useContent()

  const notify = (msg, warn = false) => setToast({ msg, warn })
  const markDirty = () => setDirty(true)

  const publish = async () => {
    if (!window.confirm('Publish your edits to the live site?\n\nEvery visitor will see these changes once the deploy finishes (usually 1–3 min).')) return
    setPublishing(true)
    try {
      await publishSnapshot(getContent())
      setDirty(false)
      notify('Published. The site will update once the deploy finishes (usually 1–3 min).')
    } catch (err) {
      /* belt and braces: a blank message renders a toast with nothing in it,
         which is a red pill the size of its own padding and tells the admin
         nothing at all */
      notify(err?.message || 'Publish failed. Nothing was sent; your edits are still here.', true)
    } finally {
      setPublishing(false)
    }
  }

  /* 3.6s is right for "Saved." and much too short for a failure: the publish
     errors run to a couple of sentences of instructions, which is past ten
     seconds of reading. Warnings therefore hold roughly twice as long, and
     scale with how much there is to read. */
  useEffect(() => {
    if (!toast) return
    const words = String(toast.msg || '').trim().split(/\s+/).length
    const ms = toast.warn
      ? Math.min(16000, Math.max(7000, words * 380))
      : 3600
    const t = setTimeout(() => setToast(null), ms)
    return () => clearTimeout(t)
  }, [toast])

  const counts = useMemo(() => {
    const c = {}
    for (const s of SECTIONS) c[s.key] = (content[s.key] || []).length
    c.subcategories = Object.values(content.subcategories || {}).reduce((n, l) => n + l.length, 0)
    c.bestSellers = (content.bestSellers || []).filter(Boolean).length
    c.images = SECTIONS.reduce((n, sec) => n + (content[sec.key] || []).reduce(
      (m, item) => m + imageFieldsOf(sec).filter((k) => typeof item[k] === 'string' && item[k].startsWith('data:')).length, 0,
    ), 0)
    return c
  }, [content])

  if (!open) return <Gate onOpen={() => setOpen(true)} />

  const section = SECTIONS.find((s) => s.key === tab)

  return (
    <div className="ad">
      <aside className="ad-nav">
        <p className="ad-nav-title">Content</p>

        {SECTIONS.map((s) => {
          const locked = s.key === 'atelier' || s.key === 'exhibitions'
          return (
            <button
              key={s.key}
              className={`ad-tab${locked ? ' ad-tab--locked' : ''}`}
              aria-current={!locked && tab === s.key}
              onClick={locked ? undefined : () => setTab(s.key)}
              disabled={locked}
              title={locked ? 'Shows page is coming soon — editing locked' : undefined}
            >
              <span>{s.label}</span>
              {locked
                ? <span className="ad-tab-lock">🔒</span>
                : <span className="ad-tab-count">{counts[s.key]}</span>}
            </button>
          )
        })}

        <button className="ad-tab" aria-current={tab === 'subcategories'} onClick={() => setTab('subcategories')}>
          <span>Subcategories</span>
          <span className="ad-tab-count">{counts.subcategories}</span>
        </button>

        <button className="ad-tab" aria-current={tab === 'bestsellers'} onClick={() => setTab('bestsellers')}>
          <span>Best sellers</span>
          <span className="ad-tab-count">{counts.bestSellers}</span>
        </button>

        <button className="ad-tab" aria-current={tab === 'images'} onClick={() => setTab('images')}>
          <span>Images</span>
          <span className="ad-tab-count">{counts.images}</span>
        </button>

        <div className="ad-nav-foot">
          {/* Deliberately not styled as another .ad-tab: this is the only
              control that leaves the browser and changes what visitors see,
              so it reads as an action rather than a place to navigate to. */}
          <button
            className="ad-publish-cta"
            onClick={publish}
            disabled={publishing}
          >
            <span className="ad-publish-ico" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
            </span>
            <span className="ad-publish-text">
              <strong>{publishing ? 'Publishing…' : 'Save & publish'}</strong>
              <em>{publishing ? 'Pushing changes live' : 'Push edits live'}</em>
            </span>
          </button>
        </div>
      </aside>

      <main className="ad-main">
        {section && <ListSection key={section.key} section={section} notify={notify} onDirty={markDirty} />}
        {tab === 'subcategories' && <SubcategoriesSection notify={notify} onDirty={markDirty} />}
        {tab === 'bestsellers' && <BestSellersSection notify={notify} onDirty={markDirty} />}
        {tab === 'images' && <ImagesSection notify={notify} onDirty={markDirty} />}
      </main>

      {toast && (
        <div className={`ad-toast${toast.warn ? ' ad-toast--warn' : ''}`} role="status">{toast.msg}</div>
      )}

      {dirty && (
        <button
          className="ad-mobile-publish"
          onClick={publish}
          disabled={publishing}
          aria-label="Save and publish"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V5" /><path d="m5 12 7-7 7 7" />
          </svg>
          {publishing ? 'Publishing…' : 'Save & publish'}
        </button>
      )}
    </div>
  )
}
