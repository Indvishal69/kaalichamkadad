import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, X } from 'lucide-react';
import { channel, formatDate, type Video, videos, videoUrl } from '../data/channel';
import { BatMark } from './Brand';
import { useAdvancements } from '../lib/advancements';

type VideoPlayerProps = {
  video: Video;
  queue?: Video[];
  onClose: () => void;
  onChange: (video: Video) => void;
};

export function VideoPlayer({ video, queue = [], onClose, onChange }: VideoPlayerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [showCopyFallback, setShowCopyFallback] = useState(false);
  const currentIndex = videos.findIndex((item) => item.id === video.id);
  const queueIndex = queue.findIndex((item) => item.id === video.id);
  const queuedNext = queueIndex >= 0 && queueIndex < queue.length - 1 ? queue[queueIndex + 1] : null;
  const nextVideo = queuedNext ?? videos[(currentIndex + 1) % videos.length];
  const { unlock } = useAdvancements();

  useEffect(() => {
    unlock('explorer');
  }, [unlock]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    setCopied(false);
    setShowCopyFallback(false);
  }, [video.id]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2400);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(videoUrl(video));
      setCopied(true);
      setShowCopyFallback(false);
    } catch {
      setShowCopyFallback(true);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="video-dialog"
      aria-labelledby="player-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        className="player-shell"
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        <div className="player-topbar">
          <span className="player-channel"><BatMark /> NOW PLAYING IN THE CAVE</span>
          <button className="icon-button" onClick={onClose} aria-label="Close video player" autoFocus>
            <X size={22} />
          </button>
        </div>
        <div className="player-embed">
          <iframe
            key={video.id}
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1&origin=${encodeURIComponent(window.location.origin)}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <div className="player-details">
          <div className="player-meta">
            <span className="accent-text">{video.game}</span>
            <span className="small-dot" />
            <span>{video.isShort ? 'YouTube Short' : 'Full video'}</span>
            <span className="small-dot" />
            <time dateTime={video.published}>{formatDate(video.published)}</time>
            {queueIndex >= 0 && (
              <>
                <span className="small-dot" />
                <span>Queue {queueIndex + 1} of {queue.length}</span>
              </>
            )}
          </div>
          <h2 id="player-title">{video.title}</h2>
          <p className="player-description">{video.description}</p>
          <div className="player-actions">
            <a className="button button-lime button-small" href={videoUrl(video)} target="_blank" rel="noopener noreferrer">
              Watch on YouTube <ArrowUpRight size={16} />
            </a>
            <button className="text-button copy-button" onClick={copyLink}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span aria-live="polite">{copied ? 'Link copied' : 'Copy link'}</span>
            </button>
            <a className="text-button player-subscribe" href={channel.subscribeUrl} target="_blank" rel="noopener noreferrer">
              Subscribe <ArrowUpRight size={15} />
            </a>
          </div>
          {showCopyFallback && (
            <label className="copy-fallback">
              Select and copy this video link:
              <input value={videoUrl(video)} readOnly onFocus={(event) => event.target.select()} autoFocus />
            </label>
          )}
          <p className="player-help">
            Player unavailable? Use "Watch on YouTube" to open the original video.
          </p>
          <div className="player-next-row">
            <button
              className="icon-button previous-video"
              disabled={currentIndex === 0}
              onClick={() => onChange(videos[currentIndex - 1])}
              aria-label="Play previous video"
            >
              <ArrowLeft size={20} />
            </button>
            <button className="next-video" onClick={() => onChange(nextVideo)}>
              <span>
                <small>{queuedNext ? 'NEXT IN YOUR QUEUE' : 'KEEP THE CHAOS GOING'}</small>
                <span>{nextVideo.title}</span>
              </span>
              <ArrowRight size={23} />
            </button>
          </div>
        </div>
      </motion.div>
    </dialog>
  );
}
