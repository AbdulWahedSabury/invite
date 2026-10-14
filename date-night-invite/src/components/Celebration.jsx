import { useEffect, useRef } from 'react';

const COLORS = ['#2f98da', '#5bbcf0', '#9fdcfb', '#1a74b4', '#ffffff', '#ffffff', '#ffa9c1', '#ffd88a'];

// Full-screen falling hearts and confetti, drawn on a canvas while `active` is true.
export default function Celebration({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const cv = canvasRef.current;
    const ctx = cv.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const parts = [];
    let W = 0;
    let H = 0;
    let raf = 0;

    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      cv.style.width = `${W}px`;
      cv.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function make(fromBurst) {
      const isHeart = Math.random() < 0.5;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      const speed = 6 + Math.random() * 9;
      return {
        x: fromBurst ? W / 2 : Math.random() * W,
        y: fromBurst ? H * 0.45 : -30 - Math.random() * 60,
        vx: fromBurst ? Math.cos(angle) * speed : (Math.random() - 0.5) * 1.2,
        vy: fromBurst ? Math.sin(angle) * speed : 1 + Math.random() * 2,
        term: isHeart ? 1.6 + Math.random() * 1.4 : 2.4 + Math.random() * 1.8,
        s: isHeart ? 12 + Math.random() * 16 : 6 + Math.random() * 7,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.12,
        phase: Math.random() * Math.PI * 2,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        heart: isHeart
      };
    }

    function drawHeart(h) {
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.2);
      ctx.bezierCurveTo(0, -h * 0.5, -h * 0.5, -h * 0.5, -h * 0.5, -h * 0.2);
      ctx.bezierCurveTo(-h * 0.5, h * 0.1, 0, h * 0.3, 0, h * 0.5);
      ctx.bezierCurveTo(0, h * 0.3, h * 0.5, h * 0.1, h * 0.5, -h * 0.2);
      ctx.bezierCurveTo(h * 0.5, -h * 0.5, 0, -h * 0.5, 0, -h * 0.2);
      ctx.fill();
    }

    size();
    window.addEventListener('resize', size);

    const burst = reduceMotion ? 0 : 110;
    for (let i = 0; i < burst; i++) parts.push(make(true));

    const start = performance.now();
    let last = start;
    let rainAcc = 0;

    function frame(now) {
      const f = Math.min((now - last) / 16.67, 3);
      last = now;
      const t = now - start;

      // heavy rain for the first few seconds, then a gentle, endless drift of hearts
      const rate = t < 4500 ? (reduceMotion ? 0.6 : 3.2) : reduceMotion ? 0.04 : 0.12;
      rainAcc += rate * f;
      while (rainAcc >= 1 && parts.length < 380) {
        parts.push(make(false));
        rainAcc--;
      }

      ctx.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vx *= Math.pow(0.985, f);
        p.vy = Math.min(p.vy + 0.18 * f, p.term);
        p.phase += 0.05 * f;
        p.x += (p.vx + Math.sin(p.phase) * 0.7) * f;
        p.y += p.vy * f;
        p.rot += p.vr * f;

        if (p.y > H + 40) {
          parts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.fillStyle = p.color;
        if (p.heart) {
          ctx.rotate(Math.sin(p.phase) * 0.35);
          drawHeart(p.s);
        } else {
          ctx.rotate(p.rot);
          ctx.scale(1, Math.cos(p.phase * 2));
          ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        }
        ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
    };
  }, [active]);

  return <canvas ref={canvasRef} className="fx" aria-hidden="true" />;
}
