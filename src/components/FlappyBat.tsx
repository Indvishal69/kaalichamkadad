import { useCallback, useEffect, useRef, useState } from 'react';
import { Gamepad2, RotateCcw, Trophy, Zap } from 'lucide-react';
import { useAdvancements } from '../lib/advancements';
import { play } from '../lib/sound';

const W = 520;
const H = 320;
const FLOOR = 14;
const BAT_X = 118;
const BAT_R = 11;
const BEST_KEY = 'kaali-chamkadad:flappy-best';
const BAT_PATH =
  'M1 7 12 11 18 5 27 16 32 17 32 4 39 10 41 10 48 4 48 17 53 16 62 5 68 11 79 7 72 24 65 22 64 32 55 29 49 38 43 34 40 43 37 34 31 38 25 29 16 32 15 22 8 24Z';

type Status = 'idle' | 'playing' | 'over';
type Pillar = { x: number; gapY: number; gapH: number; width: number; passed: boolean };
type Game = {
  status: Status;
  y: number;
  vy: number;
  pillars: Pillar[];
  score: number;
  time: number;
  flap: number;
  overAt: number;
  shakeUntil: number;
};

function readBest(): number {
  try {
    return Math.max(0, Number(window.localStorage.getItem(BEST_KEY)) || 0);
  } catch {
    return 0;
  }
}

function freshGame(status: Status): Game {
  return {
    status,
    y: H / 2,
    vy: status === 'playing' ? -6 : 0,
    pillars: [],
    score: 0,
    time: 0,
    flap: 0,
    overAt: 0,
    shakeUntil: 0,
  };
}

function drawPillar(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  accent: string,
  capAtBottom: boolean,
) {
  if (height <= 0) return;
  context.fillStyle = '#2d3326';
  context.fillRect(x, y, width, height);
  context.fillStyle = 'rgba(0,0,0,0.32)';
  for (let row = 0; row < height; row += 14) {
    context.fillRect(x, y + row, width, 2);
    const offset = (Math.floor((y + row) / 14) % 2) * 14;
    for (let col = offset; col < width; col += 28) {
      context.fillRect(x + col, y + row, 2, Math.min(14, height - row));
    }
  }
  context.fillStyle = 'rgba(255,255,255,0.08)';
  context.fillRect(x, y, 3, height);
  context.fillStyle = accent;
  context.globalAlpha = 0.88;
  if (capAtBottom) context.fillRect(x - 3, y + height - 6, width + 6, 6);
  else context.fillRect(x - 3, y, width + 6, 6);
  context.globalAlpha = 1;
}

