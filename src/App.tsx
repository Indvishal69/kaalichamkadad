import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BadgeCheck,
  Check,
  Flame,
  Gamepad2,
  Keyboard,
  ListVideo,
  Menu,
  Play,
  Plus,
  Search,
  Shuffle,
  Terminal as TerminalIcon,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { BatMark, Brand, DiscordMark, YouTubeMark } from './components/Brand';
import { BatSwarm } from './components/BatSwarm';
import { VideoPlayer } from './components/VideoPlayer';
import { BootScreen } from './components/BootScreen';
import { CursorTrail } from './components/CursorTrail';
import { BiomeWeather } from './components/BiomeWeather';
import { FlappyBat } from './components/FlappyBat';
import { Terminal } from './components/Terminal';
import { RoadTo1K } from './components/RoadTo1K';
import { ShareCard } from './components/ShareCard';
import { Quiz } from './components/Quiz';
import { QuotesCarousel } from './components/QuotesCarousel';
import { IdeaForm } from './components/IdeaForm';
import { AdvancementsHUD, AdvancementsProvider, useAdvancements } from './lib/advancements';
import { biomes, chaosFlavour, chaosLabel, useChaos, type BiomeId } from './lib/chaos';
import { fireConfetti } from './lib/confetti';
import { useQueue } from './lib/queue';
import { play, useMuted } from './lib/sound';
import {
  categories,
  channel,
  filterVideos,
  formatDate,
  formatIndian,
  stats,
  tickerPhrases,
  videos,
  type Category,
  type Video,
} from './data/channel';
import { useChannelStats } from './lib/useChannelStats';

const navigation = [
  { id: 'videos', label: 'Vault' },
  { id: 'game', label: 'Flappy Bat' },
  { id: 'road', label: 'Road to 1K' },
  { id: 'about', label: 'Lore' },
  { id: 'card', label: 'Fan Pass' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'community', label: 'Bat Gang' },
];

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

type HeaderProps = {
  chaos: number;
  muted: boolean;
  onToggleMute: () => void;
  onOpenTerminal: () => void;
};

