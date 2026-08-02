import { useState } from 'react'

/* H7 Fluid Label — pill inputs; the label rises as the pill grows taller and
   an iridescent line pools along the bottom edge, thickest under the caret. */
export default function Field({ label, name, type = 'text', textarea = false, autoComplete, required = false }) {
  const [filled, setFilled] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const id = `f-${name}`

  function onInput(e) {
    const v = e.target.value
    setFilled(v.length > 0)
    if (invalid && v.length > 0) setInvalid(false)
    const caret = Math.min(18 + v.length * 1.1, 82)
    e.target.closest('.field').style.setProperty('--caret', `${caret.toFixed(0)}%`)
  }
  function onInvalid(e) {
    e.preventDefault()
    setInvalid(true)
  }

  const shared = {
    id, name, required, autoComplete,
    onInput, onInvalid,
    'aria-invalid': invalid || undefined,
    'aria-describedby': invalid ? `${id}-err` : undefined,
  }

  return (
    <div className={`field ${textarea ? 'ta' : ''} ${filled ? 'filled' : ''} ${invalid ? 'invalid' : ''}`}>
      <label className="f-label" htmlFor={id}>{label}{required ? ' *' : ''}</label>
      {textarea ? <textarea rows={4} {...shared} /> : <input type={type} {...shared} />}
      <span className="f-pool" aria-hidden="true" />
      <span className="err" id={`${id}-err`} role="alert">Please fill in {label.toLowerCase()}.</span>
    </div>
  )
}
