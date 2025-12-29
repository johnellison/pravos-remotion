#!/usr/bin/env node

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse CLI args
const args = process.argv.slice(2);
const albumArg = args.find(arg => arg.startsWith('--album='));

if (!albumArg) {
  console.error('Usage: npm run render -- --album="cognitive-bloom"');
  process.exit(1);
}

const albumSlug = albumArg.split('=')[1].replace(/['"]/g, '');

// Convert slug to file names (handle different naming conventions)
// Album slug: "cognitive-bloom" 
// Audio file: "cognitive bloom-full-album.mp3" (space, not hyphen)
// Art file: "cognitive_bloom.webp" (underscore)
const audioFileName = albumSlug.replace(/-/g, ' ') + '-full-album.mp3';
const artFileName = albumSlug.replace(/-/g, '_') + '.webp';
const albumName = albumSlug
  .split('-')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

console.log(`\n🎬 Rendering Pravos video for: ${albumName}\n`);

// Paths - relative to public folder for staticFile
const audioSrc = `/albums/${audioFileName}`;
const albumArtSrc = `/assets/albums/${artFileName}`;
const outputPath = path.join(__dirname, 'out', `${albumSlug}-video.mp4`);

console.log('📂 Audio source:', audioSrc);
console.log('📂 Album art:', albumArtSrc);
console.log('📂 Output:', outputPath);

// Bundle the Remotion project
console.log('\n📦 Bundling Remotion project...');
const bundleLocation = await bundle({
  entryPoint: path.join(__dirname, 'src/index.tsx'),
  webpackOverride: (config) => config,
  publicDir: path.join(__dirname, 'public'),
});

console.log('🎯 Selecting composition...');
const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: 'BreathingBloom',
  inputProps: {
    albumName,
    albumSlug,
    audioSrc,
    albumArtSrc,
  },
});

console.log('🎥 Rendering video... (this may take a while)');
await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: 'h264',
  outputLocation: outputPath,
  inputProps: {
    albumName,
    albumSlug,
    audioSrc,
    albumArtSrc,
  },
});

console.log(`\n✅ Video rendered: ${outputPath}\n`);
