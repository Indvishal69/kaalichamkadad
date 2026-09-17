export const channel = {
  name: 'KaaliChamkadad',
  handle: '@KaaliChamkadad',
  url: 'https://www.youtube.com/@KaaliChamkadad',
  subscribeUrl: 'https://www.youtube.com/@KaaliChamkadad?sub_confirmation=1',
  discordUrl: 'https://discord.gg/UYXGrYZTrR',
  instagramUrl: 'https://www.instagram.com/kaalichamkadad/',
  startedOn: '2025-09-19',
  avatarUrl:
    'https://yt3.googleusercontent.com/X5uKwr_Cjd8adGxTO2Mv1kSydYApCm1FsUCyfPOL5GBzZT_Ws4wcAAHDUGjhYptNTEkCHj0p=s160-c-k-c0x00ffffff-no-rj',
};

/* Public numbers from the channel's About page. Update these by hand when they change. */
export const channelStats = {
  subscribers: 512,
  totalVideos: 123,
  views: 152804,
  country: 'India',
  joined: '2025-09-19',
  verification: 'Phone verified',
  goal: 1000,
};

export function formatIndian(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

export type Video = {
  id: string;
  title: string;
  game: 'Minecraft' | 'GTA V' | 'Valorant';
  published: string;
  isShort: boolean;
  description: string;
};

// Real uploads selected from the channel's public feed, not fabricated video data.
export const videos: Video[] = [
  {
    id: 'QKWgJaO5Qns',
    title: 'I Went to Jail and Started a War in GTA 5',
    game: 'GTA V',
    published: '2026-09-06',
    isShort: false,
    description:
      'I made one small mistake in GTA 5... And somehow it turned into a full-scale war. I had a plan. It was a terrible plan. Anyway, enjoy the chaos.',
  },
  {
    id: 'by1HFuiU0HA',
    title: 'Minecraft But Every Chunk Is RANDOM',
    game: 'Minecraft',
    published: '2026-08-22',
    isShort: false,
    description:
      'Every time I enter a new chunk, I have no idea what I am going to find. Random biomes, unexpected structures, and a Minecraft world that makes absolutely no sense.',
  },
  {
    id: '4OhAlM2oLqA',
    title: 'I Found The Backrooms While Mining In Minecraft...',
    game: 'Minecraft',
    published: '2026-08-27',
    isShort: true,
    description:
      'A little mining trip. A very unexpected discovery. Step into the Minecraft Backrooms with KaaliChamkadad.',
  },
  {
    id: 'dZ5fadD3lN8',
    title: 'Bro had one job',
    game: 'GTA V',
    published: '2026-09-08',
    isShort: true,
    description: 'One job. What could possibly go wrong? A quick dose of GTA V chaos.',
  },
  {
    id: 'obYlhd6EaCQ',
    title: 'Techno Gamerz found his competition',
    game: 'GTA V',
    published: '2026-09-08',
    isShort: true,
    description: 'Another completely reasonable day in Los Santos. Or not.',
  },
  {
    id: 'TOTTAfYyb7w',
    title: 'Just a normal day in GTA 5.',
    game: 'GTA V',
    published: '2026-09-07',
    isShort: true,
    description: 'The kind of normal that only happens in GTA V.',
  },
  {
    id: 'NxPJ8PHppFM',
    title: 'Yeah... that escalated quickly.',
    game: 'GTA V',
    published: '2026-09-07',
    isShort: true,
    description: 'A small decision, followed by a very large amount of chaos in GTA V.',
  },
  {
    id: 'rkUo6Pg0sZI',
    title: 'I Died... And Woke Up At The Beginning',
    game: 'Minecraft',
    published: '2026-09-03',
    isShort: true,
    description: 'The Minecraft Backrooms have a few more surprises waiting.',
  },
  {
    id: 'QdtJQklVyrs',
    title: 'Someone Left This For Me...',
    game: 'Minecraft',
    published: '2026-09-02',
    isShort: true,
    description: 'A strange discovery in the Backrooms. But who left it here?',
  },
  {
    id: 'a4hYIoSw2po',
    title: "I Found Something That Shouldn't Exist...",
    game: 'Minecraft',
    published: '2026-08-31',
    isShort: true,
    description: 'Some things in Minecraft are better left undiscovered. This might be one of them.',
  },
  {
    id: 'jYmZyiAPGwQ',
    title: 'I Found Someone Who Was Trapped Here...',
    game: 'Minecraft',
    published: '2026-08-30',
    isShort: true,
    description: 'It turns out I am not alone in the Minecraft Backrooms.',
  },
  {
    id: 'z5vWixd3AtM',
    title: 'Senpai Spider bro stop copying me',
    game: 'Minecraft',
    published: '2026-08-24',
    isShort: true,
    description: 'A little Minecraft, a little banter. You know the drill.',
  },
  {
    id: 'R2ER6SltVM4',
    title: 'After years of hard work, I finally got sponsored.',
    game: 'Minecraft',
    published: '2026-08-23',
    isShort: true,
    description: 'A very important moment in this completely legitimate career.',
  },
  {
    id: 'i4axXz6MHhE',
    title: 'All luck. No skill.',
    game: 'Valorant',
    published: '2026-08-20',
    isShort: true,
    description: 'Sometimes the best strategy in Valorant is not having one.',
  },
  {
    id: '2BK53EYFROc',
    title: 'I Think I Know Who Did It...',
    game: 'Minecraft',
    published: '2026-08-19',
    isShort: true,
    description:
      'I finally reached the last location... but I think I was looking for the wrong person all along.',
  },
];

export const categories = ['All videos', 'Minecraft', 'GTA V', 'Shorts'] as const;
export type Category = (typeof categories)[number];

export function filterVideos(category: Category, query: string): Video[] {
  const search = query.trim().toLowerCase();
  return videos.filter((video) => {
    const matchesCategory =
      category === 'All videos' ||
      (category === 'Shorts' ? video.isShort : video.game === category);
    const matchesQuery = `${video.title} ${video.game} ${video.description}`
      .toLowerCase()
      .includes(search);
    return matchesCategory && matchesQuery;
  });
}

export function videoUrl(video: Video): string {
  return `https://www.youtube.com/watch?v=${video.id}`;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`));
}

/* Derived, honest numbers — nothing invented. */
export const stats = {
  featured: videos.length,
  shorts: videos.filter((video) => video.isShort).length,
  games: new Set(videos.map((video) => video.game)).size,
  daysOfChaos: Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(`${channelStats.joined}T00:00:00+05:30`).getTime()) / 86_400_000,
    ),
  ),
};

/* Real titles and descriptions from the channel, word for word. */
export const quotes: { text: string; source: string; videoId: string }[] = [
  { text: 'All luck. No skill.', source: 'Valorant short', videoId: 'i4axXz6MHhE' },
  { text: 'Bro had one job.', source: 'GTA V short', videoId: 'dZ5fadD3lN8' },
  { text: 'I had a plan. It was a terrible plan.', source: 'GTA V video', videoId: 'QKWgJaO5Qns' },
  { text: 'Someone left this for me...', source: 'Minecraft short', videoId: 'QdtJQklVyrs' },
  {
    text: 'I think I was looking for the wrong person all along.',
    source: 'Minecraft short',
    videoId: '2BK53EYFROc',
  },
  {
    text: 'Subscribe before I make another terrible decision.',
    source: 'Every description, basically',
    videoId: 'by1HFuiU0HA',
  },
];

export const tickerPhrases = [
  'MINECRAFT',
  '512 SUBSCRIBERS',
  'GTA 5',
  '123 VIDEOS',
  'BACKROOMS',
  '1.5 LAKH VIEWS',
  'VALORANT',
  'MADE IN INDIA',
  'BAT GANG',
  'TERRIBLE PLANS',
  'ZERO SKILL',
  'FULL CHAOS',
  'ROAD TO 1K',
];

/* Every question is answerable from the channel's own public uploads. */
export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  note: string;
};

export const quizQuestions: QuizQuestion[] = [
  {
    question: 'While mining in Minecraft, what did KaaliChamkadad stumble into?',
    options: ['The Nether', 'The Backrooms', 'An abandoned mineshaft', "Herobrine's house"],
    answer: 1,
    note: 'Yes. He mined straight into the Backrooms. It only got stranger from there.',
  },
  {
    question: "What is the channel's official excuse for not getting a real job?",
    options: [
      'Making Minecraft videos',
      'Professional napping',
      'Backrooms tour guide',
      'Creeper diplomacy',
    ],
    answer: 0,
    note: '"I make Minecraft videos because apparently getting a real job was too difficult." Straight from the channel bio.',
  },
  {
    question: 'In GTA 5, he went to jail and started...',
    options: ['A farm', 'A podcast', 'A war', 'A taxi business'],
    answer: 2,
    note: 'One small mistake turned into a full-scale war. As it does.',
  },
  {
    question: 'In "Minecraft But Every Chunk Is RANDOM", what happens in every new chunk?',
    options: [
      'The game crashes',
      'Something completely unexpected',
      'Everything is dirt',
      'Time rewinds',
    ],
    answer: 1,
    note: 'Random biomes, random structures, zero logic. A cursed world.',
  },
  {
    question: 'After years of hard work, what did he finally get?',
    options: ['A real job', 'Sponsored', 'A diamond hoe', 'Banned'],
    answer: 1,
    note: 'A genuinely emotional moment in this completely legitimate career.',
  },
  {
    question: 'Which of these is a real video title on the channel?',
    options: ['All luck. No skill.', 'My 1000 IQ Play', 'I Am The Best', 'Sleeping In Minecraft'],
    answer: 0,
    note: 'Straight from the Valorant short. Still the most honest title on YouTube.',
  },
  {
    question: 'Where is KaaliChamkadad based, according to the channel page?',
    options: ['Canada', 'India', 'The Backrooms', 'Australia'],
    answer: 1,
    note: 'India. Phone verified, joined 19 September 2025, and already past 1.5 lakh views.',
  },
];

/* Parts for the terrible idea generator. Mix, match, regret. */
export const ideaParts = {
  triggers: [
    'every time I mine a block',
    'every time I take damage',
    'every 30 seconds',
    'every time I jump',
    'every time a mob spawns',
    'every time I craft something',
    'every time I open a chest',
    'every time I say "bro"',
    'every time I look at the sun',
  ],
  effects: [
    'a creeper spawns behind me',
    'the world gets one block smaller',
    'gravity flips',
    'I get a random enchant',
    'the sun gets angrier',
    'my inventory shuffles',
    'a random chunk turns into the Backrooms',
    'lava rains for five seconds',
    'a Senpai Spider copies me',
    'the game speed doubles',
    'my hotbar becomes all TNT',
  ],
  twists: [
    'and I have ten minutes to beat the Ender Dragon',
    'but I can only use a wooden hoe',
    'while the Bat Gang votes on my next move',
    'and TNT is the only block I can place',
    'but every death restarts the video',
    'in hardcore mode, obviously',
    'but I am not allowed to look down',
    'and the video ends the moment I say "chill"',
  ],
} as const;
