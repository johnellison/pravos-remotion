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

DURATION=50
TOTAL=${#ALBUMS[@]}
CURRENT=0

echo "=================================================="
echo "✂️  EXTRACTING 50-SECOND SHORTS WITH CTA"
echo "=================================================="
echo ""

for album in "${ALBUMS[@]}"; do
  CURRENT=$((CURRENT + 1))
  INPUT="out/${album}-short.mp4"
  OUTPUT="out/${album}-short-60s.mp4"
  
  echo ""
  echo "▶️  [${CURRENT}/${TOTAL}] Processing: ${album}"
  echo "=================================================="
  
  if [ ! -f "$INPUT" ]; then
    echo "❌ Source file not found: $INPUT"
    continue
  fi
  
  ffmpeg -i "$INPUT" \
    -ss 0 -t $DURATION \
    -vf "drawtext=text='Full 25-min album at pravos.xyz':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h-150:box=1:boxcolor=black@0.5:boxborderw=10:enable='gte(t,45)'" \
    -c:v libx264 -preset fast -crf 23 \
    -c:a copy \
    -y "$OUTPUT" 2>&1 | grep -E "(frame=|error|Error)" || true
  
  if [ $? -eq 0 ]; then
    SIZE=$(ls -lh "$OUTPUT" | awk '{print $5}')
    echo "✅ Success: $OUTPUT ($SIZE)"
  else
    echo "❌ Failed: ${album}"
  fi
  
  echo ""
done

echo ""
echo "=================================================="
echo "✅ EXTRACTION COMPLETE"
echo "=================================================="
echo ""
echo "📂 Shorts saved to: ./out/"
ls -lh ./out/*-short-60s.mp4
