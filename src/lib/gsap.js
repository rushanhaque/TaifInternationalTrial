import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(ScrollTrigger, CustomEase)

CustomEase.create('fluid', '0.65,0,0.35,1')
CustomEase.create('surge', '0.16,1.1,0.3,1')
CustomEase.create('viscous', '0.5,0,0.1,1')
/* Atelys' house curve — long tail, no bounce; the "smooth" in their reveals */
CustomEase.create('atelys', '0.16,1,0.3,1')

gsap.defaults({ ease: 'fluid', duration: 0.8 })

export const reduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const coarse = () => window.matchMedia('(pointer: coarse)').matches

/* E8 — split a node's text into per-character spans.
   Parent keeps the readable text via aria-label; spans are presentation only. */
export function splitChars(el) {
  const text = el.textContent
  el.setAttribute('aria-label', text)
  el.textContent = ''
  const frag = document.createDocumentFragment()
  const chars = []
  text.split(/(\s+)/).forEach((tok) => {
    if (!tok) return
    if (/^\s+$/.test(tok)) {
      frag.appendChild(document.createTextNode(' '))
      return
    }
    const w = document.createElement('span')
    w.className = 'w'
    w.setAttribute('aria-hidden', 'true')
    for (const ch of tok) {
      const s = document.createElement('span')
      s.className = 'ch'
      s.textContent = ch
      w.appendChild(s)
      chars.push(s)
    }
    frag.appendChild(w)
  })
  el.appendChild(frag)
  return chars
}

export { gsap, ScrollTrigger }
