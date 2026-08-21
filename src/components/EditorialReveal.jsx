import React, { useRef } from 'react'

/**
 * EditorialReveal — editorial text block: eyebrow, title, body, specs, CTA.
 *
 * THE REVEAL IS GONE, AND THE NAME IS NOW A LIE. This staged a GSAP
 * timeline on a ScrollTrigger — eyebrow, then title, then body, then the
 * specs on an 80–120ms stagger, each from opacity 0 and 25px down. Text is
 * static site-wide by request, so the timeline has been removed and the
 * component is now purely the layout it always also was.
 *
 * It keeps its name and its whole prop surface because it is used both
 * declaratively (category/title/body/specs) and through its compound
 * sub-components (EditorialReveal.Title and friends), and renaming it would
 * churn every one of those call sites to no effect. `delay`, `staggerMs`,
 * `start`, `once` and `disabled` are still accepted and ignored — callers
 * pass them, and rejecting them would break pages for no gain.
 *
 * Nothing here now sets opacity, which is the important part: the old code
 * seeded every target at 0 and relied on a tween to bring it back, so a
 * half-removal would have left the copy permanently invisible.
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
