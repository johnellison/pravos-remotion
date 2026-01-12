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
    videoDate: '2026-01-12T09:00:00-08:00', // Monday Jan 12 - PUBLISHED!
    shortSlug: 'scripted-light',
    shortDate: '2026-01-13T09:00:00-08:00', // Tuesday Jan 13
    published: { video: true, short: false }
  },
  {
    week: 2,
    videoSlug: 'deep-piano-focus',
    videoDate: '2026-01-19T09:00:00-08:00', // Monday Jan 19
    shortSlug: 'soulful-lounge',
    shortDate: '2026-01-20T09:00:00-08:00', // Tuesday Jan 20
    published: { video: false, short: false }
  },
  {
    week: 3,
    videoSlug: 'meditative-ambient',
    videoDate: '2026-01-26T09:00:00-08:00', // Monday Jan 26
    shortSlug: 'sufi-lofi',
    shortDate: '2026-01-27T09:00:00-08:00', // Tuesday Jan 27
    published: { video: false, short: false }
  },
  {
    week: 4,
    videoSlug: 'scripted-light',
    videoDate: '2026-02-02T09:00:00-08:00', // Monday Feb 2
    shortSlug: 'vibe-coding',
    shortDate: '2026-02-03T09:00:00-08:00', // Tuesday Feb 3
    published: { video: false, short: false }
  },
  {
    week: 5,
    videoSlug: 'soulful-lounge',
    videoDate: '2026-02-09T09:00:00-08:00', // Monday Feb 9
    shortSlug: 'relaxed-neo-classical',
    shortDate: '2026-02-10T09:00:00-08:00', // Tuesday Feb 10
    published: { video: false, short: false }
  },
  {
    week: 6,
    videoSlug: 'sufi-lofi',
    videoDate: '2026-02-16T09:00:00-08:00', // Monday Feb 16
    shortSlug: 'healing-handpan',
    shortDate: '2026-02-17T09:00:00-08:00', // Tuesday Feb 17
    published: { video: false, short: false }
  },
  {
    week: 7,
    videoSlug: 'vibe-coding',
    videoDate: '2026-02-23T09:00:00-08:00', // Monday Feb 23
    shortSlug: 'cognitive-bloom', // Already published, but in schedule for completeness
    shortDate: '2026-02-24T09:00:00-08:00', // Tuesday Feb 24
    published: { video: false, short: true }
  },
  {
    week: 8,
    videoSlug: 'relaxed-neo-classical',
    videoDate: '2026-03-02T09:00:00-08:00', // Monday Mar 2
    shortSlug: 'neural-drift', // Already published
    shortDate: '2026-03-03T09:00:00-08:00', // Tuesday Mar 3
    published: { video: false, short: true }
  },
  {
    week: 9,
    videoSlug: 'healing-handpan',
    videoDate: '2026-03-09T09:00:00-08:00', // Monday Mar 9
    shortSlug: 'deep-piano-focus', // Already published
    shortDate: '2026-03-10T09:00:00-08:00', // Tuesday Mar 10
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
