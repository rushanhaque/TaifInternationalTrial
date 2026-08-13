import React, { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, reduced } from '../lib/gsap'

/**
 * EditorialReveal — High-End Luxury Text Reveal Component
 * 
 * Inspired by premium furniture & material showcase editorial layouts.
 * Sequence:
 *  1. Category / Eyebrow (translateY 30px -> 0, opacity 0 -> 1)
 *  2. Main Title / Product Name (translateY 30px -> 0, opacity 0 -> 1)
 *  3. Body / Lede Description (translateY 30px -> 0, opacity 0 -> 1)
 *  4. Specification items (staggered 80–120ms apart)
 * 
 * Uses GSAP + ScrollTrigger, ultra-calm slow ease-out, 60 FPS sharp rendering.
 */
export function EditorialReveal({
  category,
  title,
  body,
  specs = [],
  as = 'div',
  className = '',
  delay = 0,
  staggerMs = 100, // 80 - 120ms
  start = 'top 85%',
  once = true,
  disabled = false,
  children,
  style,
  ...rest
}) {
  const containerRef = useRef(null)
  const categoryRef = useRef(null)
  const titleRef = useRef(null)
  const bodyRef = useRef(null)
  const specsRef = useRef([])

  useEffect(() => {
    if (disabled || !containerRef.current) return

    // If reduced motion, set fully visible & clear transforms
    if (reduced()) {
      const targets = [
        categoryRef.current,
        titleRef.current,
        bodyRef.current,
        ...specsRef.current.filter(Boolean)
      ].filter(Boolean)
      gsap.set(targets, { opacity: 1, y: 0, clearProps: 'all' })
      return
    }

    // Query elements inside container (supports both props & children slot patterns)
    const catEl = categoryRef.current || containerRef.current.querySelector('.ed-category')
    const titleEl = titleRef.current || containerRef.current.querySelector('.ed-title')
    const bodyEl = bodyRef.current || containerRef.current.querySelector('.ed-body')
    const specEls = specsRef.current.length > 0 && specsRef.current[0]
      ? specsRef.current.filter(Boolean)
      : Array.from(containerRef.current.querySelectorAll('.ed-spec-item'))
    const ctaEl = containerRef.current.querySelector('.ed-cta')

    const allTargets = [catEl, titleEl, bodyEl, ...specEls, ctaEl].filter(Boolean)
    if (allTargets.length === 0) return

    // Hidden initial state: subtle 25px vertical offset, opacity 0 (no bounce, scale, rotation, or blur)
    gsap.set(allTargets, {
      opacity: 0,
      y: 25,
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden',
      force3D: true
    })

    const staggerSec = Math.max(0.08, Math.min(0.12, staggerMs / 1000))
    const ease = 'power3.out'

    // GSAP timeline with power3.out for smooth, calm editorial reveal
    const tl = gsap.timeline({
      delay,
      scrollTrigger: {
        trigger: containerRef.current,
        start,
        toggleActions: 'play none none none',
        once: true
      },
      onComplete: () => {
        // Clear transform to keep typography 100% crisp and stable
        gsap.set(allTargets, { clearProps: 'transform,willChange,backfaceVisibility' })
      }
    })

    // If trigger is already in viewport on mount, play timeline immediately
    if (tl.scrollTrigger && tl.scrollTrigger.progress > 0) {
      tl.play()
    }

    // 1. Small label appears first
    if (catEl) {
      tl.to(catEl, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease
      })
    }

    // 2. Large heading slides upward while fading in (starts slightly after label)
    if (titleEl) {
      tl.to(
        titleEl,
        {
          y: 0,
          opacity: 1,
          duration: 0.95,
          ease
        },
        catEl ? '-=0.62' : 0
      )
    }

    // 3. Description follows after a slight delay
    if (bodyEl) {
      tl.to(
        bodyEl,
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease
        },
        titleEl ? '-=0.74' : catEl ? '-=0.62' : 0
      )
    }

    // 4. Specification values animate last with a subtle stagger (80-120ms)
    if (specEls.length > 0) {
      tl.to(
        specEls,
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: staggerSec,
          ease
        },
        bodyEl ? '-=0.68' : titleEl ? '-=0.74' : catEl ? '-=0.62' : 0
      )
    }

    // 5. CTA Button / Action element
    if (ctaEl) {
      tl.to(
        ctaEl,
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease
        },
        specEls.length > 0 ? '-=0.55' : bodyEl ? '-=0.68' : 0
      )
    }

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [category, title, body, specs, delay, staggerMs, start, once])

  const Component = as

  return (
    <Component
      ref={containerRef}
      className={`ed-container ${className}`.trim()}
      style={style}
      {...rest}
    >
      {/* Declarative mode rendering if props provided */}
      {category && (
        <span ref={categoryRef} className="ed-category">
          {category}
        </span>
      )}

      {title && (
        <h2 ref={titleRef} className="ed-title">
          {title}
        </h2>
      )}

      {body && (
        <p ref={bodyRef} className="ed-body">
          {body}
        </p>
      )}

      {specs && specs.length > 0 && (
        <ul className="ed-specs">
          {specs.map((item, idx) => {
            const label = typeof item === 'object' ? item.label : null
            const value = typeof item === 'object' ? item.value : item
            return (
              <li
                key={idx}
                ref={(el) => (specsRef.current[idx] = el)}
                className="ed-spec-item"
              >
                {label && <span className="ed-spec-label">{label}</span>}
                <span className="ed-spec-value">{value}</span>
              </li>
            )
          })}
        </ul>
      )}

      {/* Children slot rendering if children provided */}
      {children}
    </Component>
  )
}

// Attach sub-components for compound layout usage
EditorialReveal.Container = EditorialReveal

EditorialReveal.Category = function EditorialCategory({ children, className = '', ...props }) {
  return (
    <span className={`ed-category ${className}`.trim()} {...props}>
      {children}
    </span>
  )
}

EditorialReveal.Title = function EditorialTitle({ as: Tag = 'h2', children, className = '', ...props }) {
  return (
    <Tag className={`ed-title ${className}`.trim()} {...props}>
      {children}
    </Tag>
  )
}

EditorialReveal.Body = function EditorialBody({ children, className = '', ...props }) {
  return (
    <p className={`ed-body ${className}`.trim()} {...props}>
      {children}
    </p>
  )
}

EditorialReveal.Specs = function EditorialSpecs({ children, className = '', ...props }) {
  return (
    <ul className={`ed-specs ${className}`.trim()} {...props}>
      {children}
    </ul>
  )
}

EditorialReveal.SpecItem = function EditorialSpecItem({ label, value, children, className = '', ...props }) {
  return (
    <li className={`ed-spec-item ${className}`.trim()} {...props}>
      {label && <span className="ed-spec-label">{label}</span>}
      <span className="ed-spec-value">{value || children}</span>
    </li>
  )
}

export default EditorialReveal
