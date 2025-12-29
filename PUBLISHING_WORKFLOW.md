# Pravos YouTube Publishing Workflow

Complete guide for publishing Pravos focus music videos to YouTube.

---

## Overview

You have:
- ✅ 10 full-album videos (16:9, 1920x1080)
- ✅ 10 vertical shorts ready (9:16, 1080x1920)  
- ✅ YouTube titles & descriptions (in `youtube-metadata/`)
- ✅ YouTube OAuth credentials configured
- ✅ Publishing scripts ready

---

## Step 1: Authorize YouTube Access

**First time only** - get YouTube API access:

```bash
cd /Users/iamjohndass/Sites/pravos-remotion
npm run youtube:auth
```

This will:
1. Open a browser to authorize the app
2. Ask you to copy the redirect URL
3. Save credentials to `.youtube-tokens.json`

**What to do:**
- Click the authorization link
- Sign in with your YouTube channel account
- Click "Allow"
- Copy the ENTIRE URL from your browser (starts with http://localhost:3000...)
- Paste it into the terminal

Credentials are saved and will auto-refresh. You only need to do this once.

---

## Step 2: Test Publishing (Recommended)

Test with ONE video before publishing all:

```bash
npm run youtube:publish:test
```

This publishes **cognitive-bloom** as **PRIVATE**. 

**Check:**
1. Go to https://studio.youtube.com
2. Find the video (it'll be private)
3. Verify title, description, tags, thumbnail look correct
4. Delete if needed, or keep and schedule it

---

## Step 3: Batch Publish All Videos

Once test looks good:

```bash
npm run youtube:publish:all
```

This will:
- Upload all 10 videos as **PRIVATE**
- Add custom thumbnails
- Wait 5 seconds between uploads
- Save results to `published-videos.json`

**Time:** ~10-15 minutes for all videos

**Output:**
```
Week 1: Cognitive Bloom
  https://www.youtube.com/watch?v=VIDEO_ID

Week 2: Neural Drift
  https://www.youtube.com/watch?v=VIDEO_ID

... etc
```

---

## Step 4: Schedule Weekly Releases

After batch upload, schedule them in YouTube Studio:

1. Go to https://studio.youtube.com/content
2. For each video:
   - Click the video
   - Click "Visibility" (bottom left)
   - Select "Schedule"
   - Set date/time (see schedule below)
   - Click "Schedule"

**Publishing Schedule:**

| Week | Album | Date | Time (PST) |
|------|-------|------|-----------|
| 1 | Cognitive Bloom | Jan 6, 2025 | 9:00 AM |
| 2 | Neural Drift | Jan 13, 2025 | 9:00 AM |
| 3 | Deep Piano Focus | Jan 20, 2025 | 9:00 AM |
| 4 | Meditative Ambient | Jan 27, 2025 | 9:00 AM |
| 5 | Scripted Light | Feb 3, 2025 | 9:00 AM |
| 6 | Soulful Lounge | Feb 10, 2025 | 9:00 AM |
| 7 | Sufi Lofi | Feb 17, 2025 | 9:00 AM |
| 8 | Vibe Coding | Feb 24, 2025 | 9:00 AM |
| 9 | Relaxed Neo Classical | Mar 3, 2025 | 9:00 AM |
| 10 | Healing Handpan | Mar 10, 2025 | 9:00 AM |

---

## Step 5: Shorts (Optional)

After full videos are live, publish shorts:

**Render shorts:**
```bash
npm run render:short -- --album="cognitive-bloom"
npm run render:short -- --album="neural-drift"
# ... etc for all albums
```

**Publish shorts:**
```bash
npm run youtube:publish cognitive-bloom-short
```

**Best practices for shorts:**
- Upload 1-2 days after full video goes live
- Add #Shorts to title
- In description, link to full 25-min version
- Keep vertical (9:16)

---

## Commands Reference

| Command | What It Does |
|---------|--------------|
| `npm run youtube:auth` | Authorize YouTube API access (one-time) |
| `npm run youtube:publish:test` | Upload cognitive-bloom only (test) |
| `npm run youtube:publish:all` | Upload all 10 videos as private |
| `npm run youtube:publish <album-slug>` | Upload single album |

**Album slugs:**
- `cognitive-bloom`
- `neural-drift`
- `deep-piano-focus`
- `meditative-ambient`
- `scripted-light`
- `soulful-lounge`
- `sufi-lofi`
- `vibe-coding`
- `relaxed-neo-classical`
- `healing-handpan`

---

## Troubleshooting

### "Invalid YouTube URL"
The authorization URL changed. Copy the ENTIRE redirect URL, including `code=` and all parameters.

### "Quota exceeded"
YouTube API has daily quotas. Wait 24 hours or request quota increase:
https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas

### "Video not found"
Make sure renders completed:
```bash
ls -lh out/*-video.mp4
```

### "Thumbnail upload failed"
Thumbnails must be:
- PNG or JPG
- Under 2MB
- At least 640x360px

---

## Files Reference

- **Metadata**: `/youtube-metadata/*.json` - Titles, descriptions, tags
- **Videos**: `/out/*-video.mp4` - Rendered full videos (16:9)
- **Shorts**: `/out/*-short.mp4` - Rendered vertical videos (9:16)
- **Thumbnails**: `/out/*-thumbnail.png` - Custom thumbnails
- **Tokens**: `/.youtube-tokens.json` - OAuth credentials (gitignored)
- **Report**: `/published-videos.json` - Publishing results

---

## Next Steps After Publishing

1. **Monitor Performance**
   - Check YouTube Analytics after 1-2 weeks
   - Note which albums get most engagement
   - Adjust titles/thumbnails if needed

2. **Cross-Promote**
   - Share on Twitter, LinkedIn
   - Add to pravos.xyz website
   - Email subscribers

3. **Create Playlist**
   - Collect all videos in "Pravos Focus Sessions" playlist
   - Link in video descriptions

4. **Shorts Strategy**
   - Post shorts 1-2 days after full videos
   - Cross-link between shorts and full videos
   - Use #Shorts, #FocusMusic, #Pravos

---

## Current Status

✅ **Ready:**
- YouTube OAuth configured
- Metadata created (10 albums)
- Publishing scripts tested
- Batch render running

⏳ **Waiting:**
- Batch render to complete (~1-2 hours remaining)

🎯 **Next Action:**
Run `npm run youtube:auth` to authorize, then test with cognitive-bloom.
