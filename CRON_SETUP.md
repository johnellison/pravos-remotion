# Pravos Auto-Publisher Cron Setup

## Overview

This system automatically publishes Pravos videos and shorts to YouTube on schedule.

**Schedule:**
- Videos: Every Monday at 9:00 AM PST
- Shorts: Every Tuesday at 9:00 AM PST (1 day after video)

**Automation:**
- Cron job runs daily at 9:05 AM to check for scheduled content
- Publishes to YouTube if content is due
- Sends email notifications via Resend
- Logs all activity to `logs/auto-publish-YYYY-MM-DD.log`

---

## Installation

### 1. Test the automation script

```bash
cd /Users/iamjohndass/Sites/pravos-remotion

# Test email notifications
npm run notify:test

# Test auto-publish (dry run - checks schedule)
npm run youtube:auto-publish
```

### 2. Set up the cron job

**Option A: Automatic (Recommended)**

Run this command to install the cron job:

```bash
# Add cron job to run daily at 9:05 AM
(crontab -l 2>/dev/null; echo "# Pravos Auto-Publisher - Runs daily at 9:05 AM PST") | crontab -
(crontab -l 2>/dev/null; echo "5 9 * * * /Users/iamjohndass/Sites/pravos-remotion/auto-publish-cron.sh") | crontab -
```

**Option B: Manual**

1. Open crontab editor:
   ```bash
   crontab -e
   ```

2. Add this line:
   ```
   # Pravos Auto-Publisher - Runs daily at 9:05 AM PST
   5 9 * * * /Users/iamjohndass/Sites/pravos-remotion/auto-publish-cron.sh
   ```

3. Save and exit (`:wq` in vim)

### 3. Verify cron job is installed

```bash
crontab -l
```

You should see:
```
# Pravos Auto-Publisher - Runs daily at 9:05 AM PST
5 9 * * * /Users/iamjohndass/Sites/pravos-remotion/auto-publish-cron.sh
```

---

## How It Works

### Daily Flow

1. **9:05 AM**: Cron triggers `auto-publish-cron.sh`
2. **Script checks** `scripts/publishing-schedule.ts` for items due today
3. **If content is scheduled:**
   - Publishes video/short to YouTube
   - Updates `published-tracking.json`
   - Sends success email notification
   - Logs to `logs/auto-publish-YYYY-MM-DD.log`
4. **If nothing scheduled:**
   - Logs "No content scheduled for today"
   - Exits quietly

### Publishing Schedule

The complete schedule is defined in `scripts/publishing-schedule.ts`:

| Week | Video (Monday) | Short (Tuesday) |
|------|----------------|-----------------|
| 1 | Cognitive Bloom (Jan 13) | Scripted Light (Jan 14) |
| 2 | Deep Piano Focus (Jan 20) | Soulful Lounge (Jan 21) |
| 3 | Meditative Ambient (Jan 27) | Sufi Lofi (Jan 28) |
| 4 | Scripted Light (Feb 3) | Vibe Coding (Feb 4) |
| 5 | Soulful Lounge (Feb 10) | Relaxed Neo Classical (Feb 11) |
| 6 | Sufi Lofi (Feb 17) | Healing Handpan (Feb 18) |
| 7 | Vibe Coding (Feb 24) | *(skip - already published)* |
| 8 | Relaxed Neo Classical (Mar 3) | *(skip - already published)* |
| 9 | Healing Handpan (Mar 10) | *(skip - already published)* |

---

## Email Notifications

You'll receive emails for:
- ✅ **Success**: When content is published successfully
- ❌ **Error**: If publishing fails for any reason

Emails include:
- Video title and type (video/short)
- YouTube video ID and URL
- Timestamp
- Direct link to YouTube Studio

**Notification email:** `john@pravos.xyz`
**Update in:** `.env` file (`NOTIFICATION_EMAIL`)

---

## Manual Overrides

### Publish specific content manually

```bash
# Publish a video
npm run youtube:publish -- --album="cognitive-bloom"

# Publish a short
npm run youtube:publish:short -- --album="cognitive-bloom"
```

