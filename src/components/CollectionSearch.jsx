import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, navigate } from '../lib/router'
import { useContent } from '../lib/content'
import { productImg } from '../data/images'
import { FAMILIES, canonicalFamilySlug } from '../lib/families'
import { buildIndex, markRuns, searchFamilies, searchIndex, tokenize } from '../lib/search'

/* ── THE SEARCH BAR — /collections ──────────────────────────────────────────
   Nine families is a small enough wall to read; the thirty-odd pieces behind
   it are not. A buyer who arrives knowing they want a copper jug should not
   have to guess which family files it. The field sits directly under the
   lede, above the plates, and answers as it is typed.

   It searches the pieces AND the families, because half the queries a buyer
   types ('barware', 'copper') name a room rather than an object, and sending
   them to the family page is the better answer.

   The matching itself is in lib/search.js — word-by-word across weighted
   fields, a trade thesaurus, and one typo's tolerance. That file carries the
   reasoning. This one is the field, the list and the keys.

   Fail open: with the field empty the page is exactly what it was. Nothing
   below is filtered, hidden or re-ordered — the results are an overlay, so a
   visitor who ignores the field never notices it is there.                 */

const MAX_PIECES = 8
const MAX_FAMILIES = 3

export default function CollectionSearch() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const listId = useId()

  /* through the hook, not getProducts(), so an admin edit reaches the field
     without a reload — same contract the catalogue and the family pages use */
  const products = useContent('products') || []

  /* every field of every piece, folded once. Rebuilt only when the catalogue
     itself changes — not on each keystroke, which is the whole point of
     keeping it out of the search below. */
  const index = useMemo(() => buildIndex(products), [products])

  const tokens = useMemo(() => tokenize(q), [q])
  const ready = tokens.length > 0 && q.trim().length >= 2

  /* families first, then pieces — a family is the broader answer, and a
     buyer who typed one wants the room rather than one object inside it */
  const results = useMemo(() => {
    if (!ready) return []

    const fams = searchFamilies(FAMILIES, tokens, MAX_FAMILIES).map((r) => ({
      kind: 'family',
      key: `f:${r.name}`,
      runs: markRuns(r.name, r.marks),
      sub: 'Collection',
      to: `/collections/${canonicalFamilySlug(r.name)}`,
    }))

    const pieces = searchIndex(index, tokens, MAX_PIECES).map((r) => {
      const p = r.item
      return {
        kind: 'piece',
        key: `p:${p.slug}`,
        runs: markRuns(p.name, r.marks),
        /* the family and the shelf it sits on — subcategory is what a buyer
           searched by half the time, so it belongs in the answer */
        sub: [p.category, p.subcategory, p.material].filter(Boolean).join(' · '),
        img: p.imageThumb || p.image || productImg(p.slug),
        to: `/catalogue/${p.slug}`,
      }
    })

    return [...fams, ...pieces]
  }, [ready, tokens, index])

  /* a fresh query starts at the top of a fresh list */
  useEffect(() => { setActive(0) }, [q])

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

  const showPanel = open && ready
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
          {ready
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
                  {/* a heading where the kind changes — two collections and
                      eight pieces in one undivided list read as ten things of
                      the same sort, and they are not */}
                  {r.kind !== results[i - 1]?.kind && (
                    <span className="cs-group" role="presentation">
                      {r.kind === 'family' ? 'Collections' : 'Pieces'}
                    </span>
                  )}
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
                      <span className="cs-row-name">
                        {/* the matched words carried through folding and
                            marked in the original spelling — a buyer scanning
                            eight rows should see why each one is here */}
                        {r.runs.map((run, n) =>
                          run.hit
                            ? <mark key={n} className="cs-hit">{run.text}</mark>
                            : <span key={n}>{run.text}</span>,
                        )}
                      </span>
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
