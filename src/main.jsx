import { createRoot } from 'react-dom/client'
import { initLenis } from './lib/useLenis'
import { startPointer } from './lib/usePointer'
import App from './App'
import './styles/tokens.css'
import './styles/global.css'
import './styles/home.css'
import './styles/pages.css'
/* Mark II layers last so they win where they overlap the base sheets */
import './styles/mk2/index.css'
/* site-wide hover polish, layered over every card family */
import './styles/interactions-premium.css'
/* mobile-only refinements, last so its media query wins */
import './styles/mobile-polish.css'
/* mobile-only: hover switched off on touch */
import './styles/mobile-motion.css'
/* site-wide scroll entrances, every width */
import './styles/scene-motion.css'
/* the mitre — the one page transition */
import './styles/page-transition.css'

initLenis()
startPointer()

createRoot(document.getElementById('root')).render(<App />)
