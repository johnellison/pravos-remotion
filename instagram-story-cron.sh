#!/bin/bash

# Pravos Instagram Story Publisher Cron Job
# Runs every 3 days to publish Instagram stories for focus music tracks

# Set up environment
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export NODE_ENV="production"

# Project directory
PRAVOS_DIR="/Users/iamjohndass/Sites/pravos-remotion"
LOG_DIR="$PRAVOS_DIR/logs"
LOG_FILE="$LOG_DIR/instagram-story-$(date +%Y-%m-%d).log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Log start
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$LOG_FILE"
echo "📱 Pravos Instagram Story Publisher" >> "$LOG_FILE"
echo "📅 $(date)" >> "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Change to project directory
cd "$PRAVOS_DIR" || exit 1

# Run the Instagram story publisher
npm run instagram:publish:story >> "$LOG_FILE" 2>&1

EXIT_CODE=$?

# Log completion
echo "" >> "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$LOG_FILE"
echo "✅ Completed at $(date)" >> "$LOG_FILE"
echo "Exit code: $EXIT_CODE" >> "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Keep last 90 days of logs (since it runs every 3 days)
find "$LOG_DIR" -name "instagram-story-*.log" -mtime +90 -delete

exit $EXIT_CODE
