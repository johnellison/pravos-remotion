# YouTube Publishing Guide for Pravos Focus Albums

## Overview

You have everything needed to publish weekly Pravos focus videos to YouTube:
- ✅ 10 full-album videos rendering (1920x1080, 16:9)
- ✅ Vertical shorts ready to render (1080x1920, 9:16)
- ✅ YouTube titles & descriptions drafted
- ✅ MRKTR has full YouTube publishing infrastructure

---

## Option 1: Manual YouTube Upload (Simple)

1. **Wait for renders to complete** (~2-5 hours for all 10 albums)
2. **Go to YouTube Studio**: https://studio.youtube.com
3. **Upload videos manually**:
   - Use titles/descriptions from `youtube-content.md`
   - Set privacy to "Scheduled" for weekly releases
   - Add album art as custom thumbnail
   - Category: Music (10)
   - Add videos to "Pravos Focus Sessions" playlist

**Pros**: Simple, no code, full control
**Cons**: Manual work, can't automate scheduling

---

## Option 2: Use MRKTR for Automated Publishing (Advanced)

MRKTR already has YouTube publishing built in. Here's how to use it:

### Step 1: Set Up YouTube OAuth in MRKTR

Add to `/Users/iamjohndass/Sites/mrktr/.env.local`:

```bash
YOUTUBE_CLIENT_ID=your_google_client_id
YOUTUBE_CLIENT_SECRET=your_google_client_secret  
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/auth/youtube/callback
```

**Get credentials:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add redirect URI: `http://localhost:3000/api/auth/youtube/callback`
4. Enable YouTube Data API v3

### Step 2: Create YouTube OAuth Routes in MRKTR

**Create:** `/Users/iamjohndass/Sites/mrktr/src/app/api/auth/youtube/redirect/route.ts`

```typescript
import { YouTubeConnector } from '@/lib/services/platforms/youtube';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectUri = searchParams.get('redirect_uri') || 
    `${request.nextUrl.origin}/api/auth/youtube/callback`;
  
  const connector = new YouTubeConnector();
  const authUrl = connector.getAuthUrl(redirectUri);
  
  return NextResponse.redirect(authUrl);
}
```

**Create:** `/Users/iamjohndass/Sites/mrktr/src/app/api/auth/youtube/callback/route.ts`

```typescript
import { YouTubeConnector } from '@/lib/services/platforms/youtube';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }
  
  const connector = new YouTubeConnector();
  const redirectUri = `${request.nextUrl.origin}/api/auth/youtube/callback`;
  
  try {
    const credentials = await connector.exchangeCodeForToken(code, redirectUri);
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await supabase
      .from('platform_connections')
      .upsert({
        user_id: user.id,
        platform: 'youtube',
        access_token: credentials.accessToken,
        refresh_token: credentials.refreshToken,
        expires_at: credentials.expiresAt,
      });
    
    return NextResponse.redirect(`${request.nextUrl.origin}/dashboard?youtube_connected=true`);
  } catch (error) {
    console.error('YouTube OAuth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
```

### Step 3: Create Publishing Script

**Create:** `/Users/iamjohndass/Sites/pravos-remotion/publish-to-youtube.ts`

