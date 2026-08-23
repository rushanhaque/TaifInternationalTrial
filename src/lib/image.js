/* ============ image pipeline ============
   Everything an admin uploads goes through here before it is stored.

   WHY: uploaded images are kept as data URLs inside content.snapshot.json,
   and that file is imported by src/lib/content.jsx — so it is baked into the
   main JS bundle. A single 900 KB phone photograph therefore costs every
   visitor 1.2 MB of render-blocking JavaScript (base64 is ~33% larger than
   the file). Re-encoding to WebP at upload time is the difference between a
   fast site and a slow one, and it costs the admin nothing.

   WHAT IT DOES, per upload:
     1. decodes the file honouring its EXIF orientation,
     2. caps the long edge at FULL_EDGE (a 4000px camera original is never
        displayed above ~1600px on this site),
     3. encodes WebP at QUALITY_FULL — visually lossless at normal viewing
        sizes, typically 60–80% smaller than the JPEG that went in,
     4. encodes a second, small WebP thumbnail for list rows and cards,
     5. keeps whichever of {new, original} is actually smaller.

   ON "NO LOSS OF QUALITY": WebP at q=0.92 is *visually* lossless, not
   mathematically lossless. True lossless WebP exists but is routinely LARGER
   than the source JPEG for photographs, which would defeat the purpose. If a
   piece of artwork must survive byte-for-byte, paste its URL instead of
   uploading it — a pasted URL is stored verbatim and never re-encoded.

   FORMATS LEFT ALONE: SVG (vector, already tiny, canvas would rasterise it)
   and GIF (canvas keeps only the first frame, killing the animation).        */

/* Long edge caps. FULL_EDGE is generous — the widest an uploaded image is
   ever painted here is a full-bleed hero on a 2x laptop. */
const FULL_EDGE  = 1800
const THUMB_EDGE = 420

const QUALITY_FULL  = 0.92
const QUALITY_THUMB = 0.7

/* How large a single stored image is allowed to be, in data-URL characters.
   Everything here is base64 inside the JS bundle, so this is a real cost paid
   by every visitor — see the WHY at the top of this file. */
export const STORE_BUDGET = 900_000

/* ── THE COMPRESSION LADDER ───────────────────────────────────────────────
   One pass at 1800/0.92 is right for a normal photograph and not nearly
   enough for a 6000px camera original, which lands around 1.5 MB even after
   conversion. Rather than refuse that upload, walk down this ladder until a
   step fits STORE_BUDGET and keep the first one that does.

   Each rung drops the long edge, the quality, or both. The early rungs give
   up quality the eye does not miss at these display sizes; only the last few
   start costing visible resolution, and they exist so that there is always
   an answer — a huge upload comes out soft rather than rejected.

   Ordered largest-first, so a normal image stops on rung 1 and never pays
   for the rest. */
const LADDER = [
  { edge: 1800, quality: 0.92 },
  { edge: 1800, quality: 0.82 },
  { edge: 1600, quality: 0.76 },
  { edge: 1400, quality: 0.70 },
  { edge: 1200, quality: 0.64 },
  { edge: 1000, quality: 0.58 },
  { edge: 820,  quality: 0.52 },
  { edge: 640,  quality: 0.46 },
]

/* Formats whose meaning would be destroyed by a canvas round-trip. */
const PASSTHROUGH = /^image\/(svg\+xml|gif)$/i

/* ── capability probe ─────────────────────────────────────────────────────
   Safari only learned WebP encoding in 16.  Ask the canvas rather than the
   user agent: toDataURL silently falls back to PNG when it cannot honour the
   requested type, so the returned prefix is the honest answer. */
let webpOk = null
export function supportsWebp() {
  if (webpOk !== null) return webpOk
  try {
    const c = document.createElement('canvas')
    c.width = 1
    c.height = 1
    webpOk = c.toDataURL('image/webp').startsWith('data:image/webp')
  } catch {
    webpOk = false
  }
  return webpOk
}

const OUT_TYPE = () => (supportsWebp() ? 'image/webp' : 'image/jpeg')

/* ── decoding ─────────────────────────────────────────────────────────────
   createImageBitmap with imageOrientation:'from-image' is the only path that
   applies EXIF rotation reliably; without it a portrait phone photo lands on
   its side. Older browsers ignore the option or lack the function entirely,
   so an <img> decode is kept as the fallback (those browsers also auto-rotate
   <img> by default, so orientation still survives). */
async function decode(blob) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(blob, { imageOrientation: 'from-image' })
    } catch {
      /* option unsupported on this engine — try again without it */
      try { return await createImageBitmap(blob) } catch { /* fall through */ }
    }
  }
  return await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file is not an image this browser can read.')) }
    img.src = url
  })
}

const sizeOf = (src) => ({
  w: src.width || src.naturalWidth || 0,
  h: src.height || src.naturalHeight || 0,
})

/* Draw `src` scaled to fit inside `edge` and return a data URL. Never scales
   up: a 200px logo asked to fit 1800 stays 200px rather than turning into a
   blurred 1800px file nine times the weight. */
