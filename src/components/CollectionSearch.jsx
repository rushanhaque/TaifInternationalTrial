import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, navigate } from '../lib/router'
import { useContent } from '../lib/content'
import { productImg } from '../data/images'
import { FAMILIES, canonicalFamilySlug } from '../lib/families'

/* ── THE SEARCH BAR — /collections ──────────────────────────────────────────
   Nine families is a small enough wall to read; the thirty-odd pieces behind
   it are not. A buyer who arrives knowing they want a copper jug should not
   have to guess which family files it. The field sits directly under the
   lede, above the plates, and answers as it is typed.

   It searches the pieces AND the families, because half the queries a buyer
   types ('barware', 'copper') name a room rather than an object, and sending
   them to the family page is the better answer.

   Fail open: with the field empty the page is exactly what it was. Nothing
   below is filtered, hidden or re-ordered — the results are an overlay, so a
   visitor who ignores the field never notices it is there.                 */

const MAX_PIECES = 6
const MAX_FAMILIES = 3

/* fold accents and case so 'decor' finds 'Décor' */
const norm = (s) =>
  String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/* Score rather than filter, so the closest name lands at the top instead of
   whichever piece happens to sit first in the catalogue. A name that starts
   with the query beats one that merely contains it, and a match on the
   material or the family is worth less than a match on the name. */
function score(p, q) {
  const name = norm(p.name)
  const cat = norm(p.category)
  const mat = norm(p.material)
  const rest = norm([p.story, (p.finishes || []).join(' '), p.slug].join(' '))

  if (name === q) return 100
  if (name.startsWith(q)) return 80
  if (name.includes(q)) return 60
  if (cat.startsWith(q) || mat.startsWith(q)) return 45
  if (cat.includes(q) || mat.includes(q)) return 35
  if (rest.includes(q)) return 15
  return 0
}

export default function CollectionSearch() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const listId = useId()

  const query = norm(q.trim())

  /* through the hook, not getProducts(), so an admin edit reaches the field
     without a reload — same contract the catalogue and the family pages use */
  const products = useContent('products') || []

  /* families first, then pieces — a family is the broader answer, and a
     buyer who typed one wants the room rather than one object inside it */
  const results = useMemo(() => {
    if (query.length < 2) return []

    const fams = FAMILIES
      .filter((f) => norm(f).includes(query))
      .slice(0, MAX_FAMILIES)
      .map((f) => ({
        kind: 'family',
        key: `f:${f}`,
        title: f,
        sub: 'Collection',
        to: `/collections/${canonicalFamilySlug(f)}`,
      }))

    const pieces = products
      .map((p) => ({ p, s: score(p, query) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || a.p.name.localeCompare(b.p.name))
      .slice(0, MAX_PIECES)
      .map(({ p }) => ({
        kind: 'piece',
        key: `p:${p.slug}`,
        title: p.name,
        sub: `${p.category} · ${p.material}`,
        img: p.imageThumb || p.image || productImg(p.slug),
        to: `/catalogue/${p.slug}`,
      }))

    return [...fams, ...pieces]
  }, [query, products])

  /* a fresh query starts at the top of a fresh list */
  useEffect(() => { setActive(0) }, [query])

  /* click anywhere else and the panel closes */
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const go = (to) => {
    setOpen(false)
    inputRef.current?.blur()
    navigate(to)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (q) { setQ(''); setOpen(false) } else inputRef.current?.blur()
      return
    }
    if (!results.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => (i - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      go(results[Math.min(active, results.length - 1)].to)
    }
  }

  const showPanel = open && query.length >= 2
  const activeId = results[active] ? `${listId}-${active}` : undefined

  return (
    <div className="cs" ref={rootRef}>
      <div className={`cs-field${showPanel ? ' is-open' : ''}${q ? ' has-q' : ''}`}>
        <span className="cs-icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="m13.5 13.5 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>

        <input
          ref={inputRef}
          className="cs-input"
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search the bench — copper jug, brass pull, barware…"
          aria-label="Search products and collections"
          autoComplete="off"
          spellCheck="false"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
        />

        {q && (
          <button
            type="button"
            className="cs-clear"
            onClick={() => { setQ(''); inputRef.current?.focus() }}
            aria-label="Clear the search"
          >
            <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 2.5 9.5 9.5M9.5 2.5 2.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        )}

        <span className="cs-hint" aria-hidden="true">
          {query.length >= 2
            ? `${results.length} match${results.length === 1 ? '' : 'es'}`
            : 'Catalogue'}
        </span>
      </div>

      {showPanel && (
        <div className="cs-panel">
          {results.length ? (
            <ul className="cs-list" id={listId} role="listbox" aria-label="Search results">
              {results.map((r, i) => (
                <li key={r.key} role="presentation">
                  <Link
                    to={r.to}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    className={`cs-row${i === active ? ' is-active' : ''}`}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => setOpen(false)}
                  >
                    <span className="cs-thumb" data-kind={r.kind}>
                      {r.kind === 'piece' ? (
                        <img src={r.img} alt="" loading="lazy" decoding="async" draggable="false" />
                      ) : (
                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M2.5 3.5h11M2.5 8h11M2.5 12.5h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                      )}
                    </span>

                    <span className="cs-row-txt">
                      <span className="cs-row-name">{r.title}</span>
                      <span className="cs-row-sub">{r.sub}</span>
                    </span>

                    <span className="cs-row-arrow" aria-hidden="true">
                      <svg viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            /* an empty result is still a route forward, not a dead end */
            <div className="cs-empty">
              <p className="cs-empty-head">Nothing filed under “{q.trim()}”.</p>
              <p className="cs-empty-sub">
                The bench works to drawing as well as to catalogue —{' '}
                <Link to="/contact" onClick={() => setOpen(false)}>send yours</Link>, or{' '}
                <Link to="/catalogue" onClick={() => setOpen(false)}>browse every piece</Link>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