export function FlappyBat({ chaos }: { chaos: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game>(freshGame('idle'));
  const chaosRef = useRef(chaos);
  const { unlock } = useAdvancements();
  const unlockRef = useRef(unlock);
  const [status, setStatus] = useState<Status>('idle');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);

  useEffect(() => {
    chaosRef.current = chaos;
  }, [chaos]);

  useEffect(() => {
    unlockRef.current = unlock;
  }, [unlock]);

  const start = useCallback(() => {
    gameRef.current = freshGame('playing');
    setStatus('playing');
    setScore(0);
    play('flap');
  }, []);

  const flap = useCallback(() => {
    const game = gameRef.current;
    if (game.status === 'playing') {
      game.vy = -6.3;
      game.flap = 7;
      play('flap');
      return;
    }
    if (game.status === 'over' && performance.now() - game.overAt < 450) return;
    start();
  }, [start]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== 'Space' && event.key !== 'ArrowUp') return;
      const focused = document.activeElement === canvasRef.current;
      if (gameRef.current.status !== 'playing' && !focused) return;
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes(target.tagName)) return;
      event.preventDefault();
      flap();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const path = new Path2D(BAT_PATH);
    let frame = 0;
    let last = performance.now();
    let accent = '#dcf568';
    let accentTick = 0;

    const finish = (game: Game, now: number) => {
      game.status = 'over';
      game.overAt = now;
      game.shakeUntil = now + 380;
      setStatus('over');
      play('hit');
      setBest((previous) => {
        const next = Math.max(previous, game.score);
        if (next > previous) {
          try {
            window.localStorage.setItem(BEST_KEY, String(next));
          } catch {
            /* fine */
          }
          window.dispatchEvent(new CustomEvent('cave:update'));
        }
        return next;
      });
    };

    const update = (game: Game, dt: number, now: number) => {
      game.time += dt;
      if (game.status !== 'playing') {
        game.y = H / 2 + Math.sin(game.time * 0.07) * 9;
        return;
      }
      const level = chaosRef.current / 100;
      const speed = (2.4 + level * 1.8) * dt;
      game.vy = Math.min(9.5, game.vy + 0.4 * dt);
      game.y += game.vy * dt;
      if (game.flap > 0) game.flap -= dt;

      const spacing = 210 - level * 34;
      const lastPillar = game.pillars[game.pillars.length - 1];
      if (!lastPillar || lastPillar.x < W - spacing) {
        const gapH = Math.max(86, 122 - level * 30);
        const gapY = 34 + Math.random() * (H - FLOOR - 68 - gapH);
        game.pillars.push({ x: W + 30, gapY, gapH, width: 56, passed: false });
      }
      for (const pillar of game.pillars) {
        pillar.x -= speed;
        if (!pillar.passed && pillar.x + pillar.width < BAT_X - BAT_R) {
          pillar.passed = true;
          game.score += 1;
          setScore(game.score);
          play('pop');
          if (game.score >= 10) unlockRef.current('pilot');
        }
      }
      game.pillars = game.pillars.filter((pillar) => pillar.x + pillar.width > -20);

      const hitEdge = game.y + BAT_R >= H - FLOOR || game.y - BAT_R <= 0;
      const hitPillar = game.pillars.some(
        (pillar) =>
          BAT_X + BAT_R > pillar.x + 4 &&
          BAT_X - BAT_R < pillar.x + pillar.width - 4 &&
          (game.y - BAT_R < pillar.gapY || game.y + BAT_R > pillar.gapY + pillar.gapH),
      );
      if (hitEdge || hitPillar) finish(game, now);
    };

    const draw = (game: Game, now: number) => {
      accentTick += 1;
      if (accentTick % 20 === 1) {
        accent =
          getComputedStyle(document.documentElement).getPropertyValue('--lime').trim() || '#dcf568';
      }
      context.save();
      if (now < game.shakeUntil) {
        context.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
      }
      const sky = context.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#0a0d08');
      sky.addColorStop(1, '#151a10');
      context.fillStyle = sky;
      context.fillRect(-10, -10, W + 20, H + 20);

      context.fillStyle = 'rgba(255,255,255,0.035)';
      for (let i = 0; i < 18; i += 1) {
        const span = W + 40;
        const raw = i * 89 - game.time * (0.4 + (i % 3) * 0.3);
        const x = (((raw % span) + span) % span) - 20;
        context.fillRect(x, ((i * 47) % (H - 40)) + 10, 4, 4);
      }

      for (const pillar of game.pillars) {
        drawPillar(context, pillar.x, 0, pillar.width, pillar.gapY, accent, true);
        drawPillar(
          context,
          pillar.x,
          pillar.gapY + pillar.gapH,
          pillar.width,
          H - FLOOR - (pillar.gapY + pillar.gapH),
          accent,
          false,
        );
      }

      context.fillStyle = '#1c2216';
      context.fillRect(-10, H - FLOOR, W + 20, FLOOR + 10);
      context.fillStyle = accent;
      context.globalAlpha = 0.6;
      context.fillRect(-10, H - FLOOR, W + 20, 2);
      context.globalAlpha = 1;

      context.save();
      context.translate(BAT_X, game.y);
      context.rotate(
        game.status === 'playing'
          ? Math.max(-0.45, Math.min(0.85, game.vy * 0.075))
          : Math.sin(game.time * 0.07) * 0.08,
      );
      const flapScale = game.flap > 0 ? 0.55 : 1;
      context.scale(0.44, 0.44 * flapScale);
      context.translate(-40, -22);
      context.shadowColor = accent;
      context.shadowBlur = 16;
      context.fillStyle = accent;
      context.fill(path);
      context.restore();

      if (game.status === 'playing') {
        context.fillStyle = '#ffffff';
        context.font = '400 36px Anton, Impact, sans-serif';
        context.textAlign = 'center';
        context.fillText(String(game.score), W / 2, 50);
      }
      context.restore();
    };

    const loop = (now: number) => {
      const dt = Math.min(2.2, (now - last) / 16.667);
      last = now;
      const game = gameRef.current;
      update(game, dt, now);
      draw(game, now);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  const speed = (2.4 + (chaos / 100) * 1.8).toFixed(1);

  return (
    <section className="game-section section-space" id="game" aria-labelledby="game-title">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow section-eyebrow">CREATOR ARCADE · SPECIAL EDITION</p>
            <h2 className="section-title" id="game-title">FLAPPY BAT ARCADE<span className="accent-text">.</span></h2>
            <p className="section-description">
              Custom mini-game built exclusively for KaaliChamkadad fans. Navigate the cave pillars and log your record.
            </p>
          </div>
          <div className="game-best">
            <Trophy size={16} /> <span>ALL-TIME RECORD</span><strong>{best}</strong>
          </div>
        </div>

        <div className="game-layout">
          <div className="game-stage">
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="game-canvas"
              tabIndex={0}
              role="application"
              aria-label={`Flappy Bat Arcade. Current score ${score}. Best ${best}. ${status === 'playing' ? 'Press space to flap.' : 'Click or press space to launch flight.'}`}
              onPointerDown={(event) => {
                event.preventDefault();
                canvasRef.current?.focus({ preventScroll: true });
                flap();
              }}
            />
            {status !== 'playing' && (
              <div className="game-overlay">
                <div className="game-overlay-card">
                  {status === 'idle' ? (
                    <>
                      <Gamepad2 size={28} />
                      <h3>FLIGHT READY</h3>
                      <p>Tap, click, or hit Spacebar to flap. Dodge the stone pillars and set your high score.</p>
                      <button className="button button-lime" onClick={start}>Launch Flight</button>
                    </>
                  ) : (
                    <>
                      <h3>IMPACT DETECTED</h3>
                      <p className="game-final">
                        Cleared <strong>{score}</strong> pillar{score === 1 ? '' : 's'}. Best: <strong>{best}</strong>.
                      </p>
                      <p>
                        {score >= 10
                          ? 'Outstanding flight. Milestone unlocked.'
                          : score >= 5
                            ? 'Solid run. You are getting the hang of the cave.'
                            : 'Watch out for the pillar edges. Ready for another run?'}
                      </p>
                      <button className="button button-lime" onClick={start}>
                        <RotateCcw size={15} /> Try Again
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <aside className="game-side" aria-label="Game telemetry">
            <div className="game-side-block"><span>CURRENT FLIGHT</span><strong>{score}</strong></div>
            <div className="game-side-block"><span>PERSONAL BEST</span><strong>{best}</strong></div>
            <div className="game-side-block"><span>ENGINE PACE</span><strong>{speed}x</strong></div>
            <div className="game-side-control-card">
              <span className="game-side-control-title"><Zap size={13} /> CONTROL BINDINGS</span>
              <p>Spacebar / Click / Arrow Up to flap.</p>
              <p className="game-side-note">
                Scores of 10+ automatically unlock the Ace Aviator milestone and stamp your official Bat Gang ID.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
