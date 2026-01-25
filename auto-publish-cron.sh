#!/bin/bash

# Pravos Auto-Publisher Cron Job
# Runs daily to check for scheduled content and publish to YouTube

# Set up environment
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export NODE_ENV="production"

# Project directory
PRAVOS_DIR="/Users/iamjohndass/Sites/pravos-remotion"
LOG_DIR="$PRAVOS_DIR/logs"
LOG_FILE="$LOG_DIR/auto-publish-$(date +%Y-%m-%d).log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Log start
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$LOG_FILE"
echo "🤖 Pravos Auto-Publisher" >> "$LOG_FILE"
echo "📅 $(date)" >> "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Change to project directory
cd "$PRAVOS_DIR" || exit 1

# Run the auto-publish script
npm run youtube:auto-publish >> "$LOG_FILE" 2>&1

EXIT_CODE=$?

# Log completion
echo "" >> "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$LOG_FILE"
echo "✅ Completed at $(date)" >> "$LOG_FILE"
echo "Exit code: $EXIT_CODE" >> "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Keep last 30 days of logs
find "$LOG_DIR" -name "auto-publish-*.log" -mtime +30 -delete

exit $EXIT_CODE
