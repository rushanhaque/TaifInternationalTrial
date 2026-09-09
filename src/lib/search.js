/* ── THE CATALOGUE MATCHER ──────────────────────────────────────────────────
   The scoring behind the /collections search field. It lives here rather than
   in the component because it is the part with rules in it — the component is
   a text input and a list.

   What it is answering: a buyer types trade words, not catalogue words. They
   ask for a "copper mug" when the row is filed as Mugs under Copper Products,
   for "cutlery" when the subcategory is spelled Cuttlery, for "puja" when the
   family is Religious Supplies. The first version of this searched the whole
   query as one substring against a few fields, which meant "copper mug"
   found nothing at all — no single field contains that string.

   Four things fix that, in order of how much they matter:

   1. EVERY WORD MUST MATCH, BUT NOT IN THE SAME FIELD. "copper mug" scores
      because 'copper' hits the family and 'mug' hits the subcategory. A word
      that hits nothing disqualifies the row, so adding words narrows rather
      than widens — which is what a person expects a search box to do.

   2. WEIGHTED FIELDS. A hit on the name is worth more than one on the
      material, which is worth more than one buried in the story. Within a
      field, a whole word beats the start of a word beats a substring.

   3. TRADE SYNONYMS. A small hand-written thesaurus of the words this
      catalogue's buyers actually use. Synonym hits score at a discount so a
      literal match always outranks them.

   4. ONE TYPO. Only as a last resort for a word that matched nothing at all,
      and only for words long enough that a single edit is unambiguous.

   It also reports WHICH parts of the name matched, so the panel can mark
   them — a buyer scanning eight rows should not have to work out why each one
   is there.                                                                */

/* ── folding ──────────────────────────────────────────────────────────────
   Every comparison happens on a folded string: accents dropped, case dropped,
   apostrophes removed so Dispenser's answers to "dispensers".

   foldMap also returns an index per folded character pointing back into the
   source, which is what lets the panel mark a match in the ORIGINAL text.
   A plain normalize('NFD').replace(...) cannot do that: it changes the
   string's length, so an offset found in the folded copy no longer means
   anything in the source. */
export function foldMap(str) {
  const out = []
  const map = []
  const s = String(str || '')

  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === "'" || ch === '’') continue           // Dispenser's → dispensers
    const folded = ch.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    for (const c of folded) { out.push(c); map.push(i) }
  }

  return { text: out.join(''), map }
}

export const fold = (str) => foldMap(str).text

/* ── the thesaurus ────────────────────────────────────────────────────────
   Groups of words that should find each other. Deliberately small and
   hand-written: a general-purpose stemmer would also decide that 'lid' and
   'lids' and 'lidding' are the same thing, and be wrong about this catalogue
   more often than it was right.

   Misspellings that exist IN THE DATA belong here too (cuttlery, chandeleirs)
   — the buyer types the correct word and should still land on the row. */
const SYNONYM_GROUPS = [
  ['mug', 'mugs', 'cup', 'cups', 'tankard'],
  ['glass', 'glasses', 'tumbler', 'tumblers', 'goblet'],
  ['bottle', 'bottles', 'flask', 'canteen'],
  ['dispenser', 'dispensers', 'urn', 'decanter'],
  ['tray', 'trays', 'platter', 'salver'],
  ['bowl', 'bowls', 'dish', 'dishes'],
  ['box', 'boxes', 'case', 'casket', 'keepsake'],
  ['gift', 'gifts', 'gifting', 'present', 'hamper', 'hampers', 'corporate', 'set', 'sets'],
  ['diya', 'diyas', 'lamp', 'lamps', 'lantern', 'lanterns', 'light', 'lighting'],
  ['pooja', 'puja', 'religious', 'temple', 'ritual', 'worship', 'thali', 'kalash'],
  ['kitchen', 'kitchenware', 'cook', 'cookware', 'cutlery', 'cuttlery', 'utensil', 'utensils'],
  ['bar', 'barware', 'cocktail', 'drinks', 'drinkware'],
  ['bath', 'bathroom', 'washroom', 'vanity', 'soap', 'towel'],
  ['decor', 'decoration', 'decorative', 'ornament', 'ornaments', 'home'],
  ['wood', 'wooden', 'timber', 'sheesham', 'rosewood', 'teak', 'acacia', 'mango'],
  ['copper', 'tamba'],
  ['brass', 'bronze'],
  ['hardware', 'fitting', 'fittings', 'knob', 'knobs', 'pull', 'pulls', 'handle', 'handles', 'hinge', 'hinges'],
  ['chandelier', 'chandeliers', 'chandeleirs', 'pendant'],
  ['console', 'table', 'tables', 'furniture'],
  ['hammered', 'hammer', 'beaten'],
  ['etched', 'etching', 'engraved', 'engraving', 'embossed'],
  ['jali', 'fretwork', 'pierced'],
  ['vase', 'planter', 'pot'],
]

