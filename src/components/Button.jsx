import { navigate } from '../lib/router'
import '../styles/uiverse-buttons.css'

export default function Button({
  to,
  variant = 'primary',
  small = false,
  chip,
  className = '',
  type = 'button',
  onClick,
  children
}) {
  const showChip = chip ?? (!small && variant === 'primary')

  const handleClick = (e) => {
    if (to) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      if (onClick) onClick(e)
      navigate(to)
    } else {
      if (onClick) onClick(e)
    }
  }

  const cls = `btn ${variant} ${small ? 'small' : ''} ${className}`.trim()

  return (
    <button className={cls} onClick={handleClick} type={to ? undefined : type}>
      <span className="btn-inner">
        <span className="btn-label">{children}</span>
        {showChip && (
          <span className="btn-chip" aria-hidden="true">
            <svg viewBox="0 0 12 12" width="11" height="11">
              <path
                d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </span>
    </button>
  )
}
