import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import SkyBackground from './components/SkyBackground.jsx';
import Mascot from './components/Mascot.jsx';
import Celebration from './components/Celebration.jsx';

const TEASES = [
  'اِ! کجا در رفت؟',
  'اون دکمه امشب خجالتیه 🙈',
  'نچ، اون یکی رو بزن',
  'دکمه‌ی «نه» امشب مرخصیه',
  'می‌دونم ته دلت گفتی آره',
  'هرچی بدویی، «آره» نزدیک‌تره',
  'قول می‌دم بستنی هم بخریم 🍦',
  'دیگه داره خسته می‌شه‌ها!'
];

const MARGIN = 14;

function pointFrom(e, fallback) {
  if (e && e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  if (e && typeof e.clientX === 'number' && (e.clientX || e.clientY)) return { x: e.clientX, y: e.clientY };
  return fallback;
}

function overlaps(x, y, w, h, r, pad) {
  return !(x + w < r.left - pad || x > r.right + pad || y + h < r.top - pad || y > r.bottom + pad);
}

export default function App() {
  const noRef = useRef(null);
  const yesRef = useRef(null);
  const fledRef = useRef(false);
  const lastDodgeRef = useRef(0);
  const triesRef = useRef(0);
  const celebratedRef = useRef(false);

  const [noPos, setNoPos] = useState(null);
  const [tilt, setTilt] = useState(0);
  const [tries, setTries] = useState(0);
  const [celebrated, setCelebrated] = useState(false);

  const dodge = useCallback((e) => {
    if (celebratedRef.current) return;
    if (e) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    }
    const now = performance.now();
    if (now - lastDodgeRef.current < 120) return;
    lastDodgeRef.current = now;

    const noEl = noRef.current;
    const yesEl = yesRef.current;
    if (!noEl || !yesEl) return;

    const r = noEl.getBoundingClientRect();
    const finger = pointFrom(e, { x: r.left + r.width / 2, y: r.top + r.height / 2 });

    if (!fledRef.current) {
      // Pin it where it stands first, so the first jump animates from there.
      fledRef.current = true;
      flushSync(() => setNoPos({ x: r.left, y: r.top }));
      void noEl.offsetWidth;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = r.width;
    const h = r.height;
    const yesRect = yesEl.getBoundingClientRect();
    const farEnough = Math.min(vw, vh) * 0.4;

    let best = null;
    let bestDist = -1;
    for (let i = 0; i < 50; i++) {
      const x = MARGIN + Math.random() * Math.max(0, vw - w - MARGIN * 2);
      const y = MARGIN + Math.random() * Math.max(0, vh - h - MARGIN * 2);
      if (overlaps(x, y, w, h, yesRect, 16)) continue;
      const dist = Math.hypot(x + w / 2 - finger.x, y + h / 2 - finger.y);
      if (dist > farEnough) {
        best = { x, y };
        break;
      }
      if (dist > bestDist) {
        bestDist = dist;
        best = { x, y };
      }
    }
    if (!best) best = { x: MARGIN, y: MARGIN };

    triesRef.current += 1;
    setNoPos(best);
    setTilt(Math.random() * 24 - 12);
    setTries(triesRef.current);
  }, []);

  // Native listeners: React's touch handlers are passive, and we need preventDefault
  // on touchstart so the tap never turns into a click.
  useEffect(() => {
    const el = noRef.current;
    if (!el) return undefined;
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') dodge(e);
    };
    el.addEventListener('touchstart', dodge, { passive: false });
    el.addEventListener('pointerdown', dodge);
    el.addEventListener('mousedown', dodge);
    el.addEventListener('click', dodge);
    el.addEventListener('keydown', onKey);
    return () => {
      el.removeEventListener('touchstart', dodge);
      el.removeEventListener('pointerdown', dodge);
      el.removeEventListener('mousedown', dodge);
      el.removeEventListener('click', dodge);
      el.removeEventListener('keydown', onKey);
    };
  }, [dodge]);

  // On a desktop mouse, it flees before the cursor even arrives.
  useEffect(() => {
    const onMove = (e) => {
      if (e.pointerType !== 'mouse' || celebratedRef.current || !noRef.current) return;
      const r = noRef.current.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      if (Math.hypot(e.clientX - cx, e.clientY - cy) < Math.max(r.width, r.height) * 0.9) dodge(e);
    };
    document.addEventListener('pointermove', onMove);
    return () => document.removeEventListener('pointermove', onMove);
  }, [dodge]);

  // Keep it on screen if the viewport changes (rotation, keyboard, resize).
  useEffect(() => {
    const onResize = () => {
      if (!fledRef.current || !noRef.current) return;
      const r = noRef.current.getBoundingClientRect();
      const x = Math.min(Math.max(MARGIN, r.left), window.innerWidth - r.width - MARGIN);
      const y = Math.min(Math.max(MARGIN, r.top), window.innerHeight - r.height - MARGIN);
      setNoPos({ x: Math.max(MARGIN, x), y: Math.max(MARGIN, y) });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const celebrate = () => {
    if (celebratedRef.current) return;
    celebratedRef.current = true;
    setCelebrated(true);
  };

  const noStyle = noPos
    ? { left: `${noPos.x}px`, top: `${noPos.y}px`, '--tilt': `${tilt.toFixed(1)}deg` }
    : undefined;

  return (
    <>
      <SkyBackground />

      <main className="scene">
        <section className="card">
          <Mascot mood={celebrated ? 'happy' : 'idle'} wobbleKey={tries} />

          {!celebrated ? (
            <div className="ask">
              <p className="eyebrow">یه دعوت‌نامه‌ی کوچولو، فقط برای تو</p>
              <h1 className="title">
                عشق من،
                <br />
                <span className="hl">امشب</span> بریم بیرون؟
              </h1>
              <p className="sub">یه قدم زدن آروم زیر چراغای شهر، و کلی خنده.</p>

              <div className="actions">
                <button
                  ref={yesRef}
                  type="button"
                  className="btn-yes"
                  style={{ '--grow': Math.min(1 + tries * 0.05, 1.35).toFixed(2) }}
                  onClick={celebrate}
                >
                  آره
                </button>
                <button ref={noRef} type="button" className={noPos ? 'btn-no fled' : 'btn-no'} style={noStyle}>
                  نه
                </button>
              </div>

              <p key={tries} className={tries ? 'tease pop' : 'tease'} aria-live="polite">
                {tries ? TEASES[(tries - 1) % TEASES.length] : ''}
              </p>
            </div>
          ) : (
            <div className="done">
              <p className="done-title">هورااا!</p>
              <p className="done-msg">پس حاضر باش که بیام دنبالت! ❤️✨</p>
              <p className="done-note">یه لباس خوشگل بپوش، بقیه‌ش با من.</p>
            </div>
          )}
        </section>
      </main>

      <Celebration active={celebrated} />
    </>
  );
}
