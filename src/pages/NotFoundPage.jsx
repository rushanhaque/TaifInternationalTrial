import { useEffect, useRef } from 'react'
import { gsap, reduced } from '../lib/gsap'
import Button from '../components/Button'

export default function NotFoundPage() {
  const drop = useRef(null)

  useEffect(() => {
    if (reduced()) return
    const tw = gsap.to(drop.current, {
      scale: 1.12, scaleY: 0.94, duration: 1.6,
      yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 60%',
    })
    return () => tw.kill()
  }, [])

  return (
    <section className="nf">
      <div ref={drop} className="nf-drop" aria-hidden="true" />
      <p className="idx">1.4</p>
      <h1 className="d1">This one was never made.</h1>
      <p className="lede" style={{ margin: '1rem auto 1.8rem' }}>
        The page you asked for is not on either floor — it may have moved.
      </p>
      <Button to="/">Back to the start</Button>
    </section>
  )
}
