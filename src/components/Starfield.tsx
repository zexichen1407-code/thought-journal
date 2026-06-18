import { useEffect, useRef } from 'react';

// Grok-style rotating starfield: stars in polar coords orbit the screen center,
// twinkle via oscillating opacity, with an occasional shooting star. Fixed full-screen
// canvas behind all content. Respects prefers-reduced-motion and pauses when hidden.

const STAR_COUNT = 150;

interface Star {
  angle: number;
  radius: number;
  speed: number;
  size: number;
}

interface Shoot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

const TRAIL = 35; // shooting-star tail length, px
const SHOOT_CHANCE = 0.0018; // spawn probability per frame — random, ~one every ~10s

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let stars: Star[] = [];
    let shoot: Shoot | null = null;
    let raf = 0;

    const initStars = () => {
      const maxR = Math.hypot(w, h) / 2 + 40;
      stars = Array.from({ length: STAR_COUNT }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * maxR,
        speed: 0.00012 + Math.random() * 0.00028,
        size: 0.5 + Math.random() * 1.1,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cx = w / 2;
      cy = h / 2;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars();
    };

    const drawStars = (t: number) => {
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        if (!reduce) s.angle += s.speed;
        const x = cx + s.radius * Math.cos(s.angle);
        const y = cy + s.radius * Math.sin(s.angle);
        const alpha = reduce ? 0.7 : 0.4 + Math.abs(Math.sin(t * 0.0015 + i)) * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }
    };

    const spawnShoot = () => {
      const ang = Math.PI * (0.13 + Math.random() * 0.22); // down-right diagonal
      const sp = 6 + Math.random() * 4;
      shoot = {
        x: Math.random() * w,
        y: Math.random() * h * 0.5,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        life: 1,
      };
    };

    const drawShoot = () => {
      if (!shoot) return;
      shoot.x += shoot.vx;
      shoot.y += shoot.vy;
      shoot.life -= 0.012;
      if (shoot.life <= 0 || shoot.x > w + 60 || shoot.y > h + 60) {
        shoot = null;
        return;
      }
      const mag = Math.hypot(shoot.vx, shoot.vy);
      const tx = shoot.x - (shoot.vx / mag) * TRAIL;
      const ty = shoot.y - (shoot.vy / mag) * TRAIL;
      const grad = ctx.createLinearGradient(shoot.x, shoot.y, tx, ty);
      grad.addColorStop(0, `rgba(255,255,255,${0.9 * shoot.life})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(shoot.x, shoot.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    };

    const frame = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      drawStars(t);
      if (!shoot && Math.random() < SHOOT_CHANCE) spawnShoot();
      drawShoot();
      raf = requestAnimationFrame(frame);
    };

    resize();
    if (reduce) {
      ctx.clearRect(0, 0, w, h);
      drawStars(0);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => resize();
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!reduce && !raf) {
        raf = requestAnimationFrame(frame);
      }
    };
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}
