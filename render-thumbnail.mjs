#!/usr/bin/env node

import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const albumArg = args.find(arg => arg.startsWith('--album='));

if (!albumArg) {
  console.error('Usage: node render-thumbnail.mjs --album="cognitive-bloom"');
  process.exit(1);
}

const albumSlug = albumArg.split('=')[1].replace(/['"]/g, '');
const artFileName = albumSlug.replace(/-/g, '_') + '.webp';
const albumName = albumSlug
  .split('-')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

console.log(`\n🖼️  Rendering thumbnail for: ${albumName}\n`);

const albumArtSrc = `/assets/albums/${artFileName}`;
const outputPath = path.join(__dirname, 'out', `${albumSlug}-thumbnail.png`);

console.log('📂 Album art:', albumArtSrc);
console.log('📂 Output:', outputPath);

console.log('\n📦 Bundling...');
const bundleLocation = await bundle({
  entryPoint: path.join(__dirname, 'src/index.tsx'),
  webpackOverride: (config) => config,
  publicDir: path.join(__dirname, 'public'),
});

const inputProps = {
  albumName,
  albumArtSrc,
  duration: '25 MIN',
};

console.log('🎯 Selecting composition...');
const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: 'Thumbnail',
  inputProps,
});

console.log('🖼️  Rendering thumbnail...');
await renderStill({
  serveUrl: bundleLocation,
  composition,
  output: outputPath,
  inputProps,
});

console.log(`\n✅ Thumbnail saved: ${outputPath}\n`);
