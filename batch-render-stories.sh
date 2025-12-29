#!/bin/bash

albums=(
  "cognitive-bloom"
  "neural-drift"
  "deep-piano-focus"
  "meditative-ambient"
  "scripted-light"
  "soulful-lounge"
  "sufi-lofi"
  "vibe-coding"
  "relaxed-neo-classical"
  "healing-handpan"
)

echo "=================================================="
echo "📱 BATCH RENDERING 10 STORIES (18s each)"
echo "=================================================="
echo ""

total=${#albums[@]}
current=0

for album in "${albums[@]}"; do
  current=$((current + 1))
  echo ""
  echo "▶️  [$current/$total] Rendering STORY: $album"
  echo "=================================================="
  echo ""
  npm run render:story -- --album="$album"
  
  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success: $album"
  else
    echo ""
    echo "❌ Failed: $album"
    exit 1
  fi
done

echo ""
echo "=================================================="
echo "🎉 ALL 10 STORIES RENDERED SUCCESSFULLY!"
echo "=================================================="
echo ""
echo "📁 Files location: ./out/*-story.mp4"
ls -lh ./out/*-story.mp4
