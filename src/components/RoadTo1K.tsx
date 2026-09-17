import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, BadgeCheck, CalendarDays, Eye, Film, MapPin, Users } from 'lucide-react';
import { channel, formatIndian } from '../data/channel';
import { fireConfetti } from '../lib/confetti';
import { play } from '../lib/sound';
import { BatMark } from './Brand';
import { useChannelStats } from '../lib/useChannelStats';

const milestones = [100, 250, 500, 750, 1000];
const pad = (value: number) => String(value).padStart(2, '0');

function useCaveClock(joinedDate: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const start = new Date(`${joinedDate}T00:00:00+05:30`).getTime();
  const diff = Math.max(0, now - start);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

export function RoadTo1K() {
  const channelStats = useChannelStats();
  const clock = useCaveClock(channelStats.joined);
  const reduceMotion = useReducedMotion();
  const percent = Math.min(100, (channelStats.subscribers / channelStats.goal) * 100);
  const remaining = Math.max(0, channelStats.goal - channelStats.subscribers);
  const nextMilestone = milestones.find((value) => value > channelStats.subscribers) ?? channelStats.goal;

  function pledge() {
    window.open(channel.subscribeUrl, '_blank', 'noopener');
    fireConfetti({ count: 180 });
    play('levelup');
  }

  return (
    <section className="road-section section-space" id="road" aria-labelledby="road-title">
      <div className="container road-layout">
        <div className="id-card">
          <div className="id-card-head">
            <span>BAT GANG HQ · CHANNEL ID</span>
            <BatMark />
          </div>
          <div className="id-card-identity">
            <div className="id-card-avatar">
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
              <strong className="id-card-name">{channel.name}</strong>
              <span className="id-card-handle">{channel.handle}</span>
              <span className="id-verified"><BadgeCheck size={14} /> {channelStats.verification}</span>
            </div>
          </div>
          <dl className="id-rows">
            <div className="id-row"><dt><MapPin size={14} /> Based in</dt><dd>{channelStats.country}</dd></div>
            <div className="id-row"><dt><CalendarDays size={14} /> Joined</dt><dd>19 Sept 2025</dd></div>
            <div className="id-row"><dt><Film size={14} /> Videos</dt><dd>{channelStats.totalVideos}</dd></div>
            <div className="id-row"><dt><Eye size={14} /> Views</dt><dd>{formatIndian(channelStats.views)}</dd></div>
            <div className="id-row"><dt><Users size={14} /> Subscribers</dt><dd>{formatIndian(channelStats.subscribers)}</dd></div>
          </dl>
          <div className="id-clock">
            <span>CAVE OPEN FOR</span>
            <strong>
              {clock.days}<small>d</small> {pad(clock.hours)}<small>h</small> {pad(clock.minutes)}<small>m</small> {pad(clock.seconds)}<small>s</small>
            </strong>
          </div>
        </div>

        <div className="road-panel">
          <p className="eyebrow section-eyebrow">SMALL CHANNEL. BIG CAVE.</p>
          <h2 className="section-title" id="road-title">ROAD TO 1,000<span className="accent-text">.</span></h2>
          <div className="road-numbers">
            <span className="road-number">{formatIndian(channelStats.subscribers)}</span>
            <span className="road-remaining">
              <strong>{formatIndian(remaining)}</strong> to go. Next stop: {formatIndian(nextMilestone)}.
            </span>
          </div>
          <div
            className="road-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={channelStats.goal}
            aria-valuenow={channelStats.subscribers}
            aria-label="Subscribers towards 1,000"
          >
            <motion.span
              className="road-fill"
              initial={reduceMotion ? { width: `${percent}%` } : { width: 0 }}
              whileInView={{ width: `${percent}%` }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            />
            <span className="road-bat" style={{ left: `${percent}%` }} aria-hidden="true"><BatMark /></span>
          </div>
          <ol className="road-ticks">
            {milestones.map((value) => {
              const done = channelStats.subscribers >= value;
              const next = value === nextMilestone;
              return (
                <li
                  key={value}
                  className={`road-tick ${done ? 'is-done' : ''} ${next ? 'is-next' : ''}`}
                  style={{ left: `${(value / channelStats.goal) * 100}%` }}
                >
                  <span className="road-tick-mark" />
                  <span className="road-tick-label">{formatIndian(value)}</span>
                  <small>{done ? 'done' : next ? 'next' : ''}</small>
                </li>
              );
            })}
          </ol>
          <p className="road-copy">
            Every single subscriber on a channel this size is a real person who chose chaos. Be one of them and the bar moves. Simple as that.
          </p>
          <div className="road-actions">
            <button className="button button-lime" onClick={pledge}>
              Count me in <ArrowUpRight size={16} />
            </button>
            <span className="road-footnote">Numbers from the channel page, updated by hand. Not live, just honest.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
