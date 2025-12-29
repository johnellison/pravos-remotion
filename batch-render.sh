#!/bin/bash

ALBUMS=(
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
echo "🎬 BATCH RENDERING ${TOTAL} ALBUMS"
echo "=================================================="
echo ""

for album in "${ALBUMS[@]}"; do
  CURRENT=$((CURRENT + 1))
  echo ""
  echo "▶️  [${CURRENT}/${TOTAL}] Rendering: ${album}"
  echo "=================================================="
  
  npm run render -- --album="${album}"
  
  if [ $? -eq 0 ]; then
    echo "✅ Success: ${album}"
  else
    echo "❌ Failed: ${album}"
  fi
  
  echo ""
done

echo ""
echo "=================================================="
echo "✅ BATCH RENDER COMPLETE"
echo "=================================================="
echo ""
echo "📂 Videos saved to: ./out/"
ls -lh ./out/*.mp4
