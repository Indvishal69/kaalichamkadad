import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { channel, formatIndian, stats, videos, type Video } from '../data/channel';
import { advancementList, useAdvancements } from '../lib/advancements';
import { biomes, chaosLabel, type BiomeId } from '../lib/chaos';
import { fireConfetti } from '../lib/confetti';
import { play } from '../lib/sound';
import { useChannelStats } from '../lib/useChannelStats';

type Kind = 'in' | 'out' | 'ok' | 'err';
type Line = { id: number; kind: Kind; text: string };

type TerminalProps = {
  open: boolean;
  onClose: () => void;
  onPlay: (video: Video) => void;
  chaos: number;
  setChaos: (value: number) => void;
  biome: BiomeId;
  setBiome: (biome: BiomeId) => void;
};

const sectionMap: Record<string, string> = {
  top: 'home',
  home: 'home',
  videos: 'videos',
  vault: 'videos',
  arcade: 'game',
  flappy: 'game',
  game: 'game',
  story: 'about',
  about: 'about',
  lore: 'about',
  road: 'road',
  '1k': 'road',
  milestones: 'road',
  community: 'community',
  gang: 'community',
  quotes: 'quotes',
  quiz: 'quiz',
  card: 'card',
  pass: 'card',
  faq: 'questions',
  ideas: 'ideas',
};

const BAT_ART = String.raw`   /\                 /\
  / \'._   (\_/)   _.'/ \
 /_.''._'--('.')--'_.''._\
 | \_ / ;=/ " \=; \ _/ |
  \/  \__| \___/ |__/  \/
        \(/|\)/`;

const HELP = [
  'help                  show all available commands',
  'stats                 live verified channel metrics',
  'list                  index of signature uploads',
  'play <words|n|random> open and play video in theater',
  'go <section>          videos, arcade, road, quiz, gang, card, ideas, top',
  'chaos <0-100>         tune ambient lighting and pace',
  'biome <name>          overworld, nether, end, ocean, glowstone',
  'advancements          view your unlocked achievements',
  'tnt                   launch celebratory sparks',
  'bat                   render ASCII bat mascot',
  'subscribe / discord   official creator channels',
  'clear / exit          close or wipe console buffer',
];

const COMMANDS = [
  'help', 'stats', 'list', 'play', 'go', 'chaos', 'biome', 'advancements', 'tnt', 'bat',
  'subscribe', 'discord', 'clear', 'exit', 'whoami', 'date', 'ls', 'cat',
];

let lineId = 0;
const makeLine = (kind: Kind, text: string): Line => ({ id: (lineId += 1), kind, text });


