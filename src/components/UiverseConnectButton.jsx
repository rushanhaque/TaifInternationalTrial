import { navigate } from '../lib/router'
import '../styles/uiverse-connect.css'

export default function UiverseConnectButton({ className = '' }) {
  const handleClick = (e) => {
    // Navigate on click
    navigate('/contact')
  }

  return (
    <button className={`cssbuttons-io ${className}`} onClick={handleClick}>
      <span>Connect</span>
    </button>
  )
}