/* word → every other word in its groups (a word may sit in more than one) */
const SYNONYMS = (() => {
  const m = new Map()
  for (const group of SYNONYM_GROUPS) {
    for (const w of group) {
      const bag = m.get(w) || new Set()
      for (const other of group) if (other !== w) bag.add(other)
      m.set(w, bag)
    }
  }
  return m
})()

/* ── query → words ────────────────────────────────────────────────────────
   Single letters are dropped: on a 33-piece catalogue one letter matches
   nearly everything, so it is noise rather than a filter. */
export function tokenize(q) {
  return fold(q).split(/[^a-z0-9]+/).filter((t) => t.length >= 2)
}

/* ── how well one word hits one field ─────────────────────────────────────
   3 the field IS the word · 2 the word starts a word in it · 1 it appears
   somewhere inside · 0 not there. The word-boundary test is what stops 'ass'
   from scoring against 'brass' as strongly as 'brass' does. */
function hit(hay, word) {
  if (!hay) return 0
  if (hay === word) return 3

  let i = hay.indexOf(word)
  if (i === -1) return 0

  while (i !== -1) {
    if (i === 0 || !/[a-z0-9]/.test(hay[i - 1])) return 2
    i = hay.indexOf(word, i + 1)
  }
  return 1
}

/* Is `a` reachable from `b` in one edit? Bounded on purpose — a full
   Levenshtein over every word of every field on every keystroke buys
   nothing here, and two edits on a short word starts matching things the
   buyer did not ask for. */
function withinOneEdit(a, b) {
  if (a === b) return true
  const d = a.length - b.length
  if (d > 1 || d < -1) return false

  const [short, long] = a.length <= b.length ? [a, b] : [b, a]
  let i = 0
  let j = 0
  let slack = 1

  while (i < short.length && j < long.length) {
    if (short[i] === long[j]) { i++; j++; continue }
    if (!slack--) return false
    if (short.length === long.length) i++       // substitution
    j++                                          // insertion / substitution
  }
  return true
}

/* what a hit is worth, per field */
const WEIGHT = {
  name: 40,
  subcategory: 26,
  category: 22,
  material: 20,
  finishes: 12,
  tone: 10,
  story: 8,
  dims: 6,
}

const SYNONYM_DISCOUNT = 0.65
const FUZZY_SCORE = 10

/* ── the index ────────────────────────────────────────────────────────────
   Fold every field of every piece once, not once per keystroke. Build this
   with useMemo against the products array; it is the only expensive part. */
export function buildIndex(products) {
  return (products || []).map((p) => {
    const fields = {
      name: fold(p.name),
      subcategory: fold(p.subcategory),
      category: fold(p.category),
      material: fold(p.material),
      finishes: fold(Array.isArray(p.finishes) ? p.finishes.join(' ') : p.finishes),
      tone: fold(p.tone),
      story: fold(p.story),
      dims: fold(p.dims),
    }

    /* the words a typo is allowed to be one edit away from — names and
       labels only, never the story, or a mistyped word finds a paragraph */
    const words = new Set(
      [fields.name, fields.subcategory, fields.category, fields.material]
        .join(' ')
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length >= 4),
    )

    return { item: p, fields, words }
  })
}

/* score one entry against one word; 0 means this word is not here at all */
function scoreWord(entry, word) {
  let best = 0

  for (const field in WEIGHT) {
    const level = hit(entry.fields[field], word)
    if (level) best = Math.max(best, WEIGHT[field] * level)
  }

  if (best) return { score: best, exact: true }

  /* the thesaurus, at a discount so a literal hit always wins */
  const alts = SYNONYMS.get(word)
  if (alts) {
    for (const alt of alts) {
      for (const field in WEIGHT) {
        const level = hit(entry.fields[field], alt)
        if (level) best = Math.max(best, WEIGHT[field] * level * SYNONYM_DISCOUNT)
      }
    }
    if (best) return { score: best, exact: false, via: alts }
  }

  /* last resort: one typo, and only on a word long enough to be sure of */
  if (word.length >= 4) {
    for (const w of entry.words) {
      if (withinOneEdit(word, w)) return { score: FUZZY_SCORE, exact: false, typo: w }
    }
  }

  return { score: 0 }
}

