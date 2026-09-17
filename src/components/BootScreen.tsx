import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BatMark } from './Brand';
import { channel, formatIndian } from '../data/channel';
import { useChannelStats } from '../lib/useChannelStats';

const STEPS = [
  'INITIALIZING SECURE CAVE PROTOCOL...',
  'CONNECTING LIVE YOUTUBE VAULT...',
  'SYNCING VERIFIED CHANNEL TELEMETRY...',
  'CALIBRATING LIGHTING ENGINE...',
  'ENTERING THE BAT CAVE',
];

const SESSION_KEY = 'kaali-chamkadad:booted';
const DURATION = 1100;

export function BootScreen() {
  const channelStats = useChannelStats();
  const [visible, setVisible] = useState(() => {
    try {
      return window.sessionStorage.getItem(SESSION_KEY) !== '1';
    } catch {
      return true;
    }
  });
  const [progress, setProgress] = useState(0);
  const reduceMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  ).current;

  useEffect(() => {
    if (!visible) return;
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* fine */
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    if (reduceMotion) {
      setVisible(false);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const ratio = Math.min(1, (now - start) / DURATION);
      setProgress(Math.round((1 - (1 - ratio) ** 2.2) * 100));
      if (ratio < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        window.setTimeout(() => setVisible(false), 240);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, reduceMotion]);

  useEffect(() => {
    if (!visible) return;
    const skip = () => setVisible(false);
    window.addEventListener('keydown', skip);
    return () => window.removeEventListener('keydown', skip);
  }, [visible]);

  const stepIndex = Math.min(STEPS.length - 1, Math.floor((progress / 100) * STEPS.length));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="boot-screen"
          role="status"
          aria-label="Loading KaaliChamkadad Hub"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          onClick={() => setVisible(false)}
        >
          <div className="boot-inner">
            <motion.div
              className="boot-logo"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <BatMark />
            </motion.div>
            <h1 className="boot-title">
              KAALI<span>CHAMKADAD</span>
            </h1>
            <div className="boot-bar" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>
            <p className="boot-step" aria-live="polite">
              {STEPS[stepIndex]}
            </p>
            <p className="boot-meta">
              {formatIndian(channelStats.subscribers)} SUBSCRIBERS · {channelStats.totalVideos} UPLOADS · {channel.handle}
            </p>
            <p className="boot-skip">CLICK ANYWHERE OR PRESS ANY KEY TO SKIP</p>
          </div>
          <span className="boot-scan" aria-hidden="true" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
