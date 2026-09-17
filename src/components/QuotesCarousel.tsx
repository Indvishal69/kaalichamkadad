import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Quote } from 'lucide-react';
import { quotes, videos, type Video } from '../data/channel';

export function QuotesCarousel({ onPlay }: { onPlay: (video: Video) => void }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);

  const go = (direction: 1 | -1) => {
    setIndex((current) => (current + direction + quotes.length) % quotes.length);
  };

  useEffect(() => {
    if (paused) return;
    timer.current = window.setInterval(() => {
      setIndex((current) => (current + 1) % quotes.length);
    }, 5600);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [paused]);

  const quote = quotes[index];
  const video = videos.find((item) => item.id === quote.videoId);

  return (
    <section className="quotes-section section-space" id="quotes" aria-labelledby="quotes-title">
      <div className="container">
        <div className="quotes-head">
          <div>
            <p className="eyebrow section-eyebrow">WORD FOR WORD, WE SWEAR</p>
            <h2 className="section-title" id="quotes-title">ACTUAL CHANNEL QUOTES<span className="accent-text">.</span></h2>
          </div>
          <div className="quotes-controls">
            <button className="icon-button quote-arrow" onClick={() => go(-1)} aria-label="Previous quote">
              <ChevronLeft size={22} />
            </button>
            <button className="icon-button quote-arrow" onClick={() => go(1)} aria-label="Next quote">
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        <div
          className="quotes-stage"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') go(1);
            if (event.key === 'ArrowLeft') go(-1);
          }}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label="Quotes from the channel"
          aria-live="polite"
        >
          <Quote className="quotes-mark" size={70} strokeWidth={1} aria-hidden="true" />
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={index}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.34 }}
            >
              <p className="quotes-text">{quote.text}</p>
              <footer className="quotes-footer">
                <span>{quote.source}</span>
                {video && (
                  <button className="text-link quotes-play" onClick={() => onPlay(video)}>
                    <Play size={14} fill="currentColor" strokeWidth={0} /> Watch this one
                  </button>
                )}
              </footer>
            </motion.blockquote>
          </AnimatePresence>
          <div className="quotes-dots" role="tablist" aria-label="Choose a quote">
            {quotes.map((item, dotIndex) => (
              <button
                key={item.text}
                role="tab"
                aria-selected={dotIndex === index}
                aria-label={`Quote ${dotIndex + 1}`}
                className={`quote-dot ${dotIndex === index ? 'is-active' : ''}`}
                onClick={() => setIndex(dotIndex)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
