import { useMemo } from 'react';
import { HEART_PATH } from '../heart.js';

const CLOUDS = [
  { top: '7%', w: 120, d: 70, o: 0.9 },
  { top: '19%', w: 78, d: 55, o: 0.75 },
  { top: '74%', w: 150, d: 90, o: 0.8 },
  { top: '88%', w: 96, d: 65, o: 0.7 }
];

const TINTS = ['#ffffff', '#ffffff', '#7cc6f0', '#ffb8cb'];

export default function SkyBackground() {
  // Random positions are picked once, so clouds and hearts don't jump on re-render.
  const clouds = useMemo(
    () =>
      CLOUDS.map((c) => {
        const at = Math.random();
        return {
          top: c.top,
          '--w': `${c.w}px`,
          '--d': `${c.d}s`,
          '--delay': `${-at * c.d}s`,
          '--o': c.o,
          '--rest': `${(at * 90).toFixed(0)}vw`
        };
      }),
    []
  );

  const hearts = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const dur = 11 + Math.random() * 10;
        return {
          left: `${Math.random() * 100}%`,
          '--s': `${12 + Math.random() * 22}px`,
          '--d': `${dur}s`,
          '--delay': `${-Math.random() * dur}s`,
          '--c': TINTS[i % TINTS.length],
          '--o': (0.35 + Math.random() * 0.4).toFixed(2),
          '--top': `${Math.random() * 100}%`
        };
      }),
    []
  );

  return (
    <div className="ambient" aria-hidden="true">
      {clouds.map((style, i) => (
        <div key={`cloud-${i}`} className="cloud" style={style}>
          <svg viewBox="0 0 120 64">
            <circle cx="34" cy="42" r="18" />
            <circle cx="60" cy="30" r="24" />
            <circle cx="88" cy="42" r="18" />
            <rect x="34" y="40" width="54" height="20" rx="10" />
          </svg>
        </div>
      ))}
      {hearts.map((style, i) => (
        <div key={`heart-${i}`} className="float-heart" style={style}>
          <svg viewBox="0 0 100 92">
            <path d={HEART_PATH} />
          </svg>
        </div>
      ))}
    </div>
  );
}
