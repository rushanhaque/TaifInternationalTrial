import { useEffect } from 'react'
import { gsap, ScrollTrigger, reduced } from '../lib/gsap'
import { useRoute } from '../lib/router'

/* E21 · Position Card — the homepage only, and only the first section after
   the hero. The hero sticks at the top of the viewport while the position
   section slides up over it like a card laid onto the table; the hero pushes
   back in z as it is covered — scaling down, tipping away, dimming.
   Everything below the position section scrolls normally. */

export default function SectionStack() {
  const { path } = useRoute()

  useEffect(() => {
    if (reduced() || path !== '/') return
    let ctx
    const timer = setTimeout(() => {
      const main = document.getElementById('main')
      const hero = main?.querySelector('.hero-brand')
      const card = main?.querySelector('.home-position')
      if (!hero || !card) return

      /* the hero becomes the surface the card is laid onto */
      hero.style.position = 'sticky'
      hero.style.top = '0'
      hero.style.zIndex = '1'
      card.classList.add('stack-card')

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: card,
          start: 'top bottom',
          end: 'top top',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate(self) {
            const p = self.progress
            gsap.set(hero, {
              scale: 1 - p * 0.08,
              rotateX: p * 4,
              y: p * -30,
              transformPerspective: 1400,
              transformOrigin: '50% 0%',
            })
            hero.style.setProperty('--stack-dim', (p * 0.4).toFixed(3))
          },
        })
        ScrollTrigger.refresh()
      })
    }, 120)

    return () => {
      clearTimeout(timer)
      ctx?.revert()
      const hero = document.querySelector('.hero-brand')
      if (hero) {
        hero.style.position = ''
        hero.style.top = ''
        hero.style.zIndex = ''
        hero.style.removeProperty('--stack-dim')
        gsap.set(hero, { clearProps: 'all' })
      }
      document.querySelector('.stack-card')?.classList.remove('stack-card')
    }
  }, [path])

  return null
}
