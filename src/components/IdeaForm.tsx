import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Dices, Send, Sparkles } from 'lucide-react';
import { ref, onValue, push } from 'firebase/database';
import { channel, ideaParts } from '../data/channel';
import { useAdvancements } from '../lib/advancements';
import { play } from '../lib/sound';
import { db } from '../lib/firebase';

const games = ['Minecraft', 'GTA V', 'Valorant', 'Anything goes'] as const;

type SavedIdea = { idea: string; game: string; at: number };

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function IdeaForm() {
  const [idea, setIdea] = useState('');
  const [game, setGame] = useState<(typeof games)[number]>('Minecraft');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [count, setCount] = useState(0);
  const { unlock } = useAdvancements();

  useEffect(() => {
    const ideasRef = ref(db, 'ideas');
    const unsubscribe = onValue(ideasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCount(Object.keys(data).length);
      } else {
        setCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  function generate() {
    const text = `Minecraft but ${pick(ideaParts.triggers)}, ${pick(ideaParts.effects)} ${pick(ideaParts.twists)}.`;
    setIdea(text);
    setGame('Minecraft');
    setError('');
    setSent(false);
    unlock('cook');
    play('pop');
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = idea.trim();
    if (trimmed.length < 8) {
      setError('Give me a bit more than that. At least 8 characters of chaos.');
      play('error');
      return;
    }
    try {
      const ideasRef = ref(db, 'ideas');
      push(ideasRef, { idea: trimmed, game, at: Date.now() });
    } catch {
      /* fallback if firebase is unreachable */
    }
    setError('');
    setIdea('');
    setSent(true);
    unlock('idea');
    play('ding');
  }

  return (
    <section className="idea-section section-space" id="ideas" aria-labelledby="idea-title">
      <div className="container idea-layout">
        <div>
          <p className="eyebrow section-eyebrow">YOUR TURN TO COOK</p>
          <h2 className="section-title" id="idea-title">DROP A VIDEO<br />IDEA ON ME<span className="accent-text">.</span></h2>
          <p className="section-description">
            The best videos on the channel started as a bad idea somebody typed out. Add yours to the pile, or let the generator cook one up, then take it to the Discord where it might actually get made.
          </p>
          <a
            className="text-link idea-discord-link"
            href={channel.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => unlock('gang')}
          >
            Or shout it in the Discord <Sparkles size={15} />
          </a>
        </div>

        <form className="idea-card" onSubmit={submit} noValidate>
          <div className="idea-field-head">
            <label htmlFor="idea-text">Your terrible idea</label>
            <button type="button" className="text-link idea-generate" onClick={generate}>
              <Dices size={14} /> Generate a terrible one
            </button>
          </div>
          <div className="idea-field">
            <textarea
              id="idea-text"
              value={idea}
              onChange={(event) => {
                setIdea(event.target.value);
                if (error) setError('');
              }}
              rows={4}
              placeholder="Minecraft but every time I mine a block, the sun gets angrier..."
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'idea-error' : undefined}
              maxLength={400}
            />
            <small className="idea-counter">{idea.length}/400</small>
          </div>

          <fieldset className="idea-games">
            <legend>Which game?</legend>
            {games.map((option) => (
              <label key={option} className={`idea-chip ${game === option ? 'is-active' : ''}`}>
                <input
                  type="radio"
                  name="idea-game"
                  value={option}
                  checked={game === option}
                  onChange={() => setGame(option)}
                />
                {option}
              </label>
            ))}
          </fieldset>

          {error && (
            <p className="idea-error" id="idea-error" role="alert">
              {error}
            </p>
          )}

          <div className="idea-actions">
            <button className="button button-lime" type="submit">
              <Send size={15} /> Send it into the cave
            </button>
            <span className="idea-count">
              {count === 0 ? 'No ideas logged yet' : `${count} idea${count === 1 ? '' : 's'} logged`}
            </span>
          </div>

          <AnimatePresence>
            {sent && (
              <motion.p
                className="idea-success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="status"
              >
                <Check size={15} /> Landed. Now go post it in the Discord so it has a fighting chance.
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </div>
    </section>
  );
}
