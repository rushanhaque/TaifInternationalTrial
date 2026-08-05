import { useMemo } from 'react'
import { navigate } from '../lib/router'
import '../styles/uiverse-buttons.css'

function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getText(node) {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(getText).join('');
  return 'button';
}

export default function Button({ to, variant = 'primary', small = false, chip, styleType: propStyleType, className = '', type = 'button', onClick, children }) {
  const showChip = chip ?? (!small && variant === 'primary')
  const textStr = getText(children);

  const inner = (
    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 2 }}>
      {children}
      {showChip && (
        <span className="btn-chip" aria-hidden="true" style={{ position: 'relative', top: '1px' }}>
          <svg viewBox="0 0 12 12" width="11" height="11">
            <path d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </span>
  )

  const handleClick = (e) => {
    if (to) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      if (onClick) onClick(e)
      navigate(to)
    } else {
      if (onClick) onClick(e)
    }
  };

  // Pick one of 3 button styles deterministically based on text or explicit propStyleType
  const styleType = useMemo(() => {
    if (propStyleType != null) return propStyleType;
    return (hashStr(textStr) % 3) + 1;
  }, [textStr, propStyleType]);

  const cls = `uv-btn-${styleType} ${variant} ${small ? 'small' : ''} ${className}`;

  if (styleType === 1) {
    return (
      <button className={cls} onClick={handleClick} type={to ? undefined : type}>
        <span className="text-container">
          <span className="text">{inner}</span>
        </span>
      </button>
    )
  }

  if (styleType === 2) {
    return (
      <button className={cls} onClick={handleClick} type={to ? undefined : type}>
        <div className="wrapper">
          <span>{inner}</span>
          {[12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(i => (
            <div key={i} className={`circle circle-${i}`}></div>
          ))}
        </div>
      </button>
    )
  }

  return (
    <button className={cls} onClick={handleClick} type={to ? undefined : type}>
      {inner}
    </button>
  )
}

