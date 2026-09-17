import { useCallback, useEffect, useState } from 'react';
import { Download, RefreshCw, Share2 } from 'lucide-react';
import { quizQuestions } from '../data/channel';
import { useAdvancements } from '../lib/advancements';
import { chaosLabel } from '../lib/chaos';
import { play } from '../lib/sound';
import { rankFor } from './Quiz';

const BAT_PATH =
  'M1 7 12 11 18 5 27 16 32 17 32 4 39 10 41 10 48 4 48 17 53 16 62 5 68 11 79 7 72 24 65 22 64 32 55 29 49 38 43 34 40 43 37 34 31 38 25 29 16 32 15 22 8 24Z';
const NAME_KEY = 'kaali-chamkadad:nickname';
const QUIZ_KEY = 'kaali-chamkadad:quiz-best';
const FLIGHT_KEY = 'kaali-chamkadad:flappy-best';

function readNumber(key: string): number | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  family: string,
): number {
  let size = startSize;
  while (size > 28) {
    context.font = `400 ${size}px ${family}`;
    if (context.measureText(text).width <= maxWidth) break;
    size -= 4;
  }
  return size;
}

export function ShareCard({ chaos }: { chaos: number }) {
  const [name, setName] = useState(() => {
    try {
      return window.localStorage.getItem(NAME_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [dataUrl, setDataUrl] = useState('');
  const [version, setVersion] = useState(0);
  const [canShare, setCanShare] = useState(false);
  const { unlocked, total } = useAdvancements();

  useEffect(() => {
    const bump = () => setVersion((value) => value + 1);
    window.addEventListener('cave:update', bump);
    return () => window.removeEventListener('cave:update', bump);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(NAME_KEY, name);
    } catch {
      /* fine */
    }
  }, [name]);

  useEffect(() => {
    try {
      const probe = new File([new Blob(['x'])], 'probe.png', { type: 'image/png' });
      setCanShare(Boolean(navigator.canShare?.({ files: [probe] })));
    } catch {
      setCanShare(false);
    }
  }, []);

  const build = useCallback((): HTMLCanvasElement | null => {
    const size = 1080;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) return null;

    const root = getComputedStyle(document.documentElement);
    const accent = root.getPropertyValue('--lime').trim() || '#dcf568';
    const triple = (root.getPropertyValue('--accent-rgb').trim() || '220 245 104').split(/\s+/).join(',');
    const display = '"Anton", Impact, "Arial Narrow", sans-serif';
    const body = '"Manrope", Arial, sans-serif';
    const quizBest = readNumber(QUIZ_KEY);
    const flightBest = readNumber(FLIGHT_KEY) ?? 0;
    const rank = quizBest === null ? 'UNRANKED · TAKE THE QUIZ' : rankFor(quizBest / quizQuestions.length).title;
    const label = (name.trim() || 'Anonymous Bat').toUpperCase();

    context.fillStyle = '#0e110c';
    context.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 36) {
      for (let x = 0; x < size; x += 36) {
        if ((x / 36 + y / 36) % 6 === 0) {
          context.fillStyle = 'rgba(255,255,255,0.028)';
          context.fillRect(x, y, 36, 36);
        }
      }
    }
    const glow = context.createRadialGradient(size * 0.86, size * 0.16, 10, size * 0.86, size * 0.16, 640);
    glow.addColorStop(0, `rgba(${triple},0.42)`);
    glow.addColorStop(1, `rgba(${triple},0)`);
    context.fillStyle = glow;
    context.fillRect(0, 0, size, size);

    context.strokeStyle = accent;
    context.lineWidth = 6;
    context.strokeRect(34, 34, size - 68, size - 68);
    context.strokeStyle = `rgba(${triple},0.25)`;
    context.lineWidth = 2;
    context.strokeRect(50, 50, size - 100, size - 100);

    context.save();
    context.translate(78, 84);
    context.scale(2.1, 2.1);
    context.fillStyle = accent;
    context.fill(new Path2D(BAT_PATH));
    context.restore();

    context.fillStyle = '#9aa28b';
    context.font = `800 22px ${body}`;
    context.textAlign = 'left';
    context.fillText('B A T   G A N G   ·   O F F I C I A L   F A N   P A S S', 270, 128);

    context.fillStyle = '#f1f2e9';
    const nameSize = fitText(context, label, size - 160, 118, display);
    context.font = `400 ${nameSize}px ${display}`;
    context.fillText(label, 80, 340);
    context.fillStyle = accent;
    context.fillRect(80, 372, 120, 6);

    const rows: [string, string][] = [
      ['CHANNEL LORE RANK', rank],
      ['COMMUNITY MILESTONES', `${unlocked.length} / ${total} COMPLETED`],
      ['CAVE LIGHTING INTENSITY', `${chaos}% · ${chaosLabel(chaos)}`],
      ['FLAPPY BAT RECORD', `${flightBest} PILLAR${flightBest === 1 ? '' : 'S'}`],
    ];
    let y = 470;
    for (const [key, value] of rows) {
      context.fillStyle = '#8b927c';
      context.font = `800 20px ${body}`;
      context.fillText(key, 80, y);
      context.fillStyle = key === 'QUIZ RANK' ? accent : '#f1f2e9';
      const valueSize = fitText(context, value, size - 160, 54, display);
      context.font = `400 ${valueSize}px ${display}`;
      context.fillText(value, 80, y + 62);
      context.fillStyle = 'rgba(255,255,255,0.08)';
      context.fillRect(80, y + 92, size - 160, 2);
      y += 128;
    }

    context.fillStyle = '#9aa28b';
    context.font = `700 24px ${body}`;
    context.textAlign = 'left';
    context.fillText('youtube.com/@KaaliChamkadad', 80, size - 84);
    context.fillStyle = accent;
    context.textAlign = 'right';
    context.font = `400 34px ${display}`;
    context.fillText('JOIN THE BAT GANG', size - 80, size - 80);
    return canvas;
  }, [name, chaos, unlocked.length, total]);

  useEffect(() => {
    let cancelled = false;
    const ready = 'fonts' in document ? document.fonts.ready : Promise.resolve();
    void ready.then(() => {
      if (cancelled) return;
      const canvas = build();
      if (canvas) setDataUrl(canvas.toDataURL('image/png'));
    });
    return () => {
      cancelled = true;
    };
  }, [build, version]);

  function share() {
    const canvas = build();
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'bat-gang-id.png', { type: 'image/png' });
      try {
        await navigator.share({ files: [file], title: 'My Bat Gang ID', text: 'Made in the KaaliChamkadad cave.' });
      } catch {
        /* User cancelled. Totally fine. */
      }
    }, 'image/png');
  }

  return (
    <section className="card-section section-space" id="card" aria-labelledby="card-title">
      <div className="container card-layout">
        <div>
          <p className="eyebrow section-eyebrow">PROOF YOU WERE HERE</p>
          <h2 className="section-title" id="card-title">MAKE YOUR<br />BAT GANG ID<span className="accent-text">.</span></h2>
          <p className="section-description">
            A shareable card built from your actual record on this page: quiz rank, advancements, chaos level and best flight. Post it in the Discord. Flex responsibly.
          </p>
          <label className="card-field">
            <span>Your bat name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value.slice(0, 22))}
              placeholder="Anonymous Bat"
              maxLength={22}
            />
          </label>
          <div className="card-actions">
            <a
              className="button button-lime"
              href={dataUrl || '#card'}
              download={dataUrl ? 'bat-gang-id.png' : undefined}
              aria-disabled={!dataUrl}
              onClick={(event) => {
                if (!dataUrl) {
                  event.preventDefault();
                  return;
                }
                play('levelup');
              }}
            >
              <Download size={16} /> Download PNG
            </a>
            {canShare && (
              <button className="button button-outline" onClick={share}>
                <Share2 size={15} /> Share
              </button>
            )}
            <button className="text-link" onClick={() => setVersion((value) => value + 1)}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
        <div className="card-preview">
          {dataUrl ? (
            <img src={dataUrl} alt={`Bat Gang ID card for ${name.trim() || 'Anonymous Bat'}`} />
          ) : (
            <div className="card-preview-empty">Rendering your card...</div>
          )}
        </div>
      </div>
    </section>
  );
}
