#!/bin/bash

# Install Pravos Instagram Story Publisher Cron Job

echo "🤖 Pravos Instagram Story Publisher - Cron Installation"
echo ""
echo "This will install a cron job that runs every 3 days at 9:05 AM PST"
echo "to automatically publish Instagram stories for your focus music tracks."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "instagram-story-cron.sh"; then
  echo "⚠️  Instagram story cron job already installed!"
  echo ""
  echo "Current cron jobs:"
  crontab -l | grep -A1 "Instagram"
  echo ""
  read -p "Do you want to reinstall? (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Installation cancelled"
    exit 0
  fi

  # Remove existing cron job
  crontab -l | grep -v "instagram-story-cron.sh" | grep -v "Instagram Story Publisher" | crontab -
  echo "✅ Removed existing cron job"
fi

# Add new cron job (runs every 3 days: day 1, 4, 7, ... 31)
(crontab -l 2>/dev/null; echo "# Pravos Instagram Story Publisher - Runs every 3 days at 9:05 AM PST") | crontab -
(crontab -l 2>/dev/null; echo "5 9 1,4,7,10,13,16,19,22,25,28,31 * * /Users/iamjohndass/Sites/pravos-remotion/instagram-story-cron.sh") | crontab -

echo ""
echo "✅ Cron job installed successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Installed cron jobs:"
crontab -l | grep -A1 "Instagram"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Schedule: Every 3 days at 9:05 AM PST (days 1,4,7,10,13,16,19,22,25,28,31)"
echo ""
echo "Next steps:"
echo "1. Test Instagram story publishing: npm run instagram:publish:story"
echo "2. Verify Instagram account is connected at https://saraven.app/channels"
echo "3. Wait for automatic publishing on schedule"
echo ""
echo "📅 Next scheduled publish dates:"
echo "   - $(date -v+3d '+%B %d, %Y' if available, else date -d '+3 days' '+%B %d, %Y')"
echo ""
echo "📧 Logs will be saved to: logs/instagram-story-YYYY-MM-DD.log"
echo ""
echo "For more info, see: scripts/publish-instagram-story.ts"
echo ""
