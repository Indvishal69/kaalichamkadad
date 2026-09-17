import { useMemo } from 'react';
import { BatMark } from './Brand';

type Bat = {
  id: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  bob: number;
  opacity: number;
  flip: boolean;
};

function makeBats(count: number): Bat[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    top: 3 + Math.random() * 70,
    size: 16 + Math.random() * 36,
    duration: 10 + Math.random() * 16,
    delay: -Math.random() * 24,
    bob: 10 + Math.random() * 36,
    opacity: 0.2 + Math.random() * 0.5,
    flip: Math.random() > 0.5,
  }));
}

/**
 * Ambient bats. Density comes from the chaos slider, so the sky fills up as
 * the chaos level rises.
 */
export function BatSwarm({ chaos, density = 12 }: { chaos: number; density?: number }) {
  const count = Math.max(2, Math.round(2 + (chaos / 100) * density));
  const swarm = useMemo(() => makeBats(count), [count]);

  return (
    <div className="bat-swarm" aria-hidden="true">
      {swarm.map((bat) => (
        <span
          key={bat.id}
          className="bat"
          style={
            {
              top: `${bat.top}%`,
              width: bat.size,
              animationDuration: `${bat.duration}s`,
              animationDelay: `${bat.delay}s`,
              '--bob': `${bat.bob}px`,
              opacity: bat.opacity,
              animationDirection: bat.flip ? 'reverse' : 'normal',
            } as React.CSSProperties
          }
        >
          <BatMark />
        </span>
      ))}
    </div>
  );
}
