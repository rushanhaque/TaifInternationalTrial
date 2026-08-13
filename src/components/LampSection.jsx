import React, { useEffect, useState } from 'react';
import './LampSection.css';

/**
 * LampSection — Aceternity-style lamp:
 *   • A thin horizontal glowing bar (the "tube")
 *   • A massive soft radial bloom spreading downward
 *   • Color transitions smoothly with the active material
 */
export default function LampSection({ color, visible }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setOn(true), 60);
      return () => clearTimeout(t);
    }
  }, [visible]);

  return (
    <div className={`lamp ${on ? 'lamp--on' : ''}`} aria-hidden="true">

      {/* ── Left arm of the bar ── */}
      <div
        className="lamp__arm lamp__arm--left"
        style={{ '--bar-color': color.from, '--bar-glow': color.glow }}
      />

      {/* ── Right arm of the bar ── */}
      <div
        className="lamp__arm lamp__arm--right"
        style={{ '--bar-color': color.from, '--bar-glow': color.glow }}
      />

      {/* ── Central bright spot on the bar ── */}
      <div
        className="lamp__center"
        style={{ '--bar-color': color.to, '--bar-glow': color.glow }}
      />

      {/* ── Bloom / light pool below the bar ── */}
      <div
        className="lamp__bloom"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 0%,
            ${color.to}99 0%,
            ${color.from}55 35%,
            ${color.from}22 60%,
            transparent 100%)`,
        }}
      />

      {/* ── Subtle secondary bloom for depth ── */}
      <div
        className="lamp__bloom lamp__bloom--soft"
        style={{
          background: `radial-gradient(ellipse 50% 40% at 50% 0%,
            ${color.to}44 0%,
            ${color.from}18 50%,
            transparent 100%)`,
        }}
      />
    </div>
  );
}
