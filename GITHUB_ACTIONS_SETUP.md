# GitHub Actions Auto-Publisher - Setup Complete ✅

## What's Running

Your Pravos YouTube content is now **fully automated in the cloud** using GitHub Actions!

### How It Works

```
GitHub Actions (Cloud)
     ↓
Runs Daily at 9:05 AM PST
     ↓
Checks Publishing Schedule
     ↓
Publishes to YouTube (if scheduled)
     ↓
Sends Email Notification
     ↓
Commits Tracking File Back to Repo
```

**No computer needed** - runs 24/7 in GitHub's cloud infrastructure.

---

## Publishing Schedule

**Videos** (Mondays at 9:00 AM PST):
- Jan 13: Cognitive Bloom
- Jan 20: Deep Piano Focus
- Jan 27: Meditative Ambient
- Feb 3: Scripted Light
- Feb 10: Soulful Lounge
- Feb 17: Sufi Lofi
- Feb 24: Vibe Coding
- Mar 3: Relaxed Neo Classical
- Mar 10: Healing Handpan

**Shorts** (Tuesdays at 9:00 AM PST):
- Jan 14: Scripted Light
- Jan 21: Soulful Lounge
- Jan 28: Sufi Lofi
- Feb 4: Vibe Coding
- Feb 11: Relaxed Neo Classical
- Feb 18: Healing Handpan

---

## Workflow Details

**File:** `.github/workflows/auto-publish.yml`

**Triggers:**
- **Scheduled**: Daily at 9:05 AM PST (17:05 UTC)
- **Manual**: Run from GitHub Actions UI anytime

**What it does:**
1. Checks out repository code
2. Installs Node.js and dependencies
3. Creates environment files from secrets
4. Runs auto-publisher script
5. Sends email notification (if publishing)
6. Commits updated tracking file
7. Pushes changes back to repo

---

## Monitoring

### View Workflow Runs

**GitHub UI:**
https://github.com/johnellison/pravos-remotion/actions

**CLI:**
```bash
# List recent runs
gh run list --workflow="Pravos Auto-Publisher"

# View latest run
gh run view

# View specific run logs
gh run view <run-id> --log
```

### Check Next Scheduled Run

The workflow runs **daily at 9:05 AM PST**. GitHub shows next scheduled run in the Actions tab.

---

## Manual Testing

### Trigger Workflow Manually

**GitHub UI:**
1. Go to https://github.com/johnellison/pravos-remotion/actions
2. Click "Pravos Auto-Publisher"
3. Click "Run workflow"
4. Select branch (master)
5. Click "Run workflow"

**CLI:**
```bash
gh workflow run "Pravos Auto-Publisher"

# Watch the run
gh run list --workflow="Pravos Auto-Publisher" --limit 1
```

---

## Configuration

### GitHub Secrets

These are stored securely in your repository settings:

| Secret | Purpose |
|--------|---------|
| `YOUTUBE_CLIENT_ID` | YouTube OAuth client ID |
| `YOUTUBE_CLIENT_SECRET` | YouTube OAuth secret |
| `YOUTUBE_REDIRECT_URI` | OAuth redirect URL |
| `YOUTUBE_TOKENS` | Refresh token for YouTube API |
| `RESEND_API_KEY` | Email notification API key |
| `NOTIFICATION_EMAIL` | Where to send notifications |

**View/Edit Secrets:**
- https://github.com/johnellison/pravos-remotion/settings/secrets/actions
- Or via CLI: `gh secret list`

### Update a Secret

```bash
# Update email address
gh secret set NOTIFICATION_EMAIL --body "newemail@pravos.xyz"

# Update Resend API key
gh secret set RESEND_API_KEY --body "re_new_key"

# Update YouTube tokens (after re-auth)
gh secret set YOUTUBE_TOKENS < .youtube-tokens.json
```

---

## Email Notifications

You'll receive emails at `john@pravos.xyz` for:

**Success:**
```
✅ Published: Cognitive Bloom - 25 Min Deep Focus Music

Successfully published video to YouTube

Details:
  Type: video
  Slug: cognitive-bloom
  Video ID: abc123xyz
  URL: https://youtube.com/watch?v=abc123xyz
  Published: Jan 13, 2026 9:05 AM PST
```

**Failure:**
```
❌ Failed to publish video: cognitive-bloom

Error publishing to YouTube: [error details]

Check logs: https://github.com/[...]/actions/runs/[run-id]
```

---

## Tracking