```typescript
import { YouTubeConnector } from '../mrktr/src/lib/services/platforms/youtube';
import fs from 'fs';
import path from 'path';

const albums = [
  { slug: 'cognitive-bloom', week: 1 },
  { slug: 'neural-drift', week: 2 },
  { slug: 'deep-piano-focus', week: 3 },
  { slug: 'meditative-ambient', week: 4 },
  { slug: 'scripted-light', week: 5 },
  { slug: 'soulful-lounge', week: 6 },
  { slug: 'sufi-lofi', week: 7 },
  { slug: 'vibe-coding', week: 8 },
  { slug: 'relaxed-neo-classical', week: 9 },
  { slug: 'healing-handpan', week: 10 },
];

async function publishAlbum(albumSlug: string, scheduledDate: Date) {
  const connector = new YouTubeConnector();
  
  const credentials = {
    platform: 'youtube' as const,
    accessToken: process.env.YOUTUBE_ACCESS_TOKEN!,
    refreshToken: process.env.YOUTUBE_REFRESH_TOKEN!,
  };
  
  const videoPath = path.join(__dirname, 'out', `${albumSlug}-video.mp4`);
  const thumbnailPath = path.join(__dirname, 'out', `${albumSlug}-thumbnail.png`);
  
  const metadata = JSON.parse(
    fs.readFileSync(`./youtube-content-${albumSlug}.json`, 'utf-8')
  );
  
  const result = await connector.publish(credentials, videoPath, {
    title: metadata.title,
    description: metadata.description,
    tags: metadata.tags,
    privacyStatus: 'private',
    categoryId: '10',
    thumbnail: thumbnailPath,
  });
  
  console.log(`Published ${albumSlug}:`, result);
  return result;
}

async function main() {
  const startDate = new Date('2025-01-06');
  
  for (const album of albums) {
    const publishDate = new Date(startDate);
    publishDate.setDate(publishDate.getDate() + (album.week - 1) * 7);
    
    await publishAlbum(album.slug, publishDate);
  }
}

main();
```

---

## Option 3: Hybrid Approach (Recommended)

1. **Upload manually for first few weeks** to validate titles/descriptions
2. **Once proven, automate with MRKTR** for remaining albums
3. **Use YouTube's scheduled publishing** feature (built into YouTube Studio)

---

## Shorts Publishing

After full videos are live, render and publish shorts:

```bash
# Render all shorts (9:16)
npm run render:short -- --album="cognitive-bloom"
npm run render:short -- --album="neural-drift"
# ... etc
```

**Shorts best practices:**
- Upload 1-2 days after full video
- Cross-link in description: "Full 25-min version: [link]"
- Use #Shorts in title
- Keep title under 40 characters for mobile
- Vertical thumbnail (1080x1920)

---

## Weekly Schedule

| Week | Album | Publish Date | Short Date |
|------|-------|--------------|------------|
| 1 | Cognitive Bloom | Jan 6, 2025 | Jan 8, 2025 |
| 2 | Neural Drift | Jan 13, 2025 | Jan 15, 2025 |
| 3 | Deep Piano Focus | Jan 20, 2025 | Jan 22, 2025 |
| 4 | Meditative Ambient | Jan 27, 2025 | Jan 29, 2025 |
| 5 | Scripted Light | Feb 3, 2025 | Feb 5, 2025 |
| 6 | Soulful Lounge | Feb 10, 2025 | Feb 12, 2025 |
| 7 | Sufi Lofi | Feb 17, 2025 | Feb 19, 2025 |
| 8 | Vibe Coding | Feb 24, 2025 | Feb 26, 2025 |
| 9 | Relaxed Neo Classical | Mar 3, 2025 | Mar 5, 2025 |
| 10 | Healing Handpan | Mar 10, 2025 | Mar 12, 2025 |

---

## Current Status

✅ **Completed:**
- Full-album MP3s copied to pravos-remotion
- YouTube titles & descriptions drafted (`youtube-content.md`)
- Batch render running (10 albums, 16:9)
- Vertical shorts composition created (9:16)
- Test short rendering (cognitive-bloom-short.mp4)

⏳ **In Progress:**
- Batch render: ~2-5 hours remaining
- Short render: ~15-30 minutes

🎯 **Next Steps:**
1. Wait for renders to complete
2. Choose publishing approach (Manual vs MRKTR)
3. If MRKTR: Set up YouTube OAuth
4. Schedule first video for Jan 6
5. Render remaining shorts
6. Monitor performance and adjust titles/descriptions

---

## Files Reference

- **YouTube content**: `/Users/iamjohndass/Sites/pravos-remotion/youtube-content.md`
- **Rendered videos**: `/Users/iamjohndass/Sites/pravos-remotion/out/*-video.mp4`
- **Rendered shorts**: `/Users/iamjohndass/Sites/pravos-remotion/out/*-short.mp4`
- **Thumbnails**: `/Users/iamjohndass/Sites/pravos-remotion/out/*-thumbnail.png`
- **MRKTR YouTube code**: `/Users/iamjohndass/Sites/mrktr/src/lib/services/platforms/youtube.ts`
