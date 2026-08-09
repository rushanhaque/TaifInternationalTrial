import { useMemo, useState } from 'react'
import { Link } from '../../lib/router'
import { useCart } from '../../lib/cart'

/* ── THE INDEX ──────────────────────────────────────────────────────────────
   The gallery is for looking. This is for buying.

   A buyer comparing twenty pieces is not browsing pictures — they are
   scanning for a piece that fits an MOQ, a lead time and a size, and cards
   make that comparison impossible because the numbers never line up. So the
   catalogue carries a second view: one dense, sortable, tabular-figure list
   where every column IS comparable down the page.

   Sorting is real (name, category, MOQ, lead, weight), and lead sorts by the
   parsed number of weeks rather than the string, so "6 wks" and "12 wks"
   order correctly instead of alphabetically.

   FAIL-OPEN: this is a plain semantic table of real text. Nothing is hidden,
   nothing depends on an animation, and it stays fully readable and sortable
   with no JS beyond React itself. */

const weeks = (lead) => {
  const m = String(lead).match(/\d+/)
  return m ? +m[0] : 999
}

const COLS = [
  { key: 'name', label: 'Piece', get: (p) => p.name, align: 'left' },
  { key: 'category', label: 'Family', get: (p) => p.category, align: 'left' },
  { key: 'material', label: 'Material', get: (p) => p.material, align: 'left' },
  { key: 'dims', label: 'Dimensions', get: (p) => p.dims, align: 'left', num: true },
  { key: 'weight', label: 'Weight', get: (p) => parseFloat(p.weight) || 0, show: (p) => p.weight, align: 'right', num: true },
  { key: 'moq', label: 'MOQ', get: (p) => p.moq, align: 'right', num: true },
  { key: 'lead', label: 'Lead', get: (p) => weeks(p.lead), show: (p) => p.lead, align: 'right', num: true },
]

export default function CatalogueIndex({ items }) {
  const [sort, setSort] = useState({ key: 'name', dir: 1 })
  const { add, remove, has, setOpen } = useCart()

  const rows = useMemo(() => {
    const col = COLS.find((c) => c.key === sort.key) || COLS[0]
    return [...items].sort((a, b) => {
      const av = col.get(a)
      const bv = col.get(b)
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sort.dir
      return String(av).localeCompare(String(bv)) * sort.dir
    })
  }, [items, sort])

  const flip = (key) =>
    setSort((s) => ({ key, dir: s.key === key ? -s.dir : 1 }))

  return (
    <div className="cx" role="region" aria-label="Catalogue index">
      <div className="cx-scroll">
        <table className="cx-table">
          <caption className="sr-only">
            All catalogue pieces with material, dimensions, weight, minimum
            order quantity and lead time. Column headers sort the table.
          </caption>
          <thead>
            <tr>
              {COLS.map((c) => {
                const active = sort.key === c.key
                return (
                  <th
                    key={c.key}
                    scope="col"
                    className={`cx-th cx-${c.align} ${active ? 'is-sorted' : ''}`}
                    aria-sort={active ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}
                  >
                    <button type="button" className="cx-sort" onClick={() => flip(c.key)}>
                      <span>{c.label}</span>
                      <i className="cx-caret" aria-hidden="true">
                        {active ? (sort.dir === 1 ? '↑' : '↓') : '↕'}
                      </i>
                    </button>
                  </th>
                )
              })}
              <th scope="col" className="cx-th cx-right"><span className="sr-only">Cart</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr className="cx-row" key={p.slug}>
                <td className="cx-td cx-name">
                  <Link to={`/catalogue/${p.slug}`} className="cx-link" transition="slide-product">
                    <span className={`cx-chip tone-${p.tone}`} aria-hidden="true" />
                    <span>{p.name}</span>
                  </Link>
                </td>
                <td className="cx-td cx-muted">{p.category}</td>
                <td className="cx-td cx-muted">{p.material}</td>
                <td className="cx-td cx-num">{p.dims}</td>
                <td className="cx-td cx-num cx-right">{p.weight}</td>
                <td className="cx-td cx-num cx-right">{p.moq}</td>
                <td className="cx-td cx-num cx-right">{p.lead}</td>
                <td className="cx-td cx-right">
                  <button
                    type="button"
                    className={`cx-add ${has(p.slug) ? 'is-in' : ''}`}
                    onClick={() => (has(p.slug) ? remove(p.slug) : add(p))}
                    aria-label={has(p.slug)
                      ? `Remove ${p.name} from your cart`
                      : `Add ${p.name} to your cart`}
                  >
                    {has(p.slug) ? 'In' : 'Add'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="cx-foot meta">
        {rows.length} {rows.length === 1 ? 'piece' : 'pieces'} · sorted by{' '}
        {(COLS.find((c) => c.key === sort.key) || COLS[0]).label.toLowerCase()}
        {sort.dir === 1 ? ' ascending' : ' descending'}
      </p>
    </div>
  )
}
