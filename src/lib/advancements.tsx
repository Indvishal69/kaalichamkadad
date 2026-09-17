import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Sparkles, X } from 'lucide-react';
import { BatMark } from '../components/Brand';
import { fireConfetti } from './confetti';
import { play } from './sound';

export type AdvancementId =
  | 'explorer'
  | 'detective'
  | 'pilot'
  | 'collector'
  | 'scholar'
  | 'cook'
  | 'idea'
  | 'gang'
  | 'hacker'
  | 'traveller'
  | 'supporter'
  | 'chaos'
  | 'secret';

export type Advancement = {
  id: AdvancementId;
  title: string;
  description: string;
};

export const advancementList: Advancement[] = [
  { id: 'explorer', title: 'Cave Premiere', description: 'Screened a video inside the Bat Cave theater.' },
  { id: 'detective', title: 'Vault Explorer', description: 'Searched or filtered the video archives.' },
  { id: 'pilot', title: 'Ace Aviator', description: 'Scored 10 or higher in Flappy Bat arcade.' },
  { id: 'collector', title: 'Queue Curator', description: 'Saved 3+ videos to your personalized watch list.' },
  { id: 'scholar', title: 'Lore Master', description: 'Scored 100% on the channel knowledge quiz.' },
  { id: 'cook', title: 'Concept Cook', description: 'Rolled a wild challenge idea with the generator.' },
  { id: 'idea', title: 'Producer Note', description: 'Submitted a video idea for production consideration.' },
  { id: 'gang', title: 'Verified Gang', description: 'Accessed the official Bat Gang Discord hub.' },
  { id: 'supporter', title: 'Road to 1K Backer', description: 'Backed the channel push towards 1,000 subscribers.' },
  { id: 'hacker', title: 'Terminal Operator', description: 'Executed an administrative command in the cave shell.' },
  { id: 'traveller', title: 'Biome Nomad', description: 'Personalized your cave lighting with an alternate biome.' },
  { id: 'chaos', title: 'Full Overdrive', description: 'Cranked the chaos engine to 100% intensity.' },
  { id: 'secret', title: 'Protocol Shadow', description: 'Executed the legendary retro cheat sequence.' },
];

const STORAGE_KEY = 'kaali-chamkadad:advancements';

type AdvancementsValue = {
  unlocked: AdvancementId[];
  unlock: (id: AdvancementId) => void;
  reset: () => void;
  total: number;
};

const AdvancementsContext = createContext<AdvancementsValue | null>(null);

function readStored(): AdvancementId[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? (JSON.parse(stored) as unknown) : [];
    const valid = advancementList.map((item) => item.id);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is AdvancementId => typeof id === 'string' && valid.includes(id as AdvancementId))
      : [];
  } catch {
    return [];
  }
}

export function AdvancementsProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<AdvancementId[]>(readStored);
  const [toasts, setToasts] = useState<{ key: number; advancement: Advancement }[]>([]);
  const counter = useRef(0);
  const previous = useRef<AdvancementId[]>(unlocked);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
    } catch {
      /* fine */
    }
  }, [unlocked]);

  useEffect(() => {
    const added = unlocked.filter((id) => !previous.current.includes(id));
    previous.current = unlocked;
    if (added.length === 0) return;
    const fresh = added
      .map((id) => advancementList.find((item) => item.id === id))
      .filter((item): item is Advancement => Boolean(item))
      .map((advancement) => ({ key: (counter.current += 1), advancement }));
    setToasts((active) => [...active, ...fresh]);
    play('ding');
    if (unlocked.length === advancementList.length) {
      fireConfetti({ count: 260 });
      window.setTimeout(() => play('levelup'), 260);
    }
  }, [unlocked]);

  const unlock = useCallback((id: AdvancementId) => {
    setUnlocked((current) => (current.includes(id) ? current : [...current, id]));
  }, []);

  const reset = useCallback(() => {
    setUnlocked([]);
  }, []);

  const value = useMemo(
    () => ({ unlocked, unlock, reset, total: advancementList.length }),
    [unlocked, unlock, reset],
  );

  return (
    <AdvancementsContext.Provider value={value}>
      {children}
      <div className="advancement-toasts" aria-live="polite">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <Toast
              key={toast.key}
              toastKey={toast.key}
              advancement={toast.advancement}
              onDone={(key) => setToasts((active) => active.filter((item) => item.key !== key))}
            />
          ))}
        </AnimatePresence>
      </div>
    </AdvancementsContext.Provider>
  );
}

export function useAdvancements(): AdvancementsValue {
  const context = useContext(AdvancementsContext);
  if (!context) throw new Error('useAdvancements must be used inside AdvancementsProvider');
  return context;
}

function Toast({
  advancement,
  onDone,
  toastKey,
}: {
  advancement: Advancement;
  onDone: (key: number) => void;
  toastKey: number;
}) {
  useEffect(() => {
    const timeout = window.setTimeout(() => onDone(toastKey), 5000);
    return () => window.clearTimeout(timeout);
  }, [onDone, toastKey]);

  return (
    <motion.div
      className="advancement-toast"
      initial={{ opacity: 0, x: 30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 30, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
    >
      <span className="advancement-toast-icon"><Sparkles size={16} /></span>
      <div>
        <span className="advancement-toast-label">MILESTONE UNLOCKED</span>
        <strong>{advancement.title}</strong>
        <p>{advancement.description}</p>
      </div>
    </motion.div>
  );
}

export function AdvancementsHUD() {
  const { unlocked, total, reset } = useAdvancements();
  const [open, setOpen] = useState(false);
  const percent = Math.round((unlocked.length / total) * 100);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        className="advancements-hud"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="View Milestones"
      >
        <BatMark />
        <span className="advancements-hud-text">
          <small>MILESTONES</small>
          <strong>{unlocked.length}/{total}</strong>
        </span>
        <span className="advancements-hud-ring" style={{ '--progress': `${percent}%` } as CSSProperties} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="advancements-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              className="advancements-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="advancements-title"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.22 }}
            >
              <div className="advancements-head">
                <div>
                  <p className="eyebrow"><span className="eyebrow-square" /> CREATOR HUB LOG</p>
                  <h2 id="advancements-title">MILESTONES<span className="accent-text">.</span></h2>
                  <p className="advancements-sub">
                    {unlocked.length === total
                      ? '100% complete. You have unlocked every fan milestone in the Bat Cave.'
                      : 'Explore videos, play Flappy Bat, test channel lore, and back the channel to earn milestones.'}
                  </p>
                </div>
                <button className="icon-button" onClick={() => setOpen(false)} aria-label="Close milestones">
                  <X size={22} />
                </button>
              </div>
              <div className="advancements-progress">
                <span style={{ width: `${percent}%` }} />
              </div>
              <ul className="advancements-grid">
                {advancementList.map((advancement) => {
                  const done = unlocked.includes(advancement.id);
                  return (
                    <li key={advancement.id} className={done ? 'is-unlocked' : ''}>
                      <span className="advancements-item-icon">
                        {done ? <Sparkles size={14} /> : <Lock size={13} />}
                      </span>
                      <div>
                        <strong>{done ? advancement.title : 'Locked Milestone'}</strong>
                        <p>{done ? advancement.description : 'Undiscovered. Explore the hub to unlock.'}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {unlocked.length > 0 && (
                <button className="text-button advancements-reset" onClick={reset}>
                  Reset Progress
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