export function Terminal({ open, onClose, onPlay, chaos, setChaos, biome, setBiome }: TerminalProps) {
  const channelStats = useChannelStats();

  const [lines, setLines] = useState<Line[]>([]);
  
  useEffect(() => {
    if (lines.length === 0) {
      setLines([
        makeLine('ok', 'KAALICHAMKADAD CAVE TERMINAL v1.0'),
        makeLine(
          'out',
          `Cave open for ${stats.daysOfChaos} days. ${formatIndian(channelStats.subscribers)} bats and counting.`,
        ),
        makeLine('out', 'Type "help" to see what this thing can do.'),
      ]);
    }
  }, [channelStats.subscribers]);

  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { unlocked, unlock } = useAdvancements();

  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    const element = outputRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [lines, open]);

  function run(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const [command, ...rest] = trimmed.split(/\s+/);
    const arg = rest.join(' ');
    const name = command.toLowerCase();
    const out: Line[] = [makeLine('in', trimmed)];
    const say = (text: string, kind: Kind = 'out') => out.push(makeLine(kind, text));
    unlock('hacker');

    switch (name) {
      case 'help':
        HELP.forEach((entry) => say(entry));
        break;
      case 'stats':
        say(`Subscribers    ${formatIndian(channelStats.subscribers)}  (road to ${formatIndian(channelStats.goal)})`);
        say(`Videos         ${channelStats.totalVideos}`);
        say(`Views          ${formatIndian(channelStats.views)}`);
        say(`Country        ${channelStats.country}`);
        say('Joined         19 Sept 2025');
        say(`Status         ${channelStats.verification}`);
        break;
      case 'list':
        videos.forEach((video, index) =>
          say(`${String(index + 1).padStart(2, ' ')}. ${video.title}  [${video.game}${video.isShort ? ' · short' : ''}]`),
        );
        break;
      case 'play': {
        if (!arg) {
          say('Usage: play <title words> | play random | play 3', 'err');
          break;
        }
        let video: Video | undefined;
        if (arg.toLowerCase() === 'random') {
          video = videos[Math.floor(Math.random() * videos.length)];
        } else if (/^\d+$/.test(arg)) {
          video = videos[Number(arg) - 1];
        } else {
          const query = arg.toLowerCase();
          video =
            videos.find((item) => item.title.toLowerCase().includes(query)) ??
            videos.find((item) => item.game.toLowerCase().includes(query)) ??
            videos.find((item) =>
              query.split(/\s+/).some((word) => word.length > 2 && item.title.toLowerCase().includes(word)),
            );
        }
        if (!video) {
          say(`Nothing matched "${arg}". Try "list".`, 'err');
          break;
        }
        say(`Now playing: ${video.title}`, 'ok');
        const chosen = video;
        window.setTimeout(() => {
          onClose();
          onPlay(chosen);
        }, 260);
        break;
      }
      case 'go':
      case 'cd': {
        const id = sectionMap[arg.toLowerCase()];
        if (!id) {
          say(`Unknown place "${arg}". Try: videos, build, chaos, game, quiz, gang, ideas, card, top`, 'err');
          break;
        }
        say(`Warping to ${arg}...`, 'ok');
        window.setTimeout(() => {
          onClose();
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 220);
        break;
      }
      case 'chaos': {
        if (!arg) {
          say(`Chaos is at ${chaos}. ${chaosLabel(chaos)}.`);
          break;
        }
        const value = Number(arg);
        if (!Number.isFinite(value)) {
          say('Chaos needs a number between 0 and 100.', 'err');
          break;
        }
        const clamped = Math.max(0, Math.min(100, Math.round(value)));
        setChaos(clamped);
        say(`Chaos set to ${clamped}. ${chaosLabel(clamped)}.`, 'ok');
        play('tick');
        break;
      }
      case 'biome': {
        if (!arg) {
          say(`Current biome: ${biome}. Options: ${biomes.map((item) => item.id).join(', ')}`);
          break;
        }
        const match = biomes.find(
          (item) => item.id === arg.toLowerCase() || item.name.toLowerCase() === arg.toLowerCase(),
        );
        if (!match) {
          say(`No biome called "${arg}".`, 'err');
          break;
        }
        setBiome(match.id);
        if (match.id !== 'overworld') unlock('traveller');
        say(`Biome switched to ${match.name}. ${match.blurb}`, 'ok');
        break;
      }
      case 'advancements':
      case 'achievements':
        say(`${unlocked.length}/${advancementList.length} unlocked`, 'ok');
        advancementList.forEach((item) =>
          say(`${unlocked.includes(item.id) ? '[x] ' + item.title : '[ ] ???'}`),
        );
        break;
      case 'tnt':
        fireConfetti({ count: 200 });
        play('boom');
        say('BOOM. Nothing was harmed. Probably.', 'ok');
        break;
      case 'bat':
        BAT_ART.split('\n').forEach((row) => say(row, 'ok'));
        say('A bat has been summoned. It is judging you.');
        break;
      case 'whoami':
        say('bat-gang-member. Rank: honorary. Root access: absolutely not.');
        break;
      case 'sudo':
        say('Nice try. Even Kaali does not have root in here.', 'err');
        break;
      case 'rm':
        say(
          arg.includes('-rf')
            ? 'Absolutely not. This is a family-friendly cave.'
            : 'rm: nothing to remove. The cave is already a mess.',
          'err',
        );
        break;
      case 'ls':
        say('videos/  arcade/  lore/  road-1k/  quiz/  pass/  ideas/  secrets.txt');
        break;
      case 'cat':
        if (arg === 'secrets.txt') {
          say('Up, up, down, down, left, right, left, right, B, A. You did not hear it from me.', 'ok');
        } else {
          say(`cat: ${arg || '???'}: no such file`, 'err');
        }
        break;
      case 'subscribe':
        window.open(channel.subscribeUrl, '_blank', 'noopener');
        say('Opening YouTube. Smash it.', 'ok');
        break;
      case 'discord':
        window.open(channel.discordUrl, '_blank', 'noopener');
        unlock('gang');
        say('Opening the Bat Gang Discord.', 'ok');
        break;
      case 'date':
        say(`Cave open for ${stats.daysOfChaos} days. Founded 19 Sept 2025, India.`);
        break;
      case 'clear':
        setLines([]);
        setHistory((current) => [trimmed, ...current].slice(0, 40));
        setCursor(-1);
        setInput('');
        return;
      case 'exit':
      case 'quit':
        onClose();
        break;
      default:
        say(`${command}: command not found. Type "help". Or don't. I'm a terminal, not a cop.`, 'err');
        play('error');
    }

    setLines((current) => [...current, ...out].slice(-240));
    setHistory((current) => [trimmed, ...current].slice(0, 40));
    setCursor(-1);
    setInput('');
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      onClose();
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const next = Math.min(history.length - 1, cursor + 1);
      if (next >= 0) {
        setCursor(next);
        setInput(history[next]);
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = cursor - 1;
      setCursor(next);
      setInput(next >= 0 ? history[next] : '');
    } else if (event.key === 'Tab') {
      const match = COMMANDS.find((item) => input && item.startsWith(input.toLowerCase()));
      if (match) {
        event.preventDefault();
        setInput(`${match} `);
      }
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="advancements-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            className="advancements-panel terminal-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Cave terminal"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className="terminal-bar">
              <span className="terminal-dots" aria-hidden="true"><span /><span /><span /></span>
              <span className="terminal-title">bat@cave — terminal</span>
              <button className="icon-button" onClick={onClose} aria-label="Close terminal">
                <X size={20} />
              </button>
            </div>
            <div className="terminal-output" ref={outputRef} aria-live="polite">
              {lines.map((line) => (
                <p key={line.id} className={`terminal-line is-${line.kind}`}>{line.text}</p>
              ))}
            </div>
            <form
              className="terminal-form"
              onSubmit={(event) => {
                event.preventDefault();
                run(input);
              }}
            >
              <label className="terminal-prompt" htmlFor="terminal-input">bat@cave:~$</label>
              <input
                id="terminal-input"
                ref={inputRef}
                className="terminal-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="Terminal command"
                placeholder="type help"
              />
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
