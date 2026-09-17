import { useCallback, useEffect, useState } from 'react';

const CHAOS_KEY = 'kaali-chamkadad:chaos';
const BIOME_KEY = 'kaali-chamkadad:biome';

export const biomes = [
  { id: 'overworld', name: 'Overworld', hue: 78, blurb: 'Classic lime. Home sweet cave.' },
  { id: 'nether', name: 'Nether', hue: 12, blurb: 'Hot, red and deeply regrettable.' },
  { id: 'end', name: 'The End', hue: 278, blurb: 'Purple void energy. Dragon not included.' },
  { id: 'ocean', name: 'Ocean', hue: 190, blurb: 'Cool, deep and suspiciously calm.' },
  { id: 'glowstone', name: 'Glowstone', hue: 44, blurb: 'Warm gold. Very fancy.' },
] as const;

export type BiomeId = (typeof biomes)[number]['id'];
export type ChaosLevel = 'calm' | 'wild' | 'max';

export function isBiomeId(value: string | null): value is BiomeId {
  return biomes.some((biome) => biome.id === value);
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const value = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(value * 255);
  };
  return [f(0), f(8), f(4)];
}

export function chaosLevel(value: number): ChaosLevel {
  if (value >= 88) return 'max';
  if (value >= 42) return 'wild';
  return 'calm';
}

export function chaosLabel(value: number): string {
  if (value >= 96) return 'FULL CHAOS';
  if (value >= 88) return 'UNHINGED';
  if (value >= 70) return 'CERTIFIED MENACE';
  if (value >= 42) return 'SLIGHTLY UNHINGED';
  if (value >= 18) return 'WARMING UP';
  return 'ZEN MODE';
}

export function chaosFlavour(value: number): string {
  if (value >= 96) return 'The whole cave is screaming. Colours, bats, everything. Beautiful.';
  if (value >= 88) return 'Bats everywhere. The marquee has lost its mind. Do not adjust your screen.';
  if (value >= 70) return 'Things are getting loud. The accent colour has officially left the building.';
  if (value >= 42) return 'Now we are talking. Hue shift, faster bats, more glow.';
  if (value >= 18) return 'A gentle warm-up. The cave is stretching.';
  return 'Calm, classic, lime. The KaaliChamkadad house vibe.';
}

export function accentFor(value: number, biomeId: BiomeId): [number, number, number] {
  const clamped = clamp(value);
  const biome = biomes.find((item) => item.id === biomeId) ?? biomes[0];
  const hue = (((biome.hue - (clamped / 100) * 83) % 360) + 360) % 360;
  return hslToRgb(hue, 0.86 + (clamped / 100) * 0.1, 0.7);
}

/**
 * The chaos engine. The biome picks the base colour, the chaos value drifts it
 * and drives glow, bat density, marquee speed and the jitter mode. Everything
 * on the page reads these custom properties.
 */
export function applyChaos(value: number, biomeId: BiomeId = 'overworld'): void {
  const clamped = clamp(value);
  const [r, g, b] = accentFor(clamped, biomeId);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const root = document.documentElement;
  const accent = `rgb(${r}, ${g}, ${b})`;

  root.style.setProperty('--lime', accent);
  root.style.setProperty('--color-lime', accent);
  root.style.setProperty('--accent-rgb', `${r} ${g} ${b}`);
  root.style.setProperty('--on-accent', luminance > 0.62 ? '#14170e' : '#ffffff');
  root.style.setProperty('--chaos', (clamped / 100).toFixed(3));
  root.style.setProperty('--marquee-duration', `${(26 - (clamped / 100) * 17).toFixed(2)}s`);
  root.style.setProperty('--bat-count', String(Math.round(3 + (clamped / 100) * 9)));
  root.dataset.chaosLevel = chaosLevel(clamped);
  root.dataset.biome = biomeId;
}

export function useChaos() {
  const [chaos, setChaosState] = useState(() => {
    try {
      const parsed = Number.parseInt(window.localStorage.getItem(CHAOS_KEY) ?? '', 10);
      return Number.isFinite(parsed) ? clamp(parsed) : 0;
    } catch {
      return 0;
    }
  });
  const [biome, setBiomeState] = useState<BiomeId>(() => {
    try {
      const stored = window.localStorage.getItem(BIOME_KEY);
      return isBiomeId(stored) ? stored : 'overworld';
    } catch {
      return 'overworld';
    }
  });

  useEffect(() => {
    applyChaos(chaos, biome);
    try {
      window.localStorage.setItem(CHAOS_KEY, String(chaos));
      window.localStorage.setItem(BIOME_KEY, biome);
    } catch {
      /* Works without persistence too. */
    }
  }, [chaos, biome]);

  const setChaos = useCallback((value: number) => {
    setChaosState(clamp(Math.round(value)));
  }, []);

  const setBiome = useCallback((value: BiomeId) => {
    setBiomeState(value);
  }, []);

  return { chaos, setChaos, biome, setBiome };
}
