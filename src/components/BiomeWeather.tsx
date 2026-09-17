import { useMemo } from 'react';
import type { BiomeId } from '../lib/chaos';

type Flake = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
};

type BiomeWeather = {
  kind: 'motes' | 'embers' | 'void' | 'rain' | 'sparkle';
  count: number;
  className: string;
};

const WEATHER: Record<BiomeId, BiomeWeather> = {
  overworld: { kind: 'motes', count: 26, className: 'weather-mote' },
  nether: { kind: 'embers', count: 34, className: 'weather-ember' },
  end: { kind: 'void', count: 30, className: 'weather-void' },
  ocean: { kind: 'rain', count: 60, className: 'weather-rain' },
  glowstone: { kind: 'sparkle', count: 32, className: 'weather-sparkle' },
};

function makeFlakes(count: number): Flake[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 7 + Math.random() * 13,
    delay: -Math.random() * 18,
    drift: (Math.random() - 0.5) * 90,
    opacity: 0.14 + Math.random() * 0.4,
  }));
}

/**
 * Ambient weather per biome: pollen in the overworld, rising embers in the
 * nether, void dust in The End, rain in the ocean, gold sparkles in glowstone.
 * Chaos raises the density. Disabled entirely for reduced-motion users.
 */
export function BiomeWeather({ biome, chaos }: { biome: BiomeId; chaos: number }) {
  const config = WEATHER[biome];
  const count = Math.round(config.count * (0.55 + (chaos / 100) * 0.65));
  const flakes = useMemo(() => makeFlakes(count), [count]);
  const biomeKey = biome;

  return (
    <div className={`weather-layer weather-${biomeKey}`} key={biomeKey} aria-hidden="true">
      {flakes.map((flake) => (
        <span
          key={flake.id}
          className={config.className}
          style={
            {
              left: `${flake.left}%`,
              width: flake.size,
              height: config.kind === 'rain' ? flake.size * 5 : flake.size,
              animationDuration: `${flake.duration}s`,
              animationDelay: `${flake.delay}s`,
              opacity: flake.opacity,
              '--drift': `${flake.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
