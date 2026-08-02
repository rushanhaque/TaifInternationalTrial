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

initLenis()
startPointer()

createRoot(document.getElementById('root')).render(<App />)
