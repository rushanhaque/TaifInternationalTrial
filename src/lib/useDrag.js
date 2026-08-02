import { gsap } from './gsap'

/* Manual momentum drag (E9, E10). Velocity is sampled over the last ~120ms of
   pointer moves; release coasts with friction and rubber-bands past bounds.
   InertiaPlugin is not used — this keeps the physics tunable and the bundle small. */
export function makeDraggable(el, opts = {}) {
  const {
    axis = 'x',
    resistance = 0.15, // movement multiplier past bounds
    momentum = 0.28,   // seconds of velocity carried on release
    getBounds = () => ({ minX: 0, maxX: 0, minY: 0, maxY: 0 }),
    onMove = () => {},
    onStart = () => {},
    onEnd = () => {},
    settle = null,     // {x,y} — always elastic-return here on release (E10)
  } = opts

  const pos = { x: 0, y: 0 }
  let samples = []
  let dragging = false
  let moved = 0
  let bounds = getBounds()
  let tween = null
  let sxp = 0, syp = 0, sx = 0, sy = 0

  const soft = (v, min, max) =>
    v < min ? min + (v - min) * resistance : v > max ? max + (v - max) * resistance : v

  const apply = () => onMove(pos, dragging)

  function down(e) {
    if (e.button) return
    if (tween) tween.kill()
    dragging = true
    moved = 0
    bounds = getBounds()
    sxp = e.clientX; syp = e.clientY
    sx = pos.x; sy = pos.y
    samples = [{ t: performance.now(), x: e.clientX, y: e.clientY }]
    el.setPointerCapture(e.pointerId)
    el.classList.add('dragging')
    onStart()
  }

  function move(e) {
    if (!dragging) return
    const dx = e.clientX - sxp
    const dy = e.clientY - syp
    moved = Math.max(moved, Math.abs(dx), Math.abs(dy))
    if (axis !== 'y') pos.x = soft(sx + dx, bounds.minX, bounds.maxX)
    if (axis !== 'x') pos.y = soft(sy + dy, bounds.minY, bounds.maxY)
    samples.push({ t: performance.now(), x: e.clientX, y: e.clientY })
    if (samples.length > 6) samples.shift()
    apply()
  }

  function up(e) {
    if (!dragging) return
    dragging = false
    el.classList.remove('dragging')
    const now = performance.now()
    const past = samples.find((s) => now - s.t < 130) || samples[0]
    const dt = Math.max(now - past.t, 1)
    const vx = ((e.clientX - past.x) / dt) * 1000
    const vy = ((e.clientY - past.y) / dt) * 1000

    if (settle) {
      tween = gsap.to(pos, {
        x: settle.x, y: settle.y, duration: 0.9,
        ease: 'elastic.out(1, 0.55)', onUpdate: apply,
        onComplete: () => onEnd(pos),
      })
      return
    }

    let tx = axis === 'y' ? pos.x : pos.x + vx * momentum
    let ty = axis === 'x' ? pos.y : pos.y + vy * momentum
    const cx = gsap.utils.clamp(bounds.minX, bounds.maxX, tx)
    const cy = gsap.utils.clamp(bounds.minY, bounds.maxY, ty)
    const over = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5
    tween = gsap.to(pos, {
      x: over ? cx + (tx - cx) * 0.12 : tx,
      y: over ? cy + (ty - cy) * 0.12 : ty,
      duration: over ? 0.55 : 1.1,
      ease: 'power3.out',
      onUpdate: apply,
      onComplete() {
        if (over) {
          tween = gsap.to(pos, {
            x: cx, y: cy, duration: 0.7, ease: 'surge',
            onUpdate: apply, onComplete: () => onEnd(pos),
          })
        } else onEnd(pos)
      },
    })
  }

  el.addEventListener('pointerdown', down)
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', up)

  return {
    pos,
    setPos(x, y) {
      pos.x = x
      if (y !== undefined) pos.y = y
      apply()
    },
    tweenTo(x, opts2 = {}) {
      if (tween) tween.kill()
      tween = gsap.to(pos, { x, duration: 0.8, ease: 'surge', onUpdate: apply, ...opts2 })
    },
    getMoved: () => moved,
    isDragging: () => dragging,
    kill() {
      if (tween) tween.kill()
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    },
  }
}
