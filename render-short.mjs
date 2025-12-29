#!/usr/bin/env node

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const albumArg = args.find(arg => arg.startsWith('--album='));

if (!albumArg) {
  console.error('Usage: npm run render:short -- --album="cognitive-bloom"');
  process.exit(1);
}

const albumSlug = albumArg.split('=')[1].replace(/['"]/g, '');

const audioFileName = albumSlug.replace(/-/g, ' ') + '-full-album.mp3';
const artFileName = albumSlug.replace(/-/g, '_') + '.webp';
const albumName = albumSlug
  .split('-')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

console.log(`\n📱 Rendering Pravos SHORT (9:16) for: ${albumName}\n`);

const audioSrc = `/albums/${audioFileName}`;
const albumArtSrc = `/assets/albums/${artFileName}`;
const outputPath = path.join(__dirname, 'out', `${albumSlug}-short.mp4`);

console.log('📂 Audio source:', audioSrc);
console.log('📂 Album art:', albumArtSrc);
console.log('📂 Output:', outputPath);

console.log('\n📦 Bundling Remotion project...');
const bundleLocation = await bundle({
  entryPoint: path.join(__dirname, 'src/index.tsx'),
  webpackOverride: (config) => config,
  publicDir: path.join(__dirname, 'public'),
});

console.log('🎯 Selecting composition...');
const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: 'BreathingBloomShort',
  inputProps: {
    albumName,
    albumSlug,
    audioSrc,
    albumArtSrc,
  },
});

console.log('🎥 Rendering vertical short... (this may take a while)');
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

console.log(`\n✅ Short rendered: ${outputPath}\n`);