/* ── the search ───────────────────────────────────────────────────────────
   Returns [{ item, score, marks }] sorted best first. `marks` is the set of
   folded strings that actually hit the name, for the panel to highlight. */
export function searchIndex(index, tokens, limit) {
  if (!tokens.length) return []

  const out = []

  for (const entry of index) {
    let total = 0
    const marks = new Set()
    let every = true

    for (const token of tokens) {
      const r = scoreWord(entry, token)
      if (!r.score) { every = false; break }       // AND: one miss disqualifies
      total += r.score

      /* only mark what is really in the name — highlighting a word the row
         matched on its material would point at the wrong thing */
      if (entry.fields.name.includes(token)) marks.add(token)
      if (r.via) for (const alt of r.via) if (entry.fields.name.includes(alt)) marks.add(alt)
      if (r.typo && entry.fields.name.includes(r.typo)) marks.add(r.typo)
    }

    if (!every) continue

    /* the words in the order they were typed, together, in the name — the
       difference between "copper glass" the phrase and two loose hits */
    if (tokens.length > 1 && entry.fields.name.includes(tokens.join(' '))) total += 25

    out.push({ item: entry.item, score: total, marks: [...marks] })
  }

  out.sort((a, b) => b.score - a.score || String(a.item.name).localeCompare(String(b.item.name)))
  return limit ? out.slice(0, limit) : out
}

/* ── highlighting ─────────────────────────────────────────────────────────
   Split the ORIGINAL text into [{ text, hit }] runs using ranges found in the
   folded copy and carried back through foldMap's index. Returns a single
   un-hit run when nothing matched, so the caller renders it the same way. */
export function markRuns(text, marks) {
  const src = String(text || '')
  if (!marks || !marks.length) return [{ text: src, hit: false }]

  const { text: folded, map } = foldMap(src)
  const ranges = []

  for (const m of marks) {
    if (!m) continue
    let i = folded.indexOf(m)
    while (i !== -1) {
      ranges.push([map[i], (map[i + m.length - 1] ?? map[map.length - 1]) + 1])
      i = folded.indexOf(m, i + m.length)
    }
  }

  if (!ranges.length) return [{ text: src, hit: false }]

  ranges.sort((a, b) => a[0] - b[0])

  /* overlapping marks (a synonym inside a literal, say) become one run */
  const merged = [ranges[0]]
  for (const [s, e] of ranges.slice(1)) {
    const last = merged[merged.length - 1]
    if (s <= last[1]) last[1] = Math.max(last[1], e)
    else merged.push([s, e])
  }

  const runs = []
  let at = 0
  for (const [s, e] of merged) {
    if (s > at) runs.push({ text: src.slice(at, s), hit: false })
    runs.push({ text: src.slice(s, e), hit: true })
    at = e
  }
  if (at < src.length) runs.push({ text: src.slice(at), hit: false })

  return runs
}

/* ── families ─────────────────────────────────────────────────────────────
   The same engine over a bare name. A family is the broader answer, so it is
   scored separately and listed first rather than competing with the pieces
   for a place in one ranked list. */
export function searchFamilies(families, tokens, limit) {
  if (!tokens.length) return []

  const out = []

  for (const name of families) {
    const folded = fold(name)
    let total = 0
    const marks = new Set()
    let every = true

    for (const token of tokens) {
      let s = hit(folded, token) * WEIGHT.name
      if (s) marks.add(token)

      if (!s) {
        const alts = SYNONYMS.get(token)
        if (alts) {
          for (const alt of alts) {
            const level = hit(folded, alt)
            if (level) {
              s = Math.max(s, level * WEIGHT.name * SYNONYM_DISCOUNT)
              marks.add(alt)
            }
          }
        }
      }

      if (!s) { every = false; break }
      total += s
    }

    if (every) out.push({ name, score: total, marks: [...marks] })
  }

  out.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
  return limit ? out.slice(0, limit) : out
}
