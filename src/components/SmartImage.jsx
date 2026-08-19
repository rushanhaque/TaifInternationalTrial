import { useEffect, useRef, useState } from 'react'
import '../styles/smart-image.css'

/* ============ SmartImage ============
   One <img> that behaves the way every image on this site should.

   THREE THINGS IT DOES that a bare <img src> does not:

   1. THUMBNAIL FIRST. Every image uploaded through /admin is stored twice —
      the full picture and a ~420px WebP companion (see src/lib/image.js). The
      thumbnail is a tenth of the weight and arrives first; it is painted
      immediately, blurred and scaled up, and the full image cross-fades over
      it once decoded. The frame is never empty, so there is no grey box and
      no flash of unstyled photograph.

   2. NO LAYOUT SHIFT. `ratio` reserves the box before a single byte arrives.
      Images that arrive late and push the page down are the largest single
      cause of a poor Cumulative Layout Shift score, and no amount of lazy
      loading fixes it — reserving the space does.

   3. HONEST PRIORITY. Below-the-fold images are `loading="lazy"`; the one
      image that is the Largest Contentful Paint gets `priority` instead,
      which marks it eager AND high-fetchpriority. Marking everything lazy is
      as wrong as marking nothing lazy: a lazy LCP image is a slower LCP.

   `decoding="async"` is on everything. It keeps image decode off the main
   thread, so a heavy photograph cannot stall an interaction.               */

export default function SmartImage({
  src,
  thumb,
  alt = '',
  /* width / height, or a CSS aspect-ratio string like '4 / 5'. Reserves the
     box up front. Pass null only when the parent already fixes the height. */
  ratio = null,
  /* the LCP image — the hero, the top of a product page. At most one per
     screenful, or the hint means nothing. */
  priority = false,
  className = '',
  wrapClassName = '',
  sizes,
  srcSet,
  style,
  imgStyle,
  ...rest
}) {
  /* An already-cached image fires no load event in some engines, so start by
     asking the DOM whether it is complete rather than waiting to be told. */
  const imgRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
    const el = imgRef.current
    if (el?.complete && el.naturalWidth > 0) setLoaded(true)
  }, [src])

  /* Nothing to show. Render the reserved box so the layout is still right —
     a missing image should leave a hole of the correct size, not collapse
     the row and shove everything up. */
  if (!src) {
    return <span className={`si ${wrapClassName}`} style={{ aspectRatio: ratio || undefined, ...style }} aria-hidden="true" />
  }

  /* No separate thumbnail (a pasted URL, or an image that predates the
     pipeline): skip the cross-fade machinery entirely and render one plain
     img. A wrapper and a state hook for nothing is not free. */
  const hasThumb = !!thumb && thumb !== src

  const shared = {
    alt,
    sizes,
    srcSet,
    decoding: 'async',
    /* lowercase, not the camelCase `fetchPriority` React 19 accepts: on
       React 18 that spelling is an unrecognised prop, which logs a warning
       for every image on the page. The lowercase form passes straight
       through to the DOM attribute the browser actually reads. */
    ...(priority
      ? { loading: 'eager', fetchpriority: 'high' }
      : { loading: 'lazy', fetchpriority: 'low' }),
  }

  if (!hasThumb) {
    return (
      <img
        {...shared}
        {...rest}
        ref={imgRef}
        src={src}
        className={className}
        style={{ aspectRatio: ratio || undefined, ...style, ...imgStyle }}
      />
    )
  }

  return (
    <span className={`si ${wrapClassName}`} style={{ aspectRatio: ratio || undefined, ...style }}>
      {/* the placeholder is decorative — the real image below carries the alt,
          and two elements with the same alt reads it twice to a screen reader */}
      <img
        className={`si-thumb ${className}`}
        src={thumb}
        alt=""
        aria-hidden="true"
        decoding="async"
        /* never lazy: it is the thing standing in for the lazy image, so
           deferring it defeats the point */
        loading="eager"
        data-loaded={loaded || undefined}
        style={imgStyle}
      />
      <img
        {...shared}
        {...rest}
        ref={imgRef}
        src={src}
        className={`si-full ${className}`}
        data-loaded={loaded || undefined}
        onLoad={() => setLoaded(true)}
        /* a broken full image should leave the thumbnail showing rather than
           a broken-image icon over it */
        onError={() => setLoaded(false)}
        style={imgStyle}
      />
    </span>
  )
}

/** The pair a record stores for one image field: `image` + `imageThumb`. */
export const imagePair = (record, key = 'image', fallback = '') => ({
  src: record?.[key] || fallback,
  thumb: record?.[`${key}Thumb`] || '',
})
