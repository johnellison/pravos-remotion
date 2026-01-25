# Instagram Story Publisher for Pravos Focus Music

Automated system for publishing 9x16 Instagram stories every 3 days using the Late API.

## Positioning

**"Focus music for vibe coding"** - All stories include this positioning with a CTA to listen at pravos.xyz.

## Features

- **Automatic scheduling**: Publishes every 3 days at 9:05 AM PST
- **Round-robin rotation**: Cycles through all 10 focus music albums
- **Tracking**: Maintains published history in `.instagram-stories-tracker.json`
- **Caption template**: Consistent CTA to pravos.xyz
- **Logging**: Detailed logs saved to `logs/instagram-story-YYYY-MM-DD.log`

## Available Albums

1. cognitive-bloom
2. deep-piano-focus
3. healing-handpan
4. meditative-ambient
5. neural-drift
6. relaxed-neo-classical
7. scripted-light
8. soulful-lounge
9. sufi-lofi
10. vibe-coding

## Setup

### Prerequisites

1. **Story files must exist** in `out/` directory:
   ```bash
   npm run render:batch:stories
   ```

2. **Instagram account connected** via Late API at https://saraven.app/channels

3. **Late API credentials** configured in `saraven-app/.env.local`:
   ```
   LATE_API_KEY=sk_xxx
   LATE_API_URL=https://getlate.dev/api/v1
   ```

### Installation

Run the installation script:

```bash
./install-instagram-story-cron.sh
```

This will:
- Install cron job to run every 3 days (days 1,4,7,10,13,16,19,22,25,28,31)
- Set execution time to 9:05 AM PST
- Create log directory structure

## Manual Testing

Test the publishing flow before enabling cron:

```bash
npm run instagram:publish:story
```

This will:
- Select the next album in rotation
- Upload the story video to Late API
- Create Instagram story post with positioning caption
- Update the tracker file
- Show next album to be published

## Caption Template

```
Focus music for vibe coding 🎹✨

Dive deep into your code with ambient textures designed to keep you in flow.

Keep listening at pravos.xyz 🎧
```

## File Structure

```
pravos-remotion/
├── scripts/
│   └── publish-instagram-story.ts    # Main publishing script
├── instagram-story-cron.sh               # Cron wrapper
├── install-instagram-story-cron.sh        # Installation script
├── logs/
│   └── instagram-story-YYYY-MM-DD.log  # Execution logs
└── .instagram-stories-tracker.json         # Published history
```

## Tracker File Format

```json
{
  "lastPublishedIndex": 0,
  "publishedStories": [
    {
      "albumSlug": "cognitive-bloom",
      "publishedAt": "2026-01-25T09:15:00.000Z",
      "postId": "6975de8f5b24e1de28b87a6d"
    }
  ]
}
```

## Troubleshooting

### "LATE_API_KEY not found in environment"

**Cause**: The script cannot find the Late API credentials

**Solution**: Ensure `LATE_API_KEY` is set in `~/Sites/saraven-app/.env.local`

### "No Instagram account connected via Late API"

**Cause**: Instagram account is not linked to your Late API profile

**Solution**:
1. Go to https://saraven.app/channels
2. Click "Connect" next to Instagram
3. Complete the OAuth flow
4. Verify account shows as active

### "Story file not found"

**Cause**: The rendered story video does not exist

**Solution**:
```bash
npm run render:batch:stories
```

### "Failed to upload media" or "Failed to create post"

**Cause**: Network issue, API rate limit, or invalid credentials

**Solution**:
1. Check internet connection
2. Verify `LATE_API_KEY` is valid
3. Check logs for specific error details:
   ```bash
   cat logs/instagram-story-$(date +%Y-%m-%d).log
   ```

### Cron job not running

**Cause**: Cron job not installed or system cron daemon not running

**Solution**:
```bash
# Check current crontab
crontab -l

# Restart cron daemon (macOS)
sudo launchctl unload /Library/LaunchDaemons/com.vix.cron.plist
sudo launchctl load /Library/LaunchDaemons/com.vix.cron.plist
```

## Log Management

Logs are automatically cleaned after 90 days.

Manual log cleanup:
```bash
# View recent logs
ls -lt logs/instagram-story-*.log | head -5

# Delete old logs
find logs/ -name "instagram-story-*.log" -mtime +90 -delete
```

## Monitoring

### Check recent activity

```bash
# View tracker file
cat .instagram-stories-tracker.json

# View latest log
tail -50 logs/instagram-story-$(date +%Y-%m-%d).log
```

### Verify Instagram stories

Check your Instagram account (@iamjohnellison) to confirm stories are publishing successfully.

## Uninstallation

Remove the cron job:

```bash
# Edit crontab
crontab -e

# Remove these lines:
# Pravos Instagram Story Publisher - Runs every 3 days at 9:05 AM PST
# 5 9 1,4,7,10,13,16,19,22,25,28,31 * * /Users/iamjohndass/Sites/pravos-remotion/instagram-story-cron.sh
```

## Next Steps

1. Test manual publishing: `npm run instagram:publish:story`
2. Verify Instagram account is connected at https://saraven.app/channels
3. Run installation script: `./install-instagram-story-cron.sh`
4. Monitor first scheduled run via logs
5. Verify stories appear on Instagram (@iamjohnellison)
