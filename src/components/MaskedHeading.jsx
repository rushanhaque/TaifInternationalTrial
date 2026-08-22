import { useCallback, useEffect, useMemo, useRef } from 'react';
import { gsap } from '../lib/gsap';
import '../styles/MaskedHeading.css';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

export default function MaskedHeading({
  text = 'THE CRAFT',
  tag: Tag = 'h2',
  mediaType = 'video',
  src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  /* Optional [{ src, type }] in preference order. When present these are
     rendered as <source> children and `src` is ignored, so a caller can
     offer VP9 ahead of H.264 the way the hero does. `src` alone still
     works, which is what every other caller of this component uses. */
  sources = null,
  poster = '',
  syncVideoRef,
  fillScale = 1.25,
  parallax = 26,
  drift = 18,
  brightness = 1.1,
  saturation = 1.1,
  grayscale = false,
  reveal = 'rise',
  duration = 1.1,
  stagger = 0.09,
  trigger = 'view',
  align = 'center',
  weight = 900,
  tracking = 0.04,
  lineHeight = 0.95,
  textScale = 0.12,
  className = '',
  style,
  ...rest
}) {
  const rootRef = useRef(null);
  const measureRef = useRef(null);
  const revealRef = useRef(null);
  const mediaRef = useRef(null);
  const videoRef = useRef(null);
  const wordRefs = useRef([]);
  const baseRefs = useRef([]);
  const glyphRefs = useRef([]);
  const strokeRefs = useRef([]);
  const offsetRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const uid = useMemo(() => Math.random().toString(36).substring(2, 9), []);
  const clipId = `mh-clip-${uid}`;
  const words = useMemo(() => String(text).split(/\s+/).filter(Boolean), [text]);

  const settingsRef = useRef({});
  settingsRef.current = { fillScale, parallax, drift, brightness, saturation, grayscale, textScale };

  const place = useCallback(() => {
    const root = rootRef.current;
    const media = mediaRef.current;
    if (!root || !media) return;
    const s = settingsRef.current;
    const W = root.clientWidth || 300;
    const H = root.clientHeight || 100;
    const off = offsetRef.current;

    const maxX = Math.max(0, ((s.fillScale - 1) / 2) * W);
    const maxY = Math.max(0, ((s.fillScale - 1) / 2) * H);

    media.style.transform = `translate3d(${clamp(off.x, -maxX, maxX).toFixed(2)}px, ${clamp(off.y, -maxY, maxY).toFixed(2)}px, 0) scale(${s.fillScale})`;
    media.style.filter = `brightness(${s.brightness}) saturate(${s.saturation})${s.grayscale ? ' grayscale(1)' : ''}`;
  }, []);

  const sync = useCallback(() => {
    const root = rootRef.current;
    const measure = measureRef.current;
    if (!root || !measure) return;
    try {
      const s = settingsRef.current;
      root.style.fontSize = `${clamp(root.clientWidth * s.textScale, 28, 220).toFixed(1)}px`;

      const cs = window.getComputedStyle(measure);
      for (let i = 0; i < wordRefs.current.length; i += 1) {
        const box = wordRefs.current[i];
        const base = baseRefs.current[i];
        const glyph = glyphRefs.current[i];
        const strokeGlyph = strokeRefs.current[i];
        if (!box || !base) continue;
        if (glyph) {
          glyph.setAttribute('x', `${box.offsetLeft}`);
          glyph.setAttribute('y', `${base.offsetTop}`);
          if (cs && cs.fontFamily) {
            glyph.style.fontFamily = cs.fontFamily;
            glyph.style.fontSize = cs.fontSize;
            glyph.style.fontWeight = cs.fontWeight;
            glyph.style.fontStyle = cs.fontStyle;
            glyph.style.letterSpacing = cs.letterSpacing;
          }
        }
        if (strokeGlyph) {
          strokeGlyph.setAttribute('x', `${box.offsetLeft}`);
          strokeGlyph.setAttribute('y', `${base.offsetTop}`);
          if (cs && cs.fontFamily) {
            strokeGlyph.style.fontFamily = cs.fontFamily;
            strokeGlyph.style.fontSize = cs.fontSize;
            strokeGlyph.style.fontWeight = cs.fontWeight;
            strokeGlyph.style.fontStyle = cs.fontStyle;
            strokeGlyph.style.letterSpacing = cs.letterSpacing;
          }
        }
      }
      place();
    } catch (e) {
      /* safe fallback */
    }
  }, [place]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    sync();
    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(sync);
      ro.observe(root);
    }
    if (document.fonts?.ready) document.fonts.ready.then(sync).catch(() => {});

    let raf = 0;
    let last = performance.now();
    let clock = 0;

    const frame = now => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += dt;
      const s = settingsRef.current;
      const off = offsetRef.current;

      const dx = Math.sin(clock * 0.21) * s.drift;
      const dy = Math.cos(clock * 0.17) * s.drift * 0.6;

      const ease = 1 - Math.exp(-dt / 0.18);
      off.x += (off.tx + dx - off.x) * ease;
      off.y += (off.ty + dy - off.y) * ease;

      place();
      raf = requestAnimationFrame(frame);
    };

    const onMove = e => {
      const s = settingsRef.current;
      if (s.parallax <= 0) return;
      const r = root.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / (r.width || 1)) * 2 - 1;
      const ny = ((e.clientY - r.top) / (r.height || 1)) * 2 - 1;
      offsetRef.current.tx = clamp(nx, -1, 1) * -s.parallax;
      offsetRef.current.ty = clamp(ny, -1, 1) * -s.parallax;
    };

    const onLeave = () => {
      offsetRef.current.tx = 0;
      offsetRef.current.ty = 0;
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
    };
  }, [place, sync]);

  useEffect(() => {
    sync();
  }, [sync, words, Tag, align, weight, tracking, lineHeight, textScale]);

  /* Synchronize video playback with background video element if syncVideoRef is provided */
  useEffect(() => {
    if (!syncVideoRef?.current || !videoRef.current || mediaType !== 'video') return;
    const targetVideo = syncVideoRef.current;
    const maskedVideo = videoRef.current;

    const syncTime = () => {
      if (Math.abs(maskedVideo.currentTime - targetVideo.currentTime) > 0.04) {
        try {
          maskedVideo.currentTime = targetVideo.currentTime;
        } catch (_) {}
      }
    };

    const onPlay = () => {
      maskedVideo.play().catch(() => {});
      syncTime();
    };

    const onPause = () => {
      maskedVideo.pause();
    };

    targetVideo.addEventListener('timeupdate', syncTime);
    targetVideo.addEventListener('play', onPlay);
    targetVideo.addEventListener('pause', onPause);

    syncTime();
    if (!targetVideo.paused) {
      maskedVideo.play().catch(() => {});
    }

    return () => {
      targetVideo.removeEventListener('timeupdate', syncTime);
      targetVideo.removeEventListener('play', onPlay);
      targetVideo.removeEventListener('pause', onPause);
    };
  }, [syncVideoRef, mediaType]);

  return (
    <Tag
      ref={rootRef}
      className={`masked-heading ${className}`.trim()}
      style={{
        textAlign: align,
        fontWeight: weight,
        letterSpacing: `${tracking}em`,
        lineHeight,
        fontFamily: 'var(--font-display, "Cinzel", serif)',
        ...style
      }}
      {...rest}
    >
      <span ref={measureRef} className="masked-heading__measure">
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            ref={el => {
              wordRefs.current[i] = el;
            }}
            className="masked-heading__word"
          >
            {word}
            <i
              ref={el => {
                baseRefs.current[i] = el;
              }}
              className="masked-heading__baseline"
            />
          </span>
        ))}
      </span>

      <svg className="masked-heading__defs" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            {words.map((word, i) => (
              <text
                key={`${word}-${i}`}
                ref={el => {
                  glyphRefs.current[i] = el;
                }}
              >
                {word}
              </text>
            ))}
          </clipPath>
        </defs>
      </svg>

      <span ref={revealRef} className="masked-heading__reveal" style={{ filter: 'drop-shadow(0 0 18px rgba(255, 255, 255, 0.45)) drop-shadow(0 0 4px rgba(255, 255, 255, 0.25))' }}>
        <span className="masked-heading__clip" style={{ clipPath: `url(#${clipId})` }}>
          <span ref={mediaRef} className="masked-heading__media">
            {mediaType === 'video' ? (
              <video
                ref={(el) => { videoRef.current = el; if (el) el.setAttribute('muted', '') }}
                className="masked-heading__source"
                src={sources ? undefined : src}
                poster={poster}
                autoPlay
                muted
                loop
                playsInline
              >
                {sources?.map((s) => <source key={s.src} src={s.src} type={s.type} />)}
              </video>
            ) : (
              <img className="masked-heading__source" src={src} alt="" draggable={false} />
            )}
          </span>
        </span>
      </span>
    </Tag>
  );
}
