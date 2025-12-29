#!/bin/bash

ALBUMS=(
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

TOTAL=${#ALBUMS[@]}
CURRENT=0

echo "=================================================="
echo "📱 BATCH RENDERING ${TOTAL} SHORTS (9:16)"
echo "=================================================="
echo ""

for album in "${ALBUMS[@]}"; do
  CURRENT=$((CURRENT + 1))
  echo ""
  echo "▶️  [${CURRENT}/${TOTAL}] Rendering SHORT: ${album}"
  echo "=================================================="
  
  npm run render:short -- --album="${album}"
  
  if [ $? -eq 0 ]; then
    echo "✅ Success: ${album}"
  else
    echo "❌ Failed: ${album}"
  fi
  
  echo ""
done

echo ""
echo "=================================================="
echo "✅ BATCH SHORT RENDER COMPLETE"
echo "=================================================="
echo ""
echo "📂 Shorts saved to: ./out/"
ls -lh ./out/*-short.mp4
