import { createRoot } from 'react-dom/client'
import { initLenis } from './lib/useLenis'
import { startPointer } from './lib/usePointer'
import { watchForNewBuild } from './lib/freshness'
import App from './App'
import './styles/tokens.css'
import './styles/global.css'
import './styles/home.css'
import './styles/pages.css'
/* after pages.css, which still carries the old .contact-* layout rules */
import './styles/contact-form.css'
/* Mark II layers last so they win where they overlap the base sheets */
import './styles/mk2/index.css'
/* site-wide hover polish, layered over every card family */
import './styles/interactions-premium.css'
/* the one spacing scale, put back over the fifty sheets that each invented
   their own — after the components, before the mobile corrections, because
   those are the considered exceptions to it */
import './styles/rhythm.css'
/* mobile-only refinements, last so its media query wins */
import './styles/mobile-polish.css'
/* mobile-only: hover switched off on touch */
import './styles/mobile-motion.css'
/* site-wide scroll entrances, every width */
import './styles/scene-motion.css'
/* the mitre — the one page transition */
import './styles/page-transition.css'

/* before anything else paints: a browser holding a stale document should
   find that out and reload rather than render a months-old site */
watchForNewBuild()

initLenis()
startPointer()

createRoot(document.getElementById('root')).render(<App />)
