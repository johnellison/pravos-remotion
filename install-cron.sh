#!/bin/bash

# Install Pravos Auto-Publisher Cron Job

echo "🤖 Pravos Auto-Publisher - Cron Installation"
echo ""
echo "This will install a cron job that runs daily at 9:05 AM PST"
echo "to automatically publish scheduled YouTube content."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "auto-publish-cron.sh"; then
  echo "⚠️  Cron job already installed!"
  echo ""
  echo "Current cron jobs:"
  crontab -l | grep -A1 "Pravos"
  echo ""
  read -p "Do you want to reinstall? (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Installation cancelled"
    exit 0
  fi

  # Remove existing cron job
  crontab -l | grep -v "auto-publish-cron.sh" | grep -v "Pravos Auto-Publisher" | crontab -
  echo "✅ Removed existing cron job"
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "# Pravos Auto-Publisher - Runs daily at 9:05 AM PST") | crontab -
(crontab -l 2>/dev/null; echo "5 9 * * * /Users/iamjohndass/Sites/pravos-remotion/auto-publish-cron.sh") | crontab -

echo ""
echo "✅ Cron job installed successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Installed cron jobs:"
crontab -l
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Test notifications: npm run notify:test"
echo "2. Test auto-publish: npm run youtube:auto-publish"
echo "3. Wait for automatic publishing on schedule"
echo ""
echo "📅 Next scheduled publish: Monday, Jan 13, 2026 at 9:05 AM PST"
echo "📧 Notifications will be sent to: john@pravos.xyz"
echo "📄 Logs will be saved to: logs/auto-publish-YYYY-MM-DD.log"
echo ""
echo "For more info, see: CRON_SETUP.md"
echo ""
