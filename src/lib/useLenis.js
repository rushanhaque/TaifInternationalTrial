import Lenis from 'lenis'
import { gsap, ScrollTrigger, reduced } from './gsap'

let lenis = null

export function initLenis() {
  if (lenis || reduced()) return lenis
  lenis = new Lenis({ lerp: 0.11 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export const getLenis = () => lenis
export const getVelocity = () => (lenis ? lenis.velocity : 0)

export function scrollTop(immediate = true) {
  if (lenis) lenis.scrollTo(0, { immediate })
  else window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' })
}
