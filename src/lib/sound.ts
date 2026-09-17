import { useEffect, useState } from 'react';

const STORAGE_KEY = 'kaali-chamkadad:muted';

let muted = (() => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
})();

const listeners = new Set<(value: boolean) => void>();
let audio: AudioContext | null = null;

function getContext(): AudioContext | null {
  try {
    if (!audio) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      audio = new Ctor();
    }
    if (audio.state === 'suspended') void audio.resume();
    return audio;
  } catch {
    return null;
  }
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
  } catch {
    /* Preference simply will not persist. */
  }
  listeners.forEach((listener) => listener(value));
}

export function useMuted(): [boolean, (value: boolean) => void] {
  const [value, setValue] = useState(muted);
  useEffect(() => {
    listeners.add(setValue);
    return () => {
      listeners.delete(setValue);
    };
  }, []);
  return [value, setMuted];
}

function tone(
  context: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  endFrequency?: number,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration);
  }
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function noise(
  context: AudioContext,
  start: number,
  duration: number,
  volume: number,
  filterFrequency: number,
  filterType: BiquadFilterType = 'lowpass',
) {
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2.4;
  }
  const source = context.createBufferSource();
  source.buffer = buffer;
  const filter = context.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = filterFrequency;
  const gain = context.createGain();
  gain.gain.value = volume;
  source.connect(filter).connect(gain).connect(context.destination);
  source.start(start);
}

export type SoundName = 'ding' | 'levelup' | 'pop' | 'tick' | 'flap' | 'hit' | 'boom' | 'error';

/** Tiny synth. Every sound is generated on the fly, so no audio files are needed. */
export function play(name: SoundName): void {
  if (muted) return;
  const context = getContext();
  if (!context) return;
  const now = context.currentTime;
  try {
    switch (name) {
      case 'ding':
        tone(context, 880, now, 0.09, 'square', 0.05);
        tone(context, 1318, now + 0.1, 0.16, 'square', 0.05);
        break;
      case 'levelup':
        [523, 659, 784, 1046, 1318].forEach((frequency, index) =>
          tone(context, frequency, now + index * 0.085, 0.2, 'triangle', 0.07),
        );
        break;
      case 'pop':
        tone(context, 640, now, 0.07, 'sine', 0.07, 220);
        break;
      case 'tick':
        tone(context, 1500, now, 0.025, 'square', 0.02);
        break;
      case 'flap':
        tone(context, 260, now, 0.08, 'sine', 0.05, 720);
        noise(context, now, 0.05, 0.03, 2400, 'highpass');
        break;
      case 'hit':
        tone(context, 180, now, 0.28, 'sawtooth', 0.08, 50);
        noise(context, now, 0.25, 0.08, 500);
        break;
      case 'boom':
        noise(context, now, 0.55, 0.22, 620);
        tone(context, 90, now, 0.4, 'sine', 0.12, 30);
        break;
      case 'error':
        tone(context, 220, now, 0.12, 'square', 0.04, 160);
        break;
    }
  } catch {
    /* Sound is decoration, never a requirement. */
  }
}
