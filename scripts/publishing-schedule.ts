/**
 * Publishing Schedule for Pravos YouTube Content
 *
 * Strategy:
 * - 1 full video every Monday at 9 AM PST
 * - 1 short 1-2 days after the video (Tuesday/Wednesday)
 */

export interface ScheduledContent {
  week: number;
  videoSlug: string;
  videoDate: string;
  shortSlug: string;
  shortDate: string;
  published: {
    video: boolean;
    short: boolean;
  };
}

export const PUBLISHING_SCHEDULE: ScheduledContent[] = [
  {
    week: 1,
    videoSlug: 'cognitive-bloom',
    videoDate: '2026-01-13T09:00:00-08:00', // Monday
    shortSlug: 'scripted-light',
    shortDate: '2026-01-14T09:00:00-08:00', // Tuesday
    published: { video: false, short: false }
  },
  {
    week: 2,
    videoSlug: 'deep-piano-focus',
    videoDate: '2026-01-20T09:00:00-08:00',
    shortSlug: 'soulful-lounge',
    shortDate: '2026-01-21T09:00:00-08:00',
    published: { video: false, short: false }
  },
  {
    week: 3,
    videoSlug: 'meditative-ambient',
    videoDate: '2026-01-27T09:00:00-08:00',
    shortSlug: 'sufi-lofi',
    shortDate: '2026-01-28T09:00:00-08:00',
    published: { video: false, short: false }
  },
  {
    week: 4,
    videoSlug: 'scripted-light',
    videoDate: '2026-02-03T09:00:00-08:00',
    shortSlug: 'vibe-coding',
    shortDate: '2026-02-04T09:00:00-08:00',
    published: { video: false, short: false }
  },
  {
    week: 5,
    videoSlug: 'soulful-lounge',
    videoDate: '2026-02-10T09:00:00-08:00',
    shortSlug: 'relaxed-neo-classical',
    shortDate: '2026-02-11T09:00:00-08:00',
    published: { video: false, short: false }
  },
  {
    week: 6,
    videoSlug: 'sufi-lofi',
    videoDate: '2026-02-17T09:00:00-08:00',
    shortSlug: 'healing-handpan',
    shortDate: '2026-02-18T09:00:00-08:00',
    published: { video: false, short: false }
  },
  {
    week: 7,
    videoSlug: 'vibe-coding',
    videoDate: '2026-02-24T09:00:00-08:00',
    shortSlug: 'cognitive-bloom', // Already published, but in schedule for completeness
    shortDate: '2026-02-25T09:00:00-08:00',
    published: { video: false, short: true }
  },
  {
    week: 8,
    videoSlug: 'relaxed-neo-classical',
    videoDate: '2026-03-03T09:00:00-08:00',
    shortSlug: 'neural-drift', // Already published
    shortDate: '2026-03-04T09:00:00-08:00',
    published: { video: false, short: true }
  },
  {
    week: 9,
    videoSlug: 'healing-handpan',
    videoDate: '2026-03-10T09:00:00-08:00',
    shortSlug: 'deep-piano-focus', // Already published
    shortDate: '2026-03-11T09:00:00-08:00',
    published: { video: false, short: true }
  }
];

export function getNextScheduledItem(): { type: 'video' | 'short', slug: string, date: string } | null {
  const now = new Date();

  for (const week of PUBLISHING_SCHEDULE) {
    const videoDate = new Date(week.videoDate);
    const shortDate = new Date(week.shortDate);

    if (!week.published.video && videoDate > now) {
      return { type: 'video', slug: week.videoSlug, date: week.videoDate };
    }

    if (!week.published.short && shortDate > now) {
      return { type: 'short', slug: week.shortSlug, date: week.shortDate };
    }
  }

  return null;
}

export function getItemsDueToday(): Array<{ type: 'video' | 'short', slug: string, date: string }> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const dueItems: Array<{ type: 'video' | 'short', slug: string, date: string }> = [];

  for (const week of PUBLISHING_SCHEDULE) {
    const videoDate = new Date(week.videoDate);
    const shortDate = new Date(week.shortDate);

    if (!week.published.video && videoDate >= todayStart && videoDate < todayEnd) {
      dueItems.push({ type: 'video', slug: week.videoSlug, date: week.videoDate });
    }

    if (!week.published.short && shortDate >= todayStart && shortDate < todayEnd) {
      dueItems.push({ type: 'short', slug: week.shortSlug, date: week.shortDate });
    }
  }

  return dueItems;
}