### Published Content

The workflow automatically updates `published-tracking.json` after each publish.

**View locally:**
```bash
cat published-tracking.json | jq
```

**View on GitHub:**
https://github.com/johnellison/pravos-remotion/blob/master/published-tracking.json

### Workflow automatically commits this file back to the repo after publishing.

---

## Troubleshooting

### Workflow Failed

1. **Check the run logs:**
   ```bash
   gh run list --workflow="Pravos Auto-Publisher" --limit 5
   gh run view <run-id> --log-failed
   ```

2. **Common issues:**
   - **YouTube API quota exceeded**: Wait 24 hours or request quota increase
   - **Token expired**: Re-run `npm run youtube:auth` locally and update secret
   - **Network timeout**: Usually transient, will retry next day

### Re-authorize YouTube

If YouTube tokens expire:

```bash
# Local machine
cd /Users/iamjohndass/Sites/pravos-remotion
npm run youtube:auth

# Update GitHub secret
gh secret set YOUTUBE_TOKENS < .youtube-tokens.json
```

### Test Publishing Locally

```bash
# Dry run - checks schedule
npm run youtube:auto-publish

# Test manual publish (doesn't use schedule)
npm run youtube:publish -- --album="cognitive-bloom"
```

---

## Disable/Enable Automation

### Temporarily Disable

**GitHub UI:**
1. Go to https://github.com/johnellison/pravos-remotion/actions
2. Click "Pravos Auto-Publisher"
3. Click "..." menu
4. Select "Disable workflow"

**CLI:**
```bash
gh workflow disable "Pravos Auto-Publisher"
```

### Re-enable

```bash
gh workflow enable "Pravos Auto-Publisher"
```

### Permanently Remove

Delete the workflow file:
```bash
git rm .github/workflows/auto-publish.yml
git commit -m "chore: remove auto-publisher workflow"
git push
```

---

## Costs

**GitHub Actions:**
- ✅ **FREE** for public repositories (unlimited minutes)
- ✅ **FREE** for private repositories (2,000 minutes/month included)
- Each workflow run uses ~1 minute
- Daily runs = ~30 minutes/month

**No additional costs** - completely free for this use case!

---

## Files Reference

| File | Purpose |
|------|---------|
| `.github/workflows/auto-publish.yml` | GitHub Actions workflow definition |
| `scripts/auto-publish.ts` | Main automation logic |
| `scripts/publishing-schedule.ts` | Publishing calendar |
| `scripts/send-notification.ts` | Email notifications |
| `published-tracking.json` | Published content tracker |

---

## Comparison: Local Cron vs GitHub Actions

| Feature | Local Cron | GitHub Actions |
|---------|------------|----------------|
| Computer must be on | ✅ Required | ❌ Not needed |
| Runs in cloud | ❌ No | ✅ Yes |
| Cost | Free | Free |
| Setup | 5 min | 5 min |
| Reliability | Depends on computer | High (99.9% uptime) |
| Monitoring | Local logs | GitHub UI + logs |
| Email notifications | ✅ Yes | ✅ Yes |

---

## Next Steps

✅ **You're all set!**

1. **Wait for first automated publish**: Monday, Jan 13, 2026 at 9:05 AM PST
2. **Check your email** for notification
3. **View on GitHub**: https://github.com/johnellison/pravos-remotion/actions
4. **Monitor YouTube Studio**: https://studio.youtube.com

The automation will:
- Run daily at 9:05 AM PST
- Check if content is scheduled for that day
- Publish to YouTube if scheduled
- Send you an email notification
- Update tracking file
- Repeat weekly until all content is published

**No manual work needed!** 🎉

---

## Quick Reference

```bash
# View workflow runs
gh run list --workflow="Pravos Auto-Publisher"

# Trigger manual run
gh workflow run "Pravos Auto-Publisher"

# View secrets
gh secret list

# Update secret
gh secret set SECRET_NAME --body "value"

# Check published content
cat published-tracking.json | jq

# Test locally
npm run youtube:auto-publish
```

---

## Support

- **Logs**: https://github.com/johnellison/pravos-remotion/actions
- **Tracking**: `published-tracking.json` in repo
- **Email**: Notifications sent to `john@pravos.xyz`
- **Schedule**: `scripts/publishing-schedule.ts`

---

**Built with:** GitHub Actions, TypeScript, YouTube Data API v3, Resend
**Running on:** GitHub's cloud infrastructure
**Cost:** $0.00 (free tier)