function Header({ chaos, muted, onToggleMute, onOpenTerminal }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { unlock } = useAdvancements();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: '-18% 0px -65% 0px', threshold: 0 },
    );
    const sections = [...navigation.map(({ id }) => id), 'home', 'about', 'road', 'ideas', 'quotes', 'card'];
    sections.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 881px)');
    const sync = () => {
      if (mediaQuery.matches) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    mediaQuery.addEventListener('change', sync);
    window.addEventListener('keydown', onKey);
    return () => {
      mediaQuery.removeEventListener('change', sync);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const navLinks = navigation.map(({ id, label }) => (
    <a
      key={id}
      href={`#${id}`}
      className={activeSection === id ? 'nav-link is-active' : 'nav-link'}
      aria-current={activeSection === id ? 'location' : undefined}
      onClick={() => setMenuOpen(false)}
    >
      {label}
    </a>
  ));

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand onClick={() => setMenuOpen(false)} />
        <nav className="desktop-nav" aria-label="Main navigation">{navLinks}</nav>
        <div className="header-actions">
          <span className="chaos-pill" title="Engine Intensity">
            <Flame size={13} /> {chaosLabel(chaos)}
          </span>
          <button
            className="icon-button mute-button"
            onClick={onToggleMute}
            aria-pressed={muted}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            title={muted ? 'Audio muted' : 'Audio active'}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            className="icon-button terminal-button"
            onClick={onOpenTerminal}
            aria-label="Open developer terminal"
            title="Terminal (T / Ctrl+K)"
          >
            <TerminalIcon size={18} />
          </button>
          <a
            className="button button-lime subscribe-button"
            href={channel.subscribeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              fireConfetti({ count: 160, origin: { x: window.innerWidth * 0.85, y: 70 } });
              play('levelup');
            }}
          >
            <YouTubeMark width={18} height={18} /> <span>Subscribe</span>
            <ArrowUpRight className="subscribe-arrow" size={15} />
          </a>
          <button
            className="icon-button menu-toggle"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="container mobile-nav-inner">
              {navLinks}
              <a
                className="nav-link mobile-discord-link"
                href={channel.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => unlock('gang')}
              >
                Join the Discord
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero({ chaos, onPlay }: { chaos: number; onPlay: (video: Video) => void }) {
  const channelStats = useChannelStats();
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const parallax = useTransform(scrollY, [0, 800], [0, 130]);

  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <div className="hero-media" aria-hidden="true">
        <motion.img
          src="/images/bat-cave-hero.jpg"
          alt="KaaliChamkadad Minecraft avatar standing atop mossy stones overlooking valley"
          fetchPriority="high"
          style={{ y: reduceMotion ? 0 : parallax }}
          initial={reduceMotion ? false : { scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="hero-shade" />
      <div className="hero-glow" aria-hidden="true" />
      <BatSwarm chaos={chaos} />
      <div className="container hero-content">
        <motion.div
          className="hero-badge-row"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          <span className="hero-badge">
            <BadgeCheck size={14} /> VERIFIED CREATOR
          </span>
          <span className="hero-badge-meta">
            {formatIndian(channelStats.subscribers)} SUBSCRIBERS · {channelStats.country}
          </span>
        </motion.div>
        <h1 className="hero-title" id="hero-title">
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >KAALI</motion.span>
          <motion.span
            className="accent-text hero-word"
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >CHAMKADAD<span className="hero-period">.</span></motion.span>
        </h1>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <p className="hero-description">
            High-octane Minecraft challenges, GTA V escapades, and Backrooms mysteries.
            <br className="desktop-break" />
            Home of the Bat Gang. Watch the archives, test your lore, or set a flight record.
          </p>
          <div className="hero-actions">
            <button className="button button-lime hero-play" onClick={() => onPlay(videos[0])}>
              <Play size={16} fill="currentColor" strokeWidth={0} /> Watch Latest Upload
            </button>
            <a className="button button-outline" href="#game">
              <Gamepad2 size={16} /> Flappy Bat Arcade
            </a>
            <button
              className="hero-ghost-link"
              onClick={() => {
                play('pop');
                onPlay(videos[Math.floor(Math.random() * videos.length)]);
              }}
            >
              <Shuffle size={14} /> Surprise Me
            </button>
          </div>
        </motion.div>
      </div>
      <a className="hero-scroll-cue" href="#videos" aria-label="Scroll to video vault">
        <ArrowDown size={17} />
      </a>
    </section>
  );
}

function Ticker() {
  const items = useMemo(() => [...tickerPhrases, ...tickerPhrases], []);
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {items.map((phrase, index) => (
          <span key={`${phrase}-${index}`}>
            {phrase} <i>*</i>
          </span>
        ))}
      </div>
    </div>
  );
}

function StatCounter({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const duration = 1500;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setDisplay(Math.round((1 - (1 - progress) ** 3) * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, reduceMotion]);

  return (
    <div className="stat" ref={ref}>
      <strong>{display.toLocaleString('en-IN')}</strong>
      <span>{label}</span>
    </div>
  );
}

function StatsStrip() {
  const channelStats = useChannelStats();
  return (
    <section className="stats-strip" aria-label="Official Channel Telemetry">
      <div className="container stats-grid">
        <StatCounter value={channelStats.subscribers} label="VERIFIED SUBSCRIBERS" />
        <StatCounter value={channelStats.totalVideos} label="PUBLIC UPLOADS" />
        <StatCounter value={channelStats.views} label="LIFETIME VIEWS" />
        <StatCounter value={stats.daysOfChaos} label="DAYS ACTIVE" />
      </div>
    </section>
  );
}

type VideoTileProps = {
  video: Video;
  queued: boolean;
  onPlay: (video: Video) => void;
  onToggleQueue: (id: string) => void;
};

function VideoTile({ video, queued, onPlay, onToggleQueue }: VideoTileProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const reduceMotion = useReducedMotion();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 220, damping: 22 });
  const springRotateY = useSpring(rotateY, { stiffness: 220, damping: 22 });

  return (
    <motion.article
      className="video-item"
      layout="position"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.28 }}
      style={reduceMotion ? undefined : { rotateX: springRotateX, rotateY: springRotateY, transformPerspective: 1000 }}
      onMouseMove={
        reduceMotion
          ? undefined
          : (event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              rotateY.set(((event.clientX - rect.left) / rect.width - 0.5) * 8);
              rotateX.set(-((event.clientY - rect.top) / rect.height - 0.5) * 7);
            }
      }
      onMouseLeave={
        reduceMotion
          ? undefined
          : () => {
              rotateX.set(0);
              rotateY.set(0);
            }
      }
    >
      <button className="video-link" onClick={() => onPlay(video)} aria-label={`Play ${video.title}`}>
        <div className="video-thumbnail">
          {imageFailed ? (
            <div className="thumbnail-fallback"><BatMark /><span>KAALICHAMKADAD</span></div>
          ) : (
            <img
              className="thumbnail-image"
              src={`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`}
              alt=""
              loading="lazy"
              decoding="async"
              onLoad={(event) => {
                const image = event.currentTarget;
                if (image.naturalWidth < 200 && image.src.includes('maxresdefault')) {
                  image.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                }
              }}
              onError={(event) => {
                const image = event.currentTarget;
                if (image.src.includes('maxresdefault')) {
                  image.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                } else {
                  setImageFailed(true);
                }
              }}
            />
          )}
          <div className="thumbnail-scrim" />
          <span className="video-format">{video.isShort ? 'SHORT' : 'FEATURE'}</span>
          <span className="thumbnail-play"><Play size={15} fill="currentColor" strokeWidth={0} /></span>
          <span className="thumbnail-hover-play"><Play size={22} fill="currentColor" strokeWidth={0} /></span>
        </div>
        <div className="video-info">
          <div className="video-meta">
            <span className="video-game">{video.game}</span>
            <time dateTime={video.published}>{formatDate(video.published)}</time>
          </div>
          <div className="video-title-row">
            <h3>{video.title}</h3>
            <ArrowUpRight className="video-title-arrow" size={18} />
          </div>
        </div>
      </button>
      <button
        className={`queue-toggle ${queued ? 'is-queued' : ''}`}
        onClick={() => {
          onToggleQueue(video.id);
          play(queued ? 'tick' : 'pop');
        }}
        aria-pressed={queued}
        aria-label={queued ? `Remove ${video.title} from queue` : `Add ${video.title} to queue`}
        title={queued ? 'In watch queue' : 'Add to watch queue'}
      >
        {queued ? <Check size={14} /> : <Plus size={14} />}
      </button>
    </motion.article>
  );
}