function render(src, edge, quality) {
  const { w, h } = sizeOf(src)
  if (!w || !h) throw new Error('That image has no readable dimensions.')

  const scale = Math.min(1, edge / Math.max(w, h))
  const cw = Math.max(1, Math.round(w * scale))
  const ch = Math.max(1, Math.round(h * scale))

  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')
  /* the browser's own resampler; without this a downscale looks aliased */
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(src, 0, 0, cw, ch)

  const url = canvas.toDataURL(OUT_TYPE(), quality)
  /* free the backing store early — several multi-megapixel canvases alive at
     once is enough to get the tab killed on a low-memory phone */
  canvas.width = 0
  canvas.height = 0
  return { url, w: cw, h: ch }
}

/** Bytes a data URL costs once stored (the base64 payload, not the decoded image). */
export const dataUrlBytes = (s) => (typeof s === 'string' ? s.length : 0)

const readAsDataUrl = (blob) => new Promise((resolve, reject) => {
  const r = new FileReader()
  r.onload = () => resolve(r.result)
  r.onerror = () => reject(new Error('Could not read that file.'))
  r.readAsDataURL(blob)
})

/**
 * Re-encode an uploaded file for storage.
 *
 * @param {Blob} file
 * @returns {Promise<{full:string, thumb:string, width:number, height:number,
 *                    beforeBytes:number, afterBytes:number, format:string,
 *                    converted:boolean, note:string}>}
 */
export async function processImage(file) {
  const beforeBytes = file.size || 0

  if (PASSTHROUGH.test(file.type || '')) {
    const url = await readAsDataUrl(file)
    return {
      full: url, thumb: url, width: 0, height: 0,
      beforeBytes, afterBytes: dataUrlBytes(url),
      format: file.type, converted: false,
      note: `${file.type === 'image/gif' ? 'GIF' : 'SVG'} kept as-is — converting it would ${file.type === 'image/gif' ? 'drop the animation' : 'turn vector into pixels'}.`,
    }
  }

  const bitmap = await decode(file)
  try {
    /* Walk the ladder until something fits. `full` always ends up holding a
       result — if even the last rung is over budget we keep it anyway, since
       the smallest thing we can produce is still the best available answer
       and refusing the upload helps nobody. */
    let full = null
    let rung = 0
    for (let i = 0; i < LADDER.length; i += 1) {
      const step = LADDER[i]
      full = render(bitmap, step.edge, step.quality)
      rung = i
      if (dataUrlBytes(full.url) <= STORE_BUDGET) break
    }

    const thumb = render(bitmap, THUMB_EDGE, QUALITY_THUMB)

    /* A small PNG screenshot or an already-tiny JPEG can come out of the
       encoder *larger* than it went in. Storing the bigger one would make
       "optimise" a pessimisation, so keep the original when that happens —
       the thumbnail is still worth generating either way.

       The budget check is part of the condition on purpose: an original that
       is smaller than a rung-1 encode but still over budget must NOT win, or
       a 3 MB photograph would sail through untouched precisely because the
       encoder had already done its job on the rung we were comparing to. */
    const original = await readAsDataUrl(file)
    const keptOriginal =
      dataUrlBytes(full.url) >= dataUrlBytes(original) &&
      dataUrlBytes(original) <= STORE_BUDGET
    const chosen = keptOriginal ? original : full.url

    const overBudget = dataUrlBytes(chosen) > STORE_BUDGET
    const squeezed = !keptOriginal && rung > 0

    return {
      full: chosen,
      thumb: thumb.url,
      width: full.w,
      height: full.h,
      beforeBytes,
      afterBytes: dataUrlBytes(chosen) + dataUrlBytes(thumb.url),
      format: keptOriginal ? (file.type || 'image') : OUT_TYPE(),
      converted: !keptOriginal && OUT_TYPE() === 'image/webp',
      /* what actually happened, so the admin is told rather than guessing */
      steps: rung + 1,
      resized: !keptOriginal ? { w: full.w, h: full.h } : null,
      overBudget,
      note: keptOriginal
        ? 'Already smaller than the converted version — kept the original.'
        : overBudget
          ? `Compressed as far as the pipeline goes — stored at ${full.w}×${full.h}. It is still large; a smaller source or a pasted URL would do better.`
          : squeezed
            ? `Large source — compressed harder than usual, stored at ${full.w}×${full.h}.`
            : (supportsWebp() ? '' : 'This browser cannot write WebP — saved as optimised JPEG instead.'),
    }
  } finally {
    bitmap.close?.()
  }
}

/**
 * Re-encode an image that is already stored as a data URL (or fetch-able URL
 * on this origin). Used by the admin's bulk optimiser to shrink images that
 * were uploaded before this pipeline existed. Returns null when the input is
 * not something we can or should re-encode.
 */
export async function reprocessDataUrl(src) {
  if (typeof src !== 'string' || !src.startsWith('data:image/')) return null
  if (PASSTHROUGH.test(src.slice(5, src.indexOf(';')))) return null
  const blob = await (await fetch(src)).blob()
  return processImage(blob)
}

/** Human-readable byte count for admin notices. */
export function humanBytes(n) {
  if (!n) return '0 B'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