### Check what's scheduled for today

```bash
npm run youtube:auto-publish
```

### View logs

```bash
# Today's log
cat logs/auto-publish-$(date +%Y-%m-%d).log

# Recent logs
ls -lt logs/
```

---

## Monitoring

### Check cron status

```bash
# View installed cron jobs
crontab -l

# Test cron script manually
./auto-publish-cron.sh

# Check recent logs
tail -f logs/auto-publish-$(date +%Y-%m-%d).log
```

### Track published content

```bash
# View all published content
cat published-tracking.json | jq

# Count published videos
cat published-tracking.json | jq '.videos | length'

# Count published shorts
cat published-tracking.json | jq '.shorts | length'
```

---

## Troubleshooting

### Cron job not running

1. **Check cron is running:**
   ```bash
   ps aux | grep cron
   ```

2. **Check script permissions:**
   ```bash
   ls -la auto-publish-cron.sh
   # Should show: -rwxr-xr-x (executable)
   ```

3. **Test script manually:**
   ```bash
   ./auto-publish-cron.sh
   cat logs/auto-publish-$(date +%Y-%m-%d).log
   ```

### Notifications not sending

1. **Check Resend API key:**
   ```bash
   grep RESEND_API_KEY .env
   ```

2. **Test notification manually:**
   ```bash
   npm run notify:test
   ```

3. **Check email address:**
   ```bash
   grep NOTIFICATION_EMAIL .env
   ```

### YouTube API errors

1. **Re-authorize YouTube:**
   ```bash
   npm run youtube:auth
   ```

2. **Check token file exists:**
   ```bash
   ls -la .youtube-tokens.json
   ```

3. **Check API quota:**
   - Visit: https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas
   - YouTube API has daily limits (10,000 quota units/day)
   - Each upload uses ~1,600 units

---

## Maintenance

### Disable automation temporarily

```bash
# Remove cron job
crontab -l | grep -v "auto-publish-cron.sh" | crontab -
```

### Re-enable automation

```bash
# Re-add cron job
(crontab -l 2>/dev/null; echo "5 9 * * * /Users/iamjohndass/Sites/pravos-remotion/auto-publish-cron.sh") | crontab -
```

### Update schedule

1. Edit `scripts/publishing-schedule.ts`
2. Test: `npm run youtube:auto-publish`
3. Cron will automatically use new schedule

---

## Files Reference

| File | Purpose |
|------|---------|
| `auto-publish-cron.sh` | Cron wrapper script |
| `scripts/auto-publish.ts` | Main automation logic |
| `scripts/publishing-schedule.ts` | Publishing calendar |
| `scripts/send-notification.ts` | Email notifications |
| `published-tracking.json` | Published content tracker |
| `logs/auto-publish-*.log` | Daily activity logs |
| `.env` | API keys and config |

---

## Quick Reference

```bash
# Test everything
npm run notify:test                    # Test notifications
npm run youtube:auto-publish           # Test auto-publish

# Install cron
(crontab -l 2>/dev/null; echo "5 9 * * * /Users/iamjohndass/Sites/pravos-remotion/auto-publish-cron.sh") | crontab -

# View cron
crontab -l

# Check logs
ls -lt logs/
tail -f logs/auto-publish-$(date +%Y-%m-%d).log

# Manual publish
npm run youtube:publish -- --album="cognitive-bloom"
npm run youtube:publish:short -- --album="cognitive-bloom"

# Track progress
cat published-tracking.json | jq
```

---

## Next Steps

1. ✅ Test notifications: `npm run notify:test`
2. ✅ Test auto-publish: `npm run youtube:auto-publish`
3. ✅ Install cron job (see Installation section above)
4. 📧 Wait for first automated publish on **Monday, Jan 13 at 9:05 AM**
5. 📊 Monitor logs and email notifications
6. 🎉 Enjoy automated publishing!

---

**Built with:** TypeScript, YouTube Data API v3, Resend, Cron
**Maintained by:** John Ellison
**Support:** Check logs in `logs/` directory