type VideoLibraryProps = {
  onPlay: (video: Video) => void;
  queueIds: string[];
  onToggleQueue: (id: string) => void;
};

function VideoLibrary({ onPlay, queueIds, onToggleQueue }: VideoLibraryProps) {
  const channelStats = useChannelStats();
  const [category, setCategory] = useState<Category>('All videos');
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const { unlock } = useAdvancements();
  const results = useMemo(() => filterVideos(category, query), [category, query]);
  const visibleVideos = results.slice(0, visibleCount);

  useEffect(() => {
    if (query.trim().length > 1) unlock('detective');
  }, [query, unlock]);

  function resetFilters() {
    setCategory('All videos');
    setQuery('');
    setVisibleCount(6);
  }

  return (
    <section className="videos-section section-space" id="videos" aria-labelledby="videos-title">
      <div className="container">
        <Reveal className="section-heading">
          <div>
            <p className="eyebrow section-eyebrow">CURATED ARCHIVES</p>
            <h2 className="section-title" id="videos-title">VIDEO VAULT<span className="accent-text">.</span></h2>
            <p className="section-description">
              Direct access to signature uploads across Minecraft, GTA V, and Valorant. Play inline without leaving the hub.
            </p>
          </div>
          <a className="text-link channel-link" href={`${channel.url}/videos`} target="_blank" rel="noopener noreferrer">
            Browse full catalog ({channelStats.totalVideos} videos) <ArrowUpRight size={17} />
          </a>
        </Reveal>
        <div className="video-toolbar">
          <div className="video-filters" role="group" aria-label="Filter videos by category">
            {categories.map((item) => (
              <button
                key={item}
                className={`filter-button ${category === item ? 'is-active' : ''}`}
                aria-pressed={category === item}
                onClick={() => {
                  setCategory(item);
                  setVisibleCount(6);
                }}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="video-search" role="search" aria-label="Search the video vault">
            <Search size={16} aria-hidden="true" />
            <input
              id="video-search-input"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(6);
              }}
              placeholder="Search uploads by title or game..."
              aria-label="Search videos"
            />
            {query && (
              <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {results.length} videos found. Showing {visibleVideos.length}.
        </p>
        <div className="video-grid">
          <AnimatePresence initial={false}>
            {visibleVideos.map((video) => (
              <VideoTile
                key={video.id}
                video={video}
                queued={queueIds.includes(video.id)}
                onPlay={onPlay}
                onToggleQueue={onToggleQueue}
              />
            ))}
          </AnimatePresence>
        </div>
        {results.length === 0 && (
          <div className="empty-state">
            <Search size={32} strokeWidth={1.3} />
            <h3>No results found</h3>
            <p>Try modifying your search term or switch back to all categories.</p>
            <button className="text-link" onClick={resetFilters}>
              Reset search filters <ArrowRight size={17} />
            </button>
          </div>
        )}
        {results.length > visibleCount && (
          <div className="load-more-wrap">
            <button className="button button-outline load-more" onClick={() => setVisibleCount((count) => count + 6)}>
              Load More Archives <ArrowDown size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

type ChaosMeterProps = {
  chaos: number;
  setChaos: (value: number) => void;
  biome: BiomeId;
  setBiome: (biome: BiomeId) => void;
};

function ChaosMeter({ chaos, setChaos, biome, setBiome }: ChaosMeterProps) {
  const { unlock } = useAdvancements();
  const activeBiome = biomes.find((item) => item.id === biome) ?? biomes[0];

  useEffect(() => {
    if (chaos >= 95) unlock('chaos');
  }, [chaos, unlock]);

  return (
    <section className="chaos-section" id="chaos" aria-labelledby="chaos-title">
      <div className="container chaos-layout">
        <Reveal>
          <p className="eyebrow"><span className="eyebrow-square" /> AMBIENT CALIBRATION</p>
          <h2 className="chaos-title" id="chaos-title">LIGHTING & BIOMES<span className="accent-text">.</span></h2>
          <p className="chaos-description">
            Customize the aesthetic of the Bat Cave. Select a Minecraft biome theme and tune the lighting intensity to your preference.
          </p>
        </Reveal>
        <Reveal className="chaos-console">
          <div className="chaos-readout">
            <span className="chaos-value">{chaos}%</span>
            <span className="chaos-label">{chaosLabel(chaos)}</span>
          </div>
          <label className="chaos-slider">
            <span className="sr-only">Chaos intensity</span>
            <input
              type="range"
              min={0}
              max={100}
              value={chaos}
              onChange={(event) => setChaos(Number(event.target.value))}
              aria-valuetext={`${chaos}% intensity, ${chaosLabel(chaos)}`}
            />
            <span className="chaos-track" aria-hidden="true">
              <span className="chaos-fill" style={{ width: `${chaos}%` }} />
            </span>
          </label>
          <p className="chaos-flavour" aria-live="polite">{chaosFlavour(chaos)}</p>
          <div className="chaos-buttons">
            <button className="tool-button" onClick={() => setChaos(0)}>Reset Baseline</button>
            <button className="tool-button tool-tnt" onClick={() => setChaos(100)}>
              <Flame size={14} /> Maximum Drive
            </button>
          </div>
          <div className="biome-row" role="group" aria-label="Select biome color theme">
            {biomes.map((item) => (
              <button
                key={item.id}
                className={`biome-button ${biome === item.id ? 'is-active' : ''}`}
                style={{ '--biome-color': `hsl(${item.hue} 88% 70%)` } as CSSProperties}
                aria-pressed={biome === item.id}
                onClick={() => {
                  setBiome(item.id);
                  if (item.id !== 'overworld') unlock('traveller');
                  play('tick');
                }}
              >
                <span aria-hidden="true" />
                {item.name}
              </button>
            ))}
          </div>
          <p className="biome-blurb">{activeBiome.blurb}</p>
        </Reveal>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="story-section section-space" id="about" aria-labelledby="story-title">
      <div className="container story-layout">
        <Reveal className="story-visual">
          <img
            src="/images/inside-the-cave.jpg"
            alt="KaaliChamkadad Minecraft avatar resting beside a lantern inside a deep stone cave"
            loading="lazy"
            width={1200}
            height={800}
          />
        </Reveal>
        <Reveal className="story-content">
          <p className="eyebrow section-eyebrow">CREATOR PROFILE & LORE</p>
          <h2 className="section-title story-title" id="story-title">
            THE CREATOR<br />BEHIND THE BAT<span className="accent-text">.</span>
          </h2>
          <p className="story-intro">
            "I make Minecraft videos because apparently getting a real job was too difficult."
          </p>
          <p className="story-description">
            Founded September 19, 2025 in India. KaaliChamkadad builds chaotic gaming stories with a sharp satirical edge—from accidental wars in GTA V to terrifying Backrooms expeditions. With 123 public uploads and over 1.5 lakh views, the Bat Gang is growing fast.
          </p>
          <div className="creator-byline">
            <div className="channel-avatar">
              <BatMark />
              <img
                src={channel.avatarUrl}
                alt=""
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <span className="creator-name">{channel.name}</span>
              <span className="creator-caption">Phone Verified Creator · India</span>
            </div>
          </div>
          <a className="text-link story-link" href={`${channel.url}/about`} target="_blank" rel="noopener noreferrer">
            Official YouTube Channel About Page <ArrowUpRight size={17} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function Community() {
  const { unlock } = useAdvancements();
  return (
    <section className="community-section" id="community" aria-labelledby="community-title">
      <BatMark className="community-watermark" />
      <div className="container community-layout">
        <Reveal>
          <p className="eyebrow">COMMUNITY ACCESS</p>
          <h2 className="community-title" id="community-title">JOIN THE<br />BAT GANG.</h2>
        </Reveal>
        <Reveal className="community-content">
          <p>
            Connect directly with fellow fans. Share challenge proposals, discuss upload theories, vote on future game choices, and connect with Kaali.
          </p>
          <a
            className="button button-dark discord-button"
            href={channel.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => unlock('gang')}
          >
            <DiscordMark /> Official Discord Server <ArrowUpRight size={18} />
          </a>
          <a className="text-link instagram-link" href={channel.instagramUrl} target="_blank" rel="noopener noreferrer">
            Follow on Instagram <ArrowUpRight size={16} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

const faqs: { question: string; answer: ReactNode }[] = [
  {
    question: 'What content does KaaliChamkadad create?',
    answer:
      'High-energy Minecraft survival & modded challenges, Backrooms exploration series, spontaneous GTA V open-world roleplay, and occasional Valorant highlights. All delivered with signature dry humor and chaotic decision-making.',
  },
  {
    question: 'How active is the channel and upload schedule?',
    answer:
      'The channel has published 123 videos since launch on September 19, 2025, regularly producing both full-length YouTube productions and fast-paced YouTube Shorts.',
  },
  {
    question: 'How can I support the channel towards 1,000 subscribers?',
    answer: (
      <>
        Simply visit the{' '}
        <a href={channel.subscribeUrl} target="_blank" rel="noopener noreferrer" className="inline-link">official YouTube channel</a>{' '}
        and subscribe with notifications on. You can also track the real-time milestone bar in the Road to 1K section above.
      </>
    ),
  },
  {
    question: 'What features are available on this official hub?',
    answer:
      'Inline video screening with personal watch queues, the custom Flappy Bat arcade game, verifiable channel telemetry, interactive lore quiz, community challenge submission form, developer shell (Ctrl+K), and a downloadable verified fan pass.',
  },
];

function Questions() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section className="faq-section section-space" id="questions" aria-labelledby="faq-title">
      <div className="container faq-layout">
        <Reveal className="faq-intro">
          <p className="eyebrow section-eyebrow">FREQUENTLY ASKED</p>
          <h2 className="section-title" id="faq-title">
            QUESTIONS &<br />ANSWERS<span className="accent-text">.</span>
          </h2>
        </Reveal>
        <Reveal className="faq-list">
          {faqs.map((faq, index) => (
            <div className={`faq-item ${openIndex === index ? 'is-open' : ''}`} key={faq.question}>
              <h3>
                <button
                  id={`faq-question-${index}`}
                  className="faq-question"
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span>{faq.question}</span>
                  <Plus className="faq-icon" size={19} />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-question-${index}`}
                    className="faq-answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p>{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Brand />
            <p>Official creator portal for KaaliChamkadad. Created in India.</p>
          </div>
          <nav className="footer-socials" aria-label="Official Social Channels">
            <a href={channel.url} target="_blank" rel="noopener noreferrer">YouTube <ArrowUpRight size={14} /></a>
            <a href={channel.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram <ArrowUpRight size={14} /></a>
            <a href={channel.discordUrl} target="_blank" rel="noopener noreferrer">Discord <ArrowUpRight size={14} /></a>
          </nav>
          <a className="back-to-top" href="#home" aria-label="Back to top"><ArrowUp size={20} /></a>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} KaaliChamkadad. All rights reserved.</p>
          <p>Minecraft is a registered trademark of Mojang AB / Microsoft. This is an independent creator portfolio.</p>
        </div>
      </div>
    </footer>
  );
}

const shortcuts = [
  { keys: '/', action: 'Focus video vault search' },
  { keys: 'P', action: 'Play random signature upload' },
  { keys: 'C', action: 'Cycle lighting intensity' },
  { keys: 'T', action: 'Open developer terminal' },
  { keys: 'Ctrl K', action: 'Command palette shortcut' },
  { keys: 'Space', action: 'Flap controls in Flappy Bat arcade' },
  { keys: '?', action: 'Toggle keyboard reference modal' },
  { keys: 'Esc', action: 'Dismiss active modal or overlay' },
];

function ShortcutsOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

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
            className="advancements-panel shortcuts-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            <div className="advancements-head">
              <div>
                <p className="eyebrow"><span className="eyebrow-square" /> NAVIGATION SHORTCUTS</p>
                <h2 id="shortcuts-title">KEYBOARD CONTROL<span className="accent-text">.</span></h2>
                <p className="advancements-sub">Fast keyboard navigation for power users.</p>
              </div>
              <button className="icon-button" onClick={onClose} aria-label="Close shortcuts modal">
                <X size={22} />
              </button>
            </div>
            <ul className="shortcuts-list">
              {shortcuts.map((shortcut) => (
                <li key={shortcut.keys}>
                  <kbd>{shortcut.keys}</kbd>
                  <span>{shortcut.action}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type QueuePanelProps = {
  open: boolean;
  queue: Video[];
  onClose: () => void;
  onPlay: (video: Video) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
};

function QueuePanel({ open, queue, onClose, onPlay, onRemove, onClear }: QueuePanelProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

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
            className="advancements-panel queue-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="queue-title"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            <div className="advancements-head">
              <div>
                <p className="eyebrow"><span className="eyebrow-square" /> PERSONAL WATCH LIST</p>
                <h2 id="queue-title">WATCH QUEUE<span className="accent-text">.</span></h2>
                <p className="advancements-sub">
                  {queue.length === 0
                    ? 'No videos queued. Add videos using the "+" button on any video card.'
                    : `${queue.length} video${queue.length === 1 ? '' : 's'} queued for continuous playback.`}
                </p>
              </div>
              <button className="icon-button" onClick={onClose} aria-label="Close watch queue">
                <X size={22} />
              </button>
            </div>
            {queue.length > 0 && (
              <div className="queue-actions">
                <button
                  className="button button-lime button-small"
                  onClick={() => {
                    onPlay(queue[0]);
                    onClose();
                  }}
                >
                  <Play size={14} fill="currentColor" strokeWidth={0} /> Play All In Order
                </button>
                <button className="text-button" onClick={onClear}>
                  <Trash2 size={14} /> Clear List
                </button>
              </div>
            )}
            <ol className="queue-list">
              {queue.map((video, index) => (
                <li key={video.id} className="queue-item">
                  <span className="queue-index">{index + 1}</span>
                  <img src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`} alt="" loading="lazy" />
                  <div className="queue-item-text">
                    <strong>{video.title}</strong>
                    <span>{video.game} · {video.isShort ? 'Short' : 'Full Video'}</span>
                  </div>
                  <button
                    className="icon-button"
                    onClick={() => {
                      onPlay(video);
                      onClose();
                    }}
                    aria-label={`Play ${video.title}`}
                  >
                    <Play size={16} fill="currentColor" strokeWidth={0} />
                  </button>
                  <button className="icon-button" onClick={() => onRemove(video.id)} aria-label={`Remove ${video.title} from queue`}>
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ol>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Site() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const { chaos, setChaos, biome, setBiome } = useChaos();
  const [muted, setMuted] = useMuted();
  const { queue, ids, toggle, remove, clear } = useQueue();
  const { unlock } = useAdvancements();
  const konamiIndex = useRef(0);

  useEffect(() => {
    if (ids.length >= 3) unlock('collector');
  }, [ids.length, unlock]);

  const triggerSecret = useCallback(() => {
    unlock('secret');
    setBiome('end');
    setChaos(100);
    fireConfetti({ count: 260 });
    play('levelup');
  }, [unlock, setBiome, setChaos]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = Boolean(
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable),
      );

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setTerminalOpen(true);
        return;
      }
      if (typing) return;

      const expected = KONAMI[konamiIndex.current];
      if (event.key === expected || event.key.toLowerCase() === expected) {
        konamiIndex.current += 1;
        if (konamiIndex.current === KONAMI.length) {
          konamiIndex.current = 0;
          triggerSecret();
          return;
        }
      } else {
        konamiIndex.current = event.key === KONAMI[0] ? 1 : 0;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === '/') {
        event.preventDefault();
        document.getElementById('video-search-input')?.focus();
        document.getElementById('videos')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (event.key === '?') {
        event.preventDefault();
        setShortcutsOpen(true);
        return;
      }
      if (selectedVideo) return;
      const key = event.key.toLowerCase();
      if (key === 'p') setSelectedVideo(videos[Math.floor(Math.random() * videos.length)]);
      if (key === 'c') setChaos(chaos >= 100 ? 0 : Math.min(100, chaos + 25));
      if (key === 't') setTerminalOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chaos, setChaos, selectedVideo, triggerSecret]);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <BootScreen />
      <CursorTrail />
      <div className="cave-grain" aria-hidden="true" />
      <ScrollProgress />
      <Header
        chaos={chaos}
        muted={muted}
        onToggleMute={() => {
          setMuted(!muted);
          if (muted) window.setTimeout(() => play('tick'), 30);
        }}
        onOpenTerminal={() => setTerminalOpen(true)}
      />
      <main id="main-content">
        <Hero chaos={chaos} onPlay={setSelectedVideo} />
        <Ticker />
        <StatsStrip />
        <VideoLibrary onPlay={setSelectedVideo} queueIds={ids} onToggleQueue={toggle} />
        <FlappyBat chaos={chaos} />
        <RoadTo1K />
        <Story />
        <ChaosMeter chaos={chaos} setChaos={setChaos} biome={biome} setBiome={setBiome} />
        <Community />
        <QuotesCarousel onPlay={setSelectedVideo} />
        <Quiz />
        <ShareCard chaos={chaos} />
        <Questions />
        <IdeaForm />
      </main>
      <Footer />

      <BiomeWeather biome={biome} chaos={chaos} />

      <div className="hud-stack">
        <button className="shortcuts-hud" onClick={() => setShortcutsOpen(true)} aria-label="Open keyboard shortcuts">
          <Keyboard size={17} />
        </button>
        <button className="terminal-hud" onClick={() => setTerminalOpen(true)} aria-label="Open command terminal">
          <TerminalIcon size={17} />
        </button>
        {queue.length > 0 && (
          <button className="queue-hud" onClick={() => setQueueOpen(true)} aria-haspopup="dialog">
            <ListVideo size={15} /> Queue <strong>{queue.length}</strong>
          </button>
        )}
        <AdvancementsHUD />
      </div>

      <ShortcutsOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <QueuePanel
        open={queueOpen}
        queue={queue}
        onClose={() => setQueueOpen(false)}
        onPlay={setSelectedVideo}
        onRemove={remove}
        onClear={clear}
      />
      <Terminal
        open={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        onPlay={setSelectedVideo}
        chaos={chaos}
        setChaos={setChaos}
        biome={biome}
        setBiome={setBiome}
      />
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          queue={queue}
          onClose={() => setSelectedVideo(null)}
          onChange={setSelectedVideo}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AdvancementsProvider>
        <Site />
      </AdvancementsProvider>
    </MotionConfig>
  );
}
