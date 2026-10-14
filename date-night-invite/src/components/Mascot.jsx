import { HEART_PATH } from '../heart.js';

const INK = '#123250';

// mood: 'idle' | 'happy'. wobbleKey changes each time the "No" button escapes,
// which remounts the svg and replays the wobble animation.
export default function Mascot({ mood, wobbleKey }) {
  const className = [
    'mascot',
    mood === 'happy' && 'happy',
    mood !== 'happy' && wobbleKey > 0 && 'worried'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} aria-hidden="true">
      <svg key={wobbleKey} viewBox="0 0 100 92">
        <defs>
          <linearGradient id="mascot-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8fd4f7" />
            <stop offset="1" stopColor="#2f98da" />
          </linearGradient>
        </defs>
        <path d={HEART_PATH} fill="url(#mascot-fill)" />
        <ellipse cx="24" cy="20" rx="7" ry="4.5" fill="#fff" opacity=".55" transform="rotate(-30 24 20)" />
        <g className="eyes-open" fill={INK}>
          <ellipse cx="37" cy="38" rx="4" ry="5" />
          <ellipse cx="63" cy="38" rx="4" ry="5" />
          <circle cx="38.4" cy="36.2" r="1.4" fill="#fff" />
          <circle cx="64.4" cy="36.2" r="1.4" fill="#fff" />
        </g>
        <g className="eyes-happy" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round">
          <path d="M32 40 Q37 33 42 40" />
          <path d="M58 40 Q63 33 68 40" />
        </g>
        <ellipse cx="28" cy="49" rx="6" ry="3.6" fill="#ffb3c6" opacity=".9" />
        <ellipse cx="72" cy="49" rx="6" ry="3.6" fill="#ffb3c6" opacity=".9" />
        <path d="M43 49 Q50 57 57 49" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}
