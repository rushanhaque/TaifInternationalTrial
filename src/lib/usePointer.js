import { gsap } from './gsap'

/* One shared pointer pipeline for the whole site (§9.6).
   E1 sheen offset is written once per frame as a single custom property on
   :root; every other consumer (E3, E16, H2, H8) subscribes here — never a
   second mousemove listener. */
export const pointer = { x: 0, y: 0, moved: false }
const subs = new Set()
let started = false
let vw = typeof window !== 'undefined' ? window.innerWidth : 1200

export function startPointer() {
  if (started) return
  started = true
  pointer.x = vw / 2
  pointer.y = window.innerHeight / 2
  window.addEventListener('resize', () => { vw = window.innerWidth }, { passive: true })
  window.addEventListener(
    'mousemove',
    (e) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.moved = true
    },
    { passive: true }
  )
  gsap.ticker.add(() => {
    if (pointer.moved) {
      pointer.moved = false
      const nx = pointer.x / vw - 0.5
      document.documentElement.style.setProperty('--sheen-x', (nx * 8).toFixed(2) + '%')
    }
    subs.forEach((f) => f(pointer))
  })
}

export const onPointer = (f) => {
  subs.add(f)
  return () => subs.delete(f)
}
