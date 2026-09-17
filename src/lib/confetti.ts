type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  spin: number;
  life: number;
};

/** Pixel-block confetti in the current accent colour. Cleans itself up when done. */
export function fireConfetti(options: { count?: number; origin?: { x: number; y: number } } = {}): void {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const count = options.count ?? 140;
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  document.body.appendChild(canvas);

  const context = canvas.getContext('2d');
  if (!context) {
    canvas.remove();
    return;
  }
  context.scale(ratio, ratio);

  const accent =
    getComputedStyle(document.documentElement).getPropertyValue('--lime').trim() || '#dcf568';
  const colors = [accent, accent, accent, '#ffffff', '#8fd14f', '#f6d67a', '#4fe0d6'];
  const origin = options.origin ?? { x: width / 2, y: height * 0.38 };

  const particles: Particle[] = Array.from({ length: count }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.95;
    const speed = 7 + Math.random() * 12;
    return {
      x: origin.x + (Math.random() - 0.5) * 60,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 6 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      life: 1,
    };
  });

  const start = performance.now();
  let frame = 0;

  const step = (now: number) => {
    const elapsed = now - start;
    context.clearRect(0, 0, width, height);
    let alive = 0;
    for (const particle of particles) {
      particle.vy += 0.34;
      particle.vx *= 0.992;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.spin;
      if (elapsed > 1500) particle.life = Math.max(0, 1 - (elapsed - 1500) / 1000);
      if (particle.y < height + 40 && particle.life > 0) alive += 1;
      context.save();
      context.globalAlpha = particle.life;
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      context.fillStyle = particle.color;
      context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      context.restore();
    }
    if (alive > 0 && elapsed < 2800) {
      frame = requestAnimationFrame(step);
    } else {
      cancelAnimationFrame(frame);
      canvas.remove();
    }
  };

  frame = requestAnimationFrame(step);
}
